import { createBrowserRouter, RouterProvider } from "react-router-dom";

import Home from "../pages/Home";
import Error from "../pages/Error";

import Contact from "../pages/Contact";

import Doctor from "../pages/Doctor";
import Services from "../pages/Services";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Home />,
    errorElement: <Error />,
    children: [
      {
        index: true,
        element: <Home />,
      },
      {
        path: "about",
        element: <Doctor />,
      },
      {
        path: "contact",
        element: <Contact />,
      },
      {
        path:"service",
        element:<Services />
      }
    ],
  },
]);

export default function AppRouter() {
  return <RouterProvider router={router} />;
}