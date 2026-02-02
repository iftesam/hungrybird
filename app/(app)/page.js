"use client";
import React from "react";
import { DashboardView } from "@/components/views/DashboardView";
import { useAppContext } from "@/components/providers/AppProvider";
import { useRouter } from "next/navigation";

export default function RootDashboardPage() {
  const { isHealthSynced, actions } = useAppContext();
  const router = useRouter();

  return (
    <DashboardView
      isSynced={isHealthSynced}
      onSync={() => actions.setIsHealthSynced(true)}
      onNavigate={(view) => {
        if (view === "schedule") router.push("/Schedule");
        else if (view === "taste-profile") router.push("/TasteProfile");
        else if (view === "history") router.push("/OrderHistory");
        else if (view === "profile") router.push("/Settings");
        else if (view === "dashboard") router.push("/");
      }}
    />
  );
}
