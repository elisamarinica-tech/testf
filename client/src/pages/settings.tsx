import React from "react";
import { Moon, Sun, Download, Trash2, ChevronRight, UserCircle } from "lucide-react";
import { AppLayout } from "@/components/layout";
import { useTheme } from "@/hooks/use-theme";
import { useResetData } from "@/hooks/use-trackers";
import { motion } from "framer-motion";

export default function Settings() {
  const { theme, toggleTheme } = useTheme();
  const resetMutation = useResetData();

  const handleReset = () => {
    if (confirm("Are you sure? This will delete ALL data. There is no undo.")) {
      resetMutation.mutate();
    }
  };

  return (
    <AppLayout>
      <div className="px-6 pt-safe pb-4 border-b border-border/50 glass sticky top-0 z-30">
        <h1 className="text-2xl font-bold mt-2">Settings</h1>
      </div>

      <div className="p-6 space-y-8">
        
        {/* Profile Card Mockup */}
        <div className="flex items-center gap-4 p-4 rounded-2xl bg-card border border-border shadow-sm">
          <div className="w-14 h-14 bg-gradient-to-tr from-primary/80 to-primary rounded-full flex items-center justify-center text-primary-foreground shadow-inner">
            <UserCircle className="w-8 h-8" />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-lg">My Journal</h3>
            <p className="text-sm text-muted-foreground">Local device storage</p>
          </div>
        </div>

        {/* Preferences */}
        <div className="space-y-2">
          <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-widest pl-2">Preferences</h4>
          <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
            <button 
              onClick={toggleTheme}
              className="w-full flex items-center justify-between p-4 hover:bg-secondary/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-secondary rounded-lg text-foreground">
                  {theme === 'dark' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
                </div>
                <span className="font-medium">Appearance</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground text-sm">
                {theme === 'dark' ? 'Dark' : 'Light'}
                <ChevronRight className="w-4 h-4 opacity-50" />
              </div>
            </button>
          </div>
        </div>

        {/* Data */}
        <div className="space-y-2">
          <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-widest pl-2">Data & Privacy</h4>
          <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
            <button className="w-full flex items-center justify-between p-4 border-b border-border/50 hover:bg-secondary/50 transition-colors">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-secondary rounded-lg text-foreground">
                  <Download className="w-5 h-5" />
                </div>
                <span className="font-medium">Export Data</span>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground opacity-50" />
            </button>
            <button 
              onClick={handleReset}
              disabled={resetMutation.isPending}
              className="w-full flex items-center justify-between p-4 hover:bg-destructive/5 transition-colors group"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-destructive/10 text-destructive rounded-lg group-hover:bg-destructive/20 transition-colors">
                  <Trash2 className="w-5 h-5" />
                </div>
                <span className="font-medium text-destructive">Erase All Data</span>
              </div>
            </button>
          </div>
          <p className="text-xs text-muted-foreground pl-2 mt-2">
            Data is stored locally in your browser. Clearing your browser data will delete your journal.
          </p>
        </div>

      </div>
    </AppLayout>
  );
}
