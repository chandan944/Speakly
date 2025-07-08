import { Outlet } from "react-router-dom";
import Navbar from "../components/header/Navbar";
import { WebSocketContextProvider } from "../ws/WebSocketContextProvider";


export function ApplicationLayout() {
  return (
   <WebSocketContextProvider>
      <div >
       <Navbar/>
        <main >
          <Outlet />
        </main>
      </div>
    </WebSocketContextProvider>
  );
}