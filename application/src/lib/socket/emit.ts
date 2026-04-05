export async function emitEvent(path: string, body: unknown) {
  const wsUrl = process.env.WS_INTERNAL_URL || "http://localhost:3001";
  try {
    await fetch(`${wsUrl}${path}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-internal-secret": process.env.INTERNAL_SECRET ?? "",
      },
      body: JSON.stringify(body),
    });
  } catch (err) {
    console.error(`emitEvent ${path} failed:`, err);
  }
}
