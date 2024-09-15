import ProtectedRoute from "@/components/layout/ProtectedRoute";
import SecondaryLayout from "@/components/layout/SecondaryLayout";

import Login from "@/pages/Login";
import Register from "@/pages/Register";
import { routesGenerator } from "@/utils/routesGenerator";
import { createBrowserRouter } from "react-router-dom";

import { managerPaths } from "./manager.routes";
import { userPaths } from "./user.routes";
import AllProducts from "@/pages/AllProducts";
import NotFound from "@/pages/NotFound";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <SecondaryLayout />,
    children: [
      {
        path: "",
        element: <AllProducts />,
      },
      {
        path: "register",
        element: <Register />,
      },
      {
        path: "*",
        element: <NotFound />,
      },
      {
        path: "login",
        element: <Login />,
      },
    ],
  },
  {
    path: "dashboard/manager",
    element: (
      <>
        <ProtectedRoute>
          {" "}
          <SecondaryLayout />
        </ProtectedRoute>
      </>
    ),
    children: routesGenerator(managerPaths),
  },
  {
    path: "dashboard/user",
    element: (
      <ProtectedRoute>
        <SecondaryLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true, // This makes /dashboard/user load AllProducts by default
        element: <AllProducts />,
      },
      ...routesGenerator(userPaths),
    ],
  },
]);
