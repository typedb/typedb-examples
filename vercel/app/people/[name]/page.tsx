import Link from "next/link";
import { notFound } from "next/navigation";
import { read } from "@/lib/typedb";

export const dynamic = "force-dynamic";

type Person = { name: string; createdAt: string | null; topics: { name: string }[] };

export default async function PersonPage({ params }: { params: Promise<{ name: string }> }) {
  const name = decodeURIComponent((await params).name);

  // A parameterised read: the URL segment is bound to $name as a given row, never spliced into the query.
  const [person] = (await read(
    `given $name: string;
     match $p isa person, has name == $name;
     fetch {
       "name": $p.name,
       "createdAt": $p.created-at,
       "topics": [
         match interest (fan: $p, subject: $t);
         fetch { "name": $t.name };
       ]
     };`,
    [{ name }],
  )) as Person[];
  if (!person) notFound();

  return (
    <main className="space-y-4">
      <h1 className="text-xl font-semibold">{person.name}</h1>
      {person.createdAt && <p className="text-sm text-gray-500">Joined {person.createdAt.slice(0, 10)}</p>}
      <ul className="list-inside list-disc">
        {person.topics.map((t) => (
          <li key={t.name}>{t.name}</li>
        ))}
        {person.topics.length === 0 && <li className="list-none text-gray-500">No interests yet.</li>}
      </ul>
      <Link href="/" className="text-sm hover:underline">
        ← All people
      </Link>
    </main>
  );
}
