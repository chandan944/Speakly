import { useEffect, useState, type HTMLAttributes } from "react";
import { request } from "../../../../utils/api";
import {
  Box,
  Text,
  VStack,
  Divider,
  Flex,
  keyframes,
  useColorModeValue,
} from "@chakra-ui/react";
import type { IMessage } from "../messages/Messages";
import {
  useAuthentication,
  type User,
} from "../../../authentication/context/AuthenticationContextProvider";
import { useWebSocket } from "../../../../ws/WebSocketContextProvider";
import { Conversation } from "./Conversation";

export interface IConversation {
  id: number;
  author: User;
  recipient: User;
  messages: IMessage[];
}

type IConversationsProps = HTMLAttributes<HTMLDivElement>;

// Animation for empty state
const pulse = keyframes`
  0% { opacity: 0.6; }
  50% { opacity: 1; }
  100% { opacity: 0.6; }
`;

// Subtle fade-in animation for conversations
const fadeIn = keyframes`
  0% { opacity: 0; transform: translateY(10px); }
  100% { opacity: 1; transform: translateY(0); }
`;

export function Conversations(props: IConversationsProps) {
  const [conversations, setConversations] = useState<IConversation[]>([]);
  const { user } = useAuthentication();
  const websocketClient = useWebSocket();

  // Enhanced color mode values for better consistency with Conversation component
  const bg = useColorModeValue("white", "gray.800");
  const dividerColor = useColorModeValue("gray.100", "gray.700");
  const emptyStateText = useColorModeValue("gray.500", "gray.400");
  const emptyStateSubtext = useColorModeValue("gray.400", "gray.500");
  const shadowColor = useColorModeValue("blackAlpha.50", "whiteAlpha.50");

  useEffect(() => {
    request<IConversation[]>({
      endpoint: "/api/v1/messaging/conversations",
      onSuccess: (data) => setConversations(data),
      onFailure: (error) => console.log(error),
    });
  }, []);

  useEffect(() => {
    if (!websocketClient || !user?.id) return;

    const subscription = websocketClient.subscribe(
      `/topic/users/${user.id}/conversations`,
      (message) => {
        try {
          const conversation = JSON.parse(message.body);
          setConversations((prevConversations) => {
            const index = prevConversations.findIndex(
              (c) => c.id === conversation.id
            );
            if (index === -1) {
              return [conversation, ...prevConversations];
            }
            return prevConversations.map((c) =>
              c.id === conversation.id ? conversation : c
            );
          });
        } catch (error) {
          console.error("Error parsing conversation from WebSocket:", error);
        }
      }
    );

    return () => subscription?.unsubscribe();
  }, [user?.id, websocketClient]);

  return (
    <Box
      {...props}
      bg={bg}
      borderRadius="xl"
      overflow="hidden"
      boxShadow={`0 1px 3px 0 ${shadowColor}, 0 1px 2px 0 ${shadowColor}`}
      border="1px solid"
      borderColor={dividerColor}
      mx={2}
      my={2}
    >
      {conversations.length > 0 ? (
        <VStack spacing={0} align="stretch" w="full">
          {conversations.map((conversation, index) => (
            <Box
              key={conversation.id}
              w="full"
              animation={`${fadeIn} 0.3s ease-out`}
              transitionDelay={`${index * 0.05}s`}
             
            >
              <Conversation conversation={conversation} />
              {index < conversations.length - 1 && (
                <Divider 
                  ml={16} 
                  borderColor={dividerColor} 
                  borderWidth="0.5px"
                  opacity={0.6}
                />
              )}
            </Box>
          ))}
        </VStack>
      ) : (
        <Flex
          p={12}
          justify="center"
          align="center"
          minHeight="300px"
          direction="column"
          w="full"
        >
          <Box
            animation={`${pulse} 2s infinite`}
            textAlign="center"
          >
            <Text
              color={emptyStateText}
              fontSize="lg"
              fontWeight="semibold"
              mb={3}
            >
              No conversations yet
            </Text>
            <Text
              color={emptyStateSubtext}
              fontSize="sm"
              maxW="280px"
              lineHeight="1.5"
            >
              Start a conversation by messaging someone from your contacts
            </Text>
          </Box>
        </Flex>
      )}
    </Box>
  );
}