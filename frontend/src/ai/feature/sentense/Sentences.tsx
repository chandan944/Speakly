import { useState, useRef } from "react";
import {
  SendIcon,
  RefreshCw,
  Star,
  BookOpen,
  CheckCircle2,
} from "lucide-react";
import {
  Box,
  Flex,
  Button,
  Input,
  Text,
  VStack,
  HStack,
  useColorModeValue,
  useDisclosure,
  ScaleFade,
  Badge,
} from "@chakra-ui/react";
import { useAuthentication } from "../../../features/authentication/context/AuthenticationContextProvider";
import { usePageTitle } from "../../../hook/usePageTitle";

const Sentence = () => {
  const { user } = useAuthentication();
  const [topic, setTopic] = useState("");
  const [difficulty, setDifficulty] = useState("easy");
  const [generatedSentence, setGeneratedSentence] = useState("");
  const [userTranslation, setUserTranslation] = useState("");
  const [feedback, setFeedback] = useState("");
  const [loading, setLoading] = useState(false);
  const [feedbackLoading, setFeedbackLoading] = useState(false);


  const bgColor = useColorModeValue("white", "gray.800");

  const borderColor = useColorModeValue("gray.200", "gray.600");

  const nativeLang = user?.nativeLanguage || "Hindi";

  const { isOpen,  onClose } = useDisclosure();

  const feedbackRef = useRef(null);
usePageTitle("Sentences");

  // Generate Sentence
  const generateSentence = async () => {
    if (!topic.trim()) return;
    setLoading(true);
    setGeneratedSentence("");
    setUserTranslation("");
    setFeedback("");

    const API_KEY = "AIzaSyBM7_ac70ZpFIcXMoTWuASYyZNBAS_c78A";
    const MODEL = "gemini-2.5-flash-lite";
    const URL = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${API_KEY}`;



    const prompt = `Create one unique and natural sentence in ${nativeLang} for a ${difficulty} learner about "${topic}".

- Make it sound like real conversation, not from a textbook.  
- Use different styles each time: casual, curious, emotional, funny, or thoughtful.  
- Keep it short and clear — one sentence only.  
- Do NOT explain or translate. Only reply with the sentence.`;


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
      const sentence = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
      setGeneratedSentence(sentence || "No sentence generated.");
    } catch (err) {
      console.error(err);
      setGeneratedSentence("Failed to generate. Try again.");
    } finally {
      setLoading(false);
    }
  };

  // Get Feedback
  const getFeedback = async () => {
    if (!userTranslation.trim() || !generatedSentence) return;

    setFeedbackLoading(true);
    setFeedback("");

    const API_KEY = "AIzaSyBM7_ac70ZpFIcXMoTWuASYyZNBAS_c78A";
    const MODEL = "gemini-2.5-flash-lite";
    const URL = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${API_KEY}`;

const prompt = `
Compare the user's translation with the original sentence: "${generatedSentence}". 
Give very concise, clear, and **encouraging feedback** in English, with a small touch of ${nativeLang}. 
Respond **strictly in the following format** (no extra text, no missing sections):

**Score:** [percent]%  
🛠️ **Fixes:** [Clearly explain what is wrong or could be improved in the user's translation — short but specific]  
💡 **Better Version:** [Provide a polished, natural-sounding translation]  
📘 **Tip:** [1 short, practical language-learning tip related to the mistake]  
💖 **Encouragement:** [1 sentence motivating the user, friendly tone]  

Original:  
${generatedSentence}  
User's Attempt:  
${userTranslation}  
`;

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
      setFeedback(text || "No feedback available.");
    } catch (err) {
      console.error(err);
      setFeedback('<span style="color: #ef4444">Failed to get feedback. Try again.</span>');
    } finally {
      setFeedbackLoading(false);
    }
  };

  // Format feedback
  const formatFeedback = (text:string) => {
    return text
      .replace(
        /(\*\*Score:\*\*.*?%)/g,
        '<span class="inline-block bg-gradient-to-r from-green-400 to-green-500 text-white px-3 py-1 rounded-full font-bold text-sm shadow-md animate-pulse-slow">$1</span>'
      )
      .replace(
        /(🛠️ \*\*Fixes:\*\*.*)/g,
        '<div class="bg-orange-50 border-l-4 border-green-400 text-green-800 font-mono  p-3 my-2 rounded-r-lg animate-slide-in"><strong></strong> $1</div>'
      )
      .replace(
        /(💡 \*\*Better Version:\*\*.*)/g,
        '<div class="bg-blue-50 border-l-4 border-blue-400 text-blue-800 p-3 my-2 rounded-r-lg animate-slide-in delay-100"><strong></strong> $1</div>'
      )
      .replace(
        /(📘 \*\*Tip:\*\*.*)/g,
        '<div class="bg-purple-50 border-l-4 border-purple-400 text-purple-800 p-3 my-2 rounded-r-lg animate-slide-in delay-200"><strong></strong> $1</div>'
      )
      .replace(
        /(💖 \*\*Encouragement:\*\*.*)/g,
        '<div class="bg-pink-50 border-l-4 border-pink-400 text-pink-600 p-3 my-2 rounded-r-lg font-medium animate-bounce-in"><strong>💖 You’re doing great!</strong> $1</div>'
      )
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\n/g, "<br/>")
      .replace(/- /g, '• ');
  };

  return (
    <Box
      minH="100vh"
      p={6}
      position="relative"
      overflow="hidden"
    >


      {/* Main Content */}
      <VStack spacing={8} maxW="4xl" mx="auto" align="stretch">
        {/* Header */}
        <Flex justify="center" align="center" gap={3}>
          <Box
            as={BookOpen}
            size={32}
            color="purple.500"
            className="animate-bounce-slow"
          />
          <Text
            fontSize={{ base: "2xl", md: "4xl" }}
            fontWeight="bold"
            bgGradient="linear(to-r, purple.600, pink.600, blue.600)"
            bgClip="text"
            textAlign="center"
          >
            Let's Solve Sentences
          </Text>
        </Flex>

        {/* Topic Input */}
        <Box
          p={6}
          bg={bgColor}
          borderRadius="2xl"
          boxShadow="xl"
          border="1px"
          borderColor={borderColor}
        >
          <HStack spacing={4} wrap="wrap">
            <Input
              placeholder="Enter a topic (e.g., food, travel, family)"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              size="lg"
              borderRadius="xl"
              focusBorderColor="green.300"
              _focus={{ boxShadow: "0 0 0 3px rgba(147, 51, 234, 0.2)" }}
            />
            <Button
              leftIcon={<RefreshCw size={16} />}
              bgColor="green.300"
              size="lg"
              onClick={generateSentence}
              isLoading={loading}
              loadingText="Generating..."
              borderRadius="xl"
            >
              Generate
            </Button>
          </HStack>
        </Box>

        {/* Difficulty Selector */}
        <HStack justify="center" spacing={4} wrap="wrap">
          {[
            { level: "easy", label: "Easy", emoji: "🟢", color: "green" },
            { level: "medium", label: "Medium", emoji: "🟡", color: "orange" },
            { level: "hard", label: "Hard", emoji: "🔴", color: "red" },
          ].map(({ level, label, emoji, color }) => (
            <Button
              key={level}
              leftIcon={emoji}
              size="md"
              variant={difficulty === level ? "solid" : "outline"}
              colorScheme={color}
              onClick={() => setDifficulty(level)}
              borderRadius="full"
              px={6}
              _hover={{ transform: "scale(1.05)" }}
              transition="all 0.2s"
            >
              {label}
            </Button>
          ))}
        </HStack>

        {/* Generated Sentence */}
        {generatedSentence && (
          <ScaleFade initialScale={0.9} in={!!generatedSentence}>
            <Box
              p={6}
              bg="blue.50"
              borderRadius="2xl"
              borderLeft="8px solid"
              borderColor="blue.400"
              shadow="md"
            >
              <HStack justify="space-between" mb={2}>
                <Badge bgColor={"green.300"} variant="solid" px={3} py={1}>
                  <HStack spacing={1}>
                    <CheckCircle2 size={14} />
                    <Text fontSize="sm">Your {nativeLang} Sentence</Text>
                  </HStack>
                </Badge>
                <Text fontSize="sm" color="gray.500">
                  Level: {difficulty}
                </Text>
              </HStack>
              <Text fontSize="lg" fontWeight="medium" color="blue.800">
                {generatedSentence}
              </Text>
            </Box>
          </ScaleFade>
        )}

        {/* User Translation */}
        {generatedSentence && (
          <Box
            p={6}
            // bg={bgColor}
            borderRadius="2xl"
            boxShadow="lg"
            border="1px"
            borderColor={borderColor}
          >
            <VStack spacing={4} mb={4} >
              <Input
                placeholder="Your English translation..."
                value={userTranslation}
                onChange={(e) => setUserTranslation(e.target.value)}
                size="lg"
                focusBorderColor="purple.400"
                borderRadius="xl"
              />
              <Button
                leftIcon={<SendIcon size={16} />}
                bgColor={"green.300"}
                size="lg"
                onClick={getFeedback}
                isLoading={feedbackLoading}
                loadingText="Analyzing..."
                borderRadius="xl"
              >
                Submit
              </Button>
            </VStack>
          </Box>
        )}

        {/* Feedback */}
        {feedback && (
          <ScaleFade initialScale={0.9} in={!!feedback} unmountOnExit>
            <Box
              ref={feedbackRef}
              p={6}
              // bg="green.50"
              borderRadius="2xl"
              borderLeft="8px solid"
              borderColor="green.400"
              shadow="md"
              className="animate-fade-in"
            >
              <HStack mb={4}>
                <Star size={24} className="text-yellow-400 animate-spin-slow" />
                <Text fontSize="xl" fontWeight="bold" color="green.800">
                  Feedback & Tips
                </Text>
              </HStack>
              <Box
                className="feedback-result"
                dangerouslySetInnerHTML={{ __html: formatFeedback(feedback) }}
              />
            </Box>
          </ScaleFade>
        )}
      </VStack>

      {/* Modal Overlay */}
      {isOpen && (
        <Box
          position="fixed"
          top={0}
          left={0}
          right={0}
          bottom={0}
          bg="blackAlpha.600"
          zIndex={9998}
          onClick={onClose}
        />
      )}

      {/* Styles */}
      <style jsx>{`
        @keyframes pulse-slow {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }
        @keyframes bounce-slow {
          0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
          40% { transform: translateY(-5px); }
          60% { transform: translateY(-3px); }
        }
        @keyframes spin-slow {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes slide-in {
          from {
            opacity: 0;
            transform: translateX(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        @keyframes bounce-in {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        .animate-pulse-slow {
          animation: pulse-slow 2s infinite;
        }
        .animate-bounce-slow {
          animation: bounce-slow 2s infinite;
        }
        .animate-spin-slow {
          animation: spin-slow 3s linear infinite;
        }
        .animate-slide-in {
          animation: slide-in 0.5s ease-out forwards;
        }
        .animate-bounce-in {
          animation: bounce-in 0.6s ease-out forwards;
        }
        .delay-100 {
          animation-delay: 0.1s;
        }
        .delay-200 {
          animation-delay: 0.2s;
        }
        .feedback-result::-webkit-scrollbar {
          width: 8px;
        }
        .feedback-result::-webkit-scrollbar-track {
          background: transparent;
        }
        .feedback-result::-webkit-scrollbar-thumb {
          background: rgba(147, 51, 234, 0.3);
          border-radius: 4px;
        }
      `}</style>
    </Box>
  );
};

export default Sentence;