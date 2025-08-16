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
  ScaleFade
} from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { useAuthentication } from "../../context/AuthenticationContextProvider";
import { ArrowBackIcon, ArrowForwardIcon, CheckCircleIcon } from "@chakra-ui/icons";

// 🎯 Common Hobbies
const HOBBY_OPTIONS = [
  "Reading", "Music", "Traveling", "Photography", "Cooking",
  "Gardening", "Gaming", "Drawing", "Writing", "Dancing",
  "Fitness", "Cycling", "Hiking", "Swimming", "Running",
  "Yoga", "Movies", "Crafting", "Fishing", "Coding",
];

// 🌐 Indian Languages
const LANGUAGE_OPTIONS = [
  // 🌏 Asia — Massive populations learning English
  "Mandarin Chinese", // 🇨🇳 ~1.1B native speakers
  "Hindi",            // 🇮🇳 ~600M
  "Bengali",          // 🇮🇳🇧🇩 ~270M
  "Arabic",           // 🌍 ~310M
  "Urdu",             // 🇵🇰🇮🇳 ~170M
  "Indonesian",       // 🇮🇩 ~170M
  "Japanese",         // 🇯🇵 ~125M
  "Punjabi",          // 🇮🇳🇵🇰 ~125M
  "Telugu",           // 🇮🇳 ~95M
  "Marathi",          // 🇮🇳 ~83M
  "Tamil",            // 🇮🇳🇱🇰 ~80M
  "Turkish",          // 🇹🇷 ~80M
  "Korean",           // 🇰🇷🇰🇵 ~78M
  "Vietnamese",       // 🇻🇳 ~77M
  "Gujarati",         // 🇮🇳 ~56M

  // 🌍 Africa & Middle East — Growing English adoption
  "Swahili",          // 🌍 ~70M native + 90M second language
  "Persian (Farsi)",  // 🇮🇷🇦🇫 ~70M
  "Amharic",          // 🇪🇹 ~32M
  "Hausa",            // 🇳🇬 ~50M

  // 🌎 Europe & Latin America — Large learners
  "Spanish",          // 🌍 ~480M
  "Portuguese",       // 🇧🇷🇵🇹 ~220M
  "French",           // 🌍 ~80M native, 280M total
  "German",           // 🇩🇪🇦🇹🇨🇭 ~76M
  "Russian",          // 🌍 ~150M
  "Italian",          // 🇮🇹 ~65M
  "Polish",           // 🇵🇱 ~45M
  "Ukrainian",        // 🇺🇦 ~30M

  // 📌 Smaller but high-shift rate to English
  "Malay",            // 🇲🇾 ~18M
  "Filipino (Tagalog)" // 🇵🇭 ~28M
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
              <FormControl  isInvalid={!!error && (!data.firstName || !data.lastName)}>
                <FormLabel my={5} fontSize="sm" fontWeight="medium" color="gray.700" _dark={{ color: "gray.200" }}>
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

              <FormControl isInvalid={!!error && (!data.firstName || !data.lastName)}>
                <FormLabel my={5} fontSize="sm" fontWeight="medium" color="gray.700" _dark={{ color: "gray.200" }}>
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
            <FormControl  isInvalid={!!error && !data.hobbies.length}>
              <FormLabel fontSize="sm" fontWeight="medium" color="gray.700" _dark={{ color: "gray.200" }}>
                Select Your Hobbies
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
              <FormControl isInvalid={!!error && !data.nativeLanguage}>
                <FormLabel my={5} fontSize="sm" fontWeight="medium" color="gray.700" _dark={{ color: "gray.200" }}>
                  Native Language
                </FormLabel>
              <Select
  placeholder="🌐 Choose your language"
  value={data.nativeLanguage}
  onChange={(e) =>
    setData((prev) => ({ ...prev, nativeLanguage: e.target.value }))
  }
  onFocus={() => setError("")}
  bg="white"
  _dark={{ bg: "gray.800", color: "white", borderColor: "gray.600" }}
  border="2px solid"
  borderColor="gray.200"
  borderRadius="xl"
  fontWeight="medium"
  fontSize="md"
 
  shadow="sm"
  transition="all 0.25s ease-in-out"
  _hover={{
    borderColor: "blue.400",
    shadow: "md",
    transform: "translateY(-1px)",
  }}
  _focus={{
    borderColor: "blue.500",
    shadow: "lg",
    outline: "none",
  }}
>
  {LANGUAGE_OPTIONS.map((lang) => (
    <option
      key={lang}
      value={lang}
      style={{
        backgroundColor: "white",
        color: "black",
      }}
    >
      {lang}
    </option>
  ))}
</Select>

              </FormControl>

              <FormControl isInvalid={!!error && !data.bio}>
                <FormLabel my={5} fontSize="sm" fontWeight="medium" color="gray.700" _dark={{ color: "gray.200" }}>
                  About You 
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