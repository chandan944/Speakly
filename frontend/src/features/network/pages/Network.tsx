import { useEffect, useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  Flex,
  Text,
  VStack,
  Heading,
  useColorModeValue,
  SimpleGrid,
  Avatar,
} from "@chakra-ui/react";

import { usePageTitle } from "../../../hook/usePageTitle";
import { useWebSocket } from "../../../ws/WebSocketContextProvider";
import {
  useAuthentication,
  type User,
} from "../../authentication/context/AuthenticationContextProvider";
import type { IConnection } from "../components/connection/Connection";
import { request } from "../../../utils/api";

import { FaUserFriends } from "react-icons/fa";
import { MdMobileFriendly, MdSendToMobile } from "react-icons/md";

export function Network() {
  usePageTitle("Friendship");

  const [connections, setConnections] = useState<IConnection[]>([]);
  const [invitations, setInvitations] = useState<IConnection[]>([]);
  const [suggestions, setSuggestions] = useState<User[]>([]);
  const navigate = useNavigate();
  const ws = useWebSocket();
  const { user } = useAuthentication();

  // Data fetching
  useEffect(() => {
    request<IConnection[]>({
      endpoint: "/api/v1/networking/connections",
      onSuccess: setConnections,
      onFailure: console.log,
    });
  }, []);

  useEffect(() => {
    request<IConnection[]>({
      endpoint: "/api/v1/networking/connections?status=PENDING",
      onSuccess: setInvitations,
      onFailure: console.log,
    });
  }, []);

  useEffect(() => {
    request<User[]>({
      endpoint: "/api/v1/networking/suggestions",
      onSuccess: setSuggestions,
      onFailure: console.log,
    });
  }, []);

  // WebSocket Updates
  useEffect(() => {
    const sub = ws?.subscribe(
      `/topic/users/${user?.id}/connections/new`,
      (data) => {
        const connection = JSON.parse(data.body);
        setInvitations((prev) => [connection, ...prev]);
        setSuggestions((prev) =>
          prev.filter(
            (s) =>
              s.id !== connection.author.id && s.id !== connection.recipient.id
          )
        );
      }
    );
    return () => sub?.unsubscribe();
  }, [user?.id, ws]);

  useEffect(() => {
    const sub = ws?.subscribe(
      `/topic/users/${user?.id}/connections/accepted`,
      (data) => {
        const connection = JSON.parse(data.body);
        setConnections((prev) => [connection, ...prev]);
        setInvitations((prev) => prev.filter((c) => c.id !== connection.id));
      }
    );
    return () => sub?.unsubscribe();
  }, [user?.id, ws]);

  useEffect(() => {
    const sub = ws?.subscribe(
      `/topic/users/${user?.id}/connections/remove`,
      (data) => {
        const connection = JSON.parse(data.body);
        setConnections((prev) => prev.filter((c) => c.id !== connection.id));
        setInvitations((prev) => prev.filter((c) => c.id !== connection.id));
      }
    );
    return () => sub?.unsubscribe();
  }, [user?.id, ws]);
  console.log(" from network :", +connections);
  return (
    <Flex
      direction={{ base: "column", md: "row" }}
      px={4}
      py={6}
      maxW="1200px"
      mx="auto"
      gap={8}
    >
      {/* Sidebar */}
      <Box
        minW={{ base: "full", md: "250px" }}
        borderColor={useColorModeValue("gray.200", "gray.700")}
        bg={useColorModeValue("white", "gray.800")}
      >
        <Heading size="md" mb={4}>
          Manage my network
        </Heading>
        <VStack align="stretch" spacing={3}>
          <NavLink to="invitations">
            {({ isActive }) => (
              <Flex
                align="center"
                p={3}
                borderRadius="md"
                bg={isActive ? "green.300" : ""}
                _hover={{ bg: "" }}
                justify="space-between"
              >
                <Flex justifyItems={"center"} alignItems={"center"} gap={2}>
                  <MdSendToMobile />
                  <Text fontWeight="medium">Invitations</Text>
                </Flex>
                <Text
                  fontSize="sm"
                  // bg="teal.500"
                  // color="white"
                  px={2}
                  borderRadius="full"
                >
                  {invitations.length}
                </Text>
              </Flex>
            )}
          </NavLink>

          <NavLink to="connections">
            {({ isActive }) => (
              <Flex
                align="center"
                p={3}
                borderRadius="md"
                bg={isActive ? "green.300" : ""}
                _hover={{ bg: "" }}
                justify="space-between"
              >
                <Flex justifyItems={"center"} alignItems={"center"} gap={2}>
                  <MdMobileFriendly />
                  <Text fontWeight="medium"> Connections</Text>
                </Flex>
                <Text
                  fontSize="sm"
                  // bg="teal.500"
                  // color="white"
                  px={2}
                  borderRadius="full"
                >
                  {connections.length}
                </Text>
              </Flex>
            )}
          </NavLink>
        </VStack>
      </Box>

      {/* Content */}
      <Box flex="1">
        <Outlet />

        {suggestions.length > 0 && (
          <Box mt={8}>
            <Heading size="md" mb={4}>
              People you may know
            </Heading>
            <SimpleGrid columns={{ base: 1, sm: 2, md: 3 }} spacing={4}>
              {suggestions.map((s) => (
                <Flex
                  key={s.id}
                  p={4}
                  border="1px solid"
                  borderRadius="md"
                  justify={"space-between"}
                >
                  <Flex align="center" gap={3}>
                    <Avatar
                      size="sm"
                      src={
                        s?.profilePicture // Check suggestion's profile picture
                          ? s.profilePicture.startsWith("http")
                            ? s.profilePicture
                            : `${import.meta.env.VITE_API_URL}/api/v1/storage/${
                                s.profilePicture
                              }`
                          : "/avatar.svg"
                      }
                      name={`${s.firstName} ${s.lastName}`}
                      cursor="pointer"
                      onClick={() => navigate(`/profile/${s.id}`)}
                    />
                    <VStack align="start" spacing={0}>
                      <Text fontSize="1rem" fontWeight="semibold">
                        {s.firstName} {s.lastName}
                      </Text>

                      {/* You can uncomment this when position/company is available */}
                      <Text fontSize="sm">{s.nativeLanguage} </Text>
                    </VStack>
                  </Flex>
                  <Button
                    mt={3}
                    size="md"
                    colorScheme="teal"
                    onClick={() => {
                      request<IConnection>({
                        endpoint: `/api/v1/networking/connections?recipientId=${s.id}`,
                        method: "POST",
                        onSuccess: () => {
                          setSuggestions((prev) =>
                            prev.filter((item) => item.id !== s.id)
                          );
                        },
                        onFailure: console.log,
                      });
                    }}
                  >
                    +<FaUserFriends />
                  </Button>
                </Flex>
              ))}
            </SimpleGrid>
          </Box>
        )}
      </Box>
    </Flex>
  );
}
