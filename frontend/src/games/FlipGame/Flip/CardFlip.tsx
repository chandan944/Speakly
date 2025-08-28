
import React, { useCallback, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Box,
  Button,
  Flex,
  Grid,
  Heading,
  Text,
  VStack,
  HStack,
  useColorModeValue,
  Card,
  CardBody,
  Spinner,
  Alert,
  AlertIcon,
  Divider,
  Wrap,
  WrapItem,
  Center,
  useColorMode,
} from "@chakra-ui/react";

// Icons
import { FaCrown, FaUserGraduate, FaRedo, FaGamepad } from "react-icons/fa";
import { GiCardPick, GiPartyPopper } from "react-icons/gi";
import { BsQuestionCircle } from "react-icons/bs";
import { ChevronRightIcon } from "@chakra-ui/icons";
import { useAuthentication } from "../../../features/authentication/context/AuthenticationContextProvider";

// Motion alias
const MotionBox = motion(Box);

// --- CONFIG ---
const API_KEY = import.meta.env.VITE_API_URL_GEMINI;
const MODEL = "gemini-1.5-flash-latest";
const URL = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${API_KEY}`;

const DIFFICULTY_LEVELS = [
  { name: "Easy", label: "🟢 Easy", score: 10, desc: "Common words" },
  { name: "Medium", label: "🟡 Medium", score: 20, desc: "Challenging words" },
  { name: "Hard", label: "🔴 Hard", score: 30, desc: "Expert level" },
];

const WORD_CATEGORIES = [
  "student","teacher","school","college","class","book","pen","pencil","notebook","library",
  "exam","study","lesson","subject","question","answer","chalk","board","degree","result",
  "human","man","woman","child","family","friend","parents","brother","sister","people",
  "life","world","work","job","food","water","health","body","mind","sleep",
  "history","past","war","king","queen","village","country","freedom","rule","culture",
  "future","present","tradition","festival","story","language","music","dance","art","poem",
  "science","nature","plant","tree","flower","animal","bird","earth","sun","moon",
  "technology","mobile","computer","internet","phone","camera","video","game","chat","robot",
  "city","road","house","market","shop","money","train","bus","car","travel",
  "love","hope","peace","happy","smile","dream","goal","success","time","friendship"
];


// Fallback data
const FALLBACK_SETS = {
  Easy: [
    { word: "Serendipity", meaning: "A pleasant surprise or fortunate discovery", isReal: true },
    { word: "Ephemeral", meaning: "Lasting a very short time", isReal: true },
    { word: "Blinside", meaning: "This is not a real word", isReal: false, explanation: "Made-up to sound plausible" }
  ],
  Medium: [
    { word: "Perspicacious", meaning: "Keen mental perception", isReal: true },
    { word: "Grandiloquent", meaning: "Pompous or extravagant in language", isReal: true },
    { word: "Flimberous", meaning: "Not a real word", isReal: false, explanation: "Invented to look Latinate" }
  ],
  Hard: [
    { word: "Sesquipedalian", meaning: "Given to long words", isReal: true },
    { word: "Callipygian", meaning: "Having well-shaped buttocks", isReal: true },
    { word: "Xerophagic", meaning: "Not a real word", isReal: false, explanation: "Sounds scientific but invented" }
  ]
};

// ------------------------
// WordCard Component (3D Flip - Green Theme)
// ------------------------
const WordCard = React.memo(({ wordObj, index, flipped, disabled, onSelect }) => {
  useColorMode();

  const frontBg = useColorModeValue("emerald.600", "emerald.700");
  const realBg = useColorModeValue("emerald.500", "teal.900");
  const fakeBg = useColorModeValue("amber.500", "orange.900");
  const textColor = "white";
  const hoverOpacity = useColorModeValue(0.9, 1.1);

  return (
    <MotionBox
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0, rotateY: flipped ? 180 : 0 }}
      transition={{ type: 'spring', stiffness: 260, damping: 22 }}
      style={{ transformStyle: 'preserve-3d' }}
      w="full"
      h={{ base: "90px", sm: "100px", md: "120px" }}
      cursor={disabled ? "default" : "pointer"}
      onClick={() => !disabled && onSelect(wordObj, index)}
      _hover={{ transform: disabled ? "none" : `scale(${hoverOpacity})` }}
      
    >
      {/* FRONT */}
      <Box
        position="absolute"
        inset={0}
        borderRadius="lg"
        p={1}
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        bg={frontBg}
        border={"2px solid"}
        fontWeight="bold"
        fontSize={{ base: "sm", sm: "md" }}
        style={{ backfaceVisibility: 'hidden' }}
        boxShadow="sm"
      >
        <Text isTruncated width="full" textAlign="center">
          {wordObj.word}
        </Text>
        <Text fontSize="xs" opacity={0.9} mt={0.5}>
          {disabled ? 'Revealed' : ''}
        </Text>
      </Box>

      {/* BACK */}
      <Box
        position="absolute"
        inset={0}
        borderRadius="lg"
        p={3}
        border={"2px solid"}
        display="flex"
        flexDirection="column"
        justifyContent="center"
        bg={wordObj.isReal ? realBg : fakeBg}
        fontFamily={"roboto"}
        style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
        fontSize="md"
        lineHeight="tall"
      >
        <Text fontWeight="bold" isTruncated>{wordObj.word}</Text>
        <Text opacity={0.95} mt={1}>{wordObj.meaning}</Text>
        <Text mt={1} color={wordObj.isReal ? "emerald.100" : "amber.100"}>
          {wordObj.isReal ? '✅ Real Word' : '❌ Fake Word'}
        </Text>
        {!wordObj.isReal && wordObj.explanation && (
          <Text   mt={1} >
            💡 {wordObj.explanation}
          </Text>
        )}
      </Box>
    </MotionBox>
  );
});
WordCard.displayName = "WordCard";

// ------------------------
// Confetti (Green Accents)
// ------------------------
function Confetti({ active }) {
  const { colorMode } = useColorMode();
  const iconColor = colorMode === "dark" ? "lime.300" : "green.500";
  const icons = [GiPartyPopper, FaCrown, GiCardPick, BsQuestionCircle];

  if (!active) return null;

  return (
    <Box pointerEvents="none" pos="fixed" inset="0" zIndex={40} overflow="hidden">
      {[...Array(12)].map((_, i) => {
        const Icon = icons[i % icons.length];
        return (
          <MotionBox
            key={i}
            initial={{ y: -40, opacity: 0 }}
            animate={{ y: '120vh', opacity: [1, 1, 0] }}
            transition={{ duration: 2.4 + Math.random(), delay: i * 0.05 }}
            pos="absolute"
            left={`${Math.random() * 100}%`}
            color={iconColor}
            fontSize="2xl"
          >
            <Icon />
          </MotionBox>
        );
      })}
    </Box>
  );
}

// ------------------------
// Main Game Component
// ------------------------
export default function GuessFakeWordGame() {
  const { user } = useAuthentication?.() || {};
  useColorMode();

  const bgColor = useColorModeValue("stone.50", "slate.900");
  const cardBg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("emerald.200", "emerald.700");
  const textColor = useColorModeValue("gray.800", "gray.100");
  const mutedText = useColorModeValue("gray.600", "gray.400");

  const [gameState, setGameState] = useState({
    words: [],
    selectedWord: null,
    gameResult: null,
    score: 0,
    round: 1,
    difficulty: DIFFICULTY_LEVELS[0],
  });

  const [loading, setLoading] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [flippedMap, setFlippedMap] = useState({});
  const [showConfetti, setShowConfetti] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const parseApiText = (text) => {
    if (!text) return null;
    const getTag = (tag) => {
      const re = new RegExp(`${tag}:\\s*([^\\n\\r]+)`, 'i');
      const m = text.match(re);
      if (!m) return null;
      const parts = m[1].split("|").map(s => s.trim());
      return { word: parts[0], meaning: (parts[1] || '').trim() };
    };

    const r1 = getTag('REAL1');
    const r2 = getTag('REAL2');
    const f = getTag('FAKE');
    const expMatch = text.match(/EXPLANATION:\\s*([\\s\\S]+)/i);
    const explanation = expMatch ? expMatch[1].trim() : '';

    if (r1 && r2 && f) {
      f.explanation = explanation;
      const arr = [
        { ...r1, isReal: true },
        { ...r2, isReal: true },
        { ...f, isReal: false }
      ];
      return arr.sort(() => Math.random() - 0.5);
    }
    return null;
  };

  const generateWords = useCallback(async (difficulty = DIFFICULTY_LEVELS[0]) => {
    setLoading(true);
    setErrorMsg('');
    setFlippedMap({});
    setGameState(prev => ({ ...prev, selectedWord: null, gameResult: null, difficulty }));

    const lang = user?.nativeLanguage || 'English';
    const category = WORD_CATEGORIES[Math.floor(Math.random() * WORD_CATEGORIES.length)];

    const prompt = `Generate word game data for ${difficulty.name} difficulty about ${category}.\n\nFormat:\nREAL1:[word]|[meaning in ${lang}]\nREAL2:[word]|[meaning in ${lang}]\nFAKE:[fake_word]| No meaning \n\nNotes: return exactly the tags but you may output in any order.`;

    try {
      const res = await fetch(URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
      });

      const data = await res.json();
      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || (typeof data === 'string' ? data : '');

      const parsed = parseApiText(text);
      if (parsed && parsed.length === 3) {
        setGameState(prev => ({ ...prev, words: parsed }));
        setLoading(false);
        return;
      }

      throw new Error('Parsing failed');

    } catch (err) {
      const fb = FALLBACK_SETS[difficulty.name] || FALLBACK_SETS.Easy;
      const shuffled = [...fb].sort(() => Math.random() - 0.5);
      setGameState(prev => ({ ...prev, words: shuffled }));
      setErrorMsg('Using fallback words (API response failed)');
    } finally {
      setLoading(false);
    }
  }, [user]);

  const handleWordSelect = (selectedWord, idx) => {
    const flipAll = {};
    gameState.words.forEach((_, i) => (flipAll[i] = true));
    setFlippedMap(flipAll);
    setGameState(prev => ({ ...prev, selectedWord }));

    const isCorrect = !selectedWord.isReal;
    const add = gameState.difficulty?.score || 10;
    const newScore = isCorrect ? gameState.score + add : gameState.score;

    setGameState(prev => ({ ...prev, gameResult: isCorrect ? 'win' : 'lose', score: newScore }));

    if (isCorrect) {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 2800);
    }
  };

  const nextRound = async () => {
    setGameState(prev => ({ ...prev, round: prev.round + 1, selectedWord: null, gameResult: null }));
    setFlippedMap({});
    setLoading(true);
    setTimeout(async () => {
      await generateWords(gameState.difficulty);
      setLoading(false);
    }, 450);
  };

  const startGame = (difficulty) => {
    setGameStarted(true);
    setGameState(prev => ({ ...prev, difficulty }));
    generateWords(difficulty);
  };

  const resetGame = () => {
    setGameStarted(false);
    setGameState({
      words: [],
      selectedWord: null,
      gameResult: null,
      score: 0,
      round: 1,
      difficulty: DIFFICULTY_LEVELS[0]
    });
    setFlippedMap({});
    setShowConfetti(false);
    setErrorMsg('');
  };

  const difficultyPills = useMemo(() => (
    <Wrap spacing={3} justify="center" my={5}>
      {DIFFICULTY_LEVELS.map(d => (
        <WrapItem key={d.name}>
          <Button
            border={"1px solid"}
            size="sm"
            onClick={() => startGame(d)}
            bg="emerald.600"
            
            _hover={{ bg: "emerald.500" }}
            _active={{ bg: "emerald.700" }}
            fontSize="sm"
            px={10}
            py={5}
            borderRadius="md"
            width="full"
            justifyContent="flex-start"
          >
            <VStack align="start" spacing={0}>
              <HStack fontSize="xs" fontWeight="bold">
                <Box as="span" fontSize="sm">{d.label}</Box>
              </HStack>
              <Text fontSize="xs" opacity={0.9}>{d.desc}</Text>
            </VStack>
          </Button>
        </WrapItem>
      ))}
    </Wrap>
  ), []);

  // ------------------
  // RENDER
  // ------------------
  if (!gameStarted) {
    return (
      <Box bg={bgColor} minH="100vh" p={4} >
        <Confetti active={showConfetti} />
        <VStack maxW="md" mx="auto" spacing={6} textAlign="center">
          <VStack align="stretch" w="full">
            <HStack justify="space-between">
              <VStack align="start">
                <Heading as="h1" size="lg" fontWeight="semibold" color="emerald.700" display="flex" alignItems="center" gap={2}>
                  <GiCardPick /> Guess the Fake Word
                </Heading>
               
              </VStack>
              <VStack align="end">
                <Text fontSize="xs" opacity={mutedText}>Player</Text>
                <HStack color="emerald.600">
                  <FaUserGraduate />
                  <Text fontWeight="medium">
                    {user?.firstName || 'Guest'}
                  </Text>
                </HStack>
              </VStack>
            </HStack>

            <Card my={5} bg={cardBg} borderColor={borderColor} borderWidth={1} borderRadius="lg" boxShadow="sm">
              <CardBody p={4}>
                <Text fontWeight="medium" mb={3} color="emerald.600">Choose Difficulty</Text>
                {difficultyPills}
                
              </CardBody>
            </Card>

            <Button
              leftIcon={<FaGamepad />}
              colorScheme="green"
              size="sm"
              onClick={() => startGame(DIFFICULTY_LEVELS[0])}
              borderRadius="md"
            >
              Quick Start (Easy)
            </Button>
          </VStack>

          <Text fontSize="xs" opacity={mutedText}>
           Focused on learning. Good luck! 🍀
          </Text>
        </VStack>
      </Box>
    );
  }

  return (
    <Box bg={bgColor} minH="100vh" p={4} color={textColor}>
      <Confetti active={showConfetti} />
      <VStack maxW="xl" mx="auto" spacing={5}>
        <Flex
          w="full"
          direction={{ base: "column", md: "row" }}
          justify="space-between"
          align={{ base: "start", md: "center" }}
          gap={3}
        >
          <VStack align="start">
            <HStack fontSize="sm" opacity={mutedText}>
              <Text>{gameState.difficulty.label}</Text>
              <Text>• Round {gameState.round}</Text>
            </HStack>
            <Heading as="h2" size="md" fontWeight="semibold" color="emerald.700" display="flex" alignItems="center" gap={1}>
              Which one is fake? <BsQuestionCircle />
            </Heading>
           
          </VStack>

          <HStack spacing={3}>
            <HStack color="emerald.600">
             
            </HStack>
            <Button
              size="sm"
              variant="outline"
              colorScheme="green"
              onClick={resetGame}
              leftIcon={<FaRedo />}
              borderRadius="md"
            >
              New Game
            </Button>
          </HStack>
        </Flex>

        {errorMsg && (
          <Alert status="warning" borderRadius="md" fontSize="xs" colorScheme="orange">
            <AlertIcon />
            {errorMsg}
          </Alert>
        )}

        {loading ? (
          <Center py={8}>
            <VStack spacing={3}>
              <Spinner color="emerald.500" size="sm" />
              <Text fontSize="sm">🧠 Crafting words...</Text>
            </VStack>
          </Center>
        ) : (
          <Box w="full">
            <Grid
              templateColumns={{ base: "1fr", md: "1fr 1fr 1fr" }}
              gap={3}
              style={{ perspective: 1000 }}
            >
              {gameState.words.map((w, i) => (
                <Box key={i} opacity={gameState.selectedWord ? 0.85 : 1}>
                  <WordCard
                    wordObj={w}
                    index={i}
                    flipped={!!flippedMap[i]}
                    disabled={!!gameState.selectedWord}
                    onSelect={handleWordSelect}
                  />
                </Box>
              ))}
            </Grid>

            <AnimatePresence>
              {gameState.gameResult && (
                <MotionBox
                  initial={{ opacity: 0, y: 10, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.98 }}
                  mt={5}
                >
                  <Card
                    bg={gameState.gameResult === 'win' ? "emerald.900" : "orange.900"}
                    
                    borderRadius="lg"
                    boxShadow="md"
                  >
                    <CardBody p={4}>
                      <VStack spacing={2} align="center">
                        <Text fontSize="2xl">
                          {gameState.gameResult === 'win' ? <GiPartyPopper /> : <BsQuestionCircle />}
                        </Text>
                        <Text fontSize="sm" textAlign="center">
                          {gameState.gameResult === 'win'
                            ? `✅ You found it: "${gameState?.selectedWord?.word}"`
                            : `❌ "${gameState?.selectedWord?.word}" is real`}
                        </Text>
                        <HStack spacing={3}>
                          <Button
                            size="sm"
                            colorScheme="green"
                            onClick={nextRound}
                            leftIcon={<ChevronRightIcon />}
                            borderRadius="md"
                          >
                            Next Round
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            colorScheme="green"
                            onClick={resetGame}
                            borderRadius="md"
                          >
                            Restart
                          </Button>
                        </HStack>
                      </VStack>
                    </CardBody>
                  </Card>
                </MotionBox>
              )}
            </AnimatePresence>
          </Box>
        )}

        <Text fontSize="xs" opacity={mutedText} mt={6}>
          Built with focus. Learn one word at a time. 🌿
        </Text>
      </VStack>
    </Box>
  );
}


