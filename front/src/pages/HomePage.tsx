import { DndContext, type DragEndEvent, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import { useEffect, useState } from "react";
import { updateSession, fetchSessions } from "../api/session";
import Button from "../components/Button";
import CreateSessionForm from "../components/CreateSessionForm";
import Days from "../components/Days";
import Modal from "../components/Modal";
import { useAuth } from "../context/AuthContext";
import type { Day, SessionsByDay } from "../types/interfaces";

const DAYS = ["lun", "mar", "mer", "jeu", "ven", "sam", "dim"] as const;

export default function HomePage() {
  const { logout } = useAuth();
  const [sessions, setSessions] = useState<SessionsByDay | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [selectedDay, setSelectedDay] = useState<Day | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  useEffect(() => {
    fetchSessions()
      .then((data) => setSessions(data))
      .catch((err) => {
        if (err.response?.status === 401) logout();
      });
  }, [logout]);

  const loadSessions = async () => {
    try {
      const data = await fetchSessions();
      setSessions(data);
    } catch {
      logout();
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || !sessions) return;

    const sessionId = active.id as number;
    const sourceDay = DAYS.find((d) => sessions[d].some((s) => s.id === sessionId));
    if (!sourceDay) return;

    const overId = over.id;
    const targetDay = (DAYS as readonly string[]).includes(overId as string)
      ? (overId as Day)
      : DAYS.find((d) => sessions[d].some((s) => s.id === overId));
    if (!targetDay) return;

    if (sourceDay === targetDay) {
      if (active.id === over.id) return;
      const items = sessions[sourceDay];
      const oldIndex = items.findIndex((s) => s.id === active.id);
      const newIndex = items.findIndex((s) => s.id === over.id);
      const reordered = arrayMove(items, oldIndex, newIndex);
      setSessions((prev) => prev ? { ...prev, [sourceDay]: reordered } : prev);
      await Promise.all(reordered.map((s, i) => updateSession(s.id, { position: i })));
    } else {
      const dragged = sessions[sourceDay].find((s) => s.id === sessionId)!;
      const newSource = sessions[sourceDay].filter((s) => s.id !== sessionId);
      const newTarget = [...sessions[targetDay], { ...dragged, day: targetDay }];
      setSessions((prev) => prev ? { ...prev, [sourceDay]: newSource, [targetDay]: newTarget } : prev);
      await updateSession(sessionId, { day: targetDay, position: sessions[targetDay].length });
    }
  };

  return (
    <div className="min-h-screen px-20">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display py-5">Planning semaine</h1>
          <p className="text-gray-600 pb-5">
            Ceci est le planning d'entraînement type de la semaine.
          </p>
        </div>
        <Button
          onClick={() => { setSelectedDay(null); setShowForm(true); }}
          className="bg-indigo-500 hover:bg-indigo-600 text-white font-medium"
        >
          Ajouter une séance
        </Button>
        {showForm && (
          <Modal onClose={() => setShowForm(false)}>
            <CreateSessionForm
              defaultDay={selectedDay ?? undefined}
              onCreated={async () => {
                await loadSessions();
                setShowForm(false);
              }}
            />
          </Modal>
        )}
      </div>
      <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-2 gap-5">
          {DAYS.map((day) => (
            <Days
              key={day}
              day={day}
              sessions={sessions?.[day] ?? []}
              onUpdated={loadSessions}
              onAdd={(d) => { setSelectedDay(d); setShowForm(true); }}
              loading={sessions === null}
            />
          ))}
        </div>
      </DndContext>
    </div>
  );
}
