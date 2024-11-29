// src/types/error.ts
export enum ErrorCode {
    LoginError = "LOGIN_ERROR",
    NetworkError = "NETWORK_ERROR",
    NotFound = "NOT_FOUND",
    Unauthorized = "UNAUTHORIZED",
    Forbidden = "FORBIDDEN",
    InternalServerError = "INTERNAL_SERVER_ERROR",
    BadRequest = "BAD_REQUEST",
    UnprocessableEntity = "UNPROCESSABLE_ENTITY",
    Timeout = "TIMEOUT",
    Unknown = "UNKNOWN",
    TooManyRequests = "TOO_MANY_REQUESTS",
    TokenRefreshError = 'TOKEN_REFRESH_ERROR',
}

// src/types/api.ts
export interface ApiError {
    code: ErrorCode;
    message: string;
}
