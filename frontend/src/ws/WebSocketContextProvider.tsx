import { CompatClient, Stomp } from "@stomp/stompjs";
import { createContext,  useContext, useEffect, useState, type ReactNode } from "react";

const WsContext = createContext<CompatClient | null>(null);

// eslint-disable-next-line react-refresh/only-export-components
export const useWebSocket = () => useContext(WsContext);

export const WebSocketContextProvider = ({ children }: { children: ReactNode }) => {
  const [stompClient, setStompClient] = useState<CompatClient | null>(null);

  useEffect(() => {
    const client = Stomp.client("ws://localhost:8080/ws");

    client.connect(
      {},
      () => {
        console.log("Connected to WebSocket");
        setStompClient(client);
      },
      (error: unknown) => {
        console.error("Error connecting to WebSocket:", error);
      }
    );

    return () => {
      if (client.connected) {
        client.disconnect(() => console.log("Disconnected from WebSocket"));
      }
    };
  }, []);

  return <WsContext.Provider value={stompClient}>{children}</WsContext.Provider>;
};
