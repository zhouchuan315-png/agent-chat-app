'use client';

import { useState, useEffect } from "react";
import ChatInterface from "./ChatInterface";
import ChatList from "./ChatList";
import { Card } from "./ui/card";
import { ChatSession, Message } from '@/types/chat';
import { db } from '@/lib/db';

export default function ChatContainer() {
  // 会话管理状态
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  
  // 初始化会话
  useEffect(() => {
    const loadSessions = async () => {
      try {
        // 从Dexie数据库加载会话
        const savedSessions = await db.chatSessions.toArray();
        // 确保会话按更新时间排序
        const sortedSessions = [...savedSessions].sort((a, b) => {
          return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
        });
        
        // 为每个会话加载对应的消息
        const sessionsWithMessages = await Promise.all(
          sortedSessions.map(async (session) => {
            const messages = await db.messages.where('sessionId').equals(session.id).toArray();
            return {
              ...session,
              messages
            };
          })
        );
        
        setSessions(sessionsWithMessages);
        if (sessionsWithMessages.length > 0) {
          setActiveSessionId(sessionsWithMessages[0].id);
        } else {
          // 创建默认会话
          const defaultSession: ChatSession = {
            id: Date.now().toString(),
            title: '新对话',
            messages: [],
            createdAt: new Date(),
            updatedAt: new Date(),
          };
          // 保存到数据库
          await db.chatSessions.add(defaultSession);
          setSessions([defaultSession]);
          setActiveSessionId(defaultSession.id);
        }
      } catch (error) {
        console.error('Failed to load sessions:', error);
      }
    };
    
    loadSessions();
  }, []);
  

  
  // 获取当前活动会话
  const activeSession = sessions.find(session => session.id === activeSessionId) || sessions[0];
  
  // 创建新会话
  const handleSessionCreate = async () => {
    const newSession: ChatSession = {
      id: Date.now().toString(),
      title: '新对话',
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    // 保存到数据库
    await db.chatSessions.add(newSession);
    
    setSessions(prev => {
      const updated = [newSession, ...prev];
      // 按更新时间排序，最新的在前面
      return updated.sort((a, b) => {
        return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      });
    });
    setActiveSessionId(newSession.id);
  };
  
  // 选择会话
  const handleSessionSelect = (sessionId: string) => {
    setActiveSessionId(sessionId);
  };
  
  // 删除会话
  const handleSessionDelete = async (sessionId: string) => {
    try {
      // 从数据库中删除会话和相关消息
      await db.transaction('rw', db.chatSessions, db.messages, async () => {
        await db.chatSessions.delete(sessionId);
        await db.messages.where('sessionId').equals(sessionId).delete();
      });
      
      setSessions(prev => {
        const remainingSessions = prev.filter(session => session.id !== sessionId);
        if (activeSessionId === sessionId) {
          if (remainingSessions.length > 0) {
            setActiveSessionId(remainingSessions[0].id);
          } else {
            handleSessionCreate();
          }
        }
        return remainingSessions;
      });
    } catch (error) {
      console.error('Failed to delete session:', error);
    }
  };
  
  // 更新会话标题
  const handleUpdateSessionTitle = async (sessionId: string, newTitle: string) => {
    try {
      // 更新数据库中的会话
      await db.chatSessions.update(sessionId, {
        title: newTitle,
        updatedAt: new Date(),
      });
      
      setSessions(prev => {
        const updated = prev.map(session => {
          if (session.id === sessionId) {
            return {
              ...session,
              title: newTitle,
              updatedAt: new Date(),
            };
          }
          return session;
        });
        // 按更新时间排序，最新的在前面
        return updated.sort((a, b) => {
          return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
        });
      });
    } catch (error) {
      console.error('Failed to update session title:', error);
    }
  };
  
  // 发送消息
  const handleSendMessage = async (content: string) => {
    setIsLoading(true);
    
    // 确保有一个有效的活动会话
    let sessionIdToUse = activeSessionId;
    let sessionToUse = sessions.find(s => s.id === sessionIdToUse);
    
    if (!sessionIdToUse || !sessionToUse) {
      // 创建一个新会话
      const newSession: ChatSession = {
        id: Date.now().toString(),
        title: content.substring(0, 20) + '...',
        messages: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      // 保存到数据库
      await db.chatSessions.add(newSession);
      
      setSessions(prev => {
        const updated = [newSession, ...prev];
        return updated.sort((a, b) => {
          return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
        });
      });
      
      sessionIdToUse = newSession.id;
      sessionToUse = newSession;
      setActiveSessionId(sessionIdToUse);
    }
    
    // 创建用户消息
    const userMessage: Message = {
      id: Date.now().toString(),
      sessionId: sessionIdToUse,
      content,
      isUser: true,
      timestamp: new Date(),
    };
    
    // 保存用户消息到数据库
    await db.messages.add(userMessage);
    
    // 获取当前会话的消息并添加新的用户消息
    const updatedMessages = [...(sessionToUse?.messages || []), userMessage];
    
    // 创建一个临时的AI消息，用于实时更新
    const aiMessageId = (Date.now() + 1).toString();
    const aiMessage: Message = {
      id: aiMessageId,
      sessionId: sessionIdToUse,
      content: '',
      isUser: false,
      timestamp: new Date(),
      loading: true,
    };
    
    // 保存AI消息到数据库
    await db.messages.add(aiMessage);
    
    // 更新会话，同时添加用户消息和临时AI消息
    const messagesWithAi = [...updatedMessages, aiMessage];
    
    // 更新会话
    await db.chatSessions.update(sessionIdToUse, {
      title: sessionToUse!.messages.length === 0 ? content.substring(0, 20) + '...' : sessionToUse!.title,
      updatedAt: new Date(),
    });
    
    setSessions(prev => {
      const updated = prev.map(session => {
        if (session.id === sessionIdToUse) {
          // 更新会话标题（如果是第一条消息）
          const newTitle = session.messages.length === 0 ? content.substring(0, 20) + '...' : session.title;
          
          return {
            ...session,
            title: newTitle,
            messages: messagesWithAi,
            updatedAt: new Date(),
          };
        }
        return session;
      });
      // 按更新时间排序，最新的在前面
      return updated.sort((a, b) => {
        return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      });
    });
    
    try {
      // 调用AI API获取响应，发送完整对话历史（包含刚刚添加的用户消息）
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          messages: updatedMessages 
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to get response');
      }
      
      // 确保响应是流式的
      if (!response.body) {
        throw new Error('Response body is null');
      }
      
      // 获取响应体的Reader
      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');
      
      // 流式读取响应
      let accumulatedContent = '';
      while (true) {
        const { done, value } = await reader.read();
        
        if (done) {
          break;
        }
        
        // 解码并累积内容
        const chunk = decoder.decode(value, { stream: true });
        accumulatedContent += chunk;
        
        // 更新数据库中的AI消息内容
        await db.messages.update(aiMessageId, {
          content: accumulatedContent,
        });
        
        // 更新会话中的AI消息内容
        setSessions(prev => {
          const updated = prev.map(session => {
            if (session.id === sessionIdToUse) {
              return {
                ...session,
                messages: session.messages.map(msg => {
                  if (msg.id === aiMessageId) {
                    return {
                      ...msg,
                      content: accumulatedContent,
                    };
                  }
                  return msg;
                }),
                updatedAt: new Date(),
              };
            }
            return session;
          });
          // 按更新时间排序，最新的在前面
          return updated.sort((a, b) => {
            return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
          });
        });
      }
      
      // 流式响应结束，将loading设置为false
      await db.messages.update(aiMessageId, {
        loading: false,
      });
      
      setSessions(prev => {
        const updated = prev.map(session => {
          if (session.id === sessionIdToUse) {
            return {
              ...session,
              messages: session.messages.map(msg => {
                if (msg.id === aiMessageId) {
                  return {
                    ...msg,
                    loading: false,
                  };
                }
                return msg;
              }),
              updatedAt: new Date(),
            };
          }
          return session;
        });
        // 按更新时间排序，最新的在前面
        return updated.sort((a, b) => {
          return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
        });
      });
    } catch (error) {
      console.error('Error:', error);
      
      // 创建错误消息
      const errorMessage: Message = {
        id: (Date.now() + 2).toString(),
        sessionId: sessionIdToUse,
        content: '抱歉，出现了问题。请重试。',
        isUser: false,
        timestamp: new Date(),
      };
      
      // 保存错误消息到数据库
      await db.messages.add(errorMessage);
      
      // 更新会话
      setSessions(prev => {
        const updated = prev.map(session => {
          if (session.id === sessionIdToUse) {
            return {
              ...session,
              messages: [...session.messages, errorMessage],
              updatedAt: new Date(),
            };
          }
          return session;
        });
        // 按更新时间排序，最新的在前面
        return updated.sort((a, b) => {
          return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
        });
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="flex h-full">
      {/* 对话列表 */}
      <ChatList 
        sessions={sessions}
        activeSessionId={activeSessionId}
        onSessionSelect={handleSessionSelect}
        onSessionCreate={handleSessionCreate}
        onSessionDelete={handleSessionDelete}
      />
      
      {/* 聊天界面 */}
      <div className="flex-1 p-4 overflow-hidden">
        <Card className="h-full overflow-hidden shadow-md">
          <ChatInterface 
            messages={activeSession?.messages || []}
            onSendMessage={handleSendMessage}
            isLoading={isLoading}
            sessionTitle={activeSession?.title || '新对话'}
            onUpdateTitle={() => {
              const newTitle = prompt('请输入新的对话标题:', activeSession?.title || '新对话');
              if (newTitle && newTitle.trim()) {
                handleUpdateSessionTitle(activeSessionId, newTitle.trim());
              }
            }}
          />
        </Card>
      </div>
    </div>
  );
}
