import { useEffect, useState, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Input,
  VStack,
  HStack,
  Avatar,
  Text,
  useColorModeValue,
  Spinner,
  useBreakpointValue,
} from "@chakra-ui/react";
import { request } from "../../../../utils/api";
import type { User } from "../../../../features/authentication/context/AuthenticationContextProvider";

export function Search() {
  const [searchTerm, setSearchTerm] = useState("");
  const [suggestions, setSuggestions] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Chakra tokens
  const textSecondary = useColorModeValue("gray.500", "gray.400");
  const borderColor = useColorModeValue("gray.200", "gray.600");
  const suggestionsBg = useColorModeValue("white", "gray.800");
  const hoverBg = useColorModeValue("gray.100", "gray.700");
  const searchWidth = useBreakpointValue({ base: "100%", md: "400px" });
  const fontSize = useBreakpointValue({ base: "sm", md: "md" });
  const avatarSize = useBreakpointValue({ base: "sm", md: "md" });

  // Debounced fetch
  useEffect(() => {
    if (!searchTerm.trim()) {
      setSuggestions([]);
      setIsLoading(false);
      setIsOpen(false);
      return;
    }
    setIsLoading(true);
    const handle = setTimeout(() => {
      request<User[]>({
        endpoint: `/api/v1/search/users?query=${encodeURIComponent(
          searchTerm
        )}`,
        onSuccess: (data) => {
          const unique = data.filter(
            (u, i, arr) => arr.findIndex((x) => x.id === u.id) === i
          );
          setSuggestions(unique);
          setIsOpen(true);
          setIsLoading(false);
        },
        onFailure: () => setIsLoading(false),
      });
    }, 300);
    return () => clearTimeout(handle);
  }, [searchTerm]);

  // Close dropdown on outside click
  const handleClickOutside = useCallback((e: MouseEvent) => {
    if (
      containerRef.current &&
      !containerRef.current.contains(e.target as Node)
    ) {
      setIsOpen(false);
    }
  }, []);
  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [handleClickOutside]);

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const selectUser = (user: User) => {
    navigate(`/profile/${user.id}`);
    setSearchTerm("");
    setIsOpen(false);
  };

  return (
    <Box ref={containerRef} position="relative" w={searchWidth} maxW="100%">
      <Input
        value={searchTerm}
        onChange={onChange}
        placeholder="Search for people..."
        size="md"
        borderRadius="md"
        focusBorderColor="blue.400"
        _placeholder={{ color: textSecondary }}
        pr={isLoading ? "40px" : "12px"}
        onFocus={() => searchTerm && setIsOpen(true)}
      />
      {isLoading && (
        <Box pos="absolute" right="12px" top="50%" transform="translateY(-50%)">
          <Spinner size="sm" color="blue.400" />
        </Box>
      )}

      {isOpen && (
        <Box
          pos="absolute"
          top="100%"
          left={0}
          right={0}
          bg={suggestionsBg}
          border="1px solid"
          borderColor={borderColor}
          borderRadius="md"
          boxShadow="lg"
          mt={1}
          maxH="300px"
          overflowY="auto"
          zIndex={10}
          minW={"12rem"}
          sx={{
            // Hide scrollbar but keep functionality
            "&::-webkit-scrollbar": {
              display: "none", // Safari and Chrome
            },
            "-ms-overflow-style": "none", // IE and Edge
            "scrollbar-width": "none", // Firefox
          }}
        >
          {suggestions.length === 0 ? (
            <Text p={3} color={textSecondary} fontSize={fontSize}>
              No users found.
            </Text>
          ) : (
            <VStack spacing={0} align="stretch">
              {suggestions.map((user) => (
                <Box
                  key={user.id}
                  _hover={{ bg: hoverBg }}
                  cursor="pointer"
                  onMouseDown={() => selectUser(user)} // 💥 use onMouseDown!
                  p={3}
                >
                  <HStack spacing={3}>
                    <Avatar
                      size={avatarSize}
                      src={
                        user.profilePicture?.startsWith("http")
                          ? user.profilePicture
                          : `${import.meta.env.VITE_API_URL}/api/v1/storage/${
                              user.profilePicture
                            }`
                      }
                      name={`${user.firstName} ${user.lastName}`}
                    />
                    <VStack align="start" spacing={0} flex={1} minW={0}>
                      <Text
                        fontWeight="semibold"
                        fontSize={fontSize}
                        noOfLines={1}
                      >
                        {user.firstName} {user.lastName}
                      </Text>
                      <Text fontSize="xs" color={textSecondary} noOfLines={1}>
                        {user.profession || "No profession listed"}
                      </Text>
                    </VStack>
                  </HStack>
                </Box>
              ))}
            </VStack>
          )}
        </Box>
      )}
    </Box>
  );
}
