import { useEffect, type Dispatch, type SetStateAction } from "react";
import { request } from "../../../../utils/api";
import { useNavigate } from "react-router-dom";
import {
  Avatar,
  Box,
  Button,
  Flex,
  Heading,
  HStack,
  useColorModeValue,
  VStack,
} from "@chakra-ui/react";
import type { User } from "../../../authentication/context/AuthenticationContextProvider";
import { FaTrash } from "react-icons/fa";


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

export function Connection({ connection, user, setConnections }: IConnectionProps) {
  const navigate = useNavigate();
  const userToDisplay =
    connection.author.id === user?.id ? connection.recipient : connection.author;

  // --- Log connection details on render ---
  console.log("Rendering Connection component for connection ID:", connection.id);
  console.log("  Connection status:", connection.status);
  console.log("  Auth User ID:", user?.id);
  console.log("  Author ID:", connection.author.id);
  console.log("  Recipient ID:", connection.recipient.id);
  console.log("  User to display:", userToDisplay.firstName, userToDisplay.lastName);

  useEffect(() => {
    if (connection.recipient.id === user?.id) {
      console.log("useEffect [connection.recipient.id, user?.id]: Marking connection as seen. Connection ID:", connection.id);
      request<void>({
        endpoint: `/api/v1/networking/connections/${connection.id}/seen`,
        method: "PUT",
        onSuccess: () => {
          console.log("Successfully marked connection as seen. Connection ID:", connection.id);
        },
        onFailure: (error) => console.error("Error marking connection as seen. Connection ID:", connection.id, ". Error:", error),
      });
    } else {
       console.log("useEffect [connection.recipient.id, user?.id]: Not marking as seen. Conditions not met. Connection ID:", connection.id, "Recipient ID:", connection.recipient.id, "User ID:", user?.id);
    }
  }, [connection.id, connection.recipient.id, user?.id]); // Removed setConnections from dependency array as it's not used directly inside

  // Determine button labels based on user role
  const cancelButtonText = user?.id === connection.author.id ? "Cancel" : "Ignore";
  console.log("Determined button text for pending state:", cancelButtonText, "(User is author:", user?.id === connection.author.id, ")");
console.log("Rendering Connection component for connection ID:", connection.id);
  return (
    <Flex
      key={connection.id}
      align="center"
      gap={4}
      p={4}
      maxW={"15rem"}
      borderWidth="1px"
      borderRadius="lg"
      boxShadow="md"
      borderColor={useColorModeValue("gray.200", "gray.700")}
      bg={useColorModeValue("white", "gray.800")}
      justify="space-between"
    >
      <Flex
        align="center"
        gap={4}
        flex="1"
        onClick={() => {
           console.log("User profile clicked. Navigating to profile ID:", userToDisplay.id);
           navigate(`/profile/${userToDisplay.id}`);
        }}
        cursor="pointer"
      >
        <Avatar
          size="sm"
          src={
            userToDisplay?.profilePicture
              ? userToDisplay.profilePicture.startsWith("http")
                ? userToDisplay.profilePicture
                : `${import.meta.env.VITE_API_URL}/api/v1/storage/${
                    userToDisplay.profilePicture
                  }`
              : "/avatar.svg"
          }
        />
        <Box>
          <Heading fontSize="0.8rem">
            {userToDisplay.firstName} {userToDisplay.lastName}
          </Heading>
           <Box>
            
            
            <Heading fontSize="0.9rem" fontWeight={1}>`Native Language ${userToDisplay.nativeLanguage}`</Heading>
            <Heading fontSize="0.9rem" fontWeight={1}>{userToDisplay.bio}</Heading>
            <Heading fontSize="0.9rem" fontWeight={1}>`Points ${userToDisplay.points}`</Heading>
           </Box>
        </Box>
      
      </Flex>
      
      <Flex gap={2}>
        {/* --- Log the status check and rendering decision --- */}
        {(() => {
          console.log("Rendering action buttons based on connection status:", connection.status);
          if (connection.status === Status.ACCEPTED) {
            console.log("  -> Status is ACCEPTED. Rendering 'Delete' button.");
            return (
              <Button
                size="sm"
                colorScheme="red"
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
              >
                <FaTrash />
              </Button>
            );
          } else if (connection.status === Status.PENDING) {
            console.log("  -> Status is PENDING. Rendering 'Cancel/Ignore' and potentially 'Accept' buttons.");
            return (
              <VStack spacing={2}>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    console.log(`${cancelButtonText} button clicked. Connection ID:`, connection.id);
                    request<IConnection>({
                      endpoint: `/api/v1/networking/connections/${connection.id}`,
                      method: "DELETE", // Backend handles cancel vs ignore based on who calls DELETE
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

                {/* Render Accept button only if the current user is the recipient */}
                {user?.id === connection.recipient.id && (
                  <Button
                    size="sm"
                    colorScheme="blue"
                    onClick={() => {
                      console.log("Accept button clicked. Connection ID:", connection.id);
                      request<IConnection>({
                        endpoint: `/api/v1/networking/connections/${connection.id}`, // Use specific accept endpoint
                        method: "PUT",
                        onSuccess: (updatedConnection) => { // Use updatedConnection if needed
                          console.log("Connection request accepted successfully. Connection ID:", connection.id, "New status:", updatedConnection.status);
                          // Update local state with the accepted connection
                          setConnections((connections) =>
                            connections.map((conn) =>
                              conn.id === connection.id ? updatedConnection : conn
                            )
                          );
                          // Optionally, you could filter it out if your parent component handles ACCEPTED connections differently
                          // setConnections((connections) => connections.filter((c) => c.id !== connection.id));
                        },
                        onFailure: (error) => {
                          console.error("Failed to accept connection request. Connection ID:", connection.id, ". Error:", error);
                        },
                      });
                    }}
                  >
                    Accept
                  </Button>
                )}
              </VStack>
            );
          } else {
             console.warn("  -> Unknown connection status:", connection.status, ". Rendering nothing for actions.");
             return null; // Handle unexpected status gracefully
          }
        })()}
      </Flex>
    </Flex>
  );
}