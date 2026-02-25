import React from "react";
import { Link, useLocation } from "wouter";
import { CheckCircle2, Calendar, Settings } from "lucide-react";
import { motion } from "framer-motion";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function AppLayout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();

  const navItems = [
    { path: "/", icon: CheckCircle2, label: "Tracker" },
    { path: "/calendar", icon: Calendar, label: "Calendar" },
    { path: "/settings", icon: Settings, label: "Settings" },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center sm:p-4 bg-neutral-100 dark:bg-neutral-950">
      {/* Mobile Frame Container */}
      <div className="w-full h-screen sm:max-w-[420px] sm:h-[850px] bg-background sm:rounded-[2.5rem] sm:shadow-2xl sm:border border-border relative overflow-hidden flex flex-col">
        
        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto pb-24">
          {children}
        </main>

        {/* Bottom Navigation */}
        <div className="absolute bottom-0 w-full glass border-t border-border px-6 pb-safe pt-3 flex justify-between items-center z-40">
          {navItems.map((item) => {
            const isActive = location === item.path;
            return (
              <Link 
                key={item.path} 
                href={item.path}
                className="relative flex flex-col items-center justify-center w-16 h-12"
              >
                <motion.div
                  whileTap={{ scale: 0.85 }}
                  className={cn(
                    "flex flex-col items-center justify-center gap-1 transition-colors duration-300",
                    isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <item.icon className={cn("w-6 h-6", isActive && "fill-primary/10")} strokeWidth={isActive ? 2.5 : 2} />
                  <span className="text-[10px] font-medium tracking-wide">{item.label}</span>
                  
                  {isActive && (
                    <motion.div 
                      layoutId="nav-indicator"
                      className="absolute -top-3 w-8 h-1 bg-primary rounded-full"
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
                </motion.div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
