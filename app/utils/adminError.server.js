import { AppError } from "./appError.server";

export function adminErrorResponse(error) {
  const formattedError = AppError.handle(error);

  return Response.json(formattedError, {
    status: formattedError.status ?? 500,
  });
}
