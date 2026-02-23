# Money Mind — Use Case Documentation

## 1) Overview
Money Mind is an AI Agent built around financial goals. It can understand a user’s saving/spending-control goals, automatically organise the user’s transaction records (receipt images, PDFs, or dialog input), and provide specific and actionable budgeting and saving suggestions based on the user’s real spending history.

It is not asking users to do more manual bookkeeping. Instead, it helps users turn “I want to save money” into “what should I do next”.

## 2) Problem & Motivation
Expense records are often lengthy, making it difficult for users to quickly understand their spending patterns. At the same time, frequent and fragmented spending behaviours make it hard to maintain long-term bookkeeping habits, creating a high barrier to effective financial management. Most existing budgeting applications rely on manual input and categorisation, focusing on record storage while lacking intelligent analytical capabilities.

Therefore, there is a strong need for a more automated and intelligent personal financial management system that can reduce bookkeeping effort and support more effective financial decision-making. Such a system could further integrate seamlessly with banking services, enabling a more comprehensive financial management ecosystem.

## 3) Target Users
- People with clear saving goals (concerts, travel, emergency funds, etc.)
- People who want to understand “where their money goes” and control spending

## 4) What the Solution Does
Money Mind turns messy inputs into clear actions using an Amazon Bedrock Agent.

Via Action Groups, the Agent invokes AWS Lambda tools; receipts are stored in Amazon S3, user transactions and state (dedup keys, budgets, preferences) are stored in Amazon DynamoDB, and an EC2-hosted web UI sends requests and displays responses.

**Key capabilities include:**
- **Receipt understanding:** extract key fields from receipt into structured JSON.
- **Duplicate handling:** detect and merge repeated transactions to keep records accurate.
- **Spending insights:** summarise spending by category/merchant/time period.
- **Budget & goal planning:** converts the user’s goal into actionable recommendations, such as weekly limits, categories to reduce, alternative options, and step-by-step saving plans.
- **Conversational Q&A + memory:** answer follow-ups and keep recommendations consistent using stored user context.

## 5) Innovation
Money Mind is not just a bookkeeping tool. It is a goal-driven financial Agent. It understands user intent (save money / build savings / control overspending) and breaks goals into actionable plans. It can turn the user’s goal into a concrete plan, and as the user continues uploading spending records, it keeps updating progress and adjusting recommendations.

Money Mind also supports both “uploading receipts” and “natural-language questions”, so users who do not want to manually track every expense can still use it with a low barrier.

## 6) Future extensions
With user consent, Money Mind could integrate with external services (e.g., calendars/email receipts) and bank transaction feeds (where available) to automate data capture and provide goal-based reminders.

## 7) Responsible use & security
Money Mind minimises data collection and masks sensitive fields (e.g., card numbers). No credentials are stored in the public repo; access follows least-privilege IAM and secrets are managed via environment variables/Secrets Manager.
