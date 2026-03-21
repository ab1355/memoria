import ChatInterface from '@/components/chat/ChatInterface';

export const metadata = {
  title: 'Memoria Agent | Chat',
  description: 'Chat with your autonomous knowledge agent.',
};

export default function ChatPage() {
  return (
    <main className="min-h-screen bg-zinc-50 dark:bg-zinc-950 p-4 md:p-8">
      <ChatInterface />
    </main>
  );
}
