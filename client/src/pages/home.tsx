import React, { useState } from "react";
import { format, addDays, subDays } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Plus, MoreHorizontal, Image as ImageIcon, Trash2, Edit2, CheckCircle2 } from "lucide-react";
import { AppLayout } from "@/components/layout";
import { BottomSheet } from "@/components/bottom-sheet";
import { 
  useTrackers, 
  useFamilies, 
  useTrackerEntries, 
  useToggleTrackerEntry,
  useUpdateTrackerEntry,
  useCreateTracker,
  useDeleteTracker,
  useCreateFamily
} from "@/hooks/use-trackers";
import type { Tracker, TrackerEntry } from "@shared/schema";

const COLORS = [
  "#FF3B30", "#FF9500", "#FFCC00", "#34C759", 
  "#5AC8FA", "#007AFF", "#5856D6", "#AF52DE", "#FF2D55"
];

export default function Home() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const dateStr = format(currentDate, "yyyy-MM-dd");
  
  const { data: families } = useFamilies();
  const { data: trackers } = useTrackers();
  const { data: entries } = useTrackerEntries({ date: dateStr });
  
  const toggleMutation = useToggleTrackerEntry();
  
  const [selectedTracker, setSelectedTracker] = useState<Tracker | null>(null);
  const [isOptionsOpen, setIsOptionsOpen] = useState(false);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [addType, setAddType] = useState<"tracker" | "family">("tracker");

  const handleToggle = (trackerId: number, currentEntry?: TrackerEntry) => {
    toggleMutation.mutate({
      trackerId,
      date: dateStr,
      entryId: currentEntry?.id
    });
  };

  const openAddMenu = () => {
    setIsAddOpen(true);
  };

  const openOptions = (tracker: Tracker) => {
    setSelectedTracker(tracker);
    setIsOptionsOpen(true);
  };

  return (
    <AppLayout>
      {/* Header */}
      <div className="sticky top-0 z-30 glass px-6 pt-safe pb-4 flex items-center justify-between border-b border-border/50">
        <button 
          onClick={() => setCurrentDate(subDays(currentDate, 1))}
          className="p-2 -ml-2 rounded-full hover:bg-secondary transition-colors"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        
        <div className="flex flex-col items-center">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">
            {format(currentDate, "MMMM yyyy")}
          </span>
          <h1 className="text-xl font-bold mt-0.5">
            {format(currentDate, "EEEE, d")}
          </h1>
        </div>

        <button 
          onClick={() => setCurrentDate(addDays(currentDate, 1))}
          className="p-2 -mr-2 rounded-full hover:bg-secondary transition-colors"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      </div>

      {/* Tracker List */}
      <div className="p-6 space-y-8">
        {!trackers?.length ? (
          <div className="flex flex-col items-center justify-center text-center py-20 opacity-60">
            <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mb-4">
              <CheckCircle2 className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="font-semibold text-lg">Aucun tracker pour le moment</h3>
            <p className="text-sm mt-1">Ajoutez votre premier tracker pour commencer.</p>
          </div>
        ) : (
          <div className="space-y-10">
            {/* Sections par familles */}
            {families?.map((family) => {
              const familyTrackers = trackers.filter(t => t.familyId === family.id && !t.isArchived);
              if (familyTrackers.length === 0) return null;

              return (
                <div key={family.id} className="space-y-4">
                  <div className="flex items-center gap-2 px-1">
                    <span className="text-xl">{family.icon}</span>
                    <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">{family.name}</h2>
                  </div>
                  <div className="space-y-4">
                    {familyTrackers.map((tracker) => (
                      <TrackerRow 
                        key={tracker.id} 
                        tracker={tracker} 
                        entry={entries?.find(e => e.trackerId === tracker.id)}
                        onToggle={handleToggle}
                        onOpenOptions={openOptions}
                      />
                    ))}
                  </div>
                </div>
              );
            })}

            {/* Sans catégorie */}
            {trackers.filter(t => !t.familyId && !t.isArchived).length > 0 && (
              <div className="space-y-4">
                <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground px-1">Sans catégorie</h2>
                <div className="space-y-4">
                  {trackers.filter(t => !t.familyId && !t.isArchived).map((tracker) => (
                    <TrackerRow 
                      key={tracker.id} 
                      tracker={tracker} 
                      entry={entries?.find(e => e.trackerId === tracker.id)}
                      onToggle={handleToggle}
                      onOpenOptions={openOptions}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

          <button 
            onClick={openAddMenu}
            className="fixed bottom-24 right-6 w-14 h-14 bg-primary text-primary-foreground rounded-full shadow-lg shadow-primary/30 flex items-center justify-center z-30"
          >
            <Plus className="w-6 h-6" />
          </button>

      {/* Tracker Details Sheet */}
      <TrackerDetailsSheet 
        isOpen={isOptionsOpen} 
        onClose={() => setIsOptionsOpen(false)} 
        tracker={selectedTracker}
        entry={entries?.find(e => e.trackerId === selectedTracker?.id)}
        currentDate={dateStr}
      />

      {/* Add Tracker/Family Sheet */}
      <AddSheet 
        isOpen={isAddOpen} 
        onClose={() => setIsAddOpen(false)} 
        type={addType}
        setType={setAddType}
      />
    </AppLayout>
  );
}

// Subcomponents

function TrackerRow({ tracker, entry, onToggle, onOpenOptions }: any) {
  const isChecked = !!entry;

  return (
    <motion.div 
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center justify-between group"
    >
      <div className="flex items-center gap-4 flex-1">
        <motion.button
          whileTap={{ scale: 0.85 }}
          onClick={() => onToggle(tracker.id, entry)}
          className="relative w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all duration-200"
          style={{ 
            borderColor: tracker.color,
            backgroundColor: isChecked ? tracker.color : 'transparent'
          }}
        >
          {isChecked && (
            <motion.div 
              initial={{ scale: 0 }} 
              animate={{ scale: 1 }} 
              className="w-3 h-3 bg-white rounded-full" 
            />
          )}
        </motion.button>
        
        <div className="flex flex-col">
          <span className={`text-base font-medium transition-colors duration-200 ${isChecked ? 'text-foreground' : 'text-muted-foreground'}`}>
            {tracker.name}
          </span>
          {entry?.note && (
            <span className="text-xs text-muted-foreground line-clamp-1 truncate pr-4">
              📝 {entry.note}
            </span>
          )}
        </div>
      </div>
      
      <button 
        onClick={() => onOpenOptions(tracker)}
        className="p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity focus:opacity-100 text-muted-foreground hover:bg-secondary hover:text-foreground"
      >
        <MoreHorizontal className="w-5 h-5" />
      </button>
    </motion.div>
  );
}

function AddSheet({ isOpen, onClose, type, setType }: any) {
  const createTrackerMutation = useCreateTracker();
  const createFamilyMutation = useCreateFamily();
  const { data: families } = useFamilies();
  
  const [name, setName] = useState("");
  const [color, setColor] = useState(COLORS[0]);
  const [familyId, setFamilyId] = useState<number | null>(null);

  React.useEffect(() => {
    if (!isOpen) {
      setName("");
      setFamilyId(null);
    }
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (type === "tracker") {
      createTrackerMutation.mutate({ 
        name, 
        color, 
        familyId: familyId || undefined,
        order: 0 
      }, {
        onSuccess: () => onClose()
      });
    } else {
      createFamilyMutation.mutate({ 
        name, 
        order: 0 
      }, {
        onSuccess: () => onClose()
      });
    }
  };

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} title={type === "tracker" ? "Nouveau Tracker" : "Nouvelle Famille"}>
      <div className="flex p-1 bg-secondary rounded-xl mb-6">
        <button 
          onClick={() => setType("tracker")}
          className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${type === "tracker" ? "bg-background shadow-sm" : "text-muted-foreground"}`}
        >
          Tracker
        </button>
        <button 
          onClick={() => setType("family")}
          className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${type === "family" ? "bg-background shadow-sm" : "text-muted-foreground"}`}
        >
          Famille
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 pb-6">
        <div className="space-y-2">
          <label className="text-xs font-semibold text-muted-foreground uppercase">Nom</label>
          <input 
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={type === "tracker" ? "ex: Lire 10 pages" : "ex: Sport"}
            className="w-full p-4 bg-card border border-border rounded-xl focus:ring-2 ring-primary/20 outline-none transition-all text-lg"
          />
        </div>

        {type === "tracker" && (
          <>
            <div className="space-y-2">
              <label className="text-xs font-semibold text-muted-foreground uppercase">Famille (optionnel)</label>
              <select 
                value={familyId || ""} 
                onChange={(e) => setFamilyId(e.target.value ? parseInt(e.target.value) : null)}
                className="w-full p-4 bg-card border border-border rounded-xl focus:ring-2 ring-primary/20 outline-none transition-all"
              >
                <option value="">Sans catégorie</option>
                {families?.map(f => (
                  <option key={f.id} value={f.id}>{f.name}</option>
                ))}
              </select>
            </div>

            <div className="space-y-3">
              <label className="text-xs font-semibold text-muted-foreground uppercase">Couleur</label>
              <div className="flex flex-wrap gap-3">
                {COLORS.map(c => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setColor(c)}
                    className={`w-10 h-10 rounded-full flex items-center justify-center transition-transform ${color === c ? 'scale-110 ring-4 ring-offset-2 ring-background' : 'hover:scale-105'}`}
                    style={{ backgroundColor: c }}
                  >
                    {color === c && <div className="w-3 h-3 bg-white rounded-full" />}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}

        <button 
          type="submit"
          disabled={!name.trim() || createTrackerMutation.isPending || createFamilyMutation.isPending}
          className="w-full py-4 bg-primary text-primary-foreground font-bold rounded-xl shadow-lg shadow-primary/20 active:scale-[0.98] transition-all disabled:opacity-50 mt-4"
        >
          {createTrackerMutation.isPending || createFamilyMutation.isPending ? "Création..." : "Créer"}
        </button>
      </form>
    </BottomSheet>
  );
}

function TrackerDetailsSheet({ isOpen, onClose, tracker, entry, currentDate }: any) {
  const updateMutation = useUpdateTrackerEntry();
  const deleteTrackerMutation = useDeleteTracker();
  const [note, setNote] = useState("");

  React.useEffect(() => {
    if (isOpen) setNote(entry?.note || "");
  }, [isOpen, entry]);

  const handleSaveNote = () => {
    if (entry) {
      updateMutation.mutate({ id: entry.id, note });
    }
  };

  const handleDeleteTracker = () => {
    if (tracker && confirm("Êtes-vous sûr ? Cela supprimera le tracker et tout son historique.")) {
      deleteTrackerMutation.mutate(tracker.id);
      onClose();
    }
  };

  if (!tracker) return null;

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} title="Détails du Tracker">
      <div className="space-y-6 pb-6">
        <div className="flex items-center gap-3">
          <div className="w-4 h-4 rounded-full" style={{ backgroundColor: tracker.color }} />
          <h4 className="text-lg font-bold">{tracker.name}</h4>
        </div>
        
        {tracker.description && (
          <p className="text-sm text-muted-foreground bg-secondary/50 p-4 rounded-xl">
            {tracker.description}
          </p>
        )}

        {!entry ? (
          <div className="p-4 bg-secondary/50 rounded-xl text-center text-sm text-muted-foreground">
            Complétez ce tracker pour le {currentDate} pour ajouter une note ou une photo.
          </div>
        ) : (
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-muted-foreground uppercase">Note pour aujourd'hui</label>
              <textarea 
                value={note}
                onChange={(e) => setNote(e.target.value)}
                onBlur={handleSaveNote}
                placeholder="Comment ça s'est passé ?"
                className="w-full p-4 bg-card border border-border rounded-xl focus:ring-2 ring-primary/20 outline-none transition-all resize-none min-h-[100px]"
              />
            </div>
            
            <button className="w-full flex items-center justify-center gap-2 py-3 bg-secondary text-secondary-foreground rounded-xl font-medium hover:bg-secondary/80 transition-colors">
              <ImageIcon className="w-4 h-4" />
              Ajouter une URL photo
            </button>
          </div>
        )}

        <div className="pt-4 border-t border-border space-y-2">
          <button className="w-full flex items-center gap-3 py-3 px-4 rounded-xl hover:bg-secondary transition-colors text-left text-sm font-medium">
            <Edit2 className="w-4 h-4" /> Modifier les paramètres
          </button>
          <button 
            onClick={handleDeleteTracker}
            className="w-full flex items-center gap-3 py-3 px-4 rounded-xl hover:bg-destructive/10 text-destructive transition-colors text-left text-sm font-medium"
          >
            <Trash2 className="w-4 h-4" /> Supprimer le tracker
          </button>
        </div>
      </div>
    </BottomSheet>
  );
}
