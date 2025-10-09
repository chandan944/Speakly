import {
  Box,
  Flex,
  Heading,
  Text,
  VStack,
  useColorModeValue,
  useToast,
} from "@chakra-ui/react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { CustomInput } from "../../../../components/input/CustomInput";
import { CustomButton } from "../../../../components/button/CustomButton";
import { MdOutlinePassword } from "react-icons/md";

function ResetPassword() {
  const [emailSent, setEmailSent] = useState(false);
  const [email, setEmail] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
const toast = useToast();

  const sendPasswordResetToken = async (email: string) => {
    try {
      const response = await fetch(
        `${
          import.meta.env.VITE_API_URL
        }/api/v1/authentication/send-password-reset-token?email=${email}`,
        {
          method: "PUT",
        }
      );
      if (response.ok) {
        toast({
  title: "Email sent! 📧",
  description: "Check your inbox for the reset link.",
  status: "success",
  duration: 5000,
  isClosable: true,
});

        setEmailSent(true);
        return;
      }
      const { message } = await response.json();
      setErrorMessage(message);
    } catch (e) {
      console.log(e);
      setErrorMessage("Something went wrong, please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const resetPassword = async (
    email: string,
    code: string,
    password: string
  ) => {
    try {
      const response = await fetch(
        `${
          import.meta.env.VITE_API_URL
        }/api/v1/authentication/reset-password?email=${email}&token=${code}&newPassword=${password}`,
        {
          method: "PUT",
        }
      );
      if (response.ok) {
        setErrorMessage("");
        navigate("/login");
      }
      const { message } = await response.json();
      setErrorMessage(message);
    } catch (e) {
      console.log(e);
      setErrorMessage("Something went wrong, please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box
      minH="60vh"
      display="flex"
      alignItems="center"
      justifyContent="center"
      bg={useColorModeValue("gray.50", "gray.900")}
      px={4}
      
    >
      <Box
      gap={10}
        w="full"
        maxW="md"
        p={8}
        borderRadius="lg"
        boxShadow="lg"
        bg={useColorModeValue("white", "gray.800")}
      >
        <Heading mb={4} textAlign="center" fontSize="2xl">
        <Flex gap={3}>  <MdOutlinePassword/>
          <Text>Reset Password</Text></Flex>
        </Heading>

        {!emailSent ? (
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              setIsLoading(true);
              const email = e.currentTarget.email.value;
              await sendPasswordResetToken(email);
              setEmail(email);
              setIsLoading(false);
            }}
          >
            <VStack spacing={4} align="stretch">
              <Text fontSize="sm" color="gray.500">
                Enter your email and we’ll send a verification code if it
                matches an existing account.
              </Text>
              <CustomInput
                key="email"
                name="email"
                type="email"
                placeholder="you@example.com"
              />
              {errorMessage && (
                <Text color="red.400" fontSize="sm">
                  {errorMessage}
                </Text>
              )}
              <CustomButton type="submit" disabled={isLoading}>
                {isLoading ? "Sending..." : "Next"}
              </CustomButton>
              <CustomButton
                
                onClick={() => navigate("/")}
                disabled={isLoading}
              >
                Back
              </CustomButton>
            </VStack>
          </form>
        ) : (
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              setIsLoading(true);
              const code = e.currentTarget.code.value;
              const password = e.currentTarget.password.value;
              await resetPassword(email, code, password);
              setIsLoading(false);
            }}
          >
            <VStack spacing={4} align="stretch">
              <Text fontSize="sm" color="gray.500">
                Enter the verification code we sent to your email and your new
                password.
              </Text>
              <CustomInput
                key="code"
                name="code"
                type="text"
                placeholder="Enter Verification Code"
              />
              <CustomInput
                key="password"
                name="password"
                type="password"
                placeholder="Create New Password"
              />
              {errorMessage && (
                <Text color="red.400" fontSize="sm">
                  {errorMessage}
                </Text>
              )}
              <CustomButton type="submit" disabled={isLoading}>
                {isLoading ? "Resetting..." : "Reset Password"}
              </CustomButton>
              <CustomButton
                
                type="button"
                onClick={() => {
                  setEmailSent(false);
                  setErrorMessage("");
                }}
                disabled={isLoading}
              >
                Back
              </CustomButton>
            </VStack>
          </form>
        )}
      </Box>
    </Box>
  );
}

export default ResetPassword;
