import { redirect } from "next/navigation";
import { Avatar } from "@/components/ui/avatar";
import { getLogtoContext } from '@logto/next/server-actions';
import { logtoConfig } from '../logto';
import ChatContainer from '@/components/ChatContainer';
import SignOutButton from '@/components/SignOutButton';

export default async function ChatPage() {
  // 获取认证状态
  const { isAuthenticated, claims } = await getLogtoContext(logtoConfig);
  
  if (!isAuthenticated) {
    redirect("/auth/login");
  }
  
  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-blue-600 p-2 rounded-lg">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-gray-900">AI助手聊天</h1>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
              <Avatar className="h-8 w-8 bg-blue-500">
                <span className="text-xs font-medium text-white">
                  {claims?.sub?.charAt(0).toUpperCase()}
                </span>
              </Avatar>
              <span className="text-sm font-medium text-gray-900">
                {claims?.sub}
              </span>
            </div>
            <SignOutButton />
            </div>
          </div>
        </div>
      </header>
      <main className="flex-1 overflow-hidden">
        <ChatContainer />
      </main>
    </div>
  );
}
