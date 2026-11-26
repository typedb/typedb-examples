import Link from "next/link";
import { read } from "@/lib/typedb";
import { AddPersonForm } from "./add-person-form";

// Query TypeDB on every request rather than at build time.
export const dynamic = "force-dynamic";

type Person = { name: string; topics: { name: string }[] };

export default async function Home() {
  const [people, topics] = await Promise.all([
    read(`
      match $p isa person, has name $n;
      sort $n;
      fetch {
        "name": $n,
        "topics": [
          match interest (fan: $p, subject: $t);
          fetch { "name": $t.name };
        ]
      };
    `) as Promise<Person[]>,
    read(`match $t isa topic, has name $n; sort $n; fetch { "name": $n };`) as Promise<{ name: string }[]>,
  ]);

  return (
    <main className="space-y-8">
      <ul className="divide-y divide-gray-200">
        {people.map((p) => (
          <li key={p.name} className="flex items-baseline justify-between py-2">
            <Link href={`/people/${encodeURIComponent(p.name)}`} className="font-medium hover:underline">
              {p.name}
            </Link>
            <span className="text-sm text-gray-500">{p.topics.map((t) => t.name).join(", ") || "—"}</span>
          </li>
        ))}
      </ul>
      <AddPersonForm topics={topics.map((t) => t.name)} />
    </main>
  );
}
