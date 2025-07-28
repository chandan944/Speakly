import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  Box,
  Text,
  Heading,
  VStack,
  HStack,
  Skeleton,
  useColorModeValue, // ✅ Import useColorModeValue
} from "@chakra-ui/react";
import { usePageTitle } from "../../../hook/usePageTitle";
import { request } from "../../../utils/api";
import {
  useAuthentication,
  type User,
} from "../../authentication/context/AuthenticationContextProvider";
import { Post, type IPost } from "../../feed/components/Post";
import LeftSidebar from "../../feed/components/leftBar/LeftBar";
import RightSidebar from "../../feed/components/rightBar/RightBar";

export function Posts() {
  const { id } = useParams();
  const [posts, setPosts] = useState<IPost[]>([]);
  const { user: authUser } = useAuthentication();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // ✅ Move hook call to the top level
  const postBgColor = useColorModeValue("gray.50", "gray.800");
  const bg = useColorModeValue("white", "gray.900"); // Keep the existing one too

  usePageTitle(
    "Posts | " + (user?.firstName || "") + " " + (user?.lastName || "")
  );

  useEffect(() => {
    if (id === authUser?.id) {
      setUser(authUser);
      setLoading(false);
    } else {
      request<User>({
        endpoint: `/api/v1/authentication/users/${id}`, // ✅ Fix template literal syntax
        onSuccess: (data) => {
          setUser(data);
          setLoading(false);
        },
        onFailure: (error) => console.log(error),
      });
    }
  }, [authUser, id]);

  useEffect(() => {
    request<IPost[]>({
      endpoint: `/api/v1/feed/posts/user/${id}`, // ✅ Fix template literal syntax
      onSuccess: (data) => setPosts(data),
      onFailure: (error) => console.log(error),
    });
  }, [id]);

  return (
    <HStack align="start" spacing={4} p={4} maxW="100%" w="full">
      {/* Left Sidebar */}
      <Box display={{ base: "none", md: "block" }} w="20%">
        <LeftSidebar user={user} />
      </Box>

      {/* Main Content */}
      <Box flex={1} p={4} bg={bg} borderRadius="xl" boxShadow="lg">
        <VStack spacing={4} align="stretch">
          <Heading fontSize="2xl" color="teal.500">
            {user?.firstName?.charAt(0).toUpperCase()}
            {user?.firstName?.slice(1)}{" "}
            {user?.lastName?.charAt(0).toUpperCase()}
            {user?.lastName?.slice(1)}'s Posts 📝
          </Heading>
          {posts.length > 0 ? (
            posts.map((post) => (
              <Box
                sx={{
                  // ✅ Fix kebab-case CSS properties to camelCase
                  "&::-webkit-scrollbar": {
                    display: "none", // Safari and Chrome
                  },
                  msOverflowStyle: "none", // IE and Edge - Changed from "-ms-overflow-style"
                  scrollbarWidth: "none", // Firefox - Changed from "scrollbar-width"
                }}
                key={post.id}
                p={2}
                borderRadius="md"
                // ✅ Use the pre-computed value from the hook
                bg={postBgColor}
                boxShadow="md"
                transition="all 0.3s"
                _hover={{ boxShadow: "xl", transform: "scale(1.01)" }} // ✅ Fix hover prop syntax
              >
                <Post post={post} setPosts={setPosts} />
              </Box>
            ))
          ) : loading ? (
            <VStack spacing={4}>
              {[...Array(3)].map((_, i) => ( // ✅ Fix unused variable name
                <Skeleton key={i} height="100px" borderRadius="lg" w="full" />
              ))}
            </VStack>
          ) : (
            <Box textAlign="center" mt={10}>
              <Text fontSize="xl" color="gray.500">
                😶 No posts to display
              </Text>
            </Box>
          )}
        </VStack>
      </Box>

      {/* Right Sidebar */}
      <Box display={{ base: "none", lg: "block" }} w="20%">
        <RightSidebar />
      </Box>
    </HStack>
  );
}
