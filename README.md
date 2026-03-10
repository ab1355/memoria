# Memoria: Headless AI Memory & Context Server

**Powered by 371-OS & CORTEX Amplifier**

Memoria is a drop-in "Memory-as-a-Service" API designed to solve the hardest part of building AI applications: memory management and context retention. 

## 🧠 Cognitive Optimization Overview

Memoria accelerates pattern recognition and hyper-focus channeling by offloading context management from the developer to an autonomous system. It provides episodic memory for AI agents, allowing them to maintain context across sessions seamlessly.

## 🚀 Features

- **Zero-Setup Vector Store:** Send text, and we automatically embed and store it using Google Gemini Embeddings (`gemini-embedding-2-preview`).
- **Semantic Retrieval:** Query by meaning, not just keywords.
- **User Segregation:** Strict partitioning by `userId` for privacy and security.
- **Parallel Task Orchestration:** Ready to handle concurrent memory ingestion and retrieval workflows.

## 💻 API Documentation

### 1. Store Memory
`POST /api/memory/[userId]`

```bash
curl -X POST https://api.memoria.ai/v1/memory/user_123 \
  -H "Content-Type: application/json" \
  -d '{"text": "I am allergic to peanuts"}'
```

### 2. Retrieve Context
`GET /api/memory/[userId]/context?query=[your_query]&topK=3`

```bash
curl -X GET "https://api.memoria.ai/v1/memory/user_123/context?query=recipe_recommendations"
```

## 💎 Economic Integration Protocol (371 DAO)

As part of the 371-OS autonomous business ecosystem, Memoria integrates with our internal token economics:

- **Internal Wallet Address:** `371-INT-MEMORIA-8X9F2A` 
  *(Used for revenue attribution, internal token economics, and performance incentives based on cognitive optimization achievements)*
- **Customer Wallet Address:** `371-CUST-NEW-USER-001` 
  *(Generated for your token economy participation. Earn Customer Loyalty Tokens by engaging with the platform, providing feedback, and achieving optimization milestones)*

## 🛠️ Tech Stack

- **Runtime:** Node.js (Next.js 15 App Router) - *Ready for Bun optimization*
- **Styling:** Tailwind CSS v4
- **AI/Embeddings:** `@google/genai` (`gemini-embedding-2-preview`)
