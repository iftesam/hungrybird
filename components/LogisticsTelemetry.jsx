"use client";

import React, { useState, useEffect } from "react";
import { Gauge, Zap, Wind, Navigation } from "lucide-react";

export const LogisticsTelemetry = ({ status = "active", deliveryTime = "12:30 PM" }) => {
    // Simulated Telemetry Data
    const [telemetry, setTelemetry] = useState({
        speed: 15,       // mph (was 24 km/h)
        distance: 7.8,   // miles (was 12.5 km)
    });

    const isDelivered = status === "Delivered";

    useEffect(() => {
        if (isDelivered) {
            // Static telemetry for delivered state
            setTelemetry({
                speed: 0,
                distance: 0
            });
            return;
        }

        const interval = setInterval(() => {
            // Randomize slightly for "live" feel
            setTelemetry(prev => ({
                speed: Math.max(5, Math.min(30, prev.speed + (Math.random() * 2 - 1))), // Adjusted for mph scale
                distance: Math.max(0.1, prev.distance - 0.003), // Adjusted decay for miles
            }));
        }, 1000);
        return () => clearInterval(interval);
    }, [isDelivered]);

    return (
        <div className="w-full">
            {/* Distance Card / Delivery Time */}
            <div className="bg-gray-50 border border-gray-200 p-3 rounded-xl flex flex-col items-center justify-center">
                <div className="flex items-center gap-1.5 text-gray-500 mb-1">
                    {isDelivered ? (
                        <Wind className="w-3.5 h-3.5 text-emerald-500" />
                    ) : (
                        <Navigation className="w-3.5 h-3.5" />
                    )}
                    <span className="text-[10px] font-bold uppercase tracking-wider">
                        {isDelivered ? "Arrived" : "Dist"}
                    </span>
                </div>
                <div className="text-xl font-mono font-bold text-gray-900">
                    {isDelivered ? (
                        <span className="text-sm font-bold">{deliveryTime}</span>
                    ) : (
                        <>
                            {telemetry.distance.toFixed(1)} <span className="text-xs text-gray-500 font-sans">mi</span>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};
