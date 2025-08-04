import { useState, useRef, useEffect, useCallback } from "react";
import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  Card,
  CardBody,
  useToast,
  IconButton,
  Avatar,
  Divider,
  Badge,
  Spinner,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
} from "@chakra-ui/react";
import { Mic, StopCircle, RefreshCw, Volume2, VolumeX, MessageSquare } from "lucide-react";
import { useAuthentication } from "../../../features/authentication/context/AuthenticationContextProvider";

// === VOICE FEEDBACK ASSISTANT ===
const VoiceAssistant = () => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [feedback, setFeedback] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [hasError, setHasError] = useState(false);
  const toast = useToast();
  const {user} = useAuthentication(); // Assuming you have a user context
  const recognitionRef = useRef<any>(null);
  const synthRef = useRef<any>(null);

  // Gemini API Configuration (Replace with your actual API key)
  const API_KEY = "AIzaSyBM7_ac70ZpFIcXMoTWuASYyZNBAS_c78A";
  const MODEL = "gemini-1.5-flash";
  const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${API_KEY}`;

  // Get feedback from Gemini
  const getFeedbackFromGemini = useCallback(async (text: string) => {
    if (!text.trim() || isProcessing) return;
    
    console.log("🔄 Processing speech:", text);
    setIsProcessing(true);
    setHasError(false);
    
    const prompt = `Act like my funny, friendly English buddy 😎. I’ll say something in English — just reply like a casual friend correcting me. No tips, no points, no scoring. Just tell what’s off, what sounds weird, and how to say it better — with some jokes, light roasting, and a little ${user?.nativeLanguage} if needed. Keep it short and chatty. End with a fun question.

Text: "${text}"

`;
    
    try {
      const response = await fetch(GEMINI_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: prompt }]
          }],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 1024,
          }
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("❌ Gemini API error:", response.status, errorText);
        throw new Error(`API Error: ${response.status}`);
      }

      const data = await response.json();
      const feedbackText = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
      
      if (!feedbackText) {
        throw new Error("No feedback received from API");
      }
      
      console.log("✅ Feedback received from Gemini");
      setFeedback(feedbackText);
      
      // Read the feedback aloud after a short delay
      setTimeout(() => {
        readAloud(feedbackText);
      }, 500);
      
      toast({
        title: "✅ Feedback received",
        status: "success",
        duration: 2000,
      });
      
    } catch (err) {
      console.error("❌ Error calling Gemini API:", err);
      setHasError(true);
      const errorMessage = "Sorry, I couldn't analyze your English. Please check your API key and try again.";
      setFeedback(errorMessage);
      
      toast({
        title: "❌ Analysis Error",
        description: "Failed to get feedback from AI",
        status: "error",
        duration: 4000,
      });
    } finally {
      setIsProcessing(false);
    }
  }, [isProcessing, GEMINI_URL, toast]);

  // Initialize Speech Recognition
  useEffect(() => {
    console.log("🎤 Initializing Speech Recognition...");
    
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      console.error("❌ Speech Recognition not supported");
      toast({
        title: "⚠️ Browser not supported",
        description: "Please use Chrome, Edge, or Safari",
        status: "warning",
        duration: 5000,
      });
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true; // Keep listening continuously
    recognition.interimResults = true; // Show results as you speak
    recognition.maxAlternatives = 1;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      console.log("🎤 Speech recognition started");
    };

    recognition.onresult = (event: any) => {
      let finalTranscript = '';
      let interimTranscript = '';

      // Process all results
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        
        if (event.results[i].isFinal) {
          finalTranscript += transcript;
        } else {
          interimTranscript += transcript;
        }
      }

      // Update transcript with both final and interim results
      const currentTranscript = finalTranscript + interimTranscript;
      console.log("📝 Transcript updated:", currentTranscript);
      setTranscript(currentTranscript.trim());
    };

    recognition.onend = () => {
      console.log("🛑 Speech recognition ended");
      
      // Only restart if we're still supposed to be listening
      if (isListening) {
        console.log("🔄 Restarting recognition...");
        try {
          recognition.start();
        } catch (error) {
          console.error("❌ Failed to restart recognition:", error);
          setIsListening(false);
        }
      }
    };

    recognition.onerror = (event: any) => {
      console.error("❌ Speech recognition error:", event.error);
      
      // Handle different types of errors
      if (event.error === 'no-speech') {
        console.log("⚠️ No speech detected, continuing to listen...");
        // Don't stop listening for no-speech errors
        return;
      }
      
      if (event.error === 'audio-capture') {
        setIsListening(false);
        setHasError(true);
        toast({
          title: "🎤 Microphone Error",
          description: "Please check microphone permissions",
          status: "error",
          duration: 4000,
        });
        return;
      }
      
      if (event.error === 'not-allowed') {
        setIsListening(false);
        setHasError(true);
        toast({
          title: "🚫 Permission Denied",
          description: "Please allow microphone access",
          status: "error",
          duration: 4000,
        });
        return;
      }
      
      // For other errors, try to restart
      console.log("🔄 Attempting to restart after error...");
      setTimeout(() => {
        if (isListening) {
          try {
            recognition.start();
          } catch (error) {
            console.error("❌ Failed to restart after error:", error);
            setIsListening(false);
          }
        }
      }, 1000);
    };

    recognitionRef.current = recognition;
    console.log("✅ Speech Recognition initialized");

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [isListening, toast]);

  // Start listening
  const startListening = () => {
    if (isProcessing || isListening) return;
    
    console.log("▶️ Starting to listen...");
    setTranscript("");
    setFeedback("");
    setHasError(false);
    
    try {
      recognitionRef.current?.start();
      setIsListening(true);
      
      toast({
        title: "🎤 Listening...",
        description: "Speak your English clearly",
        status: "info",
        duration: 2000,
      });
    } catch (error) {
      console.error("❌ Could not start listening:", error);
      toast({
        title: "❌ Could not start",
        description: "Check microphone permissions",
        status: "error",
        duration: 3000,
      });
    }
  };

  // Stop listening
  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      console.log("⏹️ Stopping listening...");
      recognitionRef.current.stop();
      setIsListening(false);
      
      // Process the final transcript
      if (transcript.trim()) {
        console.log("🔄 Processing final transcript:", transcript);
        getFeedbackFromGemini(transcript);
      }
      
      toast({
        title: "⏹️ Stopped listening",
        description: "Processing your speech...",
        status: "info",
        duration: 2000,
      });
    }
  };

  // Read feedback aloud
  const readAloud = (text: string) => {
    if (!text || !window.speechSynthesis) {
      console.warn("⚠️ Speech synthesis not available");
      return;
    }
    
    console.log("🔊 Reading feedback aloud...");
    setIsSpeaking(true);
    window.speechSynthesis.cancel();
    
    // Clean the text for better speech
    const cleanText = text
      .replace(/\*\*(.*?)\*\*/g, '$1') // Remove markdown bold
      .replace(/^\s*[-•]\s*/gm, '') // Remove bullet points
      .replace(/\n+/g, '. ') // Replace newlines with periods
      .trim();
    
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = 'en-US';
    utterance.rate = 0.8;
    utterance.pitch = 1;
    utterance.volume = 0.8;
    
    utterance.onstart = () => {
      console.log("🔊 Speech started");
    };
    
    utterance.onend = () => {
      console.log("🔇 Speech ended");
      setIsSpeaking(false);
    };
    
    utterance.onerror = (event) => {
      console.error("❌ Speech error:", event.error);
      setIsSpeaking(false);
      toast({
        title: "🔊 Speech Error",
        description: "Failed to read feedback aloud",
        status: "error",
        duration: 3000,
      });
    };
    
    window.speechSynthesis.speak(utterance);
  };

  // Stop speaking
  const stopSpeaking = () => {
    if (window.speechSynthesis) {
      console.log("🔇 Stopping speech...");
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  // Clear everything
  const clearAll = () => {
    console.log("🧹 Clearing all data...");
    
    setTranscript("");
    setFeedback("");
    setIsListening(false);
    setIsProcessing(false);
    setIsSpeaking(false);
    setHasError(false);
    
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
    }
    
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    
    toast({
      title: "🧹 Cleared",
      description: "Ready for new speech",
      status: "info",
      duration: 2000,
    });
  };

  // Format feedback for better display
  const formatFeedback = (text: string) => {
    if (!text) return [];
    
    const lines = text.split('\n').filter(line => line.trim());
    const sections: { type: string; content: string; color: string }[] = [];
    
    lines.forEach(line => {
      const trimmed = line.trim();
      
      if (trimmed.includes('**Score:**')) {
        sections.push({
          type: 'score',
          content: trimmed.replace(/\*\*/g, ''),
          color: 'green'
        });
      } else if (trimmed.includes('**Issues Found:**')) {
        sections.push({
          type: 'header',
          content: 'Issues Found:',
          color: 'orange'
        });
      } else if (trimmed.includes('**Improved Version:**')) {
        sections.push({
          type: 'header',
          content: 'Improved Version:',
          color: 'blue'
        });
      } else if (trimmed.includes('**Tips:**')) {
        sections.push({
          type: 'header',
          content: 'Tips:',
          color: 'purple'
        });
      } else if (trimmed.includes('**Encouragement:**')) {
        sections.push({
          type: 'header',
          content: 'Encouragement:',
          color: 'green'
        });
      } else if (trimmed.startsWith('-') || trimmed.startsWith('•')) {
        sections.push({
          type: 'bullet',
          content: trimmed.replace(/^[-•]\s*/, ''),
          color: 'gray'
        });
      } else if (trimmed.startsWith('"') && trimmed.endsWith('"')) {
        sections.push({
          type: 'quote',
          content: trimmed,
          color: 'blue'
        });
      } else if (trimmed.length > 0) {
        sections.push({
          type: 'text',
          content: trimmed,
          color: 'gray'
        });
      }
    });
    
    return sections;
  };

  const feedbackSections = formatFeedback(feedback);

  return (
    <Box 
      bg="gray.50" 
      minH="100vh" 
      p={4}
      maxW="2xl"
      mx="auto"
    >
      <VStack spacing={6} align="stretch" mt={8}>
        
        {/* Header */}
        <VStack spacing={3}>
          <Avatar
            size="xl"
            name="AI Assistant"
            bg="gradient"
            bgGradient="linear(to-r, blue.500, purple.500, pink.500)"
            icon={<MessageSquare size={32} color="white" />}
          />
          <Text fontSize="3xl" fontWeight="bold" textAlign="center">
            🎤 English Feedback Assistant
          </Text>
          <Text textAlign="center" color="gray.600" fontSize="lg">
            Speak English → Get AI feedback → Listen to suggestions
          </Text>
        </VStack>

        {/* API Key Warning */}
        {API_KEY === "YOUR_API_KEY_HERE" && (
          <Alert status="warning" borderRadius="lg">
            <AlertIcon />
            <Box>
              <AlertTitle>API Key Required!</AlertTitle>
              <AlertDescription>
                Please set your Gemini API key in environment variables or replace the placeholder.
              </AlertDescription>
            </Box>
          </Alert>
        )}

        {/* Main Card */}
        <Card variant="elevated" shadow="xl">
          <CardBody>
            <VStack spacing={6}>
              
              {/* Mic Control */}
              <VStack spacing={4}>
                <HStack justify="center" spacing={4}>
                  {isListening ? (
                    <IconButton
                      icon={<StopCircle size={32} />}
                      aria-label="Stop listening"
                      colorScheme="red"
                      size="lg"
                      onClick={stopListening}
                      borderRadius="full"
                      boxShadow="lg"
                      isLoading={false}
                      height="80px"
                      width="80px"
                    />
                  ) : (
                    <IconButton
                      icon={<Mic size={32} />}
                      aria-label="Start listening"
                      colorScheme="blue"
                      size="lg"
                      onClick={startListening}
                      borderRadius="full"
                      boxShadow="lg"
                      isDisabled={isProcessing}
                      height="80px"
                      width="80px"
                    />
                  )}
                </HStack>

                {/* Status Indicators */}
                <VStack spacing={2}>
                  {isListening && (
                    <HStack spacing={2} align="center">
                      <Box
                        w={3}
                        h={3}
                        bg="red.500"
                        borderRadius="full"
                        animation="pulse 1.5s infinite"
                      />
                      <Badge colorScheme="red" fontSize="sm" px={3} py={1}>
                        🎤 Listening...
                      </Badge>
                    </HStack>
                  )}
                  
                  {isProcessing && (
                    <HStack spacing={2} align="center">
                      <Spinner size="sm" color="blue.500" />
                      <Badge colorScheme="blue" fontSize="sm" px={3} py={1}>
                        🤖 AI Analyzing...
                      </Badge>
                    </HStack>
                  )}
                  
                  {isSpeaking && (
                    <HStack spacing={2} align="center">
                      <Box
                        w={3}
                        h={3}
                        bg="green.500"
                        borderRadius="full"
                        animation="pulse 1.5s infinite"
                      />
                      <Badge colorScheme="green" fontSize="sm" px={3} py={1}>
                        🔊 Speaking...
                      </Badge>
                    </HStack>
                  )}
                </VStack>
              </VStack>

              {/* Your Speech */}
              {transcript && (
                <Box
                  p={5}
                  bg="blue.50"
                  borderRadius="xl"
                  width="100%"
                  borderLeft="4px solid"
                  borderLeftColor="blue.400"
                >
                  <Text fontWeight="bold" color="blue.700" mb={3} fontSize="lg">
                    📝 Your Speech:
                  </Text>
                  <Text color="blue.800" fontSize="md" lineHeight="1.6">
                    "{transcript}"
                  </Text>
                  {isListening && (
                    <Text fontSize="sm" color="blue.600" mt={2} fontStyle="italic">
                      Keep speaking... Click stop when finished.
                    </Text>
                  )}
                </Box>
              )}

              {/* Feedback Display */}
              {feedback && (
                <Box
                  p={5}
                  bg={hasError ? "red.50" : "green.50"}
                  borderRadius="xl"
                  width="100%"
                  borderLeft="4px solid"
                  borderLeftColor={hasError ? "red.400" : "green.400"}
                >
                  <HStack justify="space-between" mb={4}>
                    <Text fontWeight="bold" color={hasError ? "red.700" : "green.700"} fontSize="lg">
                      🤖 AI Feedback:
                    </Text>
                    {!hasError && (
                      <HStack spacing={2}>
                        <IconButton
                          icon={isSpeaking ? <VolumeX size={18} /> : <Volume2 size={18} />}
                          aria-label={isSpeaking ? "Stop speaking" : "Read aloud"}
                          size="sm"
                          colorScheme="green"
                          onClick={isSpeaking ? stopSpeaking : () => readAloud(feedback)}
                          borderRadius="lg"
                        />
                      </HStack>
                    )}
                  </HStack>
                  
                  {hasError ? (
                    <Text color="red.800" fontSize="md">
                      {feedback}
                    </Text>
                  ) : (
                    <VStack spacing={3} align="stretch">
                      {feedbackSections.map((section, index) => (
                        <Box key={index}>
                          {section.type === 'score' && (
                            <Badge colorScheme="green" fontSize="md" px={3} py={1} borderRadius="full">
                              {section.content}
                            </Badge>
                          )}
                          {section.type === 'header' && (
                            <Text fontWeight="bold" color={`${section.color}.700`} fontSize="md" mt={3}>
                              {section.content}
                            </Text>
                          )}
                          {section.type === 'bullet' && (
                            <Text color="gray.700" fontSize="sm" ml={4}>
                              • {section.content}
                            </Text>
                          )}
                          {section.type === 'quote' && (
                            <Box
                              p={3}
                              bg="blue.100"
                              borderRadius="md"
                              borderLeft="3px solid"
                              borderLeftColor="blue.400"
                              fontStyle="italic"
                            >
                              <Text color="blue.800" fontSize="md">
                                {section.content}
                              </Text>
                            </Box>
                          )}
                          {section.type === 'text' && (
                            <Text color="gray.700" fontSize="sm" lineHeight="1.6">
                              {section.content}
                            </Text>
                          )}
                        </Box>
                      ))}
                    </VStack>
                  )}
                </Box>
              )}

              {/* Clear Button */}
              {(transcript || feedback) && (
                <Button
                  leftIcon={<RefreshCw size={18} />}
                  variant="outline"
                  colorScheme="gray"
                  size="lg"
                  onClick={clearAll}
                  width="full"
                  borderRadius="xl"
                >
                  🔄 Start Over
                </Button>
              )}
            </VStack>
          </CardBody>
        </Card>

        {/* Instructions */}
        <Box
          p={5}
          bg="white"
          borderRadius="xl"
          shadow="sm"
          border="1px solid"
          borderColor="gray.200"
        >
          <Text fontSize="lg" fontWeight="bold" mb={3} textAlign="center">
            💡 How to Use:
          </Text>
          <VStack spacing={2} align="start">
            <Text fontSize="sm" color="gray.600">
              1. 🎤 Click the microphone button to start listening
            </Text>
            <Text fontSize="sm" color="gray.600">
              2. 🗣️ Speak clearly in English about any topic
            </Text>
            <Text fontSize="sm" color="gray.600">
              3. 🤖 AI will analyze your speech and provide feedback
            </Text>
            <Text fontSize="sm" color="gray.600">
              4. 🔊 Listen to the feedback or read it on screen
            </Text>
          </VStack>
        </Box>
      </VStack>

      {/* Custom Styles */}
      <style jsx>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
      `}</style>
    </Box>
  );
};

export default VoiceAssistant;