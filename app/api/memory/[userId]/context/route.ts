import { NextResponse } from 'next/server';
import { store } from '@/lib/store';
import { generateEmbedding } from '@/lib/gemini';
import { checkAuth } from '@/lib/auth';
import { checkRateLimit } from '@/lib/rate-limit';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  if (!checkAuth(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let userId: string;
  try {
    const resolvedParams = await params;
    userId = resolvedParams.userId;
  } catch (error: any) {
    console.error("[GET /api/memory/context] Failed to resolve parameters:", error.stack || error);
    return NextResponse.json({ error: 'Invalid request parameters.' }, { status: 400 });
  }

  // Rate limiting: 50 requests per minute per user for context search
  const rateLimit = checkRateLimit(`search_${userId}`, 50, 60000);
  if (!rateLimit.success) {
    return NextResponse.json(
      { error: 'Too many requests. Please try again later.' },
      { 
        status: 429,
        headers: {
          'X-RateLimit-Limit': rateLimit.limit.toString(),
          'X-RateLimit-Remaining': rateLimit.remaining.toString(),
          'X-RateLimit-Reset': rateLimit.reset.toString(),
        }
      }
    );
  }

  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('query');
    const topK = parseInt(searchParams.get('topK') || '3', 10);

    if (!query) {
      return NextResponse.json({ error: 'Query parameter is required' }, { status: 400 });
    }

    let queryEmbedding;
    try {
      // Generate embedding for the query
      queryEmbedding = await generateEmbedding(query);
    } catch (embeddingError: any) {
      console.error(`[GET /api/memory/${userId}/context] Failed to generate embedding for query:`, embeddingError.stack || embeddingError);
      return NextResponse.json({ error: 'Failed to generate embedding for the search query. Please check your AI provider configuration.' }, { status: 502 });
    }
    
    let results;
    try {
      // Search the memory store
      results = await store.search(userId, queryEmbedding, topK);
    } catch (storeError: any) {
      console.error(`[GET /api/memory/${userId}/context] Failed to search memory store:`, storeError.stack || storeError);
      return NextResponse.json({ error: 'Failed to query the database for context.' }, { status: 500 });
    }

    return NextResponse.json({
      context: results.map((r: any) => r.text),
      results: results.map((r: any) => ({ 
        id: r.id, 
        text: r.text, 
        score: r.score 
      }))
    });
  } catch (error: any) {
    console.error(`[GET /api/memory/${userId}/context] Unexpected error:`, error.stack || error);
    return NextResponse.json({ error: 'An unexpected internal server error occurred.' }, { status: 500 });
  }
}
