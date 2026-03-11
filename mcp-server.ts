import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CallToolRequestSchema, ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js";

// Ensure we hit the local Next.js API to utilize the Gemini embedding pipeline
const API_URL = process.env.APP_URL || "http://localhost:3000";
const API_KEY = process.env.MEMORIA_API_KEY || "";

const headers: Record<string, string> = {
  "Content-Type": "application/json",
};
if (API_KEY) {
  headers["Authorization"] = `Bearer ${API_KEY}`;
}

const server = new Server(
  {
    name: "memoria-mcp",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "store_memory",
        description: "Store a new memory or fact for a specific user. This automatically generates embeddings and saves it to the vector store.",
        inputSchema: {
          type: "object",
          properties: {
            userId: { type: "string", description: "The ID of the user (e.g., 'user_123')" },
            text: { type: "string", description: "The memory or fact to store" },
          },
          required: ["userId", "text"],
        },
      },
      {
        name: "retrieve_context",
        description: "Retrieve relevant memories and context for a user based on a query. Use this to inject past context into your current prompt.",
        inputSchema: {
          type: "object",
          properties: {
            userId: { type: "string", description: "The ID of the user" },
            query: { type: "string", description: "The search query to find relevant memories" },
            topK: { type: "number", description: "Number of results to return (default: 3)" }
          },
          required: ["userId", "query"],
        },
      },
      {
        name: "forget_memory",
        description: "Delete a specific memory by its ID for a user.",
        inputSchema: {
          type: "object",
          properties: {
            userId: { type: "string", description: "The ID of the user" },
            memoryId: { type: "string", description: "The ID of the memory to delete" }
          },
          required: ["userId", "memoryId"],
        },
      }
    ],
  };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  if (request.params.name === "store_memory") {
    const args = request.params.arguments as { userId: string; text: string };
    try {
      const res = await fetch(`${API_URL}/api/memory/${args.userId}`, {
        method: "POST",
        headers,
        body: JSON.stringify({ text: args.text }),
      });
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error || "Failed to store memory");
      
      return {
        content: [{ type: "text", text: `Memory stored successfully. ID: ${data.id}` }],
      };
    } catch (e: any) {
      return { content: [{ type: "text", text: `Error: ${e.message}` }], isError: true };
    }
  }

  if (request.params.name === "retrieve_context") {
    const args = request.params.arguments as { userId: string; query: string; topK?: number };
    try {
      const topK = args.topK || 3;
      const res = await fetch(`${API_URL}/api/memory/${args.userId}/context?query=${encodeURIComponent(args.query)}&topK=${topK}`, {
        headers
      });
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error || "Failed to retrieve context");
      
      return {
        content: [{ type: "text", text: JSON.stringify(data.context, null, 2) }],
      };
    } catch (e: any) {
      return { content: [{ type: "text", text: `Error: ${e.message}` }], isError: true };
    }
  }

  if (request.params.name === "forget_memory") {
    const args = request.params.arguments as { userId: string; memoryId: string };
    try {
      const res = await fetch(`${API_URL}/api/memory/${args.userId}/${args.memoryId}`, {
        method: "DELETE",
        headers
      });
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error || "Failed to delete memory");
      
      return {
        content: [{ type: "text", text: `Memory deleted successfully.` }],
      };
    } catch (e: any) {
      return { content: [{ type: "text", text: `Error: ${e.message}` }], isError: true };
    }
  }

  throw new Error("Tool not found");
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Memoria MCP Server running on stdio");
}

main().catch(console.error);
