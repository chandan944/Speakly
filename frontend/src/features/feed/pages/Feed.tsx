import {
  Box,
  Button,
  Flex,
  Grid,
  GridItem,
  Text,
  VStack,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { usePageTitle } from "../../../hook/usePageTitle";
import { useAuthentication } from "../../authentication/context/AuthenticationContextProvider";
import { useWebSocket } from "../../../ws/WebSocketContextProvider";
import { Post, type IPost } from "../components/Post";
import { request } from "../../../utils/api";
import { Madal } from "../components/medal";

import LeftSidebar from "../components/leftBar/LeftBar";
import RightSidebar from "../components/rightBar/RightBar";

import { AddIcon } from "@chakra-ui/icons";

export function Feed() {
  usePageTitle("Feed");

  const [showPostingModal, setShowPostingModal] = useState(false);
  const { user } = useAuthentication();
  const [posts, setPosts] = useState<IPost[]>([]);
  const [error, setError] = useState("");
  const [feedType, setFeedType] = useState<"my" | "global">("my");

  const ws = useWebSocket();

  const isValidPost = (post: IPost): boolean => {
    return post && post.id !== null && post.id !== undefined;
  };

  const fetchMyPosts = async () => {
    setFeedType("my");
    await request<IPost[]>({
      endpoint: "/api/v1/feed/posts",
      onSuccess: (data) => {
        const validPosts = data.filter(isValidPost);
        setPosts(validPosts);
      },
      onFailure: (error) => setError(error),
    });
  };

  const fetchGlobalFeed = async () => {
    setFeedType("global");
    await request<IPost[]>({
      endpoint: "/api/v1/feed",
      onSuccess: (data) => {
        const validPosts = data.filter(isValidPost);
        setPosts(validPosts);
      },
      onFailure: (error) => setError(error),
    });
  };

  useEffect(() => {
    fetchMyPosts(); // Load "My Posts" by default
  }, []);

  useEffect(() => {
    const subscription = ws?.subscribe(`/topic/feed/${user?.id}/post`, (data) => {
      const post: IPost = JSON.parse(data.body);
      if (!isValidPost(post)) {
        console.warn("⚠️ Ignoring invalid WebSocket post:", post);
        return;
      }
      setPosts((prev) => [post, ...prev]);
    });
    return () => subscription?.unsubscribe();
  }, [user?.id, ws]);

  const handlePost = async (formData: FormData) => {
    await request<IPost>({
      endpoint: "/api/v1/feed/posts",
      method: "POST",
      body: formData,
      contentType: "multipart/form-data",
      onSuccess: (data) => {
        if (!isValidPost(data)) return;
        setPosts([data, ...posts]);
      },
      onFailure: (error) => setError(error),
    });
  };

  return (
    <Grid
      templateColumns={{ base: "1fr", md: "1fr 2fr 1fr" }}
      gap={4}
      p={4}
      w="100%"
    >
      {/* Left Sidebar */}
      <GridItem>
        <Box
          position={"sticky"}
          top="84px"
          zIndex="10"
          display={{ base: "none", md: "block" }}
        >
          <LeftSidebar user={user} />
        </Box>
      </GridItem>

      {/* Center Feed */}
      <GridItem>
        {/* Toggle Feed Buttons */}
        <Flex justify="space-between" gap={4} mb={4}>
          <Button flex={1} maxW={"3rem"} onClick={() => setShowPostingModal(true)}>
            <AddIcon />
          </Button>

          <Box>
            <Button
              colorScheme={feedType === "my" ? "blue" : "gray"}
              onClick={fetchMyPosts}
            >
              All Posts
            </Button>
            <Button
              colorScheme={feedType === "global" ? "green" : "gray"}
              onClick={fetchGlobalFeed}
              marginX={2}
            >
              Feed
            </Button>
          </Box>
        </Flex>

        {/* Posting Modal */}
        <Madal
          title="Creating a post"
          onSubmit={handlePost}
          showModal={showPostingModal}
          setShowModal={setShowPostingModal}
        />

        {/* Error Message */}
        {error && (
          <Box color="red.500" fontWeight="medium" mb={2}>
            {error}
          </Box>
        )}

        {/* Feed Posts */}
        <VStack
          spacing={4}
          align="stretch"
          sx={{
            '&::-webkit-scrollbar': { display: 'none' },
            msOverflowStyle: 'none',
            scrollbarWidth: 'none',
          }}
        >
          {posts
            .filter(isValidPost)
            .map((post) => (
              <Post key={post.id} post={post} setPosts={setPosts} />
            ))}
        </VStack>

        {/* Empty Feed */}
        {posts.length === 0 && (
          <Text mt={4} color="gray.500" fontSize="sm" textAlign="center">
            No posts yet. Start connecting with people!
          </Text>
        )}
      </GridItem>

      {/* Right Sidebar */}
      <GridItem>
        <Box
          position={"sticky"}
          top="84px"
          zIndex="10"
          display={{ base: "none", md: "block" }}
        >
          <RightSidebar />
        </Box>
      </GridItem>
    </Grid>
  );
}
