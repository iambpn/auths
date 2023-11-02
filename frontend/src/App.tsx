import { Outlet, RouterProvider, createBrowserRouter } from "react-router-dom";
import { ErrorPage } from "./pages/ErrorPage";
import { DashboardLayout } from "./pages/afterLogin/dashboard/layout";
import { ListPermission } from "./pages/afterLogin/dashboard/permission";
import { CreatePermission } from "./pages/afterLogin/dashboard/permission/create";
import { EditPermission } from "./pages/afterLogin/dashboard/permission/edit";
import { ListRoles } from "./pages/afterLogin/dashboard/role";
import { CreateRole } from "./pages/afterLogin/dashboard/role/create";
import { EditRole } from "./pages/afterLogin/dashboard/role/edit";
import { Users } from "./pages/afterLogin/dashboard/users";
import Settings from "./pages/afterLogin/settings";
import { Login } from "./pages/login";
import AfterLoginLayout from "./pages/afterLogin/layout";
import Logout from "./pages/logout";
import ForgotPassword from "./pages/forgotPassword";
import { InitialLayout } from "./pages/layout";
import { RequireAuth } from "./components/requireAuth";
import { BlockOnAuth } from "./components/blockOnAuth";
import { ResetPassword } from "./pages/resetPassword";

const browserRouter = createBrowserRouter(
  [
    {
      path: "/",
      errorElement: <ErrorPage />,
      element: <InitialLayout />,
      children: [
        {
          path: "/",
          element: (
            <BlockOnAuth>
              <Outlet />
            </BlockOnAuth>
          ),
          children: [
            {
              element: <Login />,
              index: true,
            },
            {
              path: "/forgotpassword",
              element: <ForgotPassword />,
            },
            {
              path: "/resetpassword",
              element: <ResetPassword />,
            },
          ],
        },
        {
          path: "/",
          element: (
            <RequireAuth>
              <AfterLoginLayout />
            </RequireAuth>
          ),
          children: [
            {
              path: "/",
              element: <DashboardLayout />,
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
            {
              path: "/settings",
              element: <Settings />,
            },
          ],
        },
        {
          path: "/logout",
          element: <Logout />,
        },
      ],
    },
  ],
  {
    // Router baseurl: using '/auths' on production because production serve's frontend on '/auths' path.
    basename: import.meta.env.PROD ? import.meta.env.VITE_PRODUCTION_PATH_PREFIX : undefined,
  }
);

if (import.meta.hot) {
  import.meta.hot.dispose(() => browserRouter.dispose());
}

function App() {
  return (
    <>
      <RouterProvider router={browserRouter} />
    </>
  );
}

export default App;
