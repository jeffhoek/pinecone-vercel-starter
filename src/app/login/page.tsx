"use client";

import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { FcGoogle } from "react-icons/fc";

export default function LoginPage() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";

  const handleGoogleSignIn = async () => {
    await signIn("google", { callbackUrl });
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-800">
      <div className="w-full max-w-md p-8 space-y-6 bg-gray-700 rounded-lg shadow-xl">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-white mb-2">
            Welcome to RAG Chatbot
          </h1>
          <p className="text-gray-300">
            Sign in to access the chatbot and start asking questions
          </p>
        </div>

        <div className="space-y-4">
          <button
            onClick={handleGoogleSignIn}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 text-gray-700 bg-white rounded-lg hover:bg-gray-100 transition-colors duration-200 font-medium"
          >
            <FcGoogle className="text-2xl" />
            Sign in with Google
          </button>
        </div>

        <div className="text-center text-sm text-gray-400 mt-4">
          <p>Secure authentication powered by Google OAuth</p>
        </div>
      </div>

      <div className="mt-8 text-center text-gray-400 text-sm">
        <p>
          Built with Pinecone, OpenAI, and Vercel
        </p>
      </div>
    </div>
  );
}
