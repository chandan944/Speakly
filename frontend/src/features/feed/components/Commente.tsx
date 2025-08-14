import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Avatar,
  Box,
  Button,
  Flex,
  HStack,
  IconButton,
  Input,
  Text,
  VStack,
  useColorModeValue,
} from "@chakra-ui/react";
import { TimeAgo } from "../TimeAgo";
import { useAuthentication } from "../../authentication/context/AuthenticationContextProvider";
import type { User } from "../../authentication/context/AuthenticationContextProvider";
import { FaTrash } from "react-icons/fa";
import { EditIcon } from "@chakra-ui/icons";

export interface Comment {
  id: number;
  content: string;
  author: User;
  creationDate: string;
  updatedDate?: string;
}

interface CommentProps {
  comment: Comment;
  deleteComment: (commentId: number) => Promise<void>;
  editComment: (commentId: number, content: string) => Promise<void>;
}

export function Comment({ comment, deleteComment, editComment }: CommentProps) {
  const navigate = useNavigate();
  const [showActions, setShowActions] = useState(false);
  const [editing, setEditing] = useState(false);
  const [commentContent, setCommentContent] = useState(comment.content);
  const [commentState, setCommentState] = useState(comment);
  const { user } = useAuthentication();

  const bg = useColorModeValue("white", "gray.800");
  const border = useColorModeValue("gray.200", "gray.700");
  const textColor = useColorModeValue("gray.800", "gray.100");
  const shadow = useColorModeValue("sm", "base");

  return (
    <Box
      key={commentState.id}
      border="1px solid"
      borderColor={border}
      borderRadius="lg"
      p={3}
      bg={bg}
      w="full"
      boxShadow={shadow}
      fontSize="sm"
    >
      {!editing ? (
        <>
          <Flex justify="space-between" align="flex-start">
            <HStack
              spacing={2}
              align="center"
              onClick={() => navigate(`/profile/${commentState.author.id}`)}
              cursor="pointer"
            >
              <Avatar
                size="sm"
                src={
                  commentState.author.profilePicture
                    ? commentState.author.profilePicture.startsWith("http")
                      ? commentState.author.profilePicture
                      : `${import.meta.env.VITE_API_URL}/api/v1/storage/${commentState.author.profilePicture}`
                    : "/avatar.svg"
                }
                name={`${commentState.author.firstName} ${commentState.author.lastName}`}
              />
              <Box>
                <Text fontWeight="semibold" color={textColor} fontSize="sm">
                  {commentState?.author?.firstName} {commentState?.author.lastName}
                </Text>
                <TimeAgo date={commentState.creationDate} edited={!!commentState.updatedDate} />
              </Box>
            </HStack>

            {commentState.author.id === user?.id && (
              <Box position="relative">
                <IconButton
                  icon={<Text fontSize="lg">...</Text>}
                  aria-label="Options"
                  size="xs"
                  variant="ghost"
                  onClick={() => setShowActions(!showActions)}
                />
                {showActions && (
                  <Box position="absolute" right={0} top="24px" zIndex={10} fontSize="sm">
                    <Box
                      bg={bg}
                      border="1px solid"
                      borderColor={border}
                      borderRadius="md"
                      boxShadow="md"
                      p={2}
                    >
                      <VStack spacing={1} align="stretch">
                        <Button size="xs" variant="ghost" gap={1} onClick={() => { setEditing(true); setShowActions(false); }}>
                          <EditIcon boxSize={3} /> Edit
                        </Button>
                        <Button size="xs" colorScheme="red" gap={1} onClick={() => deleteComment(commentState.id)}>
                          <FaTrash fontSize="0.65rem" /> Delete
                        </Button>
                      </VStack>
                    </Box>
                  </Box>
                )}
              </Box>
            )}
          </Flex>

          <Text mt={2} color={textColor} whiteSpace="pre-wrap">
            {commentState.content}
          </Text>
        </>
      ) : (
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            try {
              await editComment(commentState.id, commentContent);
              setCommentState({ ...commentState, content: commentContent, updatedDate: new Date().toISOString() });
              setEditing(false);
            } catch (error) {
              console.error("Failed to edit comment:", error);
            }
          }}
        >
          <Input
            value={commentContent}
            onChange={(e) => setCommentContent(e.target.value)}
            placeholder="Edit your comment"
            size="sm"
            borderRadius="md"
            focusBorderColor="blue.400"
            bg={useColorModeValue("gray.50", "gray.700")}
            _placeholder={{ color: textColor }}
          />
          <HStack mt={2} spacing={2}>
            <Button type="submit" colorScheme="blue" size="xs">
              Save
            </Button>
            <Button
              variant="ghost"
              size="xs"
              onClick={() => {
                setEditing(false);
                setCommentContent(commentState.content);
              }}
            >
              Cancel
            </Button>
          </HStack>
        </form>
      )}
    </Box>
  );
}

export default Comment;
