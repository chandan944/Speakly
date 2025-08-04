import { useEffect, useState } from "react";
import {
  Avatar,
  Box,
  Button,
  HStack,
  Image,
  Text,
  VStack,
  useColorModeValue,
} from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { request } from "../../../../utils/api";
import { useWebSocket } from "../../../../ws/WebSocketContextProvider";
import type { User } from "../../../authentication/context/AuthenticationContextProvider";
import type { IConnection } from "../../../network/components/connection/Connection";
import { FaUserFriends } from "react-icons/fa";

interface ILeftSidebarProps {
  user: User | null;
}

function LeftSidebar({ user }: ILeftSidebarProps) {
  const [connections, setConnections] = useState<IConnection[]>([]);
  const ws = useWebSocket();
  const navigate = useNavigate();

  // 🎯 Fetch connections
  useEffect(() => {
    if (!user?.id) return;
    request<IConnection[]>({
      endpoint: `/api/v1/networking/connections?userId=${user.id}`,
      onSuccess: setConnections,
      onFailure: (err) => console.error("Connection fetch failed:", err),
    });
  }, [user?.id]);

  // 🔁 Real-time connection accepted
  useEffect(() => {
    if (!user?.id || !ws) return;
    const sub = ws.subscribe(
      `/topic/users/${user.id}/connections/accepted`,
      (data) => {
        const connection = JSON.parse(data.body);
        setConnections((prev) => [...prev, connection]);
      }
    );
    return () => sub.unsubscribe();
  }, [user?.id, ws]);

  // 🔁 Real-time connection removal
  useEffect(() => {
    if (!user?.id || !ws) return;
    const sub = ws.subscribe(
      `/topic/users/${user.id}/connections/remove`,
      (data) => {
        const connection = JSON.parse(data.body);
        setConnections((prev) => prev.filter((c) => c.id !== connection.id));
      }
    );
    return () => sub.unsubscribe();
  }, [user?.id, ws]);

  const bg = useColorModeValue("white", "gray.800");
  const nameColor = useColorModeValue("gray.800", "white");
  const countColor = useColorModeValue("green.600", "green.300");

  return (
    <VStack
      bg={bg}
      p={4}
      spacing={6}
      align="stretch"
      borderRadius="xl"
      shadow="lg"
      w="full"
      overflow="hidden"
      position="relative"
    >
      {/* 🖼️ Cover Image */}
      <Box position="relative" w="100%" h="80px" borderRadius="lg">
        <Image
          borderRadius={5}
          src="/3d-rendering-spring-background.jpg"
          alt="Cover"
          w="100%"
          h="100%"
          objectFit="cover"
        />
        {/* 👤 Avatar */}
        <Box>
          <Avatar
            size="xl"
            position="absolute"
            bottom="-50px"
            left="16px"
            border="2px solid white"
            zIndex="1"
            background={useColorModeValue("white", "gray.800")}
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
        </Box>
      </Box>

      {/* 📛 User Name */}
      <Box mt={8} pl={2}>
        <Text fontSize="lg" fontWeight="bold" color={nameColor}>
          {user?.firstName?.charAt(0).toUpperCase()}
          {user?.firstName?.slice(1)} {user?.lastName?.charAt(0).toUpperCase()}
          {user?.lastName?.slice(1)}
        </Text>
      </Box>

      {/* 📋 Info Items */}
      <VStack align="start" spacing={3} px={2}>
        {/* <InfoItem label="Name" value={`${user?.firstName?.toUpperCase()} ${user?.lastName}`} /> */}
        <InfoItem
          label="Native Language"
          value={
            user?.nativeLanguage
              ? `${user.nativeLanguage
                  .charAt(0)
                  .toUpperCase()}${user.nativeLanguage.slice(1)}`
              : "Not provided"
          }
        />
        <InfoItem
          label="Bio"
          value={
            user?.bio
              ? `${user.bio.charAt(0).toUpperCase()}${user.bio.slice(1)}`
              : "Not provided"
          }
        />
        <InfoItem
          label="Hobbies"
          value={
            user?.hobbies && user.hobbies.length > 0  
              ? `${user.hobbies.map((hobby) => hobby.charAt(0).toUpperCase() + hobby.slice(1)).join(", ")}`
              : "Not provided"
          }
        />

         <InfoItem
          label="Points"
          value={
            user?.points
              ? `${user.points}`
              : "0"
          }
          
        />
      </VStack>

      {/* 👥 Connections */}
      <Box mt={2}>
        <Button
          variant="ghost"
          justifyContent="space-between"
          w="full"
          onClick={() => navigate("/network/connections")}
          borderRadius="md"
          // px={4}
          py={2}
          _hover={{ bg: useColorModeValue("gray.100", "gray.700") }}
        >
          <Text color={"green.300"}>Friends</Text>
          <Text
            fontWeight="bold"
            display={"flex"}
            justifyContent={"center"}
            gap={2}
            alignItems={"center"}
            color={countColor}
          >
            {connections.filter((c) => c.status === "ACCEPTED").length}{" "}
            <FaUserFriends />
          </Text>
        </Button>
      </Box>
    </VStack>
  );
}

export default LeftSidebar;

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <HStack align="start" spacing={1}>
      <Box>
        <Text fontSize="xs" color="gray.500" fontWeight="medium">
          {label}
        </Text>
        <Text fontSize="sm" fontWeight="semibold">
          {value}
        </Text>
      </Box>
    </HStack>
  );
}
