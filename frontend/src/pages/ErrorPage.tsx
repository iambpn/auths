import { isRouteErrorResponse, useRouteError } from "react-router-dom";

export function ErrorPage() {
  const error = useRouteError();
  console.error(error);

  return (
    <div className='min-h-screen flex justify-center items-center'>
      <div className='[&>*]:mb-5'>
        <h1 className='text-3xl text-center'>Oops!</h1>
        <p>Sorry, an unexpected error has occurred.</p>
        <p className='text-center text-gray-600'>
          <i>{isRouteErrorResponse(error) ? error.statusText : error instanceof Error ? error.message : "Oops..."}</i>
        </p>
      </div>
    </div>
  );
}
