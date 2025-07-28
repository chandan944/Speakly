import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Box, Flex, Spinner, Text, VStack } from "@chakra-ui/react";

import { usePageTitle } from "../../../hook/usePageTitle";
import { request } from "../../../utils/api";
import { useAuthentication, type User } from "../../authentication/context/AuthenticationContextProvider";

import { About } from "../components/About";
import { Activity } from "../components/Activity";
import RightSidebar from "../../feed/components/rightBar/RightBar";
import type { IConnection } from "../../network/components/connection/Connection";


export function Profile() {
  const { id } = useParams();
  const { user: authUser, setUser: setAuthUser } = useAuthentication();
  const [connexions, setConnections] = useState<IConnection[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  usePageTitle(user ? `${user.firstName} ${user.lastName}` : "Profile");


    useEffect(() => {
    request<IConnection[]>({
      endpoint: "/api/v1/networking/connections",
      onSuccess: (data) => setConnections(data),
      onFailure: (error) => console.log(error),
    });
  }, []);
  
  useEffect(() => {
    setLoading(true);
    if (id === authUser?.id) {
      setUser(authUser);
      setLoading(false);
    } else {
      request<User>({
        endpoint: `/api/v1/authentication/users/${id}`,
        onSuccess: (data) => {
          setUser(data);
          setLoading(false);
        },
        onFailure: (error) => {
          console.error("Failed to load user data ❌", error);
          setLoading(false);
        },
      });
    }
  }, [id, authUser]);

  if (loading || !user) {
    return (
      <Flex justify="center" align="center" h="100vh">
        <Spinner size="xl" color="teal.500" />
        <Text ml={4} fontSize="xl">Loading profile...</Text>
      </Flex>
    );
  }

  return (
    <Flex
      direction={{ base: "column", md: "row" }}
      p={4}
      gap={6}
      maxW="1200px"
      mx="auto"
    >
      {/* Main Content */}
      <Box flex="1">
        <VStack spacing={6} align="stretch">
          <About user={user} authUser={authUser} onUpdate={setAuthUser}   />
          <Activity user={user} authUser={authUser} id={id} />

         </VStack>
      </Box>

      {/* Sidebar */}
      <Box w={{ base: "100%", md: "300px" }}>
        <RightSidebar />
      </Box>
    </Flex>
  );
}
