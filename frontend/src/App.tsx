import { RouterProvider, createBrowserRouter } from "react-router-dom";
import { ErrorPage } from "./pages/ErrorPage";
import { Login } from "./pages/login";
import { Dashboard } from "./pages/dashboard";

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
        element: <Dashboard />,
        path: "/dashboard",
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
