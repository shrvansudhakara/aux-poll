export async function emitEvent(path: string, body: unknown) {
  const wsUrl = process.env.WS_INTERNAL_URL || "http://localhost:3001";
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 3000);
  try {
    const res = await fetch(`${wsUrl}${path}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-internal-secret": process.env.INTERNAL_SECRET ?? "",
      },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
    if (!res.ok) {
      console.error(`emitEvent ${path} failed with ${res.status}`);
      return false;
    }
    return true;
  } catch (err) {
    console.error(`emitEvent ${path} failed:`, err);
    return false;
  } finally {
    clearTimeout(timeoutId);
  }
}
