"use client";

import React, { useRef } from "react";
import { motion, useScroll, useTransform, useSpring, useInView } from "framer-motion";
import {
    ArrowRight,
    Heart,
    Zap,
    Lock,
    Sparkles,
    ChevronDown,
    Brain,
    Clock,
    DollarSign,
    Flame,
    ShieldCheck,
    Thermometer,
    Leaf
} from "lucide-react";
import { twMerge } from "tailwind-merge";
import { clsx } from "clsx";
import Link from "next/link";

function cn(...inputs) { return twMerge(clsx(inputs)); }

const FadeInWhenVisible = ({ children, delay = 0, x = 0, y = 20 }) => (
    <motion.div
        initial={{ opacity: 0, x, y }}
        whileInView={{ opacity: 1, x: 0, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8, delay, ease: [0.16, 1, 0.3, 1] }}
    >
        {children}
    </motion.div>
);

const ParallaxDoodle = ({ src, alt, className, speed = 0.1 }) => {
    const ref = useRef(null);
    const { scrollYProgress } = useScroll({
        target: ref,
        offset: ["start end", "end start"]
    });
    const y = useTransform(scrollYProgress, [0, 1], [-50 * speed, 50 * speed]);
    const rotate = useTransform(scrollYProgress, [0, 1], [-5, 5]);

    return (
        <motion.div
            ref={ref}
            style={{ y, rotate }}
            className={cn("relative z-10", className)}
        >
            <div className="absolute inset-0 bg-white/40 blur-3xl rounded-full scale-125 -z-10" />
            <motion.img
                src={src}
                alt={alt}
                className="w-full h-auto object-contain drop-shadow-[0_20px_50px_rgba(0,0,0,0.1)] transition-transform duration-700 hover:scale-105"
            />
        </motion.div>
    );
};

const Section = ({ title, reality, cost, impact, solution, doodleSrc, color, icon: Icon, isReversed, index }) => {
    const containerRef = useRef(null);
    const isInView = useInView(containerRef, { once: true, margin: "-200px" });

    return (
        <section ref={containerRef} className="relative min-h-[90vh] flex items-center py-24 md:py-48">
            <div className={cn(
                "w-full px-8 md:px-16 lg:px-24 grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-32 items-center",
                isReversed ? "lg:direction-rtl" : ""
            )}>
                {/* Text Content */}
                <div className={cn(
                    "lg:col-span-6 space-y-12",
                    isReversed ? "lg:order-2" : "lg:order-1"
                )}>
                    <FadeInWhenVisible y={30}>
                        <div className="flex flex-col gap-4">
                            <div className={cn("w-16 h-1.5 rounded-full", color.bg)} />
                            <h2 className="text-3xl md:text-5xl font-black text-gray-900 tracking-tighter leading-[0.95]">
                                {title}
                            </h2>
                        </div>
                    </FadeInWhenVisible>

                    <div className="space-y-10 pl-2 border-l-2 border-gray-100">
                        <FadeInWhenVisible delay={0.1}>
                            <div className="space-y-3">
                                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
                                    The Reality
                                </span>
                                <p className="text-lg md:text-xl text-gray-600 font-medium leading-relaxed">
                                    {reality}
                                </p>
                            </div>
                        </FadeInWhenVisible>

                        {cost && (
                            <FadeInWhenVisible delay={0.2}>
                                <div className="space-y-3">
                                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 flex items-center gap-2">
                                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                                        The Cost
                                    </span>
                                    <p className="text-lg md:text-xl text-gray-900 font-bold leading-relaxed tracking-tight">
                                        {cost}
                                    </p>
                                </div>
                            </FadeInWhenVisible>
                        )}

                        {impact && (
                            <FadeInWhenVisible delay={0.2}>
                                <div className="space-y-3">
                                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 flex items-center gap-2">
                                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                                        The Impact
                                    </span>
                                    <p className="text-lg md:text-xl text-gray-900 font-bold leading-relaxed tracking-tight">
                                        {impact}
                                    </p>
                                </div>
                            </FadeInWhenVisible>
                        )}

                        <FadeInWhenVisible delay={0.3}>
                            <motion.div
                                className={cn(
                                    "p-8 md:p-10 rounded-[3rem] border shadow-2xl shadow-black/5 relative overflow-hidden group",
                                    color.card
                                )}
                            >
                                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-700" />
                                <div className="relative z-10 space-y-4">
                                    <span className={cn("text-[10px] font-black uppercase tracking-[0.3em] flex items-center gap-2", color.text)}>
                                        <Icon className="w-4 h-4" strokeWidth={3} />
                                        The <span className="text-[#FA651E]">HungryBird</span> Solution
                                    </span>
                                    <p className={cn("text-lg md:text-xl font-black leading-tight tracking-tighter italic", color.text)}>
                                        {solution}
                                    </p>
                                </div>
                            </motion.div>
                        </FadeInWhenVisible>
                    </div>
                </div>

                {/* Doodle Image */}
                <div className={cn(
                    "lg:col-span-6 flex justify-center",
                    isReversed ? "lg:order-1" : "lg:order-2"
                )}>
                    <ParallaxDoodle
                        src={doodleSrc}
                        alt={title}
                        className="max-w-[60%] lg:max-w-[75%]"
                        speed={index % 2 === 0 ? 0.8 : 1.2}
                    />
                </div>
            </div>
        </section>
    );
};

export default function WhyHungryBird() {
    const { scrollYProgress } = useScroll();
    const scaleX = useSpring(scrollYProgress, {
        stiffness: 100,
        damping: 30,
        restDelta: 0.001
    });

    return (
        <div className="bg-white selection:bg-blue-600 selection:text-white overflow-x-hidden pt-16">
            {/* Scroll Progress Indicator */}
            <motion.div
                className="fixed top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-500 via-red-500 via-yellow-500 to-emerald-500 z-[2000] origin-left"
                style={{ scaleX }}
            />

            {/* --- HERO SECTION --- */}
            <header className="relative min-h-[95vh] flex flex-col items-center justify-center overflow-hidden py-12 lg:py-0">
                {/* Background Orbs */}
                <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-blue-100/40 rounded-full blur-[120px] -z-10 animate-pulse" />
                <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-red-100/30 rounded-full blur-[100px] -z-10" />

                <div className="w-full max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-10">

                    {/* LEFT COLUMN: Text Content */}
                    <div className="flex flex-col items-center lg:items-start text-center lg:text-left space-y-8 order-2 lg:order-1">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.8, rotate: -20 }}
                            animate={{ opacity: 1, scale: 1, rotate: 0 }}
                            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                        >
                            <img src="/logo.png" alt="HungryBird" className="w-24 h-24 md:w-32 md:h-32 drop-shadow-2xl" />
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 50 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 1, delay: 0.2 }}
                        >
                            <h1 className="text-5xl md:text-7xl lg:text-[7rem] font-[1000] tracking-[-0.02em] leading-[0.9] text-gray-900">
                                Built for <br />
                                <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#4285F4] via-[#EA4335] via-[#FBBC04] to-[#34A853] animate-gradient-x">
                                    Assurance.
                                </span>
                            </h1>
                        </motion.div>

                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 1, delay: 0.8 }}
                            className="text-xl md:text-2xl text-gray-400 font-medium tracking-tight max-w-lg leading-tight"
                        >
                            Every detail is engineered to liberate your focus. <br />
                            <span className="text-gray-900 font-black">This is food on autopilot.</span>
                        </motion.p>
                    </div>

                    {/* RIGHT COLUMN: Story Card */}
                    <div className="flex justify-center lg:justify-end w-full order-1 lg:order-2">
                        <motion.div
                            initial={{ opacity: 0, x: 50 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 1, delay: 0.5, ease: "circOut" }}
                            className="relative w-full max-w-[420px]"
                        >
                            <div className="relative group w-full pointer-events-auto hover:scale-[1.02] transition-transform duration-500 ease-out">
                                {/* Glow Effect */}
                                <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 via-purple-500 to-emerald-500 rounded-[2rem] blur opacity-30 group-hover:opacity-50 transition duration-1000 animate-gradient-x" />

                                <div className="relative bg-white/95 backdrop-blur-2xl border border-white/40 p-8 rounded-[2rem] shadow-[0_20px_50px_-10px_rgba(0,0,0,0.2)]">
                                    {/* Header Badge */}
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                            <span className="text-[10px] uppercase font-black tracking-[0.2em] text-gray-500">Case Study</span>
                                        </div>
                                    </div>

                                    {/* Headlines */}
                                    <h3 className="text-2xl font-black text-gray-900 leading-tight mb-2">
                                        The Louisiana Tech University <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">Experiment</span>
                                    </h3>
                                    <p className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-6">
                                        1 Week. 100 Students.
                                    </p>

                                    {/* The Narrative */}
                                    <div className="mb-8 relative">
                                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-500 to-transparent opacity-30 rounded-full" />
                                        <p className="pl-4 text-sm text-gray-600 leading-relaxed font-medium">
                                            To test demand, we ran a 1-week pilot with <strong className="text-gray-900">100 students</strong>. We used Ollama agents to automate their meal choices, while our Logistics Engine successfully batched and fulfilled the orders.
                                        </p>
                                        <p className="pl-4 text-sm text-gray-600 leading-relaxed font-medium mt-3">
                                            The results were immediate: <strong className="text-gray-900">500+ orders</strong> in 7 days, averaging <strong className="text-gray-900">5 meals</strong> per user. We didn't just get positive feedback—we effectively replaced their campus dining.
                                        </p>
                                    </div>

                                    {/* Visual Metrics */}
                                    <div className="grid grid-cols-1 gap-4 mb-8">
                                        <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 flex flex-col items-center text-center">
                                            <span className="text-3xl font-black text-gray-900">500+</span>
                                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Orders Processed</span>
                                        </div>
                                    </div>

                                    {/* The Quote */}
                                    <div className="bg-[#FA651E] p-6 rounded-2xl text-white shadow-xl shadow-orange-600/20 relative overflow-hidden">
                                        <div className="absolute -right-4 -top-4 text-orange-200 opacity-20">
                                            <Zap className="w-24 h-24 rotate-12" />
                                        </div>
                                        <p className="text-lg font-bold leading-tight italic relative z-10">
                                            "When is this launching for real?"
                                        </p>
                                        <div className="mt-3 flex items-center gap-2 opacity-80">
                                            <div className="w-1 h-1 bg-white rounded-full" />
                                            <span className="text-xs font-medium">Unanimous Student Feedback</span>
                                        </div>
                                    </div>

                                </div>
                            </div>
                        </motion.div>
                    </div>

                </div>

                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.5, duration: 1 }}
                    className="absolute bottom-12 flex flex-col items-center gap-4 group"
                >
                    <span className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-300 group-hover:text-gray-900 transition-colors">Scroll Story</span>
                    <motion.div
                        animate={{ y: [0, 8, 0] }}
                        transition={{ duration: 2, repeat: Infinity }}
                    >
                        <ChevronDown className="w-8 h-8 text-gray-200" />
                    </motion.div>
                </motion.div>
            </header>

            {/* --- THE STORY --- */}
            <main className="pb-0">
                <Section
                    index={1}
                    title="The 'Double Processing' Tax"
                    reality="When you step out of a class or a meeting, your brain is forced to do two exhausting things: Brain Processing (decisions) and App Processing (scrolling)."
                    cost="The Doom Scroll is costing you mental clarity. You trade your focus for decision fatigue."
                    solution="We eliminate both. No brain processing. No app processing. No scrolling. You study, you work, you live."
                    doodleSrc="/doodles/mental_clarity.png"
                    color={{ bg: "bg-[#4285F4]", card: "bg-blue-50/50 border-blue-100", text: "text-blue-900" }}
                    icon={Brain}
                />

                <Section
                    index={2}
                    isReversed
                    title="The '30-Minute Break' Math"
                    reality="You order food. You know it takes 20 minutes to arrive. But then it’s 5-10 minutes late."
                    impact="Your lunch break is ruined. Your schedule collapses. You rush through your meal, stressed and annoyed."
                    solution="We 'Cache' Time. Our system ensures the food is there before your break starts. Same time, every time. Zero latency."
                    doodleSrc="/doodles/time_sync.png"
                    color={{ bg: "bg-[#34A853]", card: "bg-emerald-50/50 border-emerald-100", text: "text-emerald-900" }}
                    icon={Clock}
                />

                <Section
                    index={3}
                    title="The $10 Impulse Trap"
                    reality="When you open an app hungry, you aren't rational. A $15 meal becomes $25 after fees and 'I'm hungry' impulse additions."
                    cost="Silent drain on your savings. That extra $10 adds up to 'Big Dollars' by the end of the month."
                    solution="The Hard Budget Lock. You set your budget when you are calm. You cannot go over it when you are hungry."
                    doodleSrc="/doodles/financial_lock.png"
                    color={{ bg: "bg-[#FBBC04]", card: "bg-amber-50/50 border-amber-100", text: "text-amber-900" }}
                    icon={DollarSign}
                />

                <Section
                    index={4}
                    isReversed
                    title="The Fried Chicken Cycle"
                    reality="When hunger strikes and you are pressed for time, the plan falls apart. Not because you want to, but because it's easy."
                    solution="My Diet, My Choice, My Budget. We automate your discipline. We deliver the healthy option you actually wanted."
                    doodleSrc="/doodles/diet_balance.png"
                    color={{ bg: "bg-[#EA4335]", card: "bg-red-50/50 border-red-100", text: "text-red-900" }}
                    icon={Flame}
                />
                <Section
                    index={5}
                    title="The 'Gig Guilt' Tax"
                    reality="You enjoy the convenience, but deep down, you know the driver is scrambling for $3 per order. It feels exploitative because it is."
                    cost="A silent moral tax every time you hit order. You rely on a system that burns out the people serving you."
                    solution="The Per Loop: $25 Standard. We don't tip-bait. We pay a living wage. You aren't ordering a servant; you are hiring a professional."
                    doodleSrc="/doodles/ethical_standard.png"
                    color={{ bg: "bg-[#6366f1]", card: "bg-indigo-50/50 border-indigo-100", text: "text-indigo-900" }}
                    icon={ShieldCheck}
                />

                <Section
                    index={6}
                    isReversed
                    title="The 'Cold Fries' Paradox"
                    reality="Traditional drivers zig-zag across the city to maximize their earnings, not your food quality. Your meal sits in the back seat for 40 minutes while they drop off a taco 3 miles away."
                    impact="Soggy fries. Lukewarm soup. The convenience of delivery destroys the joy of the meal."
                    solution="The 500 meters Cluster. One pickup. One drop-off location (yours). No detours. No zig-zags. The food arrives the way the chef intended."
                    doodleSrc="/doodles/food_quality.png"
                    color={{ bg: "bg-[#f97316]", card: "bg-orange-50/50 border-orange-100", text: "text-orange-900" }}
                    icon={Thermometer}
                />

                <Section
                    index={7}
                    title="The 'Driveway' Traffic Jam"
                    reality="15 neighbors order dinner. 15 different cars show up. 15 times the emissions, the traffic, and the chaos."
                    cost="Incredible inefficiency. We are clogging our own cities just to eat lunch."
                    solution="The Green Batch. One car. 15 meals. You actively lower your carbon footprint just by eating lunch."
                    doodleSrc="/doodles/eco_batch.png"
                    color={{ bg: "bg-[#10b981]", card: "bg-emerald-50/50 border-emerald-100", text: "text-emerald-900" }}
                    icon={Leaf}
                />

                {/* --- CONCLUSION: THE HAPPY VIBE --- */}
                <section className="relative py-48 px-6 bg-[#000] text-white overflow-hidden">
                    <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-[#4285F4] via-[#EA4335] via-[#FBBC04] to-[#34A853]" />

                    <div className="w-full px-8 md:px-16 lg:px-24">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            className="text-center mb-32"
                        >
                            <h2 className="text-5xl md:text-[8rem] font-[1000] tracking-[-0.06em] leading-none mb-6">
                                The Happy Vibe.
                            </h2>
                            <p className="text-xl md:text-3xl font-medium text-gray-500 max-w-3xl mx-auto leading-tight">
                                Assurance that the food is healthy, the price is fixed, and the time is guaranteed.
                            </p>
                        </motion.div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {[
                                { title: "Healthy", detail: "Assurance that the food is healthy.", icon: Heart, color: "text-[#EA4335]" },
                                { title: "Fixed Price", detail: "Assurance that the price is fixed.", icon: Lock, color: "text-[#4285F4]" },
                                { title: "Guaranteed Time", detail: "Assurance that the time is guaranteed.", icon: Zap, color: "text-[#FBBC04]" },
                            ].map((item, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, y: 30 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.1 }}
                                    className="p-12 rounded-[4rem] bg-zinc-900 border border-white/5 hover:bg-zinc-800/80 transition-colors group"
                                >
                                    <div className="w-20 h-20 rounded-3xl bg-black border border-white/10 flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
                                        <item.icon className={cn("w-10 h-10", item.color)} strokeWidth={1.5} />
                                    </div>
                                    <h3 className="text-4xl font-black mb-4">{item.title}</h3>
                                    <p className="text-gray-500 text-xl font-bold leading-relaxed">{item.detail}</p>
                                </motion.div>
                            ))}
                        </div>

                        <div className="mt-48 text-center border-t border-white/10 pt-24">
                            <motion.div
                                initial={{ opacity: 0 }}
                                whileInView={{ opacity: 1 }}
                                className="flex flex-col items-center gap-12"
                            >
                                <p className="text-3xl md:text-5xl font-black text-gray-600 tracking-tight">
                                    That is <span className="text-white italic">The Happy Vibe.</span><br />
                                    That is <span className="text-[#FA651E]">HungryBird</span>.
                                </p>

                                <Link href="/">
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        className="inline-flex items-center gap-4 bg-white text-black px-12 py-6 rounded-full text-xl font-black shadow-2xl hover:bg-gray-100 transition-all border-4 border-white/10"
                                    >
                                        Return to Dashboard
                                        <ArrowRight className="w-6 h-6" />
                                    </motion.button>
                                </Link>
                            </motion.div>
                        </div>
                    </div>
                </section>
            </main>

            <style jsx global>{`
                @keyframes gradient-x {
                    0% { background-position: 0% 50%; }
                    50% { background-position: 100% 50%; }
                    100% { background-position: 0% 50%; }
                }
                .animate-gradient-x {
                    background-size: 200% 200%;
                    animation: gradient-x 8s linear infinite;
                }
            `}</style>
        </div>
    );
}
