/**
 * useGeminiChat — Custom hook for communicating with the FastAPI backend.
 * Sends user messages and receives AI responses.
 */

import { useState, useCallback } from "react";

const API_BASE = "http://localhost:8000";

export function useGeminiChat() {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  /**
   * Send a message to the backend and get an AI response.
   * @param {string} userMessage - The user's text message
   * @returns {string} The AI's response text
   */
  const sendMessage = useCallback(
    async (userMessage) => {
      if (!userMessage.trim()) return "";

      // Add user message to history
      const userMsg = {
        role: "user",
        content: userMessage,
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };

      setMessages((prev) => [...prev, userMsg]);
      setIsLoading(true);

      try {
        // Build history for context (last 10 messages)
        const history = messages.slice(-10).map((m) => ({
          role: m.role === "user" ? "user" : "model",
          content: m.content,
        }));

        const response = await fetch(`${API_BASE}/api/chat`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: userMessage,
            history: history,
          }),
        });

        if (!response.ok) {
          throw new Error(`API error: ${response.status}`);
        }

        const data = await response.json();
        const aiText = data.response;

        // Add AI response to history
        const aiMsg = {
          role: "assistant",
          content: aiText,
          timestamp: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
        };

        setMessages((prev) => [...prev, aiMsg]);
        setIsLoading(false);

        return aiText;
      } catch (error) {
        console.error("[Chat Error]", error);

        const errorMsg = {
          role: "assistant",
          content:
            "Sorry, I couldn't reach the server. Make sure the backend is running on port 8000.",
          timestamp: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
        };

        setMessages((prev) => [...prev, errorMsg]);
        setIsLoading(false);

        return errorMsg.content;
      }
    },
    [messages]
  );

  /**
   * Clear the chat history.
   */
  const clearHistory = useCallback(() => {
    setMessages([]);
  }, []);

  return {
    messages,
    isLoading,
    sendMessage,
    clearHistory,
  };
}
