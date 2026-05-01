/**
 * VoiceOrb — The animated central orb that visualizes the assistant's state.
 * Changes glow, pulse, and icon based on: idle / listening / thinking / speaking.
 */

import { VOICE_STATES } from "../hooks/useVoiceRecognition";

export default function VoiceOrb({ state, onClick }) {
  const getIcon = () => {
    switch (state) {
      case VOICE_STATES.WAKE_LISTENING:
        return "🎙️";
      case VOICE_STATES.COMMAND_LISTENING:
        return "👂";
      case VOICE_STATES.THINKING:
        return "🧠";
      case VOICE_STATES.SPEAKING:
        return "🔊";
      case VOICE_STATES.ERROR:
        return "⚠️";
      default:
        return "🎙️";
    }
  };

  // Map internal states to CSS class names
  const getCssState = () => {
    switch (state) {
      case VOICE_STATES.WAKE_LISTENING:
      case VOICE_STATES.COMMAND_LISTENING:
        return "listening";
      case VOICE_STATES.THINKING:
        return "thinking";
      case VOICE_STATES.SPEAKING:
        return "speaking";
      default:
        return "idle";
    }
  };

  return (
    <div
      className={`orb-container ${getCssState()}`}
      onClick={onClick}
      title="Click to toggle voice recognition"
      role="button"
      tabIndex={0}
      id="voice-orb"
    >
      <div className="orb-rings">
        <div className="orb-ring" />
        <div className="orb-ring" />
        <div className="orb-ring" />
      </div>
      <div className="orb-core">
        <span className="orb-icon">{getIcon()}</span>
      </div>
    </div>
  );
}
