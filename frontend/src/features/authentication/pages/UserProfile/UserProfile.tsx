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
  Flex,
  HStack,
  ScaleFade,
  Icon,
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
    hobbies: [] as string[],
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
          hobbies: data.hobbies.join(", "),
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
  const formShadow = useColorModeValue("md", "dark-lg");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const activeColor = "blue.500";
  const inactiveColor = useColorModeValue("gray.300", "gray.600");

  return (
    <Box
      p={8}
      maxW="xl"
      mx="auto"
      mt={12}
      borderRadius="2xl"
      boxShadow={formShadow}
      bg={formBoxBg}
      borderWidth="1px"
      borderColor={borderColor}
      transition="all 0.2s ease"
    >
      {/* Header */}
      <VStack spacing={2} mb={8} align="center">
        <Heading size="lg" fontWeight="semibold" textAlign="center" color="gray.700" _dark={{ color: "whiteAlpha.900" }}>
          Complete Your Profile
        </Heading>
        <Text fontSize="sm" color="gray.500" textAlign="center" maxW="sm">
          Just a few details to personalize your experience.
        </Text>

        {/* Progress Dots */}
        <HStack spacing={2} mt={4}>
          {[0, 1, 2].map((index) => (
            <Box
              key={index}
              w="8px"
              h="8px"
              borderRadius="full"
              bg={step >= index ? activeColor : inactiveColor}
              transition="background-color 0.3s ease"
            />
          ))}
        </HStack>
      </VStack>

      {/* Form */}
      <VStack spacing={6} align="stretch">
        {/* Step 0: Name */}
        <ScaleFade initialScale={0.95} in={step === 0}>
          {step === 0 && (
            <>
              <FormControl isRequired isInvalid={!!error && (!data.firstName || !data.lastName)}>
                <FormLabel fontSize="sm" fontWeight="medium" color="gray.700" _dark={{ color: "gray.200" }}>
                  First Name
                </FormLabel>
                <Input
                  placeholder="e.g. John"
                  value={data.firstName}
                  onFocus={() => setError("")}
                  onChange={(e) => setData((prev) => ({ ...prev, firstName: e.target.value }))}
                  borderRadius="lg"
                  focusBorderColor="blue.400"
                  _focus={{ shadow: "sm" }}
                  bg="white"
                  _dark={{ bg: "gray.700" }}
                />
              </FormControl>

              <FormControl isRequired isInvalid={!!error && (!data.firstName || !data.lastName)}>
                <FormLabel fontSize="sm" fontWeight="medium" color="gray.700" _dark={{ color: "gray.200" }}>
                  Last Name
                </FormLabel>
                <Input
                  placeholder="e.g. Doe"
                  value={data.lastName}
                  onFocus={() => setError("")}
                  onChange={(e) => setData((prev) => ({ ...prev, lastName: e.target.value }))}
                  borderRadius="lg"
                  focusBorderColor="blue.400"
                  _focus={{ shadow: "sm" }}
                  bg="white"
                  _dark={{ bg: "gray.700" }}
                />
                {!!error && (!data.firstName || !data.lastName) && (
                  <FormErrorMessage>{error}</FormErrorMessage>
                )}
              </FormControl>
            </>
          )}
        </ScaleFade>

        {/* Step 1: Hobbies */}
        <ScaleFade initialScale={0.95} in={step === 1}>
          {step === 1 && (
            <FormControl isRequired isInvalid={!!error && !data.hobbies.length}>
              <FormLabel fontSize="sm" fontWeight="medium" color="gray.700" _dark={{ color: "gray.200" }}>
                Select Your Hobbies 🎯
              </FormLabel>
              <CheckboxGroup
                value={data.hobbies}
                onChange={(values) => {
                  setData((prev) => ({ ...prev, hobbies: values as string[] }));
                  setError("");
                }}
              >
                <SimpleGrid columns={{ base: 2, sm: 3 }} spacing={3}>
                  {HOBBY_OPTIONS.map((hobby) => (
                    <Checkbox
                      key={hobby}
                      value={hobby}
                      size="md"
                      colorScheme="blue"
                      px={3}
                      py={2}
                      borderRadius="md"
                      _hover={{ bg: "blue.50" }}
                      _dark={{ _hover: { bg: "blue.900" } }}
                    >
                      <Text fontSize="sm">{hobby}</Text>
                    </Checkbox>
                  ))}
                </SimpleGrid>
              </CheckboxGroup>
              {!!error && !data.hobbies.length && (
                <FormErrorMessage>{error}</FormErrorMessage>
              )}
            </FormControl>
          )}
        </ScaleFade>

        {/* Step 2: Language & Bio */}
        <ScaleFade initialScale={0.95} in={step === 2}>
          {step === 2 && (
            <>
              <FormControl isRequired isInvalid={!!error && !data.nativeLanguage}>
                <FormLabel fontSize="sm" fontWeight="medium" color="gray.700" _dark={{ color: "gray.200" }}>
                  Native Language 🗣️
                </FormLabel>
                <Select
                  placeholder="Select your language"
                  value={data.nativeLanguage}
                  onChange={(e) => setData((prev) => ({ ...prev, nativeLanguage: e.target.value }))}
                  onFocus={() => setError("")}
                  borderRadius="lg"
                  focusBorderColor="blue.400"
                  _focus={{ shadow: "sm" }}
                  bg="white"
                  _dark={{ bg: "gray.700" }}
                >
                  {LANGUAGE_OPTIONS.map((lang) => (
                    <option key={lang} value={lang}>
                      {lang}
                    </option>
                  ))}
                </Select>
              </FormControl>

              <FormControl isRequired isInvalid={!!error && !data.bio}>
                <FormLabel fontSize="sm" fontWeight="medium" color="gray.700" _dark={{ color: "gray.200" }}>
                  About You 💬
                </FormLabel>
                <Input
                  placeholder="I love learning new things and exploring cultures 🌍"
                  value={data.bio}
                  onFocus={() => setError("")}
                  onChange={(e) => setData((prev) => ({ ...prev, bio: e.target.value }))}
                  borderRadius="lg"
                  focusBorderColor="blue.400"
                  _focus={{ shadow: "sm" }}
                  bg="white"
                  _dark={{ bg: "gray.700" }}
                />
                {!!error && (!data.nativeLanguage || !data.bio) && (
                  <FormErrorMessage>{error}</FormErrorMessage>
                )}
              </FormControl>
            </>
          )}
        </ScaleFade>

        {/* Navigation */}
        <Flex mt={6} justify="space-between" align="center">
          {step > 0 ? (
            <Button
              leftIcon={<ArrowBackIcon />}
              variant="ghost"
              colorScheme="blue"
              onClick={() => setStep((prev) => prev - 1)}
              fontWeight="medium"
            >
              Back
            </Button>
          ) : (
            <Box></Box> // Spacer for alignment
          )}

          {step < 2 ? (
            <Button
              rightIcon={<ArrowForwardIcon />}
              colorScheme="blue"
              onClick={() => setStep((prev) => prev + 1)}
              isDisabled={
                (step === 0 && (!data.firstName || !data.lastName)) ||
                (step === 1 && !data.hobbies.length)
              }
              px={6}
              fontWeight="semibold"
            >
              Next
            </Button>
          ) : (
            <Button
              rightIcon={<CheckCircleIcon />}
              colorScheme="green"
              onClick={onSubmit}
              isDisabled={!data.nativeLanguage || !data.bio}
              px={6}
              fontWeight="semibold"
            >
              Complete Profile
            </Button>
          )}
        </Flex>
      </VStack>
    </Box>
  );
}

export default UserProfile;