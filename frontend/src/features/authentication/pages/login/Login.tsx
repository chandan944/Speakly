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
  useToast,
} from "@chakra-ui/react";
import { useState, type FormEvent } from "react";
import { FcGoogle } from "react-icons/fc";
import { Link, useNavigate } from "react-router-dom";
import { useOauth } from "../../../../hook/useOauth";
import { usePageTitle } from "../../../../hook/usePageTitle";
import { useAuthentication } from "../../context/AuthenticationContextProvider";
import { LoadingSpinner } from "../../../../components/loader/LoadingSpinner";

const Login = () => {
  // 🌗 Color mode based values
  const cardBg = useColorModeValue("white", "gray.800");
  const inputBg = useColorModeValue("gray.50", "gray.700");
  const textColor = useColorModeValue("gray.800", "white");
  const mutedText = useColorModeValue("gray.600", "gray.400");
  const borderColor = useColorModeValue("gray.200", "gray.600");

  const [errorMessage, setErrorMessage] = useState("");
  const { isOauthInProgress, startOauth } = useOauth("login");

  // 🌀 This shows a loading spinner or disables button during login
  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();
  // 🧭 Tells us from which page the user came before redirecting to login

  // 🚀 Lets us redirect the user after successful login
  const navigate = useNavigate();
  usePageTitle("Login");

  // 🔐 Gets login function from AuthContext
  const { login } = useAuthentication();

  const doLogin = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    const email = e.currentTarget.email.value;
    const password = e.currentTarget.password.value;
    try {
      await login(email, password);
      toast({
        title: "login Succesfully ☺",
      });

      navigate("/");
    } catch (e) {
      // 🧠 Catch error with meaningful message
      if (e instanceof Error) {
        setErrorMessage(e.message); // e.g., "Password is incorrect."
      } else {
        setErrorMessage("Something went wrong... 😵");
      }
    } finally {
      setIsLoading(false);
    }

    if (isOauthInProgress) {
      return <LoadingSpinner />;
    }
  };

  return (
    <Box
      // minH="100vh"
      display="flex"
      justifyContent="center"
      alignItems="center"
      // bg={useColorModeValue("gray.100", "gray.900")}
      // px={4}
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
        {/* 🧠 Heading */}
        <Box mb={6}>
          <Text fontSize="2xl" fontWeight="bold">
            Welcome back 👋
          </Text>
          <Text fontSize="sm" color={mutedText}>
            Sign in easily with your Google account
          </Text>
        </Box>

        {/* 🌐 OAuth Buttons */}
        <Stack direction="row" spacing={4} mb={6}>
          <Button
            leftIcon={<FcGoogle />}
            w="full"
            variant="outline"
            onClick={() => {
              startOauth();
            }}
          >
            Google
          </Button>
        </Stack>

        {/* 🧱 Divider */}
        <Box display="flex" alignItems="center" my={4}>
          <Divider />
          <Text px={2} fontSize="sm" color="gray.500" whiteSpace="nowrap">
            OR CONTINUE WITH
          </Text>
          <Divider />
        </Box>

        {/* 📝 Form */}
        <form onSubmit={doLogin}>
          <Stack spacing={4}>
            <FormControl>
              <FormLabel>Email</FormLabel>
              <Input
                name="email"
                placeholder="Enter your email..."
                bg={inputBg}
                _placeholder={{ color: "gray.500" }}
              />
            </FormControl>

            <Box>
              <FormControl>
                <FormLabel>Password</FormLabel>
                <Input
                  name="password"
                  placeholder="Enter your password..."
                  type="password"
                  bg={inputBg}
                  _placeholder={{ color: "gray.500" }}
                />
              </FormControl>
              <Link to="/authentication/request-password-reset">
                <Text className="text-green-600 font-bold">
                  Forget Password?
                </Text>
              </Link>
            </Box>
            {errorMessage && <p className="text-red-700">{errorMessage}</p>}
            <Button colorScheme="green" mt={4} type="submit" w="full">
              {isLoading ? "Logging in..." : "Log In"}
            </Button>
            <Box>
              <Text fontSize="sm" color={mutedText}>
                New to Speakly?{" "}
                <Link to="/authentication/signup">
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
export default Login;
