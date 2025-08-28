import React, { useState, useEffect } from 'react';
import { RefreshCw, Check, Lightbulb, Send } from 'lucide-react';

const FillBlankGame = () => {
  const [originalSentence, setOriginalSentence] = useState('');
  const [sentenceWithBlanks, setSentenceWithBlanks] = useState('');
  const [wordsData, setWordsData] = useState([]);
  const [userAnswers, setUserAnswers] = useState([]);
  const [gameState, setGameState] = useState('ready'); // 'ready', 'loading', 'playing', 'completed'
  const [score, setScore] = useState({ correct: 0, total: 0 });
  const [feedback, setFeedback] = useState([]);

  // API Configuration
  const API_KEY = import.meta.env.VITE_API_URL_GEMINI;
  const MODEL = "gemini-2.5-flash-lite";
  const URL = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${API_KEY}`;

  // Random keywords for unique prompts
  const randomKeywords = [
    // Animals & Nature
    "🐶", "🐱", "🌳", "🌸", "🦋", "🐝", "🌊", "🌞", "🌙", "⭐",
    "🦊", "🐻", "🌻", "🌈", "🍀", "🌺", "🦅", "🐢", "🌿", "🌵",
    
    // Activities & Hobbies
    "⚽", "🏀", "🎨", "🎵", "📚", "🍳", "🚲", "✈️", "📷", "🎮",
    "🏊", "🧘", "🎯", "🎪", "🎭", "🛶", "🏕️", "🎿", "🏖️", "🎢",
    
    // Food & Drinks
    "🍕", "🍎", "☕", "🍰", "🥗", "🍜", "🧀", "🍓", "🥑", "🍫",
    "🍉", "🥖", "🍯", "🥤", "🍪", "🥞", "🍔", "🥨", "🍦", "🥝",
    
    // Places & Travel
    "🏠", "🏫", "🏥", "🏪", "🌉", "🗽", "🏰", "⛱️", "🏔️", "🌋",
    "🎡", "🎠", "🏟️", "🗿", "🎢", "🌃", "🏙️", "🚢", "🏝️", "🎪",
    
    // Technology & Modern Life
    "📱", "💻", "🚗", "🤖", "🎬", "📺", "🎧", "⌚", "🔋", "🚀",
    "💡", "📡", "🔌", "🖥️", "📹", "🎙️", "💾", "⚙️", "🔧", "🛸",
    
    // Weather & Seasons
    "☀️", "🌧️", "❄️", "🌪️", "⛅", "🌈", "⚡", "🌨️", "🌤️", "🌦️",
    
    // Emotions & Expressions
    "😊", "😎", "🥳", "😴", "🤔", "😇", "🤗", "😍", "🤩", "😂"
  ];

  // Get random keyword for prompt variety
  const getRandomKeyword = () => {
    return randomKeywords[Math.floor(Math.random() * randomKeywords.length)];
  };

  // Call Gemini AI to generate sentence with extracted words
  const generateNewSentence = async () => {
    setGameState('loading');
    
    const randomKeyword = getRandomKeyword();
    
    const prompt = `Topic: ${randomKeyword}

Make 1 sentence about the topic.  
Pick 3 words (noun/verb/adj).  
For each: give word + 3 similar options.  

Format:  
Sentence: [...]  
Word1: x | a | b | c  
Word2: y | d | e | f  
Word3: z | g | h | i
`;

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

      console.log("AI Response:", rawText);
      
      // Parse the AI response
      const lines = rawText.split('\n').map(line => line.trim()).filter(line => line);
      
      let sentence = '';
      const extractedWords = [];
      
      // Find sentence
      const sentenceLine = lines.find(line => line.toLowerCase().startsWith('sentence:'));
      if (sentenceLine) {
        sentence = sentenceLine.replace(/sentence:\s*/i, '').trim();
      }
      
      // Find word lines
      const wordLines = lines.filter(line => /^word\d+:/i.test(line));
      
      wordLines.forEach((wordLine, index) => {
        const cleanLine = wordLine.replace(/^word\d+:\s*/i, '');
        const parts = cleanLine.split('|').map(part => part.trim());
        
        if (parts.length >= 4) {
          const correctWord = parts[0];
          const options = [correctWord, ...parts.slice(1, 4)];
          
          // Shuffle options so correct answer isn't always first
          const shuffledOptions = [...options].sort(() => Math.random() - 0.5);
          
          extractedWords.push({
            originalWord: correctWord,
            position: index + 1,
            options: shuffledOptions,
            type: index === 0 ? 'adjective' : index === 1 ? 'verb' : 'noun' // Simple type assignment
          });
        }
      });
      
      // Fallback if parsing fails
      if (!sentence || extractedWords.length === 0) {
        throw new Error("Failed to parse AI response");
      }
      
      setOriginalSentence(sentence);
      setWordsData(extractedWords);
      
      // Create sentence with blanks
      let sentenceWithBlanks = sentence;
      extractedWords.forEach((wordData, index) => {
        const regex = new RegExp(`\\b${wordData.originalWord}\\b`, 'i');
        sentenceWithBlanks = sentenceWithBlanks.replace(regex, `____${index + 1}____`);
      });
      
      setSentenceWithBlanks(sentenceWithBlanks);
      setUserAnswers(new Array(extractedWords.length).fill(''));
      setFeedback([]);
      setGameState('playing');
      
    } catch (error) {
      console.error("Error generating content:", error);
      
      // Fallback content
      setOriginalSentence("The brave explorer discovered hidden treasures in the mysterious cave.");
      setWordsData([
        {
          originalWord: "brave",
          position: 1,
          options: ["brave", "smart", "young", "tall"],
          type: "adjective"
        },
        {
          originalWord: "discovered",
          position: 2,
          options: ["found", "discovered", "saw", "bought"],
          type: "verb"
        },
        {
          originalWord: "mysterious",
          position: 3,
          options: ["dark", "mysterious", "big", "cold"],
          type: "adjective"
        }
      ]);
      setSentenceWithBlanks("The ____1____ explorer ____2____ hidden treasures in the ____3____ cave.");
      setUserAnswers(['', '', '']);
      setFeedback([]);
      setGameState('playing');
    }
  };
  
  // Handle word selection
  const handleWordSelection = (blankIndex, selectedWord) => {
    const newAnswers = [...userAnswers];
    newAnswers[blankIndex] = selectedWord;
    setUserAnswers(newAnswers);
  };
  
  // Check answers
  const checkAnswers = () => {
    const newFeedback = userAnswers.map((answer, index) => {
      const wordData = wordsData[index];
      const isCorrect = answer === wordData.originalWord;
      return {
        userAnswer: answer,
        correctAnswer: wordData.originalWord,
        wordType: wordData.type,
        isCorrect,
        allOptions: wordData.options
      };
    });
    
    setFeedback(newFeedback);
    
    const correctCount = newFeedback.filter(f => f.isCorrect).length;
    setScore(prev => ({
      correct: prev.correct + correctCount,
      total: prev.total + wordsData.length
    }));
    
    setGameState('completed');
  };
  
  // Render sentence with blanks
  const renderSentenceWithBlanks = () => {
    let displaySentence = sentenceWithBlanks;
    
    wordsData.forEach((wordData, index) => {
      const selectedWord = userAnswers[index];
      const placeholder = `____${wordData.position}____`;
      const replacement = selectedWord ? 
        `<span class="inline-block mx-1 px-3 py-1  text-blue-800 rounded-lg font-semibold">${selectedWord}</span>` :
        `<span class="inline-block mx-1 px-3 py-1   rounded-lg border-2 border-dashed">blank ${wordData.position}</span>`;
      
      displaySentence = displaySentence.replace(placeholder, replacement);
    });
    
    return <div 
      className="text-lg leading-relaxed" 
      dangerouslySetInnerHTML={{ __html: displaySentence }}
    />;
  };
  
  // Initialize game
  useEffect(() => {
    generateNewSentence();
  }, []);
  
  return (
    <div className="min-h-screen  p-4">
      <div className="max-w-5xl mx-auto">
        <div className="space-y-6 py-8">
          {/* Header */}
          <div className="text-center space-y-2">
            <h1 className="text-4xl font-bold ">
              🤖 AI Fill in the Blanks
            </h1>
            <p className="text-lg  max-w-md mx-auto">
              AI generates unique sentences every time - pick the correct words!
            </p>
          </div>
          
          {/* Score */}
          <div className="flex justify-center gap-4 flex-wrap">
            <div className=" text-green-800 px-4 py-2 rounded-lg font-semibold">
              ✅ Correct: {score.correct}
            </div>
            <div className=" text-blue-800 px-4 py-2 rounded-lg font-semibold">
              📊 Total: {score.total}
            </div>
            {score.total > 0 && (
              <div className=" text-purple-800 px-4 py-2 rounded-lg font-semibold">
                🎯 Accuracy: {Math.round((score.correct / score.total) * 100)}%
              </div>
            )}
          </div>
          
          {/* Main Game Area */}
          <div className=" rounded-2xl shadow-xl p-6 space-y-6">
            {gameState === 'loading' && (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                <p className="">🤖 Gemini AI is generating a unique sentence...</p>
                <p className="text-sm  mt-2">Using random topic for variety!</p>
              </div>
            )}
            
            {gameState === 'playing' && (
              <div className="space-y-6">
                {/* Sentence Display */}
                <div className="text-center">
                  <h2 className="text-xl font-semibold  mb-4">
                    Complete the sentence by selecting the correct words:
                  </h2>
                  <div className=" p-6 rounded-xl">
                    {renderSentenceWithBlanks()}
                  </div>
                </div>
                
                {/* Word Options */}
                <div className="space-y-6">
                  {wordsData.map((wordData, blankIndex) => (
                    <div key={blankIndex} className=" p-4 rounded-xl">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="bg-blue-500 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm">
                          {blankIndex + 1}
                        </span>
                        <h3 className="text-lg font-semibold ">
                          Choose the correct word:
                        </h3>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {wordData.options.map((option, optionIndex) => (
                          <button
                            key={optionIndex}
                            onClick={() => handleWordSelection(blankIndex, option)}
                            className={`p-3 rounded-lg border-2 transition-all font-medium ${
                              userAnswers[blankIndex] === option
                                ? 'bg-blue-500  border-blue-500'
                                : ' hover:bg-blue-300 border-gray-500 hover:border-blue-300 '
                            }`}
                          >
                            {option}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* Action Buttons */}
                <div className="flex justify-center gap-4">
                  <button
                    onClick={checkAnswers}
                    disabled={userAnswers.some(answer => answer === '')}
                    className="bg-green-500 hover:bg-green-600 disabled:bg-gray-500 disabled:cursor-not-allowed  px-6 py-3 rounded-lg font-semibold flex items-center gap-2 transition-colors"
                  >
                    <Check size={20} />
                    Check My Answers
                  </button>
                  
                  <button
                    onClick={generateNewSentence}
                    className="bg-purple-500 hover:bg-purple-600  px-6 py-3 rounded-lg font-semibold flex items-center gap-2 transition-colors"
                  >
                    <RefreshCw size={20} />
                    Generate New Sentence
                  </button>
                </div>
              </div>
            )}
            
            {gameState === 'completed' && (
              <div className="space-y-6">
                {/* Original sentence */}
                <div className="text-center">
                  <h2 className="text-xl font-semibold  mb-4">
                    ✅ Correct sentence:
                  </h2>
                  <div className="p-4 rounded-xl">
                    <p className="text-lg text-green-800 font-medium">
                      {originalSentence}
                    </p>
                  </div>
                </div>
                
                {/* Detailed Results */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold  text-center">
                    📋 Your Results:
                  </h3>
                  <div className="grid gap-4">
                    {feedback.map((item, index) => (
                      <div
                        key={index}
                        className={`p-4 rounded-lg border-2 ${
                          item.isCorrect
                            ? ' border-green-200'
                            : ' border-red-200'
                        }`}
                      >
                        <div className="flex items-center justify-between flex-wrap gap-2">
                          <div className="flex items-center gap-3">
                            <span className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                              item.isCorrect ? 'bg-green-500 ' : 'bg-red-500 '
                            }`}>
                              {index + 1}
                            </span>
                            <div>
                              <span className="font-medium ">
                                Your choice:
                              </span>
                              <span className={`ml-2 font-semibold ${item.isCorrect ? 'text-green-700' : 'text-red-700'}`}>
                                "{item.userAnswer}"
                              </span>
                            </div>
                          </div>
                          {!item.isCorrect && (
                            <div className="text-green-600 font-medium">
                              ✓ Correct: "{item.correctAnswer}"
                            </div>
                          )}
                        </div>
                        {!item.isCorrect && (
                          <div className="mt-2 text-sm ">
                            <span className="font-medium">All options were:</span> {item.allOptions.join(', ')}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Summary */}
                <div className="text-center">
                  <div className={`p-4 rounded-lg ${
                    feedback.filter(f => f.isCorrect).length === feedback.length
                      ? ' text-green-800'
                      : ' text-blue-800'
                  }`}>
                    <p className="text-lg font-semibold">
                      {feedback.filter(f => f.isCorrect).length === feedback.length
                        ? '🎉 Perfect Score! All answers correct!'
                        : `🎯 You got ${feedback.filter(f => f.isCorrect).length} out of ${feedback.length} correct!`
                      }
                    </p>
                  </div>
                </div>
                
                <div className="flex justify-center">
                  <button
                    onClick={generateNewSentence}
                    className="bg-purple-500 hover:bg-purple-600  px-8 py-3 rounded-lg font-semibold flex items-center gap-2 transition-colors"
                  >
                    <RefreshCw size={20} />
                    Try Another Sentence
                  </button>
                </div>
              </div>
            )}
          </div>
          
          {/* Instructions */}
          <div className="bg-opacity-70 rounded-xl p-6">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Lightbulb className="text-yellow-500" size={24} />
              <h3 className="text-lg font-semibold ">How It Works</h3>
            </div>
            <div className=" text-center space-y-2">
              <p>🤖 <strong>AI Generation:</strong> Gemini AI creates unique sentences using random topics</p>
              <p>🎯 <strong>Smart Extraction:</strong> AI extracts key words and provides similar alternatives</p>
              <p>🤔 <strong>Your Challenge:</strong> Pick the correct words from challenging options</p>
              <p>📚 <strong>Always Fresh:</strong> Every sentence is unique - never the same twice!</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FillBlankGame;