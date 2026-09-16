// Render's free tier can take ~30-50s to wake a sleeping instance on the
// first request, so the timeout is generous rather than "typical API" length.
const DEFAULT_TIMEOUT_MS = 45000;

async function parseJsonResponse(response) {
  const text = await response.text();

  if (!text) {
    return null;
  }

  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

// The backend's error body shape isn't pinned down ({message}, {error}, or
// {errors: [...]} are all common Express conventions), so this checks all of
// them before falling back to the raw HTTP status — that way a failure is
// never a silent generic string with no way to tell what actually happened.
function buildErrorMessage(data, response) {
  if (data?.message) {
    return data.message;
  }

  if (data?.error) {
    return typeof data.error === 'string' ? data.error : JSON.stringify(data.error);
  }

  if (Array.isArray(data?.errors) && data.errors.length > 0) {
    return data.errors
      .map((item) => (typeof item === 'string' ? item : item?.message))
      .filter(Boolean)
      .join(' · ');
  }

  return `Error ${response.status}${response.statusText ? ` (${response.statusText})` : ''}`;
}

// Every request in the app goes through here so failures are always logged
// (visible in the Metro terminal / in-app LogBox in dev) instead of only
// surfacing as a generic message with no way to inspect what the server sent.
export async function apiRequest(url, options = {}, { timeoutMs = DEFAULT_TIMEOUT_MS } = {}) {
  const method = options.method || 'GET';
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  let response;

  try {
    response = await fetch(url, { ...options, signal: controller.signal });
  } catch (error) {
    const message = error.name === 'AbortError'
      ? 'El servidor tardó demasiado en responder. Intenta de nuevo en unos segundos.'
      : `No se pudo conectar con el servidor (${error.message}).`;

    if (__DEV__) {
      console.error(`[API] ${method} ${url} → network error:`, error);
    }

    throw new Error(message);
  } finally {
    clearTimeout(timeout);
  }

  const data = await parseJsonResponse(response);

  if (__DEV__) {
    console.log(`[API] ${method} ${url} → ${response.status}`, data);
  }

  if (!response.ok) {
    throw new Error(buildErrorMessage(data, response));
  }

  return data;
}
