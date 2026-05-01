import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Pencil, Trash2 } from "lucide-react";
import { useState } from "react";
import { deleteSession, updateSession } from "../api/session";
import type { Day, Discipline, TSessionCard } from "../types/interfaces";
import Button from "./Button";

const DAYS: Day[] = ["lun", "mar", "mer", "jeu", "ven", "sam", "dim"];
const DISCIPLINES: Discipline[] = ["swim", "bike", "run", "gym", "rest"];

const inputClass =
  "w-full bg-gray-700 border border-gray-600 rounded px-2 py-1 text-white text-sm focus:outline-none focus:border-indigo-400 transition-colors";

export default function SessionCard({ session, onUpdated }: TSessionCard) {
  const [editing, setEditing] = useState(false);
  const [day, setDay] = useState<Day>(session.day);
  const [discipline, setDiscipline] = useState<Discipline>(session.discipline);
  const [description, setDescription] = useState(session.description ?? "");
  const [loading, setLoading] = useState(false);

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: session.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  const handleDelete = async () => {
    setLoading(true);
    try {
      await deleteSession(session.id);
      await onUpdated();
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await updateSession(session.id, { day, discipline, description });
      setEditing(false);
      await onUpdated();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div ref={setNodeRef} style={style} className="bg-gray-600 rounded-lg p-3 text-white">
      {editing ? (
        <form onSubmit={handleUpdate} className="flex flex-col gap-2">
          <div className="flex gap-2">
            <select value={day} onChange={(e) => setDay(e.target.value as Day)} className={inputClass}>
              {DAYS.map((d) => (
                <option key={d} value={d} className="bg-gray-700">{d}</option>
              ))}
            </select>
            <select value={discipline} onChange={(e) => setDiscipline(e.target.value as Discipline)} className={inputClass}>
              {DISCIPLINES.map((d) => (
                <option key={d} value={d} className="bg-gray-700">{d}</option>
              ))}
            </select>
          </div>
          <input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Description"
            className={inputClass}
          />
          <div className="flex gap-2">
            <Button type="submit" loading={loading} className="flex-1 bg-indigo-500 hover:bg-indigo-600">
              Sauvegarder
            </Button>
            <Button type="button" disabled={loading} onClick={() => setEditing(false)} className="flex-1 bg-gray-500 hover:bg-gray-400">
              Annuler
            </Button>
          </div>
        </form>
      ) : (
        <div className="flex items-center gap-2">
          <div {...attributes} {...listeners} className="cursor-grab text-gray-400 hover:text-white transition-colors shrink-0">
            <GripVertical size={16} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold capitalize">{session.discipline}</p>
            {session.description && (
              <p className="text-gray-300 text-sm truncate">{session.description}</p>
            )}
          </div>
          <div className="flex gap-1 shrink-0">
            <Button onClick={() => setEditing(true)} className="p-1 hover:bg-white/20">
              <Pencil size={14} />
            </Button>
            <Button onClick={handleDelete} loading={loading} className="p-1 hover:bg-red-500/50">
              <Trash2 size={14} />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
