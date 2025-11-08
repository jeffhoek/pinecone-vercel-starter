import React, { useEffect } from "react";
import { AiFillGithub } from "react-icons/ai";

interface InstructionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const InstructionModal: React.FC<InstructionModalProps> = ({
  isOpen,
  onClose,
}) => {
  // Handle Escape key to close modal
  useEffect(() => {
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    // Only add listener when modal is open
    if (isOpen) {
      document.addEventListener('keydown', handleEscapeKey);
    }

    // Cleanup: remove listener when modal closes or component unmounts
    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="bg-gray-300 p-5 z-50 rounded-lg shadow-lg relative w-8/12 md:w-5/12">
        <button
          onClick={onClose}
          className="absolute right-2 text-3xl top-2 text-gray-500 hover:text-gray-700"
        >
          &times;
        </button>
        <h2 className="text-2xl font-bold mb-4">Instructions</h2>
        <p>
          This chatbot provides an experimental interface to our &quot;Jaco Care&quot;
          dogsitting Google document. Use the example questions along the top to get started
          or type your own query and then hit enter to send your question.
        </p>
        <br />
        <p>
          Keep in mind that sometimes simple short queries may work better
          than a question in proper sentence form. When in doubt,
          please go directly to the source document for clarification.
        </p>
        <br />
        <p>
          If you spot any errors or anomalies, or have any suggestions for
          example queries, etc. please let us know.
        </p>
      </div>
      <div
        className="absolute inset-0 bg-black z-20 opacity-50"
        onClick={onClose}
      ></div>
    </div>
  );
};

export default InstructionModal;
