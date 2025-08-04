import React, { useState } from "react";
import {
  Send,
  RefreshCw,
  Volume2,
  Star,
  Target,
  BookOpen,
  CheckCircle2,
  ArrowRight,
  RefreshCcw,
  RefreshCcwDotIcon,
} from "lucide-react";

const AI = () => {
  const [level, setLevel] = useState("easy");
  const [context, setContext] = useState("");
  const [generatedSentence, setGeneratedSentence] = useState("");
  const [userTranslation, setUserTranslation] = useState("");
  const [feedback, setFeedback] = useState("");
  const [loading, setLoading] = useState(false);
  const [feedbackLoading, setFeedbackLoading] = useState(false);

  const API_KEY = "AIzaSyAXynXOYOILKRGuch9-Rrn0Vty6PDgRXqA";
  const MODEL = "gemini-2.5-flash";
  const URL = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${API_KEY}`;

  const generateSentence = async () => {
    console.log("🎯 Generate Sentence clicked");
    console.log("Level:", level, "Context:", context);
    if (!context.trim()) {
      alert("Please enter a context/topic first!");
      return;
    }
    setLoading(true);
    setGeneratedSentence("");
    setUserTranslation("");
    setFeedback("");
    const prompt = `Generate ONLY one meaningful Hindi sentence  about "${context}" with difficulty level: ${level} .A very good sentence.`;
    console.log("📤 Sending API request with prompt:", prompt);
    try {
      const res = await fetch(URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
        }),
      });
      console.log("📡 API Response status:", res.status);
      if (!res.ok) {
        throw new Error(`API Error: ${res.status} - ${res.statusText}`);
      }
      const data = await res.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
      console.log("✅ Generated sentence response:", text);
      if (text) {
        setGeneratedSentence(text);
        console.log("✨ Sentence generated successfully!");
      } else {
        console.error("❌ No text in API response");
        setGeneratedSentence("No response generated. Please try again.");
      }
    } catch (err) {
      console.error("💥 Generate sentence error:", err);
      setGeneratedSentence(`Error: ${err.message}`);
    } finally {
      setLoading(false);
      console.log("🏁 Generate sentence process completed");
    }
  };

  const getFeedback = async () => {
    console.log("🎯 Get Feedback clicked");
    console.log("User Translation:", userTranslation);
    console.log("Generated Sentence:", generatedSentence);
    if (!userTranslation.trim()) {
      alert("Please enter your translation first!");
      return;
    }
    if (!generatedSentence) {
      alert("Please generate a sentence first!");
      return;
    }
    setFeedbackLoading(true);
    setFeedback("");
    const prompt = `
Compare the user's translation with the original Hindi sentence. Give kind and clear and easy to understand feedback in this format, keeping it short and easy to read:

🌟 **Score:** [percent]   
🛠️ **Fixes:** [what needs improvement]  
💡 **Better Version:** [improved translation]  
📘 **Tip:** [1 helpful tip]  
💖 **Encouragement:** [motivational message in Hinglish]

Original:  
${generatedSentence}

User's Attempt:  
${userTranslation}
`;
    console.log("📤 Sending feedback API request");
    try {
      const res = await fetch(URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
        }),
      });
      console.log("📡 Feedback API Response status:", res.status);
      if (!res.ok) {
        throw new Error(`API Error: ${res.status} - ${res.statusText}`);
      }
      const data = await res.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
      console.log("✅ Feedback response:", text);
      if (text) {
        setFeedback(text);
        console.log("✨ Feedback generated successfully!");
      } else {
        console.error("❌ No feedback text in API response");
        setFeedback("No feedback generated. Please try again.");
      }
    } catch (err) {
      console.error("💥 Feedback error:", err);
      setFeedback(`Error: ${err.message}`);
    } finally {
      setFeedbackLoading(false);
      console.log("🏁 Feedback process completed");
    }
  };

const formatText = (text) => {
  if (!text) return "";

  return text
    // 🌟 Score: Highlight with green badge
    .replace(
      /(🌟 \*\*Score:\*\*.*?%)/g,
      '<span class="inline-block bg-green-100 text-green-800 px-3 py-1 rounded-full font-bold text-sm md:text-base shadow-sm">$1</span>'
    )
    // 🛠️ Fixes: Orange warning box
    .replace(
      /(🛠️ \*\*Fixes:\*\*.*)/g,
      '<div class="bg-orange-50 border-l-4 border-orange-400 text-orange-800 p-3 my-2 rounded-r-lg text-sm md:text-base"><strong></strong> $1</div>'
    )
    // 💡 Better Version: Blue info bubble
    .replace(
      /(💡 \*\*Better Version:\*\*.*)/g,
      '<div class="bg-blue-50 border-l-4 border-blue-400 text-blue-800 p-3 my-2 rounded-r-lg text-sm md:text-base"><strong></strong> $1</div>'
    )
    // 📘 Tip: Light purple tip box
    .replace(
      /(📘 \*\*Tip:\*\*.*)/g,
      '<div class="bg-purple-50 border-l-4 border-purple-400 text-purple-800 p-3 my-2 rounded-r-lg text-sm md:text-base"><strong></strong> $1</div>'
    )
    // 💖 Encouragement: Pink heart bubble
    .replace(
      /(💖 \*\*:\*\*.*)/g,
      '<div class="bg-pink-50 border-l-4 border-pink-400 text-pink-800 p-3 my-2 rounded-r-lg text-sm md:text-base font-medium"><strong>💖 You’re doing great!</strong> $1</div>'
    )
    // Remove "**" but keep content bold if needed
    .replace(/\*\*(.*?)\*\*/g, '<strong class="text-gray-800 bold">$1</strong>')
    // Convert line breaks to <br/>
    .replace(/\n/g, '<br/>')
    // Format list items with bullets
    .replace(/- /g, '• ');
};

  const resetAll = () => {
    console.log("🔄 Resetting all data");
    setContext("");
    setGeneratedSentence("");
    setUserTranslation("");
    setFeedback("");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50 px-4 py-6 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center space-x-2 bg-white p-3 rounded-2xl shadow-lg">
            <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-2 rounded-full">
              <BookOpen size={20} className="text-white" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Let's Solve Some Sentences
            </h1>
          </div>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-2xl shadow-xl p-5 sm:p-6 space-y-6">
          {/* Step 1: Level Selector */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2 mb-2">
              <Target size={16} className="text-purple-600" />
              <h2 className="text-lg font-bold text-gray-800">
                Step 1: Choose Difficulty
              </h2>
            </div>
            <div className="grid grid-cols-3 gap-3 sm:gap-4">
              {[
                {
                  value: "easy around 10 words",
                  label: "Easy",
                  emoji: "🟢",
                  desc: "Simple sentences",
                },
                {
                  value: "medium around 15 words",
                  label: "Medium",
                  emoji: "🟡",
                  desc: "Moderate complexity",
                },
                {
                  value: "hard around 20 words",
                  label: "Hard",
                  emoji: "🔴",
                  desc: "Complex grammar",
                },
              ].map((option) => (
                <button
                  key={option.value}
                  onClick={() => {
                    setLevel(option.value);
                    console.log("🎯 Level changed to:", option.value);
                  }}
                  className={`p-3 rounded-lg border transition-all duration-200 hover:scale-105 text-xs sm:text-sm ${
                    level === option.value
                      ? "border-purple-500 bg-purple-50 shadow-md"
                      : "border-gray-200 hover:border-purple-300"
                  }`}
                >
                  <div className="text-lg">{option.emoji}</div>
                  <div className="font-semibold text-gray-800">
                    {option.label}
                  </div>
                  <div className="text-gray-600">{option.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Step 2: Context Input */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2 mb-2">
              <ArrowRight size={18} className="text-purple-600" />
              <h2 className="text-lg font-bold text-gray-800">
                Step 2: Enter Topic
              </h2>
            </div>
            <input
              type="text"
              value={context}
              onChange={(e) => {
                setContext(e.target.value);
                console.log("📝 Context updated:", e.target.value);
              }}
              placeholder="e.g., family, food, travel..."
              className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all duration-200"
            />
          </div>

          {/* Step 3: Generated Sentence */}
          <div className="space-y-3">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <CheckCircle2 size={18} className="text-purple-600" />
                <h2 className="text-lg font-bold text-gray-800">
                  Step 3: Hindi Sentence
                </h2>
              </div>
              <button
                onClick={generateSentence}
                disabled={loading || !context.trim()}
                className="bg-gradient-to-r from-purple-500 to-pink-500 text-white p-2 rounded-full hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105 shadow"
                title="Generate Hindi Sentence"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                ) : (
                  <RefreshCw size={18} />
                )}
              </button>
            </div>
            <div className="bg-gradient-to-br from-blue-50 to-purple-50 p-4 rounded-lg border border-blue-100 min-h-[80px] flex items-center">
              {generatedSentence ? (
                <div
                  className="text-gray-800 leading-relaxed text-sm sm:text-base"
                  dangerouslySetInnerHTML={{
                    __html: formatText(generatedSentence),
                  }}
                />
              ) : (
                <p className="text-gray-500 text-center w-full text-sm">
                  Click the refresh button to generate a Hindi sentence
                </p>
              )}
            </div>
          </div>

          {/* Step 4: User Translation */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2 mb-2">
              <Send size={18} className="text-purple-600" />
              <h2 className="text-lg font-bold text-gray-800">
                Step 4: Your Translation
              </h2>
            </div>
            <textarea
              value={userTranslation}
              onChange={(e) => {
                setUserTranslation(e.target.value);
                console.log("✍️ User translation updated:", e.target.value);
              }}
              placeholder="Type your English translation here..."
              rows={3}
              className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all duration-200 resize-none"
            />
            <button
              onClick={getFeedback}
              disabled={
                feedbackLoading || !userTranslation.trim() || !generatedSentence
              }
              className="w-full bg-gradient-to-r from-green-500 to-teal-500 text-white py-3 px-4 rounded-lg font-medium flex items-center justify-center space-x-2 hover:from-green-600 hover:to-teal-600 disabled:opacity-70 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-100 shadow"
            >
              {feedbackLoading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span className="text-sm">Analyzing...</span>
                </>
              ) : (
                <>
                  <Star size={16} />
                  <span className="text-sm sm:text-base">Get Feedback</span>
                </>
              )}
            </button>
          </div>

          {/* Step 5: Feedback */}
          {feedback && (
            <div className="space-y-3">
              <div className="flex items-center space-x-2 mb-2">
                <Star size={18} className="text-yellow-500" />
                <h2 className="text-lg font-bold text-gray-800">
                  Step 5: Feedback
                </h2>
              </div>
              <div className="bg-gradient-to-br from-green-50 to-blue-50 p-4 rounded-lg border border-green-100">
                <div
                  className="prose prose-sm sm:prose-base max-w-none text-gray-800 leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: formatText(feedback) }}
                />
              </div>
            </div>
          )}

          {/* Reset Button */}
          <div className="pt-2 text-center ">
            <button
              onClick={resetAll}
              className="bg-gray-500 hover:bg-gray-600 text-white align-middle justify-center gap-2 px-6 py-2 rounded-lg text-sm font-medium transition-all duration-200 transform hover:scale-105"
            >
             <RefreshCcwDotIcon/>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};


export default AI;
