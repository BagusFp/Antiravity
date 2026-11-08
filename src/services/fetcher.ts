interface FetchOptions extends RequestInit {
  timeout?: number;
  retries?: number;
  backoffMs?: number;
  throwOnError?: boolean;
}

const activeRequests = new Map<string, Promise<any>>();

// ---------------------------------------------------------------------------
// Fetch gateway (anti-Cloudflare)
//
// Upstream hosts used by this app (the Sanka Vollerei API and otakudesu.blog)
// sit behind Cloudflare bot protection that answers datacenter IPs — such as
// Vercel's serverless functions — with a 403 "Just a moment..." challenge
// page instead of the real response. Residential IPs pass, which is why the
// app can work locally but not when deployed.
//
// When a direct request is detected as Cloudflare-blocked, resilientFetch
// automatically retries the same request through a fetch gateway whose
// egress is not challenged.
//
// Configure with the FETCH_GATEWAY env var as a URL template containing
// "{url}" (it is replaced with the encoded target URL):
//   FETCH_GATEWAY=https://api.allorigins.win/raw?url={url}        (default, free but flaky)
//   FETCH_GATEWAY=https://api.scraperapi.com?api_key=KEY&url={url} (any similar service)
//   FETCH_GATEWAY=off                                              (disable gateway entirely)
// ---------------------------------------------------------------------------
const DEFAULT_GATEWAY_TEMPLATE = "https://api.allorigins.win/raw?url={url}";

function gatewayUrlFor(url: string): string | null {
  const raw = (process.env.FETCH_GATEWAY ?? "").trim();
  const lowered = raw.toLowerCase();
  if (lowered === "off" || lowered === "none" || lowered === "direct") {
    return null;
  }
  const template = raw || DEFAULT_GATEWAY_TEMPLATE;
  return template.includes("{url}")
    ? template.replace("{url}", encodeURIComponent(url))
    : `${template}${encodeURIComponent(url)}`;
}

function looksLikeCloudflareBlock(status: number, bodyStart: string): boolean {
  if (status !== 403 && status !== 503 && status !== 429) return false;
  const t = bodyStart.toLowerCase();
  return (
    t.includes("just a moment") ||
    t.includes("challenges.cloudflare.com") ||
    t.includes("cf-chl") ||
    t.includes("attention required") ||
    (t.includes("cloudflare") && t.includes("<html"))
  );
}

export const resilientFetch = async <T>(url: string, options: FetchOptions = {}): Promise<T> => {
  const {
    timeout = 10000, // 10 seconds default timeout
    retries = 3,     // 3 retries default
    backoffMs = 500, // starting backoff delay
    throwOnError = false, // do not throw by default, return null on failure
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

  const attemptOnce = async (target: string, attemptTimeout: number): Promise<T> => {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), attemptTimeout);

    try {
      const response = await fetch(target, {
        ...rest,
        headers: defaultHeaders,
        signal: controller.signal,
      });

      clearTimeout(id);

      const text = await response.text();

      // Cloudflare challenge pages arrive as HTML with an error status.
      // Tag them so the caller can switch to the gateway instead of
      // burning the whole retry budget on a page that will never change.
      if (looksLikeCloudflareBlock(response.status, text.slice(0, 2000))) {
        const blockError: any = new Error(`Cloudflare block (HTTP ${response.status}) for ${url}`);
        blockError.cloudflareBlock = true;
        throw blockError;
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status} - ${response.statusText}`);
      }

      const contentType = response.headers.get("content-type") || "";
      const trimmed = text.trimStart();
      // Gateways often return JSON with a non-JSON content type, so also
      // sniff the body shape before deciding how to parse it.
      if (contentType.includes("application/json") || trimmed.startsWith("{") || trimmed.startsWith("[")) {
        try {
          return JSON.parse(text) as T;
        } catch (jsonErr: any) {
          if (contentType.includes("application/json")) {
            console.warn(`[Fetcher JSON Parse Error] URL: ${url}. Invalid JSON structure: ${text.slice(0, 100)}...`);
            throw new Error(`Invalid JSON response: ${jsonErr.message}`);
          }
          return text as unknown as T;
        }
      }
      return text as unknown as T;
    } catch (error) {
      clearTimeout(id);
      throw error;
    }
  };

  const runMode = async (useGateway: boolean): Promise<T> => {
    const gatewayUrl = useGateway ? gatewayUrlFor(url) : null;
    if (useGateway && !gatewayUrl) {
      throw new Error("Gateway requested but FETCH_GATEWAY is disabled");
    }
    const target = gatewayUrl ?? url;
    // Gateways add a full extra hop and can be slow; give them more room.
    const attemptTimeout = useGateway ? Math.max(timeout, 30000) : timeout;

    let lastError: any = null;
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        return await attemptOnce(target, attemptTimeout);
      } catch (error: any) {
        lastError = error;
        const isTimeout = error?.name === "AbortError";
        console.warn(
          `[Fetcher Attempt ${attempt} Failed${useGateway ? " via gateway" : ""}] URL: ${url}. Error: ${error.message || error}`
        );

        // A Cloudflare block will not heal by retrying the same route:
        // stop early so the other mode (gateway/direct) gets its turn.
        if (error?.cloudflareBlock) break;

        if (attempt < retries) {
          const delay = backoffMs * Math.pow(2, attempt - 1);
          console.log(`[Fetcher Retrying] Waiting ${delay}ms before next attempt...`);
          await new Promise((resolve) => setTimeout(resolve, delay));
        }
      }
    }
    throw lastError ?? new Error(`Fetch failed for ${url}`);
  };

  const executeFetch = async (): Promise<T> => {
    const hasGateway = gatewayUrlFor(url) !== null;
    const modes = hasGateway ? [false, true] : [false];
    let lastError: any = null;

    for (const useGateway of modes) {
      try {
        return await runMode(useGateway);
      } catch (error: any) {
        lastError = error;
        if (hasGateway && !useGateway) {
          console.warn(`[Fetcher] Direct fetch failed for ${url}. Retrying through FETCH_GATEWAY...`);
        }
      }
    }

    if (throwOnError) {
      const isTimeout = lastError?.name === "AbortError";
      throw new Error(
        isTimeout
          ? `Request timed out: ${url}`
          : `Fetch failed for ${url}: ${lastError?.message || lastError}`
      );
    }

    return null as unknown as T;
  };

  const fetchPromise = executeFetch().finally(() => {
    activeRequests.delete(dedupeKey);
  });

  activeRequests.set(dedupeKey, fetchPromise);
  return fetchPromise;
};
