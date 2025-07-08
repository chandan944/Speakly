import React from "react";
import ReactDOM from "react-dom/client";
import { ChakraProvider } from "@chakra-ui/react";
import App from "./App";
import theme from "./chakra/theme";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
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

const router = createBrowserRouter([
  {
    element: <AuthenticationContextProvider />,
    children: [
      {
      path:"/",
      element:<ApplicationLayout/>,
      children:[
        {
          index:true,
          element:<div>feed</div>
        },
        {
           path:"post/:id",
           element:<div>post</div>
        },
        {
        path : "network",
        element:<div>network</div>
        },
        {

        }
      ]
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
      <RouterProvider router={router} />
      <App />
    </ChakraProvider>
  </React.StrictMode>
);
