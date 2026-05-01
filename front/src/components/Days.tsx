import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import type { Day, TDays } from "../types/interfaces";
import SessionCard from "./SessionCard";

const DAY_LABELS: Record<Day, string> = {
  lun: "Lundi",
  mar: "Mardi",
  mer: "Mercredi",
  jeu: "Jeudi",
  ven: "Vendredi",
  sam: "Samedi",
  dim: "Dimanche",
};

const TODAY_MAP: Record<number, Day> = {
  1: "lun", 2: "mar", 3: "mer", 4: "jeu", 5: "ven", 6: "sam", 0: "dim",
};

const today = TODAY_MAP[new Date().getDay()];

function SkeletonCard() {
  return <div className="h-10 bg-gray-700 rounded-lg animate-pulse" />;
}

export default function Days({ day, sessions, onUpdated, onAdd, loading }: TDays) {
  const isToday = day === today;
  const { setNodeRef } = useDroppable({ id: day });

  return (
    <div
      onClick={() => onAdd(day)}
      className={`bg-gray-900 rounded-lg p-5 text-white border-2 cursor-pointer hover:border-indigo-400/60 transition-colors ${isToday ? "border-indigo-400" : "border-transparent"}`}
    >
      <h2 className="font-bold text-lg font-display pb-3">{DAY_LABELS[day]}</h2>
      <div ref={setNodeRef} className="flex flex-col gap-2 min-h-4">
        {loading ? (
          <SkeletonCard />
        ) : (
          <SortableContext items={sessions.map((s) => s.id)} strategy={verticalListSortingStrategy}>
            {sessions.map((session) => (
              <div key={session.id} onClick={(e) => e.stopPropagation()}>
                <SessionCard session={session} onUpdated={onUpdated} />
              </div>
            ))}
          </SortableContext>
        )}
      </div>
    </div>
  );
}
