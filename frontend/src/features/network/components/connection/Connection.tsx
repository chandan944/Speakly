import { useEffect, type Dispatch, type SetStateAction } from "react";
import { request } from "../../../../utils/api";
import { useNavigate } from "react-router-dom";
import {
  Avatar,
  Box,
  Button,
  Flex,
  Heading,
  Text,
  useColorModeValue,
  VStack,
  HStack,
  Tooltip,
} from "@chakra-ui/react";
import type { User } from "../../../authentication/context/AuthenticationContextProvider";
import { FaTrash, FaUserCheck, FaUserTimes } from "react-icons/fa";

export enum Status {
  PENDING = "PENDING",
  ACCEPTED = "ACCEPTED",
}

export interface IConnection {
  id: number;
  author: User;
  recipient: User;
  status: Status;
  connectionDate: string;
  seen: boolean;
}

interface IConnectionProps {
  connection: IConnection;
  user: User | null;
  setConnections: Dispatch<SetStateAction<IConnection[]>>;
}

export function Connection({
  connection,
  user,
  setConnections,
}: IConnectionProps) {
  const navigate = useNavigate();
  const userToDisplay =
    connection.author.id === user?.id ? connection.recipient : connection.author;

  // --- Log connection details on render ---
  console.log("Rendering Connection component for connection ID:", connection.id);
  console.log("  Connection status:", connection.status);
  console.log("  Auth User ID:", user?.id);
  console.log("  Author ID:", connection.author.id);
  console.log("  Recipient ID:", connection.recipient.id);
  console.log(
    "  User to display:",
    userToDisplay.firstName,
    userToDisplay.lastName
  );

  useEffect(() => {
    if (connection.recipient.id === user?.id) {
      console.log(
        "useEffect [connection.recipient.id, user?.id]: Marking connection as seen. Connection ID:",
        connection.id
      );
      request<void>({
        endpoint: `/api/v1/networking/connections/${connection.id}/seen`,
        method: "PUT",
        onSuccess: () => {
          console.log(
            "Successfully marked connection as seen. Connection ID:",
            connection.id
          );
        },
        onFailure: (error) =>
          console.error(
            "Error marking connection as seen. Connection ID:",
            connection.id,
            ". Error:",
            error
          ),
      });
    } else {
      console.log(
        "useEffect [connection.recipient.id, user?.id]: Not marking as seen. Conditions not met. Connection ID:",
        connection.id,
        "Recipient ID:",
        connection.recipient.id,
        "User ID:",
        user?.id
      );
    }
  }, [connection.id, connection.recipient.id, user?.id]);

  const cancelButtonText =
    user?.id === connection.author.id ? "Cancel Request" : "Ignore";
  const isRecipient = user?.id === connection.recipient.id;

  console.log(
    "Determined button text for pending state:",
    cancelButtonText,
    "(User is author:",
    user?.id === connection.author.id,
    ")"
  );

  return (
    <Flex
      key={connection.id}
      direction={{ base: "column", md: "row" }}
      align={{ base: "center", md: "stretch" }}
      justify="space-between"
      p={5}
      borderWidth="1px"
      borderRadius="xl"
      boxShadow="sm"
      borderColor={useColorModeValue("gray.200", "gray.700")}
      bg={useColorModeValue("white", "gray.800")}
      _hover={{
        shadow: "md",
        transform: "translateY(-2px)",
        transition: "all 0.2s ease",
      }}
      transition="all 0.2s"
    >
      {/* User Info Section */}
      <Flex
        align="center"
        gap={5}
        mb={{ base: 4, md: 0 }}
        cursor="pointer"
        onClick={() => {
          console.log("User profile clicked. Navigating to profile ID:", userToDisplay.id);
          navigate(`/profile/${userToDisplay.id}`);
        }}
        w="100%"
      >
        <Avatar
          size={{ base: "lg", md: "xl" }}
          name={`${userToDisplay.firstName} ${userToDisplay.lastName}`}
          src={
            userToDisplay?.profilePicture
              ? userToDisplay.profilePicture.startsWith("http")
                ? userToDisplay.profilePicture
                : `${import.meta.env.VITE_API_URL}/api/v1/storage/${userToDisplay.profilePicture}`
              : "/avatar.svg"
          }
          boxShadow="md"
        />

        <Box textAlign={{ base: "center", md: "left" }} flex="1">
          <Heading
            fontSize={{ base: "lg", md: "xl" }}
            fontWeight="bold"
            color={useColorModeValue("gray.800", "white")}
            mb={1}
          >
            {userToDisplay.firstName} {userToDisplay.lastName}
          </Heading>

          <HStack spacing={4} justify={{ base: "center", md: "flex-start" }} wrap="wrap" gap={3}>
            <Text fontSize="sm" color="gray.600" display="flex" alignItems="center" gap={1}>
              <strong>🌍</strong> {userToDisplay.nativeLanguage}
            </Text>
            <Text fontSize="sm" color="gray.600" display="flex" alignItems="center" gap={1}>
              <strong>🏆</strong> {userToDisplay.points} pts
            </Text>
          </HStack>
        </Box>
      </Flex>

      {/* Action Buttons Section */}
      <Flex
        align="center"
        justify="center"
        ml={{ md: 6 }}
        pt={{ base: 4, md: 0 }}
        borderTop={{ base: `1px solid ${useColorModeValue("gray.200", "gray.700")}`, md: "none" }}
      >
        {connection.status === Status.ACCEPTED ? (
          <Tooltip label="Remove connection">
            <Button
              size="md"
              colorScheme="red"
              leftIcon={<FaTrash />}
              onClick={() => {
                console.log("Delete (Remove Connection) button clicked. Connection ID:", connection.id);
                request<IConnection>({
                  endpoint: `/api/v1/networking/connections/${connection.id}`,
                  method: "DELETE",
                  onSuccess: () => {
                    console.log("Connection successfully deleted/removed. Connection ID:", connection.id);
                    setConnections((connections) =>
                      connections.filter((c) => c.id !== connection.id)
                    );
                  },
                  onFailure: (error) => {
                    console.error("Failed to delete/remove connection. Connection ID:", connection.id, ". Error:", error);
                  },
                });
              }}
              px={6}
            >
              Remove
            </Button>
          </Tooltip>
        ) : connection.status === Status.PENDING ? (
          <VStack spacing={3} align="stretch">
            <Button
              size="md"
              variant="outline"
              colorScheme="gray"
              leftIcon={user?.id === connection.author.id ? <FaUserTimes /> : <FaUserTimes />}
              onClick={() => {
                console.log(`${cancelButtonText} button clicked. Connection ID:`, connection.id);
                request<IConnection>({
                  endpoint: `/api/v1/networking/connections/${connection.id}`,
                  method: "DELETE",
                  onSuccess: () => {
                    console.log(`Connection request ${cancelButtonText.toLowerCase()}d successfully. Connection ID:`, connection.id);
                    setConnections((connections) =>
                      connections.filter((c) => c.id !== connection.id)
                    );
                  },
                  onFailure: (error) => {
                    console.error(`Failed to ${cancelButtonText.toLowerCase()} connection request. Connection ID:`, connection.id, ". Error:", error);
                  },
                });
              }}
            >
              {cancelButtonText}
            </Button>

            {isRecipient && (
              <Button
                size="md"
                colorScheme="blue"
                leftIcon={<FaUserCheck />}
                onClick={() => {
                  console.log("Accept button clicked. Connection ID:", connection.id);
                  request<IConnection>({
                    endpoint: `/api/v1/networking/connections/${connection.id}`,
                    method: "PUT",
                    onSuccess: (updatedConnection) => {
                      console.log("Connection request accepted successfully. Connection ID:", connection.id, "New status:", updatedConnection.status);
                      setConnections((connections) =>
                        connections.map((conn) =>
                          conn.id === connection.id ? updatedConnection : conn
                        )
                      );
                    },
                    onFailure: (error) => {
                      console.error("Failed to accept connection request. Connection ID:", connection.id, ". Error:", error);
                    },
                  });
                }}
                px={6}
              >
                Accept
              </Button>
            )}
          </VStack>
        ) : null}
      </Flex>
    </Flex>
  );
}