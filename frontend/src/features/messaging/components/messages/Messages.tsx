import {  Flex } from "@chakra-ui/react";
import type { User } from "../../../authentication/context/AuthenticationContextProvider";
import { Message } from "./Message";


export interface IMessage {
  id: number;
  sender: User;
  receiver: User;
  content: string;
  isRead: boolean;
  createdAt: string;
}

interface IMessagesProps {
  messages: IMessage[];
  user: User | null;
}

export function Messages({ messages, user }: IMessagesProps) {
  return (
    <Flex wrap="wrap"
    sx={{
    // Hide scrollbar but keep functionality
    '&::-webkit-scrollbar': {
      display: 'none', // Safari and Chrome
    },
    '-ms-overflow-style': 'none',  // IE and Edge
    'scrollbar-width': 'none',  // Firefox
  }}  
      gap={3}                // uniform spacing between bubbles
      alignItems="flex-start" // or "flex-end" to bottom‑align
      justify="flex-start" 
      direction={"column"}>
      {messages.map((message) => (
        <Message key={message.id} message={message} user={user} />
      ))}
    </Flex>
  );
}