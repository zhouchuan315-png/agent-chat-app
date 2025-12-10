import { NextRequest, NextResponse } from "next/server";
import { getLogtoContext } from '@logto/next/server-actions';
import { logtoConfig } from '../../logto';
import OpenAI from "openai";
import { ChatCompletionMessageParam } from "openai/resources/index.mjs";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: process.env.OPENAI_BASE_URL,
})

export async function POST(req: NextRequest) {
  try {
    // 检查用户是否已认证
    const { isAuthenticated } = await getLogtoContext(logtoConfig);
    
    if (!isAuthenticated) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    const { messages } = await req.json();
    
    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: "Invalid messages" }, { status: 400 });
    }

    // 转换消息格式为OpenAI API所需的格式
    const formattedMessages: ChatCompletionMessageParam[] = [
      { role: "system", content: "You are a helpful AI assistant. Please respond in Chinese and format your answer using Markdown syntax. Use appropriate markdown elements like headers, lists, code blocks, bold text etc. when needed to make the response well-structured and easy to read." },
        ...messages.map(msg => ({
        role: msg.isUser ? ("user" as const) : ("assistant" as const),
        content: msg.content
      }))
    ];

    console.log("Attempting to call OpenAI API...");
    console.log("Client settings:", {
      baseURL: client.baseURL,
      hasApiKey: !!client.apiKey
    });
    console.log("Messages count:", formattedMessages.length);

    // 使用配置的OpenAI客户端调用API，启用流式响应
    const stream = await client.chat.completions.create({
      model: "gpt-5.1",
      messages: formattedMessages,
      stream: true,
      max_tokens: 4096, // 增加max_tokens参数解除回复长度限制
    });

    // 创建ReadableStream来处理流式响应
    const readableStream = new ReadableStream({
      async start(controller) {
        // 编码器，用于将字符串转换为Uint8Array
        const encoder = new TextEncoder();
        
        try {
          // 遍历流式响应的每一块数据
          for await (const chunk of stream) {
            // 获取当前块的内容
            const content = chunk.choices[0]?.delta?.content || '';
            
            if (content) {
              // 将内容编码并写入流
              controller.enqueue(encoder.encode(content));
            }
          }
        } catch (error) {
          console.error("Stream processing error:", error);
          controller.error(error);
        } finally {
          // 关闭流
          controller.close();
        }
      },
    });

    console.log("OpenAI API streaming call successful");
    
    // 返回流式响应
    return new NextResponse(readableStream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache, no-transform',
        'Connection': 'keep-alive',
      },
    });
  } catch (error: unknown) {
    // 将error断言为Error类型以便访问其属性
    const err = error as Error;
    
    // 安全地获取cause属性，使用类型保护
    const getErrorCause = (error: Error) => {
      return 'cause' in error ? error.cause : undefined;
    };
    
    const cause = getErrorCause(err);
    
    console.error("Error details:", {
      name: err.name,
      message: err.message,
      stack: err.stack,
      cause: cause
    });
    
    if (err.name === 'AbortError') {
      console.error("OpenAI API request timed out after 60 seconds");
      return NextResponse.json({ error: "AI response timed out. Please try again later." }, { status: 504 });
    }
    
    // 检查是否是连接超时错误
    if (cause && typeof cause === 'object' && cause !== null && 'name' in cause && cause.name === 'ConnectTimeoutError') {
      console.error("Failed to connect to OpenAI API. Please check your network or proxy settings.");
      return NextResponse.json({ 
        error: "Failed to connect to AI service. Please check your network or proxy settings." 
      }, { status: 503 });
    }
    
    return NextResponse.json({ error: "Failed to connect to AI service. Please try again later." }, { status: 503 });
  }
}
