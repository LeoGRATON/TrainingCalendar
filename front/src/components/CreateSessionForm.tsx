import { useState } from "react";
import { createSession } from "../api/session";
import type { Day, Discipline, TCreateSessionForm } from "../types/interfaces";
import Button from "./Button";

const DAYS: Day[] = ["lun", "mar", "mer", "jeu", "ven", "sam", "dim"];
const DISCIPLINES: Discipline[] = ["swim", "bike", "run", "gym", "rest"];

export default function CreateSessionForm({ onCreated, defaultDay }: TCreateSessionForm) {
  const [day, setDay] = useState<Day>(defaultDay ?? "lun");
  const [discipline, setDiscipline] = useState<Discipline>("run");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await createSession({ day, discipline, description });
      setDescription("");
      await onCreated();
    } catch {
      setError("Erreur lors de la création");
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-indigo-400 transition-colors";

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex gap-3">
        <div className="flex-1 flex flex-col gap-1">
          <label className="text-sm text-gray-400">Jour</label>
          <select
            value={day}
            onChange={(e) => setDay(e.target.value as Day)}
            className={inputClass}
          >
            {DAYS.map((d) => (
              <option key={d} value={d} className="bg-gray-800">
                {d}
              </option>
            ))}
          </select>
        </div>

        <div className="flex-1 flex flex-col gap-1">
          <label className="text-sm text-gray-400">Discipline</label>
          <select
            value={discipline}
            onChange={(e) => setDiscipline(e.target.value as Discipline)}
            className={inputClass}
          >
            {DISCIPLINES.map((d) => (
              <option key={d} value={d} className="bg-gray-800">
                {d}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-sm text-gray-400">Description</label>
        <input
          type="text"
          placeholder="Optionnel"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className={inputClass}
        />
      </div>

      {error && <p className="text-red-400 text-sm">{error}</p>}

      <Button
        type="submit"
        loading={loading}
        className="w-full bg-indigo-500 hover:bg-indigo-600 text-white font-medium py-2"
      >
        Ajouter la séance
      </Button>
    </form>
  );
}
