import { useEffect, useState } from "react";
import {
  Avatar,
  Box,
  Button,
  ButtonGroup,
  Heading,
  Text,
  VStack,
  useColorModeValue,
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
  Badge,
  Flex,
  Icon,
  Divider,
  useBreakpointValue,
} from "@chakra-ui/react";
import { useAuthentication } from "../../authentication/context/AuthenticationContextProvider";
import { useWebSocket } from "../../../ws/WebSocketContextProvider";
import { Connection, type IConnection } from "../components/connection/Connection";
import { request } from "../../../utils/api";
import { FiInbox, FiSend } from "react-icons/fi";
import { useCount } from "../../../components/Notify/CountContext";

// ❗️ Global variable & setter/getter remain the same:
// let count: number = 0;
// export function setMyConnection(newCount: number) {
//   count = newCount;
//   console.log("set", count);
// }
// export function getMyConnection() {
//   console.log("get", count);
//   return count;
// }

export function Invitations() {
  const [connexions, setConnections] = useState<IConnection[]>([]);
  const [sent, setSent] = useState(false);
  const { user } = useAuthentication();
  const ws = useWebSocket();
  const isMobile = useBreakpointValue({ base: true, md: false });
  const {RecievedConnection , setRecievedConnection} = useCount();

  // Filter connections based on sent/received - CORRECTED LOGIC
  const filteredConnections = sent
    ? connexions.filter((c) => c.author.id === user?.id)
    : connexions.filter((c) => c.recipient.id === user?.id);

  // Fetch initial list
  useEffect(() => {
    if (!user?.id) return;
    request<IConnection[]>({
      endpoint: "/api/v1/networking/connections?status=PENDING",
      onSuccess: (data) => {
        setConnections(data);
      },
      onFailure: console.error,
    });
  }, [user?.id]);

  // Subscribe to WebSocket topics
  useEffect(() => {
    if (!user?.id || !ws) return;
    
    const subscriptions = [
      ws.subscribe(`/topic/users/${user.id}/connections/new`, (data) => {
        const connection = JSON.parse(data.body);
        setConnections((connections) => [connection, ...connections]);
      }),
      ws.subscribe(`/topic/users/${user.id}/connections/accepted`, (data) => {
        const connection = JSON.parse(data.body);
        setConnections((connections) => connections.filter((c) => c.id !== connection.id));
      }),
      ws.subscribe(`/topic/users/${user.id}/connections/remove`, (data) => {
        const connection = JSON.parse(data.body);
        setConnections((connections) => connections.filter((c) => c.id !== connection.id));
      }),
    ];

    return () => {
      subscriptions.forEach(sub => sub.unsubscribe());
    };
  }, [user?.id, ws]);

  // Update global count for received invitations only
  // useEffect(() => {
  //   if (!user?.id) return;
  //   const receivedCount = connexions.filter((c) => c.recipient.id === user.id).length;
  //   setMyConnection(receivedCount);
  // }, [connexions, user?.id]);

  const receivedCount = connexions.filter((c) => c.recipient.id === user?.id).length;
  setRecievedConnection(receivedCount);
  const sentCount = connexions.filter((c) => c.author.id === user?.id).length;
console.log(" from invation:",+ RecievedConnection );
  return (
    <Box
      mx="auto"
      px={4}
      py={6}
      minH="80vh"
      borderColor={useColorModeValue("gray.200", "gray.700")}
      bg={useColorModeValue("white", "gray.800")}
      borderRadius="lg"
      boxShadow="sm"
    >
      <Flex 
        direction={{ base: "column", md: "row" }} 
        justify="space-between" 
        align={{ base: "start", md: "center" }}
        mb={6}
      >
        <Heading size="lg" mb={{ base: 4, md: 0 }}>
          Invitations
        </Heading>
        
      </Flex>

      {isMobile ? (
        <Tabs 
          variant="soft-rounded" 
          colorScheme="teal"
          onChange={(index) => setSent(index === 1)}
          mb={6}
        >
          <TabList justifyContent="center">
            <Tab gap={2}>
              <Icon as={FiInbox} />
              Received
              <Badge ml={2} colorScheme="blue">{}</Badge>
            </Tab>
            <Tab gap={2}>
              <Icon as={FiSend} />
              Sent
              <Badge ml={2} colorScheme="green">{sentCount}</Badge>
            </Tab>
          </TabList>
          
          <TabPanels>
            <TabPanel px={0}>
              <VStack spacing={4} align="stretch">
                {filteredConnections.length > 0 ? (
                  filteredConnections.map((connection) => (
                    <Connection
                      key={connection.id}
                      connection={connection}
                      user={user}
                      setConnections={setConnections}
                    />
                  ))
                ) : (
                  <Box 
                    textAlign="center" 
                    py={10} 
                    bg={useColorModeValue("gray.50", "gray.700")} 
                    borderRadius="md"
                  >
                    <Icon as={FiInbox} boxSize={12} color="gray.400" mb={3} />
                    <Text color="gray.500" fontSize="lg">
                      No received invitations yet
                    </Text>
                    <Text color="gray.400" mt={2}>
                      Connection requests will appear here
                    </Text>
                  </Box>
                )}
              </VStack>
            </TabPanel>
            
            <TabPanel px={0}>
              <VStack spacing={4} align="stretch">
                {filteredConnections.length > 0 ? (
                  filteredConnections.map((connection) => (
                    <Connection
                      key={connection.id}
                      connection={connection}
                      user={user}
                      setConnections={setConnections}
                    />
                  ))
                ) : (
                  <Box 
                    textAlign="center" 
                    py={10} 
                    bg={useColorModeValue("gray.50", "gray.700")} 
                    borderRadius="md"
                  >
                    <Icon as={FiSend} boxSize={12} color="gray.400" mb={3} />
                    <Text color="gray.500" fontSize="lg">
                      No sent invitations yet
                    </Text>
                    <Text color="gray.400" mt={2}>
                      Invitations you send will appear here
                    </Text>
                  </Box>
                )}
              </VStack>
            </TabPanel>
          </TabPanels>
        </Tabs>
      ) : (
        <>
          <ButtonGroup mb={6} variant="outline" colorScheme="teal" size="md">
            <Button 
              variant={!sent ? "solid" : "outline"} 
              onClick={() => setSent(false)}
              leftIcon={<FiInbox />}
              px={6}
            >
              Received
              <Badge ml={2} colorScheme="blue">{RecievedConnection}</Badge>
            </Button>
            <Button 
              variant={sent ? "solid" : "outline"} 
              onClick={() => setSent(true)}
              leftIcon={<FiSend />}
              px={6}
            >
              Sent
              <Badge ml={2} colorScheme="green">{sentCount}</Badge>
            </Button>
          </ButtonGroup>

          <VStack spacing={4} align="stretch">
            {filteredConnections.length > 0 ? (
              filteredConnections.map((connection) => (
                <Connection
                  key={connection.id}
                  connection={connection}
                  user={user}
                  setConnections={setConnections}
                />
              ))
            ) : (
              <Box 
                textAlign="center" 
                py={12} 
                bg={useColorModeValue("gray.50", "gray.700")} 
                borderRadius="md"
                border="1px dashed"
                borderColor={useColorModeValue("gray.200", "gray.600")}
              >
                <Avatar 
                  bg={useColorModeValue("gray.200", "gray.600")} 
                  mb={4}
                  icon={<Icon as={sent ? FiSend : FiInbox} boxSize={6} />}
                  size="lg"
                />
                <Text color="gray.500" fontSize="lg" fontWeight="medium">
                  {sent ? "No sent invitations" : "No received invitations"}
                </Text>
                <Text color="gray.400" mt={2}>
                  {sent 
                    ? "Invitations you send will appear here" 
                    : "Connection requests will appear here"}
                </Text>
              </Box>
            )}
          </VStack>
        </>
      )}
    </Box>
  );
}