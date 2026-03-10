import { NextResponse } from 'next/server';
import { globalMemoryStore } from '@/lib/memory-store';
import { generateEmbedding } from '@/lib/gemini';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('query');
    const topK = parseInt(searchParams.get('topK') || '3', 10);

    if (!query) {
      return NextResponse.json({ error: 'Query parameter is required' }, { status: 400 });
    }

    // Generate embedding for the query
    const queryEmbedding = await generateEmbedding(query);
    
    // Search the memory store
    const results = globalMemoryStore.search(userId, queryEmbedding, topK);

    return NextResponse.json({
      context: results.map(r => r.text),
      results: results.map(r => ({ 
        id: r.id, 
        text: r.text, 
        score: r.score 
      }))
    });
  } catch (error: any) {
    console.error("Error retrieving context:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
