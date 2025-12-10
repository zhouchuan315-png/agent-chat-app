'use client';

import { useState, useRef, useEffect } from 'react';
import { Streamdown } from 'streamdown';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar } from "@/components/ui/avatar";
import { Message } from '@/types/chat';

type ChatInterfaceProps = {
  messages: Message[];
  onSendMessage: (content: string) => void;
  isLoading: boolean;
  sessionTitle: string;
  onUpdateTitle: () => void;
};

export default function ChatInterface({ messages, onSendMessage, isLoading, sessionTitle, onUpdateTitle }: ChatInterfaceProps) {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    onSendMessage(input);
    setInput('');
  };

  const renderMessage = (message: Message) => {
    return (
      <div 
        key={message.id} 
        className={`flex items-start gap-3 mb-4 ${message.isUser ? 'justify-end' : 'justify-start'}`}
      >
        {!message.isUser && (
          <Avatar className="h-8 w-8 bg-blue-500 flex-shrink-0">
            <span className="text-xs font-medium text-white">AI</span>
          </Avatar>
        )}
        <div className={`max-w-[70%] rounded-lg p-4 ${message.isUser ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-900'}`}>
          <Streamdown>{message.content}</Streamdown>
          {message.loading && (
            <div className="flex items-center gap-1 mt-2 text-sm text-gray-500">
              <span className="inline-block w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
              <span className="inline-block w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
              <span className="inline-block w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
            </div>
          )}
        </div>
        {message.isUser && (
          <Avatar className="h-8 w-8 bg-green-500 flex-shrink-0">
            <span className="text-xs font-medium text-white">我</span>
          </Avatar>
        )}
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full">
      {/* 会话标题栏 */}
      <div className="p-4 border-b border-gray-200 bg-white">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">
            {sessionTitle}
          </h2>
          <Button
            onClick={onUpdateTitle}
            variant="ghost"
            size="sm"
            className="text-gray-600 hover:text-blue-600"
          >
            编辑标题
          </Button>
        </div>
      </div>
      
      <ScrollArea className="flex-1 p-6">
        <div className="space-y-6">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full py-12 text-center">
              <div className="bg-blue-100 p-3 rounded-full mb-4">
                <svg className="w-12 h-12 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                欢迎使用AI助手聊天
              </h3>
              <p className="text-gray-600 max-w-md">
                开始与我们的AI助手对话。提出问题，获取帮助，或者只是聊天。
              </p>
            </div>
          ) : (
            messages.map(renderMessage)
          )}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>
      <form 
        onSubmit={handleSend} 
        className="p-6 border-t border-gray-200 bg-white"
      >
        <div className="flex gap-3">
          <Input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="输入您的消息..."
            disabled={isLoading}
            className="flex-1"
          />
          <Button
            type="submit"
            disabled={isLoading}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {isLoading ? (
              <>
                <svg className="w-4 h-4 mr-2 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                发送中...
              </>
            ) : (
              '发送'
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
