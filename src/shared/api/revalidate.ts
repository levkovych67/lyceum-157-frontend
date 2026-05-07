export async function revalidateOnClient(tags: string[]): Promise<void> {
  if (typeof window === "undefined") return;
  await fetch("/api/revalidate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ tags }),
  }).catch(() => {});
}
