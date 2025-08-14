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
import { usePageTitle } from "../../../hook/usePageTitle";

const Meaning = () => {
  const { user } = useAuthentication();
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

  const wordCount = word.trim().split(/\s+/).filter(Boolean).length;
  const isSingleWord = wordCount === 1;
  const isMultiWord = wordCount > 1;


  // ✅ Auto-select mode based on input
  React.useEffect(() => {
    if (!word.trim()) return;
    if (mode === "auto") {
      if (isSingleWord) setMode("word");
      else if (isMultiWord) setMode("multi");
      else setMode("ask");
    }
  }, [word, mode, isSingleWord, isMultiWord]);

  const fetchResponse = async (e) => {
    e.preventDefault();
    if (!word.trim()) return;

    setLoading(true);
    setResult("");

    const API_KEY = "AIzaSyBM7_ac70ZpFIcXMoTWuASYyZNBAS_c78A";
    const MODEL = "gemini-2.5-flash-lite";
    // ✅ Fixed URL: removed extra space
    const URL = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${API_KEY}`;

    const nativeLang = user?.nativeLanguage || "Hindi";

    let prompt = "";

    if (mode === "word") {
      prompt = `Define "${word}" in one short line each:
**En:** The meaning of ${word} in very easy to understand way.
**${nativeLang}:** Direct translation.
**Use:** A natural sentence using the word.
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
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
        }),
      });

      if (!res.ok) throw new Error("API error");

      const data = await res.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
      setResult(text || "No response.");
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
      .replace(/\s+/g, " ") 
      .replace(/\*\*(.*?)\*\*/g, '<span class="highlight-yellow">$1</span>')
      // Replace multiple spaces with single space
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
            <IconButton
              icon={<X size={16} />}
              aria-label="Close"
              variant="ghost"
              size="sm"
              onClick={onClose}
              color={useColorModeValue("gray.500", "gray.400")}
            />
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
                      <Radio value="word" isDisabled={!isSingleWord}>
                        Word {isSingleWord ? "" : "(disabled)"}
                      </Radio>
                      <Radio value="multi" isDisabled={!isMultiWord}>
                        Phrase {isMultiWord ? "" : "(disabled)"}
                      </Radio>
                      <Radio value="ask">Ask</Radio>
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
          .highlight-yellow{
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
