// page.tsx

"use client";

import React, { useEffect, useRef, useState, FormEvent } from "react";
import { Context } from "@/components/Context";
import Header from "@/components/Header";
import Chat from "@/components/Chat";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import InstructionModal from "./components/InstructionModal";
import UserMenu from "./components/UserMenu";
import { ExampleQueries } from "./components/ExampleQueries";
import { AiFillGithub, AiOutlineInfoCircle } from "react-icons/ai";

const Page: React.FC = () => {
  const [gotMessages, setGotMessages] = useState(false);
  const [context, setContext] = useState<string[] | null>(null);
  const [isModalOpen, setModalOpen] = useState(false);

  // Check if admin panel should be shown (defaults to true if not set)
  const showAdminPanel = process.env.NEXT_PUBLIC_SHOW_ADMIN_PANEL !== 'false';

  const { messages, sendMessage } = useChat({
    id: 'chat',
    transport: new DefaultChatTransport({
      api: '/api/chat',
    }),
  });

  const [input, setInput] = useState('');
  const prevMessagesLengthRef = useRef(messages.length);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  };

  const handleMessageSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = input;
    setInput('');
    setContext(null);
    setGotMessages(false);

    await sendMessage({ role: 'user', parts: [{ type: 'text', text: userMessage }] });
    setGotMessages(true);
  };

  const handleQuerySelect = (query: string) => {
    setInput(query);
    // Focus the input field after setting the query
    setTimeout(() => {
      inputRef.current?.focus();
    }, 0);
  };

  useEffect(() => {
    const getContext = async () => {
      const response = await fetch("/api/context", {
        method: "POST",
        body: JSON.stringify({
          messages,
        }),
      });
      const { context } = await response.json();
      setContext(context.map((c: any) => c.id));
    };
    // Only fetch context if admin panel is visible
    if (showAdminPanel && gotMessages && messages.length >= prevMessagesLengthRef.current) {
      getContext();
    }

    prevMessagesLengthRef.current = messages.length;
  }, [messages, gotMessages, showAdminPanel]);

  return (
    <div className="flex flex-col justify-between h-screen bg-gray-800 p-2 mx-auto max-w-full">
      <Header className="my-5" />

      <button
        onClick={() => {
          window.open(
            "https://github.com/pinecone-io/pinecone-vercel-starter",
            "_blank"
          );
        }}
        className="fixed right-12 top-4 md:right-12 md:top-6 text-xl text-white github-button"
      >
        <AiFillGithub />
      </button>

      <button
        onClick={() => setModalOpen(true)}
        className="fixed right-4 top-4 md:right-6 md:top-6 text-xl text-white animate-pulse-once info-button"
      >
        <AiOutlineInfoCircle />
      </button>

      <div className="fixed left-4 top-16 md:left-6 md:top-20 z-10">
        <UserMenu />
      </div>

      <InstructionModal
        isOpen={isModalOpen}
        onClose={() => setModalOpen(false)}
      />
      <div className="flex w-full flex-grow overflow-hidden relative">
        <div className={`flex flex-col ${showAdminPanel ? 'w-full lg:w-3/5' : 'w-full'} mr-4 mx-5 lg:mx-0 overflow-hidden`}>
          <ExampleQueries onQuerySelect={handleQuerySelect} />
          <div className="flex-grow overflow-hidden">
            <Chat
              input={input}
              handleInputChange={handleInputChange}
              handleMessageSubmit={handleMessageSubmit}
              messages={messages}
              inputRef={inputRef}
            />
          </div>
        </div>
        {showAdminPanel && (
          <>
            <div className="absolute transform translate-x-full transition-transform duration-500 ease-in-out right-0 w-2/3 h-full bg-gray-700 overflow-y-auto lg:static lg:translate-x-0 lg:w-2/5 lg:mx-2 rounded-lg">
              <Context className="" selected={context} />
            </div>
            <button
              type="button"
              className="absolute left-20 transform -translate-x-12 bg-gray-800 text-white rounded-l py-2 px-4 lg:hidden"
              onClick={(e) => {
                e.currentTarget.parentElement
                  ?.querySelector(".transform")
                  ?.classList.toggle("translate-x-full");
              }}
            >
              ☰
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default Page;
