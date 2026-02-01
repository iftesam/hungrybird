import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function DynamicIslandDemo() {
    // Toggle this state based on where the user is scrolling in the demo
    const [state, setState] = useState("idle"); // 'idle' | 'delivery' | 'locker'

    return (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50">
            <motion.div
                layout
                className="bg-black text-white rounded-[32px] flex items-center justify-center overflow-hidden shadow-2xl backdrop-blur-md"
                initial={{ width: 120, height: 36 }}
                animate={{
                    width: state === "idle" ? 140 : state === "delivery" ? 320 : 280,
                    height: state === "idle" ? 36 : 60,
                }}
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
            >
                <AnimatePresence mode="wait">

                    {/* STATE 1: Idle / Active */}
                    {state === "idle" && (
                        <motion.div
                            key="idle"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setState("delivery")} // Click to test transition
                            className="flex items-center gap-2 px-4 cursor-pointer"
                        >
                            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                            <span className="text-xs font-medium tracking-wide">RouxBot On</span>
                        </motion.div>
                    )}

                    {/* STATE 2: BirdBot Delivery Tracking */}
                    {state === "delivery" && (
                        <motion.div
                            key="delivery"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            onClick={() => setState("locker")} // Click to test transition
                            className="flex items-center justify-between w-full px-6 cursor-pointer"
                        >
                            <div className="flex items-center gap-3">
                                <div className="bg-white/20 p-1.5 rounded-full">
                                    {/* Robot Icon */}
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-xs text-gray-400">Arriving at Tolliver Hall</span>
                                    <span className="text-sm font-bold">2 min away</span>
                                </div>
                            </div>
                            {/* Progress Bar */}
                            <div className="w-16 h-1 bg-gray-800 rounded-full overflow-hidden">
                                <motion.div
                                    className="h-full bg-orange-500"
                                    initial={{ width: "0%" }}
                                    animate={{ width: "80%" }}
                                    transition={{ duration: 2 }}
                                />
                            </div>
                        </motion.div>
                    )}

                    {/* STATE 3: Locker Unlock Code */}
                    {state === "locker" && (
                        <motion.div
                            key="locker"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setState("idle")} // Click to reset
                            className="flex items-center gap-4 px-6 cursor-pointer"
                        >
                            <span className="text-xs text-gray-400 uppercase tracking-widest">Locker 04</span>
                            <div className="h-4 w-[1px] bg-gray-700" />
                            <span className="font-mono text-lg font-bold text-emerald-400 tracking-widest">8829</span>
                        </motion.div>
                    )}

                </AnimatePresence>
            </motion.div>
        </div>
    );
}
