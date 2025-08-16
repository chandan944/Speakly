import {
  Avatar,
  Box,
  Button,
  Divider,
  Flex,
  Text,
  VStack,
  HStack,
  useOutsideClick,
  useColorMode,
  useColorModeValue,
  Icon,
  Badge,
  useBreakpointValue,
  IconButton,
} from "@chakra-ui/react";

import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { UserIcon, LogOutIcon, CoinsIcon } from "lucide-react";
import { useAuthentication } from "../../../../features/authentication/context/AuthenticationContextProvider";
import { MoonIcon, SunIcon } from "@chakra-ui/icons";

export function MyProfile() {
  const [open, setOpen] = useState(false);

  // 📱 Responsive values
  const dropdownWidth = useBreakpointValue({ base: "72", sm: "80", md: "80" });
  const fontSize = useBreakpointValue({ base: "md", md: "lg" });
  const padding = useBreakpointValue({ base: 4, md: 6 });

  // 🎨 Optimized color palette
  const bgColor = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.600");
  const textPrimary = useColorModeValue("gray.800", "white");
  const textSecondary = useColorModeValue("gray.600", "gray.300");
  const hoverBg = useColorModeValue("gray.50", "gray.700");
  const gradientText = useColorModeValue("purple.600", "purple.300");
  const logoutButtonHoverBg = useColorModeValue("red.50", "red.900");
  const logoutButtonHoverColor = useColorModeValue("red.600", "red.300");

  const { logout, user } = useAuthentication();
  const navigate = useNavigate();
  const { colorMode, toggleColorMode } = useColorMode();
  const ref = useRef(null);

  useOutsideClick({
    ref,
    handler: () => setOpen(false),
  });

  const toggleDropdown = () => {
    setOpen((prev) => !prev);
  };

  return (
    <Box position="relative" ref={ref}>
      {/* 🔘 Optimized Avatar Button */}
      <Flex
        cursor="pointer"
        onClick={toggleDropdown}
        align="center"
        justify="center"
        position="relative"
        transition="transform 0.15s ease"
        _hover={{ transform: "scale(1.05)" }}
        _active={{ transform: "scale(0.98)" }}
      >
        <Avatar
          size="sm"
          src={
            user?.profilePicture
              ? user.profilePicture.startsWith("http")
                ? user.profilePicture
                : `${import.meta.env.VITE_API_URL}/api/v1/storage/${
                    user.profilePicture
                  }`
              : "/avatar.svg"
          }
          name={`${user?.firstName} ${user?.lastName}`}
        />

        {/* Simple status dot */}
        <Box
          position="absolute"
          bottom="0"
          right="0"
          w="3"
          h="3"
          bg="green.400"
          borderRadius="full"
          border="2px solid white"
        />
      </Flex>

      {/* ⬇️ Mobile-Optimized Dropdown */}
      {open && (
        <Box
          position="absolute"
          top={{ base: "2.5rem", md: "3rem" }}
          right="0"
          zIndex="20"
          w={dropdownWidth}
          maxW="90vw" // Mobile constraint
          bg={bgColor}
          border="1px solid"
          borderColor={borderColor}
          borderRadius={{ base: "xl", md: "2xl" }}
          boxShadow="xl"
          overflow="hidden"
          // Remove heavy effects for performance
          sx={{
            "@media (max-width: 48em)": {
              position: "fixed",
              top: "4rem",
              right: "1rem",
              left: "1rem",
              w: "auto",
              maxW: "none",
            },
          }}
        >
          {/* Header Section */}
          <Box p={padding}>
            <HStack spacing={{ base: 3, md: 4 }}>
              <Avatar
                size="lg"
                src={
                  user?.profilePicture
                    ? user.profilePicture.startsWith("http")
                      ? user.profilePicture
                      : `${import.meta.env.VITE_API_URL}/api/v1/storage/${
                          user.profilePicture
                        }`
                    : "/avatar.svg"
                }
                name={`${user?.firstName} ${user?.lastName}`}
              />
              <VStack align="flex-start" spacing={1} flex={1} minW="0">
                <HStack spacing={2} w="full">
                  <Text
                    fontSize={fontSize}
                    fontWeight="bold"
                    color={gradientText}
                    isTruncated
                    flex={1}
                  >
                    {user?.firstName} {user?.lastName}
                  </Text>
                 
                </HStack>

                <Text
                display={"flex"}
                // justifyContent={"center"}
                alignItems={"center"}
                gap={2}
                  fontSize="sm"
                  color={textSecondary}
                  fontWeight="medium"
                  isTruncated
                  w="full"
                >
                  {user?.points} <CoinsIcon/>{" "}
                </Text>

                <HStack spacing={1}>
                  <Icon as={UserIcon} w="3" h="3" color={textSecondary} />
                  <Text fontSize="xs" color={textSecondary} isTruncated>
                    {user?.nativeLanguage || "Remote"}
                  </Text>
                </HStack>
              </VStack>
              <IconButton
                marginX={1}
                aria-label="Toggle Theme"
                onClick={toggleColorMode}
                icon={
                  colorMode === "light" ? (
                    <MoonIcon color="black" />
                  ) : (
                    <SunIcon color="orange" />
                  )
                }
                variant="ghost"
              />
            </HStack>
          </Box>

          <Divider borderColor={borderColor} />

          {/* Action Buttons - Simplified for mobile */}
          <VStack spacing={1} p={padding}>
            <Button
              w="full"
              variant="ghost"
              justifyContent="flex-start"
              leftIcon={<Icon as={UserIcon} w="4" h="4" />}
              size={{ base: "md", md: "md" }}
              fontWeight="medium"
              color={textPrimary}
              _hover={{ bg: hoverBg }}
              transition="background-color 0.15s ease"
              borderRadius="lg"
              onClick={() => {
                setOpen(false);
                navigate(`/profile/${user?.id}`);
              }}
            >
              View Profile
            </Button>

            <Button
              w="full"
              variant="ghost"
              justifyContent="flex-start"
              leftIcon={<Icon as={LogOutIcon} w="4" h="4" />}
              size={{ base: "md", md: "md" }}
              fontWeight="medium"
              color="red.500"
              _hover={{
                bg: logoutButtonHoverBg,

                color: logoutButtonHoverColor,
              }}
              transition="all 0.15s ease"
              borderRadius="lg"
              onClick={() => {
                setOpen(false);
                logout();
              }}
            >
              Sign Out
            </Button>
          </VStack>

          {/* Simple accent bar */}
          <Box h="2" bg={gradientText} opacity="0.8" />
        </Box>
      )}
    </Box>
  );
}
