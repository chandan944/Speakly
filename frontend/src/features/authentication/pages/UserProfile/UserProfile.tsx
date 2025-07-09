import { useState } from "react";
import {
  Box,
  Button,
  Heading,
  Input,
  Text,
  VStack,
  FormControl,
  FormLabel,
  FormErrorMessage,
  useToast,
} from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { useAuthentication } from "../../context/AuthenticationContextProvider";

function UserProfile() {

  const toast = useToast();

  const [step, setStep] = useState(0);
  const navigate = useNavigate();
  const { user, setUser } = useAuthentication();
  const [error, setError] = useState("");
  const [data, setData] = useState({
    firstName: "",
    lastName: "",
    profession: "",
  });

  const onSubmit = async () => {
    if (!data.firstName || !data.lastName) {
      setError("Please fill in your first and last name.");
      return;
    }
    if (!data.profession) {
      setError("Please select your profession");
      return;
    }

    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/v1/authentication/profile/${
          user?.id
        }/info?firstName=${data.firstName}&lastName=${
          data.lastName
        }&profession=${data.profession}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (res.ok) {
        const updatedUser = await res.json();
        setUser(updatedUser);
        if (updatedUser.profileComplete) {
          toast({
            title: "Profile Completed Successfuly.",
            status: "success",
          });
          navigate("/");
        } else {
          navigate(`/authentication/profile/${user.id}`);
          console.warn("⚠️ Profile still incomplete, staying on page.");
          setError("Something went wrong. Please try again.");
        }
      } else {
        const { message } = await res.json();
        throw new Error(message);
      }
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError("An unknown error occurred.");
      }
    }
  };

  return (
    <Box
      p={6}
      maxW="md"
      mx="auto"
      borderWidth="1px"
      borderRadius="lg"
      boxShadow="md"
    >
      <Heading mb={2} size="lg">
        Only one last step 🎉
      </Heading>
      <Text mb={6}>
        Tell us a bit about yourself so we can personalize your experience.
      </Text>

      <VStack spacing={4} align="stretch">
        {step === 0 && (
          <>
            <FormControl
              isRequired
              isInvalid={!!error && (!data.firstName || !data.lastName)}
            >
              <FormLabel>First Name</FormLabel>
              <Input
                placeholder="John"
                value={data.firstName}
                onFocus={() => setError("")}
                onChange={(e) =>
                  setData((prev) => ({ ...prev, firstName: e.target.value }))
                }
              />
            </FormControl>

            <FormControl
              isRequired
              isInvalid={!!error && (!data.firstName || !data.lastName)}
            >
              <FormLabel>Last Name</FormLabel>
              <Input
                placeholder="Doe"
                value={data.lastName}
                onFocus={() => setError("")}
                onChange={(e) =>
                  setData((prev) => ({ ...prev, lastName: e.target.value }))
                }
              />
              {!!error && (!data.firstName || !data.lastName) && (
                <FormErrorMessage>{error}</FormErrorMessage>
              )}
            </FormControl>
          </>
        )}

        {step === 1 && (
          <FormControl isRequired isInvalid={!!error && !data.profession}>
            <FormLabel>Profession</FormLabel>
            <Input
              placeholder="Student"
              value={data.profession}
              onFocus={() => setError("")}
              onChange={(e) =>
                setData((prev) => ({ ...prev, profession: e.target.value }))
              }
            />
            {!!error && !data.profession && (
              <FormErrorMessage>{error}</FormErrorMessage>
            )}
          </FormControl>
        )}

        {/* 🚨 Global error display */}
        {error && step === 1 && data.profession && (
          <Text color="red.500" fontSize="sm">
            {error}
          </Text>
        )}

        {/* 👇 Navigation buttons */}
        <Box display="flex" justifyContent="space-between" pt={4}>
          {step > 0 && (
            <Button
              onClick={() => setStep((prev) => prev - 1)}
              colorScheme="gray"
            >
              Back
            </Button>
          )}
          {step < 1 && (
            <Button
              colorScheme="blue"
              onClick={() => setStep((prev) => prev + 1)}
              isDisabled={!data.firstName || !data.lastName}
            >
              Next
            </Button>
          )}
          {step === 1 && (
            <Button
              colorScheme="green"
              onClick={onSubmit}
              isDisabled={!data.profession}
            >
              Submit
            </Button>
          )}
        </Box>
      </VStack>
    </Box>
  );
}

export default UserProfile;
