import { useEffect, useState } from "react";
import {
  Box,
  Heading,
  VStack,
  Text,
  useColorModeValue,
} from "@chakra-ui/react";
import { useAuthentication } from "../../authentication/context/AuthenticationContextProvider";
import { useWebSocket } from "../../../ws/WebSocketContextProvider";
import { request } from "../../../utils/api";
import { Connection, type IConnection } from "../components/connection/Connection";
import { FaConnectdevelop } from "react-icons/fa";

export function Connections() {
  const [connexions, setConnections] = useState<IConnection[]>([]);
  const { user } = useAuthentication();
  const ws = useWebSocket();

  // Fetch initial list
  useEffect(() => {
    request<IConnection[]>({
      endpoint: "/api/v1/networking/connections",
      onSuccess: (data) => setConnections(data),
      onFailure: (error) => console.log(error),
    });
  }, []);
  

  // Handle accepted connection update via WebSocket
  useEffect(() => {
    const subscription = ws?.subscribe(
      `/topic/users/${user?.id}/connections/accepted`,
      (data) => {
        const connection = JSON.parse(data.body);
        setConnections((connections) =>
          connections.filter((c) => c.id !== connection.id)
        );
      }
    );

    return () => subscription?.unsubscribe();
  }, [user?.id, ws]);

  // Handle removed connection update via WebSocket
  console.log(" from conected  :",+ connexions );
  useEffect(() => {
    const subscription = ws?.subscribe(
      `/topic/users/${user?.id}/connections/remove`,
      (data) => {
        const connection = JSON.parse(data.body);
        setConnections((connections) =>
          connections.filter((c) => c.id !== connection.id)
        );
      }
    );

    return () => subscription?.unsubscribe();
  }, [user?.id, ws]);
console.log(" from conected  :",+ connexions );
  return (
    <Box
     p={4}
  border="1px solid"
  borderColor={useColorModeValue("gray.200", "gray.700")}
  borderRadius="md"
  bg={useColorModeValue("white", "gray.800")}
    >
      <Heading size="lg" mb={4}>
        Connections ({connexions.length})
      </Heading>

      <VStack spacing={4} align="stretch">
        {connexions.map((connection) => (
          <Connection
            key={connection.id}
            connection={connection}
            user={user}
            setConnections={setConnections}
          />
        ))}
        

        {connexions.length === 0 && (
          <Text textAlign="center" color="gray.500" py={8}>
            <FaConnectdevelop/> No connections yet 
          </Text>
        )}
      </VStack>
    </Box>
  );
}
