"use client";

import { signOut, useSession } from "next-auth/react";
import { useState } from "react";
import { AiOutlineUser, AiOutlineLogout } from "react-icons/ai";

export default function UserMenu() {
  const { data: session } = useSession();
  const [isOpen, setIsOpen] = useState(false);

  if (!session?.user) {
    return null;
  }

  const handleSignOut = async () => {
    await signOut({ callbackUrl: "/login" });
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 text-white bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors"
      >
        {session.user.image ? (
          <img
            src={session.user.image}
            alt={session.user.name || "User"}
            className="w-8 h-8 rounded-full"
          />
        ) : (
          <AiOutlineUser className="text-xl" />
        )}
        <span className="hidden md:inline">{session.user.name || session.user.email}</span>
      </button>

      {isOpen && (
        <>
          {/* Backdrop to close menu when clicking outside */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />

          {/* Dropdown menu */}
          <div className="absolute right-0 mt-2 w-64 bg-gray-700 rounded-lg shadow-xl z-20 overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-600">
              <p className="text-sm text-gray-400">Signed in as</p>
              <p className="text-white font-medium truncate">
                {session.user.email}
              </p>
            </div>

            <button
              onClick={handleSignOut}
              className="w-full flex items-center gap-3 px-4 py-3 text-white hover:bg-gray-600 transition-colors"
            >
              <AiOutlineLogout className="text-xl" />
              <span>Sign out</span>
            </button>
          </div>
        </>
      )}
    </div>
  );
}
