/**
 * MCP Tool Call Renderer
 * Based on CopilotKit's official McpToolCall component pattern
 */

import React, { useState } from 'react';

interface ToolCallProps {
  readonly status: "complete" | "inProgress" | "executing";
  readonly name?: string;
  readonly args?: unknown;
  readonly result?: unknown;
}

export default function McpToolCall({
  status,
  name = "",
  args,
  result,
}: ToolCallProps) {
  const [isOpen, setIsOpen] = useState(false);

  // Format content for display - based on CopilotKit's format function
  const format = (content: unknown): string => {
    if (!content) return "";
    
    let text: string;
    if (typeof content === "object" && content !== null) {
      try {
        text = JSON.stringify(content, null, 2);
      } catch {
        text = "[Object]";
      }
    } else if (typeof content === "string") {
      text = content;
    } else if (typeof content === "number" || typeof content === "boolean") {
      text = String(content);
    } else {
      text = "[Unknown Content]";
    }
    
    return text
      .replace(/\\n/g, "\n")
      .replace(/\\t/g, "\t")
      .replace(/\\"/g, '"')
      .replace(/\\\\/g, "\\");
  };

  const getStatusColor = () => {
    switch (status) {
      case "complete":
        return "bg-green-400";
      case "inProgress":
      case "executing":
        return "bg-yellow-400 animate-pulse";
      default:
        return "bg-gray-400";
    }
  };

  const getStatusText = () => {
    switch (status) {
      case "complete":
        return "Completed";
      case "inProgress":
        return "In Progress";
      case "executing":
        return "Executing";
      default:
        return "Unknown";
    }
  };

  const handleToggle = () => {
    setIsOpen(!isOpen);
  };

  // Render args if available
  const renderArgs = () => {
    if (!args) return null;
    const formattedArgs = format(args);
    return (
      <div className="mb-4">
        <div className="text-slate-400 mb-2 font-semibold">Parameters:</div>
        <pre className="bg-slate-800 p-3 rounded border text-slate-100 whitespace-pre-wrap max-h-[200px] overflow-auto">
          {formattedArgs}
        </pre>
      </div>
    );
  };

  // Render result if available and complete
  const renderResult = () => {
    if (status !== "complete" || !result) return null;
    const formattedResult = format(result);
    return (
      <div>
        <div className="text-slate-400 mb-2 font-semibold">Result:</div>
        <pre className="bg-slate-800 p-3 rounded border text-slate-100 whitespace-pre-wrap max-h-[200px] overflow-auto">
          {formattedResult}
        </pre>
      </div>
    );
  };

  return (
    <div className="bg-slate-800 rounded-lg overflow-hidden w-full border border-slate-600">
      <button
        type="button"
        className="w-full p-3 flex items-center cursor-pointer hover:bg-slate-750 transition-colors bg-transparent border-none"
        onClick={handleToggle}
        {...(isOpen ? { 'aria-expanded': true } : { 'aria-expanded': false })}
        aria-label={`Toggle details for ${name || "MCP Tool Call"}`}
      >
        <span className="text-white text-sm overflow-hidden text-ellipsis flex-1">
          🔧 {name || "MCP Tool Call"}
        </span>
        <div className="flex items-center gap-2 ml-auto">
          <span className="text-xs text-slate-300">
            {getStatusText()}
          </span>
          <div className={`w-2 h-2 rounded-full ${getStatusColor()}`} />
          <svg
            className={`w-4 h-4 text-slate-400 transition-transform ${
              isOpen ? "rotate-180" : ""
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </div>
      </button>

      {isOpen && (
        <div className="px-4 pb-4 text-slate-300 font-mono text-xs border-t border-slate-600 bg-slate-900">
          <div className="py-3">
            <div className="mb-4">
              <div className="text-slate-400 mb-2 font-semibold">Tool Name:</div>
              <pre className="bg-slate-800 p-2 rounded border text-slate-100">
                {name || "Unknown"}
              </pre>
            </div>

            {renderArgs()}

            {renderResult()}

            {status === "executing" && (
              <div className="text-center py-4">
                <div className="inline-flex items-center gap-2 text-yellow-400">
                  <div className="w-4 h-4 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin"></div>
                  <span>Executing tool...</span>
                </div>
              </div>
            )}

            {status === "inProgress" && (
              <div className="text-center py-4">
                <div className="inline-flex items-center gap-2 text-blue-400">
                  <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
                  <span>Processing...</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
