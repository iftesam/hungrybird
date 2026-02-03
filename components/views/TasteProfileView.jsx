"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, ThumbsUp, ThumbsDown, X, GripVertical } from "lucide-react";
import { useAppContext } from "@/components/providers/AppProvider";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { DndContext, DragOverlay, closestCenter, PointerSensor, TouchSensor, useSensor, useSensors, useDroppable } from '@dnd-kit/core';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

function cn(...inputs) { return twMerge(clsx(inputs)); }

// Google Material Design 3 Draggable Card Component
const TasteCard = ({ mealName, type, onRemove, isDragging }) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging: isSortableDragging,
    } = useSortable({ id: mealName });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isSortableDragging ? 0.5 : 1,
    };

    return (
        <motion.div
            ref={setNodeRef}
            style={style}
            layout
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.15 } }}
            className={cn(
                "group relative bg-white rounded-2xl transition-all duration-200 cursor-grab active:cursor-grabbing",
                isSortableDragging && "shadow-[0_8px_24px_rgba(0,0,0,0.15)] scale-[1.02]",
                !isSortableDragging && "shadow-[0_1px_3px_rgba(0,0,0,0.12),0_1px_2px_rgba(0,0,0,0.08)] hover:shadow-[0_2px_8px_rgba(0,0,0,0.12),0_4px_12px_rgba(0,0,0,0.08)]"
            )}
            {...attributes}
            {...listeners}
        >
            {/* Google-style colored left accent */}
            <div className={cn(
                "absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl",
                type === "favorite" && "bg-gradient-to-b from-rose-500 to-orange-500",
                type === "like" && "bg-emerald-500",
                type === "dislike" && "bg-gray-300"
            )} />

            <div className="flex items-center gap-3 p-4 pl-5">
                {/* Drag Handle - Visible on mobile, subtle on desktop */}
                <div className="flex md:hidden items-center justify-center text-gray-400 -ml-1 mr-1 touch-none">
                    <GripVertical className="w-5 h-5" strokeWidth={2} />
                </div>

                {/* Icon - Material Design style */}
                <div className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center shrink-0",
                    type === "favorite" && "bg-rose-50 text-rose-600",
                    type === "like" && "bg-emerald-50 text-emerald-600",
                    type === "dislike" && "bg-gray-100 text-gray-500"
                )}>
                    {type === "favorite" && <Heart className="w-5 h-5 fill-current" strokeWidth={0} />}
                    {type === "like" && <ThumbsUp className="w-5 h-5" strokeWidth={2} />}
                    {type === "dislike" && <ThumbsDown className="w-5 h-5" strokeWidth={2} />}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-sm text-gray-900 truncate">{mealName}</h3>
                    <p className={cn(
                        "text-xs font-medium mt-0.5",
                        type === "favorite" && "text-rose-600",
                        type === "like" && "text-emerald-600",
                        type === "dislike" && "text-gray-500"
                    )}>
                        {type === "favorite" && "Highest Priority"}
                        {type === "like" && "Preferred"}
                        {type === "dislike" && "Blocked"}
                    </p>
                </div>

                {/* Remove button - Google icon button style with larger touch target on mobile */}
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onRemove();
                    }}
                    className="w-10 h-10 md:w-8 md:h-8 rounded-full flex items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-red-600 transition-all md:opacity-0 md:group-hover:opacity-100"
                    title="Remove review"
                >
                    <X className="w-4 h-4" strokeWidth={2} />
                </button>
            </div>
        </motion.div>
    );
};

// Google Material Design 3 Drop Zone Component
const DropZone = ({ id, title, icon: Icon, count, items, type, isOver, onRemove }) => {
    const { setNodeRef } = useDroppable({ id });

    return (
        <div className="space-y-3">
            {/* Header with icon */}
            <div className="flex items-center gap-2.5 px-1">
                <div className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center",
                    type === "favorite" && "bg-rose-50",
                    type === "like" && "bg-emerald-50",
                    type === "dislike" && "bg-gray-100"
                )}>
                    <Icon className={cn(
                        "w-4 h-4",
                        type === "favorite" && "text-rose-600 fill-rose-600",
                        type === "like" && "text-emerald-600",
                        type === "dislike" && "text-gray-500"
                    )} strokeWidth={2} />
                </div>
                <h2 className="font-medium text-base text-gray-900">{title}</h2>
                <span className={cn(
                    "ml-auto text-xs font-medium px-2.5 py-1 rounded-full",
                    type === "favorite" && "bg-rose-50 text-rose-700",
                    type === "like" && "bg-emerald-50 text-emerald-700",
                    type === "dislike" && "bg-gray-100 text-gray-600"
                )}>{count}</span>
            </div>

            {/* Drop area */}
            <div
                ref={setNodeRef}
                className={cn(
                    "space-y-2 min-h-[240px] p-3 rounded-2xl transition-all duration-200",
                    isOver && "bg-blue-50 ring-2 ring-blue-200 scale-[1.01]"
                )}
            >
                <AnimatePresence>
                    {items.length > 0 ? (
                        items.map(([name]) => (
                            <TasteCard key={name} mealName={name} type={type} onRemove={() => onRemove(name)} />
                        ))
                    ) : (
                        <motion.div
                            key="empty"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className={cn(
                                "flex flex-col items-center justify-center p-12 rounded-2xl border-2 border-dashed transition-all duration-200",
                                isOver
                                    ? "border-blue-300 bg-blue-50/50"
                                    : "border-gray-200 bg-gray-50/30"
                            )}
                        >
                            <Icon className={cn(
                                "w-10 h-10 mb-3 transition-colors",
                                isOver ? "text-blue-400" : "text-gray-300"
                            )} strokeWidth={1.5} />
                            <p className={cn(
                                "text-xs font-medium transition-colors",
                                isOver ? "text-blue-600" : "text-gray-400"
                            )}>
                                {isOver ? "Drop here" : `No ${title.toLowerCase()} yet`}
                            </p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export const TasteProfileView = () => {
    const { reviews, actions } = useAppContext();
    const [activeId, setActiveId] = useState(null);
    const [overId, setOverId] = useState(null);

    const sensors = useSensors(
        // Desktop: Mouse/trackpad with minimal drag distance
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        }),
        // Mobile: Touch with press-and-hold delay for better UX
        useSensor(TouchSensor, {
            activationConstraint: {
                delay: 250,
                tolerance: 10,
            },
        })
    );

    // Group reviews
    const activeReviews = Object.entries(reviews).filter(([_, data]) => data.liked !== null && data.liked !== undefined);
    const favsList = activeReviews.filter(([_, data]) => data.isFavorite);
    const likesList = activeReviews.filter(([_, data]) => data.liked === true && !data.isFavorite);
    const dislikesList = activeReviews.filter(([_, data]) => data.liked === false);

    const handleRemove = (mealName) => {
        actions.submitReview(mealName, null, false);
    };

    const handleDragStart = (event) => {
        setActiveId(event.active.id);
    };

    const handleDragOver = (event) => {
        setOverId(event.over?.id);
    };

    const handleDragEnd = (event) => {
        const { active, over } = event;

        if (!over) {
            setActiveId(null);
            setOverId(null);
            return;
        }

        const mealName = active.id;
        let dropZone = over.id;

        // If we dropped on a card instead of the zone, figure out which zone it belongs to
        if (dropZone !== 'favorites' && dropZone !== 'likes' && dropZone !== 'dislikes') {
            const inFavorites = favsList.some(([name]) => name === dropZone);
            const inLikes = likesList.some(([name]) => name === dropZone);
            const inDislikes = dislikesList.some(([name]) => name === dropZone);

            if (inFavorites) dropZone = 'favorites';
            else if (inLikes) dropZone = 'likes';
            else if (inDislikes) dropZone = 'dislikes';
        }

        // Update review based on drop zone
        if (dropZone === 'favorites') {
            actions.submitReview(mealName, true, true);
        } else if (dropZone === 'likes') {
            actions.submitReview(mealName, true, false);
        } else if (dropZone === 'dislikes') {
            actions.submitReview(mealName, false, false);
        }

        setActiveId(null);
        setOverId(null);
    };

    const handleDragCancel = () => {
        setActiveId(null);
        setOverId(null);
    };

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragEnd={handleDragEnd}
            onDragCancel={handleDragCancel}
        >
            <div className="max-w-6xl mx-auto p-4 md:p-8 space-y-8 pb-8">
                {/* Header - Google Material Design */}
                <div className="space-y-1">
                    <h1 className="text-2xl font-medium text-gray-900 tracking-tight">
                        Taste Profile
                    </h1>
                    <p className="text-sm text-gray-600">Drag meals between columns to update your preferences.</p>
                </div>

                {/* Grid - Responsive Material Design layout */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* FAVORITES COLUMN */}
                    <div id="favorites">
                        <DropZone
                            id="favorites"
                            title="Favorites"
                            icon={Heart}
                            count={favsList.length}
                            items={favsList}
                            type="favorite"
                            isOver={overId === 'favorites'}
                            onRemove={handleRemove}
                        />
                    </div>

                    {/* LIKES COLUMN */}
                    <div id="likes">
                        <DropZone
                            id="likes"
                            title="Liked"
                            icon={ThumbsUp}
                            count={likesList.length}
                            items={likesList}
                            type="like"
                            isOver={overId === 'likes'}
                            onRemove={handleRemove}
                        />
                    </div>

                    {/* DISLIKES COLUMN */}
                    <div id="dislikes">
                        <DropZone
                            id="dislikes"
                            title="Blocked"
                            icon={ThumbsDown}
                            count={dislikesList.length}
                            items={dislikesList}
                            type="dislike"
                            isOver={overId === 'dislikes'}
                            onRemove={handleRemove}
                        />
                    </div>
                </div>
            </div>

            {/* Drag Overlay - Google Material Design shadow */}
            <DragOverlay>
                {activeId ? (
                    <div className="cursor-grabbing">
                        {(() => {
                            const item = activeReviews.find(([name]) => name === activeId);
                            if (!item) return null;
                            const [name, data] = item;
                            const type = data.isFavorite ? 'favorite' : (data.liked ? 'like' : 'dislike');
                            return (
                                <div className={cn(
                                    "bg-white rounded-2xl shadow-[0_8px_24px_rgba(0,0,0,0.15)] scale-[1.05]"
                                )}>
                                    {/* Left accent */}
                                    <div className={cn(
                                        "absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl",
                                        type === "favorite" && "bg-gradient-to-b from-rose-500 to-orange-500",
                                        type === "like" && "bg-emerald-500",
                                        type === "dislike" && "bg-gray-300"
                                    )} />

                                    <div className="flex items-center gap-3 p-4 pl-5">
                                        {/* Drag Handle - Visible on mobile */}
                                        <div className="flex md:hidden items-center justify-center text-gray-400 -ml-1 mr-1">
                                            <GripVertical className="w-5 h-5" strokeWidth={2} />
                                        </div>

                                        <div className={cn(
                                            "w-10 h-10 rounded-full flex items-center justify-center shrink-0",
                                            type === "favorite" && "bg-rose-50 text-rose-600",
                                            type === "like" && "bg-emerald-50 text-emerald-600",
                                            type === "dislike" && "bg-gray-100 text-gray-500"
                                        )}>
                                            {type === "favorite" && <Heart className="w-5 h-5 fill-current" strokeWidth={0} />}
                                            {type === "like" && <ThumbsUp className="w-5 h-5" strokeWidth={2} />}
                                            {type === "dislike" && <ThumbsDown className="w-5 h-5" strokeWidth={2} />}
                                        </div>
                                        <h3 className="font-medium text-sm text-gray-900">{name}</h3>
                                    </div>
                                </div>
                            );
                        })()}
                    </div>
                ) : null}
            </DragOverlay>
        </DndContext>
    );
};
