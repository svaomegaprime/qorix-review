import { AppError } from "./appError.server";

export function adminErrorResponse(error) {
  // Shopify's authenticate.admin() throws a Response (e.g. 302 redirect to /auth/login)
  // when the session is missing or expired. Re-throw it so React Router handles it correctly.
  if (error instanceof Response) {
    throw error;
  }

  const formattedError = AppError.handle(error);

  return Response.json(formattedError, {
    status: formattedError.status ?? 500,
  });
}
