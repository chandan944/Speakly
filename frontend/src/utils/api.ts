const Base_URL = import.meta.env.VITE_API_URL;

interface IRequestParams<T> {
  endpoint: string;
  method?: "GET" | "POST" | "PUT" | "DELETE";
  contentType?: "application/json" | "multipart/form-data";
  body?: BodyInit | FormData;
  onSuccess: (data: T) => void;
  onFailure: (error: string) => void;
}

interface IHeaders extends Record<string, string> {
  Authorization: string;
}
export const request = async <T>({
  endpoint,
  method = "GET",
  body,
  contentType = "application/json",
  onSuccess,
  onFailure,
}: IRequestParams<T>): Promise<void> => {
  const headers: IHeaders = {
    Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
  };

  if (contentType === "application/json") {
    headers["Content-Type"] = "application/json";
  }

  try {
    const response = await fetch(`${Base_URL}${endpoint}`, {
      method,
      headers,
      body,
    });

    const isJson = response.headers
      .get("content-type")
      ?.includes("application/json");

    if (!response.ok) {
      if (response.status === 401 && !window.location.pathname.includes("authentication")) {
        window.location.href = "/authentication/login";
        return;
      }

      const errorText = isJson ? await response.json() : { message: "Something went wrong" };
      throw new Error(errorText?.message || "Something went wrong");
    }

    // If response is JSON and expected
    if (isJson) {
      const data: T = await response.json();
      onSuccess(data);
    } else {
      onFailure("Expected JSON but got empty response");
    }
  } catch (error) {
    if (error instanceof Error) {
      onFailure(error.message);
    } else {
      onFailure("An unexpected error occurred.");
    }
  }
};
