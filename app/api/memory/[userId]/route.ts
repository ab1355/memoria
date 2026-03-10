import { NextResponse } from 'next/server';
import { globalMemoryStore } from '@/lib/memory-store';
import { generateEmbedding } from '@/lib/gemini';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;
    const body = await request.json();
    const { text } = body;

    if (!text) {
      return NextResponse.json({ error: 'Text is required' }, { status: 400 });
    }

    // Generate embedding using Gemini
    const embedding = await generateEmbedding(text);

    // Store the memory
    const memory = {
      id: `mem_${Math.random().toString(36).substring(2, 11)}`,
      userId,
      text,
      embedding,
      createdAt: Date.now(),
    };

    globalMemoryStore.addMemory(memory);

    return NextResponse.json({ 
      success: true, 
      id: memory.id,
      message: "Memory stored successfully"
    });
  } catch (error: any) {
    console.error("Error storing memory:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;
    const memories = globalMemoryStore.getMemories(userId);
    
    return NextResponse.json({
      memories: memories.map(m => ({ id: m.id, text: m.text, createdAt: m.createdAt }))
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
