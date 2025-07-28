// Conversation.tsx
import { useEffect, useState, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Box,
  Button,
  Avatar,
  Text,
  Badge,
  VStack,
  HStack,
  useColorModeValue,
  keyframes,
} from "@chakra-ui/react";
import type { IConversation } from "./Conversations";
import { useAuthentication } from "../../../authentication/context/AuthenticationContextProvider";
import { useWebSocket } from "../../../../ws/WebSocketContextProvider";

// Refined pulse animation for unread indicators
const pulse = keyframes`
  0% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.05); opacity: 0.95; }
  100% { transform: scale(1); opacity: 1; }
`;

interface ConversationItemProps {
  conversation: IConversation;
}

export function Conversation(props: ConversationItemProps) {
  const { user } = useAuthentication();
  const navigate = useNavigate();
  const { id } = useParams();
  const ws = useWebSocket();
  
  const [conversation, setConversation] = useState<IConversation>(props.conversation);

  // Refined color mode values for better consistency and accessibility
  const activeBg = useColorModeValue("blue.50", "blue.900");
  const hoverBg = useColorModeValue("gray.50", "gray.700");
  const activeHoverBg = useColorModeValue("blue.100", "blue.800");
  const borderColor = useColorModeValue("blue.400", "blue.300");
  const primaryText = useColorModeValue("gray.900", "white");
  const secondaryText = useColorModeValue("gray.500", "gray.400");
  const unreadText = useColorModeValue("gray.900", "white");
  const unreadBg = useColorModeValue("blue.500", "blue.400");
  const unreadColor = useColorModeValue("white", "gray.900");
  const shadowColor = useColorModeValue("blackAlpha.100", "whiteAlpha.100");
  const avatarBorder = useColorModeValue("gray.200", "gray.600");

  const conversationUserToDisplay =
    conversation.recipient.id === user?.id
      ? conversation.author
      : conversation.recipient;

  // ✅ Use useMemo to prevent recalculation on every render
  const unreadMessagesCount = useMemo(() => {
    if (!user?.id) return 0;
    
    return conversation.messages.filter(
      (message) => message.receiver.id === user.id && !message.isRead
    ).length;
  }, [conversation.messages, user?.id]);

  const isActive = id && Number(id) === conversation.id;

  // ✅ WebSocket subscription for real-time updates
  useEffect(() => {
    if (!ws || !conversation?.id) return;

    const subscription = ws.subscribe(
      `/topic/conversations/${conversation.id}/messages`,
      (data) => {
        try {
          const message = JSON.parse(data.body);

          setConversation((prevConversation) => {
            const messageExists = prevConversation.messages.some(
              (m) => m.id === message.id
            );

            let updatedMessages;
            if (!messageExists) {
              updatedMessages = [...prevConversation.messages, message];
            } else {
              updatedMessages = prevConversation.messages.map((m) =>
                m.id === message.id ? { ...m, ...message } : m
              );
            }

            return {
              ...prevConversation,
              messages: updatedMessages,
            };
          });
        } catch (error) {
          console.error("Error parsing message from WebSocket:", error, "Raw data:", data);
        }
      }
    );

    return () => {
      if (subscription && subscription.unsubscribe) {
        subscription.unsubscribe();
      }
    };
  }, [conversation?.id, ws]);

  const handleClick = () => {
    navigate(`/messaging/conversations/${conversation.id}`);
  };

  const lastMessage = conversation.messages[conversation.messages.length - 1];

  return (
    <Box position="relative" w="full" px={3} py={1}>
      {/* Active indicator bar */}
      {isActive && (
        <Box
          position="absolute"
          left={0}
          top="50%"
          transform="translateY(-50%)"
          w="3px"
          h="60%"
          bg={borderColor}
          borderRadius="full"
          zIndex={1}
        />
      )}

      <Button
        variant="ghost"
        w="full"
        h="auto"
        p={3}
        borderRadius="lg"
        bg={isActive ? activeBg : "transparent"}
        border="1px solid"
        borderColor={isActive ? borderColor : "transparent"}
        _hover={{
          bg: isActive ? activeHoverBg : hoverBg,
          borderColor: isActive ? borderColor : "gray.200",
          transform: "translateY(-1px)",
          boxShadow: `0 4px 12px -4px ${shadowColor}`,
        }}
        _active={{
          transform: "translateY(0)",
          boxShadow: `0 2px 8px -2px ${shadowColor}`,
        }}
        transition="all 0.2s cubic-bezier(0.4, 0, 0.2, 1)"
        onClick={handleClick}
        cursor="pointer"
        justifyContent="flex-start"
        fontWeight="normal"
      >
        <HStack spacing={3} w="full" align="center">
          {/* Avatar Section */}
          <Avatar
            size="md"
            src={
              conversationUserToDisplay?.profilePicture
                ? conversationUserToDisplay.profilePicture.startsWith("http")
                  ? conversationUserToDisplay.profilePicture
                  : `${import.meta.env.VITE_API_URL}/api/v1/storage/${
                      conversationUserToDisplay.profilePicture
                    }`
                : "/avatar.svg"
            }
            name={`${conversationUserToDisplay?.firstName} ${conversationUserToDisplay?.lastName}`}
            border={`2px solid ${avatarBorder}`}
            flexShrink={0}
          />

          {/* Content Section */}
          <VStack align="flex-start" spacing={1} flex={1} minW={0}>
            {/* Name and Badge Row */}
            <HStack w="full" justify="space-between" align="center">
              <Text
                fontWeight={unreadMessagesCount > 0 ? "semibold" : "medium"}
                color={unreadMessagesCount > 0 ? unreadText : primaryText}
                fontSize="sm"
                noOfLines={1}
                flex={1}
                minW={0}
              >
                {conversationUserToDisplay?.firstName} {conversationUserToDisplay?.lastName}
              </Text>

              {unreadMessagesCount > 0 && (
                <Badge
                  bg={unreadBg}
                  color={unreadColor}
                  borderRadius="full"
                  minW="20px"
                  h="20px"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  fontSize="xs"
                  fontWeight="bold"
                  px={2}
                  animation={`${pulse} 2s infinite`}
                  boxShadow={`0 1px 3px ${shadowColor}`}
                  flexShrink={0}
                >
                  {unreadMessagesCount > 99 ? '99+' : unreadMessagesCount}
                </Badge>
              )}
            </HStack>

            {/* Last Message */}
            <Text
              fontSize="xs"
              color={secondaryText}
              noOfLines={2}
              fontWeight="normal"
              w="full"
              minW={0}
              lineHeight="1.3"
            >
              {lastMessage?.content || "Start a conversation..."}
            </Text>
          </VStack>
        </HStack>
      </Button>
    </Box>
  );
}