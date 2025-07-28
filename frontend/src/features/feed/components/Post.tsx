import {
  Avatar,
  Box,
  Button,
  Flex,
  IconButton,
  Input,
  Text,
  Tooltip,
  useColorModeValue,
  VStack,
} from "@chakra-ui/react";
import {
  useEffect,
  useState,
  type Dispatch,
  type FormEvent,
  type SetStateAction,
} from "react";
import {
  useAuthentication,
  type User,
} from "../../authentication/context/AuthenticationContextProvider";
import { useNavigate } from "react-router-dom";
import { useWebSocket } from "../../../ws/WebSocketContextProvider";
import { request } from "../../../utils/api";
import Comment from "./Commente";
import { Image } from "@chakra-ui/react";
import { Madal } from "./medal";
import { TimeAgo } from "../TimeAgo";
import { FcLike ,FcLikePlaceholder} from "react-icons/fc";
import { FaComments, FaRegCommentDots } from "react-icons/fa";
import { CloseIcon, EditIcon } from "@chakra-ui/icons";
import { Delete } from "lucide-react";
import { LuSend } from "react-icons/lu";
import { FiTrash } from "react-icons/fi";

export interface IPost {
  id: number;
  content: string;
  author: User;
  picture?: string;
  creationDate: string;
  updatedDate?: string;
}

interface PostProps {
  post: IPost;
  setPosts: Dispatch<SetStateAction<IPost[]>>;
}

export function Post({ post, setPosts }: PostProps) {
  // ✅ ALL HOOKS AT THE TOP - SAME ORDER EVERY TIME
  const [comments, setComments] = useState<Comment[]>([]);
  const [showComments, setShowComments] = useState(false);
  const [likes, setLikes] = useState<User[]>([]);
  const [content, setContent] = useState("");
  const [showMenu, setShowMenu] = useState(false);
  const [editing, setEditing] = useState(false);
  const [postLiked, setPostLiked] = useState<boolean | undefined>(undefined);
  
  // ✅ ALL useColorModeValue calls at the top
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const bgColor = useColorModeValue("white", "gray.900");
  const commentInputBg = useColorModeValue("gray.50", "gray.700");
  
  // ✅ ALL useContext/custom hooks
  const navigate = useNavigate();
  const { user } = useAuthentication();
  const webSocketClient = useWebSocket();

  // ✅ ALL useEffects in consistent order
  useEffect(() => {
    const fetchComments = async () => {
      await request<Comment[]>({
        endpoint: `/api/v1/feed/post/${post.id}/comments`,
        onSuccess: (data) => setComments(data),
        onFailure: (error) => {
          console.error(error);
        },
      });
    };
    fetchComments();
  }, [post.id]);

  useEffect(() => {
    const fetchLikes = async () => {
      await request<User[]>({
        endpoint: `/api/v1/feed/posts/${post.id}/like`,
        onSuccess: (data) => {
          setLikes(data);
          setPostLiked(data.some((like) => like.id === user?.id));
        },
        onFailure: (error) => {
          console.error(error);
        },
      });
    };
    fetchLikes();
  }, [post.id, user?.id]);

  // ✅ WebSocket subscriptions - consistent order
  useEffect(() => {
    const subscription = webSocketClient?.subscribe(
      `/topic/likes/${post.id}`,
      (message) => {
        const likes = JSON.parse(message.body);
        setLikes(likes);
        setPostLiked(likes.some((like: User) => like.id === user?.id));
      }
    );
    return () => subscription?.unsubscribe();
  }, [post.id, user?.id, webSocketClient]);

  useEffect(() => {
    const subscription = webSocketClient?.subscribe(
      `/topic/comments/${post.id}`,
      (message) => {
        const comment = JSON.parse(message.body);
        setComments((prev) => {
          const index = prev.findIndex((c) => c.id === comment.id);
          if (index === -1) {
            return [comment, ...prev];
          }
          return prev.map((c) => (c.id === comment.id ? comment : c));
        });
      }
    );

    return () => subscription?.unsubscribe();
  }, [post.id, webSocketClient]);

  useEffect(() => {
    const subscription = webSocketClient?.subscribe(
      `/topic/comments/${post.id}/delete`,
      (message) => {
        const comment = JSON.parse(message.body);
        setComments((prev) => {
          return prev.filter((c) => c.id !== comment.id);
        });
      }
    );

    return () => subscription?.unsubscribe();
  }, [post.id, webSocketClient]);

  useEffect(() => {
    const subscription = webSocketClient?.subscribe(
      `/topic/posts/${post.id}/delete`,
      () => {
        setPosts((prev) => prev.filter((p) => p.id !== post.id));
      }
    );
    return () => subscription?.unsubscribe();
  }, [post.id, setPosts, webSocketClient]);

  useEffect(() => {
    const subscription = webSocketClient?.subscribe(
      `/topic/posts/${post.id}/edit`,
      (data) => {
        const post = JSON.parse(data.body);
        setPosts((prev) => prev.map((p) => (p.id === post.id ? post : p)));
      }
    );
    return () => subscription?.unsubscribe();
  }, [post.id, setPosts, webSocketClient]);

  const like = async () => {
    await request<IPost>({
      endpoint: `/api/v1/feed/posts/${post.id}/like`,
      method: "PUT",
      onSuccess: () => {},
      onFailure: (error) => {
        console.error(error);
      },
    });
  };

  const postComment = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!content) {
      return;
    }
    await request<IPost>({
      endpoint: `/api/v1/feed/post/${post.id}/comments`,
      method: "POST",
      body: JSON.stringify({ content }),
      onSuccess: () => setContent(""),
      onFailure: (error) => {
        console.error(error);
      },
    });
  };

  const deleteComment = async (id: number) => {
    await request<void>({
      endpoint: `/api/v1/feed/comments/${id}`,
      method: "DELETE",
      onSuccess: () => {
        setComments((prev) => prev.filter((c) => c.id !== id));
      },
      onFailure: (error) => {
        console.error(error);
      },
    });
  };

  const editComment = async (id: number, content: string) => {
    await request<Comment>({
      endpoint: `/api/v1/feed/comments/${id}`,
      method: "PUT",
      body: JSON.stringify({ content }),
      onSuccess: (updatedComment) => {
        console.log("✅ Comment updated successfully:", updatedComment);

        setComments((prev) =>
          prev.map((c) => {
            if (c.id === id) {
              return {
                ...c,
                ...updatedComment,
                updatedDate:
                  updatedComment.updatedDate || new Date().toISOString(),
              };
            }
            return c;
          })
        );
      },
      onFailure: (error) => {
        console.error("❌ Failed to edit comment:", error);
        throw new Error(error);
      },
    });
  };

  const deletePost = async (id: number) => {
    await request<void>({
      endpoint: `/api/v1/feed/posts/${id}`,
      method: "DELETE",
      onSuccess: () => {
        setPosts((prev) => prev.filter((p) => p.id !== id));
      },
      onFailure: (error) => {
        console.error(error);
      },
    });
  };

  const editPost = async (data: FormData) => {
    await request<IPost>({
      endpoint: `/api/v1/feed/posts/${post.id}`,
      method: "PUT",
      body: data,
      contentType: "multipart/form-data",
      onSuccess: (data) => {
        setPosts((prev) =>
          prev.map((p) => {
            if (p.id === post.id) {
              return data;
            }
            return p;
          })
        );
        setShowMenu(false);
      },
      onFailure: (error) => {
        throw new Error(error);
      },
    });
  };

  return (
    <>
      {editing && (
        <Madal
          title="Editing your post"
          content={post.content}
          picture={post.picture}
          onSubmit={editPost}
          showModal={editing}
          setShowModal={setEditing}
        />
      )}

      <Box
        border="1px solid"
        borderColor={borderColor}
        bg={bgColor}
        p={6}
        rounded="2xl"
        shadow="lg"
        my={1}
        _hover={{ shadow: "xl", transition: "0.3s ease" }}
      >
        {/* Top Section */}
        <Flex justify="space-between" align="center">
          <Flex gap={2} align="center" >
            <Button
              onClick={() => navigate(`/profile/${post.author.id}`)}
              p={0}
              variant="ghost"
              _hover={{ bg: "transparent" }}
            >
              <Avatar
                boxSize="48px"
                src={
                  post.author.profilePicture?.startsWith("http")
                    ? post.author.profilePicture
                    : `${import.meta.env.VITE_API_URL}/api/v1/storage/${post.author.profilePicture}`
                }
                name={`${post.author.firstName} ${post.author.lastName}`}
              />
            </Button>

            <Box>
              <Text fontWeight="bold" fontSize="md">
                {post.author.firstName?.charAt(0).toUpperCase()}
                {post.author.firstName?.slice(1)}{" "}
                {post.author.lastName?.charAt(0).toUpperCase()}.
              </Text>
              <TimeAgo date={post.creationDate} edited={!!post.updatedDate} />
            </Box>
          </Flex>

          {/* Post options */}
          {post.author.id === user?.id && (
            <Box position="relative">
              <Button
                size="xs"
                variant="ghost"
                onClick={() => setShowMenu(!showMenu)}
                fontSize="xl"
                px={2}
              >
                ⋯
              </Button>
              {showMenu && (
                <VStack
                  align="end"
                  position="absolute"
                  right="0"
                  top="100%"
                  bg="white"
                  shadow="md"
                  p={2}
                  rounded="md"
                  spacing={2}
                  zIndex="10"
                  
                >
                  <Button colorScheme="green" size="sm" gap={2} onClick={() => setEditing(true)}>
                    <EditIcon/> Edit
                  </Button>
                  <Button
                   gap={2}
                    size="sm"
                    colorScheme="red"
                    onClick={() => deletePost(post.id)}
                  >
                    <FiTrash/> Delete
                  </Button>
                </VStack>
              )}
            </Box>
          )}
        </Flex>

        {/* Post Content */}
        <Text mt={4} fontSize="md" lineHeight="tall">
          {post.content}
        </Text>

        {/* Post Image */}
        {post.picture && (
          <Box mt={4} rounded="md" overflow="hidden">
            <Image
              src={`${import.meta.env.VITE_API_URL}/api/v1/storage/${post.picture}`}
              alt="Post image"
              objectFit="cover"
              width="100%"
              maxHeight="400px"
              fallbackSrc="/broken-image.png"
              borderRadius="lg"
            />
          </Box>
        )}

        {/* Stats */}
        <Flex justify="space-between" mt={4} fontSize="sm" color="gray.500">
          {likes.length > 0 && (
            <Text mr={4} fontSize={13}>
              {postLiked ? "You" : `${likes[0].firstName} ${likes[0].lastName}`}
              {likes.length - 1 > 0 && ` and ${likes.length - 1} others`} liked
              this
            </Text>
          )}
          {comments.length > 0 && (
            <Button
            gap={2}
              variant="link"
              colorScheme="green"
              size={"md"}
              onClick={() => setShowComments((prev) => !prev)}
            >
              {comments.length} <FaComments />
            </Button>
          )}
        </Flex>

        {/* Actions */}
        <Flex mt={4} gap={3}>
          <Button
            size="md"
            variant="solid"
            onClick={like}
            isDisabled={postLiked === undefined}
            border={"none"}
          >
           {postLiked ? <FcLike/> : <FcLikePlaceholder />} 
          </Button>

          <Button
            size="md"
            variant={showComments ? "solid" : "outline"}
            onClick={() => setShowComments((prev) => !prev)}
          >
            <FaRegCommentDots />
          </Button>
        </Flex>

        {/* Comment Section */}
      
{showComments && (
  <Box mt={5}>
    <Flex justifyContent="space-between" alignItems="center" mb={2}>
      <Text fontWeight="bold">Comments</Text>
      <IconButton
        icon={<CloseIcon />} // 🛑 Close icon
        aria-label="Close comments"
        size="sm"
        onClick={() => setShowComments(false)} // 🔁 Toggle comment visibility
        variant="ghost"
        colorScheme="red"
      />
    </Flex>

    <form onSubmit={postComment}>
      <Flex
        align="center"
        gap={2}
        // border="1px solid"
        // borderColor="gray.300"
        borderRadius={5}
        px={4}
        py={2}
        bg={commentInputBg}
        shadow="sm"
      >
        <Input
          name="content"
          placeholder="Add a comment..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          // variant="unstyled"
          flex={1}
        />
        <Tooltip label="Send" hasArrow>
          <IconButton
            type="submit"
            icon={<LuSend />}
            colorScheme="blue"
            aria-label="Send"
            isDisabled={!content.trim()}
          />
        </Tooltip>
      </Flex>
    </form>

    <VStack spacing={4} align="stretch" mt={4}>
      {comments.map((comment) => (
        <Comment
          key={comment.id}
          comment={comment}
          editComment={editComment}
          deleteComment={deleteComment}
        />
      ))}
    </VStack>
  </Box>
)}
      </Box>
    </>
  );
}