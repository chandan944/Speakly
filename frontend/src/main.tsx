import React from "react";
import ReactDOM from "react-dom/client";
import { ChakraProvider } from "@chakra-ui/react";

import theme from "./chakra/theme";
import {
  createBrowserRouter,
  Navigate,
  RouterProvider,
} from "react-router-dom";
import Login from "./features/authentication/pages/login/Login";
import Signin from "./features/authentication/pages/signin/Signin";
import ResetPassword from "./features/authentication/pages/resetPassword/ResetPassword";
import VerifyEmail from "./features/authentication/pages/validateEmail/VerifyEmail";
import UserProfile from "./features/authentication/pages/UserProfile/UserProfile";
import "./index.css";
import NotFound from "./components/notfound/NotFound";
import { AuthenticationContextProvider } from "./features/authentication/context/AuthenticationContextProvider";
import { AuthenticationLayout } from "./features/authentication/AuthLayout/AuthLayout";
import { ApplicationLayout } from "./Layout/ApplicationLayout";

// import Profile from "./features/profile/pages/Profile";
import { Posts } from "./features/profile/pages/Posts";
import { Connections } from "./features/network/pages/Connection";
import { Invitations } from "./features/network/pages/Invitation";
import { PostPage } from "./features/feed/pages/Postpage";
import { Feed } from "./features/feed/pages/Feed";
import { Network } from "./features/network/pages/Network";
import { Profile } from "./features/profile/pages/Profile";
import { Notifications } from "./features/feed/pages/Notification";
import { CountProvider } from "./components/Notify/CountContext";
import { Conversation } from "./features/messaging/pages/Conversation";
import Messaging from "./features/messaging/pages/Messaging";
import { Leaderboard } from "./ai/feature/LeaderBoard";
import Sentences from "./ai/feature/sentense/Sentences";
import StoryPage from "./ai/feature/story/StoryPage";
import VoiceAssistant from "./ai/feature/speak/VoiceAssistant";
// import Conversation from "./features/messaging/pages/Conversation";

const router = createBrowserRouter([
  {
    element: <AuthenticationContextProvider />,
    children: [
      {
        path: "/",
        element: <ApplicationLayout />,
        children: [
          {
            path: "/", // 🏠 If someone visits just `/`, show the Feed page!
            element: <Feed />,
          },
          {
            path: "/leader",
            element: <Leaderboard />,
          },
          {
            path: "ai", // 🏠 If someone visits just `/`, show the Feed page!
            element: <Sentences />,
          },
          {
            path: "posts/:id",
            element: <PostPage />,
          },
          {
            path: "network", // 👥 LinkedIn's Network tab
            element: <Network />,
            children: [
              {
                index: true,
                element: <Navigate to="invitations" />,
              },
              {
                path: "invitations",
                element: <Invitations />,
              },
              {
                path: "connections",
                element: <Connections />,
              },
            ],
          },
          {
            path: "speak", // 💼 Jobs tab
            element: <VoiceAssistant/>,
          },
          {
            path: "messaging", // 💬 Messaging tab
            element: <Messaging />,
            children: [
              {
                path: "conversations/:id",
                element: <Conversation />,
              },
            ],
          },
          {
            path: "notification", // 🔔 Notification tab
            element: <Notifications />,
          },
          {
            path: "profile/:id",
            element: <Profile />,
          },
          {
            path: "profile/:id/posts",
            element: <Posts />,
          },
          {
            path: "stories", // ⚙️ Settings page
            element: <StoryPage />,
          },
        ],
      },

      {
        path: "authentication",
        element: <AuthenticationLayout />,
        children: [
          {
            path: "login",
            element: <Login />,
          },
          {
            path: "signup",
            element: <Signin />,
          },
          {
            path: "request-password-reset",
            element: <ResetPassword />,
          },
          {
            path: "verify-email",
            element: <VerifyEmail />,
          },
          {
            path: "profile/:id",
            element: <UserProfile />,
          },
        ],
      },
      {
        path: "*",
        element: <NotFound />,
      },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ChakraProvider resetCSS theme={theme}>
      <CountProvider>
        <RouterProvider router={router} />
      </CountProvider>
    </ChakraProvider>
  </React.StrictMode>
);
