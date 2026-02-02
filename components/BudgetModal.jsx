import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, X, ArrowUpRight, CheckCircle2 } from "lucide-react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs) { return twMerge(clsx(inputs)); }

export const BudgetModal = ({ isOpen, onClose, onConfirm, currentLimit, newTotal, mealCost }) => {
    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
                {/* Backdrop */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                />

                {/* Modal Content */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    className="relative w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border border-gray-100"
                >
                    {/* Top Decorative Banner */}
                    <div className="h-32 bg-gradient-to-br from-amber-400 via-orange-500 to-red-600 relative overflow-hidden">
                        <div className="absolute inset-0 opacity-20">
                            <div className="absolute top-2 left-4 w-20 h-20 border-2 border-white rounded-full" />
                            <div className="absolute bottom-2 right-8 w-16 h-16 border-2 border-white rounded-full" />
                        </div>
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center">
                                <AlertTriangle className="w-8 h-8 text-white" />
                            </div>
                        </div>
                    </div>

                    <div className="p-8 pt-6">
                        <div className="text-center mb-8">
                            <h2 className="text-2xl font-black text-gray-900 mb-2 font-display">Daily Budget Alert</h2>
                            <p className="text-gray-500 text-sm font-medium leading-relaxed">
                                Adding this meal <span className="text-gray-900 font-bold">(+${mealCost.toFixed(2)})</span> will push your daily spend to <span className="text-red-600 font-bold">${newTotal.toFixed(2)}</span>, which is above your <span className="text-gray-900 font-bold">${currentLimit.toFixed(2)}</span> limit.
                            </p>
                        </div>

                        {/* Comparison Card */}
                        <div className="bg-gray-50 rounded-3xl p-6 mb-8 border border-gray-100 flex items-center justify-between">
                            <div className="text-center">
                                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Current Limit</div>
                                <div className="text-lg font-bold text-gray-900">${currentLimit.toFixed(2)}</div>
                            </div>
                            <div className="flex flex-col items-center">
                                <div className="w-8 h-8 bg-black text-white rounded-full flex items-center justify-center shadow-lg -mt-1">
                                    <ArrowUpRight className="w-4 h-4" />
                                </div>
                            </div>
                            <div className="text-center">
                                <div className="text-[10px] font-bold text-amber-600 uppercase tracking-widest mb-1">New Peak</div>
                                <div className="text-lg font-bold text-gray-900">${newTotal.toFixed(2)}</div>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <button
                                onClick={onConfirm}
                                className="w-full h-14 bg-black text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-gray-800 transition-all active:scale-[0.98] shadow-xl shadow-black/10 group"
                            >
                                <CheckCircle2 className="w-5 h-5 group-hover:scale-110 transition-transform" />
                                Yes, Increase Budget for Today
                            </button>
                            <button
                                onClick={onClose}
                                className="w-full h-14 bg-gray-50 text-gray-500 rounded-2xl font-bold hover:bg-gray-100 transition-all active:scale-[0.98]"
                            >
                                No, Cancel
                            </button>
                        </div>

                        <p className="mt-6 text-[10px] text-center text-gray-400 font-medium px-4 leading-relaxed">
                            This updates the limit <span className="text-gray-600 font-bold">only for the current day</span>, preventing future failed checks today.
                        </p>
                    </div>

                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-black/10 hover:bg-black/20 transition-colors"
                    >
                        <X className="w-4 h-4 text-white" />
                    </button>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};
