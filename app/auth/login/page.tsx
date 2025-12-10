'use client';

import { handleSignIn } from '../../actions';

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">AI助手聊天应用</h1>
          <p className="mt-2 text-sm text-gray-600">登录后开始与AI聊天</p>
        </div>
        <div className="mt-6">
          <button
            onClick={async () => {
              await handleSignIn();
            }}
            className="w-full px-4 py-2 font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            使用 Logto 登录
          </button>
        </div>
      </div>
    </div>
  );
}
