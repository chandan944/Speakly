import {
  Box,
  Button,
  Divider,
  FormControl,
  FormLabel,
  Input,
  Stack,
  Text,
  useColorModeValue,
  FormErrorMessage,
  useToast,
} from "@chakra-ui/react";
import { useState, type FormEvent } from "react";
import { FcGoogle } from "react-icons/fc";
import { Link, useNavigate } from "react-router-dom";
import { useAuthentication } from "../../context/AuthenticationContextProvider";
import { useOauth } from "../../../../hook/useOauth";
import { usePageTitle } from "../../../../hook/usePageTitle";

// 💡 Helper to extract message from Spring Boot error string
function extractSpringErrorMessage(raw: string): string {
  const match = raw.match(/interpolatedMessage='([^']+)'/);
  return match ? match[1] : "An unknown error occurred. 😥";
}

const Signin = () => {
  const cardBg = useColorModeValue("white", "gray.800");
  const inputBg = useColorModeValue("gray.50", "gray.700");
  const textColor = useColorModeValue("gray.800", "white");
  const mutedText = useColorModeValue("gray.600", "gray.400");
  const borderColor = useColorModeValue("gray.200", "gray.600");
const toast = useToast();

  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { signup } = useAuthentication();
  const navigate = useNavigate();
  usePageTitle("Signup");
  const {  startOauth } = useOauth("signup");

  const doSignup = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage("");

    const email = e.currentTarget.email.value;
    const password = e.currentTarget.password.value;

    try {
      await signup(email, password);
    toast({
     title:" Signup Successfuly!"
    });
      navigate("/"); // 🚀 Success
    } catch (error: any) {
      const raw = error?.message || "Unknown error";
      const friendly = extractSpringErrorMessage(raw);
      setErrorMessage(friendly);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box
      minH="100vh"
      display="flex"
      justifyContent="center"
      alignItems="center"
      bg={useColorModeValue("gray.100", "gray.900")}
      px={4}
    >
      <Box
        w="full"
        maxW="sm"
        bg={cardBg}
        color={textColor}
        p={6}
        rounded="xl"
        shadow="lg"
        border="1px solid"
        borderColor={borderColor}
      >
        <Box mb={6}>
          <Text fontSize="2xl" fontWeight="bold">
            Create an account
          </Text>
          <Text fontSize="sm" color={mutedText}>
            Enter your email below to create your account
          </Text>
        </Box>

        <Stack direction="row" spacing={4} mb={6}>
          <Button
            leftIcon={<FcGoogle />}
            w="full"
            variant="outline"
            onClick={() => startOauth()}
          >
            Google
          </Button>
        </Stack>
      

        <Box display="flex" alignItems="center" my={4}>
          <Divider />
          <Text px={2} fontSize="sm" color="gray.500" whiteSpace="nowrap">
            OR CONTINUE WITH
          </Text>
          <Divider />
        </Box>

        <form onSubmit={doSignup}>
          <Stack spacing={4}>
            <FormControl isInvalid={!!errorMessage}>
              <FormLabel>Email</FormLabel>
              <Input
                name="email"
                placeholder="m@example.com"
                bg={inputBg}
                _placeholder={{ color: "gray.500" }}
              />
            </FormControl>

            <FormControl isInvalid={!!errorMessage}>
              <FormLabel>Password</FormLabel>
              <Input
                name="password"
                type="password"
                placeholder="*********"
                bg={inputBg}
                _placeholder={{ color: "gray.500" }}
              />
              {errorMessage && (
                <FormErrorMessage>{errorMessage}</FormErrorMessage>
              )}
            </FormControl>

            <Button colorScheme="green" mt={4} type="submit" w="full" isLoading={isLoading}>
              Create account
            </Button>

            <Box>
              <Text fontSize="sm" color={mutedText}>
                Already have an account?{" "}
                <Link to="/login">
                  <Text as="span" color="green.400" fontWeight="medium">
                    Login
                  </Text>
                </Link>
              </Text>
            </Box>
          </Stack>
        </form>
      </Box>
    </Box>
  );
};

export default Signin;
