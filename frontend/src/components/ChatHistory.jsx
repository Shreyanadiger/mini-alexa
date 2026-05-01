/**
 * ChatHistory — Scrollable list of conversation messages.
 * Shows user and assistant messages with avatars and timestamps.
 */

import { useEffect, useRef } from "react";

export default function ChatHistory({ messages, isLoading }) {
  const bottomRef = useRef(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  if (messages.length === 0 && !isLoading) {
    return (
      <div className="chat-history" id="chat-history">
        <div className="chat-empty">
          <div className="chat-empty-icon">💬</div>
          <div className="chat-empty-text">
            Your conversation will appear here.
            <br />
            Say <strong>"Mini Alexa"</strong> followed by your question!
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="chat-history" id="chat-history">
      {messages.map((msg, index) => (
        <div key={index} className={`chat-message ${msg.role}`}>
          <div className="chat-avatar">
            {msg.role === "user" ? "🧑" : "✨"}
          </div>
          <div>
            <div className="chat-bubble">{msg.content}</div>
            {msg.timestamp && (
              <div className="chat-timestamp">{msg.timestamp}</div>
            )}
          </div>
        </div>
      ))}

      {isLoading && (
        <div className="chat-message assistant">
          <div className="chat-avatar">✨</div>
          <div className="chat-bubble">
            <div className="typing-dots">
              <span />
              <span />
              <span />
            </div>
          </div>
        </div>
      )}

      <div ref={bottomRef} />
    </div>
  );
}
