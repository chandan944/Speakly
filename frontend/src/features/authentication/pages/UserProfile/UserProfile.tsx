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
  useColorModeValue,
  Select,
  Checkbox,
  CheckboxGroup,
  SimpleGrid,
} from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { useAuthentication } from "../../context/AuthenticationContextProvider";
import { ArrowBackIcon, ArrowForwardIcon, CheckCircleIcon } from "@chakra-ui/icons";

// 🎯 Common Hobbies
const HOBBY_OPTIONS = [
  "Reading 📚", "Music 🎵", "Traveling 🌍", "Photography 📸", "Cooking 🍳",
  "Gardening 🌱", "Gaming 🎮", "Drawing 🎨", "Writing ✍️", "Dancing 💃",
  "Fitness 🏋️", "Cycling 🚴", "Hiking 🥾", "Swimming 🏊", "Running 🏃",
  "Yoga 🧘", "Movies 🎬", "Crafting ✂️", "Fishing 🎣", "Coding 💻",
];

// 🌐 Indian Languages
const LANGUAGE_OPTIONS = [
  "Hindi", "Marathi", "Telugu", "Tamil", "Kannada", "Gujarati", "Punjabi",
  "Bengali", "Malayalam", "Odia", "Urdu", "Assamese", "Konkani", "Sanskrit",
];

function UserProfile() {
  const toast = useToast();
  const [step, setStep] = useState(0);
  const navigate = useNavigate();
  const { user, setUser } = useAuthentication();
  const [error, setError] = useState("");

  const [data, setData] = useState({
    firstName: "",
    lastName: "",
    hobbies: [] as string[], // ✅ now array
    nativeLanguage: "",
    bio: "",
  });

  const onSubmit = async () => {
    if (!data.firstName || !data.lastName || !data.hobbies.length || !data.nativeLanguage || !data.bio) {
      setError("Please fill in all required fields.");
      return;
    }

    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/v1/authentication/profile/${user?.id}/info?` +
        new URLSearchParams({
          firstName: data.firstName,
          lastName: data.lastName,
          hobbies: data.hobbies.join(", "), // ✅ convert to comma-separated
          nativeLanguage: data.nativeLanguage,
          bio: data.bio,
        }),
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
          navigate(`/authentication/profile/${user?.id}`);
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
          <FormControl isRequired isInvalid={!!error && !data.hobbies.length}>
            <FormLabel>Select Your Hobbies 🎯</FormLabel>
            <CheckboxGroup
              value={data.hobbies}
              onChange={(values) => {
                setData((prev) => ({ ...prev, hobbies: values as string[] }));
                setError("");
              }}
            >
              <SimpleGrid columns={2} spacing={2}>
                {HOBBY_OPTIONS.map((hobby) => (
                  <Checkbox key={hobby} value={hobby}>
                    {hobby}
                  </Checkbox>
                ))}
              </SimpleGrid>
            </CheckboxGroup>
            {!!error && !data.hobbies.length && (
              <FormErrorMessage>{error}</FormErrorMessage>
            )}
          </FormControl>
        )}

        {step === 2 && (
          <>
            <FormControl isRequired isInvalid={!!error && !data.nativeLanguage}>
              <FormLabel>Native Language 🗣️</FormLabel>
              <Select
                placeholder="Select your language"
                value={data.nativeLanguage}
                onChange={(e) => setData((prev) => ({ ...prev, nativeLanguage: e.target.value }))}
                onFocus={() => setError("")}
              >
                {LANGUAGE_OPTIONS.map((lang) => (
                  <option key={lang} value={lang}>
                    {lang}
                  </option>
                ))}
              </Select>
            </FormControl>

            <FormControl isRequired isInvalid={!!error && !data.bio}>
              <FormLabel>About You 💬</FormLabel>
              <Input
                placeholder="I'm passionate about tech and love coffee ☕"
                value={data.bio}
                onFocus={() => setError("")}
                onChange={(e) => setData((prev) => ({ ...prev, bio: e.target.value }))}
              />
              {!!error && (!data.nativeLanguage || !data.bio) && (
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
                (step === 1 && !data.hobbies.length)
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
              isDisabled={!data.nativeLanguage || !data.bio}
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
