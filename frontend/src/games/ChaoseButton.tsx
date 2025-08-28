import React, { useState } from 'react';
import { RefreshCw, Zap, Star, Target } from 'lucide-react';

const RandomChaosGame = () => {
  const [currentContent, setCurrentContent] = useState('');
  const [contentType, setContentType] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [tapCount, setTapCount] = useState(0);
  const [streak, setStreak] = useState(0);
  const [lastTapTime, setLastTapTime] = useState(Date.now());

  // API Configuration
  const API_KEY = import.meta.env.VITE_API_URL_GEMINI;
  const MODEL = "gemini-2.5-flash-lite";
  const URL = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${API_KEY}`;

  // Simple random keywords for variety
  const randomKeywords = [
    // Simple topics everyone can understand
    "dogs", "cats", "food", "music", "books", "movies", "sports", "travel",
    "friendship", "family", "school", "work", "weather", "colors", "games",
    "phones", "computers", "cars", "houses", "gardens", "cooking", "dancing",
    "swimming", "reading", "writing", "painting", "singing", "laughing",
    "sleeping", "walking", "running", "jumping", "playing", "learning",
    "shopping", "cleaning", "helping", "sharing", "caring", "loving"
  ];

  const getRandomKeyword = () => {
    return randomKeywords[Math.floor(Math.random() * randomKeywords.length)];
  };

  // Content type configurations
  const contentTypes = [
    {
      id: 'fact',
      name: 'Fun Fact',
      emoji: '🎯',
      prompt: (keyword) => `Topic: ${keyword}
      
Give me one simple, interesting fact about ${keyword} that anyone can easily understand.
Make it short, clear, and educational.
No complex words or confusing explanations.
Just write the fact directly, nothing else.`
    },
    {
      id: 'tip',
      name: 'Quick Tip',
      emoji: '💡',
      prompt: (keyword) => `Topic: ${keyword}
      
Give me one simple, practical tip related to ${keyword} that people can actually use.
Make it clear and easy to understand.
Write it as helpful advice in simple words.
Just write the tip directly, nothing else.`
    },
    {
      id: 'question',
      name: 'Think About It',
      emoji: '🤔',
      prompt: (keyword) => `Topic: ${keyword}
      
Give me one interesting question about ${keyword} that makes people think.
Make it simple but thought-provoking.
Something anyone can understand and consider.
Just write the question directly, nothing else.`
    },
    {
      id: 'joke',
      name: 'Light Humor',
      emoji: '😊',
      prompt: (keyword) => `Topic: ${keyword}
      
Give me one clean, simple joke or funny observation about ${keyword}.
Make it family-friendly and easy to understand.
Nothing offensive or too complex.
Just write the joke directly, nothing else.`
    }
  ];

  // Generate content using Gemini AI
  const generateChaos = async () => {
    if (isLoading) return;
    
    setIsLoading(true);
    
    // Update streak logic
    const timeSinceLastTap = Date.now() - lastTapTime;
    if (timeSinceLastTap < 5000) {
      setStreak(prev => prev + 1);
    } else {
      setStreak(1);
    }
    setLastTapTime(Date.now());

    const randomKeyword = getRandomKeyword();
    const randomContentType = contentTypes[Math.floor(Math.random() * contentTypes.length)];
    const prompt = randomContentType.prompt(randomKeyword);

    try {
      const response = await fetch(URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
        }),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!rawText) {
        throw new Error("No content in response");
      }

      // Clean up the response
      const cleanContent = rawText.trim()
        .replace(/^(Fact:|Tip:|Question:|Joke:)\s*/i, '')
        .replace(/\*\*/g, '') // Remove markdown bold
        .replace(/\*/g, '')   // Remove markdown italic
        .trim();

      setCurrentContent(cleanContent);
      setContentType(randomContentType.id);
      setTapCount(prev => prev + 1);
      
    } catch (error) {
      console.error("Error generating content:", error);
      
      // Simple fallback content
      const fallbacks = {
        fact: "Did you know that honey never spoils? Archaeologists have found edible honey in ancient Egyptian tombs!",
        tip: "When learning something new, teach it to someone else. Teaching helps you remember better.",
        question: "If you could have dinner with anyone in history, who would it be and why?",
        joke: "Why don't scientists trust atoms? Because they make up everything!"
      };
      
      const fallbackType = contentTypes[Math.floor(Math.random() * contentTypes.length)];
      setCurrentContent(fallbacks[fallbackType.id]);
      setContentType(fallbackType.id);
      setTapCount(prev => prev + 1);
    }
    
    setIsLoading(false);
  };

  const getContentTypeInfo = (type) => {
    return contentTypes.find(ct => ct.id === type) || contentTypes[0];
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-4">
      <div className="max-w-2xl mx-auto">
        <div className="flex flex-col items-center justify-center min-h-screen space-y-8 py-8">
          
          {/* Header */}
          <div className="text-center space-y-2">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-800 animate-pulse">
              🎲 Random Discovery
            </h1>
            <p className="text-lg text-gray-600 max-w-md">
              Tap the button for instant learning! Get facts, tips, questions, and light humor!
            </p>
          </div>
          
          {/* Stats */}
          <div className="flex gap-4 flex-wrap justify-center">
            <div className="bg-yellow-100 text-yellow-800 px-4 py-2 rounded-lg font-semibold flex items-center gap-2">
              <Target size={16} />
              <span>Taps: {tapCount}</span>
            </div>
            <div className="bg-red-100 text-red-800 px-4 py-2 rounded-lg font-semibold flex items-center gap-2">
              <Zap size={16} />
              <span>Streak: {streak}</span>
            </div>
          </div>
          
          {/* Main Button */}
          <div className="text-center">
            <button
              onClick={generateChaos}
              disabled={isLoading}
              className={`
                w-48 h-48 rounded-full text-white font-bold text-xl
                bg-gradient-to-br from-blue-500 to-purple-600
                hover:from-blue-600 hover:to-purple-700
                active:scale-95 transform transition-all duration-200
                shadow-lg hover:shadow-xl
                disabled:opacity-70 disabled:cursor-not-allowed
                flex flex-col items-center justify-center space-y-2
              `}
            >
              {isLoading ? (
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
              ) : (
                <>
                  <div className="text-5xl">🎯</div>
                  <div className="text-lg">TAP FOR</div>
                  <div className="text-xl">DISCOVERY!</div>
                </>
              )}
            </button>
          </div>
          
          {/* Content Display */}
          {currentContent && (
            <div className="w-full max-w-lg transform transition-all duration-300 scale-100">
              <div className="bg-white rounded-2xl shadow-xl p-6 border-2 border-blue-100">
                <div className="text-center space-y-4">
                  <div className="inline-block bg-blue-100 text-blue-800 px-4 py-2 rounded-lg font-semibold">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{getContentTypeInfo(contentType).emoji}</span>
                      <span>{getContentTypeInfo(contentType).name}</span>
                    </div>
                  </div>
                  
                  <p className="text-gray-700 text-lg leading-relaxed">
                    {currentContent}
                  </p>
                </div>
              </div>
            </div>
          )}
          
          {/* Encouraging Messages */}
          {tapCount > 0 && (
            <div className="text-center space-y-2">
              <p className="text-gray-600 text-sm">
                {tapCount < 3 ? "Great start! Tap again to learn more!" :
                 tapCount < 10 ? "You're on a learning streak! Keep going!" :
                 tapCount < 25 ? "Wow! You're a learning machine!" :
                 "Amazing! You're officially a discovery master!"}
              </p>
              
              {streak > 2 && (
                <p className="text-orange-600 text-sm font-bold">
                  🔥 {streak} in a row! You're on fire!
                </p>
              )}
            </div>
          )}
          
          {/* Instructions */}
          <div className="bg-white bg-opacity-80 rounded-xl p-6 w-full max-w-md">
            <div className="text-center space-y-3">
              <div className="flex items-center justify-center gap-2">
                <Star className="text-yellow-500" size={24} />
                <h3 className="text-lg font-bold text-gray-700">How It Works</h3>
              </div>
              <div className="text-gray-600 text-sm space-y-2">
                <p>🎯 Tap the button for random discoveries</p>
                <p>💡 Get simple facts, tips, questions & jokes</p>
                <p>⚡ Tap quickly to build your streak</p>
                <p>🎲 Every tap brings something new to learn!</p>
              </div>
            </div>
          </div>
          
          {/* Refresh Button */}
          {!isLoading && tapCount > 5 && (
            <button
              onClick={() => {
                setCurrentContent('');
                setTapCount(0);
                setStreak(0);
              }}
              className="text-gray-500 hover:text-gray-700 flex items-center gap-2 text-sm transition-colors"
            >
              <RefreshCw size={16} />
              Reset Stats
            </button>
          )}
          
        </div>
      </div>
    </div>
  );
};

export default RandomChaosGame;