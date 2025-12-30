"use client";
import React from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/lib/types';

const GRADIENTS = [
    "bg-gradient-to-bl from-zinc-800 to-black border-white/10",
    "bg-gradient-to-bl from-zinc-700 to-zinc-900 border-white/10",
    "bg-gradient-to-bl from-zinc-600 to-zinc-800 border-white/10",
    "bg-gradient-to-bl from-zinc-900 to-slate-900 border-white/10"
];

interface CardStackProps {
    cards: Card[];
    onSelect: (card: Card) => void;
    activeId: string;
}

export function CardStack({ cards, onSelect, activeId }: CardStackProps) {
    if (!cards || cards.length === 0) {
        return (
            <div className="h-[320px] w-full max-w-[380px] mx-auto flex items-center justify-center border border-dashed border-zinc-700 rounded-3xl">
                <p className="text-zinc-500">No cards found</p>
            </div>
        );
    }

    return (
        <div className="relative h-[320px] w-full max-w-[380px] mx-auto perspective-1000">
            {cards.map((card, index) => {
                const isActive = activeId === card.id;

                const offset = index * 50;
                const z = 30 - index;
                const gradientClass = GRADIENTS[index % GRADIENTS.length];

                return (
                    <motion.div
                        key={card.id}
                        onClick={() => onSelect(card)}
                        initial={false}
                        animate={{
                            scale: isActive ? 1.05 : 1,
                            opacity: isActive ? 1 : 0.6,
                            zIndex: isActive ? 50 : z,
                        }}
                        transition={{ type: "spring", stiffness: 260, damping: 20 }}
                        className={`absolute top-0 left-0 w-full h-[220px] rounded-3xl p-6 flex flex-col justify-between shadow-2xl cursor-pointer border ${gradientClass} ${isActive ? 'ring-2 ring-white/20' : ''}`}
                        style={{
                            transformOrigin: "top center",
                            top: `${index * 60}px`
                        }}
                    >
                        {/* Card Content matches reference */}
                        <div className="flex justify-between items-start">
                            <div className="flex flex-col">
                                <span className="text-xs font-bold text-zinc-400">{card.name}</span>
                                <div className="mt-4 flex items-center gap-2">
                                    <div className="w-8 h-5 bg-yellow-500/20 rounded flex items-center justify-center border border-yellow-500/50">
                                        <div className="w-4 h-4 bg-yellow-500/50 rounded-full blur-[2px]"></div>
                                    </div>
                                    <div className="w-4 h-4 text-zinc-600">
                                        {/* Wifi Icon fake */}
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12.55a11 11 0 0 1 14.08 0"></path><path d="M1.42 9a16 16 0 0 1 21.16 0"></path><path d="M8.53 16.11a6 6 0 0 1 6.95 0"></path><line x1="12" y1="20" x2="12.01" y2="20"></line></svg>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div>
                            <div className="font-mono text-xl text-white tracking-widest shadow-black drop-shadow-md mb-4">
                                **** **** **** {card.last_4}
                            </div>
                            <div className="flex justify-between items-end">
                                <div>
                                    <div className="text-sm font-bold text-white">${card.balance}</div>
                                    <div className="text-[10px] text-zinc-500 font-bold uppercase">MAHFUZUL NABIL</div>
                                </div>

                                {/* Brand Logo */}
                                <div className="h-8 w-12 bg-white rounded flex items-center justify-center italic font-black text-blue-900 text-xs">
                                    {card.type === 'PHYSICAL' ? 'MC' : 'VISA'}
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )
            })}
        </div>
    )
}
