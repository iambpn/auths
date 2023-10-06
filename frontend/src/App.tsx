import { RouterProvider, createBrowserRouter } from "react-router-dom";
import { ErrorPage } from "./pages/ErrorPage";
import { Login } from "./pages/login";
import { Layout } from "./pages/dashboard/layout";
import { ListRoles } from "./pages/dashboard/role";
import { Users } from "./pages/dashboard/users";
import { ListPermission } from "./pages/dashboard/permission";
import { CreateRole } from "./pages/dashboard/role/create";
import { EditRole } from "./pages/dashboard/role/edit";
import { CreatePermission } from "./pages/dashboard/permission/create";
import { EditPermission } from "./pages/dashboard/permission/edit";

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
            path: "/users",
            element: <Users />,
          },
          {
            path: "/roles",
            element: <ListRoles />,
          },
          {
            path: "/roles/create",
            element: <CreateRole />,
          },
          {
            path: "/roles/:id",
            element: <EditRole />,
          },
          {
            path: "/permission",
            element: <ListPermission />,
          },
          {
            path: "/permission/create",
            element: <CreatePermission />,
          },
          {
            path: "/permission/:id",
            element: <EditPermission />,
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
