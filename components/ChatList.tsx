'use client';

import { ChatSession } from '@/types/chat';
import { Button } from './ui/button';
import { ScrollArea } from './ui/scroll-area';
import { Avatar } from './ui/avatar';
import { Separator } from './ui/separator';

type ChatListProps = {
  sessions: ChatSession[];
  activeSessionId: string;
  onSessionSelect: (sessionId: string) => void;
  onSessionCreate: () => void;
  onSessionDelete: (sessionId: string) => void;
};

export default function ChatList({ 
  sessions, 
  activeSessionId, 
  onSessionSelect, 
  onSessionCreate, 
  onSessionDelete 
}: ChatListProps) {
  return (
    <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900 mb-3">对话列表</h2>
        <Button 
          onClick={onSessionCreate}
          className="w-full bg-blue-600 hover:bg-blue-700"
        >
          新建对话
        </Button>
      </div>
      
      <ScrollArea className="flex-1 p-2"> 
        {sessions.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>暂无对话</p>
            <p className="text-sm mt-2">点击上方按钮创建新对话</p>
          </div>
        ) : (
          <div className="space-y-1">
            {sessions.map((session) => (
              <div key={session.id}>
                <div
                  className={`flex items-start gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                    activeSessionId === session.id
                      ? 'bg-blue-50 border border-blue-200'
                      : 'hover:bg-gray-50'
                  }`}
                  onClick={() => onSessionSelect(session.id)}
                >
                  <Avatar className="h-8 w-8 bg-blue-500 flex-shrink-0">
                    <span className="text-xs font-medium text-white">AI</span>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                      <h3 className={`text-sm font-medium truncate ${
                        activeSessionId === session.id
                          ? 'text-blue-600'
                          : 'text-gray-900'
                      }`}>
                        {session.title}
                      </h3>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSessionDelete(session.id);
                        }}
                        className="text-gray-400 hover:text-red-500 text-xs"
                      >
                        ✕
                      </button>
                    </div>
                    <p className="text-xs text-gray-500 mt-1 truncate">
                      {session.messages.length > 0
                        ? session.messages[session.messages.length - 1].content
                        : '无消息'}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(session.updatedAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </ScrollArea>
      
      <Separator />
      <div className="p-3 text-xs text-gray-500">
        AI助手 • 基于Next.js和Logto构建
      </div>
    </div>
  );
}
