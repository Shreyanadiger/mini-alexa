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
      v.name.includes("Natural") ||
      v.name.includes("Aria") ||
      v.name.includes("Google US English") ||
      v.name.includes("Google UK English Female") ||
      v.name.includes("Samantha") ||
      v.name.includes("Jenny")
  );
  if (preferred) {
    utterance.voice = preferred;
  } else if (voices.length > 0) {
    // Pick the first English voice that is female if possible
    const englishVoices = voices.filter((v) => v.lang.startsWith("en"));
    const female = englishVoices.find((v) => v.name.includes("Female") || v.name.includes("Zira"));
    utterance.voice = female || englishVoices[0];
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
