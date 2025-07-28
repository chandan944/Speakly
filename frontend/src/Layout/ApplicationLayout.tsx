import { Outlet } from "react-router-dom";
import { WebSocketContextProvider } from "../ws/WebSocketContextProvider";
import { CountProvider } from "../components/Notify/CountContext";
import Navbar from "../components/header/Navbar";
import "./Navbar.css"

export function ApplicationLayout() {
  return (
    <WebSocketContextProvider>
      <CountProvider>
        <div className="app-layout">
          <Navbar />
          <main>
            <Outlet />
          </main>
        </div>
      </CountProvider>
    </WebSocketContextProvider>
  );
}