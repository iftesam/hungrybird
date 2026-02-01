import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { HelpCircle, X } from "lucide-react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs) { return twMerge(clsx(inputs)); }

export const InfoTooltip = ({ title, desc, className, iconClassName, align = "center" }) => {
    const [isOpen, setIsOpen] = useState(false);

    // Alignment classes
    const alignClass = {
        left: "left-0",
        center: "left-1/2 -translate-x-1/2",
        right: "right-0"
    }[align];

    return (
        <div className={cn("relative inline-flex items-center", className)}>
            <button
                onClick={(e) => { e.stopPropagation(); setIsOpen(!isOpen); }}
                className="focus:outline-none group"
                aria-label="More Info"
            >
                <HelpCircle className={cn("w-4 h-4 text-gray-300 transition-colors group-hover:text-black", iconClassName)} />
            </button>

            <AnimatePresence>
                {isOpen && (
                    <>
                        {/* Backdrop for click-outside */}
                        <div
                            className="fixed inset-0 z-40 cursor-default"
                            onClick={(e) => { e.stopPropagation(); setIsOpen(false); }}
                        />

                        {/* Popover */}
                        <motion.div
                            initial={{ opacity: 0, y: 8, scale: 0.96 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 8, scale: 0.96 }}
                            transition={{ duration: 0.2, ease: "easeOut" }}
                            className={cn(
                                "absolute top-full mt-3 w-64 p-4 z-50",
                                "bg-gray-900 text-white rounded-2xl shadow-xl shadow-black/10",
                                "border border-gray-800",
                                alignClass
                            )}
                            onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside
                        >
                            {/* Arrow Pointer */}
                            <div className={cn(
                                "absolute -top-1.5 w-3 h-3 bg-gray-900 border-t border-l border-gray-800 transform rotate-45",
                                align === "center" ? "left-1/2 -ml-1.5" : align === "left" ? "left-4" : "right-4"
                            )} />

                            <div className="flex justify-between items-start mb-1">
                                <h4 className="font-bold text-sm tracking-tight text-white">{title}</h4>
                                <button onClick={() => setIsOpen(false)} className="text-gray-500 hover:text-white transition-colors">
                                    <X className="w-3 h-3" />
                                </button>
                            </div>
                            <p className="text-xs text-gray-400 leading-relaxed font-medium">
                                {desc}
                            </p>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
};
