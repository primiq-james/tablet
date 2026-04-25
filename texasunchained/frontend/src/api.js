const apiBaseUrl = window.TEXAS_UNCHAINED_CONFIG?.apiBaseUrl ?? "";

export function apiPath(path) {
  return `${apiBaseUrl}${path}`;
}

export async function postJson(path, payload) {
  const response = await fetch(apiPath(path), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  let data = {};
  try {
    data = await response.json();
  } catch {
    data = {};
  }

  if (!response.ok) {
    throw new Error(data.error ?? "Something went wrong. Please try again.");
  }

  return data;
}
