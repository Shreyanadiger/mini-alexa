/**
 * StatusBanner — Shows the current state of the voice assistant.
 * Displays a colored dot + descriptive text.
 */

import { VOICE_STATES } from "../hooks/useVoiceRecognition";

export default function StatusBanner({ state, transcript }) {
  const getStatusInfo = () => {
    switch (state) {
      case VOICE_STATES.WAKE_LISTENING:
        return { text: 'Say "Mini Alexa" to start...', cssState: "idle" };
      case VOICE_STATES.COMMAND_LISTENING:
        return {
          text: transcript ? `"${transcript}"` : "Listening... speak now!",
          cssState: "listening",
        };
      case VOICE_STATES.THINKING:
        return { text: "Thinking...", cssState: "thinking" };
      case VOICE_STATES.SPEAKING:
        return { text: "Speaking...", cssState: "speaking" };
      case VOICE_STATES.ERROR:
        return { text: "Microphone error — click the orb to retry", cssState: "error" };
      default:
        return { text: "Click the orb to start", cssState: "idle" };
    }
  };

  const { text, cssState } = getStatusInfo();

  return (
    <div className={`status-banner ${cssState}`} id="status-banner">
      <div className="status-dot" />
      <span className="status-text">{text}</span>
    </div>
  );
}
