// src/components/Notify/CountContext.tsx
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import { request } from "../../utils/api";
import type { IConnection } from "../../features/network/components/connection/Connection";
import { useAuthentication } from "../../features/authentication/context/AuthenticationContextProvider";
import type { IConversation } from "../../features/messaging/components/conversations/Conversations";

interface CountContextType {
  count: number; // Notification count
  RecievedConnection: number; // Connection requests count (keeping your typo for compatibility)
  messageCount: number; // Total unread messages count
  setCount: React.Dispatch<React.SetStateAction<number>>;
  setRecievedConnection: React.Dispatch<React.SetStateAction<number>>; // Keeping your typo
  setMessageCount: React.Dispatch<React.SetStateAction<number>>;
  incrementMessageCount: (amount: number) => void;
  decrementMessageCount: (amount: number) => void;
  resetMessageCount: () => void;
}

const CountContext = createContext<CountContextType | undefined>(undefined);

// Hook with error checking
// eslint-disable-next-line react-refresh/only-export-components
export const useCount = () => {
  const context = useContext(CountContext);
  if (context === undefined) {
    throw new Error('useCount must be used within a CountProvider');
  }
  return context;
};

export const CountProvider = ({ children }: { children: ReactNode }) => {
  const [count, setCount] = useState(0);
  const [RecievedConnection, setRecievedConnection] = useState(0); // Keeping your typo
  const [messageCount, setMessageCount] = useState(0);

  const auth = useAuthentication();
  const user = auth?.user;

  // 🔔 Fetch unread notifications
  useEffect(() => {
    const fetchUnread = () => {
      request<{ read: boolean }[]>({
        endpoint: "/api/v1/notifications",
        onSuccess: (all) => {
          const unread = all.filter((n) => !n.read).length;
          setCount(unread);
        },
        onFailure: (err) => console.error("Failed to load notifications:", err),
      });
    };

    fetchUnread();
    const interval = setInterval(fetchUnread, 90000);
    return () => clearInterval(interval);
  }, []);

  // 🤝 Fetch pending connection requests
  useEffect(() => {
    const fetchUnreadConnections = () => {
      if (!user?.id) return;
      
      request<IConnection[]>({
        endpoint: "/api/v1/networking/connections?status=PENDING",
        onSuccess: (all) => {
          const unreadConnection = all.filter(
            (c) => c.recipient.id === user.id
          ).length;
          setRecievedConnection(unreadConnection);
        },
        onFailure: (err) => console.error("Failed to load connections:", err),
      });
    };

    if (user?.id) {
      fetchUnreadConnections();
      const interval = setInterval(fetchUnreadConnections, 10000);
      return () => clearInterval(interval);
    }
  }, [user?.id]);

  // ✅ Calculate total unread messages from all conversations
  useEffect(() => {
    if (!user?.id) return;

    const fetchUnreadMessages = () => {
      request<IConversation[]>({
        endpoint: "/api/v1/messaging/conversations",
        onSuccess: (conversations) => {
          const totalUnread = conversations.reduce((total, conversation) => {
            const unreadCount = conversation.messages.filter(
              (message) => message.receiver.id === user.id && !message.isRead
            ).length;
            return total + unreadCount;
          }, 0);
          
          setMessageCount(totalUnread);
          console.log("Total unread messages calculated:", totalUnread);
        },
        onFailure: (err) => console.error("Failed to load conversations for unread count:", err),
      });
    };

    fetchUnreadMessages();
    const interval = setInterval(fetchUnreadMessages, 30000);
    return () => clearInterval(interval);
  }, [user?.id]);

  // ✅ Helper functions for message count
  const incrementMessageCount = (amount: number) => {
    if (amount > 0) {
      setMessageCount(prev => prev + amount);
      console.log(`Incrementing message count by ${amount}`);
    }
  };

  const decrementMessageCount = (amount: number) => {
    if (amount > 0) {
      setMessageCount(prev => Math.max(0, prev - amount));
      console.log(`Decrementing message count by ${amount}`);
    }
  };

  const resetMessageCount = () => {
    setMessageCount(0);
    console.log("Reset message count to 0");
  };

  const contextValue: CountContextType = {
    count,
    setCount,
    RecievedConnection,
    setRecievedConnection,
    messageCount,
    setMessageCount,
    incrementMessageCount,
    decrementMessageCount,
    resetMessageCount,
  };

  return (
    <CountContext.Provider value={contextValue}>
      {children}
    </CountContext.Provider>
  );
};