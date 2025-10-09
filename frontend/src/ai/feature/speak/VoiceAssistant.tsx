/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useRef, useEffect, useCallback } from "react";
import {
  StopCircle,
  RefreshCw,
  MessageSquare,
  Send,
  Pause,
  Volume1Icon,
  Speech,
} from "lucide-react";
import { useAuthentication } from "../../../features/authentication/context/AuthenticationContextProvider";

// Mock authentication context for demo

const usePageTitle = (title: string) => {
  useEffect(() => {
    document.title = title;
  }, [title]);
};

// Text formatter component for better display
const FeedbackFormatter = ({ content }: { content: string }) => {
  const formatFeedback = (text: string) => {
    return (
      text
        // Fix bold formatting (e.g. **Fix** → styled bold)
        .replace(/\*\*(.*?)\*\*/g, "<span class='highlight-yellow'>$1</span>")
        .replace(/,,(.*?),,/g, '<span class="italic-thought">$1</span>')
        // Format quotes
        .replace(/"(.*?)"/g, '<span class="styled-quote">"$1"</span>')
        // Format corrections (✅)
        .replace(/✅(.*?)(?=\n|$)/g, '<div class="success-text">✅ $1</div>')
        // Format suggestions (💡)
        .replace(/💡(.*?)(?=\n|$)/g, '<div class="suggestion-text">💡 $1</div>')
        // Format questions (?) — inline
        .replace(/\?(.*?)(?=\n|$)/g, '<span class="question-text">? $1</span>')
        // Numbered points
        .replace(
          /(\d+\.)\s*(.*?)(?=\n|$)/g,
          '<div class="numbered-point"><span class="point-number">$1</span> $2</div>'
        )
        // Bullet points
        .replace(/•\s*(.*?)(?=\n|$)/g, '<div class="bullet-point">• $1</div>')
        // Wisdom block
        .replace(/\/\/\/(.*?)\/\//g, '<div class="wisdom-block">$1</div>')
    );
  };

  return (
    <div
      className="formatted-feedback-content"
      dangerouslySetInnerHTML={{ __html: formatFeedback(content) }}
    />
  );
};

// Custom Toast component
const Toast = ({
  message,
  type,
  isVisible,
  onClose,
}: {
  message: string;
  type: "success" | "error" | "info" | "warning";
  isVisible: boolean;
  onClose: () => void;
}) => {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(onClose, 3000);
      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]);

  if (!isVisible) return null;

  const bgColor = {
    success: "bg-green-500",
    error: "bg-red-500",
    info: "bg-blue-500",
    warning: "bg-yellow-500",
  }[type];

  return (
    <div
      className={`fixed top-20 right-4 ${bgColor} text-white px-6 py-3 rounded-lg shadow-lg z-50 transition-all duration-300`}
    >
      <div className="flex items-center justify-between">
        <span>{message}</span>
        <button
          onClick={onClose}
          className="ml-4 text-white hover:text-gray-200"
        >
          ✕
        </button>
      </div>
    </div>
  );
};

// Volume Control Component

// Real-time Speech Display Component
const RealTimeSpeech = ({
  interimTranscript,
  finalTranscript,
  isListening,
}: {
  interimTranscript: string;
  finalTranscript: string;
  isListening: boolean;
}) => {
  if (!isListening && !finalTranscript && !interimTranscript) return null;

  return (
    <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4 min-h-[100px]">
      <h3 className="font-semibold text-blue-800 mb-3 flex items-center">
        <div
          className={`w-3 h-3 rounded-full mr-2 ${
            isListening ? "bg-red-500 animate-pulse" : "bg-gray-400"
          }`}
        ></div>
        Real-time Speech Recognition
      </h3>
      <div className="space-y-2">
        {finalTranscript && (
          <div className="text-gray-800 bg-white p-3 rounded-lg border">
            <span className="text-xs text-green-600 font-semibold">
              FINAL:{" "}
            </span>
            {finalTranscript}
          </div>
        )}
        {interimTranscript && (
          <div className="text-gray-600 bg-gray-100 p-3 rounded-lg border-dashed border-2">
            <span className="text-xs text-blue-600 font-semibold">
              INTERIM:{" "}
            </span>
            <span className="italic">{interimTranscript}</span>
            <span className="animate-pulse">|</span>
          </div>
        )}
        {isListening && !interimTranscript && !finalTranscript && (
          <div className="text-gray-500 italic text-center py-4">
            🎤 Listening for your voice...
          </div>
        )}
      </div>
    </div>
  );
};

// === ENHANCED VOICE FEEDBACK ASSISTANT ===
const VoiceAssistant = () => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [interimTranscript, setInterimTranscript] = useState("");
  const [finalTranscript, setFinalTranscript] = useState("");
  const [feedback, setFeedback] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [volume, setVolume] = useState(80);
  const [isMuted, setIsMuted] = useState(false);
  const { user } = useAuthentication();

  // Toast state
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error" | "info" | "warning";
    isVisible: boolean;
  }>({ message: "", type: "info", isVisible: false });

  const recognitionRef = useRef<any>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const silenceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isManualStopRef = useRef(false);
  const lastProcessedResultRef = useRef(0); // Track which results we've processed

  usePageTitle("Speak English");

  // Show toast function
  const showToast = (
    message: string,
    type: "success" | "error" | "info" | "warning"
  ) => {
    setToast({ message, type, isVisible: true });
  };

  const hideToast = () => {
    setToast((prev) => ({ ...prev, isVisible: false }));
  };

  // Gemini API Configuration
  const API_KEY = import.meta.env.VITE_API_URL_GEMINI;
  const MODEL = "gemini-2.5-flash-lite";
  const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${API_KEY}`;

  // Enhanced text cleaning for speech synthesis
  const cleanTextForSpeech = (text: string): string => {
    return text
      .replace(/\*([\s\S]+?)\*/g, "$1")
      .replace(/\*\*(.*?)\*\*/g, "$1")
      .replace(/\*(.*?)\*/g, "$1")
      .replace(/__(.*?)__/g, "$1")
      .replace(/~~(.*?)~~/g, "$1")
      .replace(/`(.*?)`/g, "$1")
      .replace(/[•\-+*]/g, "")
      .replace(/#{1,6}\s*/g, "")
      .replace(/\[.*?\]/g, "")
      .replace(/\(.*?\)/g, "")
      .replace(/[!]{2,}/g, "!")
      .replace(/[?]{2,}/g, "?")
      .replace(/👉|👈|▶️|⚠️|❌|✅|💡|🔥|💬/g, "")
      .trim()
      .replace(/^[.,:;!?]+|[.,:;!?]+$/g, "");
  };

  // Auto-stop after silence

  // Get feedback from Gemini
  const getFeedbackFromGemini = useCallback(
    async (text: string) => {
      if (!text.trim() || isProcessing) return;

      setIsProcessing(true);
      setHasError(false);

      const prompt = `
Reply like my coolest friend using ${user?.nativeLanguage} + simple English.  

🌍 Language Mix:  
— Detect my level.  
   • If I'm new → ~70% ${user?.nativeLanguage} / 30% English  
   • If intermediate → ~50% ${user?.nativeLanguage} / 50% English  
— Slowly increase English only if I seem comfortable.  
— If I write in ${user?.nativeLanguage}, first give a one-line simple English translation.  

📝 Format (1–2 short lines each):  
1)  **Answer** — reply to my ${text} message (friendly, playful).  
2) ✅ **Fix** — best English version (only if needed). Correct grammar/syntax/word choice use single astric where you corrected.  
3) 💡 **Tip** — explain in very easy ${user?.nativeLanguage}; give one tiny rule or example.  
4) ❓ **Question** — fun/easy follow-up to keep chatting.  

🎨 Style:  
— Be supportive; add small praise 🙌.  
— No repeating old tips, no long lectures, no over-explaining.  
— Use 2–3 helpful emojis max per turn.  

Here’s what I said: ${text}  
`;

      console.log("Prompt " + prompt);
      try {
        const response = await fetch(GEMINI_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
              temperature: 0.7,
              topK: 40,
              topP: 0.95,
              maxOutputTokens: 512,
            },
          }),
        });

        if (!response.ok) throw new Error(`API Error: ${response.status}`);

        const data = await response.json();
        const feedbackText =
          data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

        if (!feedbackText) throw new Error("No feedback received");

        setFeedback(feedbackText);
        showToast("✅ Feedback received", "success");
      } catch (err) {
        console.error("❌ Error:", err);
        setHasError(true);
        setFeedback(
          "Sorry, I couldn't analyze your English. Please try again."
        );
        showToast("❌ Failed to get feedback", "error");
      } finally {
        setIsProcessing(false);
      }
    },
    [isProcessing, GEMINI_URL, user?.nativeLanguage]
  );

  // Initialize Speech Recognition - FIXED VERSION
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      showToast("⚠️ Please use Chrome, Edge, or Safari", "warning");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    recognition.onresult = (event: any) => {
      let interim = "";
      let newFinalText = "";

      // Process only NEW results that we haven't seen before
      for (
        let i = lastProcessedResultRef.current;
        i < event.results.length;
        i++
      ) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          newFinalText += transcript;
          lastProcessedResultRef.current = i + 1; // Mark this result as processed
        } else {
          interim += transcript;
        }
      }

      // Update interim transcript (only current interim results)
      setInterimTranscript(interim);

      // Add only NEW final text to existing transcript
      if (newFinalText.trim()) {
        setFinalTranscript((prev) => prev + newFinalText);
        setTranscript((prev) => prev + newFinalText);

        // Clear any existing silence timer
        if (silenceTimerRef.current) {
          clearTimeout(silenceTimerRef.current);
        }

        // Set a new timer for auto-stop after 3 seconds of silence
        silenceTimerRef.current = setTimeout(() => {
          if (isListening) {
            setIsListening(false);
            isManualStopRef.current = true;
            recognition.stop();
            showToast("🔇 Auto-stopped after silence", "info");
          }
        }, 3000);
      }
    };

    // FIXED: Don't auto-restart, only restart if intentionally listening
    recognition.onend = () => {
      // Clear any pending silence timer
      if (silenceTimerRef.current) {
        clearTimeout(silenceTimerRef.current);
        silenceTimerRef.current = null;
      }

      // Only restart if we're still supposed to be listening AND it wasn't a manual stop
      if (isListening && !isManualStopRef.current) {
        try {
          recognition.start();
        } catch (e) {
          console.error("Restart failed:", e);
          setIsListening(false);
        }
      }

      // Reset manual stop flag
      isManualStopRef.current = false;
    };

    recognition.onstart = () => {
      // Clear interim when starting fresh and reset result counter
      setInterimTranscript("");
      lastProcessedResultRef.current = 0; // Reset processed result counter
    };

    recognition.onerror = (event: any) => {
      console.error("Speech recognition error:", event.error);

      // Clear any pending silence timer
      if (silenceTimerRef.current) {
        clearTimeout(silenceTimerRef.current);
        silenceTimerRef.current = null;
      }

      if (event.error === "no-speech") {
        // Don't show error for no-speech, just continue
        return;
      }
      if (event.error === "audio-capture") {
        setIsListening(false);
        showToast("🎤 Mic access issue", "error");
      } else if (event.error === "not-allowed") {
        setIsListening(false);
        showToast("🚫 Mic permission denied", "error");
      } else if (event.error === "network") {
        showToast("🌐 Network error - please check connection", "error");
      }
    };

    recognitionRef.current = recognition;

    return () => {
      if (silenceTimerRef.current) {
        clearTimeout(silenceTimerRef.current);
      }
      recognition.stop();
    };
  }, [isListening]);

  // Start listening - IMPROVED
  const startListening = () => {
    if (isProcessing || isListening) return;

    // Reset all states
    setTranscript("");
    setInterimTranscript("");
    setFinalTranscript("");
    setFeedback("");
    setHasError(false);
    isManualStopRef.current = false;
    lastProcessedResultRef.current = 0; // Reset result tracking

    // Clear any existing timer
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }

    try {
      recognitionRef.current?.start();
      setIsListening(true);
      showToast("🎤 Listening...", "info");
    } catch (error) {
      console.error("Start listening error:", error);
      showToast("❌ Mic error", "error");
    }
  };

  // Stop listening - IMPROVED
  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      isManualStopRef.current = true; // Mark as manual stop
      recognitionRef.current.stop();
      setIsListening(false);
      setInterimTranscript("");

      // Clear silence timer
      if (silenceTimerRef.current) {
        clearTimeout(silenceTimerRef.current);
        silenceTimerRef.current = null;
      }

      showToast("⏹️ Stopped listening", "info");
    }
  };

  // Read aloud function
  const readAloud = (text: string) => {
    if (!text || !window.speechSynthesis || isMuted) {
      if (isMuted) showToast("🔇 Speech is muted", "warning");
      return;
    }

    setIsSpeaking(true);
    window.speechSynthesis.cancel();

    const cleanText = cleanTextForSpeech(text);
    if (!cleanText.trim()) {
      setIsSpeaking(false);
      return;
    }

    const speakWithBestVoice = () => {
      const utterance = new SpeechSynthesisUtterance(cleanText);
      utteranceRef.current = utterance;

      const voices = window.speechSynthesis.getVoices();
      const preferredVoices = [
        voices.find(
          (v) =>
            v.name.includes("Microsoft") &&
            v.name.includes("Natural") &&
            v.lang.startsWith("en")
        ),
        voices.find(
          (v) => v.name.includes("Google") && v.lang.startsWith("en")
        ),
        voices.find((v) => v.name.includes("Alex") && v.lang.startsWith("en")),
        voices.find((v) => v.lang.startsWith("en-US")),
        voices.find((v) => v.lang.startsWith("en")),
      ].filter(Boolean);

      if (preferredVoices.length > 0) {
        utterance.voice = preferredVoices[0];
      }

      utterance.lang = "en-US";
      utterance.rate = 0.75;
      utterance.pitch = 1.1;
      utterance.volume = volume / 100;

      utterance.onend = () => {
        setIsSpeaking(false);
        utteranceRef.current = null;
      };

      utterance.onerror = (event) => {
        console.error("❌ Speech synthesis error:", event);
        setIsSpeaking(false);
        utteranceRef.current = null;
        showToast("Speech Error: Could not read aloud", "error");
      };

      window.speechSynthesis.speak(utterance);
    };

    if (window.speechSynthesis.getVoices().length === 0) {
      window.speechSynthesis.onvoiceschanged = speakWithBestVoice;
    } else {
      speakWithBestVoice();
    }
  };

  // Stop speaking
  const stopSpeaking = () => {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      utteranceRef.current = null;
      showToast("🔇 Speech stopped", "info");
    }
  };

  // Volume control handlers

  // Clear everything - IMPROVED
  const clearAll = () => {
    // Stop recognition
    isManualStopRef.current = true;
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
    }

    // Clear silence timer
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }

    // Stop speech synthesis
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }

    // Reset all states
    setTranscript("");
    setInterimTranscript("");
    setFinalTranscript("");
    setFeedback("");
    setIsListening(false);
    setIsProcessing(false);
    setIsSpeaking(false);
    setHasError(false);

    showToast("🧹 Cleared - Ready for new speech", "info");
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (silenceTimerRef.current) {
        clearTimeout(silenceTimerRef.current);
      }
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  return (
    <div className="min-h-screen p-4 ">
      <Toast {...toast} onClose={hideToast} />

      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col space-y-6 mt-8">
          {/* Header */}
          <div className="flex flex-col items-center space-y-3">
            <div className="w-20 h-20 rounded-full bg-gradient-to-r from-green-500 to-lime-500 flex items-center justify-center">
              <MessageSquare size={32} />
            </div>
            <h1 className="text-3xl font-bold text-center ">
              🎤 Enhanced English Feedback Assistant
            </h1>
            <p className="text-center text-lg ">
              Real-time Speech → Edit → Get Feedback → Improve
            </p>
            <p className="text-sm text-center">
              ✨ Auto-stops after 3 seconds of silence to prevent loops
            </p>
          </div>

          {/* Main Card */}
          <div className=" rounded-2xl shadow-xl p-8">
            <div className="flex flex-col space-y-6">
              {/* Mic Control */}
              <div className="flex flex-col items-center space-y-4">
                <div className="flex justify-center space-x-4">
                  {isListening ? (
                    <button
                      onClick={stopListening}
                      className="w-20 h-20 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center shadow-lg transition-colors"
                    >
                      <StopCircle size={32} />
                    </button>
                  ) : (
                    <button
                      onClick={startListening}
                      className="w-20 h-20 bg-lime-500 hover:bg-lime-600 text-white rounded-full flex items-center justify-center shadow-lg transition-colors"
                      disabled={isProcessing}
                    >
                      <Speech size={32} />
                    </button>
                  )}
                </div>

                {/* Status Indicators */}
                <div className="flex flex-col items-center space-y-2">
                  {isListening && (
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                      <span className="bg-red-100 text-red-800 text-sm font-medium px-3 py-1 rounded-full">
                        Listening... (auto-stops after 3s silence)
                      </span>
                    </div>
                  )}
                  {isProcessing && (
                    <div className="flex items-center space-x-2">
                      <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-500"></div>
                      <span className="bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1 rounded-full">
                        Analyzing...
                      </span>
                    </div>
                  )}
                  {isSpeaking && (
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                      <span className="bg-green-100 text-green-800 text-sm font-medium px-3 py-1 rounded-full">
                        Speaking...
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Real-time Speech Recognition */}
              <RealTimeSpeech
                interimTranscript={interimTranscript}
                finalTranscript={finalTranscript}
                isListening={isListening}
              />

              {/* Volume Control */}

              {/* Editable Transcript */}
              {transcript && (
                <div className="p-5 rounded-xl border-l-4 border-blue-400">
                  <h3 className="font-bold mb-3 text-xs">
                    Your Speech (Editable):
                  </h3>
                  <textarea
                    value={transcript}
                    onChange={(e) => setTranscript(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500"
                    rows={4}
                    placeholder="Your speech will appear here. You can edit it before analyzing."
                  />
                  <button
                    onClick={() => getFeedbackFromGemini(transcript)}
                    disabled={!transcript.trim() || isProcessing}
                    className="mt-3 py-3 px-4 flex justify-center items-center gap-2 bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white rounded-lg transition-colors"
                  >
                    {isProcessing ? "Analyzing..." : "Analyze My English"}{" "}
                    <Send size={16} />
                  </button>
                </div>
              )}

              {/* Feedback Display */}
              {feedback && (
                <div
                  className={`p-5 rounded-xl border-l-4 ${
                    hasError
                      ? "bg-red-50 border-red-400"
                      : "bg-green-50 border-green-400"
                  }`}
                >
                  <div className="flex justify-between items-center mb-4">
                    <h3
                      className={`font-bold text-lg ${
                        hasError ? "text-red-700" : "text-green-700"
                      }`}
                    >
                      🤖 Feedback:
                    </h3>
                    {!hasError && (
                      <div className="flex space-x-2">
                        <button
                          onClick={() => readAloud(feedback)}
                          disabled={isSpeaking || isMuted}
                          className="p-2 bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white rounded-lg transition-colors"
                          title="Play feedback"
                        >
                          <Volume1Icon size={18} />
                        </button>
                        <button
                          onClick={stopSpeaking}
                          disabled={!isSpeaking}
                          className="p-2 bg-red-500 hover:bg-red-600 disabled:bg-gray-400 text-white rounded-lg transition-colors"
                          title="Stop speaking"
                        >
                          <Pause size={18} />
                        </button>
                      </div>
                    )}
                  </div>
                  {hasError ? (
                    <p className="text-red-800">{feedback}</p>
                  ) : (
                    <FeedbackFormatter content={feedback} />
                  )}
                </div>
              )}

              {/* Clear Button */}
              {(transcript || feedback || isListening) && (
                <button
                  onClick={clearAll}
                  className="flex bg-green-300 hover:bg-green-400 max-w-40 items-center justify-center gap-3 py-1 px-2 rounded-xl transition-colors"
                >
                  <RefreshCw size={18} />
                  <span>Start Over</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Custom Styles */}
      <style jsx>{`
        .italic-thought {
          font-style: italic;
          color: black;
          background: #f3e8ff;
          padding: 2px 6px;
          border-radius: 4px;
        }
        .styled-quote {
          font-style: italic;
          color: #1e40af;
          background: linear-gradient(135deg, #dbeafe, #e0f2fe);
          padding: 4px 12px;
          border-radius: 8px;
          border-left: 4px solid #0ea5e9;
          display: inline-block;
          margin: 4px 0;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
        .success-text {
          color: #16a34a;
          background: linear-gradient(135deg, #f0fdf4, #dcfce7);
          padding: 8px 12px;
          border-radius: 8px;
          border-left: 4px solid #22c55e;
          margin: 6px 0;
          font-weight: 500;
        }
        .suggestion-text {
          color: #d97706;
          background: linear-gradient(135deg, #fffbeb, #fef3c7);
          padding: 8px 12px;
          border-radius: 8px;
          border-left: 4px solid #f59e0b;
          margin: 6px 0;
          font-weight: 500;
        }
        .question-text {
          color: #9333ea;
          background: #f3e8ff;
          padding: 2px 8px;
          border-radius: 6px;
          font-weight: 600;
        }
        .numbered-point {
          margin: 8px 0;
          padding: 6px 0;
        }
        .point-number {
          font-weight: bold;
          color: #3b82f6;
          margin-right: 8px;
        }
        .bullet-point {
          color: #374151;
          margin: 4px 0;
          padding: 2px 0;
          padding-left: 12px;
        }
        .wisdom-block {
          background: linear-gradient(135deg, #f0f9ff, #e0f2fe);
          color: #0c4a6e;
          padding: 12px 16px;
          border-radius: 12px;
          border: 2px solid #0ea5e9;
          margin: 12px 0;
          font-style: italic;
          font-weight: 500;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .formatted-feedback-content {
          color: black;
          line-height: 1.7;
          font-size: 16px;
        }
        .highlight-yellow {
          background: linear-gradient(135deg, #fef3c7, #fde047);
          color: #92400e;
          padding: 0.1em 0.3em;
          border-radius: 4px;
          font-weight: 600;
          font-size: 1em;
          animation: pulse-gentle 3s ease-in-out infinite;
        }
        @keyframes pulse-gentle {
          0%,
          100% {
            opacity: 1;
          }
          50% {
            opacity: 0.8;
          }
        }

        /* Volume slider styling */
        input[type="range"] {
          -webkit-appearance: none;
          appearance: none;
        }
        input[type="range"]::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: #3b82f6;
          cursor: pointer;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }
        .highlight-blue {
          color: orange;
        }
        input[type="range"]::-moz-range-thumb {
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: #3b82f6;
          cursor: pointer;
          border: none;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }
        input[type="range"]::-webkit-slider-track {
          height: 8px;
          border-radius: 4px;
          background: #e5e7eb;
        }
        input[type="range"]::-moz-range-track {
          height: 8px;
          border-radius: 4px;
          background: #e5e7eb;
          border: none;
        }
        input[type="range"]:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
      `}</style>
    </div>
  );
};

export default VoiceAssistant;
