// app/utils/errors/app-error.server.js

import { Prisma } from "@prisma/client";

const PRISMA_CODE_MAP = {
  // Connection / Engine
  P1000: {
    status: 401,
    code: "DB_AUTH_FAILED",
    message: "Database authentication failed.",
  },

  P1001: {
    status: 503,
    code: "DB_CONNECTION_FAILED",
    message: "Cannot connect to database.",
  },

  P1002: {
    status: 504,
    code: "DB_CONNECTION_TIMEOUT",
    message: "Database connection timed out.",
  },

  P1008: {
    status: 504,
    code: "DB_TIMEOUT",
    message: "Database operation timed out.",
  },

  // Query / Validation
  P2000: {
    status: 400,
    code: "VALUE_TOO_LONG",
    message: "Input value is too long.",
  },

  P2001: {
    status: 404,
    code: "RECORD_NOT_FOUND",
    message: "Record does not exist.",
  },

  P2002: {
    status: 409,
    code: "UNIQUE_CONSTRAINT_FAILED",
    message: "Duplicate value already exists.",
  },

  P2003: {
    status: 409,
    code: "FOREIGN_KEY_CONSTRAINT_FAILED",
    message: "Related record does not exist.",
  },

  P2004: {
    status: 400,
    code: "CONSTRAINT_FAILED",
    message: "Database constraint failed.",
  },

  P2005: {
    status: 400,
    code: "INVALID_FIELD_VALUE",
    message: "Invalid field value.",
  },

  P2006: {
    status: 400,
    code: "INVALID_FIELD_TYPE",
    message: "Invalid field type.",
  },

  P2007: {
    status: 400,
    code: "DATA_VALIDATION_FAILED",
    message: "Data validation failed.",
  },

  P2011: {
    status: 400,
    code: "NULL_CONSTRAINT_FAILED",
    message: "Required field is missing.",
  },

  P2012: {
    status: 400,
    code: "MISSING_REQUIRED_VALUE",
    message: "Required value is missing.",
  },

  P2013: {
    status: 400,
    code: "MISSING_REQUIRED_ARGUMENT",
    message: "Required argument is missing.",
  },

  P2014: {
    status: 409,
    code: "RELATION_CONSTRAINT_FAILED",
    message: "Relation constraint failed.",
  },

  P2015: {
    status: 404,
    code: "RELATED_RECORD_NOT_FOUND",
    message: "Related record not found.",
  },

  P2016: {
    status: 400,
    code: "QUERY_INTERPRETATION_ERROR",
    message: "Query interpretation error.",
  },

  P2017: {
    status: 409,
    code: "RELATION_RECORDS_NOT_CONNECTED",
    message: "Records are not connected.",
  },

  P2018: {
    status: 404,
    code: "REQUIRED_CONNECTED_RECORD_NOT_FOUND",
    message: "Required connected record not found.",
  },

  P2019: {
    status: 400,
    code: "INPUT_ERROR",
    message: "Input error.",
  },

  P2020: {
    status: 400,
    code: "VALUE_OUT_OF_RANGE",
    message: "Value out of range.",
  },

  P2021: {
    status: 500,
    code: "TABLE_NOT_FOUND",
    message: "Database table not found.",
  },

  P2022: {
    status: 500,
    code: "COLUMN_NOT_FOUND",
    message: "Database column not found.",
  },

  P2023: {
    status: 400,
    code: "INCONSISTENT_COLUMN_DATA",
    message: "Inconsistent column data.",
  },

  P2024: {
    status: 504,
    code: "CONNECTION_POOL_TIMEOUT",
    message: "Database connection pool timeout.",
  },

  P2025: {
    status: 404,
    code: "RECORD_NOT_FOUND",
    message: "Requested record not found.",
  },

  P2026: {
    status: 400,
    code: "UNSUPPORTED_FEATURE",
    message: "Unsupported database feature.",
  },

  P2027: {
    status: 400,
    code: "MULTIPLE_ERRORS",
    message: "Multiple database errors occurred.",
  },

  P2028: {
    status: 500,
    code: "TRANSACTION_ERROR",
    message: "Transaction failed.",
  },

  P2034: {
    status: 409,
    code: "TRANSACTION_CONFLICT",
    message: "Transaction conflict. Please retry.",
  },
};

const PRISMA_NAME_MAP = {
  PrismaClientValidationError: {
    status: 400,
    code: "VALIDATION_ERROR",
    message: "Invalid Prisma query.",
  },

  PrismaClientInitializationError: {
    status: 503,
    code: "INITIALIZATION_ERROR",
    message: "Database initialization failed.",
  },

  PrismaClientRustPanicError: {
    status: 500,
    code: "ENGINE_CRASHED",
    message: "Database engine crashed.",
  },

  PrismaClientUnknownRequestError: {
    status: 500,
    code: "UNKNOWN_DB_ERROR",
    message: "Unknown database error.",
  },
};

export class AppError extends Error {
  constructor(error, options = {}) {
    // Already AppError
    if (error instanceof AppError) {
      super(error.message);

      this.name = error.name;
      this.code = error.code;
      this.status = error.status;
      this.details = error.details;

      return;
    }

    // Prisma Error
    if (AppError.isPrismaError(error)) {
      const prismaCode = error?.code;

      const config =
        PRISMA_NAME_MAP[error.name] ||
        PRISMA_CODE_MAP[prismaCode] || {
          status: 500,
          code: prismaCode || "PRISMA_ERROR",
          message: error.message || "Database error.",
        };

      // Better unique error message
      if (prismaCode === "P2002") {
        const field = error?.meta?.target?.join(", ");

        config.message = field
          ? `${field} already exists.`
          : config.message;
      }

      super(config.message);

      this.name = "AppError";
      this.code = config.code;
      this.status = config.status;
      this.details = {
        prismaCode,
        prismaName: error.name,
        fields: error?.meta?.target ?? null,
        meta: error?.meta ?? null,
      };

      Error.captureStackTrace?.(this, this.constructor);
      return;
    }

    // Native JS Error
    if (error instanceof Error) {
      super(error.message);

      this.name = "AppError";
      this.code = error.name || "ERROR";
      this.status = options.status || 500;
      this.details = options.details || null;

      Error.captureStackTrace?.(this, this.constructor);
      return;
    }

    // Custom message
    if (typeof error === "string") {
      super(error);

      this.name = "AppError";
      this.code = options.code || "APP_ERROR";
      this.status = options.status || 400;
      this.details = options.details || null;

      Error.captureStackTrace?.(this, this.constructor);
      return;
    }

    // Unknown
    super("Unknown error");

    this.name = "AppError";
    this.code = "UNKNOWN_ERROR";
    this.status = 500;
    this.details = error || null;

    Error.captureStackTrace?.(this, this.constructor);
  }

  static isPrismaError(error) {
    return Boolean(
      error &&
        typeof error === "object" &&
        (
          error instanceof Prisma.PrismaClientKnownRequestError ||
          error instanceof Prisma.PrismaClientValidationError ||
          error instanceof Prisma.PrismaClientInitializationError ||
          error instanceof Prisma.PrismaClientRustPanicError ||
          error instanceof Prisma.PrismaClientUnknownRequestError ||
          String(error.name).startsWith("PrismaClient")
        )
    );
  }

  toJSON() {
    return {
      ok: false,
      message: this.message,
      code: this.code,
      status: this.status,
      details: this.details,
    };
  }

  static handle(error, logger = console) {
    const appError = new AppError(error);

    logger.error("[AppError]", appError);

    return appError.toJSON();
  }
}