import { useEffect, useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import {
  Box,
  Heading,
   Text,
  VStack,
  Button,
  useColorModeValue,
} from "@chakra-ui/react";

import { request } from "../../../utils/api";
import { Post, type IPost } from "../../feed/components/Post";
import type { User } from "../../authentication/context/AuthenticationContextProvider";

interface IActivityProps {
  user: User | null;
  authUser: User | null;
  id: string | undefined;
}

export function Activity({ user, authUser, id }: IActivityProps) {
  const [posts, setPosts] = useState<IPost[]>([]);

  useEffect(() => {
    request<IPost[]>({
      endpoint: `/api/v1/feed/posts/user/${id}`,
      onSuccess: setPosts,
      onFailure: (error) => console.log(error),
    });
  }, [id]);

  return (
    <Box
      borderWidth="1px"
      borderRadius="lg"
      p={4}
      bg={useColorModeValue("white", "gray.800")}
      boxShadow="sm"
      w="full"
    >
      <Heading size="md" mb={4}>
        Latest Post
      </Heading>

      <VStack align="stretch" spacing={4}>
        {posts.length > 0 ? (
          <>
            <Post
              key={posts[posts.length - 1].id}
              post={posts[posts.length - 1]}
              setPosts={setPosts}
            />
            <Button
              as={RouterLink}
              to={`/profile/${user?.id}/posts`}
              size="sm"
              colorScheme="teal"
              alignSelf="flex-start"
            >
              See more
            </Button>
          </>
        ) : (
          <Text color="gray.500">
            {authUser?.id === user?.id
              ? "You have no posts yet."
              : "This user has no posts yet."}
          </Text>
        )}
      </VStack>
    </Box>
  );
}
