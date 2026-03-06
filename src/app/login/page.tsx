"use client";

import { signIn, getProviders } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { FcGoogle } from "react-icons/fc";
import { Suspense, useEffect, useState } from "react";

type Providers = Record<string, { id: string; name: string }> | null;

function LoginContent() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";
  const [providers, setProviders] = useState<Providers>(null);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getProviders().then((p) => setProviders(p as Providers));
  }, []);

  const handleGoogleSignIn = async () => {
    await signIn("google", { callbackUrl });
  };

  const handleCredentialsSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const result = await signIn("credentials", {
      password,
      callbackUrl,
      redirect: false,
    });
    if (result?.error) {
      setError("Incorrect passphrase.");
    } else if (result?.url) {
      window.location.href = result.url;
    }
    setLoading(false);
  };

  const hasGoogle = providers?.google != null;
  const hasCredentials = providers?.credentials != null;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-800">
      <div className="w-full max-w-md p-8 space-y-6 bg-gray-700 rounded-lg shadow-xl">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-white mb-2">
            Welcome to Jaco Dog Sitting Chatbot
          </h1>
          <p className="text-gray-300">
            Sign in to access the chatbot and start asking questions
          </p>
        </div>

        <div className="space-y-4">
          {hasGoogle && (
            <button
              onClick={handleGoogleSignIn}
              className="w-full flex items-center justify-center gap-3 px-4 py-3 text-gray-700 bg-white rounded-lg hover:bg-gray-100 transition-colors duration-200 font-medium"
            >
              <FcGoogle className="text-2xl" />
              Sign in with Google
            </button>
          )}

          {hasGoogle && hasCredentials && (
            <div className="flex items-center gap-3">
              <div className="flex-1 border-t border-gray-500" />
              <span className="text-gray-400 text-sm">or</span>
              <div className="flex-1 border-t border-gray-500" />
            </div>
          )}

          {hasCredentials && (
            <form onSubmit={handleCredentialsSignIn} className="space-y-3">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter passphrase"
                required
                className="w-full px-4 py-3 bg-gray-600 text-white rounded-lg border border-gray-500 focus:outline-none focus:border-blue-400 placeholder-gray-400"
              />
              {error && <p className="text-red-400 text-sm">{error}</p>}
              <button
                type="submit"
                disabled={loading}
                className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium disabled:opacity-50"
              >
                {loading ? "Signing in..." : "Sign in"}
              </button>
            </form>
          )}
        </div>

        <div className="text-center text-sm text-gray-400 mt-4">
          <p>Secure authentication powered by NextAuth.js</p>
        </div>
      </div>

      <div className="mt-8 text-center text-gray-400 text-sm">
        <p>Built with Pinecone, OpenAI, and Vercel</p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen bg-gray-800">
          <div className="text-white">Loading...</div>
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  );
}
