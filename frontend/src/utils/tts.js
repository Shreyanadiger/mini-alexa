/**
 * Browser Text-to-Speech utility.
 * Uses the built-in Web Speech Synthesis API — no API key needed.
 */

let currentUtterance = null;

/**
 * Speak text aloud using the browser's TTS engine.
 * @param {string} text - The text to speak
 * @param {object} options - Optional TTS configuration
 * @param {function} onEnd - Callback when speech finishes
 * @returns {SpeechSynthesisUtterance}
 */
export function speak(text, options = {}, onEnd = null) {
  // Cancel any ongoing speech
  stop();

  const utterance = new SpeechSynthesisUtterance(text);

  // Default settings
  utterance.rate = options.rate || 1.0;
  utterance.pitch = options.pitch || 1.0;
  utterance.volume = options.volume || 1.0;

  // Try to use a natural-sounding voice
  const voices = window.speechSynthesis.getVoices();
  const preferred = voices.find(
    (v) =>
      v.name.includes("Google") ||
      v.name.includes("Natural") ||
      v.name.includes("Samantha")
  );
  if (preferred) {
    utterance.voice = preferred;
  } else if (voices.length > 0) {
    // Pick the first English voice
    const english = voices.find((v) => v.lang.startsWith("en"));
    if (english) utterance.voice = english;
  }

  if (onEnd) {
    utterance.onend = onEnd;
  }

  currentUtterance = utterance;
  window.speechSynthesis.speak(utterance);

  return utterance;
}

/**
 * Stop any ongoing TTS playback.
 */
export function stop() {
  window.speechSynthesis.cancel();
  currentUtterance = null;
}

/**
 * Check if TTS is currently speaking.
 * @returns {boolean}
 */
export function isSpeaking() {
  return window.speechSynthesis.speaking;
}

// Pre-load voices (some browsers need this)
if (typeof window !== "undefined" && window.speechSynthesis) {
  window.speechSynthesis.getVoices();
  window.speechSynthesis.onvoiceschanged = () => {
    window.speechSynthesis.getVoices();
  };
}
