// src/pages/NotFound.tsx

import {
  
  Button,
  Heading,
  Text,
  useColorModeValue,
  Image,
  Flex,
} from "@chakra-ui/react";
import { Link } from "react-router-dom";
import NotFoundImg from "../../assets/web-app-manifest-512x512.png"; // Add your own SVG here

const NotFound = () => {
  const bg = useColorModeValue("gray.50", "gray.900");
  const textColor = useColorModeValue("gray.800", "whiteAlpha.900");

  return (
    <Flex
      direction="column"
      align="center"
      justify="center"
      minH="100vh"
      bg={bg}
      px={6}
      textAlign="center"
    >
      <Image
        src={NotFoundImg}
        alt="Not found"
        maxW="350px"
        mb={8}
        filter={useColorModeValue("none", "brightness(0.8)")}
      />

      <Heading size="2xl" color={textColor}>
        404 - Page Not Found
      </Heading>

      <Text fontSize="lg" mt={4} color="gray.500" maxW="md">
        Seems like you're lost in the language jungle 🐒. Let’s get back to learning with Speakly!
      </Text>

      <Link to="/">
        <Button mt={6} colorScheme="green" size="lg">
          🏠 Back to Home
        </Button>
      </Link>
    </Flex>
  );
};

export default NotFound;
