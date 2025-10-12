import {
  Box,
  Card,
  CardBody,
  Image,
  Heading,
  Text,
  SimpleGrid,
  Container,
  VStack,
  Button,
  useColorModeValue,
  Badge,
} from "@chakra-ui/react";
import { Play } from "lucide-react";
import { Link as RouterLink } from "react-router-dom";

const CardPage = () => {
  const bgColor = useColorModeValue("gray.50", "gray.900");
  const cardBg = useColorModeValue("white", "gray.800");
  const buttonBg = useColorModeValue("blue.500", "blue.600");
  const buttonHoverBg = useColorModeValue("blue.600", "blue.700");

  // Sample card data
  const cardsData = [
    {
      id: 1,
      link: "/arrange",
      image: "/ArrangeTheWord.png",
      title: "Sentence Builder Quest",
      emoji: "🏰",
      description:
        "A fun word-adventure game where players arrange random words into grammatically correct sentences. Earn points and feedback for clever answers!",
      difficulty: "Medium",
    },
    {
      id: 2,
      link: "/fillintheblank",
      image: "/Fill.png",
      title: "Fill in the Blank Challenge",
      emoji: "✍️",
      description:
        "Guess the missing word and complete the sentence! A fun way to test your vocabulary and grammar skills.",
      difficulty: "Easy",
    },
    {
      id: 3,
      link: "/findmsitek",
      image: "/FindMisteck.png",
      title: "Find the Mistake",
      emoji: "🔍",
      description:
        "Spot the wrong word in a sentence! The AI shows a sentence with one sneaky mistake hidden inside. Catch it fast, correct it, and earn points!",
      difficulty: "Medium",
    },
    {
      id: 4,
      link: "/fakeword",
      image: "/GuessFakeWord.png",
      title: "Guess the Fake Word",
      emoji: "🌀",
      description:
        "Three words appear — two are real and one is fake. Tap on a word to reveal its meaning. Spot the fake one and win! A mix of vocabulary and detective skills.",
      difficulty: "Hard",
    },
    {
      id: 5,
      link: "/emojipuzzlegame",
      image: "/emojii.png",
      title: "Emoji Puzzle Game",
      emoji: "🤩",
      description:
        "Decode fun emoji combinations! Guess the word, phrase, or sentence from 2–4 emojis. Great for creativity and language practice.",
      difficulty: "Easy",
    },
    {
      id: 6,
      link: "/randomchaosgame",
      image: "/Button.png",
      title: "Random Chaos Game",
      emoji: "🤯",
      description:
        "Pure chaos! The bot throws random challenges — scrambled words, emojis, riddles, or nonsense sentences. Make sense of the chaos and have fun!",
      difficulty: "Hard",
    },
    {
      id: 7,
      link: "/ai",
      image: "/Translate.png",
      title: "Sentence Translation Quest",
      emoji: "🌍",
      description:
        "Translate sentences from your native language into English and learn grammar while playing. Perfect for language learners!",
      difficulty: "Medium",
    },
  ];

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case "Easy":
        return "green";
      case "Medium":
        return "orange";
      case "Hard":
        return "red";
      default:
        return "gray";
    }
  };

  return (
    <Box bg={bgColor} minH="100vh" py={{ base: 6, md: 12 }}>
      <Container maxW="container.xl">
        <VStack spacing={{ base: 8, md: 12 }}>
          {/* Header */}
          <Box textAlign="center" w="full" px={{ base: 4, md: 0 }}>
            <Heading
              as="h1"
              size={{ base: "xl", md: "2xl" }}
              mb={4}
              bgGradient="linear(to-r, blue.400, purple.500, pink.500)"
              bgClip="text"
              fontWeight="extrabold"
            >
              Language Learning Games 🎮
            </Heading>
            <Text
              fontSize={{ base: "md", md: "xl" }}
              color={useColorModeValue("gray.600", "gray.300")}
              maxW="3xl"
              mx="auto"
              lineHeight="tall"
            >
              Master English through fun and interactive games. Challenge yourself
              and improve your vocabulary, grammar, and language skills!
            </Text>
          </Box>

          {/* Cards Grid */}
          <SimpleGrid
            columns={{ base: 1, sm: 2, lg: 3 }}
            spacing={{ base: 6, md: 8 }}
            w="full"
            px={{ base: 4, md: 0 }}
          >
            {cardsData.map((card) => (
              <Card
                key={card.id}
                bg={cardBg}
                shadow="md"
                borderRadius="2xl"
                overflow="hidden"
                transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
                _hover={{
                  transform: "translateY(-8px)",
                  shadow: "2xl",
                }}
                border="1px"
                // eslint-disable-next-line react-hooks/rules-of-hooks
                borderColor={useColorModeValue("gray.200", "gray.700")}
              >
                {/* Image Container with Zoom Effect */}
                <Box
                  position="relative"
                  overflow="hidden"
                  h={{ base: "180px", md: "220px" }}
                >
                  <Image
                    src={card.image}
                    alt={card.title}
                    w="full"
                    h="full"
                    objectFit="cover"
                    transition="transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)"
                    _groupHover={{ transform: "scale(1.15)" }}
                    sx={{
                      "card:hover &": {
                        transform: "scale(1.15)",
                      },
                    }}
                  />
                  {/* Difficulty Badge */}
                  <Badge
                    position="absolute"
                    top={4}
                    right={4}
                    colorScheme={getDifficultyColor(card.difficulty)}
                    fontSize={{ base: "xs", md: "sm" }}
                    px={3}
                    py={1}
                    borderRadius="full"
                    fontWeight="bold"
                  >
                    {card.difficulty}
                  </Badge>
                </Box>

                <CardBody p={{ base: 5, md: 6 }}>
                  <VStack align="start" spacing={4}>
                    {/* Title with Emoji */}
                    <Heading
                      as="h3"
                      size={{ base: "md", md: "lg" }}
                      // eslint-disable-next-line react-hooks/rules-of-hooks
                      color={useColorModeValue("gray.800", "white")}
                      lineHeight="shorter"
                      display="flex"
                      alignItems="center"
                      gap={2}
                    >
                      <Text as="span" fontSize={{ base: "xl", md: "2xl" }}>
                        {card.emoji}
                      </Text>
                      {card.title}
                    </Heading>

                    {/* Description */}
                    <Text
                      // eslint-disable-next-line react-hooks/rules-of-hooks
                      color={useColorModeValue("gray.600", "gray.400")}
                      fontSize={{ base: "sm", md: "md" }}
                      lineHeight="tall"
                      noOfLines={4}
                      minH={{ base: "80px", md: "100px" }}
                    >
                      {card.description}
                    </Text>

                    {/* Play Button */}
                    <Button
                      as={RouterLink}
                      to={card.link}
                      bg={buttonBg}
                      color="white"
                      size={{ base: "md", md: "lg" }}
                      // w="full"
                      borderRadius="xl"
                      fontWeight="bold"
                      _hover={{
                        bg: buttonHoverBg,
                        transform: "scale(1.02)",
                      }}
                      _active={{
                        transform: "scale(0.98)",
                      }}
                      transition="all 0.2s"
                    
                    >
                      Play
                    </Button>
                  </VStack>
                </CardBody>
              </Card>
            ))}
          </SimpleGrid>

          {/* Footer Note */}
          <Box
            textAlign="center"
            pt={{ base: 4, md: 8 }}
            px={{ base: 4, md: 0 }}
          >
            <Text
              fontSize={{ base: "sm", md: "md" }}
              color={useColorModeValue("gray.500", "gray.400")}
            >
              🎯 Choose a game and start your learning adventure today!
            </Text>
          </Box>
        </VStack>
      </Container>
    </Box>
  );
};

export default CardPage;