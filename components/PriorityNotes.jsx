import React, { useState, useEffect } from "react";
import { Send, StickyNote, Loader2, CheckCircle2, XCircle, AlertCircle, Trash2, Clock, ChevronDown, HelpCircle, Info, Sparkles, Zap, Layers } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { useAppContext } from "@/components/providers/AppProvider";

function cn(...inputs) { return twMerge(clsx(inputs)); }

export const PriorityNotes = () => {
    const { priorityNotes, actions } = useAppContext();
    const [inputText, setInputText] = useState("");
    const [isAdding, setIsAdding] = useState(false);
    const [duration, setDuration] = useState(1); // Default 1 Day
    const [showDurationMenu, setShowDurationMenu] = useState(false);
    const [showHelp, setShowHelp] = useState(false);
    const [expandedFeature, setExpandedFeature] = useState(null);
    const MAX_SLOTS = 3;
    const remainingSlots = MAX_SLOTS - (priorityNotes?.length || 0);

    const DURATIONS = [
        { label: "1 Day", value: 1 },
        { label: "3 Days", value: 3 },
        { label: "5 Days", value: 5 },
        { label: "7 Days", value: 7 },
        { label: "Infinity", value: "infinity" },
    ];

    const handleSubmit = () => {
        if (!inputText.trim()) return;
        actions.addPriorityNote(inputText, duration);
        setInputText("");
        setDuration(1); // Reset
        setIsAdding(false);
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card p-6 md:p-8 rounded-[2.5rem] shadow-xl shadow-black/5 border-white/40 h-full space-y-6"
        >
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 text-gray-900 leading-none">
                    <div className="p-2 bg-amber-50 rounded-xl text-amber-600">
                        <StickyNote className="w-5 h-5" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold tracking-tight">Priority Notes</h3>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">Override Control</p>
                    </div>
                    <div
                        className="relative z-50 ml-1"
                        onMouseEnter={() => setShowHelp(true)}
                        onMouseLeave={() => setShowHelp(false)}
                    >
                        <button
                            onClick={() => setShowHelp(!showHelp)}
                            className="text-gray-400 hover:text-black transition-colors focus:outline-none"
                        >
                            <HelpCircle className="w-4 h-4" />
                        </button>

                        <AnimatePresence>
                            {showHelp && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10, scale: 0.9 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: 10, scale: 0.9 }}
                                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                                    className="absolute left-1/2 -translate-x-1/2 top-full pt-3 w-[300px] z-[100]"
                                >
                                    <div className="relative p-5 bg-black/90 backdrop-blur-xl text-white rounded-[2rem] shadow-[0_10px_40px_-10px_rgba(0,0,0,0.5)] border border-white/10 overflow-hidden group">
                                        <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 via-transparent to-yellow-500/10 pointer-events-none" />
                                        <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-black/90 border-l border-t border-white/10 rotate-45" />

                                        <div className="relative z-10 space-y-3 text-left">
                                            <p className="text-xs leading-relaxed font-light text-gray-300">
                                                Take direct control of your upcoming meals. Priority Notes allow you to override your usual habits with specific requests.
                                            </p>
                                            <div className="h-px bg-white/10 w-full" />
                                            <p className="text-xs leading-relaxed font-light text-gray-300">
                                                Approved notes become <span className="font-bold text-white">Hard Constraints</span> locked into your schedule.
                                            </p>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
                {priorityNotes.length < MAX_SLOTS && !isAdding && (
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setIsAdding(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white text-xs font-bold rounded-full hover:bg-black transition-colors shadow-lg shadow-black/10"
                    >
                        <span>Add Note</span>
                    </motion.button>
                )}
            </div>

            {/* Feature Cards Grid - Collapsible */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <button
                    onClick={() => setExpandedFeature(expandedFeature === "how" ? null : "how")}
                    className={cn(
                        "p-4 rounded-[1.5rem] border transition-all duration-300 flex flex-col gap-2 text-left w-full group overflow-hidden relative",
                        expandedFeature === "how" ? "border-blue-200 bg-blue-50/40" : "bg-gray-50/50 border-gray-100 hover:border-gray-200"
                    )}
                >
                    <div className="flex items-center justify-between w-full relative z-10">
                        <div className="flex items-center gap-2 text-blue-600">
                            <Sparkles className="w-4 h-4" />
                            <span className="text-[11px] font-black uppercase tracking-widest text-gray-900">Usage</span>
                        </div>
                    </div>
                    <AnimatePresence>
                        {expandedFeature === "how" && (
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="relative z-10"
                            >
                                <p className="text-[11px] text-gray-500 font-medium leading-relaxed pt-1">
                                    Specify a craving or a dietary need.
                                </p>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </button>

                <button
                    onClick={() => setExpandedFeature(expandedFeature === "process" ? null : "process")}
                    className={cn(
                        "p-4 rounded-[1.5rem] border transition-all duration-300 flex flex-col gap-2 text-left w-full group overflow-hidden relative",
                        expandedFeature === "process" ? "border-amber-200 bg-amber-50/40" : "bg-gray-50/50 border-gray-100 hover:border-gray-200"
                    )}
                >
                    <div className="flex items-center justify-between w-full relative z-10">
                        <div className="flex items-center gap-2 text-amber-600">
                            <Zap className="w-4 h-4" />
                            <span className="text-[11px] font-black uppercase tracking-widest text-gray-900">Process</span>
                        </div>
                    </div>
                    <AnimatePresence>
                        {expandedFeature === "process" && (
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="relative z-10"
                            >
                                <p className="text-[11px] text-gray-500 font-medium leading-relaxed pt-1">
                                    Approvals take &lt; 1 minute.
                                </p>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </button>

                <button
                    onClick={() => setExpandedFeature(expandedFeature === "limit" ? null : "limit")}
                    className={cn(
                        "p-4 rounded-[1.5rem] border transition-all duration-300 flex flex-col gap-2 text-left w-full group overflow-hidden relative",
                        expandedFeature === "limit" ? "border-purple-200 bg-purple-50/40" : "bg-gray-50/50 border-gray-100 hover:border-gray-200"
                    )}
                >
                    <div className="flex items-center justify-between w-full relative z-10">
                        <div className="flex items-center gap-2 text-purple-600">
                            <Layers className="w-4 h-4" />
                            <span className="text-[11px] font-black uppercase tracking-widest text-gray-900">Slots</span>
                        </div>
                    </div>
                    <AnimatePresence>
                        {expandedFeature === "limit" && (
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="relative z-10"
                            >
                                <p className="text-[11px] text-gray-500 font-medium leading-relaxed pt-1">
                                    {remainingSlots} active slot{remainingSlots === 1 ? '' : 's'} remaining.
                                </p>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </button>
            </div>

            {/* Note List */}
            <div className="space-y-4">
                <AnimatePresence mode="popLayout">
                    {priorityNotes.map((note) => (
                        <motion.div
                            key={note.id}
                            layout
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="bg-white border border-gray-100 rounded-[2rem] p-6 relative overflow-hidden group shadow-sm hover:shadow-md transition-shadow"
                        >
                            {/* Status Badge */}
                            <div className="absolute top-4 right-4 flex items-center gap-2">
                                {note.status === "pending" && (
                                    <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-700 text-[10px] font-black rounded-full uppercase tracking-wider">
                                        <Loader2 className="w-3 h-3 animate-spin" />
                                        Analyzing
                                    </div>
                                )}
                                {note.status === "approved" && (
                                    <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 text-[10px] font-black rounded-full uppercase tracking-wider">
                                        <CheckCircle2 className="w-3 h-3" />
                                        Approved
                                    </div>
                                )}
                                {note.status === "declined" && (
                                    <div className="flex items-center gap-1.5 px-3 py-1 bg-red-50 text-red-700 text-[10px] font-black rounded-full uppercase tracking-wider">
                                        <XCircle className="w-3 h-3" />
                                        Declined
                                    </div>
                                )}

                                <button
                                    onClick={() => actions.removePriorityNote(note.id)}
                                    className="p-2 bg-gray-50 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded-full transition-colors"
                                    title="Discard Note"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>

                            <p className="text-base font-bold text-gray-900 pr-24 leading-snug">
                                "{note.text}"
                            </p>

                            {/* Rejection Reason */}
                            {note.status === "declined" && note.rejectionReason && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: "auto" }}
                                    className="mt-3 p-3 bg-red-50/50 rounded-xl border border-red-100/50 flex items-start gap-2"
                                >
                                    <AlertCircle className="w-3 h-3 text-red-500 shrink-0 mt-0.5" />
                                    <p className="text-[11px] font-medium text-red-600 leading-normal">
                                        {note.rejectionReason}
                                    </p>
                                </motion.div>
                            )}

                            {/* Manual Overrides */}
                            {(note.status === "pending" || note.status === "declined") && (
                                <div className="mt-4 flex items-center gap-2">
                                    <button
                                        onClick={() => actions.approvePriorityNote(note.id)}
                                        className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 text-white text-[10px] font-black rounded-full uppercase tracking-widest hover:bg-emerald-700 shadow-lg shadow-emerald-600/10 transition-all hover:scale-105"
                                    >
                                        <CheckCircle2 className="w-3 h-3" />
                                        Force Approve
                                    </button>
                                    {note.status === "pending" && (
                                        <button
                                            onClick={() => actions.declinePriorityNote(note.id, "Manually declined by user")}
                                            className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 text-gray-600 text-[10px] font-black rounded-full uppercase tracking-widest hover:bg-gray-200 transition-all"
                                        >
                                            <XCircle className="w-3 h-3" />
                                            Decline
                                        </button>
                                    )}
                                </div>
                            )}

                            <div className="mt-4 flex items-center gap-3">
                                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{new Date(note.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                {note.durationLabel && (
                                    <span className="flex items-center gap-1 bg-gray-50 px-2 py-0.5 rounded-full text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                                        <Clock className="w-3 h-3" />
                                        {note.durationLabel}
                                    </span>
                                )}
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>

                {/* Input Form */}
                {isAdding && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-zinc-50 border-2 border-dashed border-zinc-200 rounded-[2.5rem] p-6"
                    >
                        <textarea
                            autoFocus
                            placeholder="I want a burger for dinner tomorrow..."
                            className="w-full text-lg font-bold bg-transparent resize-none outline-none placeholder:text-zinc-300 min-h-[80px]"
                            value={inputText}
                            onChange={(e) => setInputText(e.target.value)}
                        />
                        <div className="flex justify-between items-center mt-6 pt-6 border-t border-zinc-200/50">
                            <div className="relative">
                                <button
                                    onClick={() => setShowDurationMenu(!showDurationMenu)}
                                    className="flex items-center gap-2 text-[10px] font-black text-zinc-500 bg-white border border-zinc-200 px-4 py-2 rounded-full transition-all hover:border-zinc-300"
                                >
                                    <Clock className="w-3.5 h-3.5" />
                                    {DURATIONS.find(d => d.value === duration)?.label.toUpperCase()}
                                    <ChevronDown className="w-3 h-3 opacity-50" />
                                </button>
                                {showDurationMenu && (
                                    <div className="absolute top-full left-0 mt-2 w-32 bg-white border border-zinc-100 shadow-2xl rounded-[1.5rem] overflow-hidden z-10 border-zinc-200">
                                        {DURATIONS.map((opt) => (
                                            <button
                                                key={opt.value}
                                                onClick={() => {
                                                    setDuration(opt.value);
                                                    setShowDurationMenu(false);
                                                }}
                                                className={cn(
                                                    "w-full text-left px-4 py-3 text-[10px] font-black uppercase tracking-widest transition-colors",
                                                    duration === opt.value ? "bg-black text-white" : "text-zinc-500 hover:bg-zinc-50"
                                                )}
                                            >
                                                {opt.label}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className="flex items-center gap-4">
                                <button
                                    onClick={() => setIsAdding(false)}
                                    className="text-[11px] font-black text-zinc-400 hover:text-zinc-900 uppercase tracking-widest"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSubmit}
                                    disabled={!inputText.trim()}
                                    className="flex items-center gap-2 bg-black text-white px-6 py-2.5 rounded-full text-xs font-bold hover:scale-105 transition-all shadow-xl shadow-black/20 disabled:opacity-30 disabled:scale-100"
                                >
                                    <Send className="w-3.5 h-3.5" />
                                    Post
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* Empty State */}
                {priorityNotes.length === 0 && !isAdding && (
                    <motion.div
                        whileHover={{ scale: 0.99 }}
                        onClick={() => setIsAdding(true)}
                        className="h-full min-h-[200px] bg-amber-50/30 rounded-[2.5rem] border-2 border-dashed border-amber-200/50 hover:border-amber-300/50 transition-colors flex flex-col items-center justify-center p-8 text-center group cursor-pointer"
                    >
                        <div className="w-16 h-16 bg-white rounded-full shadow-xl shadow-amber-500/10 flex items-center justify-center text-amber-500 mb-4 group-hover:scale-110 transition-transform">
                            <StickyNote className="w-8 h-8" />
                        </div>
                        <h4 className="text-xl font-black text-amber-900 tracking-tight">Need an adjustment?</h4>
                        <p className="text-sm text-amber-700/60 font-medium max-w-[200px] mt-2 leading-relaxed">
                            Tap to override your schedule with a Priority Note.
                        </p>
                    </motion.div>
                )}
            </div>
        </motion.div>
    );
};
