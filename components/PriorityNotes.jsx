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
            className="glass-card p-6 md:p-8 rounded-[2.5rem] shadow-xl shadow-black/5 border-white/40 h-full space-y-6 relative group"
        >
            {/* Background Decoration - Wrapped to prevent tooltip clipping */}
            <div className="absolute inset-0 rounded-[2.5rem] overflow-hidden pointer-events-none">
                <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-bl-[100px] -mr-4 -mt-4 transition-transform group-hover:scale-110" />
            </div>

            <div className="flex items-center justify-between relative z-50">
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
                            className="w-6 h-6 rounded-full flex items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-all"
                        >
                            <HelpCircle className="w-4 h-4" strokeWidth={2} />
                        </button>

                        <AnimatePresence>
                            {showHelp && (
                                <motion.div
                                    initial={{ opacity: 0, y: 8, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: 8, scale: 0.95 }}
                                    transition={{ duration: 0.15, ease: "easeOut" }}
                                    className="absolute left-1/2 -translate-x-1/2 top-full mt-2 w-[280px] z-[100]"
                                >
                                    {/* Material Design Tooltip Card */}
                                    <div className="relative bg-white rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.12),0_8px_16px_rgba(0,0,0,0.08)] p-4 border border-gray-100">
                                        {/* Tooltip arrow */}
                                        <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-white border-l border-t border-gray-100 rotate-45" />

                                        {/* Content */}
                                        <div className="relative z-10 space-y-3">
                                            <p className="text-xs leading-relaxed text-gray-600">
                                                Take direct control of your upcoming meals. Priority Notes allow you to override your usual habits with specific requests.
                                            </p>
                                            <div className="h-px bg-gray-200 w-full" />
                                            <p className="text-xs leading-relaxed text-gray-600">
                                                Approved notes become <span className="font-semibold text-gray-900">Hard Constraints</span> locked into your schedule.
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
                            className="bg-white border border-gray-100 rounded-[2rem] p-6 relative overflow-hidden group shadow-[0_2px_12px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)] transition-all duration-300"
                        >
                            {/* Card Header: Actions & Status */}
                            <div className="flex items-start justify-between mb-4 gap-4">
                                <div className="flex flex-wrap items-center gap-2">
                                    {note.status === "pending" && (
                                        <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-700 text-[10px] font-black rounded-full uppercase tracking-wider border border-amber-100/50">
                                            <Loader2 className="w-3 h-3 animate-spin" />
                                            Analyzing
                                        </div>
                                    )}
                                    {note.status === "approved" && (
                                        <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 text-[10px] font-black rounded-full uppercase tracking-wider border border-emerald-100/50">
                                            <CheckCircle2 className="w-3 h-3" />
                                            Approved
                                        </div>
                                    )}
                                    {note.status === "declined" && (
                                        <div className="flex items-center gap-1.5 px-3 py-1 bg-red-50 text-red-700 text-[10px] font-black rounded-full uppercase tracking-wider border border-red-100/50">
                                            <XCircle className="w-3 h-3" />
                                            Declined
                                        </div>
                                    )}

                                    {note.durationLabel && (
                                        <span className="flex items-center gap-1 bg-gray-50/80 px-2.5 py-1 rounded-full text-[10px] font-bold text-gray-500 uppercase tracking-widest border border-gray-100">
                                            <Clock className="w-3 h-3" />
                                            {note.durationLabel}
                                        </span>
                                    )}
                                </div>

                                <button
                                    onClick={() => actions.removePriorityNote(note.id)}
                                    className="p-2 bg-gray-50 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded-full transition-all duration-200"
                                    title="Discard Note"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>

                            {/* Card Body: The Note Content */}
                            <div className="relative">
                                <p className="text-lg font-bold text-gray-900 leading-[1.4] tracking-tight">
                                    "{note.text}"
                                </p>
                            </div>

                            {/* Rejection Reason - Professional Alert Style */}
                            <AnimatePresence>
                                {note.status === "declined" && note.rejectionReason && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0, marginTop: 0 }}
                                        animate={{ opacity: 1, height: "auto", marginTop: 12 }}
                                        exit={{ opacity: 0, height: 0, marginTop: 0 }}
                                        className="p-4 bg-red-50/50 rounded-2xl border border-red-100/50 flex items-start gap-3"
                                    >
                                        <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                                        <div className="space-y-1">
                                            <p className="text-[10px] font-black text-red-700 uppercase tracking-widest leading-none">Feedback</p>
                                            <p className="text-[11px] font-medium text-red-600/90 leading-relaxed">
                                                {note.rejectionReason}
                                            </p>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>



                            {/* Card Footer: Metadata */}
                            <div className="mt-5 pt-4 border-t border-gray-50 flex items-center justify-start gap-4">
                                <div className="flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-gray-300" />
                                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                                        Posted {new Date(note.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>
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
                            <div className="relative z-[100]">
                                <button
                                    onClick={() => setShowDurationMenu(!showDurationMenu)}
                                    className="flex items-center gap-2 text-[10px] font-black text-zinc-500 bg-white border border-zinc-200 px-4 py-2 rounded-full transition-all hover:border-zinc-300"
                                >
                                    <Clock className="w-3.5 h-3.5" />
                                    {DURATIONS.find(d => d.value === duration)?.label.toUpperCase()}
                                    <ChevronDown className="w-3 h-3 opacity-50" />
                                </button>
                                <AnimatePresence>
                                    {showDurationMenu && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                            className="absolute bottom-full left-0 mb-3 w-40 bg-white border border-zinc-200 shadow-[0_15px_50px_-12px_rgba(0,0,0,0.25)] rounded-[1.5rem] overflow-hidden z-[100]"
                                        >
                                            <div className="p-1.5">
                                                <p className="px-3 py-2 text-[9px] font-black text-zinc-400 uppercase tracking-tighter border-b border-zinc-50 mb-1">Duration</p>
                                                {DURATIONS.map((opt) => (
                                                    <button
                                                        key={opt.value}
                                                        onClick={() => {
                                                            setDuration(opt.value);
                                                            setShowDurationMenu(false);
                                                        }}
                                                        className={cn(
                                                            "w-full text-left px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest transition-all rounded-xl",
                                                            duration === opt.value
                                                                ? "bg-gray-900 text-white shadow-lg shadow-black/10"
                                                                : "text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900"
                                                        )}
                                                    >
                                                        {opt.label}
                                                    </button>
                                                ))}
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
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
