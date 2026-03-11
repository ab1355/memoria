import { NextResponse } from 'next/server';
import { store } from '@/lib/store';
import { generateEmbedding } from '@/lib/gemini';

function checkAuth(req: Request) {
  const apiKey = req.headers.get('authorization')?.split('Bearer ')[1];
  const expectedKey = process.env.MEMORIA_API_KEY;
  if (expectedKey && apiKey !== expectedKey) {
    return false;
  }
  return true;
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  if (!checkAuth(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

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

    await store.addMemory(memory);

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
  if (!checkAuth(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { userId } = await params;
    const memories = await store.getMemories(userId);
    
    return NextResponse.json({
      memories: memories.map((m: any) => ({ id: m.id, text: m.text, createdAt: m.createdAt }))
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
