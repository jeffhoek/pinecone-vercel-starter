// Chat.tsx

import React, { FormEvent, ChangeEvent, RefObject } from "react";
import Messages from "./Messages";
import { UIMessage } from "@ai-sdk/react";

interface Chat {
  input: string;
  handleInputChange: (e: ChangeEvent<HTMLInputElement>) => void;
  handleMessageSubmit: (e: FormEvent<HTMLFormElement>) => Promise<void>;
  messages: UIMessage[];
  inputRef?: RefObject<HTMLInputElement>;
}

const Chat: React.FC<Chat> = ({
  input,
  handleInputChange,
  handleMessageSubmit,
  messages,
  inputRef,
}) => {
  return (
    <div id="chat" className="flex flex-col w-full h-full overflow-hidden">
      <div className="flex-grow overflow-hidden">
        <Messages messages={messages} />
      </div>
      <form
        onSubmit={handleMessageSubmit}
        className="mt-5 mb-5 relative bg-gray-700 rounded-lg flex-shrink-0"
      >
        <input
          ref={inputRef}
          type="text"
          className="input-glow appearance-none border rounded w-full py-2 px-3 text-gray-200 leading-tight focus:outline-none focus:shadow-outline pl-3 pr-10 bg-gray-600 border-gray-600 transition-shadow duration-200"
          value={input}
          onChange={handleInputChange}
        />

        <span className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-gray-400">
          Press ⮐ to send
        </span>
      </form>
    </div>
  );
};

export default Chat;
