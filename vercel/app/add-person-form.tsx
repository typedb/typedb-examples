"use client";

import { useActionState } from "react";
import { addPerson, type ActionResult } from "./actions";

export function AddPersonForm({ topics }: { topics: string[] }) {
  const [state, formAction, pending] = useActionState(
    async (_prev: ActionResult | null, form: FormData) =>
      addPerson(String(form.get("name") ?? ""), form.getAll("topic").map(String)),
    null,
  );

  return (
    <form action={formAction} className="space-y-3 rounded border border-gray-200 p-4">
      <h2 className="font-medium">Add a person</h2>
      <input name="name" placeholder="Name" required className="w-full rounded border border-gray-300 px-2 py-1" />
      <div className="flex flex-wrap gap-3 text-sm">
        {topics.map((t) => (
          <label key={t} className="flex items-center gap-1">
            <input type="checkbox" name="topic" value={t} /> {t}
          </label>
        ))}
      </div>
      <button disabled={pending} className="rounded bg-gray-900 px-3 py-1 text-white disabled:opacity-50">
        {pending ? "Saving…" : "Add"}
      </button>
      {state && !state.ok && <p className="text-sm text-red-600">{state.error}</p>}
    </form>
  );
}
