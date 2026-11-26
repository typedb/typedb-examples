import { errorMessage, getDriver, unwrap } from "@/lib/typedb";

// Checks that the app can reach TypeDB: useful as a first request after deploying.
export const dynamic = "force-dynamic";

export async function GET() {
  const driver = getDriver();
  try {
    unwrap(await driver.health());
    const version = unwrap(await driver.version());
    return Response.json({ ok: true, typedb: version });
  } catch (e) {
    return Response.json({ ok: false, error: errorMessage(e) }, { status: 503 });
  }
}
