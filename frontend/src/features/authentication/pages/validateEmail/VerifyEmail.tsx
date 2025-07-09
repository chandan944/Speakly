import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthentication } from "../../context/AuthenticationContextProvider";
import { usePageTitle } from "../../../../hook/usePageTitle";
import {
  Box,
  Text,
  Heading,
  useColorModeValue,
  VStack,
  FormControl,
  FormLabel,
  useToast,
} from "@chakra-ui/react";
import { CustomInput } from "../../../../components/input/CustomInput";
import { CustomButton } from "../../../../components/button/CustomButton";

function VerifyEmail() {
  const [errorMessage, setErrorMessage] = useState("");
  const { user, setUser } = useAuthentication();
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  usePageTitle("Verify Email");
const toast = useToast();

  const validateEmail = async (code: string) => {
  setMessage("");
  setErrorMessage("");
  setIsLoading(true);

  try {
    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/api/v1/authentication/validate-email-verification-token?token=${code}`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );

    const text = await response.text(); // 👈 get raw response first
    let data;

    try {
      data = JSON.parse(text); // try parsing JSON
    } catch (err) {
      data = { message: text }; // fallback to plain text
    }

    console.log("🔁 validateEmail status:", response.status);
    console.log("📦 validateEmail response:", data);

    if (response.ok || response.status === 200) {
      const userResponse = await fetch(
        `${import.meta.env.VITE_API_URL}/api/v1/authentication/users/me`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      const userData = await userResponse.json();
      setUser(userData);
       toast({
     title:"Verification has done. "
    });
      navigate("/"); // 👈 context will handle routing to /authentication/profile
    } else {
      setErrorMessage(data?.message || "❌ Invalid or expired code.");
    }
  } catch (e) {
    console.error("❌ Catch error:", e);
    setErrorMessage("Something went wrong, please try again. 😓");
  } finally {
    setIsLoading(false);
  }
};



 const sendEmailVerificationToken = async () => {
  setErrorMessage("");
  setMessage("");
  setIsLoading(true);

  try {
    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/api/v1/authentication/send-email-verification-token`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );

    const text = await response.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch {
      data = { message: text };
    }

    console.log("📨 sendEmailVerificationToken status:", response.status);
    console.log("📨 response:", data);

    if (response.ok || response.status === 200) {
      
      toast({
  title: "Email sent! 📧",
  description: "Check your inbox to get verification code.",
  status: "success",
  duration: 5000,
  isClosable: true,
});

    } else {
      setErrorMessage(data.message || "❌ Failed to send verification.");
    }
  } catch (e) {
    console.log(e);
    setErrorMessage("Something went wrong, please try again.");
  } finally {
    setIsLoading(false);
  }
};


  return (
    <Box
      // minH="100vh"
      display="flex"
      alignItems="center"
      justifyContent="center"
      // px={4}
      // bg={useColorModeValue("gray.50", "gray.800")}
    >
      <Box
        w="full"
        maxW="md"
        p={8}
        borderRadius="xl"
        boxShadow="lg"
        bg={useColorModeValue("white", "gray.700")}
      >
        <Heading size="lg" mb={4}>
          ✉️ Verify your Email
        </Heading>
        <Text mb={6} color="gray.500">
          Only one step left to complete your registration. Please enter the verification code we sent to your email.
        </Text>

        <form
          onSubmit={async (e) => {
            e.preventDefault();
            setIsLoading(true);
            const code = (e.currentTarget as any).code.value;
            await validateEmail(code);
          }}
        >
          <VStack spacing={4} align="stretch">
            <FormControl>
              <FormLabel>Verification Code</FormLabel>
              <CustomInput
                name="code"
                placeholder="Enter your code"
                required
              />
            </FormControl>

            {message && <Text color="green.400">{message}</Text>}
            {errorMessage && <Text color="red.400">{errorMessage}</Text>}

            <Box display="flex" justifyContent="space-between" gap={2} pt={2}>
              <CustomButton type="submit" isLoading={isLoading}>
                Validate Email
              </CustomButton>
              <CustomButton
                type="button"
                onClick={sendEmailVerificationToken}
                disabled={isLoading}
              >
                Send Again
              </CustomButton>
            </Box>
          </VStack>
        </form>
      </Box>
    </Box>
  );
}

export default VerifyEmail;
