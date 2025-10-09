import { useEffect, useState } from "react";
import {
  Box,
  Flex,
  Spinner,
  Text,
  VStack,
  HStack,
  Avatar,
  Badge,
  IconButton,
  useColorModeValue,
 } from "@chakra-ui/react";
import {

  MdOutlineFlag, // 2nd
  MdPeopleOutline, // 3rd
} from "react-icons/md";
import {
  useAuthentication,
  type User,
} from "../../features/authentication/context/AuthenticationContextProvider";
import { usePageTitle } from "../../hook/usePageTitle";
import { request } from "../../utils/api";

import { TrophyIcon, CoinsIcon, Star, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";

// Medal Icon

// Medal background
const getMedalBg = (rank: number) => {
  if (rank === 1) return "yellow.400";
  if (rank === 2) return "gray.300";
  if (rank === 3) return "orange.400";
  return "transparent";
};

export function Leaderboard() {
  useAuthentication();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();
  usePageTitle("🏆 Leaderboard");

  useEffect(() => {
    request<User[]>({
      endpoint: "/api/v1/authentication/leaders",
      onSuccess: (data) => {
        setUsers(data);
        setLoading(false);
      },
      onFailure: (error) => {
        console.error("❌ Failed to load leaderboard:", error);
        setLoading(false);
      },
    });
  }, []);

  if (loading) {
    return (
      <Flex justify="center" align="center" h="80vh" p={4}>
        <Spinner size="lg" color="teal.500" />
        <Text ml={3} fontSize="md">
          Loading...
        </Text>
      </Flex>
    );
  }

  return (
    <Box maxW="1200px" mx="auto" px={4} py={2}>
      {/* Header */}
      <Flex
        align="center"
        justify="center"
        gap={2}
        mb={4}
        textAlign="center"
        wrap="wrap"
      >
        <TrophyIcon size={28} className="text-yellow-500" />
      </Flex>

      {/* Mobile: Sidebar Toggle */}
      <Flex justify="flex-end" mb={2} display={{ base: "flex", md: "none" }}>
        <IconButton
          aria-label={sidebarOpen ? "Hide Sidebar" : "Show Sidebar"}
          icon={sidebarOpen ? <MdOutlineFlag /> : <MdPeopleOutline />}
          onClick={() => setSidebarOpen(!sidebarOpen)}
          colorScheme="teal"
          size="sm"
          variant="outline"
        />
      </Flex>

      <Flex
        direction={{ base: "column", md: "row" }}
        gap={{ base: 3, md: 6 }}
        align="stretch"
      >
        {/* Leaderboard */}
        <VStack spacing={2} align="stretch" flex="1">
          {users.map((user, index) => {
            const rank = index + 1;
            const isTop3 = rank <= 3;
            const avatarUrl = user.profilePicture
              ? user.profilePicture.startsWith("http")
                ? user.profilePicture
                : `${import.meta.env.VITE_API_URL}/api/v1/storage/${
                    user.profilePicture
                  }`
              : "/avatar.svg";

            return (
              <Box
                key={user.id}
                p={3}
                borderWidth="1px"
                borderRadius="lg"
                // eslint-disable-next-line react-hooks/rules-of-hooks
                bg={useColorModeValue(
                  isTop3 ? "white" : "gray.50",
                  isTop3 ? "gray.700" : "gray.800"
                )}
                // eslint-disable-next-line react-hooks/rules-of-hooks
                borderColor={useColorModeValue("gray.200", "gray.600")}
                shadow="sm"
                _hover={{ shadow: "md", transform: "scale(1.005)" }}
                transition="all 0.15s ease"
                fontSize="sm"
              >
                <HStack
                  spacing={3}
                  justify="start"
                  align="center"
                  wrap="nowrap"
                >
                  {/* Rank & Medal */}
<Box flexShrink={0} w="40px">
  {isTop3 ? (
    <Badge
      bg={getMedalBg(rank)}
      color="white"
      px={2}
      py={1}
      borderRadius="full"
      fontWeight="bold"
      fontSize="xs"
      boxShadow="0 0 10px rgba(255,215,0,0.6)"
    >
      <HStack spacing={0.5} justify="center">
        <Sparkles size={14} />
        <Text fontSize="xs">{rank}</Text>
      </HStack>
    </Badge>
  ) : (
    <HStack spacing={0.5} color="gray.500">
      <Star size={14} />
      <Text fontSize="sm" fontWeight="medium">
        {rank}.
      </Text>
    </HStack>
  )}
</Box>

                
                    {/* Avatar & Name */}
                    <HStack flex="1" spacing={3} minW="0" 
                    onClick={() => navigate("/profile/" + user.id)}
                    cursor={"pointer"}
                    >
                      <Avatar
                        size="sm"
                        src={avatarUrl}
                        name={`${user.firstName} ${user.lastName}`}
                      />
                      <VStack align="start" spacing={0} flex="1" minW="0">
                        <Text fontWeight="bold" fontSize="sm" noOfLines={1}>
                          {user.firstName} {user.lastName}
                        </Text>
                        <Text fontSize="xs" color="gray.500" noOfLines={1}>
                          {user.nativeLanguage || "No language"}
                        </Text>
                      </VStack>
                    </HStack>

                    {/* Points */}
                    <HStack
                      spacing={1}
                      flexShrink={0}
                      justify="flex-end"
                      w="70px"
                    >
                      <CoinsIcon size={14} className="text-teal-500" />
                      <Text fontWeight="bold" color="teal.500" fontSize="sm">
                        {user.points}
                      </Text>
                    </HStack>
                
                </HStack>

                {/* Achievement Label (Mobile) */}
                {isTop3 && (
                  <Box mt={1} textAlign="center">
                    <Text fontSize="xs" color="gray.500">
                      {rank === 1
                        ? "👑 Champion!"
                        : rank === 2
                        ? "🥈 Great!"
                        : "🥉 Well done!"}
                    </Text>
                  </Box>
                )}
              </Box>
            );
          })}
        </VStack>

        {/* Sidebar */}
      </Flex>
    </Box>
  );
}
