import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuthentication } from "../../../features/authentication/context/AuthenticationContextProvider";

const MotionBox = motion.div;

// Themes (emoji-only, no color meaning)
const QUEST_THEMES = [
  { name: "🏰 Medieval Adventure", keywords: ["knight", "castle", "dragon", "sword", "quest", "kingdom"] },
  { name: "🚀 Space Exploration", keywords: ["spaceship", "planet", "alien", "galaxy", "asteroid", "cosmic"] },
  { name: "🏴‍☠️ Pirate Journey", keywords: ["treasure", "ship", "island", "captain", "crew", "gold"] },
  { name: "🌟 Magic Kingdom", keywords: ["wizard", "spell", "potion", "fairy", "crystal", "enchanted"] },
  { name: "🦸 Superhero City", keywords: ["hero", "villain", "power", "mask", "rescue", "battle"] },
  { name: "🏜️ Desert Mystery", keywords: ["pyramid", "sand", "camel", "mummy", "oasis", "pharaoh"] },
  { name: "🌊 Underwater World", keywords: ["ocean", "fish", "shark", "pearl", "coral", "mermaid"] },
  { name: "🎪 Carnival Fun", keywords: ["clown", "circus", "balloon", "ticket", "ride", "parade"] },
  { name: "🏞️ Jungle Safari", keywords: ["tiger", "monkey", "elephant", "river", "tree", "explorer"] },
  { name: "❄️ Arctic Quest", keywords: ["ice", "snow", "polar", "penguin", "igloo", "seal"] },
  { name: "🎓 School Life", keywords: ["student", "teacher", "class", "exam", "library", "homework"] },
  { name: "⚽ Sports Arena", keywords: ["ball", "goal", "team", "coach", "stadium", "trophy"] },
  { name: "🎵 Music World", keywords: ["song", "guitar", "drum", "dance", "stage", "concert"] },
  { name: "🍔 Food Fiesta", keywords: ["pizza", "burger", "fries", "icecream", "juice", "chocolate"] },
  { name: "✈️ Travel Journey", keywords: ["city", "train", "airport", "hotel", "ticket", "map"] }
];


const RANDOM_WORDS = [
  "mysterious", "ancient", "glowing", "hidden", "powerful",
  "magical", "brave", "clever", "dangerous", "beautiful"
];

const API_KEY = import.meta.env.VITE_API_URL_GEMINI;
const MODEL = "gemini-2.5-flash-lite";
const URL = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${API_KEY}`;

export default function SentenceBuilderQuest() {
  const [gameState, setGameState] = useState({
    currentChapter: 1,
    totalChapters: 10,
    correctSentence: "",
    nativeTranslation: "",
    wordTranslations: {},
    scrambledWords: [],
    userArrangement: [],
    storyText: "",
    isCorrect: null,
    score: 0,
    theme: QUEST_THEMES[0]
  });
  const { user } = useAuthentication();
  const [showTranslation, setShowTranslation] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);

  const generateChallenge = async (chapter = 1, theme = QUEST_THEMES[0]) => {
    setLoading(true);
    const difficulty = Math.ceil(chapter / 3);
    const randomKeyword = RANDOM_WORDS[Math.floor(Math.random() * RANDOM_WORDS.length)];
    const themeKeyword = theme.keywords[Math.floor(Math.random() * theme.keywords.length)];

    const userLang = navigator.language || 'hi-IN';
    const langName = new Intl.DisplayNames([userLang], { type: 'language' }).of(userLang.split('-')[0]) || 'Hindi';

    const prompt = `Create ${difficulty === 1 ? '6-8' : difficulty === 2 ? '8-10' : '10-12'} word ${theme.name.split(' ')[1].toLowerCase()} sentence for chapter ${chapter}. Include "${randomKeyword}" and "${themeKeyword}". 

Format:
SENTENCE:[sentence]
TRANSLATION:[translate sentence into ${user?.nativeLanguage} language]
WORDS:[word1: ${user?.nativeLanguage},word2:${user?.nativeLanguage},...${user?.nativeLanguage}]`;

    try {
      const res = await fetch(URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }]
        })
      });

      const data = await res.json();
      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";

      const lines = text.split('\n');
      const sentence = lines.find(l => l.includes('SENTENCE:'))?.replace('SENTENCE:', '').trim() ||
        `The ${randomKeyword} ${themeKeyword} awaits brave adventurers.`;
      const translation = lines.find(l => l.includes('TRANSLATION:'))?.replace('TRANSLATION:', '').trim() ||
        'आपकी रोमांचक यात्रा जारी है...';
      const story = lines.find(l => l.includes('STORY:'))?.replace('STORY:', '').trim() ||
        "Your quest continues with new mysteries...";

      const wordsLine = lines.find(l => l.includes('WORDS:'))?.replace('WORDS:', '').trim() || '';
      const wordTranslations = {};
      if (wordsLine) {
        wordsLine.split(',').forEach(pair => {
          const [word, trans] = pair.split(':');
          if (word && trans) {
            wordTranslations[word.trim()] = trans.trim();
          }
        });
      }

      const words = sentence.split(' ');
      const scrambled = [...words].sort(() => Math.random() - 0.5);

      setGameState(prev => ({
        ...prev,
        correctSentence: sentence,
        nativeTranslation: translation,
        wordTranslations: wordTranslations,
        scrambledWords: scrambled,
        userArrangement: [],
        storyText: story,
        isCorrect: null,
        currentChapter: chapter,
        theme: theme
      }));
    } catch (error) {
      console.error("API Error:", error);
      const fallbacks = [
        `The ${randomKeyword} ${themeKeyword} glows with ancient power.`,
        `Brave heroes discovered the ${randomKeyword} ${themeKeyword} chamber.`,
        `A ${randomKeyword} ${themeKeyword} appeared in the distance.`,
        `The ${randomKeyword} ${themeKeyword} holds the key to victory.`,
        `Our ${randomKeyword} journey leads to the ${themeKeyword}.`
      ];

      const sentence = fallbacks[chapter % fallbacks.length];
      const words = sentence.split(' ');
      const scrambled = [...words].sort(() => Math.random() - 0.5);

      const fallbackTranslations = {
        'The': 'वह', 'brave': 'बहादुर', 'knight': 'योद्धा', 'heroes': 'नायक',
        'ancient': 'प्राचीन', 'mysterious': 'रहस्यमय', 'magical': 'जादुई',
        'powerful': 'शक्तिशाली', 'adventure': 'साहसिक यात्रा'
      };

      setGameState(prev => ({
        ...prev,
        correctSentence: sentence,
        nativeTranslation: 'आपकी रोमांचक यात्रा जारी है...',
        wordTranslations: fallbackTranslations,
        scrambledWords: scrambled,
        userArrangement: [],
        storyText: `Your ${randomKeyword} adventure with the ${themeKeyword} continues...`,
        isCorrect: null,
        currentChapter: chapter,
        theme: theme
      }));
    } finally {
      setLoading(false);
    }
  };

  const moveWordToArrangement = (wordIndex) => {
    const word = gameState.scrambledWords[wordIndex];
    setGameState(prev => ({
      ...prev,
      scrambledWords: prev.scrambledWords.filter((_, i) => i !== wordIndex),
      userArrangement: [...prev.userArrangement, word]
    }));
  };

  const moveWordToScrambled = (wordIndex) => {
    const word = gameState.userArrangement[wordIndex];
    setGameState(prev => ({
      ...prev,
      userArrangement: prev.userArrangement.filter((_, i) => i !== wordIndex),
      scrambledWords: [...prev.scrambledWords, word]
    }));
  };

  const checkAnswer = () => {
    const userSentence = gameState.userArrangement.join(' ').toLowerCase().replace(/[.,!?]/g, '');
    const correctSentence = gameState.correctSentence.toLowerCase().replace(/[.,!?]/g, '');
    const isCorrect = userSentence === correctSentence;

    setGameState(prev => ({ ...prev, isCorrect }));

    if (isCorrect) {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 3000);
      setGameState(prev => ({
        ...prev,
        score: prev.score + (gameState.currentChapter * 10)
      }));
    }
  };

  const nextChapter = () => {
    if (gameState.currentChapter < gameState.totalChapters) {
      generateChallenge(gameState.currentChapter + 1, gameState.theme);
    }
  };

  const startGame = (selectedTheme) => {
    setGameStarted(true);
    generateChallenge(1, selectedTheme);
  };

  const resetGame = () => {
    setGameStarted(false);
    setGameState(prev => ({
      ...prev,
      currentChapter: 1,
      score: 0,
      isCorrect: null
    }));
  };

  // Font: Use system font stack for best OS integration
  const systemFont = {
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif'
  };

  if (!gameStarted) {
    return (
      <div className="min-h-screen p-4" style={systemFont}>
        <div className="max-w-4xl mx-auto py-8">
          <div className="text-center space-y-8">
            <MotionBox
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="space-y-4"
            >
              <h1 className="text-5xl font-bold">🧩 Sentence Builder Quest</h1>
              <p className="text-xl">
                Embark on an epic adventure! Build sentences to unlock your story.
              </p>
            </MotionBox>

            <div className="space-y-6">
              <h2 className="text-2xl font-bold">Choose Your Quest Theme:</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
                {QUEST_THEMES.map((theme, index) => (
                  <MotionBox
                    key={theme.name}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                  >
                    <button
                      className="w-full py-4 px-6 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 transition"
                      onClick={() => startGame(theme)}
                    >
                      <div className="text-lg font-semibold">{theme.name}</div>
                    </button>
                  </MotionBox>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4" style={systemFont}>
      {/* Confetti (pure emoji, no color styling) */}
      <AnimatePresence>
        {showConfetti && (
          <MotionBox className="fixed inset-0 pointer-events-none z-50">
            {[...Array(30)].map((_, i) => (
              <MotionBox
                key={i}
                className="absolute text-2xl"
                initial={{
                  x: typeof window !== 'undefined' ? Math.random() * window.innerWidth : 500,
                  y: -20,
                  rotate: 0,
                }}
                animate={{
                  y: typeof window !== 'undefined' ? window.innerHeight + 20 : 800,
                  rotate: 360,
                  x: typeof window !== 'undefined' ? Math.random() * window.innerWidth : 500,
                }}
                transition={{ duration: 3, delay: i * 0.1 }}
              >
                {['🎉', '⭐', '🌟', '✨', '🎊'][i % 5]}
              </MotionBox>
            ))}
          </MotionBox>
        )}
      </AnimatePresence>

      <div className="max-w-6xl mx-auto py-6">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm">{gameState.theme.name}</p>
              <h1 className="text-3xl font-bold">
                Chapter {gameState.currentChapter} of {gameState.totalChapters}
              </h1>
            </div>
            <div className="text-right">
              <div className="flex items-center space-x-2 mb-2">
                <span className="text-xl">⭐</span>
                <span className="font-bold text-xl">{gameState.score}</span>
              </div>
              <button
                onClick={resetGame}
                className="px-4 py-2 rounded-lg transition hover:bg-gray-200 dark:hover:bg-gray-700"
                title="Reset game"
              >
                🔄 Reset
              </button>
            </div>
          </div>

          {/* Progress Bar (semantic, uses native appearance) */}
          <div className="w-full">
            <div className="w-full bg-gray-300 dark:bg-gray-600 rounded-full h-4">
              <div
                className="bg-black dark:bg-white h-4 rounded-full transition-all duration-500"
                style={{ width: `${(gameState.currentChapter / gameState.totalChapters) * 100}%` }}
              ></div>
            </div>
            <p className="text-sm text-center mt-2">
              Quest Progress: {Math.round((gameState.currentChapter / gameState.totalChapters) * 100)}%
            </p>
          </div>

          {/* Game Area */}
          {loading ? (
            <div className="text-center py-20">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-current mb-4"></div>
              <p className="text-xl">🔮 Generating challenge...</p>
            </div>
          ) : (
            <div className="space-y-8">
              {/* Translation Help */}
              <details className="border border-gray-300 dark:border-gray-600 rounded-2xl p-6">
                <summary className="cursor-pointer font-bold">🌍 Translation Help</summary>
                <div className="mt-4 space-y-4">
                  <div className="p-4 rounded-xl border border-gray-300 dark:border-gray-600">
                    <p className="text-center italic">
                      "{gameState.nativeTranslation}"
                    </p>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    {gameState.scrambledWords.concat(gameState.userArrangement).map((word, index) => {
                      const translation = gameState.wordTranslations[word] || word;
                      return (
                        <div key={`trans-${word}-${index}`} className="p-3 rounded-lg border border-gray-300 dark:border-gray-600">
                          <div className="font-semibold text-sm">{word}</div>
                          <div className="text-xs mt-1 text-gray-700 dark:text-gray-300">{translation}</div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </details>

              {/* Scrambled Words */}
              <div className="rounded-2xl p-6 border border-gray-300 dark:border-gray-600">
                <h2 className="text-xl font-bold mb-4 text-center">📜 Click words to build your sentence:</h2>
                <div className="flex flex-wrap gap-3 justify-center min-h-16">
                  {gameState.scrambledWords.map((word, index) => {
                    const translation = gameState.wordTranslations[word] || '';
                    return (
                      <MotionBox
                        key={`${word}-${index}`}
                        whileHover={{ scale: 1.05, y: -2 }}
                        whileTap={{ scale: 0.95 }}
                        className="cursor-pointer select-none group"
                        onClick={() => moveWordToArrangement(index)}
                      >
                        <div className="relative">
                          <span className="inline-block px-4 py-3 rounded-xl hover:shadow transition">
                            {word}
                          </span>
                          {translation && (
                            <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition whitespace-nowrap">
                              {translation}
                            </div>
                          )}
                        </div>
                      </MotionBox>
                    );
                  })}
                  {gameState.scrambledWords.length === 0 && (
                    <p className="italic text-lg">All words used! Check your sentence below.</p>
                  )}
                </div>
              </div>

              {/* User Arrangement */}
              <div className="border-2 border-dashed rounded-2xl p-6">
                <h2 className="text-xl font-bold mb-4 text-center">⚡ Your Sentence:</h2>
                <div className="flex flex-wrap gap-3 justify-center min-h-16">
                  {gameState.userArrangement.map((word, index) => {
                    const translation = gameState.wordTranslations[word] || '';
                    return (
                      <MotionBox
                        key={`arranged-${word}-${index}`}
                        initial={{ scale: 0, rotate: 180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        whileHover={{ scale: 1.05, y: -2 }}
                        whileTap={{ scale: 0.95 }}
                        className="cursor-pointer select-none group"
                        onClick={() => moveWordToScrambled(index)}
                      >
                        <div className="relative">
                          <span className="inline-block px-4 py-3 rounded-xl hover:shadow transition">
                            {word}
                          </span>
                          {translation && (
                            <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition whitespace-nowrap">
                              {translation}
                            </div>
                          )}
                        </div>
                      </MotionBox>
                    );
                  })}
                  {gameState.userArrangement.length === 0 && (
                    <p className="italic text-lg">Click words above to build your sentence here.</p>
                  )}
                </div>
              </div>

              {/* Check Button */}
              <div className="text-center">
                <button
                  className={`px-10 py-4 rounded-2xl font-bold text-lg transition-all duration-300 ${
                    gameState.userArrangement.length === 0
                      ? 'opacity-60 cursor-not-allowed'
                      : 'hover:bg-gray-200 dark:hover:bg-gray-700 hover:-translate-y-1'
                  }`}
                  onClick={checkAnswer}
                  disabled={gameState.userArrangement.length === 0}
                >
                  ⚔️ Check My Answer
                </button>
              </div>

              {/* Result Display */}
              <AnimatePresence>
                {gameState.isCorrect !== null && (
                  <MotionBox
                    initial={{ opacity: 0, scale: 0.8, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.8, y: -20 }}
                  >
                    <div className={`p-8 rounded-2xl border text-center ${
                      gameState.isCorrect ? 'border-green-600' : 'border-red-600'
                    }`}>
                      {gameState.isCorrect ? (
                        <div className="space-y-6">
                          <p className="text-4xl">🎉 Perfect!</p>
                          <p className="text-xl font-bold">"{gameState.correctSentence}"</p>
                          <div className="p-6 rounded-xl border">
                            <p className="italic text-lg leading-relaxed mb-3">
                              {gameState.storyText}
                            </p>
                            <p className="text-sm border-t pt-3">
                              Translation: {gameState.nativeTranslation}
                            </p>
                          </div>
                          {gameState.currentChapter < gameState.totalChapters ? (
                            <button
                              className="px-8 py-4 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 transition font-bold text-lg"
                              onClick={nextChapter}
                            >
                              🚀 Continue to Chapter {gameState.currentChapter + 1}
                            </button>
                          ) : (
                            <div className="space-y-4">
                              <p className="text-2xl font-bold">🏆 Quest Completed!</p>
                              <button
                                className="px-8 py-4 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 transition font-bold text-lg"
                                onClick={resetGame}
                              >
                                🎮 Start New Quest
                              </button>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <p className="text-3xl">🤔 Not quite right...</p>
                          <p className="text-lg">Try rearranging the words. The correct order will unlock the story!</p>
                          <p className="text-gray-600 dark:text-gray-400">
                            Hint: "{gameState.correctSentence}"
                          </p>
                        </div>
                      )}
                    </div>
                  </MotionBox>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}