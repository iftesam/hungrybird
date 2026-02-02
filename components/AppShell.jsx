import React, { useState } from "react";
import { prefixPath } from '@/utils/prefix';
import {
    LayoutDashboard,
    Calendar,
    User,
    Settings,
    LogOut,
    Bell,
    Search,
    Menu,
    Clock,
    Heart,
    Linkedin
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs) { return twMerge(clsx(inputs)); }

export const AppLayout = ({ children, currentView, onViewChange }) => {
    const [showNotification, setShowNotification] = useState(false);


    const NAV_ITEMS = [
        { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
        { id: "schedule", label: "Schedule", icon: Calendar },
        { id: "taste-profile", label: "Taste Profile", icon: Heart },
        { id: "history", label: "Order History", icon: Clock },
        { id: "profile", label: "Settings", icon: User },
    ];

    return (
        <div className="flex h-screen w-full bg-[#f4f4f5] font-sans text-[#171717] overflow-hidden">

            {/* --- SIDEBAR (DESKTOP) --- */}
            <aside className="hidden md:flex w-64 bg-white border-r border-gray-200 flex-col justify-between shrink-0 z-20">
                {/* Brand Header */}
                <div className="p-6 border-b border-gray-100">
                    <div
                        onClick={() => window.location.href = window.location.origin}
                        className="flex items-center gap-3 cursor-pointer group"
                        title="Reload HungryBird"
                    >
                        <img src={prefixPath('/logo.png')} alt="HungryBird Logo" className="h-10 w-auto group-hover:scale-105 transition-transform" />
                        <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-orange-500 to-red-600 hidden lg:block group-hover:opacity-80 transition-opacity">
                            HungryBird
                        </span>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="flex-1 p-4 space-y-1">
                    {NAV_ITEMS.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => onViewChange(item.id)}
                            className={cn(
                                "flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200",
                                currentView === item.id
                                    ? "bg-black text-white shadow-lg shadow-black/10"
                                    : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                            )}
                        >
                            <item.icon className={cn("w-5 h-5", currentView === item.id ? "text-white" : "text-gray-400 group-hover:text-gray-600")} />
                            {item.label}
                        </button>
                    ))}
                </nav>

                {/* User Footer */}
                <div className="p-4 border-t border-gray-100">
                    <div
                        onClick={() => setShowNotification(!showNotification)}
                        className="relative flex items-center gap-3 p-2 rounded-xl hover:bg-gray-50 cursor-pointer transition-colors group"
                    >
                        {/* Pulsing notification indicator */}
                        <div className="absolute -top-1 -right-1 z-10">
                            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-orange-400 opacity-75"></span>
                            <div className="relative flex h-3 w-3 items-center justify-center rounded-full bg-[#FA651E] border-2 border-white shadow-md"></div>
                        </div>

                        <img
                            src={prefixPath('/images/iftesam-nabi.png')}
                            alt="User"
                            className="w-10 h-10 rounded-full object-cover shadow-sm border border-gray-200 group-hover:scale-105 transition-transform"
                        />
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-gray-900 truncate">Iftesam Nabi</p>
                            <p className="text-xs text-gray-500 truncate">Pro Member</p>
                        </div>
                        <Bell className="w-4 h-4 text-gray-400 group-hover:text-orange-500 transition-colors" />
                    </div>
                </div>
            </aside>

            {/* --- MAIN CONTENT AREA --- */}
            <main className="flex-1 flex flex-col min-w-0 bg-[#FAFAFA] relative pb-24 md:pb-0">
                {/* Top Header */}
                <header className="h-16 border-b border-gray-100 bg-white/50 backdrop-blur-sm flex items-center justify-between px-4 md:px-8 sticky top-0 z-[1000]">
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                        {/* Mobile Logo Only */}
                        <div className="md:hidden">
                            <img src={prefixPath('/logo.png')} alt="Logo" className="h-8 w-auto" />
                        </div>
                        <span className="font-medium text-gray-900 hidden md:block">{NAV_ITEMS.find(i => i.id === currentView)?.label}</span>
                        <span className="text-gray-300 hidden md:block">/</span>
                        <span className="hidden md:block">Overview</span>
                        <span className="font-bold text-gray-900 md:hidden">{NAV_ITEMS.find(i => i.id === currentView)?.label}</span>
                    </div>

                    {/* Header Actions */}
                    <div className="flex items-center gap-4">
                        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-lg text-sm text-gray-500">
                            <Search className="w-4 h-4" />
                            <input type="text" placeholder="Search..." className="bg-transparent border-none focus:outline-none w-32" />
                        </div>

                        {/* Notification Bell */}
                        <div className="relative z-50">
                            <button
                                onClick={() => setShowNotification(!showNotification)}
                                className="relative w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors focus:outline-none"
                            >
                                <Bell className="w-5 h-5 text-gray-500" />
                                {/* Notification Badge */}
                                <div className="absolute -top-1 -right-1">
                                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75"></span>
                                    <div className="relative flex h-5 w-5 items-center justify-center rounded-full bg-[#FA651E] text-[10px] font-bold text-white border-2 border-white shadow-md">
                                        +1
                                    </div>
                                </div>
                            </button>

                            <AnimatePresence>
                                {showNotification && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10, scale: 0.9 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: 10, scale: 0.9 }}
                                        transition={{ type: "spring", stiffness: 300, damping: 20 }}
                                        className="absolute right-0 top-full mt-2 w-[280px] z-[100]"
                                    >
                                        <div className="relative p-5 bg-black/90 backdrop-blur-xl text-white rounded-2xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.5)] border border-white/10 overflow-hidden group text-left">
                                            {/* Glow Effect */}
                                            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-transparent to-blue-500/10 pointer-events-none" />

                                            {/* Arrow */}
                                            <div className="absolute -top-1.5 right-2.5 w-3 h-3 bg-black/90 border-l border-t border-white/10 rotate-45" />

                                            <div className="relative z-10">
                                                <p className="text-xs leading-relaxed font-light text-gray-300">
                                                    We have the skills and the vision. The only thing missing to fuel our expansion is being <span style={{ color: '#FB651E', fontWeight: 'bold' }}>backed by Y Combinator</span>.
                                                </p>

                                                {/* Founders Section */}
                                                <div className="mt-4 pt-3 border-t border-white/10">
                                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Contact Founders</p>
                                                    <div className="space-y-2">
                                                        <a
                                                            href="https://www.linkedin.com/in/iftesamnabi/"
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="flex items-center gap-3 p-2 rounded-xl bg-white/5 hover:bg-[#0077b5] transition-colors group/link"
                                                        >
                                                            <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white group-hover/link:bg-white group-hover/link:text-[#0077b5] transition-colors">
                                                                <Linkedin className="w-4 h-4" />
                                                            </div>
                                                            <div className="flex-1">
                                                                <p className="text-xs font-bold">Iftesam Nabi</p>
                                                            </div>
                                                        </a>

                                                        <a
                                                            href="https://www.linkedin.com/in/tasruzzaman-babu-a3a322b9/"
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="flex items-center gap-3 p-2 rounded-xl bg-white/5 hover:bg-[#0077b5] transition-colors group/link"
                                                        >
                                                            <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white group-hover/link:bg-white group-hover/link:text-[#0077b5] transition-colors">
                                                                <Linkedin className="w-4 h-4" />
                                                            </div>
                                                            <div className="flex-1">
                                                                <p className="text-xs font-bold">Tasruzzaman Babu</p>
                                                            </div>
                                                        </a>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </header>

                {/* Content Scroll Area */}
                <div className="flex-1 overflow-y-auto p-4 md:p-8 scrollbar-hide">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={currentView}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.2 }}
                            className="w-full max-w-6xl mx-auto"
                        >
                            {children}
                        </motion.div>
                    </AnimatePresence>
                </div>
            </main>

            {/* --- MOBILE BOTTOM NAVIGATION (STATE OF THE ART) --- */}
            <div className="md:hidden fixed bottom-6 left-6 right-6 h-18 z-50">
                {/* Floating Island Container */}
                <div className="absolute inset-0 bg-black/85 backdrop-blur-2xl rounded-[2rem] border border-white/10 shadow-[0_8px_32px_-4px_rgba(0,0,0,0.5)] overflow-hidden">
                    {/* Subtle Internal Gradient/Glow */}
                    <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent pointer-events-none" />
                </div>

                {/* Nav Items Container */}
                <div className="relative h-full flex items-center justify-between px-6">
                    {NAV_ITEMS.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => onViewChange(item.id)}
                            className="relative flex flex-col items-center justify-center w-12 h-12 group"
                        >
                            {/* Active State Background Blob */}
                            {currentView === item.id && (
                                <motion.div
                                    layoutId="nav-active-blob"
                                    className="absolute inset-0 bg-gradient-to-tr from-orange-500/20 to-red-500/20 rounded-full blur-md"
                                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                />
                            )}

                            {/* Icon */}
                            <div className={cn(
                                "relative z-10 transition-all duration-300",
                                currentView === item.id
                                    ? "text-white -translate-y-1 scale-110 drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]"
                                    : "text-gray-500 group-hover:text-gray-300"
                            )}>
                                <item.icon className="w-6 h-6" strokeWidth={currentView === item.id ? 2.5 : 2} />
                            </div>

                            {/* Active Indicator Dot */}
                            {currentView === item.id && (
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    className="absolute bottom-1 w-1 h-1 bg-gradient-to-r from-orange-500 to-red-500 rounded-full z-10 shadow-[0_0_4px_#ef4444]"
                                />
                            )}
                        </button>
                    ))}
                </div>
            </div>

        </div>
    );
};
