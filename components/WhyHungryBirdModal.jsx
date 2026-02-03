"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, ArrowRight, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export const WhyHungryBirdModal = () => {
    const pathname = usePathname();
    const [isVisible, setIsVisible] = React.useState(true);

    // Hide if on the WhyHungryBird page itself
    if (pathname === "/WhyHungryBird") return null;

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 20 }}
                    transition={{
                        type: "spring",
                        stiffness: 400,
                        damping: 30,
                        delay: 1
                    }}
                    className="fixed bottom-4 right-4 md:bottom-8 md:right-8 z-[2000] group w-[calc(100%-2rem)] md:w-auto md:max-w-sm"
                >
                    <div className="relative">
                        {/* Premium Glow Effect */}
                        <div className="absolute -inset-0.5 bg-gradient-to-r from-[#4285F4] via-[#EA4335] via-[#FBBC04] to-[#34A853] rounded-[2rem] blur opacity-20 group-hover:opacity-40 transition duration-1000 group-hover:duration-200 animate-gradient-x" />

                        <div className="relative flex flex-col items-start gap-4 p-5 md:p-6 bg-white/80 backdrop-blur-xl border border-white/20 rounded-[2.5rem] md:rounded-[2rem] shadow-2xl overflow-hidden">
                            {/* Decorative Background Elements */}
                            <div className="absolute -top-10 -right-10 w-32 h-32 bg-orange-500/5 rounded-full blur-3xl pointer-events-none" />
                            <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />

                            <div className="flex items-center justify-between w-full">
                                <div className="flex items-center gap-2 px-3 py-1 bg-gray-100/50 rounded-full">
                                    <Sparkles className="w-3 h-3 md:w-3.5 md:h-3.5 text-[#FBBC04]" />
                                    <span className="text-[9px] md:text-[10px] font-bold text-gray-500 uppercase tracking-widest">Discover</span>
                                </div>
                                <button
                                    onClick={() => setIsVisible(false)}
                                    className="p-1.5 hover:bg-gray-100 rounded-full transition-colors text-gray-400 hover:text-gray-900"
                                >
                                    <X className="w-3.5 h-3.5" />
                                </button>
                            </div>

                            <div className="space-y-1 relative z-10 pr-4">
                                <h3 className="text-lg md:text-xl font-black text-gray-900 tracking-tight leading-tight">
                                    Why <span className="text-[#FA651E]">HungryBird?</span>
                                </h3>
                                <p className="text-xs md:text-sm text-gray-500 font-medium leading-snug">
                                    The "Double Processing" Tax <br className="hidden md:block" /> and the science of Assurance.
                                </p>
                            </div>

                            <Link href="/WhyHungryBird" className="w-full">
                                <motion.button
                                    whileHover={{ x: 5 }}
                                    whileTap={{ scale: 0.98 }}
                                    className="flex items-center justify-between w-full px-5 py-3 md:py-3.5 bg-black text-white rounded-2xl text-xs md:text-sm font-bold shadow-lg shadow-black/10 group/btn"
                                >
                                    <span>Learn the Story</span>
                                    <ArrowRight className="w-4 h-4 text-white/50 group-hover/btn:text-white transition-colors" />
                                </motion.button>
                            </Link>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};
