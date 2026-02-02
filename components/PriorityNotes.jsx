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
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-gray-900 leading-none">
                    <div className="p-1 bg-yellow-100 rounded-md text-yellow-600">
                        <StickyNote className="w-4 h-4" />
                    </div>
                    <h3 className="text-sm font-bold uppercase tracking-wider">Priority Notes</h3>
                    <div
                        className="relative z-50"
                        onMouseEnter={() => setShowHelp(true)}
                        onMouseLeave={() => setShowHelp(false)}
                    >
                        <button
                            onClick={() => setShowHelp(!showHelp)}
                            className="ml-2 text-gray-400 hover:text-black transition-colors focus:outline-none"
                        >
                            <HelpCircle className="w-3.5 h-3.5" />
                        </button>

                        <AnimatePresence>
                            {showHelp && (
                                <motion.div
                                    initial={{ opacity: 0, y: 5, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: 5, scale: 0.95 }}
                                    transition={{ duration: 0.2, ease: "easeOut" }}
                                    className="absolute left-1/2 -translate-x-1/2 top-full pt-2 w-[280px] z-[100]"
                                >
                                    <div className="relative p-4 bg-gray-900/95 backdrop-blur-sm text-white rounded-2xl shadow-2xl shadow-black/20 border border-white/10">
                                        {/* Arrow */}
                                        <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-gray-900/95 border-l border-t border-white/10 rotate-45" />

                                        <div className="relative z-10 space-y-2">
                                            <p className="text-xs leading-relaxed font-light text-gray-300">
                                                Take direct control of your upcoming meals. Priority Notes allow you to override your usual habits with specific requests.
                                            </p>
                                            <div className="h-px bg-white/10 w-full" />
                                            <p className="text-xs leading-relaxed font-light text-gray-300">
                                                Once approved, these notes become <span className="font-bold text-white">Hard Constraints</span>—meaning they are locked into your schedule before anything else.
                                            </p>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
                {priorityNotes.length < 3 && !isAdding && (
                    <button
                        onClick={() => setIsAdding(true)}
                        className="text-[10px] font-bold bg-gray-900 text-white px-2 py-1 rounded-md hover:bg-black transition-colors"
                    >
                        + Add Note
                    </button>
                )}
            </div>

            {/* Feature Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="bg-gray-50/80 p-3 rounded-xl border border-gray-100 flex flex-col gap-2">
                    <div className="flex items-center gap-2 text-blue-600">
                        <Sparkles className="w-3.5 h-3.5" />
                        <span className="text-[10px] font-bold uppercase tracking-wider text-gray-900">How to use</span>
                    </div>
                    <p className="text-[11px] text-gray-500 leading-snug">
                        Specify a craving ("Pizza on Friday") or a dietary need ("No dairy this week").
                    </p>
                </div>

                <div className="bg-gray-50/80 p-3 rounded-xl border border-gray-100 flex flex-col gap-2">
                    <div className="flex items-center gap-2 text-amber-600">
                        <Zap className="w-3.5 h-3.5" />
                        <span className="text-[10px] font-bold uppercase tracking-wider text-gray-900">The Process</span>
                    </div>
                    <p className="text-[11px] text-gray-500 leading-snug">
                        Our System reviews every note for actionability. Approvals take &lt; 1 minute.
                    </p>
                </div>

                <div className="bg-gray-50/80 p-3 rounded-xl border border-gray-100 flex flex-col gap-2">
                    <div className="flex items-center gap-2 text-purple-600">
                        <Layers className="w-3.5 h-3.5" />
                        <span className="text-[10px] font-bold uppercase tracking-wider text-gray-900">Limit</span>
                    </div>
                    <p className="text-[11px] text-gray-500 leading-snug">
                        You have <span className="font-bold text-gray-900">3 active slots</span>. Use them for what matters most!
                    </p>
                </div>
            </div>

            {/* Note List */}
            <div className="space-y-3">
                <AnimatePresence mode="popLayout">
                    {priorityNotes.map((note) => (
                        <motion.div
                            key={note.id}
                            layout
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 relative overflow-hidden group"
                        >
                            {/* Status Badge */}
                            <div className="absolute top-3 right-3 flex items-center gap-2">
                                {note.status === "pending" && (
                                    <div className="flex items-center gap-1.5 px-2 py-1 bg-yellow-200/50 text-yellow-800 text-[10px] font-bold rounded-full uppercase tracking-wider">
                                        <Loader2 className="w-3 h-3 animate-spin" />
                                        Analyzing...
                                    </div>
                                )}
                                {note.status === "approved" && (
                                    <div className="flex items-center gap-1.5 px-2 py-1 bg-emerald-100 text-emerald-700 text-[10px] font-bold rounded-full uppercase tracking-wider animate-in zoom-in spin-in-3 duration-300">
                                        <CheckCircle2 className="w-3 h-3" />
                                        Approved
                                    </div>
                                )}
                                {note.status === "declined" && (
                                    <div className="flex items-center gap-1.5 px-2 py-1 bg-red-100 text-red-700 text-[10px] font-bold rounded-full uppercase tracking-wider">
                                        <XCircle className="w-3 h-3" />
                                        Declined
                                    </div>
                                )}

                                {/* Delete Button - Only if NOT pending */}
                                {note.status !== "pending" && (
                                    <button
                                        onClick={() => actions.removePriorityNote(note.id)}
                                        className="p-1.5 bg-white/50 hover:bg-red-100 text-gray-400 hover:text-red-600 rounded-full transition-colors"
                                        title="Remove Note"
                                    >
                                        <Trash2 className="w-3 h-3" />
                                    </button>
                                )}
                            </div>

                            <p className="text-sm font-medium text-gray-800 pr-24 leading-relaxed">
                                "{note.text}"
                            </p>

                            {/* Extracted Logic Tags */}
                            {note.status === "approved" && note.tags && (
                                <div className="mt-3 flex items-center gap-2 animate-in fade-in slide-in-from-top-2 duration-500">
                                    <div className="text-[10px] font-mono bg-white/50 text-gray-500 px-2 py-1 rounded border border-yellow-200/50">
                                        Target: <span className="font-bold text-gray-800">{note.tags.target}</span>
                                    </div>
                                    <div className="text-[10px] font-mono bg-white/50 text-gray-500 px-2 py-1 rounded border border-yellow-200/50">
                                        Cuisine: <span className="font-bold text-gray-800">{note.tags.cuisine}</span>
                                    </div>
                                </div>
                            )}

                            {/* Rejection Reason */}
                            {note.status === "declined" && (
                                <div className="mt-2 text-xs text-red-600 font-medium flex items-start gap-1">
                                    <AlertCircle className="w-3 h-3 mt-0.5 shrink-0" />
                                    <span>{note.rejectionReason || "System: Request unclear. Please specify a food item."}</span>
                                </div>
                            )}

                            <div className="mt-2 flex items-center gap-3 text-[10px] text-yellow-600/60 font-medium">
                                <span>{new Date(note.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                {note.durationLabel && (
                                    <span className="flex items-center gap-1 bg-yellow-100/50 px-1.5 py-0.5 rounded text-yellow-700/80">
                                        <Clock className="w-2.5 h-2.5" />
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
                        className="bg-white border-2 border-dashed border-gray-200 rounded-xl p-3"
                    >
                        <textarea
                            autoFocus
                            placeholder="e.g. I want a burger from 4505 BBQ for dinner tomorrow..."
                            className="w-full text-sm resize-none outline-none placeholder:text-gray-400 min-h-[60px]"
                            value={inputText}
                            onChange={(e) => setInputText(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    handleSubmit();
                                }
                            }}
                        />
                        <div className="flex justify-between items-center mt-2 pt-2 border-t border-gray-100">
                            {/* Duration Selector */}
                            <div className="relative">
                                <button
                                    onClick={() => setShowDurationMenu(!showDurationMenu)}
                                    className="flex items-center gap-1.5 text-[10px] font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded transition-colors"
                                >
                                    <Clock className="w-3 h-3" />
                                    {DURATIONS.find(d => d.value === duration)?.label}
                                    <ChevronDown className="w-3 h-3 opacity-50" />
                                </button>

                                {/* Dropdown Menu */}
                                {showDurationMenu && (
                                    <div className="absolute top-full left-0 mt-1 w-24 bg-white border border-gray-100 shadow-xl rounded-lg overflow-hidden z-10 animate-in fade-in zoom-in-95 duration-200">
                                        {DURATIONS.map((opt) => (
                                            <button
                                                key={opt.value}
                                                onClick={() => {
                                                    setDuration(opt.value);
                                                    setShowDurationMenu(false);
                                                }}
                                                className={cn(
                                                    "w-full text-left px-3 py-1.5 text-[10px] font-medium hover:bg-gray-50 transition-colors",
                                                    duration === opt.value ? "bg-black text-white hover:bg-black/90" : "text-gray-600"
                                                )}
                                            >
                                                {opt.label}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className="flex items-center gap-3">
                                <span className="text-[10px] text-gray-400 font-medium uppercase tracking-wider hidden sm:inline-block">
                                    Priority System Active
                                </span>
                                <button
                                    onClick={handleSubmit}
                                    disabled={!inputText.trim()}
                                    className="flex items-center gap-2 bg-black text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:scale-105 transition-transform disabled:opacity-50 disabled:scale-100"
                                >
                                    <Send className="w-3 h-3" />
                                    Post
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* Empty State */}
                {priorityNotes.length === 0 && !isAdding && (
                    <div
                        onClick={() => setIsAdding(true)}
                        className="h-full min-h-[200px] bg-yellow-50 rounded-2xl border-2 border-dashed border-yellow-200 hover:border-yellow-300 transition-colors flex flex-col items-center justify-center p-6 text-center group cursor-pointer"
                    >
                        <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center text-yellow-500 mb-3 group-hover:scale-110 transition-transform">
                            <StickyNote className="w-6 h-6" />
                        </div>
                        <h4 className="text-sm font-bold text-yellow-800">No active notes</h4>
                        <p className="text-xs text-yellow-600/70 max-w-[180px] mt-1">
                            Tap to create a Priority Note. Override your menu or request specific changes.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};
