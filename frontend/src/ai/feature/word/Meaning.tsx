import React, { useState, useRef } from "react";
import { LiaDoorOpenSolid } from "react-icons/lia";
import { X, SendIcon, Play, SpeakerIcon } from "lucide-react";
import { BiFileFind } from "react-icons/bi";
import { HiOutlineSpeakerWave } from "react-icons/hi2";
// Chakra UI
import {
  Button,
  Input,
  Flex,
  Box,
  Text,
  VStack,
  HStack,
  IconButton,
  useColorModeValue,
  Spinner,
  RadioGroup,
  Radio,
  FormControl,
  InputGroup,
  InputRightElement,
} from "@chakra-ui/react";
import { useDisclosure } from "@chakra-ui/hooks";
import { useAuthentication } from "../../../features/authentication/context/AuthenticationContextProvider";
import { useCount } from "../../../components/Notify/CountContext";

const Meaning = () => {

  const { isOpen, onOpen, onClose } = useDisclosure();
  const [word, setWord] = useState("");
  const [mode, setMode] = useState("auto");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const utteranceRef = useRef(null);
  const bgColor = useColorModeValue("white", "gray.800");
  const textColor = useColorModeValue("gray.700", "gray.100");
  const borderColor = useColorModeValue("gray.200", "gray.600");
  const accentColor = "purple.500";
  const inputBg = useColorModeValue("gray.50", "gray.700");
  const [showAskCard, setShowAskCard] = useState(false);
   const auth = useAuthentication(); // get the whole object first
   const user = auth?.user;

  const wordCount = word.trim().split(/\s+/).filter(Boolean).length;
  const isSingleWord = wordCount === 1;
  const isMultiWord = wordCount > 1;
  const { setPointsAsks } = useCount();

  // ✅ Auto-select mode based on input
  React.useEffect(() => {
    if (!word.trim()) {
      setMode("auto");
      return;
    }
    if (mode === "auto") {
      if (isSingleWord) {
        setMode("word");
      } else if (isMultiWord) {
        setMode("multi");
      }
    }
  }, [word, mode, isSingleWord, isMultiWord]);

  const fetchResponse = async (e) => {
    e.preventDefault();
    if (!word.trim()) return;

    setLoading(true);
    setResult("");
    console.log("🔍 Fetching response for:",user?.asks);
    // ✅ Show ask card when button is clicked but user has no asks
    if (user?.asks <= 0) {
      setShowAskCard(true);
     setLoading(false);
      return;
 // Stop execution, don't proceed with API call
    }
    console.log("🔍  for:",user?.asks);
    // ✅ If user has asks, proceed with API call
   

    const API_KEY = "AIzaSyBM7_ac70ZpFIcXMoTWuASYyZNBAS_c78A";
    const MODEL = "gemini-2.5-flash-lite";
    const URL = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${API_KEY}`;
    const nativeLang = user?.nativeLanguage || "English";

    let prompt = "";
    if (mode === "word") {
      prompt = `Define "${word}" in very short:
**En:** The meaning of ${word} in very easy and understand way.
**${nativeLang}:** Direct translation.
**Use:** A natural sentence using the word.
**Synonyms:** "1" common alternatives.
Keep it extremely concise.`;
    } else if (mode === "multi") {
      prompt = `Explain the sentence "${word}" in one line:
**Meaning:** What it means.
**${nativeLang}:** Translation.
Be very brief.`;
    } else if (mode === "ask") {
      prompt = `Answer in very short:
"${word}"
Also give ${nativeLang} meaning if needed.`;
    }

    try {
      const res = await fetch(URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
      });

      if (!res.ok) throw new Error("API error");

      const data = await res.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
      setResult(text || "No response.");
      
      // ✅ Fixed: Decrement asks by 1, increment points by 1
      // setPointsAsks(pointsToAdd, asksToSet)
      // To decrement asks: set new asks value = current asks - 1
       setPointsAsks(1,1);
    } catch (err) {
      console.error(err);
            setResult(
        '<span style="color: #ef4444; font-size: 14px;">Check your connection or Try again.</span>'
      );
    } finally {
      setLoading(false);
    }
  };

  // ✅ Fixed speech function
  const cleanTextForSpeech = (text) => {
    return text
      .replace(/<[^>]*>/g, "") // Remove HTML tags
      .replace(/\*\*.*?:\*\*/g, "") // Remove markdown bold labels
      .replace(/[^\w\s.,!?]/g, " ") // Remove special characters except basic punctuation
      .replace(/\s+/g, " ") // Replace multiple spaces with single space
      .trim();
  };

  const readAloud = () => {
    const textToSpeak = word.trim();

    if (!textToSpeak || !window.speechSynthesis || isSpeaking) {
      return;
    }

    // Cancel any ongoing speech
    window.speechSynthesis.cancel();
    setIsSpeaking(true);

    const cleanText = cleanTextForSpeech(textToSpeak);
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
      utterance.volume = 1;

      utterance.onend = () => {
        setIsSpeaking(false);
        utteranceRef.current = null;
      };

      utterance.onerror = (event) => {
        console.error("❌ Speech synthesis error:", event);
        setIsSpeaking(false);
        utteranceRef.current = null;
      };

      window.speechSynthesis.speak(utterance);
    };

    if (window.speechSynthesis.getVoices().length === 0) {
      window.speechSynthesis.onvoiceschanged = speakWithBestVoice;
    } else {
      speakWithBestVoice();
    }
  };

  // ✅ Enhanced formatter with better regex and styling
  const formatResponse = (text) => {
    const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const lang = user?.nativeLanguage || "Hindi";
    const escapedLang = escapeRegex(lang);

    return text
      .replace(/\*\*(En:)\*\*/gi, '<span class="highlight-english">$1</span>')
      .replace(
        new RegExp(`\\*\\*(${escapedLang}:)\\*\\*`, "gi"),
        '<span class="highlight-native">$1</span>'
      )
      .replace(/\*\*(Use:)\*\*/gi, '<span class="highlight-example">$1</span>')
      .replace(
        /\*\*(Meaning:)\*\*/gi,
        '<span class="highlight-phrase">$1</span>'
      )
      .replace(/\*\*(.*?)\*\*/g, '<span class="highlight-fallback">$1</span>')
      .replace(/\n/g, "<br/>");
  };

  // ✅ Dynamic labels
  const getLabel = () => {
    if (mode === "word") return "Define";
    if (mode === "multi") return "Explain";
    if (mode === "ask") return "Ask";
    return "Search";
  };

  const getPlaceholder = () => {
    if (mode === "word") return "Enter a word...";
    if (mode === "multi") return "Enter a phrase...";
    if (mode === "ask") return "Ask anything...";
    return "Type here...";
  };

  return (
    <Box position="relative" display="inline-block">
      {/* Floating Button */}
      <IconButton
        icon={<LiaDoorOpenSolid />}
        aria-label="Open dictionary"
        size="3px"
        borderRadius="full"
        onClick={onOpen}
        boxShadow="md"
        _hover={{ transform: "scale(1.1)" }}
        transition="transform 0.2s"
      />

      {/* ✅ Fixed Ask Card positioning and logic */}
      {showAskCard && (
        <Box
          position="absolute"
          top="-50px"
          left={50}
          width="300px"
          maxW="95vw"
          bg="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
          borderRadius="2xl"
          boxShadow="0 20px 40px rgba(102, 126, 234, 0.4), 0 0 0 1px rgba(255,255,255,0.1)"
          zIndex={10000}
          overflow="hidden"
          transform="scale(0.98)"
          animation="bounceIn 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55) forwards"
        >
          {/* Animated Background Elements */}
          <Box
            position="absolute"
            top="-50%"
            right="-20%"
            width="200px"
            height="200px"
            borderRadius="full"
            bg="rgba(255,255,255,0.1)"
            animation="pulse 3s ease-in-out infinite"
          />
          <Box
            position="absolute"
            bottom="-30%"
            left="-10%"
            width="150px"
            height="150px"
            borderRadius="full"
            bg="rgba(255,255,255,0.05)"
            animation="pulse 2s ease-in-out infinite reverse"
          />
          
          <VStack spacing={6} p={8} position="relative" zIndex={1}>
            {/* Eye-catching Icon */}
           
            
            {/* Compelling Headline */}
            <VStack spacing={2}>
              <Text 
                fontSize="xl" 
                fontWeight="800" 
                color="white" 
                textAlign="center"
                textShadow="0 2px 4px rgba(0,0,0,0.3)"
              >
                Unlock Your Learning Potential!
              </Text>
              <Text 
                fontSize="sm" 
                color="rgba(255,255,255,0.9)" 
                textAlign="center"
                fontWeight="500"
              >
                You're so close to discovering amazing words & meanings
              </Text>
            </VStack>

            {/* Scarcity + Social Proof */}
            <Box
              bg="rgba(255,255,255,0.15)"
              borderRadius="xl"
              p={4}
              width="100%"
              backdropFilter="blur(10px)"
              border="1px solid rgba(255,255,255,0.2)"
            >
              <VStack spacing={2}>
                <HStack spacing={2} align="center">
                  <Text fontSize="lg">⚡</Text>
                  <Text color="white" fontSize="sm" fontWeight="600">
                    Limited Time: FREE 5 Asks
                  </Text>
                </HStack>
                <Text color="rgba(255,255,255,0.8)" fontSize="xs" textAlign="center">
                  Join 10,000+ learners who expanded their vocabulary today
                </Text>
              </VStack>
            </Box>

            {/* Progress Bar Illusion */}
            <Box width="100%">
              <HStack justify="space-between" mb={2}>
                <Text color="rgba(255,255,255,0.9)" fontSize="xs">
                  Learning Progress
                </Text>
                <Text color="white" fontSize="xs" fontWeight="bold">
                  87% Complete
                </Text>
              </HStack>
              <Box bg="rgba(255,255,255,0.2)" borderRadius="full" height="6px">
                <Box 
                  bg="linear-gradient(90deg, #ffd700, #ffed4a)"
                  borderRadius="full" 
                  height="100%" 
                  width="87%"
                  boxShadow="0 0 10px rgba(255,215,0,0.6)"
                  animation="shimmer 2s ease-in-out infinite"
                />
              </Box>
            </Box>

            {/* Action Buttons */}
            <VStack spacing={3} width="100%">
              <Button
                bg="linear-gradient(135deg, #ffd700 0%, #ffed4a 100%)"
                color="black"
                fontWeight="800"
                fontSize="md"
                height="50px"
                width="100%"
                borderRadius="xl"
                boxShadow="0 8px 20px rgba(255,215,0,0.4)"
                _hover={{
                  transform: "translateY(-2px)",
                  boxShadow: "0 12px 25px rgba(255,215,0,0.6)"
                }}
                _active={{
                  transform: "translateY(0px)"
                }}
                transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
                onClick={async () => {
                  try {
                   
                    await setPointsAsks(0, - 5);
                    setShowAskCard(false);
                  } catch (error) {
                    console.error("Error adding asks:", error);
                  }
                }}
              >
                <HStack spacing={2}>
                  <Text>🎁</Text>
                  <Text>GET 5 FREE ASKS NOW</Text>
                  <Text>🎁</Text>
                </HStack>
              </Button>
              
              <Button
                variant="ghost"
                color="rgba(255,255,255,0.7)"
                fontSize="sm"
                height="35px"
                _hover={{
                  color: "white",
                  bg: "rgba(255,255,255,0.1)"
                }}
                onClick={() => setShowAskCard(false)}
              >
                Maybe later
              </Button>
            </VStack>

            {/* Trust Signals */}
            <HStack spacing={4} opacity={0.8}>
              <Text fontSize="xs" color="rgba(255,255,255,0.8)">
                ✓ Instant Access
              </Text>
              <Text fontSize="xs" color="rgba(255,255,255,0.8)">
                ✓ No Payment
              </Text>
              <Text fontSize="xs" color="rgba(255,255,255,0.8)">
                ✓ Premium Quality
              </Text>
            </HStack>
          </VStack>
        </Box>
      )}

      {/* Panel */}
      {isOpen && (
        <Box
          position="absolute"
          top="-10px"
          left="10px"
          width="400px"
          maxW="90vw"
          bg={bgColor}
          border="1px"
          borderColor={borderColor}
          borderRadius="xl"
          boxShadow="2xl"
          zIndex={9999}
          fontSize="sm"
        >
          {/* Header */}
          <Flex
            justify="space-between"
            align="center"
            p={4}
            borderBottomWidth="1px"
            borderBottomColor={borderColor}
          >
            <Text
              gap={2}
              fontWeight="bold"
              color={accentColor}
              display="flex"
              alignItems="center"
              fontSize="md"
            >
              <BiFileFind /> Define & Translate
            </Text>
            <HStack spacing={2}>
              <Text fontSize="xs" color="gray.500">
                Asks: {user?.asks || 0}
              </Text>
              <IconButton
                icon={<X size={16} />}
                aria-label="Close"
                variant="ghost"
                size="sm"
                onClick={onClose}
                color={useColorModeValue("gray.500", "gray.400")}
              />
            </HStack>
          </Flex>

          {/* Form */}
          <form onSubmit={fetchResponse}>
            <VStack p={4} spacing={3}>
              {/* Input with integrated Play button */}
              <InputGroup>
                <Input
                  value={word}
                  onChange={(e) => setWord(e.target.value)}
                  placeholder={getPlaceholder()}
                  autoFocus
                  disabled={loading}
                  bg={inputBg}
                  focusBorderColor="purple.400"
                  size="md"
                  fontFamily="system-ui, -apple-system, sans-serif"
                  pr="50px" // Make space for the play button
                />
                <InputRightElement width="48px">
                  <IconButton
                    icon={<HiOutlineSpeakerWave size={16} />}
                    aria-label="Read aloud"
                    size="sm"
                    variant="ghost"
                    colorScheme="green"
                    onClick={readAloud}
                    disabled={!word.trim() || isSpeaking}
                    isLoading={isSpeaking}
                    _hover={{ bg: "green.50" }}
                    borderRadius="md"
                  />
                </InputRightElement>
              </InputGroup>

              {/* Mode Selector */}
              {word.trim().length > 0 && (
                <FormControl>
                  <RadioGroup value={mode} onChange={setMode}>
                    <HStack wrap="wrap" spacing={3} fontSize="sm">
                      <Radio 
                        value="word" 
                        isDisabled={!isSingleWord}
                        colorScheme="purple"
                      >
                        Word {!isSingleWord ? "(disabled)" : ""}
                      </Radio>
                      <Radio 
                        value="multi" 
                        isDisabled={!isMultiWord}
                        colorScheme="purple"
                      >
                        Phrase {!isMultiWord ? "(disabled)" : ""}
                      </Radio>
                      <Radio value="ask" colorScheme="purple">
                        Ask
                      </Radio>
                    </HStack>
                  </RadioGroup>
                </FormControl>
              )}

              <Button
                type="submit"
                colorScheme="purple"
                width="full"
                isLoading={loading}
                loadingText="Thinking..."
                leftIcon={loading ? null : <SendIcon size={14} />}
                spinner={<Spinner size="sm" />}
                size="md"
                disabled={!word.trim()} // Only disable if no input text
              >
                {getLabel()}
              </Button>
            </VStack>
          </form>

          {/* Result */}
          {result && (
            <Box
              className="meaning-result"
              p={4}
              maxH="300px"
              overflowY="auto"
              color={textColor}
              fontSize="14px"
              lineHeight="1.7"
              fontFamily="Inter, system-ui, sans-serif"
              dangerouslySetInnerHTML={{ __html: formatResponse(result) }}
            />
          )}
        </Box>
      )}

      {/* ✅ Enhanced Dynamic Styles */}
      <style jsx>{`
        .highlight-english {
          color: #1e40af;
          font-weight: 700;
          font-size: 1.05rem;
          background: #eff6ff;
          padding: 0.1em 0.3em;
          border-radius: 4px;
        }
        .highlight-native {
          color: #166534;
          font-weight: 700;
          font-size: 1.05rem;
          background: #f0fdf4;
          padding: 0.1em 0.3em;
          border-radius: 4px;
        }
        .highlight-example {
          color: #9a3412;
          font-style: italic;
          font-weight: 600;
          background: #fff7ed;
          padding: 0.1em 0.3em;
          border-radius: 4px;
        }
        .highlight-phrase {
          color: #5b21b6;
          font-weight: 700;
          background: #f5f3ff;
          padding: 0.1em 0.3em;
          border-radius: 4px;
        }
        .highlight-fallback {
          background: #f3f4f6;
          color: #1f2937;
          font-weight: 600;
          padding: 0.1em 0.3em;
          border-radius: 4px;
        }
        .highlight-yellow {
          color: #5b21b6;
          font-weight: 700;
          background: #f5f3ff;
          padding: 0.1em 0.3em;
          border-radius: 4px;
        }

        .meaning-result {
          font-family: Inter, system-ui, sans-serif;
        }

        .meaning-result::-webkit-scrollbar {
          width: 6px;
        }
        .meaning-result::-webkit-scrollbar-track {
          background: transparent;
        }
        .meaning-result::-webkit-scrollbar-thumb {
          background: ${useColorModeValue(
            "rgba(0,0,0,0.1)",
            "rgba(255,255,255,0.2)"
          )};
          border-radius: 3px;
        }

        @media (max-width: 480px) {
          [style*="left: 70px"] {
            left: 10px !important;
            width: calc(100vw - 20px) !important;
          }
        }
      `}</style>
    </Box>
  );
};

export default Meaning;