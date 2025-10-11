import { useEffect, useRef } from "react";
import {
  Box,
  Text,
  Icon,
  HStack,
  Tooltip,
  useColorModeValue,
} from "@chakra-ui/react";
import { FaCheck, FaCheckDouble } from "react-icons/fa";
import type { IMessage } from "./Messages";
import type { User } from "../../../authentication/context/AuthenticationContextProvider";
import { request } from "../../../../utils/api";
import { TimeAgo } from "../../../feed/TimeAgo";

interface IMessageProps {
  message: IMessage;
  user: User | null;
}

export function Message({ message, user }: IMessageProps) {
  const messageRef = useRef<HTMLDivElement>(null);

  // Mark as read when receiver sees it
  useEffect(() => {
    if (!message.isRead && user?.id === message.receiver.id) {
      
      request<void>({
        endpoint: `/api/v1/messaging/conversations/messages/${message.id}`,
        method: "PUT",
        onSuccess: () => {},
        onFailure: (err) => console.error(err),
      });
    }
  }, [message, user]);

  // Auto‑scroll into view
  useEffect(() => {
    messageRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
    });
  }, []);

  const isSent = message.sender.id === user?.id;
  const isRead = isSent && message.isRead;

  // Theme‑aware colors
  const sentBg = useColorModeValue("gray.100", "black");
  const receivedBg = useColorModeValue("gray.900", "gray.100");

  const sentText = useColorModeValue("gray.800", "gray.100");
  const receivedText = useColorModeValue("gray.100", "gray.800");

  const statusTextColor = useColorModeValue("gray.600", "gray.300");
  const timestampColor = useColorModeValue("gray.500", "gray.400");
  const timestampHover = useColorModeValue("gray.700", "gray.100");
  const readColor = "green.400";
  console.log(message);
  return (
    <Box

    sx={{
    // Hide scrollbar but keep functionality
    '&::-webkit-scrollbar': {
      display: 'none', // Safari and Chrome
    },
    '-ms-overflow-style': 'none',  // IE and Edge
    'scrollbar-width': 'none',  // Firefox
  }}
      ref={messageRef}
      // display="inline-flex"              // ← make width auto
      // flexDirection="column"            // ← stack text + footer
      p={3}
      borderRadius="xl"
      maxW="85%"
      alignSelf={isSent ? "flex-end" : "flex-start"}
      bg={isSent ? sentBg : receivedBg}
      mb={1}
      position="relative"
      boxShadow={
        isSent
          ? "0 1px 3px rgba(0,0,0,0.1)"
          : "0 1px 2px rgba(0,0,0,0.05)"
      }
      _hover={{
        transform: "translateY(-1px)",
        boxShadow: isSent
          ? "0 4px 6px -1px rgba(0,0,0,0.1)"
          : "0 2px 4px -1px rgba(0,0,0,0.06)",
      }}
      transition="all 0.2s cubic-bezier(.21,1.02,.73,1)"
      marginX={2}
    >
      {/* Bubble arrow */}
      <Box
        position="absolute"
        // top="16px"
        // w="12px"
        // h="12px"
        bg={isSent ? sentBg : receivedBg}
        transform={
          isSent
            ? "rotate(45deg) translate(6px, -6px)"
            : "rotate(45deg) translate(-6px, -6px)"
        }
        left={isSent ? "auto" : "-6px"}
        right={isSent ? "-6px" : "auto"}
        zIndex={-1}
      />

      {/* Message text */}
      <Text
        // mt={1}
        whiteSpace="pre-wrap"
        color={isSent ? sentText : receivedText}
        fontSize="sm"
        lineHeight="0.8"
      >
        {message.content}
      </Text>

      {/* Footer: timestamp always + sent/read only if sent */}
      <HStack
        spacing={2}
        mt={2}
        justify={isSent ? "flex-end" : "flex-start"}
        w="100%"                    // stretch footer across bubble
      >
        {/* Timestamp */}
        <Tooltip
          label={new Date(message.createdAt).toLocaleString()}
          placement="top"
          hasArrow
        >
          <Text
            fontSize="2px"
            color={timestampColor}
            _hover={{ color: timestampHover }}
            cursor="help"
            
          >
            
            <TimeAgo date={message.createdAt} />
          </Text>
        </Tooltip>

        {/* Sent / Read indicator */}
        {isSent && (
          <HStack spacing={1}>
            <Icon
              as={isRead ? FaCheckDouble : FaCheck}
              color={isRead ? readColor : statusTextColor}
              boxSize={isRead ? "12px" : "10px"}
            />
            <Text
              fontSize="xs"
              color={isRead ? readColor : statusTextColor}
              display={{ base: "none", md: "block" }}
            >
              {isRead ? "Read" : "Sent"}
            </Text>
          </HStack>
        )}
      </HStack>
    </Box>
  );
}
