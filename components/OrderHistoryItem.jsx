"use client";

import React from "react";
import { Package, Utensils, Star, RotateCcw } from "lucide-react";

export const OrderHistoryItem = ({ order }) => {
    return (
        <div className="flex items-center justify-between p-4 bg-white rounded-xl border border-gray-100 hover:border-gray-200 hover:shadow-sm transition-all group">
            <div className="flex items-center gap-4">
                {/* Icon */}
                <div className="w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center text-gray-400 group-hover:bg-emerald-50 group-hover:text-emerald-500 transition-colors">
                    <Package className="w-5 h-5" />
                </div>

                {/* Info */}
                <div>
                    <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-gray-900">{order.restaurant}</h4>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${order.status === "Skipped"
                                ? "bg-gray-100 text-gray-500"
                                : "bg-emerald-100 text-emerald-700"
                            }`}>
                            {order.status}
                        </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">
                        {order.items.join(", ")} • ${order.total.toFixed(2)}
                    </p>
                </div>
            </div>

            {/* Actions / Date */}
            <div className="flex flex-col items-end gap-1">
                <span className="text-xs text-gray-400 font-medium">
                    {new Date(order.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                </span>
                <div className="flex gap-1">
                    {[...Array(order.rating)].map((_, i) => (
                        <Star key={i} className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                    ))}
                </div>
            </div>
        </div>
    );
};
