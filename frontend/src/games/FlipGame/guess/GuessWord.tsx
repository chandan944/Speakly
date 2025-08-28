import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const MotionBox = motion.div;

// 🎯 100+ COMPOUND WORD PUZZLES - Emojis combine to form new words!
const COMPOUND_PUZZLES = [
  // Classic Compound Words
  { emojis: ["🌞", "🌻"], answer: "sunflower", hint: "Yellow garden bloom", difficulty: "easy" },
  { emojis: ["🔥", "🚒"], answer: "firetruck", hint: "Emergency vehicle", difficulty: "easy" },
  { emojis: ["⭐", "🐟"], answer: "starfish", hint: "Ocean creature", difficulty: "easy" },
  { emojis: ["🌙", "💡"], answer: "moonlight", hint: "Night illumination", difficulty: "easy" },
  { emojis: ["🏠", "⚒️"], answer: "housework", hint: "Home chores", difficulty: "easy" },
  { emojis: ["🌈", "🎨"], answer: "rainbow", hint: "Colorful arc", difficulty: "easy" },
  { emojis: ["❄️", "⛄"], answer: "snowman", hint: "Winter figure", difficulty: "easy" },
  { emojis: ["🌧️", "🌈"], answer: "rainbow", hint: "After the storm", difficulty: "easy" },
  { emojis: ["🍯", "🐝"], answer: "honeybee", hint: "Sweet maker", difficulty: "easy" },
  { emojis: ["🌊", "🏄"], answer: "surfboard", hint: "Wave rider", difficulty: "easy" },

  // Medium Compound Words
  { emojis: ["🦋", "🥛"], answer: "buttermilk", hint: "Dairy drink", difficulty: "medium" },
  { emojis: ["🍓", "🥧"], answer: "strawberry", hint: "Red fruit", difficulty: "medium" },
  { emojis: ["🌪️", "💨"], answer: "windstorm", hint: "Weather event", difficulty: "medium" },
  { emojis: ["⚡", "⚡"], answer: "lightning", hint: "Electric flash", difficulty: "medium" },
  { emojis: ["🕷️", "🕸️"], answer: "spiderweb", hint: "Insect trap", difficulty: "medium" },
  { emojis: ["🐎", "👞"], answer: "horseshoe", hint: "Lucky charm", difficulty: "medium" },
  { emojis: ["🌙", "🌟"], answer: "moonstar", hint: "Night sky", difficulty: "medium" },
  { emojis: ["🔥", "🏔️"], answer: "fireplace", hint: "Home warmth", difficulty: "medium" },
  { emojis: ["🦅", "👁️"], answer: "birdseye", hint: "Aerial view", difficulty: "medium" },
  { emojis: ["🌊", "🏖️"], answer: "seashore", hint: "Ocean edge", difficulty: "medium" },

  // Creative Compound Words
  { emojis: ["🎭", "🏠"], answer: "playhouse", hint: "Theater building", difficulty: "medium" },
  { emojis: ["📖", "🐛"], answer: "bookworm", hint: "Reading lover", difficulty: "medium" },
  { emojis: ["🌙", "🚶"], answer: "moonwalk", hint: "Space step", difficulty: "medium" },
  { emojis: ["❄️", "⚽"], answer: "snowball", hint: "Winter ammunition", difficulty: "medium" },
  { emojis: ["🌟", "💫"], answer: "starlight", hint: "Celestial glow", difficulty: "medium" },
  { emojis: ["🐾", "📄"], answer: "footprint", hint: "Step mark", difficulty: "medium" },
  { emojis: ["🌋", "🔥"], answer: "wildfire", hint: "Uncontrolled blaze", difficulty: "hard" },
  { emojis: ["⚡", "🐛"], answer: "lightning", hint: "Thunder flash", difficulty: "hard" },
  { emojis: ["🦋", "🌸"], answer: "butterfly", hint: "Flying flower visitor", difficulty: "medium" },
  { emojis: ["🌊", "🏄"], answer: "waterski", hint: "Lake sport", difficulty: "medium" },

  // Tricky Compound Words
  { emojis: ["🏀", "⚽"], answer: "ballgame", hint: "Sports event", difficulty: "hard" },
  { emojis: ["📺", "🎮"], answer: "gameplay", hint: "Gaming action", difficulty: "hard" },
  { emojis: ["🌳", "🏠"], answer: "treehouse", hint: "Kids hideout", difficulty: "medium" },
  { emojis: ["⏰", "⚒️"], answer: "clockwork", hint: "Mechanical timing", difficulty: "hard" },
  { emojis: ["🎪", "🎭"], answer: "showtime", hint: "Performance hour", difficulty: "hard" },
  { emojis: ["🌙", "🌊"], answer: "moonwave", hint: "Night tide", difficulty: "hard" },
  { emojis: ["🔥", "🌟"], answer: "firestar", hint: "Burning celestial", difficulty: "hard" },
  { emojis: ["❄️", "🌨️"], answer: "snowstorm", hint: "Winter weather", difficulty: "medium" },
  { emojis: ["🌈", "🌉"], answer: "rainbow", hint: "Bridge of colors", difficulty: "medium" },
  { emojis: ["⚡", "🌩️"], answer: "thunderstorm", hint: "Electric weather", difficulty: "medium" },

  // Food Compounds
  { emojis: ["🥞", "🍯"], answer: "pancake", hint: "Breakfast stack", difficulty: "easy" },
  { emojis: ["🍎", "🥧"], answer: "applepie", hint: "Classic dessert", difficulty: "easy" },
  { emojis: ["🧀", "🍰"], answer: "cheesecake", hint: "Rich dessert", difficulty: "easy" },
  { emojis: ["🍓", "🧊"], answer: "strawberry", hint: "Red berry", difficulty: "medium" },
  { emojis: ["☕", "☕"], answer: "coffee", hint: "Morning brew", difficulty: "easy" },
  { emojis: ["🥜", "🧈"], answer: "peanutbutter", hint: "Sandwich spread", difficulty: "easy" },
  { emojis: ["🌽", "🍞"], answer: "cornbread", hint: "Southern bread", difficulty: "medium" },
  { emojis: ["🥕", "🍰"], answer: "carrotcake", hint: "Orange cake", difficulty: "medium" },
  { emojis: ["🐔", "🥪"], answer: "chickensandwich", hint: "Poultry meal", difficulty: "medium" },
  { emojis: ["🥓", "🍳"], answer: "baconegg", hint: "Breakfast combo", difficulty: "medium" },

  // Animal Compounds
  { emojis: ["🐕", "🏠"], answer: "doghouse", hint: "Pet shelter", difficulty: "easy" },
  { emojis: ["🐱", "🐟"], answer: "catfish", hint: "Whiskered fish", difficulty: "medium" },
  { emojis: ["🐄", "👦"], answer: "cowboy", hint: "Ranch worker", difficulty: "medium" },
  { emojis: ["🐸", "👤"], answer: "frogman", hint: "Amphibian diver", difficulty: "hard" },
  { emojis: ["🦅", "👁️"], answer: "hawkeye", hint: "Sharp vision", difficulty: "hard" },
  { emojis: ["🐺", "👤"], answer: "wolfman", hint: "Mythical creature", difficulty: "hard" },
  { emojis: ["🦆", "🏊"], answer: "duckling", hint: "Baby waterfowl", difficulty: "medium" },
  { emojis: ["🐎", "👑"], answer: "seahorse", hint: "Ocean equine", difficulty: "medium" },
  { emojis: ["🐧", "👔"], answer: "penguin", hint: "Tuxedo bird", difficulty: "medium" },
  { emojis: ["🦋", "🌺"], answer: "butterfly", hint: "Colorful flier", difficulty: "medium" },

  // Nature Compounds
  { emojis: ["🌊", "🏔️"], answer: "waterfall", hint: "Cascading flow", difficulty: "medium" },
  { emojis: ["🌳", "🍃"], answer: "treeleaf", hint: "Branch growth", difficulty: "medium" },
  { emojis: ["🌸", "🌷"], answer: "flowerbed", hint: "Garden area", difficulty: "medium" },
  { emojis: ["🌙", "🌟"], answer: "starlight", hint: "Night glow", difficulty: "medium" },
  { emojis: ["☀️", "🌅"], answer: "sunrise", hint: "Dawn break", difficulty: "easy" },
  { emojis: ["🌅", "🌄"], answer: "sunset", hint: "Evening glow", difficulty: "easy" },
  { emojis: ["🌊", "🐚"], answer: "seashell", hint: "Beach treasure", difficulty: "easy" },
  { emojis: ["🌳", "🌰"], answer: "acorn", hint: "Oak seed", difficulty: "medium" },
  { emojis: ["🌋", "🌋"], answer: "volcano", hint: "Fire mountain", difficulty: "medium" },
  { emojis: ["❄️", "🌨️"], answer: "blizzard", hint: "Snow storm", difficulty: "medium" },

  // Tech/Modern Compounds
  { emojis: ["📱", "💻"], answer: "smartphone", hint: "Pocket computer", difficulty: "easy" },
  { emojis: ["🎮", "🕹️"], answer: "videogame", hint: "Digital entertainment", difficulty: "easy" },
  { emojis: ["📡", "🌐"], answer: "internet", hint: "Global network", difficulty: "medium" },
  { emojis: ["💿", "🎵"], answer: "soundtrack", hint: "Movie music", difficulty: "medium" },
  { emojis: ["📺", "📻"], answer: "broadcast", hint: "Media transmission", difficulty: "hard" },
  { emojis: ["🔋", "⚡"], answer: "powerbank", hint: "Portable energy", difficulty: "medium" },
  { emojis: ["💻", "🖱️"], answer: "computer", hint: "Digital machine", difficulty: "easy" },
  { emojis: ["📷", "📸"], answer: "snapshot", hint: "Quick photo", difficulty: "medium" },
  { emojis: ["🎧", "🎵"], answer: "headphones", hint: "Personal audio", difficulty: "easy" },
  { emojis: ["⌚", "📱"], answer: "smartwatch", hint: "Wrist computer", difficulty: "medium" },

  // Transportation Compounds
  { emojis: ["✈️", "🏭"], answer: "aircraft", hint: "Flying machine", difficulty: "medium" },
  { emojis: ["🚗", "🏁"], answer: "racecar", hint: "Speed vehicle", difficulty: "medium" },
  { emojis: ["🚢", "⚓"], answer: "steamship", hint: "Ocean vessel", difficulty: "medium" },
  { emojis: ["🚂", "🚃"], answer: "railroad", hint: "Train track", difficulty: "medium" },
  { emojis: ["🚴", "🏔️"], answer: "mountain", hint: "Peak cycling", difficulty: "hard" },
  { emojis: ["🏍️", "🏁"], answer: "motorbike", hint: "Two-wheel speed", difficulty: "medium" },
  { emojis: ["🛸", "👽"], answer: "spacecraft", hint: "Alien vehicle", difficulty: "hard" },
  { emojis: ["🚁", "🌪️"], answer: "helicopter", hint: "Whirling flight", difficulty: "medium" },
  { emojis: ["🚤", "🌊"], answer: "speedboat", hint: "Fast water craft", difficulty: "medium" },
  { emojis: ["🛩️", "☁️"], answer: "airplane", hint: "Cloud cruiser", difficulty: "easy" },

  // Sports Compounds
  { emojis: ["⚽", "🥅"], answer: "football", hint: "Goal sport", difficulty: "easy" },
  { emojis: ["🏀", "🏀"], answer: "basketball", hint: "Hoop game", difficulty: "easy" },
  { emojis: ["🎾", "🎾"], answer: "tennis", hint: "Racket sport", difficulty: "easy" },
  { emojis: ["⚾", "🧤"], answer: "baseball", hint: "Diamond game", difficulty: "easy" },
  { emojis: ["🏈", "🏟️"], answer: "football", hint: "Stadium sport", difficulty: "easy" },
  { emojis: ["🏐", "🏖️"], answer: "volleyball", hint: "Beach game", difficulty: "medium" },
  { emojis: ["🎱", "🎯"], answer: "poolhall", hint: "Cue sports venue", difficulty: "hard" },
  { emojis: ["🏓", "🏆"], answer: "pingpong", hint: "Table tennis", difficulty: "medium" },
  { emojis: ["🥊", "👊"], answer: "boxing", hint: "Fighting sport", difficulty: "medium" },
  { emojis: ["🏊", "🏊"], answer: "swimming", hint: "Water sport", difficulty: "easy" },

  // Really Tricky Ones
  { emojis: ["👁️", "⚽"], answer: "eyeball", hint: "Vision sphere", difficulty: "hard" },
  { emojis: ["🔔", "🦋"], answer: "bellfly", hint: "Ringing insect", difficulty: "hard" },
  { emojis: ["💎", "⚫"], answer: "blackdiamond", hint: "Dark gem", difficulty: "hard" },
  { emojis: ["🌙", "👻"], answer: "moonlight", hint: "Ghostly glow", difficulty: "hard" },
  { emojis: ["⭐", "💥"], answer: "starburst", hint: "Stellar explosion", difficulty: "hard" },
  { emojis: ["🔥", "❄️"], answer: "fireice", hint: "Opposite elements", difficulty: "hard" },
  { emojis: ["🌊", "🔥"], answer: "steamfire", hint: "Water meets flame", difficulty: "hard" },
  { emojis: ["⚡", "❄️"], answer: "thundersnow", hint: "Electric winter", difficulty: "hard" },
  { emojis: ["🦋", "🔥"], answer: "firefly", hint: "Glowing insect", difficulty: "hard" },
  { emojis: ["🌙", "🔥"], answer: "moonfire", hint: "Celestial flame", difficulty: "hard" }
];

// 🏆 Streak rewards
const STREAK_MESSAGES = [
  { min: 3, message: "🔥 On Fire!" },
  { min: 5, message: "🌟 Brilliant!" },
  { min: 8, message: "💎 Genius!" },
  { min: 12, message: "🚀 Legendary!" },
  { min: 15, message: "👑 Master!" }
];

// ✅ Enhanced normalize for compound words
const normalize = (str) =>
  str.toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, '')  // Remove all spaces for compound matching
    .trim();

const isCloseMatch = (userInput, correctAnswer) => {
  const user = normalize(userInput);
  const answer = normalize(correctAnswer);

  // Exact match
  if (user === answer) return true;

  // Check without spaces (for compound words)
  const userNoSpace = user.replace(/\s+/g, '');
  const answerNoSpace = answer.replace(/\s+/g, '');
  if (userNoSpace === answerNoSpace) return true;

  // Partial match for long compound words
  if (answer.length > 6) {
    const similarity = calculateSimilarity(user, answer);
    return similarity >= 0.8; // 80% similarity
  }

  return false;
};

// Calculate string similarity
const calculateSimilarity = (str1, str2) => {
  const len1 = str1.length;
  const len2 = str2.length;
  const matrix = Array(len2 + 1).fill().map(() => Array(len1 + 1).fill(0));

  for (let i = 0; i <= len1; i++) matrix[0][i] = i;
  for (let j = 0; j <= len2; j++) matrix[j][0] = j;

  for (let j = 1; j <= len2; j++) {
    for (let i = 1; i <= len1; i++) {
      const cost = str1[i - 1] === str2[j - 1] ? 0 : 1;
      matrix[j][i] = Math.min(
        matrix[j][i - 1] + 1,
        matrix[j - 1][i] + 1,
        matrix[j - 1][i - 1] + cost
      );
    }
  }

  const distance = matrix[len2][len1];
  return 1 - distance / Math.max(len1, len2);
};

export default function EmojiPuzzleGame() {
  const [gameState, setGameState] = useState({
    currentPuzzle: null,
    userGuess: "",
    gameResult: null,
    score: 0,
    streak: 0,
    bestStreak: 0,
    round: 1,
    showAnswer: false,
    difficulty: "mixed",
    usedPuzzles: []
  });

  const [gameStarted, setGameStarted] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [shakeCard, setShakeCard] = useState(false);
  const [streakMessage, setStreakMessage] = useState("");

  // 🔊 Sound effects
  const playSound = (type) => console.log(`🔊 ${type}`);

  // 🧩 Get next compound puzzle
  const getNextPuzzle = () => {
    let availablePuzzles = [...COMPOUND_PUZZLES];

    // Filter by difficulty
    if (gameState.difficulty !== "mixed") {
      availablePuzzles = COMPOUND_PUZZLES.filter(p => p.difficulty === gameState.difficulty);
    }

    // Remove used puzzles
    availablePuzzles = availablePuzzles.filter(p => 
      !gameState.usedPuzzles.includes(p.answer)
    );

    // Reset if all used
    if (availablePuzzles.length === 0) {
      availablePuzzles = COMPOUND_PUZZLES.filter(p => 
        gameState.difficulty === "mixed" || p.difficulty === gameState.difficulty
      );
      setGameState(prev => ({ ...prev, usedPuzzles: [] }));
    }

    const randomPuzzle = availablePuzzles[Math.floor(Math.random() * availablePuzzles.length)];
    
    setGameState(prev => ({
      ...prev,
      currentPuzzle: randomPuzzle,
      usedPuzzles: [...prev.usedPuzzles, randomPuzzle.answer],
      userGuess: "",
      gameResult: null,
      showAnswer: false
    }));
  };

  // ✅ Check compound word answer
  const checkAnswer = () => {
    const { userGuess, currentPuzzle } = gameState;
    if (!userGuess.trim() || !currentPuzzle) return;

    const isCorrect = isCloseMatch(userGuess, currentPuzzle.answer);
    const newStreak = isCorrect ? gameState.streak + 1 : 0;
    const newBestStreak = Math.max(gameState.bestStreak, newStreak);

    // Enhanced scoring for compound difficulty
    const points = isCorrect ? 
      (currentPuzzle.difficulty === "hard" ? 5 : 
       currentPuzzle.difficulty === "medium" ? 3 : 2) : 0;

    setGameState(prev => ({
      ...prev,
      gameResult: isCorrect ? 'correct' : 'wrong',
      score: prev.score + points,
      streak: newStreak,
      bestStreak: newBestStreak
    }));

    if (isCorrect) {
      playSound('success');
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 3000);

      const streakMsg = STREAK_MESSAGES.find(s => newStreak >= s.min && newStreak % s.min === 0);
      if (streakMsg) {
        setStreakMessage(streakMsg.message);
        setTimeout(() => setStreakMessage(""), 4000);
      }
    } else {
      playSound('error');
      setShakeCard(true);
      setTimeout(() => setShakeCard(false), 600);
    }
  };

  const revealAnswer = () => {
    setGameState(prev => ({ 
      ...prev, 
      showAnswer: true, 
      gameResult: 'revealed', 
      streak: 0 
    }));
    playSound('reveal');
  };

  const nextPuzzle = () => {
    setGameState(prev => ({ ...prev, round: prev.round + 1 }));
    getNextPuzzle();
  };

  const startGame = (difficulty = "mixed") => {
    setGameStarted(true);
    setGameState(prev => ({ 
      ...prev, 
      difficulty,
      usedPuzzles: [],
      score: 0,
      streak: 0,
      round: 1
    }));
    setTimeout(() => getNextPuzzle(), 100);
  };

  const resetGame = () => {
    setGameStarted(false);
    setGameState({
      currentPuzzle: null,
      userGuess: "",
      gameResult: null,
      score: 0,
      streak: 0,
      bestStreak: 0,
      round: 1,
      showAnswer: false,
      difficulty: "mixed",
      usedPuzzles: []
    });
  };

  const isClose = gameState.userGuess && gameState.currentPuzzle &&
    calculateSimilarity(normalize(gameState.userGuess), normalize(gameState.currentPuzzle.answer)) > 0.6;

  // ------------------
  // MINIMALIST START SCREEN
  // ------------------
  if (!gameStarted) {
    return (
      <div className="min-h-screen bg-white dark:bg-black flex items-center justify-center p-6">
        <div className="w-full max-w-sm text-center space-y-12">
          
          {/* Minimal Logo */}
          <div className="space-y-4">
            <div className="text-6xl">🧩</div>
            <h1 className="text-2xl font-light text-gray-900 dark:text-white tracking-wide">
              Compound Puzzle
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 font-light">
              Combine emojis to form words
            </p>
          </div>

          {/* Example */}
          <div className="bg-gray-50 dark:bg-gray-900 p-6 rounded-2xl border border-gray-100 dark:border-gray-800">
            <div className="flex items-center justify-center gap-3 text-3xl mb-3">
              <span>🔥</span>
              <span className="text-gray-400 text-lg">+</span>
              <span>🚒</span>
              <span className="text-gray-400 text-lg">=</span>
              <span className="text-sm font-medium text-gray-600 dark:text-gray-300">firetruck</span>
            </div>
          </div>

          {/* Difficulty Selection */}
          <div className="space-y-3">
            {[
              { key: "easy", label: "Easy", desc: "2 points", color: "bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950 dark:border-emerald-800 dark:text-emerald-300" },
              { key: "medium", label: "Medium", desc: "3 points", color: "bg-amber-50 border-amber-200 text-amber-700 hover:bg-amber-100 dark:bg-amber-950 dark:border-amber-800 dark:text-amber-300" },
              { key: "hard", label: "Hard", desc: "5 points", color: "bg-red-50 border-red-200 text-red-700 hover:bg-red-100 dark:bg-red-950 dark:border-red-800 dark:text-red-300" },
              { key: "mixed", label: "Mixed", desc: "All levels", color: "bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100 dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300" }
            ].map(mode => (
              <button
                key={mode.key}
                onClick={() => startGame(mode.key)}
                className={`w-full p-4 rounded-xl border transition-all duration-200 ${mode.color}`}
              >
                <div className="font-medium">{mode.label}</div>
                <div className="text-xs opacity-70 mt-1">{mode.desc}</div>
              </button>
            ))}
          </div>

          <div className="text-xs text-gray-400 dark:text-gray-600">
            {COMPOUND_PUZZLES.length}+ puzzles
          </div>
        </div>
      </div>
    );
  }

  // ------------------
  // MINIMALIST GAME SCREEN
  // ------------------
  return (
    <div className="min-h-screen bg-white dark:bg-black">
      
      {/* Minimal Confetti */}
      <AnimatePresence>
        {showConfetti && (
          <MotionBox className="fixed inset-0 pointer-events-none z-50">
            {[...Array(12)].map((_, i) => (
              <MotionBox
                key={i}
                className="absolute text-xl opacity-80"
                initial={{ y: -20, x: Math.random() * window.innerWidth, opacity: 0 }}
                animate={{ 
                  y: window.innerHeight + 100, 
                  opacity: [0, 1, 0],
                  x: Math.random() * window.innerWidth 
                }}
                transition={{ duration: 3, delay: i * 0.1, ease: "easeOut" }}
              >
                {['✨', '💫', '⭐'][i % 3]}
              </MotionBox>
            ))}
          </MotionBox>
        )}
      </AnimatePresence>

      {/* Minimal Streak Message */}
      <AnimatePresence>
        {streakMessage && (
          <MotionBox
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="fixed top-8 left-1/2 transform -translate-x-1/2 bg-black dark:bg-white text-white dark:text-black px-6 py-3 rounded-full text-sm font-medium z-40"
          >
            {streakMessage}
          </MotionBox>
        )}
      </AnimatePresence>

      <div className="max-w-sm mx-auto p-6 pt-12 space-y-8">
        
        {/* Minimal Header */}
        <div className="flex justify-between items-center">
          <div>
            <div className="text-xs text-gray-400 dark:text-gray-600 uppercase tracking-wide">
              Round {gameState.round} • {gameState.difficulty}
            </div>
            <div className="text-lg font-medium text-gray-900 dark:text-white">
              {gameState.score} points
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs text-gray-400 dark:text-gray-600">Streak</div>
            <div className="text-lg font-medium text-orange-600 dark:text-orange-400">
              {gameState.streak}
            </div>
          </div>
        </div>

        {gameState.currentPuzzle && (
          <div className="space-y-8">
            
            {/* Minimal Puzzle Display */}
            <MotionBox
              animate={{ x: shakeCard ? [-3, 3, -3, 3, 0] : 0 }}
              className="text-center space-y-6"
            >
              
              {/* Equation */}
              <div className="flex items-center justify-center gap-4">
                <MotionBox
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.1, type: "spring", stiffness: 300, damping: 25 }}
                  className="text-5xl"
                >
                  {gameState.currentPuzzle.emojis[0]}
                </MotionBox>
                
                <span className="text-gray-300 dark:text-gray-700 text-xl font-light">+</span>
                
                <MotionBox
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.3, type: "spring", stiffness: 300, damping: 25 }}
                  className="text-5xl"
                >
                  {gameState.currentPuzzle.emojis[1]}
                </MotionBox>
                
                <span className="text-gray-300 dark:text-gray-700 text-xl font-light">=</span>
                <span className="text-gray-400 dark:text-gray-600 text-2xl">?</span>
              </div>

              {/* Minimal Hint */}
              <div className="text-sm text-gray-500 dark:text-gray-400 font-light">
                {gameState.currentPuzzle.hint}
              </div>

              {/* Answer Reveal */}
              <AnimatePresence>
                {gameState.showAnswer && (
                  <MotionBox
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800"
                  >
                    <div className="text-gray-900 dark:text-white font-medium">
                      {gameState.currentPuzzle.answer}
                    </div>
                  </MotionBox>
                )}
              </AnimatePresence>
            </MotionBox>

            {/* Minimal Input */}
            <div className="space-y-4">
              <div className="relative">
                <input
                  type="text"
                  value={gameState.userGuess}
                  onChange={(e) => setGameState(prev => ({ ...prev, userGuess: e.target.value }))}
                  onKeyPress={(e) => e.key === 'Enter' && checkAnswer()}
                  placeholder="Enter compound word"
                  autoFocus
                  disabled={!!gameState.gameResult || gameState.showAnswer}
                  className="w-full px-0 py-4 bg-transparent border-0 border-b border-gray-200 dark:border-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600 focus:outline-none focus:border-gray-400 dark:focus:border-gray-600 text-center text-lg font-light transition-colors"
                />
                
                {/* Minimal Progress Indicator */}
                {gameState.userGuess && !gameState.gameResult && (
                  <div className="absolute bottom-0 left-0 h-px bg-gray-300 dark:bg-gray-700 transition-all duration-300" 
                       style={{ 
                         width: `${Math.min(100, Math.max(10, calculateSimilarity(
                           normalize(gameState.userGuess), 
                           normalize(gameState.currentPuzzle.answer)
                         ) * 100))}%` 
                       }}
                  />
                )}
              </div>

              {/* Minimal Status */}
              {gameState.userGuess && !gameState.gameResult && (
                <div className="text-center">
                  <div className={`text-xs font-light ${
                    isClose ? "text-emerald-600 dark:text-emerald-400" : "text-gray-400 dark:text-gray-600"
                  }`}>
                    {isClose ? "Almost there" : "Keep thinking"}
                  </div>
                </div>
              )}

              {/* Minimal Actions */}
              <div className="flex gap-3">
                <button
                  onClick={checkAnswer}
                  disabled={!gameState.userGuess.trim() || !!gameState.gameResult || gameState.showAnswer}
                  className="flex-1 py-3 bg-gray-900 dark:bg-white text-white dark:text-black rounded-xl font-light disabled:opacity-30 disabled:bg-gray-300 dark:disabled:bg-gray-700 transition-all duration-200"
                >
                  Submit
                </button>
                <button
                  onClick={revealAnswer}
                  disabled={gameState.showAnswer}
                  className="px-6 py-3 border border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-400 rounded-xl font-light disabled:opacity-30 hover:border-gray-300 dark:hover:border-gray-700 transition-all duration-200"
                >
                  Reveal
                </button>
              </div>
            </div>

            {/* Minimal Result */}
            <AnimatePresence>
              {gameState.gameResult && (
                <MotionBox
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center space-y-6"
                >
                  <div className={`space-y-2 ${
                    gameState.gameResult === 'correct' ? 'text-emerald-600 dark:text-emerald-400' :
                    'text-red-500 dark:text-red-400'
                  }`}>
                    <div className="text-sm font-light">
                      {gameState.gameResult === 'correct' ? 'Correct' : 'Incorrect'}
                    </div>
                    
                    {gameState.gameResult === 'correct' && (
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        +{gameState.currentPuzzle.difficulty === 'hard' ? 5 : 
                           gameState.currentPuzzle.difficulty === 'medium' ? 3 : 2} points
                      </div>
                    )}

                    {gameState.gameResult === 'wrong' && (
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {gameState.currentPuzzle.answer}
                      </div>
                    )}
                  </div>

                  <button
                    onClick={nextPuzzle}
                    className="px-8 py-3 bg-gray-900 dark:bg-white text-white dark:text-black rounded-xl font-light hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors"
                  >
                    Next
                  </button>
                </MotionBox>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* Minimal Footer */}
        <div className="text-center pt-8 border-t border-gray-100 dark:border-gray-900">
          <button
            onClick={resetGame}
            className="text-xs text-gray-400 dark:text-gray-600 hover:text-gray-600 dark:hover:text-gray-400 transition-colors font-light"
          >
            New Game
          </button>
        </div>
      </div>
    </div>
  );
}