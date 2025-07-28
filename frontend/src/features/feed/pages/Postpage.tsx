import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";


import { Post, type IPost } from "../components/Post";
import { request } from "../../../utils/api";

import { useAuthentication } from "../../authentication/context/AuthenticationContextProvider";
import { Box, Grid, GridItem } from "@chakra-ui/react";
import LeftSidebar from "../components/leftBar/LeftBar";
import RightSidebar from "../components/rightBar/RightBar";

export function PostPage() {
  const [posts, setPosts] = useState<IPost[]>([]);
  const { id } = useParams();
 const {user} = useAuthentication();
  useEffect(() => {
    request<IPost>({
      endpoint: `/api/v1/feed/posts/${id}`,
      onSuccess: (post) => setPosts([post]),
      onFailure: (error) => console.log(error),
    });
  }, [id]);

 return (
  <Grid
    templateColumns={{ base: "1fr", md: "1fr 2fr 1fr" }}
    gap={4}
    p={4}
    w="full"
  >
    {/* Left Sidebar */}
    <GridItem>
      <Box display={{ base: "none", md: "block" }}>
        <LeftSidebar user={user} />
      </Box>
    </GridItem>

    {/* Center Post */}
    <GridItem>
      {posts.length > 0 && <Post setPosts={setPosts} post={posts[0]} />}
    </GridItem>

    {/* Right Sidebar */}
    <GridItem>
      <Box display={{ base: "none", md: "block" }}>
        <RightSidebar />
      </Box>
    </GridItem>
  </Grid>
);
}
