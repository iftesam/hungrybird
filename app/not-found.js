"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Home, Calendar, User, Search, ArrowLeft, ArrowUpRight } from "lucide-react";

export default function NotFound() {
    return (
        <div className="min-h-screen bg-[#FAFAFA] flex flex-col items-center justify-center p-6 text-center font-sans">
            <div className="bg-noise" />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, cubicBezier: [0.16, 1, 0.3, 1] }}
                className="max-w-xl w-full relative z-10"
            >
                {/* Premium Illustration Container */}
                <div className="mb-12 relative h-64 flex items-center justify-center">
                    <motion.div
                        animate={{
                            y: [0, -12, 0],
                            rotate: [0, 1, 0, -1, 0]
                        }}
                        transition={{
                            duration: 5,
                            repeat: Infinity,
                            ease: "easeInOut"
                        }}
                        className="relative z-10"
                    >
                        <Image
                            src="/404.png"
                            alt="404 - HungryBird Flying Off Course"
                            width={280}
                            height={280}
                            className="mx-auto select-none pointer-events-none drop-shadow-[0_25px_25px_rgba(0,0,0,0.08)]"
                            priority
                        />
                    </motion.div>

                    {/* Animated Background Orbs (Google Colors but Softened) */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80">
                        <div className="absolute top-0 left-0 w-32 h-32 bg-blue-400/10 rounded-full blur-[60px] animate-pulse" />
                        <div className="absolute bottom-0 right-0 w-32 h-32 bg-red-400/10 rounded-full blur-[60px] animate-pulse" style={{ animationDelay: '1s' }} />
                        <div className="absolute top-1/2 -right-10 w-24 h-24 bg-yellow-400/10 rounded-full blur-[50px] animate-pulse" style={{ animationDelay: '2s' }} />
                        <div className="absolute -bottom-10 left-1/4 w-28 h-28 bg-emerald-400/10 rounded-full blur-[55px] animate-pulse" style={{ animationDelay: '3s' }} />
                    </div>
                </div>

                <div className="space-y-6">
                    <h1 className="text-7xl font-black text-[#171717] tracking-tight">
                        404<span className="text-blue-500">.</span>
                    </h1>
                    <div className="space-y-2">
                        <p className="text-2xl font-bold text-[#171717]">
                            That's an error.
                        </p>
                        <p className="text-[#737373] max-w-sm mx-auto leading-relaxed">
                            The bird has flown off course. The requested URL was not found on this server. <br />
                            <span className="text-sm font-medium italic opacity-60">That’s all we know.</span>
                        </p>
                    </div>
                </div>

                {/* Helpful Pathfinders - Two Column Grid */}
                <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Link href="/">
                        <motion.div
                            whileHover={{ y: -4, backgroundColor: "white", boxShadow: "0 10px 30px -10px rgba(0,0,0,0.05)" }}
                            className="flex flex-col gap-3 p-6 rounded-3xl border border-gray-100 bg-white/50 backdrop-blur-sm transition-all text-left group"
                        >
                            <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 transition-colors">
                                <Home className="w-6 h-6" />
                            </div>
                            <div>
                                <div className="font-bold text-[#171717] flex items-center gap-1 group-hover:text-blue-600 transition-colors">
                                    Dashboard <ArrowUpRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-all" />
                                </div>
                                <div className="text-sm text-[#737373]">Return to your main nested hub</div>
                            </div>
                        </motion.div>
                    </Link>

                    <Link href="/Schedule">
                        <motion.div
                            whileHover={{ y: -4, backgroundColor: "white", boxShadow: "0 10px 30px -10px rgba(0,0,0,0.05)" }}
                            className="flex flex-col gap-3 p-6 rounded-3xl border border-gray-100 bg-white/50 backdrop-blur-sm transition-all text-left group"
                        >
                            <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600 transition-colors">
                                <Calendar className="w-6 h-6" />
                            </div>
                            <div>
                                <div className="font-bold text-[#171717] flex items-center gap-1 group-hover:text-emerald-600 transition-colors">
                                    Meal Schedule <ArrowUpRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-all" />
                                </div>
                                <div className="text-sm text-[#737373]">See what's next on your plate</div>
                            </div>
                        </motion.div>
                    </Link>
                </div>

                {/* Search Suggestion Section */}
                <div className="mt-8 flex flex-col items-center gap-6">
                    <div className="relative w-full">
                        <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search for a meal, cuisine, or restaurant..."
                            className="w-full pl-14 pr-6 py-4 bg-white border border-gray-100 rounded-[2rem] text-sm shadow-sm focus:ring-4 focus:ring-blue-500/5 focus:border-blue-200 transition-all outline-none"
                        />
                    </div>

                    <div className="flex items-center gap-8">
                        <button
                            onClick={() => window.history.back()}
                            className="flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-[#171717] transition-colors"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Go Back
                        </button>
                        <Link href="/TasteProfile" className="text-sm font-bold text-blue-600 hover:text-blue-700 transition-colors">
                            Update Taste Profile
                        </Link>
                    </div>
                </div>

                {/* System Breadcrumbs */}
                <div className="mt-20 pt-8 border-t border-gray-100 flex flex-wrap justify-center gap-4 md:gap-8 opacity-40 grayscale hover:grayscale-0 transition-all duration-700">
                    {['Inventory', 'Logistics', 'Procurement', 'Nutrition'].map((sys) => (
                        <div key={sys} className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            <span className="text-[10px] font-black tracking-widest uppercase">{sys}</span>
                        </div>
                    ))}
                </div>
            </motion.div>
        </div>
    );
}
