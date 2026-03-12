import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './RivalCard.css';

export type RivalStatus = 'idle' | 'active' | 'outbidding' | 'defeated';

interface RivalCardProps {
    name: string;
    status: RivalStatus;
}

export const RivalCard: React.FC<RivalCardProps> = ({ name, status }) => {
    // Mobile tactility vibration whenever status is active or outbidding
    useEffect(() => {
        if (status === 'outbidding' && navigator.vibrate) {
            // Aggressive vibration for outbidding
            navigator.vibrate([100, 50, 100, 50, 200]);
        } else if (status === 'active' && navigator.vibrate) {
            // Small pulse for sliding in
            navigator.vibrate(50);
        }
    }, [status]);

    return (
        <AnimatePresence>
            {status !== 'defeated' && (
                <motion.div
                    className={`rival-card-wrapper status-${status}`}
                    initial={{ y: -100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -100, opacity: 0, scale: 0.9 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                >
                    {status === 'outbidding' && (
                        <div className="steam-container">
                            <div className="steam-particle steam-left steam-d1" />
                            <div className="steam-particle steam-left steam-d2" />
                            <div className="steam-particle steam-right steam-d1" />
                            <div className="steam-particle steam-right steam-d3" />
                        </div>
                    )}
                    <div className="rival-card-inner">
                        <div className="rival-portrait">
                            {name.charAt(0)}
                        </div>
                        <div className="rival-info">
                            <span className="rival-name">{name}</span>
                            <span className="rival-status-text">
                                {status === 'outbidding' ? 'Outbidding!' : status}
                            </span>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};
