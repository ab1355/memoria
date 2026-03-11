import { NextResponse } from 'next/server';
import { store } from '@/lib/store';

function checkAuth(req: Request) {
  const apiKey = req.headers.get('authorization')?.split('Bearer ')[1];
  const expectedKey = process.env.MEMORIA_API_KEY;
  if (expectedKey && apiKey !== expectedKey) {
    return false;
  }
  return true;
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ userId: string; memoryId: string }> }
) {
  if (!checkAuth(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { userId, memoryId } = await params;
    
    await store.deleteMemory(userId, memoryId);

    return NextResponse.json({ success: true, message: "Memory deleted successfully" });
  } catch (error: any) {
    console.error("Error deleting memory:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
