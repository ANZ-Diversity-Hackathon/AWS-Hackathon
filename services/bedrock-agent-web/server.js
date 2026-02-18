// server.js
import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import crypto from "crypto";

import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

import {
  BedrockAgentRuntimeClient,
  InvokeAgentCommand,
} from "@aws-sdk/client-bedrock-agent-runtime";

const app = express();
app.use(express.json({ limit: "2mb" }));

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ====== ENV ======
const AWS_REGION = process.env.AWS_REGION || "ap-southeast-2";
const AGENT_ID = process.env.BEDROCK_AGENT_ID;          // 必填
const AGENT_ALIAS_ID = process.env.BEDROCK_AGENT_ALIAS; // 必填
const UPLOAD_BUCKET = process.env.UPLOAD_BUCKET;        // 必填
const UPLOAD_PREFIX = process.env.UPLOAD_PREFIX || "chat_uploads/";

// ====== clients ======
const s3 = new S3Client({ region: AWS_REGION });
const br = new BedrockAgentRuntimeClient({ region: AWS_REGION });

// ====== serve static frontend ======
app.use("/", express.static(path.join(__dirname, "public")));

// ====== create presigned url ======
app.post("/api/presign", async (req, res) => {
  try {
    const { filename, contentType, userId } = req.body || {};
    if (!filename || !contentType) {
      return res.status(400).json({ ok: false, error: "filename/contentType required" });
    }
    const safeUser = (userId || "demo").replace(/[^a-zA-Z0-9_-]/g, "");
    const ext = path.extname(filename).toLowerCase() || "";
    const id = crypto.randomUUID ? crypto.randomUUID() : crypto.randomBytes(16).toString("hex");
    const key = `${UPLOAD_PREFIX}${safeUser}/${Date.now()}_${id}${ext}`;

    const cmd = new PutObjectCommand({
      Bucket: UPLOAD_BUCKET,
      Key: key,
      ContentType: contentType,
    });

    const uploadUrl = await getSignedUrl(s3, cmd, { expiresIn: 60 }); // 60s
    return res.json({ ok: true, bucket: UPLOAD_BUCKET, key, uploadUrl });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ ok: false, error: String(e) });
  }
});

// ====== chat -> invoke agent ======
// sessionId：前端传一个固定的，保持上下文
app.post("/api/chat", async (req, res) => {
  try {
    console.log("Incoming chat:", {
      hasBody: !!req.body,
      sessionId: req.body?.sessionId,
      messageLen: req.body?.message?.length,
    });
    console.log("Agent:", { AGENT_ID, AGENT_ALIAS_ID });

    const { message, sessionId } = req.body || {};
    if (!message) return res.status(400).json({ ok: false, error: "message required" });

    const cmd = new InvokeAgentCommand({
      agentId: AGENT_ID,
      agentAliasId: AGENT_ALIAS_ID,
      sessionId: sessionId || "demo-session",
      inputText: message,
    });

    const resp = await br.send(cmd);

    let text = "";
    if (resp.completion) {
      for await (const chunkEvent of resp.completion) {
        const chunk = chunkEvent.chunk;
        if (chunk?.bytes) text += Buffer.from(chunk.bytes).toString("utf-8");
      }
    }

    return res.json({ ok: true, text });
  } catch (e) {
    console.error("❌ /api/chat error:", e);
    return res.status(500).json({ ok: false, error: String(e) });
  }
});


// ====== start ======
const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Server running on http://0.0.0.0:${port}`));
