"use client";
import React from "react";
import { AppLayout } from "@/components/AppShell";

export default function AppRouteLayout({ children }) {
    return <AppLayout>{children}</AppLayout>;
}
