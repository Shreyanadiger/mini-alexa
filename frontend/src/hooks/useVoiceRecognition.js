/**
 * useVoiceRecognition — Custom hook that handles:
 *   1. Continuous listening for the wake word "mini alexa"
 *   2. Recording the user's command after wake word is detected
 *   3. Returning the transcribed command text
 *
 * Uses the Web Speech API (SpeechRecognition).
 */

import { useState, useRef, useCallback, useEffect } from "react";

// States the recognition system can be in
export const VOICE_STATES = {
  IDLE: "idle",
  WAKE_LISTENING: "wake_listening", // listening for "mini alexa"
  COMMAND_LISTENING: "listening", // recording user command
  THINKING: "thinking",
  SPEAKING: "speaking",
  ERROR: "error",
};

const SpeechRecognition =
  window.SpeechRecognition || window.webkitSpeechRecognition;

export function useVoiceRecognition() {
  const [state, setState] = useState(VOICE_STATES.IDLE);
  const [transcript, setTranscript] = useState("");
  const [error, setError] = useState(null);

  const recognitionRef = useRef(null);
  const commandTimeoutRef = useRef(null);
  const isListeningRef = useRef(false);
  const stateRef = useRef(state);

  // Keep stateRef in sync
  useEffect(() => {
    stateRef.value = state;
  }, [state]);

  /**
   * Create a fresh SpeechRecognition instance.
   */
  const createRecognition = useCallback(() => {
    if (!SpeechRecognition) {
      setError("Speech recognition not supported in this browser.");
      setState(VOICE_STATES.ERROR);
      return null;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";
    recognition.maxAlternatives = 1;

    return recognition;
  }, []);

  /**
   * Start listening for the wake word.
   */
  const startWakeWordListening = useCallback(() => {
    // Clean up existing
    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch (_) {}
    }

    const recognition = createRecognition();
    if (!recognition) return;

    recognitionRef.current = recognition;
    isListeningRef.current = true;

    recognition.onresult = (event) => {
      let fullTranscript = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        fullTranscript += event.results[i][0].transcript;
      }

      const lower = fullTranscript.toLowerCase().trim();

      // Check for wake word
      if (
        lower.includes("mini alexa") ||
        lower.includes("mini alexa") ||
        lower.includes("hey alexa") ||
        lower.includes("minialexa")
      ) {
        // Wake word detected! Switch to command mode.
        recognition.abort();
        startCommandListening();
      }
    };

    recognition.onerror = (event) => {
      if (event.error === "no-speech" || event.error === "aborted") {
        // These are normal — restart
        if (isListeningRef.current) {
          setTimeout(() => startWakeWordListening(), 300);
        }
        return;
      }
      console.error("[Wake Word Error]", event.error);
      setError(event.error);
    };

    recognition.onend = () => {
      // Auto-restart if we're still supposed to be listening
      if (isListeningRef.current && stateRef.value === VOICE_STATES.WAKE_LISTENING) {
        setTimeout(() => {
          if (isListeningRef.current) startWakeWordListening();
        }, 300);
      }
    };

    setState(VOICE_STATES.WAKE_LISTENING);
    setError(null);

    try {
      recognition.start();
    } catch (e) {
      console.error("[Recognition Start Error]", e);
      setTimeout(() => startWakeWordListening(), 500);
    }
  }, [createRecognition]);

  /**
   * Start listening for the actual command after wake word.
   */
  const startCommandListening = useCallback(() => {
    const recognition = createRecognition();
    if (!recognition) return;

    recognitionRef.current = recognition;
    let commandText = "";
    let silenceTimer = null;

    recognition.onresult = (event) => {
      let full = "";
      for (let i = 0; i < event.results.length; i++) {
        full += event.results[i][0].transcript;
      }
      commandText = full.trim();
      setTranscript(commandText);

      // Reset the silence timer every time a new word is spoken
      clearTimeout(silenceTimer);
      silenceTimer = setTimeout(() => {
        try {
          recognition.stop();
        } catch (_) {}
      }, 4000); // 4 seconds of silence means they are done
    };

    recognition.onspeechend = () => {
      // Let the silence timer handle stopping, don't force stop here
    };

    recognition.onerror = (event) => {
      console.error("[Command Error]", event.error);
      if (event.error !== "aborted") {
        setState(VOICE_STATES.IDLE);
        isListeningRef.current = false;
      }
    };

    recognition.onend = () => {
      clearTimeout(commandTimeoutRef.current);
      clearTimeout(silenceTimer);
      if (commandText) {
        setTranscript(commandText);
        // The component using this hook will handle the next step
      } else {
        // No command captured
        setState(VOICE_STATES.IDLE);
        isListeningRef.current = false;
      }
    };

    setState(VOICE_STATES.COMMAND_LISTENING);

    try {
      recognition.start();
    } catch (e) {
      console.error("[Command Start Error]", e);
      setState(VOICE_STATES.IDLE);
      isListeningRef.current = false;
    }

    // Ultimate safety timeout — stop after 60 seconds max
    commandTimeoutRef.current = setTimeout(() => {
      try {
        recognition.stop();
      } catch (_) {}
    }, 60000);
  }, [createRecognition]);

  /**
   * Start the full voice flow (no wake word, direct to command).
   */
  const start = useCallback(() => {
    isListeningRef.current = true;
    setError(null);
    startCommandListening();
  }, [startCommandListening]);

  /**
   * Stop all recognition.
   */
  const stop = useCallback(() => {
    isListeningRef.current = false;
    clearTimeout(commandTimeoutRef.current);
    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch (_) {}
    }
    setState(VOICE_STATES.IDLE);
  }, []);

  /**
   * Update state externally (e.g. when thinking/speaking).
   */
  const setVoiceState = useCallback((newState) => {
    setState(newState);
  }, []);

  /**
   * Reset transcript for next command.
   */
  const clearTranscript = useCallback(() => {
    setTranscript("");
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isListeningRef.current = false;
      clearTimeout(commandTimeoutRef.current);
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (_) {}
      }
    };
  }, []);

  return {
    state,
    transcript,
    error,
    start,
    stop,
    setVoiceState,
    clearTranscript,
    isSupported: !!SpeechRecognition,
  };
}
