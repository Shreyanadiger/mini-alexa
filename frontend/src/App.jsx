/**
 * App.jsx — Main Mini Alexa application.
 *
 * Flow:
 * 1. User clicks orb → starts wake word listening
 * 2. User says "Mini Alexa" → switches to command recording
 * 3. Command captured → sent to Gemini via backend
 * 4. AI response received → spoken via browser TTS
 * 5. Back to wake word listening
 */

import { useState, useEffect, useCallback } from "react";
import "./App.css";

import VoiceOrb from "./components/VoiceOrb";
import StatusBanner from "./components/StatusBanner";
import ChatHistory from "./components/ChatHistory";
import {
  useVoiceRecognition,
  VOICE_STATES,
} from "./hooks/useVoiceRecognition";
import { useGeminiChat } from "./hooks/useGeminiChat";
import { speak, stop as stopTTS } from "./utils/tts";

function App() {
  const {
    state,
    transcript,
    error,
    start,
    stop,
    setVoiceState,
    clearTranscript,
    startWakeWordListening,
    isSupported,
  } = useVoiceRecognition();

  const { messages, isLoading, sendMessage } = useGeminiChat();
  const [textInput, setTextInput] = useState("");
  const [isActive, setIsActive] = useState(false);

  /**
   * Handle the full voice command flow.
   * When a transcript is captured in COMMAND_LISTENING state,
   * send it to the AI and speak the response.
   */
  useEffect(() => {
    if (state === VOICE_STATES.COMMAND_LISTENING && transcript) {
      // A brief timeout to let the user finish speaking
      return;
    }
  }, [state, transcript]);

  // When recognition ends with a transcript, process it
  useEffect(() => {
    if (
      transcript &&
      state !== VOICE_STATES.COMMAND_LISTENING &&
      state !== VOICE_STATES.THINKING &&
      state !== VOICE_STATES.SPEAKING
    ) {
      handleCommand(transcript);
      clearTranscript();
    }
  }, [state]);

  /**
   * Process a user command — send to AI and speak response.
   */
  const handleCommand = useCallback(
    async (command) => {
      if (!command.trim()) return;

      setVoiceState(VOICE_STATES.THINKING);
      const response = await sendMessage(command);

      if (response) {
        setVoiceState(VOICE_STATES.SPEAKING);
        speak(response, {}, () => {
          // Done speaking — go back to wake word listening
          setVoiceState(VOICE_STATES.WAKE_LISTENING);
          startWakeWordListening();
        });
      } else {
        setVoiceState(VOICE_STATES.WAKE_LISTENING);
        startWakeWordListening();
      }
    },
    [sendMessage, setVoiceState, startWakeWordListening]
  );

  /**
   * Toggle voice recognition on/off via orb click.
   */
  const handleOrbClick = () => {
    if (isActive) {
      stop();
      stopTTS();
      setIsActive(false);
    } else {
      start();
      setIsActive(true);
    }
  };

  /**
   * Handle text input submission (keyboard fallback).
   */
  const handleTextSubmit = async (e) => {
    e.preventDefault();
    if (!textInput.trim() || isLoading) return;

    const command = textInput.trim();
    setTextInput("");

    setVoiceState(VOICE_STATES.THINKING);
    const response = await sendMessage(command);

    if (response) {
      setVoiceState(VOICE_STATES.SPEAKING);
      speak(response, {}, () => {
        if (isActive) {
          setVoiceState(VOICE_STATES.WAKE_LISTENING);
          startWakeWordListening();
        } else {
          setVoiceState(VOICE_STATES.IDLE);
        }
      });
    } else {
      setVoiceState(isActive ? VOICE_STATES.WAKE_LISTENING : VOICE_STATES.IDLE);
    }
  };

  return (
    <div className="app">
      {/* Header */}
      <header className="app-header">
        <h1 className="app-title">Mini Alexa</h1>
        <p className="app-subtitle">Your AI Voice Assistant</p>
      </header>

      {/* Center — Orb + Status */}
      <section className="app-center">
        <VoiceOrb state={state} onClick={handleOrbClick} />
        <StatusBanner state={state} transcript={transcript} />
        {!isSupported && (
          <p style={{ color: "var(--status-error)", fontSize: "0.85rem" }}>
            ⚠️ Speech recognition is not supported in this browser. Use Chrome
            or Edge.
          </p>
        )}
        {error && (
          <p style={{ color: "var(--status-error)", fontSize: "0.85rem" }}>
            {error}
          </p>
        )}
      </section>

      {/* Chat History */}
      <section className="app-chat">
        <ChatHistory messages={messages} isLoading={isLoading} />
      </section>

      {/* Text Input Fallback */}
      <footer className="app-footer">
        <form className="text-input-row" onSubmit={handleTextSubmit}>
          <input
            type="text"
            className="text-input"
            id="text-input"
            placeholder="Or type your question here..."
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
            disabled={isLoading}
          />
          <button
            type="submit"
            className="send-btn"
            id="send-button"
            disabled={isLoading || !textInput.trim()}
            title="Send message"
          >
            ➤
          </button>
        </form>
      </footer>
    </div>
  );
}

export default App;
