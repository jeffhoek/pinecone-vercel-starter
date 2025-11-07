"use client";

import React from "react";

interface ExampleQueriesProps {
  onQuerySelect: (query: string) => void;
}

// Preset example queries - easily customizable
const EXAMPLE_QUERIES = [
  "What are Jaco's favorite activities?",
  "What should I know about feeding Jaco?",
  "What is Jaco's walking schedule?",
  "Dog poop disposal instructions?",
  "Any issues with other dogs?",
  "Does Jaco have any health concerns?",
  "Which remote to use for cable TV?",
  "When to take the trash out?"
];

export const ExampleQueries: React.FC<ExampleQueriesProps> = ({ onQuerySelect }) => {
  return (
    <div className="w-full bg-gray-700 rounded-lg p-4 mb-4">
      <h3 className="text-white font-semibold mb-3 text-sm">Example Questions:</h3>
      <div className="flex flex-wrap gap-2">
        {EXAMPLE_QUERIES.map((query, index) => (
          <button
            key={index}
            onClick={() => onQuerySelect(query)}
            className="px-3 py-2 bg-gray-600 hover:bg-gray-500 text-white text-sm rounded-md transition-colors duration-200 border border-gray-500 hover:border-gray-400"
          >
            {query}
          </button>
        ))}
      </div>
    </div>
  );
};
