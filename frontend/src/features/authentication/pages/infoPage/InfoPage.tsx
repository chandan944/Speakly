import { Box, Button, Flex, Heading, Image, Text, VStack, Divider, Circle, Icon } from "@chakra-ui/react";
import { FaSmile, FaCogs } from "react-icons/fa";
import { FaGlobe, FaUsers } from "react-icons/fa6";
import { useNavigate } from "react-router-dom";

const InfoPage = () => {
  const navigate = useNavigate();

  const items = [
    {
      icon: FaUsers,
      title: "Collaboration",
      desc: "Work together seamlessly and improve learning with shared insights. 🤝",
    },
    {
      icon: FaGlobe,
      title: "Global Learning",
      desc: "Connect with languages and cultures around the world. 🌍",
    },
    {
      icon: FaSmile,
      title: "Interactive Practice",
      desc: "Engage through fun, feedback-driven exercises. 😄",
    },
    {
      icon: FaCogs,
      title: "Smart AI Assistance",
      desc: "Powered by AI to guide you through sentence correction and feedback. 🤖",
    },
  ];

  return (
    <Box bg="gray.50" minH="100vh" p={8}>
      {/* Section 1: Hero */}
      <Flex
        direction={{ base: "column", md: "row" }}
        align="center"
        justify="space-between"
        mb={16}
        bg="white"
        p={10}
        borderRadius="2xl"
        boxShadow="xl"
      >
        <Box flex="1" textAlign={{ base: "center", md: "left" }}>
          <Heading fontSize="4xl" mb={4}>
            🎉 Welcome to <Text as="span" color="blue.500">Speakly</Text>
          </Heading>
          <Text fontSize="lg" color="gray.600" mb={6}>
            Learn languages in a fun and interactive way! 🌍  
            Translate sentences, get feedback, and improve your skills step by step. 🚀
          </Text>
          <Flex gap={4} justify={{ base: "center", md: "flex-start" }}>
            <Button colorScheme="blue" onClick={() => navigate("/authentication/login")}>
              Login 🔑
            </Button>
            <Button colorScheme="teal" onClick={() => navigate("/authentication/signup")}>
              Sign Up ✨
            </Button>
          </Flex>
        </Box>

        {/* You’ll add your hero image here */}
        <Image
          flex="1"
          src="https://via.placeholder.com/400x300"
          alt="Language learning"
          borderRadius="xl"
          boxShadow="md"
          mt={{ base: 6, md: 0 }}
        />
      </Flex>

      {/* Divider */}
      <Divider mb={16} />

      {/* Section 2: Thoughtful Diagram / Idea Visualization */}
  <Flex
      direction={{ base: "column", md: "row" }}
      align="center"
      justify="center"
      gap={10}
      bg="white"
      boxShadow="xl"
      borderRadius="2xl"
      p={10}
      mt={10}
    >
      {/* Center Circle */}
      <Circle
        size="200px"
        bg="gray.100"
        boxShadow="md"
        fontWeight="bold"
        textAlign="center"
      >
        Software Explanation
      </Circle>

      {/* Right-side Explanation */}
      <VStack align="start" spacing={6}>
        {items.map((item, index) => (
          <Flex key={index} align="center" gap={4}>
            <Circle size="50px" bg="teal.100" color="teal.600">
              <Icon as={item.icon} boxSize={6} />
            </Circle>
            <Box>
              <Text fontWeight="bold">{item.title}</Text>
              <Text fontSize="sm" color="gray.600">
                {item.desc}
              </Text>
            </Box>
          </Flex>
        ))}
      </VStack>
    </Flex>



      {/* Section 3: Motivation / Quote */}
      <Box textAlign="center" bg="blue.50" p={10} borderRadius="2xl" boxShadow="md">
        <Text fontSize="xl" fontStyle="italic" color="gray.700" mb={4}>
          “Learning a new language is like opening a new window to the world.” 🌏
        </Text>
        <Text fontSize="sm" color="gray.500">
          — Speakly Team 💙
        </Text>
      </Box>
    </Box>
  );
};

export default InfoPage;
