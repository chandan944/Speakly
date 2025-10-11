import { type FormEvent } from "react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Box,
  Button,
  Input,
  Avatar,
  Text,
  VStack,
  HStack,
  IconButton,
  Card,
  CardBody,
  useColorModeValue,
} from "@chakra-ui/react";
import { CloseIcon } from "@chakra-ui/icons";
import {
  useAuthentication,
  type User,
} from "../../authentication/context/AuthenticationContextProvider";
import type { IConversation } from "../components/conversations/Conversations";
import { useWebSocket } from "../../../ws/WebSocketContextProvider";
import { request } from "../../../utils/api";
import type { IConnection } from "../../network/components/connection/Connection";
import { Messages } from "../components/messages/Messages";

export function Conversation() {
  const [postingMessage, setPostingMessage] = useState<boolean>(false);
  const [content, setContent] = useState<string>("");
  const [suggestingUsers, setSuggestingUsers] = useState<User[]>([]);
  const [search, setSearch] = useState<string>("");
  const [slectedUser, setSelectedUser] = useState<User | null>(null);
  const [conversation, setConversation] = useState<IConversation | null>(null);
  const [conversations, setConversations] = useState<IConversation[]>([]);
  const websocketClient = useWebSocket();
  const { id } = useParams();
  const navigate = useNavigate();
  const creatingNewConversation = id === "new";
  const { user } = useAuthentication();

  // Color mode values
  const bgColor = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.600");
  const textColor = useColorModeValue("gray.600", "gray.300");

  useEffect(() => {
    request<IConversation[]>({
      endpoint: "/api/v1/messaging/conversations",
      onSuccess: (data) => setConversations(data),
      onFailure: (error) => console.log(error),
    });
  }, []);

  useEffect(() => {
    const subscription = websocketClient?.subscribe(
      `/topic/users/${user?.id}/conversations`,
      (message) => {
        const conversation = JSON.parse(message.body);
        console.log(conversation);
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
      }
    );
    return () => subscription?.unsubscribe();
  }, [user?.id, websocketClient]);

  useEffect(() => {
    if (id == "new") {
      setConversation(null);
      request<IConnection[]>({
        endpoint: "/api/v1/networking/connections",
        onSuccess: (data) =>
          setSuggestingUsers(
            data.map((c) => (c.author.id === user?.id ? c.recipient : c.author))
          ),
        onFailure: (error) => console.log(error),
      });
    } else {
      request<IConversation>({
        endpoint: `/api/v1/messaging/conversations/${id}`,
        onSuccess: (data) => setConversation(data),
        onFailure: () => navigate("/messaging"),
      });
    }
  }, [id, navigate, user?.id]);

  useEffect(() => {
    const subscription = websocketClient?.subscribe(
      `/topic/conversations/${conversation?.id}/messages`,
      (data) => {
        const message = JSON.parse(data.body);

        setConversation((prevConversation) => {
          if (!prevConversation) return null;
          const index = prevConversation.messages.findIndex(
            (m) => m.id === message.id
          );
          if (index === -1) {
            return {
              ...prevConversation,
              messages: [...prevConversation.messages, message],
            };
          }
          return {
            ...prevConversation,
            messages: prevConversation?.messages.map((m) =>
              m.id === message.id ? message : m
            ),
          };
        });
      }
    );
    return () => subscription?.unsubscribe();
  }, [conversation?.id, websocketClient]);

  async function addMessageToConversation(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPostingMessage(true);
    await request<void>({
      endpoint: `/api/v1/messaging/conversations/${conversation?.id}/messages`,
      method: "POST",
      body: JSON.stringify({
        receiverId:
          conversation?.recipient.id == user?.id
            ? conversation?.author.id
            : conversation?.recipient.id,
        content,
      }),
      onSuccess: () => {},
      onFailure: (error) => console.log(error),
    });
    setPostingMessage(false);
  }

  async function createConversationWithMessage(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const message = {
      receiverId: slectedUser?.id,
      content,
    };

    await request<IConversation>({
      endpoint: "/api/v1/messaging/conversations",
      method: "POST",
      body: JSON.stringify(message),
      onSuccess: (conversation) =>
        navigate(`/messaging/conversations/${conversation.id}`),
      onFailure: (error) => console.log(error),
    });
  }

  const conversationUserToDisplay =
    conversation?.recipient.id === user?.id
      ? conversation?.author
      : conversation?.recipient;

  return (
    <Box
      h="92vh"
      bg={bgColor}
      display="flex"
      flexDirection="column"
      borderRadius={creatingNewConversation ? "md" : "none"}
    >
      {(conversation || creatingNewConversation) && (
        <>
          {/* Conversation Header */}
          {conversation && (
            <Box my={2} borderBottom="1px" borderColor={borderColor}>
              <HStack spacing={3}>
                <Button
                  variant="ghost"
                  p={0}
                  onClick={() =>
                    navigate(`/profile/${conversationUserToDisplay?.id}`)
                  }
                >
                  <Avatar
                    size="sm"
                    src={
                      conversationUserToDisplay?.profilePicture
                        ? conversationUserToDisplay.profilePicture.startsWith(
                            "http"
                          )
                          ? conversationUserToDisplay.profilePicture
                          : `${import.meta.env.VITE_API_URL}/api/v1/storage/${
                              conversationUserToDisplay.profilePicture
                            }`
                        : "/avatar.svg"
                    }
                    name={`${conversationUserToDisplay?.firstName} ${conversationUserToDisplay?.lastName}`}
                  />
                </Button>
                <VStack align="start" spacing={0}>
                  <Text fontFamily='cursive' fontWeight="semibold" fontSize="md">
                    {conversationUserToDisplay?.firstName}{" "}
                    {conversationUserToDisplay?.lastName}
                  </Text>
                </VStack>
              </HStack>
            </Box>
          )}

          {/* New Conversation Form */}
          {creatingNewConversation && (
            <Box
              p={4}
              as="form"
              onSubmit={(e: { preventDefault: () => unknown }) =>
                e.preventDefault()
              }
            >
              <Text mb={4} fontWeight="medium">
                Starting a new conversation {slectedUser && "with:"}
              </Text>

              {!slectedUser && (
                <Input
                  isDisabled={suggestingUsers.length === 0}
                  type="text"
                  name="recipient"
                  placeholder="Type a name"
                  onChange={(e) => setSearch(e.target.value)}
                  value={search}
                  mb={4}
                />
              )}

              {slectedUser && (
                <Card mb={4}>
                  <CardBody>
                    <HStack spacing={3}>
                      <Avatar
                        size="sm"
                        src={
                          slectedUser?.profilePicture
                            ? slectedUser.profilePicture.startsWith("http")
                              ? slectedUser.profilePicture
                              : `${
                                  import.meta.env.VITE_API_URL
                                }/api/v1/storage/${slectedUser.profilePicture}`
                            : "/avatar.svg"
                        }
                        name={`${slectedUser?.firstName} ${slectedUser?.lastName}`}
                      />
                      <VStack align="start" spacing={0} flex={1}></VStack>
                      <IconButton
                        aria-label="Remove selected user"
                        icon={<CloseIcon />}
                        size="sm"
                        variant="ghost"
                        onClick={() => setSelectedUser(null)}
                      />
                    </HStack>
                  </CardBody>
                </Card>
              )}

              {!slectedUser && !conversation && (
                <VStack spacing={2} align="stretch">
                  {suggestingUsers
                    .filter(
                      (user) =>
                        user.firstName?.includes(search) ||
                        user.lastName?.includes(search)
                    )
                    .map((user) => (
                      <Button
                        key={user.id}
                        variant="ghost"
                        h="auto"
                        p={3}
                        justifyContent="flex-start"
                        onClick={() => {
                          const conversation = conversations.find(
                            (c) =>
                              c.recipient.id === user.id ||
                              c.author.id === user.id
                          );
                          if (conversation) {
                            navigate(
                              `/messaging/conversations/${conversation.id}`
                            );
                          } else {
                            setSelectedUser(user);
                          }
                        }}
                      >
                        <HStack spacing={3} w="full">
                          <Avatar
                            size="md"
                            name={`${user.firstName} ${user.lastName}`}
                            src={user.profilePicture || "/avatar.svg"}
                          />
                        </HStack>
                      </Button>
                    ))}
                </VStack>
              )}

              {suggestingUsers.length === 0 && (
                <Box p={4} textAlign="center" color={textColor}>
                  You need to have connections to start a conversation.
                </Box>
              )}
            </Box>
          )}

          {/* Messages */}
          {conversation && (
            <Box
              flex={1}
              overflow="auto"
              sx={{
                // Hide scrollbar but keep functionality
                "&::-webkit-scrollbar": {
                  display: "none", // Safari and Chrome
                },
               msOverflowStyle: 'none',
  scrollbarWidth: 'none' // Firefox
              }}
            >
              <Messages messages={conversation.messages} user={user} />
            </Box>
          )}

          {/* Message Input Form */}
          <Box
            p={4}
            borderTop="1px"
            borderColor={borderColor}
            as="form"
            onSubmit={async (e: FormEvent<HTMLFormElement>) => {
              if (!content) return;
              if (conversation) {
                await addMessageToConversation(e);
              } else {
                await createConversationWithMessage(e);
              }
              setContent("");
              setSelectedUser(null);
            }}
          >
            <HStack spacing={2}>
              <Input
                onChange={(e) => setContent(e.target.value)}
                value={content}
                name="content"
                placeholder="Write a message..."
                flex={1}
              />
              <IconButton
                type="submit"
                aria-label="Send message"
                colorScheme="blue"
                isDisabled={
                  postingMessage ||
                  !content.trim() ||
                  (creatingNewConversation && !slectedUser)
                }
                icon={
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 512 512"
                    fill="currentColor"
                    width="16"
                    height="16"
                  >
                    <path d="M16.1 260.2c-22.6 12.9-20.5 47.3 3.6 57.3L160 376l0 103.3c0 18.1 14.6 32.7 32.7 32.7c9.7 0 18.9-4.3 25.1-11.8l62-74.3 123.9 51.6c18.9 7.9 40.8-4.5 43.9-24.7l64-416c1.9-12.1-3.4-24.3-13.5-31.2s-23.3-7.5-34-1.4l-448 256zm52.1 25.5L409.7 90.6 190.1 336l1.2 1L68.2 285.7zM403.3 425.4L236.7 355.9 450.8 116.6 403.3 425.4z" />
                  </svg>
                }
              />
            </HStack>
          </Box>
        </>
      )}
    </Box>
  );
}
