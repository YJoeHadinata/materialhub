import { NextResponse } from "next/server";
import { ZodError } from "zod";
import type { ApiErrorResponse, ApiSuccessResponse } from "@/types";

export class AppError extends Error {
  public readonly code: string;
  public readonly statusCode: number;
  public readonly fieldErrors?: Record<string, string[]>;

  constructor(
    code: string,
    message: string,
    statusCode = 400,
    fieldErrors?: Record<string, string[]>,
  ) {
    super(message);
    this.name = "AppError";
    this.code = code;
    this.statusCode = statusCode;
    this.fieldErrors = fieldErrors;
  }
}

export function apiSuccess<T, M = Record<string, unknown>>(
  data: T,
  meta: M = {} as M,
  status = 200,
): NextResponse<ApiSuccessResponse<T, M>> {
  return NextResponse.json(
    {
      success: true,
      data,
      meta,
    },
    { status },
  );
}

export function apiError(
  code: string,
  message: string,
  status = 400,
  fieldErrors?: Record<string, string[]>,
): NextResponse<ApiErrorResponse> {
  return NextResponse.json(
    {
      success: false,
      error: {
        code,
        message,
        ...(fieldErrors ? { fieldErrors } : {}),
      },
    },
    { status },
  );
}

export function formatZodErrors(error: ZodError): Record<string, string[]> {
  const fieldErrors: Record<string, string[]> = {};
  for (const issue of error.issues) {
    const pathKey = issue.path.length > 0 ? issue.path.join(".") : "_form";
    if (!fieldErrors[pathKey]) {
      fieldErrors[pathKey] = [];
    }
    fieldErrors[pathKey].push(issue.message);
  }
  return fieldErrors;
}

export function handleApiRouteError(error: unknown): NextResponse<ApiErrorResponse> {
  if (error instanceof AppError) {
    return apiError(
      error.code,
      error.message,
      error.statusCode,
      error.fieldErrors,
    );
  }

  if (error instanceof ZodError) {
    return apiError(
      "VALIDATION_ERROR",
      "The submitted data is invalid.",
      422,
      formatZodErrors(error),
    );
  }

  console.error("Unhandled API Error:", error);
  return apiError(
    "INTERNAL_SERVER_ERROR",
    "An unexpected server error occurred.",
    500,
  );
}
