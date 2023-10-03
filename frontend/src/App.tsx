import { RouterProvider, createBrowserRouter } from "react-router-dom";
import { ErrorPage } from "./pages/ErrorPage";
import { Login } from "./pages/login";
import { Layout } from "./pages/dashboard/layout";
import { Roles } from "./pages/dashboard/role";
import { Users } from "./pages/dashboard/users";
import { Permission } from "./pages/dashboard/permission";

const browserRouter = createBrowserRouter([
  {
    path: "/",
    errorElement: <ErrorPage />,
    children: [
      {
        element: <Login />,
        index: true,
      },
      {
        path: "/",
        element: <Layout />,
        children: [
          {
            path: "/roles",
            element: <Roles />,
          },
          {
            path: "/users",
            element: <Users />,
          },
          {
            path: "/permission",
            element: <Permission />,
          },
        ],
      },
    ],
  },
]);

function App() {
  return (
    <>
      <RouterProvider router={browserRouter} />
    </>
  );
}

export default App;
