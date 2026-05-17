export type AuthUser = {
  id: number;
  name: string;
  email: string;
};

export type AuthResponse = {
  token?: string;
  access_token?: string;
  user?: AuthUser;
  message?: string;
};

type ApiErrorBody = {
  message?: string;
  errors?: Record<string, string[]>;
};

type ProfileResponse = {
  message?: string;
  user: AuthUser;
};

let authToken = "";
let authUser: AuthUser | null = null;

export const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL ?? "http://192.168.0.100:8000/api";

function getValidationMessage(body: ApiErrorBody) {
  const firstError = body.errors ? Object.values(body.errors)[0]?.[0] : null;

  return (
    firstError ?? body.message ?? "Something went wrong. Please try again."
  );
}

async function request<TResponse>(
  method: "POST" | "PUT",
  path: string,
  body: Record<string, string>,
  token?: string,
): Promise<TResponse> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(body),
  });

  const data = (await response.json().catch(() => ({}))) as ApiErrorBody;

  if (!response.ok) {
    throw new Error(getValidationMessage(data));
  }

  return data as TResponse;
}

function post<TResponse>(
  path: string,
  body: Record<string, string>,
  token?: string,
) {
  return request<TResponse>("POST", path, body, token);
}

function put<TResponse>(
  path: string,
  body: Record<string, string>,
  token?: string,
) {
  return request<TResponse>("PUT", path, body, token);
}

export function login(email: string, password: string) {
  return post<AuthResponse>("/login", { email, password });
}

export function register(name: string, email: string, password: string) {
  return post<AuthResponse>("/register", {
    name,
    email,
    password,
    password_confirmation: password,
  });
}

export function setAuthSession(response: AuthResponse) {
  authToken = response.token ?? response.access_token ?? "";
  authUser = response.user ?? null;
}

export function getAuthSession() {
  return {
    token: authToken,
    user: authUser,
    isLoggedIn: Boolean(authToken),
  };
}

export function clearAuthSession() {
  authToken = "";
  authUser = null;
}

export async function updateProfileName(name: string) {
  if (!authToken) {
    throw new Error("Please log in again.");
  }

  const result = await put<ProfileResponse>("/profile", { name }, authToken);
  authUser = result.user;

  return result;
}

export async function logout() {
  if (!authToken) {
    clearAuthSession();
    return { message: "Logged out." };
  }

  const result = await post<{ message?: string }>("/logout", {}, authToken);
  clearAuthSession();

  return result;
}
