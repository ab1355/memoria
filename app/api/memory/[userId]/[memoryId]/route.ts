import { NextResponse } from 'next/server';
import { store } from '@/lib/store';
import { checkAuth } from '@/lib/auth';
import { checkRateLimit } from '@/lib/rate-limit';

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ userId: string; memoryId: string }> }
) {
  if (!checkAuth(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let userId: string;
  let memoryId: string;
  try {
    const resolvedParams = await params;
    userId = resolvedParams.userId;
    memoryId = resolvedParams.memoryId;
  } catch (error: any) {
    console.error("[DELETE /api/memory] Failed to resolve parameters:", error.stack || error);
    return NextResponse.json({ error: 'Invalid request parameters.' }, { status: 400 });
  }

  // Rate limiting: 100 requests per minute per user for DELETE
  const rateLimit = checkRateLimit(`delete_${userId}`, 100, 60000);
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
    await store.deleteMemory(userId, memoryId);
    return NextResponse.json({ success: true, message: "Memory deleted successfully" });
  } catch (error: any) {
    console.error(`[DELETE /api/memory/${userId}/${memoryId}] Error deleting memory:`, error.stack || error);
    return NextResponse.json({ error: 'Failed to delete memory from the database.' }, { status: 500 });
  }
}
