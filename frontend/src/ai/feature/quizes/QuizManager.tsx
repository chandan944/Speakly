import { useState, useEffect } from "react";
import {
  Box,
  VStack,
  HStack,
  Button,
  Input,
  Text,
  Textarea,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  useDisclosure,
  useToast,
  Avatar,
  Alert,
  AlertIcon,
  Spinner,
  Wrap,
  WrapItem,
  IconButton,
  Select,
  useColorModeValue,
  Card,
  CardBody,
  CardFooter,
  Heading,
  Divider,
  ScaleFade,
  usePrefersReducedMotion,
  AlertTitle,
  Image,
  Flex,
} from "@chakra-ui/react";
import { useAuthentication } from "../../../features/authentication/context/AuthenticationContextProvider";
import { AddIcon, DeleteIcon } from "@chakra-ui/icons";
import { Gamepad, PlayIcon, Send } from "lucide-react";
import { IoCheckmarkDoneCircleSharp } from "react-icons/io5";
import { MdDoNotTouch } from "react-icons/md";
import Meaning from "../word/Meaning";
import { usePageTitle } from "../../../hook/usePageTitle";

// === INTERFACES ===
interface Question {
  questionText: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctOption: string;
  explanation: string;
}

interface Quiz {
  id: number;
  photoUrl: string;
  caption: string;
  questions: Question[];
}

// === CONFIG ===
const API_BASE = "http://localhost:8080/api/quizzes";

export default function QuizApp() {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentQuiz, setCurrentQuiz] = useState<Quiz | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [score, setScore] = useState(0);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [photoUrl, setPhotoUrl] = useState("");
  const [caption, setCaption] = useState("");
  const [formQuestions, setFormQuestions] = useState<Question[]>(
    Array(10)
      .fill(null)
      .map(() => ({
        questionText: "",
        optionA: "",
        optionB: "",
        optionC: "",
        optionD: "",
        correctOption: "a",
        explanation: "",
      }))
  );

  // Hooks
  const { user } = useAuthentication();
  const toast = useToast();
  const {
    isOpen: isCreateOpen,
    onOpen: onCreateOpen,
    onClose: onCreateClose,
  } = useDisclosure();
  const {
    isOpen: isViewOpen,
    onOpen: onViewOpen,
    onClose: onViewClose,
  } = useDisclosure();
  const prefersReducedMotion = usePrefersReducedMotion();

  // ✅ Admin check
  const isAdmin = user?.email === "chandanprajapati6307@gmail.com";

  // 🎨 Theme colors
  // const bgColor = useColorModeValue("gray.200", "gray.900");
  // const cardBg = useColorModeValue("white", "gray.800");
  // const textColor = useColorModeValue("gray.800", "white");
  // const accentColor = useColorModeValue("gray.200", "gray.800"); // Hot pink
  // const softBlue = useColorModeValue("blue.200", "blue.700");

  usePageTitle("Quiz");
  // Fetch quizzes
  const fetchQuizzes = async () => {
    setFetching(true);
    setError(null);
    try {
      const res = await fetch(API_BASE, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });

      if (!res.ok) {
        if (res.status === 401) {
          toast({
            title: "Session expired",
            description: "Please log in again",
            status: "error",
            duration: 5000,
          });
          return;
        }
        throw new Error("Failed to load quizzes");
      }

      const data = await res.json();
      const quizArray = Array.isArray(data) ? data : [data];
      setQuizzes(quizArray.filter((q) => q));
    } catch (err) {
      setError("Failed to load quizzes. Check your connection.");
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    fetchQuizzes();
  }, []);

  // Create quiz
  const createQuiz = async () => {
    if (!isAdmin) {
      toast({
        title: "Permission denied",
        description: "Only admin can create quizzes",
        status: "warning",
      });
      return;
    }

    if (!caption.trim() || !photoUrl.trim()) {
      toast({ title: "Caption and photo URL are required", status: "warning" });
      return;
    }

    const requestBody = {
      photoUrl: photoUrl,
      caption: caption,
      questions: formQuestions, // Don't stringify here
    };

    try {
      const res = await fetch(API_BASE, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json", // Add this header
        },
        body: JSON.stringify(requestBody), // Stringify the entire object
      });

      if (res.ok) {
        const newQuiz = await res.json();
        setQuizzes([...quizzes, newQuiz]);
        toast({
          title: "🎉 Quiz created!",
          description: "New quiz is live!",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
        resetForm();
        onCreateClose();
      } else {
        const error = await res.text();
        toast({ title: "Create failed", description: error, status: "error" });
      }
    } catch (err) {
      toast({ title: "Network error", status: "error" });
    }
  };

  const resetForm = () => {
    setPhotoUrl("");
    setCaption("");
    setFormQuestions(
      Array(10)
        .fill(null)
        .map(() => ({
          questionText: "",
          optionA: "",
          optionB: "",
          optionC: "",
          optionD: "",
          correctOption: "a",
          explanation: "",
        }))
    );
  };

  // Delete quiz
  const deleteQuiz = async (id: number) => {
    if (!isAdmin) {
      toast({ title: "Only admin can delete", status: "warning" });
      return;
    }

    if (!window.confirm("Delete this quiz? This cannot be undone.")) return;

    try {
      const res = await fetch(`${API_BASE}/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });

      if (res.ok) {
        setQuizzes(quizzes.filter((q) => q.id !== id));
        toast({ title: "🗑️ Quiz deleted", status: "success", duration: 2000 });
      } else {
        toast({ title: "Delete failed", status: "error" });
      }
    } catch (err) {
      toast({ title: "Network error", status: "error" });
    }
  };

  // Play quiz
  const startQuiz = (quiz: Quiz) => {
    if (!quiz.questions?.length) {
      toast({ title: "No questions in this quiz", status: "warning" });
      return;
    }
    setCurrentQuiz(quiz);
    setCurrentQuestionIndex(0);
    setSelectedOption(null);
    setShowExplanation(false);
    setScore(0);
    setIsPlaying(true);
    onViewOpen();
  };

  const submitAnswer = () => {
    if (!selectedOption || !currentQuiz) return;
    const correct =
      selectedOption ===
      currentQuiz.questions[currentQuestionIndex].correctOption;
    if (correct) setScore(score + 1);
    setShowExplanation(true);
  };

  const nextQuestion = () => {
    if (currentQuestionIndex < (currentQuiz?.questions.length || 0) - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedOption(null);
      setShowExplanation(false);
    } else {
      const finalScore =
        score +
        (selectedOption ===
        currentQuiz?.questions[currentQuestionIndex].correctOption
          ? 1
          : 0);
      toast({
        title: `🎉 Quiz Complete! Score: ${finalScore}/${currentQuiz?.questions.length}`,
        status: "success",
        duration: 4000,
      });
      setIsPlaying(false);
      onViewClose();
    }
  };

  // === RENDERING ===
  return (
    <Box
     
      minH="100vh"
      p={6}
      fontFamily="'Comic Sans MS', 'Chalkboard SE', 'Arial', sans-serif"
      
    >
      <VStack spacing={8} maxW="6xl" mx="auto">
        {/* Header */}
        <ScaleFade initialScale={0.8} in={true}>
          <VStack align="start" spacing={1}>
            <Heading
              display="flex"
              alignItems="center"
              justifyContent="center"
              gap={2}
              size="md"
              fontWeight="bold"
              color="green.300"
              textShadow="1px 1px 2px rgba(0,0,0,0.1)"
            >
              <Gamepad size={"140px"} /> English Quiz Adventure
            </Heading>
            <Text fontSize="lg" color="gray.600" fontStyle="italic">
              Learn, Play, Level Up!
            </Text>
          </VStack>
        </ScaleFade>

        {/* Admin Badge */}
        {isAdmin && (
          <Alert
            status="info"
            borderRadius="xl"
            maxW="3xl"
            variant="subtle"
            bg="purple.50"
            border="2px dashed #D63384"
          >
            <AlertIcon />
            <AlertTitle>
              👑 Admin Mode Active • Only you can create & delete
            </AlertTitle>
          </Alert>
        )}

        {/* Error */}
        {error && (
          <Alert status="error" borderRadius="md">
            <AlertIcon />
            <Text>{error}</Text>
          </Alert>
        )}

        {/* Loading */}
        {fetching ? (
          <VStack>
            <Spinner size="xl" color="pink.400" />
            <Text fontSize="lg" color="pink.500">
              Loading quizzes...
            </Text>
          </VStack>
        ) : quizzes.length === 0 ? (
          <Text fontSize="xl" color="gray.500" textAlign="center">
            📚 No quizzes yet. Be the first to create one!
          </Text>
        ) : (
          <Wrap justify="center" spacing={6} w="full">
            {quizzes.map((quiz, index) => (
              <ScaleFade
                key={quiz.id}
                initialScale={0.9}
                in={true}
                delay={index * 0.1}
              >
                <WrapItem>
                  <Card
                   
                    shadow="lg"
                    borderRadius="xl"
                    overflow="hidden"
                    maxW="16rem"
                    minW="16rem"
                    transition="all 0.3s ease"
                    border="1px solid"
                    borderColor="blackAlpha.500"
                    _hover={{
                      transform: "translateY(-6px) scale(1.02)",
                      shadow: "xl",
                    }}
                  >
                    <Box h="180px" position="relative" bg="gray.100">
                      <Image
                        src={quiz.photoUrl}
                        alt={quiz.caption}
                        objectFit="cover"
                        width="100%"
                        height="100%"
                        fallbackSrc="https://via.placeholder.com/300x180?text=No+Image" // fallback in case image is broken
                      />
                    </Box>

                    <CardBody textAlign="center" p={5} >
                      <Heading
                        size="xs"
                        
                        
                        fontWeight="semibold"
                        fontFamily="Poppins"
                      >
                        {quiz.caption}
                      </Heading>
                      <Text mt={2}  fontSize="sm">
                        {quiz.questions.length} brain teasers
                      </Text>
                    </CardBody>

                    <Divider borderColor="gray.200" />

                    <CardFooter>
                      <HStack spacing={3} w="full" justify="space-between">
                        <Button
                          leftIcon={<PlayIcon size={16} />}
                          bg={"blue.500"}
                          size="sm"
                          onClick={() => startQuiz(quiz)}
                          _hover={{ bg: "blue.600" }}
                          color={"white"}
                        >
                          Play
                        </Button>
                        {isAdmin && (
                          <IconButton
                            icon={<DeleteIcon />}
                            colorScheme="red"
                            size="sm"
                            aria-label="Delete"
                            onClick={() => deleteQuiz(quiz.id)}
                            _hover={{
                              transform: "scale(1.1)",
                              bg: "red.200",
                            }}
                          />
                        )}
                      </HStack>
                    </CardFooter>
                  </Card>
                </WrapItem>
              </ScaleFade>
            ))}
          </Wrap>
        )}

        {/* Admin Create Button */}
        {isAdmin && (
          <Button
            leftIcon={<AddIcon />}
            colorScheme="purple"
            size="lg"
            onClick={onCreateOpen}
            borderRadius="full"
            px={8}
            fontSize="lg"
            boxShadow="2xl"
            bgGradient="linear(to-r, #9D4EDD, #7209B7)"
            _hover={{ transform: "scale(1.05)", boxShadow: "dark-lg" }}
            animation={!prefersReducedMotion ? "pulse 2s infinite" : "none"}
          >
            Create New Quiz
          </Button>
        )}
      </VStack>

      {/* === CREATE MODAL === */}
      <Modal isOpen={isCreateOpen} onClose={onCreateClose} size="2xl">
        <ModalOverlay backdropFilter="blur(10px)" />
        <ModalContent  borderRadius="2xl" fontFamily="inherit">
          <ModalHeader  fontSize="2xl">
            Create New Quiz
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={5}>
              <Input
                placeholder="📸 Photo URL"
                value={photoUrl}
                onChange={(e) => setPhotoUrl(e.target.value)}
                isRequired
                variant="filled"
                bg="pink.50"
                _focus={{ bg: "white" }}
              />
              <Input
                placeholder="📝 Caption"
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                isRequired
                variant="filled"
                bg="blue.50"
                _focus={{ bg: "white" }}
              />
              {formQuestions.map((q, i) => (
                <Box
                  key={i}
                  w="full"
                  p={5}
                  border="2px dashed"
                  borderColor="pink.300"
                  borderRadius="xl"
                  bg="white"
                  _hover={{ boxShadow: "md" }}
                >
                  <Text fontWeight="bold" >
                    Question {i + 1}
                  </Text>
                  <Textarea
                    placeholder="❓ Question text"
                    value={q.questionText}
                    onChange={(e) => {
                      const newQs = [...formQuestions];
                      newQs[i].questionText = e.target.value;
                      setFormQuestions(newQs);
                    }}
                    isRequired
                    mt={2}
                  />
                  <HStack mt={3}>
                    {["a", "b", "c", "d"].map((opt) => (
                      <Input
                        key={opt}
                        placeholder={`🔤 Option ${opt}`}
                        value={q[`option${opt.toUpperCase()}`]}
                        onChange={(e) => {
                          const newQs = [...formQuestions];
                          newQs[i][`option${opt.toUpperCase()}`] =
                            e.target.value;
                          setFormQuestions(newQs);
                        }}
                        isRequired
                      />
                    ))}
                  </HStack>
                  <HStack mt={3}>
                    <Select
                      value={q.correctOption}
                      onChange={(e) => {
                        const newQs = [...formQuestions];
                        newQs[i].correctOption = e.target.value;
                        setFormQuestions(newQs);
                      }}
                      w="auto"
                      colorScheme="pink"
                    >
                      <option value="a">A</option>
                      <option value="b">B</option>
                      <option value="c">C</option>
                      <option value="d">D</option>
                    </Select>
                    <Input
                      placeholder="💡 Explanation"
                      value={q.explanation}
                      onChange={(e) => {
                        const newQs = [...formQuestions];
                        newQs[i].explanation = e.target.value;
                        setFormQuestions(newQs);
                      }}
                      isRequired
                    />
                  </HStack>
                </Box>
              ))}
            </VStack>
          </ModalBody>
          <Box p={6} borderTop="1px" borderColor="gray.200">
            <HStack w="full" justify="end">
              <Button onClick={onCreateClose} variant="outline">
                Cancel
              </Button>
              <Button colorScheme="purple" onClick={createQuiz}>
                Create Quiz
              </Button>
            </HStack>
          </Box>
        </ModalContent>
      </Modal>

      {/* === PLAY MODAL === */}
      <Modal isOpen={isViewOpen} onClose={onViewClose} size="xl">
        <ModalOverlay />
        <ModalContent  borderRadius="2xl">
         
          <ModalCloseButton />
          <ModalBody>
            {currentQuiz && (
              <VStack spacing={6}>
                <Text fontSize="1.2rem" fontWeight="medium" color="green.300">
                  {currentQuestionIndex + 1}.{" "}
                  {currentQuiz.questions[currentQuestionIndex].questionText}
                </Text>
                <Box
                  zIndex={1}
                  position="sticky"
                  top="20"
                  alignSelf="flex-start"
                  ml="-23px" // adjust until flush with edge
                >
                  <Meaning />
                </Box>

                <VStack spacing={3}>
                  {["a", "b", "c", "d"].map((opt) => (
                    <Button
                      key={opt}
                      w="full"
                      variant={selectedOption === opt ? "solid" : "outline"}
                      colorScheme={selectedOption === opt ? "blue" : "gray"}
                      onClick={() => setSelectedOption(opt)}
                      isDisabled={showExplanation}
                      borderRadius="full"
                      py={3}
                      fontWeight="bold"
                      fontSize="0.9rem"
                      _hover={{ transform: "translateX(4px)", shadow: "md" }}
                    >
                      {opt.toUpperCase()} .{" "}
                      {
                        currentQuiz.questions[currentQuestionIndex][
                          `option${opt.toUpperCase()}`
                        ]
                      }
                    </Button>
                  ))}
                </VStack>

                {showExplanation ? (
                  <Box
                    p={6}
                    bgGradient="linear(to-r, white, gray.50)"
                    borderRadius="xl"
                    w="full"
                    textAlign="center"
                    // color="white"
                  >
                    <Flex direction="column" align="center" textAlign="center">
                      <Text
                        fontWeight="bold"
                        fontSize="2xl"
                        color={
                          selectedOption ===
                          currentQuiz.questions[currentQuestionIndex]
                            .correctOption
                            ? "green.500"
                            : "red.500"
                        }
                      >
                        {selectedOption ===
                        currentQuiz.questions[currentQuestionIndex]
                          .correctOption ? (
                          <IoCheckmarkDoneCircleSharp />
                        ) : (
                          <MdDoNotTouch />
                        )}
                      </Text>
                      <Text fontSize="sm" mt={2}>
                        
                        <strong>
                          Correct answer:{" "}
                          {
                            currentQuiz.questions[currentQuestionIndex]
                              .correctOption
                          }
                        </strong>
                      </Text>
                    </Flex>
                    <Text fontSize="md" mt={1}>
                      <strong>Explanation:</strong>{" "}
                      {currentQuiz.questions[currentQuestionIndex].explanation}
                    </Text>
                    <Button
                      mt={2}
                      // w="full"
                      colorScheme="green"
                      onClick={nextQuestion}
                      size="md"
                      borderRadius="full"
                    >
                      {currentQuestionIndex < currentQuiz.questions.length - 1
                        ? " Next Question"
                        : " Finish Quiz"}
                    </Button>
                  </Box>
                ) : (
                  <Button
                    display={"flex"}
                    justifyContent={"center"}
                    alignItems={"center"}
                    gap={2}
                    p={4}
                    bg="green.400"
                    size="md"
                    isDisabled={!selectedOption}
                    onClick={submitAnswer}
                    borderRadius="full"
                    fontWeight="bold"
                  >
                    <Send /> Submit
                  </Button>
                )}
              </VStack>
            )}
          </ModalBody>
        </ModalContent>
      </Modal>

      {/* Custom Animations */}
      <style jsx>{`
        @keyframes pulse {
          0%,
          100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.05);
          }
        }
        [style*="animation: pulse"] {
          animation: pulse 2s infinite;
        }
      `}</style>
    </Box>
  );
}
