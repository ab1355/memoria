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

export async function GET(
  request: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  if (!checkAuth(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

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
    const results = await store.search(userId, queryEmbedding, topK);

    return NextResponse.json({
      context: results.map((r: any) => r.text),
      results: results.map((r: any) => ({ 
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
