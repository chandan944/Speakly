import React, { useState, useEffect } from 'react';
import { RefreshCw, Check, Lightbulb } from 'lucide-react';

const FillBlankGame = () => {
  const [originalSentence, setOriginalSentence] = useState('');
  const [sentenceWithBlanks, setSentenceWithBlanks] = useState('');
  const [wordsData, setWordsData] = useState([]);
  const [userAnswers, setUserAnswers] = useState([]);
  const [gameState, setGameState] = useState('ready'); // 'ready', 'loading', 'playing', 'completed'
  const [score, setScore] = useState({ correct: 0, total: 0 });
  const [feedback, setFeedback] = useState([]);

  // For demo purposes - you'll need to add your actual API key
  const API_KEY = import.meta.env.VITE_API_URL_GEMINI; // Replace with your actual key
  const MODEL = "gemini-1.5-flash";
  const URL = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${API_KEY}`;

  // Random keywords for unique prompts
  const randomKeywords = [
    // Animals & Nature
    "dog", "cat", "tree", "flower", "butterfly", "bee", "ocean", "sun", "moon", "star",
    "fox", "bear", "sunflower", "rainbow", "clover", "bird", "eagle", "turtle", "plant", "cactus",
    
    // Activities & Hobbies
    "soccer", "basketball", "art", "music", "books", "cooking", "bicycle", "airplane", "photography", "gaming",
    "swimming", "meditation", "archery", "circus", "theater", "canoe", "camping", "skiing", "beach", "rollercoaster",
    
    // Food & Drinks
    "pizza", "apple", "coffee", "cake", "salad", "soup", "cheese", "strawberry", "avocado", "chocolate",
    "watermelon", "bread", "honey", "smoothie", "cookie", "pancake", "burger", "pretzel", "ice cream", "kiwi",
    
    // Places & Travel
    "house", "school", "hospital", "store", "bridge", "statue", "castle", "beach", "mountain", "volcano",
    "ferris wheel", "carousel", "stadium", "monument", "city", "ship", "island", "carnival",
    
    // Technology & Modern Life
    "phone", "computer", "car", "robot", "movie", "television", "headphones", "watch", "battery", "rocket",
    "lightbulb", "antenna", "charger", "monitor", "camera", "microphone", "disk", "gear", "wrench", "spaceship",
    
    // Weather & Seasons
    "sunny", "rainy", "snowy", "windy", "cloudy", "stormy", "lightning", "winter", "summer", "spring",
    
    // Emotions & Expressions
    "happy", "cool", "excited", "sleepy", "thoughtful", "peaceful", "friendly", "loving", "amazing", "funny"
  ];

  // Get random keyword for prompt variety
  const getRandomKeyword = () => {
    return randomKeywords[Math.floor(Math.random() * randomKeywords.length)];
  };

  // Fallback sentences for when API fails
  const fallbackData = [
    {
      sentence: "The brave explorer discovered hidden treasures in the mysterious cave.",
      words: [
        { original: "brave", options: ["brave", "smart", "young", "tall"] },
        { original: "discovered", options: ["discovered", "found", "saw", "bought"] },
        { original: "mysterious", options: ["mysterious", "dark", "big", "cold"] }
      ]
    },
    {
      sentence: "The beautiful butterfly landed gently on the colorful flower.",
      words: [
        { original: "beautiful", options: ["beautiful", "small", "fast", "loud"] },
        { original: "gently", options: ["gently", "quickly", "roughly", "loudly"] },
        { original: "colorful", options: ["colorful", "tall", "heavy", "round"] }
      ]
    },
    {
      sentence: "The clever student solved the difficult problem very quickly.",
      words: [
        { original: "clever", options: ["clever", "tall", "hungry", "sleepy"] },
        { original: "difficult", options: ["difficult", "easy", "red", "sweet"] },
        { original: "quickly", options: ["quickly", "slowly", "loudly", "sadly"] }
      ]
    }
  ];

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
        headers: { 
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [{ 
            parts: [{ text: prompt }] 
          }],
          generationConfig: {
            temperature: 0.9,
            maxOutputTokens: 200,
          }
        }),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status} - ${response.statusText}`);
      }

      const data = await response.json();
      const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!rawText) {
        throw new Error("No content in response");
      }

      console.log("AI Response:", rawText);
      
      // Parse the AI response
      const lines = rawText.split('\n').map(line => line.trim()).filter(line => line.length > 0);
      
      let sentence = '';
      const extractedWords = [];
      
      // Find sentence
      for (const line of lines) {
        if (line.toLowerCase().startsWith('sentence:')) {
          sentence = line.replace(/sentence:\s*/i, '').trim();
          // Remove quotes if present
          sentence = sentence.replace(/^["']|["']$/g, '');
          break;
        }
      }
      
      // Find word lines
      const wordLines = lines.filter(line => /^word\d+:/i.test(line));
      
      for (let i = 0; i < wordLines.length && i < 3; i++) {
        const wordLine = wordLines[i];
        const cleanLine = wordLine.replace(/^word\d+:\s*/i, '');
        const parts = cleanLine.split('|').map(part => part.trim());
        
        if (parts.length >= 4) {
          const correctWord = parts[0];
          const alternatives = parts.slice(1, 4);
          
          // Verify the word exists in the sentence (case insensitive)
          const wordExists = new RegExp(`\\b${correctWord}\\b`, 'i').test(sentence);
          
          if (wordExists) {
            const allOptions = [correctWord, ...alternatives];
            // Shuffle options so correct answer isn't always first
            const shuffledOptions = [...allOptions].sort(() => Math.random() - 0.5);
            
            extractedWords.push({
              originalWord: correctWord,
              position: i + 1,
              options: shuffledOptions,
              type: i === 0 ? 'adjective' : i === 1 ? 'verb' : 'noun'
            });
          }
        }
      }
      
      // Validate parsing results
      if (!sentence || extractedWords.length === 0) {
        throw new Error("Failed to parse AI response properly");
      }
      
      // Setup game with AI-generated content
      setupGame(sentence, extractedWords);
      
    } catch (error) {
      console.error("Error generating content:", error);
      
      // Use fallback content
      const randomFallback = fallbackData[Math.floor(Math.random() * fallbackData.length)];
      const processedWords = randomFallback.words.map((word, index) => ({
        originalWord: word.original,
        position: index + 1,
        options: [...word.options].sort(() => Math.random() - 0.5), // Shuffle options
        type: index === 0 ? 'adjective' : index === 1 ? 'verb' : 'noun'
      }));
      
      setupGame(randomFallback.sentence, processedWords);
    }
  };
  
  // Setup game state with sentence and words
  const setupGame = (sentence, words) => {
    setOriginalSentence(sentence);
    setWordsData(words);
    
    // Create sentence with blanks
    let sentenceWithBlanks = sentence;
    words.forEach((wordData, index) => {
      const regex = new RegExp(`\\b${wordData.originalWord}\\b`, 'i');
      sentenceWithBlanks = sentenceWithBlanks.replace(regex, `[BLANK_${index + 1}]`);
    });
    
    setSentenceWithBlanks(sentenceWithBlanks);
    setUserAnswers(new Array(words.length).fill(''));
    setFeedback([]);
    setGameState('playing');
  };
  
  // Handle word selection
  const handleWordSelection = (blankIndex, selectedWord) => {
    if (blankIndex < 0 || blankIndex >= userAnswers.length) return;
    
    const newAnswers = [...userAnswers];
    newAnswers[blankIndex] = selectedWord;
    setUserAnswers(newAnswers);
  };
  
  // Check answers
  const checkAnswers = () => {
    const newFeedback = userAnswers.map((answer, index) => {
      const wordData = wordsData[index];
      if (!wordData) return null;
      
      const isCorrect = answer.toLowerCase() === wordData.originalWord.toLowerCase();
      return {
        userAnswer: answer,
        correctAnswer: wordData.originalWord,
        wordType: wordData.type,
        isCorrect,
        allOptions: wordData.options
      };
    }).filter(item => item !== null);
    
    setFeedback(newFeedback);
    
    const correctCount = newFeedback.filter(f => f.isCorrect).length;
    setScore(prev => ({
      correct: prev.correct + correctCount,
      total: prev.total + newFeedback.length
    }));
    
    setGameState('completed');
  };
  
  // Render sentence with blanks
  const renderSentenceWithBlanks = () => {
    if (!sentenceWithBlanks) return null;
    
    let displaySentence = sentenceWithBlanks;
    
    wordsData.forEach((wordData, index) => {
      const selectedWord = userAnswers[index];
      const placeholder = `[BLANK_${wordData.position}]`;
      
      if (selectedWord) {
        displaySentence = displaySentence.replace(
          placeholder, 
          `<span class="inline-block mx-1 px-3 py-1  text-blue-800 rounded-lg font-semibold">${selectedWord}</span>`
        );
      } else {
        displaySentence = displaySentence.replace(
          placeholder, 
          `<span class="inline-block mx-1 px-3 py-1  rounded-lg border-2 border-dashed border-300">blank ${wordData.position}</span>`
        );
      }
    });
    
    return (
      <div 
        className="text-lg leading-relaxed" 
        dangerouslySetInnerHTML={{ __html: displaySentence }}
      />
    );
  };
  
  // Initialize game
  useEffect(() => {
    generateNewSentence();
  }, []);
  
  // Check if all answers are filled
  const allAnswersFilled = userAnswers.every(answer => answer !== '');
  
  return (
    <div className="min-h-screen  p-4">
      <div className="max-w-5xl mx-auto">
        <div className="space-y-6 py-8">
          {/* Header */}
          <div className="text-center space-y-2">
            <h1 className="text-4xl font-bold text-800">
              🤖 AI Fill in the Blanks
            </h1>
            <p className="text-lg text-600 max-w-md mx-auto">
              AI generates unique sentences every time - pick the correct words!
            </p>
          </div>
          
          {/* Score */}
          <div className="flex justify-center gap-4 flex-wrap">
            <div className="0 text-green-800 px-4 py-2 rounded-lg font-semibold">
              ✅ Correct: {score.correct}
            </div>
            <div className=" text-blue-800 px-4 py-2 rounded-lg font-semibold">
              📊 Total: {score.total}
            </div>
            {score.total > 0 && (
              <div className="00 text-purple-800 px-4 py-2 rounded-lg font-semibold">
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
                <p className="text-sm mt-2">Using random topic for variety!</p>
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
                    <div key={blankIndex} className="p-4 rounded-xl">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="  w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm">
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
                                ? '  border-blue-500'
                                : 'ver:border-300 hover:border-blue-300 text-700'
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
                    disabled={!allAnswersFilled}
                    className="0 hover:0 disabled: disabled:cursor-not-allowed bg-blue-400 px-6 py-3 rounded-lg font-semibold flex items-center gap-2 transition-colors"
                  >
                    <Check size={20} />
                    Check My Answers
                  </button>
                  
                  <button
                    onClick={generateNewSentence}
                    className="00 hover:00 bg-blue-400 px-6 py-3 rounded-lg font-semibold flex items-center gap-2 transition-colors"
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
                  <h2 className="text-xl font-semibold text-800 mb-4">
                    ✅ Correct sentence:
                  </h2>
                  <div className=" p-4 rounded-xl">
                    <p className="text-lg text-green-800 font-medium">
                      {originalSentence}
                    </p>
                  </div>
                </div>
                
                {/* Detailed Results */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-800 text-center">
                    📋 Your Results:
                  </h3>
                  <div className="grid gap-4">
                    {feedback.map((item, index) => (
                      <div
                        key={index}
                        className={`p-4 rounded-lg border-2 ${
                          item.isCorrect
                            ? ' border-green-200'
                            : 'order-red-200'
                        }`}
                      >
                        <div className="flex items-center justify-between flex-wrap gap-2">
                          <div className="flex items-center gap-3">
                            <span className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                              item.isCorrect ? '0 text-white' : 'text-white'
                            }`}>
                              {index + 1}
                            </span>
                            <div>
                              <span className="font-medium text-700">
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
                          <div className="mt-2 text-sm text-600">
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
                      ? '0 text-green-800'
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
                    className="00 hover:00 text-white bg-blue-400 px-8 py-3 rounded-lg font-semibold flex items-center gap-2 transition-colors"
                  >
                    <RefreshCw size={20} />
                    Try Another Sentence
                  </button>
                </div>
              </div>
            )}
          </div>
          
          {/* Instructions */}
          <div className="70 rounded-xl p-6">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Lightbulb className="text-yellow-500" size={24} />
              <h3 className="text-lg font-semibold text-800">How It Works</h3>
            </div>
            <div className="text-700 text-center space-y-2">
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