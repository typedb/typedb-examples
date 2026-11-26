"use server";

import { revalidatePath } from "next/cache";
import { value, writeAll } from "@/lib/typedb";

export type ActionResult = { ok: true } | { ok: false; error: string };

export async function addPerson(name: string, topics: string[]): Promise<ActionResult> {
  name = name.trim();
  if (!name) return { ok: false, error: "Name is required." };
  if (name.length > 100) return { ok: false, error: "Name must be at most 100 characters." };
  if (/[\p{Cc}]/u.test(name)) return { ok: false, error: "Name contains control characters." };

  // `datetime` has no time zone, so send UTC without the trailing "Z".
  const createdAt = new Date().toISOString().replace("Z", "");

  try {
    // One write transaction: create the person, then link each chosen (existing) topic.
    // Values are passed as given rows, not spliced into the query, so no escaping is needed.
    await writeAll([
      {
        tql: `given $name: string, $at: datetime;
              insert $p isa person, has name == $name, has created-at == $at;`,
        given: [{ name: value("string", name), at: value("datetime", createdAt) }],
      },
      ...(topics.length > 0
        ? [{
            tql: `given $name: string, $topic: string;
                  match $p isa person, has name == $name;
                        $t isa topic, has name == $topic;
                  insert interest (fan: $p, subject: $t);`,
            given: topics.map((topic) => ({ name: value("string", name), topic: value("string", topic) })),
          }]
        : []),
    ]);
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    if (message.includes("[CNT9]")) return { ok: false, error: `"${name}" already exists.` };
    console.error(e);
    return { ok: false, error: "Could not save to TypeDB. Check the server logs." };
  }

  revalidatePath("/");
  return { ok: true };
}
