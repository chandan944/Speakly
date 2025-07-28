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
  Icon,
  useColorModeValue,
} from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { useAuthentication } from "../../context/AuthenticationContextProvider";
import { ArrowBackIcon, ArrowForwardIcon, CheckCircleIcon } from "@chakra-ui/icons";

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
    location: "",
    bio: "",
  });

  const onSubmit = async () => {
    if (!data.firstName || !data.lastName || !data.profession || !data.location || !data.bio) {
      setError("Please fill in all required fields.");
      return;
    }

    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/v1/authentication/profile/${user?.id}/info?firstName=${data.firstName}&lastName=${data.lastName}&profession=${data.profession}&location=${data.location}&bio=${data.bio}`,
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
            title: "🎉 Profile Completed!",
            status: "success",
            duration: 3000,
            isClosable: true,
          });
          navigate("/");
        } else {
          navigate(`/authentication/profile/${user.id}`);
          setError("Something went wrong. Please try again.");
        }
      } else {
        const { message } = await res.json();
        throw new Error(message);
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : "An unknown error occurred.");
    }
  };

  const formBoxBg = useColorModeValue("white", "gray.800");
  const formShadow = useColorModeValue("lg", "dark-lg");

  return (
    <Box
      p={6}
      maxW="lg"
      mx="auto"
      mt={10}
      borderRadius="xl"
      boxShadow={formShadow}
      bg={formBoxBg}
    >
      <Heading mb={2} size="lg" textAlign="center">
        Just One Last Step! 🥳
      </Heading>
      <Text mb={6} textAlign="center" fontSize="sm" color="gray.500">
        Help us personalize your experience by completing your profile.
      </Text>

      <VStack spacing={5} align="stretch">
        {step === 0 && (
          <>
            <FormControl isRequired isInvalid={!!error && (!data.firstName || !data.lastName)}>
              <FormLabel>First Name</FormLabel>
              <Input
                placeholder="John"
                value={data.firstName}
                onFocus={() => setError("")}
                onChange={(e) => setData((prev) => ({ ...prev, firstName: e.target.value }))}
              />
            </FormControl>

            <FormControl isRequired isInvalid={!!error && (!data.firstName || !data.lastName)}>
              <FormLabel>Last Name</FormLabel>
              <Input
                placeholder="Doe"
                value={data.lastName}
                onFocus={() => setError("")}
                onChange={(e) => setData((prev) => ({ ...prev, lastName: e.target.value }))}
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
              placeholder="Web Developer"
              value={data.profession}
              onFocus={() => setError("")}
              onChange={(e) => setData((prev) => ({ ...prev, profession: e.target.value }))}
            />
            {!!error && !data.profession && (
              <FormErrorMessage>{error}</FormErrorMessage>
            )}
          </FormControl>
        )}

        {step === 2 && (
          <>
            <FormControl isRequired isInvalid={!!error && !data.location}>
              <FormLabel>Location</FormLabel>
              <Input
                placeholder="India"
                value={data.location}
                onFocus={() => setError("")}
                onChange={(e) => setData((prev) => ({ ...prev, location: e.target.value }))}
              />
            </FormControl>

            <FormControl isRequired isInvalid={!!error && !data.bio}>
              <FormLabel>About You</FormLabel>
              <Input
                placeholder="I'm passionate about tech and love coffee ☕"
                value={data.bio}
                onFocus={() => setError("")}
                onChange={(e) => setData((prev) => ({ ...prev, bio: e.target.value }))}
              />
              {!!error && (!data.location || !data.bio) && (
                <FormErrorMessage>{error}</FormErrorMessage>
              )}
            </FormControl>
          </>
        )}

        {/* Navigation buttons */}
        <Box display="flex" justifyContent="space-between" pt={4}>
          {step > 0 && (
            <Button
              onClick={() => setStep((prev) => prev - 1)}
              leftIcon={<ArrowBackIcon />}
              colorScheme="gray"
              variant="outline"
            >
              Back
            </Button>
          )}

          {step < 2 && (
            <Button
              onClick={() => setStep((prev) => prev + 1)}
              rightIcon={<ArrowForwardIcon />}
              colorScheme="blue"
              isDisabled={
                (step === 0 && (!data.firstName || !data.lastName)) ||
                (step === 1 && !data.profession)
              }
            >
              Next
            </Button>
          )}

          {step === 2 && (
            <Button
              colorScheme="green"
              rightIcon={<CheckCircleIcon />}
              onClick={onSubmit}
              isDisabled={!data.location || !data.bio}
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
