"use client";

import React from "react";
import { motion } from "framer-motion";
import { MapPin, Navigation, Bike, Compass, Truck } from "lucide-react";

export const DeliveryMap = ({ status = "active" }) => {
    // If delivered, car stays at the end (100%)
    // If active, it loops
    const isDelivered = status === "Delivered";

    return (
        <div className="w-full h-[450px] bg-[#0F172A] rounded-3xl relative overflow-hidden shadow-2xl border border-gray-800 group">

            {/* 1. Dark Mode Map Background */}
            <div className="absolute inset-0 opacity-20">
                <svg className="w-full h-full" preserveAspectRatio="none">
                    {/* Dark/Night Mode Effect Roads */}
                    <path d="M-50 100 Q 200 120 400 300 T 900 350" stroke="#334155" strokeWidth="40" fill="none" />
                    <path d="M500 -50 L 500 600" stroke="#334155" strokeWidth="30" fill="none" />
                    <path d="M-10 400 L 800 400" stroke="#334155" strokeWidth="20" fill="none" />
                    {/* Secondary Roads */}
                    <path d="M200 0 L 200 600" stroke="#1E293B" strokeWidth="15" fill="none" />
                    <path d="M0 200 L 800 200" stroke="#1E293B" strokeWidth="15" fill="none" />
                </svg>
            </div>

            {/* 2. 3D Building Simulations (Dark Blocks) */}
            <div className="absolute top-20 left-20 w-32 h-32 bg-[#1E293B] rounded-lg shadow-2xl" />
            <div className="absolute top-60 right-40 w-40 h-40 bg-[#1E293B] rounded-lg shadow-2xl" />
            <div className="absolute bottom-10 left-60 w-24 h-48 bg-[#1E293B] rounded-lg shadow-2xl" />

            {/* 3. The Delivery Route (Glowing Path) */}
            {/* 3. The Delivery Route (Classy & Animated) */}
            {/* 3. The Delivery Route (Google Maps Style) */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none">
                {/* Outline (Darker Blue/Grey for contrast) */}
                <path
                    d="M 50 120 Q 250 140 400 300 T 600 350"
                    stroke="#1e3a8a" // dark blue outline
                    strokeWidth="10"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="opacity-50"
                />

                {/* Main Route (Standard Google Maps Blue) */}
                <path
                    d="M 50 120 Q 250 140 400 300 T 600 350"
                    stroke="#4285F4" // Google Maps Blue
                    strokeWidth="6"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="border-2 border-white drop-shadow-lg"
                />
            </svg>

            {/* 4. Professional Top-Down Car with Advanced Lighting */}
            <motion.div
                className="absolute z-20 flex items-center justify-center w-12 h-12"
                initial={isDelivered ? { offsetDistance: "100%" } : { offsetDistance: "0%" }}
                animate={isDelivered ? { offsetDistance: "100%" } : {
                    offsetDistance: ["0%", "100%"],
                }}
                style={{
                    offsetPath: "path('M 50 120 Q 250 140 400 300 T 600 350')",
                    offsetRotate: "auto 0deg" // 0deg aligns correctly with the path direction for this SVG
                }}
                transition={isDelivered ? { duration: 0 } : {
                    duration: 3600, // 60 minutes (1 hour) per loop
                    repeat: Infinity,
                    ease: "linear"
                }}
            >
                {/* Real-time Shadows */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-8 bg-black/40 blur-md rounded-full transform rotate-90 translate-y-4" />

                {/* Headlights Beam (Dual Cone) */}
                <div className="absolute top-1/2 left-full -translate-y-1/2 -translate-x-2 w-32 h-20 origin-left flex flex-col justify-center opacity-40 mix-blend-screen pointer-events-none">
                    <div className="w-full h-full bg-gradient-to-r from-blue-400/30 via-blue-500/10 to-transparent blur-sm transform -skew-y-3 scale-y-75" />
                    <div className="absolute top-0 w-full h-full bg-gradient-to-r from-blue-400/30 via-blue-500/10 to-transparent blur-sm transform skew-y-3 scale-y-75" />
                </div>

                {/* Truck Icon & Label */}
                <div className="relative z-10 flex flex-col items-center">
                    <div className="w-12 h-12 bg-white rounded-xl shadow-[0_0_30px_rgba(255,255,255,0.3)] flex items-center justify-center relative transform -scale-x-100">
                        {/* -scale-x-100 flips the truck to face LEFT if needed, but standard lucide Truck faces RIGHT. 
                           If the path goes Left->Right, we want it facing Right. 
                           Standard icon faces Right. 
                           Previous offsetRotate=auto 0deg aligns X axis to path.
                           So no transform needed for direction, maybe just for style? 
                           Actually, let's keep it simple. Standard Truck faces right. 
                        */}
                        <Truck className="w-6 h-6 text-gray-900" />
                        {/* Hub Pulse - hardcoded for dashboard to match active feel */}
                        <div className="absolute inset-0 rounded-xl animate-ping opacity-30 bg-emerald-500"></div>
                    </div>
                    <div className="absolute top-full mt-2 px-2 py-0.5 bg-black/80 backdrop-blur rounded text-[8px] font-bold text-white uppercase tracking-wider whitespace-nowrap border border-white/10 shadow-lg">
                        Fulfiller
                    </div>
                </div>
            </motion.div>

            {/* 5. Destination Pin (Pulsing Radar) */}
            <div className="absolute top-[330px] left-[600px] -translate-x-1/2 -translate-y-full z-10">
                <div className="relative flex flex-col items-center">
                    {/* Radar Waves */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 bg-emerald-500/20 rounded-full animate-ping" />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 bg-emerald-500/40 rounded-full animate-pulse" />

                    {/* Pin */}
                    <MapPin className="relative w-8 h-8 text-emerald-500 fill-emerald-500 drop-shadow-[0_4px_8px_rgba(16,185,129,0.4)]" />

                    {/* Label */}
                    <div className="mt-2 px-3 py-1 bg-black/60 backdrop-blur-md rounded-full border border-white/10 text-[10px] font-bold text-white uppercase tracking-wider">
                        Destination
                    </div>
                </div>
            </div>

            {/* 6. Compass Overlay */}
            <div className="absolute bottom-6 right-6 p-2 bg-black/50 backdrop-blur rounded-full border border-white/10">
                <Compass className="w-6 h-6 text-gray-400" />
            </div>

            {/* Grid Overlay for Tech Feel */}
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 mix-blend-overlay pointer-events-none"></div>
        </div>
    );
};
