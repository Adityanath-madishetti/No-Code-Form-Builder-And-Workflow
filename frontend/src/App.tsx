import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import ProtectedLayout from "./components/layout/ProtectedLayout";
import Login from "./pages/Login/page";
import Home from "./pages/Home";
import FormEditor from "./pages/FormEditor/FormEditor";

const router = createBrowserRouter([
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/",
    element: <ProtectedLayout />,
    children: [
      {
        index: true,
        element: <Home />,
      },
      {
        path: "form-builder/:formId",
        element: <FormEditor />,
      },
    ],
  },
]);

export default function App() {
  return (
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  );
}