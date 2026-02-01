"use client";
import React, { useState } from "react";
import RouxBotFullDemo from "@/components/RouxBotFullDemo";
import { AppLayout } from "@/components/AppShell";
import { DashboardView } from "@/components/views/DashboardView";
import { ProfileView } from "@/components/views/ProfileView";

import { ScheduleView } from "@/components/views/ScheduleView";
import { TasteProfileView } from "@/components/views/TasteProfileView";
import { HistoryView } from "@/components/views/HistoryView"; // Import
import { AnimatePresence, motion } from "framer-motion";

export default function Home() {
  const [appState, setAppState] = useState("app"); // Default to 'app' (Dashboard First)
  const [currentView, setCurrentView] = useState("dashboard");
  const [isHealthSynced, setIsHealthSynced] = useState(false); // New State for "Smart Sync"

  // User Profile State (Shared across app)
  // const [userProfile, setUserProfile] = useState(...) - Now managed by AppProvider

  return (
    <div className="bg-black min-h-screen">
      <AnimatePresence mode="wait">
        {appState === "app" && (
          <motion.div
            key="app"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="h-screen bg-white"
          >
            <AppLayout currentView={currentView} onViewChange={setCurrentView}>
              {currentView === "dashboard" && (
                <DashboardView
                  isSynced={isHealthSynced}
                  onSync={() => setIsHealthSynced(true)}
                  onNavigate={setCurrentView}
                />
              )}
              {currentView === "profile" && (
                <ProfileView />
              )}
              {currentView === "schedule" && <ScheduleView />}
              {currentView === "taste-profile" && <TasteProfileView />}
              {currentView === "history" && <HistoryView />}
            </AppLayout>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
