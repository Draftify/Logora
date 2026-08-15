import { backendFetch } from "@/lib/api";

export async function GET() {
  try {
    const res = await backendFetch("/health");
    const data = await res.json();

    return Response.json(data, { status: res.ok ? 200 : 503 });
  } catch {
    return Response.json(
      { status: "unhealthy", redis: "disconnected" },
      { status: 503 },
    );
  }
}
