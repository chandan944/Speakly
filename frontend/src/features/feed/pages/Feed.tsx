import {
  Box,
  Button,
  Flex,
  Grid,
  GridItem,
  Text,
  VStack,
  Spinner,
  Center,
  useToast,
} from "@chakra-ui/react";
import { useEffect, useState, useCallback, useMemo, useRef } from "react";
import { usePageTitle } from "../../../hook/usePageTitle";
import { useAuthentication } from "../../authentication/context/AuthenticationContextProvider";
import { useWebSocket } from "../../../ws/WebSocketContextProvider";
import { Post, type IPost } from "../components/Post";
import { request } from "../../../utils/api";
import { Madal } from "../components/medal";

import LeftSidebar from "../components/leftBar/LeftBar";
import RightSidebar from "../components/rightBar/RightBar";

import { AddIcon } from "@chakra-ui/icons";

// Virtual scrolling component for better performance with large lists
const VirtualizedPostList = ({ posts, setPosts }: { posts: IPost[], setPosts: React.Dispatch<React.SetStateAction<IPost[]>> }) => {
  const [visibleRange, setVisibleRange] = useState({ start: 0, end: 10 });
  const containerRef = useRef<HTMLDivElement>(null);
  const ITEM_HEIGHT = 300; // Approximate height of a post
  const BUFFER = 5; // Extra items to render outside viewport

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const scrollTop = container.scrollTop;
      const containerHeight = container.clientHeight;
      
      const start = Math.max(0, Math.floor(scrollTop / ITEM_HEIGHT) - BUFFER);
      const end = Math.min(posts.length, Math.ceil((scrollTop + containerHeight) / ITEM_HEIGHT) + BUFFER);
      
      setVisibleRange({ start, end });
    };

    container.addEventListener('scroll', handleScroll);
    handleScroll(); // Initial calculation
    
    return () => container.removeEventListener('scroll', handleScroll);
  }, [posts.length]);

  const visiblePosts = useMemo(() => {
    return posts.slice(visibleRange.start, visibleRange.end);
  }, [posts, visibleRange]);

  return (
    <VStack
      ref={containerRef}
      spacing={4}
      align="stretch"
      maxH="70vh"
      overflowY="auto"
      sx={{
        '&::-webkit-scrollbar': { display: 'none' },
        msOverflowStyle: 'none',
        scrollbarWidth: 'none',
      }}
    >
      {/* Spacer for items above viewport */}
      {visibleRange.start > 0 && (
        <Box height={`${visibleRange.start * ITEM_HEIGHT}px`} />
      )}
      
      {/* Render visible posts */}
      {visiblePosts.map((post) => (
        <Post key={post.id} post={post} setPosts={setPosts} />
      ))}
      
      {/* Spacer for items below viewport */}
      {visibleRange.end < posts.length && (
        <Box height={`${(posts.length - visibleRange.end) * ITEM_HEIGHT}px`} />
      )}
    </VStack>
  );
};

export function Feed() {
  usePageTitle("Feed");

  const [showPostingModal, setShowPostingModal] = useState(false);
  const { user } = useAuthentication();
  const [posts, setPosts] = useState<IPost[]>([]);
  const [error, setError] = useState("");
  const [feedType, setFeedType] = useState<"my" | "global">("my");
  const [loading, setLoading] = useState(false);
  const [lastFetchTime, setLastFetchTime] = useState<number>(0);
  
  // Cache for different feed types
  const [postsCache, setPostsCache] = useState<{
    my: { posts: IPost[], timestamp: number } | null;
    global: { posts: IPost[], timestamp: number } | null;
  }>({
    my: null,
    global: null
  });

  const toast = useToast();
  const ws = useWebSocket();
  const debounceTimeoutRef = useRef<NodeJS.Timeout>();

  // Constants
  const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
  const DEBOUNCE_DELAY = 300; // 300ms
  const MAX_POSTS_IN_MEMORY = 200; // Limit posts to prevent memory issues

  const isValidPost = useCallback((post: IPost): boolean => {
    return post && post.id !== null && post.id !== undefined;
  }, []);

  // Memoized filtered posts
  const validPosts = useMemo(() => {
    return posts.filter(isValidPost).slice(0, MAX_POSTS_IN_MEMORY);
  }, [posts, isValidPost]);

  // Check if cache is valid
  const isCacheValid = useCallback((cacheEntry: { posts: IPost[], timestamp: number } | null): boolean => {
    if (!cacheEntry) return false;
    return Date.now() - cacheEntry.timestamp < CACHE_DURATION;
  }, []);

  // Debounced fetch function
  const debouncedFetch = useCallback((fetchFunction: () => Promise<void>) => {
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }
    
    debounceTimeoutRef.current = setTimeout(() => {
      fetchFunction();
    }, DEBOUNCE_DELAY);
  }, []);

  const fetchMyPosts = useCallback(async (useCache: boolean = true) => {
    // Check cache first
    if (useCache && isCacheValid(postsCache.my)) {
      setFeedType("my");
      setPosts(postsCache.my!.posts);
      return;
    }

    setLoading(true);
    setFeedType("my");
    
    try {
      await request<IPost[]>({
        endpoint: "/api/v1/feed/posts",
        onSuccess: (data) => {
          const validPosts = data.filter(isValidPost);
          setPosts(validPosts);
          
          // Update cache
          setPostsCache(prev => ({
            ...prev,
            my: { posts: validPosts, timestamp: Date.now() }
          }));
          
          setLastFetchTime(Date.now());
        },
        onFailure: (error) => {
          setError(error);
          toast({
            title: "Error loading posts",
            description: error,
            status: "error",
            duration: 3000,
            isClosable: true,
          });
        },
      });
    } catch (err) {
      console.error("Failed to fetch my posts:", err);
    } finally {
      setLoading(false);
    }
  }, [isValidPost, isCacheValid, postsCache.my, toast]);

  const fetchGlobalFeed = useCallback(async (useCache: boolean = true) => {
    // Check cache first
    if (useCache && isCacheValid(postsCache.global)) {
      setFeedType("global");
      setPosts(postsCache.global!.posts);
      return;
    }

    setLoading(true);
    setFeedType("global");
    
    try {
      await request<IPost[]>({
        endpoint: "/api/v1/feed",
        onSuccess: (data) => {
          const validPosts = data.filter(isValidPost);
          setPosts(validPosts);
          
          // Update cache
          setPostsCache(prev => ({
            ...prev,
            global: { posts: validPosts, timestamp: Date.now() }
          }));
          
          setLastFetchTime(Date.now());
        },
        onFailure: (error) => {
          setError(error);
          toast({
            title: "Error loading feed",
            description: error,
            status: "error",
            duration: 3000,
            isClosable: true,
          });
        },
      });
    } catch (err) {
      console.error("Failed to fetch global feed:", err);
    } finally {
      setLoading(false);
    }
  }, [isValidPost, isCacheValid, postsCache.global, toast]);

  // Debounced versions
  const debouncedFetchMyPosts = useCallback(() => {
    debouncedFetch(() => fetchMyPosts(false));
  }, [debouncedFetch, fetchMyPosts]);

  const debouncedFetchGlobalFeed = useCallback(() => {
    debouncedFetch(() => fetchGlobalFeed(false));
  }, [debouncedFetch, fetchGlobalFeed]);

  // Auto-refresh function
  const refreshCurrentFeed = useCallback(() => {
    if (feedType === "my") {
      fetchMyPosts(false);
    } else {
      fetchGlobalFeed(false);
    }
  }, [feedType, fetchMyPosts, fetchGlobalFeed]);

  // Initial load
  useEffect(() => {
    fetchMyPosts(); // Load "My Posts" by default
  }, [fetchMyPosts]);

  // Auto-refresh every 2 minutes if user is active
  useEffect(() => {
    const interval = setInterval(() => {
      // Only refresh if the last fetch was more than 2 minutes ago
      if (Date.now() - lastFetchTime > 2 * 60 * 1000) {
        refreshCurrentFeed();
      }
    }, 2 * 60 * 1000);

    return () => clearInterval(interval);
  }, [refreshCurrentFeed, lastFetchTime]);

  // Optimized WebSocket subscription
  useEffect(() => {
    if (!user?.id || !ws) return;

    const subscription = ws.subscribe(`/topic/feed/${user.id}/post`, (data) => {
      try {
        const post: IPost = JSON.parse(data.body);
        if (!isValidPost(post)) {
          console.warn("⚠️ Ignoring invalid WebSocket post:", post);
          return;
        }
        
        // Only add to current feed if it's relevant
        setPosts((prev) => {
          const newPosts = [post, ...prev];
          return newPosts.slice(0, MAX_POSTS_IN_MEMORY); // Limit memory usage
        });

        // Show toast notification for new posts
        toast({
          title: "New post available",
          description: `${post.author?.name || 'Someone'} just posted`,
          status: "info",
          duration: 2000,
          isClosable: true,
        });

      } catch (err) {
        console.error("Error processing WebSocket message:", err);
      }
    });

    return () => subscription?.unsubscribe();
  }, [user?.id, ws, isValidPost, toast]);

  const handlePost = useCallback(async (formData: FormData) => {
    try {
      await request<IPost>({
        endpoint: "/api/v1/feed/posts",
        method: "POST",
        body: formData,
        contentType: "multipart/form-data",
        onSuccess: (data) => {
          if (!isValidPost(data)) return;
          
          setPosts(prev => [data, ...prev]);
          
          // Invalidate cache
          setPostsCache(prev => ({
            ...prev,
            my: null,
            global: null
          }));

          toast({
            title: "Post created successfully",
            status: "success",
            duration: 2000,
            isClosable: true,
          });
        },
        onFailure: (error) => {
          setError(error);
          toast({
            title: "Failed to create post",
            description: error,
            status: "error",
            duration: 3000,
            isClosable: true,
          });
        },
      });
    } catch (err) {
      console.error("Error creating post:", err);
    }
  }, [isValidPost, toast]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, []);

  return (
    <Grid
      templateColumns={{ base: "1fr", md: "1fr 2fr 1fr" }}
      // gap={1}
      
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
      <GridItem mx={{ base: 0, md: 4 }}>
        {/* Toggle Feed Buttons */}
        <Flex justify="space-between" gap={4} mb={1} >
          <Button 
            flex={1} 
            maxW={"3rem"} 
            onClick={() => setShowPostingModal(true)}
            isDisabled={loading}
          >
            <AddIcon />
          </Button>

          <Box>
            <Button
              colorScheme={feedType === "my" ? "blue" : "gray"}
              onClick={debouncedFetchMyPosts}
              
             
            >
              All Posts
              {postsCache.my && (
                <Box as="span" ml={1} fontSize="xs" opacity={0.7}>
                 
                </Box>
              )}
            </Button>
            <Button
              colorScheme={feedType === "global" ? "green" : "gray"}
              onClick={debouncedFetchGlobalFeed}
              marginX={2}
              isLoading={loading && feedType === "global"}
              
            >
              Feed
              
            </Button>
          </Box>
        </Flex>

        {/* Refresh Button */}
    

        {/* Posting Modal */}
        <Madal
          title="Creating a post"
          onSubmit={handlePost}
          showModal={showPostingModal}
          setShowModal={setShowPostingModal}
        />

        {/* Error Message */}
        {error && (
          <Box color="red.500" fontWeight="medium" mb={2} p={2} borderRadius="md" bg="red.50">
            {error}
          </Box>
        )}

        {/* Loading State */}
        {loading && validPosts.length === 0 && (
          <Center py={8}>
            <VStack>
              <Spinner size="lg" color="blue.500" />
              <Text color="gray.500">Loading posts...</Text>
            </VStack>
          </Center>
        )}

        {/* Feed Posts with Virtual Scrolling */}
        {validPosts.length > 0 && (
          <VirtualizedPostList posts={validPosts} setPosts={setPosts} />
        )}

        {/* Empty Feed */}
        {!loading && validPosts.length === 0 && (
          <Center py={8}>
            <VStack>
              <Text color="gray.500" fontSize="lg" fontWeight="medium">
                No posts yet
              </Text>
              <Text color="gray.400" fontSize="sm" textAlign="center">
                {feedType === "my" 
                  ? "You haven't posted anything yet. Create your first post!" 
                  : "Start connecting with people to see their posts!"}
              </Text>
            </VStack>
          </Center>
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