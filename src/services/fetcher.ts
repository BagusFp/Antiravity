interface FetchOptions extends RequestInit {
  timeout?: number;
  retries?: number;
  backoffMs?: number;
}

const activeRequests = new Map<string, Promise<any>>();

export const resilientFetch = async <T>(url: string, options: FetchOptions = {}): Promise<T> => {
  const {
    timeout = 10000, // 10 seconds default timeout
    retries = 3,     // 3 retries default
    backoffMs = 500, // starting backoff delay
    headers,
    ...rest
  } = options;

  // Standard user agent to avoid being blocked by scrapers or API rate limits
  const defaultHeaders = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Accept": "application/json, text/html, */*",
    "Accept-Language": "en-US,en;q=0.9,id;q=0.8",
    ...headers,
  };

  // Generate a key for deduplication based on URL and HTTP method
  const dedupeKey = `${options.method || "GET"}:${url}`;

  if (activeRequests.has(dedupeKey)) {
    console.log(`[Deduplication HIT] Sharing active request for: ${url}`);
    return activeRequests.get(dedupeKey) as Promise<T>;
  }

  const executeFetch = async (attempt: number): Promise<T> => {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(url, {
        ...rest,
        headers: defaultHeaders,
        signal: controller.signal,
      });

      clearTimeout(id);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status} - ${response.statusText}`);
      }

      const contentType = response.headers.get("content-type") || "";
      if (contentType.includes("application/json")) {
        return (await response.json()) as T;
      } else {
        return (await response.text()) as unknown as T;
      }
    } catch (error: any) {
      clearTimeout(id);

      const isTimeout = error.name === "AbortError";
      console.warn(`[Fetcher Attempt ${attempt} Failed] URL: ${url}. Error: ${error.message || error}`);

      if (attempt < retries) {
        const delay = backoffMs * Math.pow(2, attempt - 1);
        console.log(`[Fetcher Retrying] Waiting ${delay}ms before next attempt...`);
        await new Promise((resolve) => setTimeout(resolve, delay));
        return executeFetch(attempt + 1);
      }

      throw new Error(
        isTimeout
          ? `Request timed out after ${timeout}ms: ${url}`
          : `Fetch failed for ${url}: ${error.message}`
      );
    }
  };

  const fetchPromise = executeFetch(1).finally(() => {
    activeRequests.delete(dedupeKey);
  });

  activeRequests.set(dedupeKey, fetchPromise);
  return fetchPromise;
};
