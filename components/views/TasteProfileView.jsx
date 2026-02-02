"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, ThumbsUp, ThumbsDown, X, GripVertical } from "lucide-react";
import { useAppContext } from "@/components/providers/AppProvider";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { DndContext, DragOverlay, closestCenter, PointerSensor, useSensor, useSensors, useDroppable } from '@dnd-kit/core';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

function cn(...inputs) { return twMerge(clsx(inputs)); }

// Draggable Card Component
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
            exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
            className={cn(
                "group relative p-4 rounded-2xl border transition-all duration-300 hover:shadow-md cursor-grab active:cursor-grabbing",
                isSortableDragging && "shadow-2xl scale-105 rotate-2",
                type === "favorite" && "bg-gradient-to-br from-rose-50 to-orange-50/50 border-rose-100",
                type === "like" && "bg-emerald-50/50 border-emerald-100",
                type === "dislike" && "bg-gray-50 border-gray-100 opacity-80 hover:opacity-100"
            )}
            {...attributes}
            {...listeners}
        >
            <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3 flex-1">
                    <div className={cn(
                        "w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm",
                        type === "favorite" && "bg-white text-rose-500",
                        type === "like" && "bg-white text-emerald-500",
                        type === "dislike" && "bg-white text-gray-400"
                    )}>
                        {type === "favorite" && <Heart className="w-5 h-5 fill-current" />}
                        {type === "like" && <ThumbsUp className="w-5 h-5" />}
                        {type === "dislike" && <ThumbsDown className="w-5 h-5" />}
                    </div>
                    <div className="flex-1">
                        <h3 className="font-bold text-sm text-gray-900 leading-tight">{mealName}</h3>
                        <p className={cn(
                            "text-[10px] font-medium mt-0.5",
                            type === "favorite" && "text-rose-600",
                            type === "like" && "text-emerald-600",
                            type === "dislike" && "text-gray-500"
                        )}>
                            {type === "favorite" && "Highest Priority"}
                            {type === "like" && "Preferred"}
                            {type === "dislike" && "Blocked"}
                        </p>
                    </div>
                </div>

                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onRemove();
                    }}
                    className="p-1.5 rounded-full bg-white/50 hover:bg-white text-gray-400 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                    title="Remove review"
                >
                    <X className="w-3.5 h-3.5" />
                </button>
            </div>
        </motion.div>
    );
};

// Drop Zone Component
const DropZone = ({ id, title, icon: Icon, count, items, type, isOver, onRemove }) => {
    const { setNodeRef } = useDroppable({ id });

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-2 mb-2">
                <Icon className={cn(
                    "w-4 h-4",
                    type === "favorite" && "text-rose-500 fill-rose-500",
                    type === "like" && "text-emerald-500",
                    type === "dislike" && "text-gray-400"
                )} />
                <h2 className={cn(
                    "font-bold text-sm tracking-wide",
                    type === "dislike" ? "text-gray-500" : "text-gray-900"
                )}>{title}</h2>
                <span className={cn(
                    "text-[10px] font-bold px-2 py-0.5 rounded-full",
                    type === "favorite" && "bg-rose-100 text-rose-600",
                    type === "like" && "bg-emerald-100 text-emerald-600",
                    type === "dislike" && "bg-gray-100 text-gray-500"
                )}>{count}</span>
            </div>

            <div
                ref={setNodeRef}
                className={cn(
                    "space-y-3 min-h-[200px] p-3 rounded-2xl transition-all duration-300",
                    isOver && "bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-dashed border-blue-300 scale-[1.02]"
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
                                "p-8 rounded-2xl border border-dashed text-center transition-all duration-300",
                                isOver ? "border-blue-300 bg-blue-50/50" : "border-gray-200"
                            )}
                        >
                            <Icon className={cn(
                                "w-8 h-8 mx-auto mb-2 transition-colors",
                                isOver ? "text-blue-300" : "text-gray-200"
                            )} />
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
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
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
            // Check which list contains this meal
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

    // Get all meal ids for sortable context
    const allItems = [...favsList, ...likesList, ...dislikesList].map(([name]) => name);

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragEnd={handleDragEnd}
            onDragCancel={handleDragCancel}
        >
            <div className="space-y-8 pb-20 fade-in animate-in slide-in-from-bottom-4 duration-500">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                            Taste Profile
                        </h1>
                        <p className="text-gray-500">Drag meals between columns to update your preferences.</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6" id="drop-zones">
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

            <DragOverlay>
                {activeId ? (
                    <div className="cursor-grabbing">
                        {/* Find the active item and render a preview */}
                        {(() => {
                            const item = activeReviews.find(([name]) => name === activeId);
                            if (!item) return null;
                            const [name, data] = item;
                            const type = data.isFavorite ? 'favorite' : (data.liked ? 'like' : 'dislike');
                            return (
                                <div className={cn(
                                    "p-4 rounded-2xl border shadow-2xl scale-105 rotate-2",
                                    type === "favorite" && "bg-gradient-to-br from-rose-50 to-orange-50/50 border-rose-200",
                                    type === "like" && "bg-emerald-50 border-emerald-200",
                                    type === "dislike" && "bg-gray-50 border-gray-200"
                                )}>
                                    <div className="flex items-center gap-3">
                                        <div className={cn(
                                            "w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm",
                                            type === "favorite" && "bg-white text-rose-500",
                                            type === "like" && "bg-white text-emerald-500",
                                            type === "dislike" && "bg-white text-gray-400"
                                        )}>
                                            {type === "favorite" && <Heart className="w-5 h-5 fill-current" />}
                                            {type === "like" && <ThumbsUp className="w-5 h-5" />}
                                            {type === "dislike" && <ThumbsDown className="w-5 h-5" />}
                                        </div>
                                        <h3 className="font-bold text-sm text-gray-900">{name}</h3>
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
