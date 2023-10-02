import { RouterProvider, createBrowserRouter } from "react-router-dom";
import { ErrorPage } from "./pages/ErrorPage";
import { Login } from "./pages/login";
import { Dashboard } from "./pages/dashboard";
import { Layout } from "./pages/dashboard/layout";

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
        element: <Layout/>,
        children: [
          {
            path: '/dashboard',
            element: <Dashboard />
          }
        ]
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
