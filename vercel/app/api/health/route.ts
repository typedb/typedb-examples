import { getDriver, unwrap } from "@/lib/typedb";

// Runs on the Edge runtime: proof that the HTTP driver needs nothing beyond `fetch`.
export const runtime = "edge";
export const dynamic = "force-dynamic";

export async function GET() {
  const driver = getDriver();
  try {
    unwrap(await driver.health());
    const version = unwrap(await driver.version());
    return Response.json({ ok: true, runtime: "edge", typedb: version });
  } catch (e) {
    return Response.json({ ok: false, error: e instanceof Error ? e.message : String(e) }, { status: 503 });
  }
}
