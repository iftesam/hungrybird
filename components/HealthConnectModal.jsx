import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Activity, Heart, Moon, CheckCircle, ChevronRight, Apple } from "lucide-react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs) { return twMerge(clsx(inputs)); }

export const HealthConnectModal = ({ isOpen, onClose, onSyncComplete }) => {
    const [step, setStep] = useState("idle"); // idle, connecting, complete
    const [progress, setProgress] = useState(0);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        if (step === "connecting") {
            const interval = setInterval(() => {
                setProgress(prev => {
                    if (prev >= 100) {
                        clearInterval(interval);
                        setStep("complete");
                        setTimeout(() => onSyncComplete(), 1500);
                        return 100;
                    }
                    return prev + 2;
                });
            }, 30);
            return () => clearInterval(interval);
        }
        if (!isOpen) {
            setStep("idle");
            setProgress(0);
        }
    }, [step, isOpen]);

    if (!mounted) return null;

    return createPortal(
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                    />

                    <motion.div
                        initial={{ scale: 0.95, opacity: 0, y: 50 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.95, opacity: 0, y: 50 }}
                        className="relative w-full max-w-md bg-[#F2F2F7] rounded-[32px] overflow-hidden shadow-2xl origin-bottom z-10"
                    >
                        {/* iOS Style Header */}
                        <div className="bg-white p-6 pb-4 border-b border-gray-200">
                            <div className="flex items-center justify-between mb-2">
                                <h2 className="text-xl font-bold tracking-tight">Health Access</h2>
                                <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center text-white">
                                    <Activity className="w-5 h-5" />
                                </div>
                            </div>
                            <p className="text-[15px] leading-snug text-gray-500">
                                "<span className="text-[#FA651E] font-bold">HungryBird</span>" would like to access and update your Health data to optimize nutrition recommendations.
                            </p>
                        </div>

                        {/* Content Area */}
                        <div className="p-0">
                            {/* Category List (iOS Table View Style) */}
                            <div className="mt-6 mx-5 bg-white rounded-xl overflow-hidden divide-y divide-gray-100">
                                <PermissionRow
                                    icon={Activity}
                                    color="text-orange-500"
                                    bg="bg-orange-500"
                                    label="Active Energy"
                                    isOn={true}
                                />
                                <PermissionRow
                                    icon={Heart}
                                    color="text-rose-500"
                                    bg="bg-rose-500"
                                    label="Heart Rate & HRV"
                                    isOn={true}
                                />
                                <PermissionRow
                                    icon={Moon}
                                    color="text-indigo-500"
                                    bg="bg-indigo-500"
                                    label="Sleep Analysis"
                                    isOn={true}
                                />
                            </div>

                            <p className="mx-6 mt-3 text-xs text-gray-400">
                                <span className="text-[#FA651E] font-semibold">HungryBird</span> uses this data to calculate your Recovery Score and TDEE.
                            </p>
                        </div>

                        {/* Footer Action */}
                        <div className="p-6 mt-4">
                            {step === "idle" && (
                                <div className="grid grid-cols-2 gap-3">
                                    <button
                                        onClick={onClose}
                                        className="py-3.5 text-[17px] font-semibold text-gray-500 bg-white rounded-xl hover:bg-gray-50 transition-colors"
                                    >
                                        Don't Allow
                                    </button>
                                    <button
                                        onClick={() => setStep("connecting")}
                                        className="py-3.5 text-[17px] font-semibold text-white bg-[#007AFF] rounded-xl hover:bg-[#0071eb] transition-colors shadow-sm"
                                    >
                                        Allow
                                    </button>
                                </div>
                            )}

                            {step === "connecting" && (
                                <div className="bg-white rounded-xl p-4 flex flex-col items-center justify-center h-[72px]">
                                    <div className="flex items-center gap-3">
                                        <div className="relative w-6 h-6">
                                            <svg className="animate-spin w-full h-full text-[#007AFF]" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                        </div>
                                        <span className="text-[17px] font-semibold text-[#007AFF]">Syncing...</span>
                                    </div>
                                </div>
                            )}

                            {step === "complete" && (
                                <div className="bg-emerald-50 rounded-xl p-4 flex flex-col items-center justify-center h-[72px]">
                                    <div className="flex items-center gap-2 text-emerald-600">
                                        <CheckCircle className="w-6 h-6 fill-emerald-600 text-white" />
                                        <span className="text-[17px] font-bold">Access Granted</span>
                                    </div>
                                </div>
                            )}
                        </div>

                    </motion.div>
                </div>
            )}
        </AnimatePresence>,
        document.body
    );
};

const PermissionRow = ({ icon: Icon, label, isOn, bg }) => (
    <div className="flex items-center justify-between p-4">
        <div className="flex items-center gap-3">
            <div className={`w-7 h-7 rounded px-[5px] py-1 ${bg} flex items-center justify-center shadow-sm`}>
                <Icon className="w-full h-full text-white" strokeWidth={3} />
            </div>
            <span className="text-[17px] font-medium text-gray-900">{label}</span>
        </div>
        {/* iOS Switch Mock */}
        <div className={`w-[51px] h-[31px] rounded-full p-0.5 transition-colors ${isOn ? "bg-[#34C759]" : "bg-[#E9E9EA]"}`}>
            <div className={`w-[27px] h-[27px] bg-white rounded-full shadow-sm transform transition-transform ${isOn ? "translate-x-5" : "translate-x-0"}`} />
        </div>
    </div>
);
