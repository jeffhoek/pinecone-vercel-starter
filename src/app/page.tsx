// page.tsx

"use client";

import React, { useEffect, useRef, useState, FormEvent } from "react";
import { Context } from "@/components/Context";
import Header from "@/components/Header";
import Chat from "@/components/Chat";
import { useChat } from "ai/react";
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

  const { messages, input, handleInputChange, handleSubmit, setInput } = useChat({
    onFinish: async () => {
      setGotMessages(true);
    },
  });

  const prevMessagesLengthRef = useRef(messages.length);

  const handleMessageSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    handleSubmit(e);
    setContext(null);
    setGotMessages(false);
  };

  const handleQuerySelect = (query: string) => {
    setInput(query);
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
      <a
        className="fixed left-4 top-4 md:right-14 md:top-6 text-xl text-white"
        href="https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fpinecone-io%2Fpinecone-vercel-starter&env=OPENAI_API_KEY,PINECONE_API_KEY,PINECONE_CLOUD,PINECONE_REGION,PINECONE_INDEX&envDescription=API%20Keys%20needed%20to%20run%20the%20application&envLink=https%3A%2F%2Fdocs.pinecone.io%2Fdocs%2Fprojects%23api-keys&project-name=my-awesome-pinecone-vercel-project&repository-name=my-awesome-pinecone-vercel-project&demo-title=Pinecone%20%2B%20Vercel%20AI%20SDK%20Starter&demo-description=A%20Next.js%20starter%20chatbot%20using%20Vercel's%20AI%20SDK%20and%20implements%20the%20Retrieval-Augmented%20Generation%20(RAG)%20pattern%20with%20Pinecone&demo-url=https%3A%2F%2Fpinecone-vercel-example.vercel.app%2F&demo-image=https%3A%2F%2Fvercel.com%2F_next%2Fimage%3Furl%3Dhttps%253A%252F%252Fimages.ctfassets.net%252Fe5382hct74si%252F1G4xSqx0bCgVVv3aY3rrX4%252Ffa27791c39ddf058995561d794a68710%252FCleanShot_2023-07-21_at_11.55.49.png%26w%3D3840%26q%3D75%26dpl%3Ddpl_5bh93Tz7wfj1PdxgzMGwNCc1nAxA"
      >
        <img src="https://vercel.com/button" alt="Deploy with Vercel" />
      </a>

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
