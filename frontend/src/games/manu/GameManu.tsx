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
  useColorModeValue,
} from "@chakra-ui/react";
import { Link as RouterLink } from "react-router-dom";
const CardPage = () => {
  const bgColor = useColorModeValue("gray.50", "gray.900");
  const cardBg = useColorModeValue("white", "gray.800");

  // Sample card data
  const cardsData = [
    {
      id: 1,
      link: "/arrange",
      image:
        "/ArrangeTheWord.png",
      title: "Sentence Builder Quest 🏰",
      description:
        "A fun word-adventure game where players are given random words grammatically correct sentence. The rewarding clever or correct sentences with points and feedback.",
    },
    {
      id: 2,
      link: "/fillintheblank",
      image:
        "/Fill.png",
      title: "Fill in the Blank Challenge",
      description:
        "Guess the missing word and complete the sentence! A fun way to test your vocabulary and grammar skills.",
    },
    {
      id: 3,
      link: "/findmsitek", // fun vibe 😆
      image:
        "/FindMisteck.png",
      title: "Find the Mistak 🔍",
      description:
        "Spot the wrong word in a sentence! 🕵️‍♂️ The AI shows a sentence with one sneaky mistake hidden inside. Your job is to catch it fast. Correct it and earn points 💡, miss it and learn why it was wrong. Fun + flexible, even if the AI gives quirky sentences!",
    },
    {
      id: 4,
      link: "/fakeword", // fun placeholder
      image:
        "/GuessFakeWord.png",
      title: "Guess the Fake Word",
      description:
        "Players are shown three words 👀 — two are real 📚 and one is completely fake 🌀. The challenge is to spot the fake one! Tap on a word to reveal its meaning, and if it flips to nonsense, you win 🎉. It’s a mix of vocabulary building + detective skills 🕵️‍♂️, making learning fun and tricky at the same time.",
    },
    {
      id: 5,
      link: "/emojipuzzlegame",
      image:
        "/emojii.png",
      title: "Emoji Puzzle Game",
      description:
        "Decode fun emoji combinations 🤩! Players are given 2–4 emojis that represent a word, phrase, or sentence. Guess the correct meaning from the emojis, and if stuck, reveal the answer. Great for creativity, language practice, and lots of laughter 🎉😂.",
    },
    {
      id: 6,
      link: "/randomchaosgame",
      image:
        "/Button.png",
      title: "Random Chaos Game",
      description:
        "Welcome to pure chaos! 🤯 In this game, the bot throws totally random challenges at you — mix of words, emojis, riddles, or nonsense sentences. Your task? Make sense out of the chaos! Whether it’s building a sentence from scrambled words, decoding emojis, or spotting a fake clue — anything can happen. No rules, only fun. 🎲✨",
    },
    {
      id: 7,
      link: "/ai",
      image:
        "/Translate.png",
      title: "Sentence Translation Quest",
      description:
        "Translate sentences from your native language into English and learn grammar while playing.",
    },
  ];

  return (
    <Box bg={bgColor} minH="100vh" py={{ base: 4, md: 8 }}>
      <Container maxW="container.xl">
        <VStack spacing={{ base: 6, md: 8 }}>
          {/* Header */}
          <Box textAlign="center" w="full">
            <Heading
              as="h1"
              size={{ base: "xl", md: "2xl" }}
              mb={4}
              color={useColorModeValue("gray.800", "white")}
            >
              Interior Design Gallery
            </Heading>
            <Text
              fontSize={{ base: "md", md: "lg" }}
              color={useColorModeValue("gray.600", "gray.300")}
              maxW="2xl"
              mx="auto"
            >
              Discover beautiful interior designs for every room in your home
            </Text>
          </Box>

          {/* Cards Grid */}
          <SimpleGrid
            columns={{ base: 1, sm: 2, md: 3 }}
            spacing={{ base: 4, md: 6 }}
            w="full"
          >
            {cardsData.map((card) => (
              <Card
                key={card.id}
                bg={cardBg}
                shadow="lg"
                borderRadius="xl"
                overflow="hidden"
                transition="all 0.3s ease"
                _hover={{
                  transform: "translateY(-4px)",
                  shadow: "xl",
                }}
                cursor="pointer"
                as={RouterLink}
                to={card.link}
              >
                <Box position="relative" overflow="hidden">
                  <Image
                    src={card.image}
                    alt={card.title}
                    w="full"
                    h={{ base: "200px", md: "240px" }}
                    objectFit="cover"
                    transition="transform 0.3s ease"
                    _hover={{ transform: "scale(1.05)" }}
                  />
                </Box>

                <CardBody p={{ base: 4, md: 6 }}>
                  <VStack align="start" spacing={3}>
                    <Heading
                      as="h3"
                      size={{ base: "md", md: "lg" }}
                      // eslint-disable-next-line react-hooks/rules-of-hooks
                      color={useColorModeValue("gray.800", "white")}
                      lineHeight="shorter"
                    >
                      {card.title}
                    </Heading>

                    <Text
                      // eslint-disable-next-line react-hooks/rules-of-hooks
                      color={useColorModeValue("gray.600", "gray.300")}
                      fontSize={{ base: "sm", md: "md" }}
                      lineHeight="tall"
                      noOfLines={3}
                    >
                      {card.description}
                    </Text>
                  </VStack>
                </CardBody>
              </Card>
            ))}
          </SimpleGrid>
        </VStack>
      </Container>
    </Box>
  );
};

export default CardPage;
