import axios from "axios";
import { studySetSchema } from "../schemas/studySet";

const http = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000",
  timeout: 75000, // longer than the backend's 60s AI timeout, so the server's error wins
});

// Config problems on the server won't fix themselves, so retrying is pointless.
const NON_RETRYABLE_CODES = new Set(["AI_CONFIG_ERROR", "SERVER_MISCONFIGURED"]);

export class ApiError extends Error {
  constructor({ code, message, status = null, retryable = false }) {
    super(message);
    this.name = "ApiError";
    this.code = code;
    this.status = status;
    this.retryable = retryable;
  }
}

export const isCanceled = (err) => axios.isCancel(err);

function toApiError(err) {
  if (err.code === "ECONNABORTED" || err.code === "ETIMEDOUT") {
    return new ApiError({
      code: "TIMEOUT",
      message: "The request took too long. Please try again.",
      retryable: true,
    });
  }

  if (err.response) {
    const { status, data } = err.response;
    const serverError = data?.error;
    const code = serverError?.code ?? "HTTP_ERROR";
    return new ApiError({
      code,
      status,
      message: serverError?.message ?? `The server responded with an error (${status}).`,
      retryable: status === 429 || (status >= 500 && !NON_RETRYABLE_CODES.has(code)),
    });
  }

  if (err.request) {
    return new ApiError({
      code: "NETWORK_ERROR",
      message: "Can't reach the server. Check that the backend is running and try again.",
      retryable: true,
    });
  }

  return new ApiError({ code: "UNKNOWN", message: "Something went wrong.", retryable: true });
}

export async function generateStudySet({ topic, mode, difficulty = "mixed" }, signal) {
  let response;
  try {
    response = await http.post("/api/generate", { topic, mode, difficulty }, { signal });
  } catch (err) {
    if (axios.isCancel(err)) throw err; // the caller decides what a cancel means
    throw toApiError(err);
  }

  // Never render unvalidated data, even from our own server.
  const body = response.data;
  const parsed = body?.success ? studySetSchema.safeParse(body.data) : null;
  if (!parsed?.success) {
    console.error("Invalid study set from server:", parsed?.error?.issues ?? body);
    throw new ApiError({
      code: "INVALID_RESPONSE",
      message: "The server returned data in an unexpected format. Please try again.",
      retryable: true,
    });
  }
  return parsed.data;
}