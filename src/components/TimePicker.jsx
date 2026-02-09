import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { createPortal } from 'react-dom';

export function TimePicker({ value, onChange, onClose, anchorRef }) {
    // Initialize with current time if no value provided
    const [time, setTime] = useState(() => {
        if (value) return value;
        const now = new Date();
        const h = String(now.getHours()).padStart(2, '0');
        const m = String(now.getMinutes()).padStart(2, '0');
        return `${h}:${m}`;
    });

    const [coords, setCoords] = useState({ top: 0, left: 0 });

    useEffect(() => {
        if (anchorRef?.current) {
            const rect = anchorRef.current.getBoundingClientRect();
            setCoords({
                top: rect.bottom + 8, // 8px gap
                left: rect.left
            });
        }
    }, [anchorRef]);

    const [hours, minutes] = time.split(':').map(Number);
    const [isAM, setIsAM] = useState(hours < 12);

    const updateHour = (delta) => {
        let newHour = hours + delta;
        if (newHour < 0) newHour = 23;
        if (newHour > 23) newHour = 0;

        const newTime = `${String(newHour).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
        setTime(newTime);
        onChange(newTime);
        setIsAM(newHour < 12);
    };

    const updateMinute = (delta) => {
        let newMinute = minutes + delta;
        if (newMinute < 0) newMinute = 59;
        if (newMinute > 59) newMinute = 0;

        const newTime = `${String(hours).padStart(2, '0')}:${String(newMinute).padStart(2, '0')}`;
        setTime(newTime);
        onChange(newTime);
    };

    const toggleAMPM = () => {
        let newHour = hours;
        if (isAM) {
            newHour = hours + 12;
            if (newHour === 24) newHour = 12;
        } else {
            newHour = hours - 12;
            if (newHour === 0) newHour = 12;
        }

        const newTime = `${String(newHour).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
        setTime(newTime);
        onChange(newTime);
        setIsAM(!isAM);
    };

    const handleDone = () => {
        onClose();
    };

    const displayHour = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;

    const content = (
        <motion.div
            initial={{ opacity: 0, scale: 0.9, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: -10 }}
            className="absolute z-[9999] glass-effect-dark border border-white/10 rounded-lg shadow-2xl p-3 min-w-[180px]"
            style={anchorRef ? { top: coords.top, left: coords.left, position: 'fixed' } : {}}
        >
            <h3 className="text-white font-semibold mb-3 text-center text-sm">Select Time</h3>

            <div className="flex items-center justify-center gap-2 mb-3">
                {/* Hours */}
                <div
                    className="flex flex-col items-center gap-1"
                    onWheel={(e) => { e.preventDefault(); updateHour(e.deltaY < 0 ? 1 : -1); }}
                >
                    <motion.button
                        type="button"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => updateHour(1)}
                        className="p-1 hover:bg-white/10 rounded transition-colors"
                    >
                        <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                        </svg>
                    </motion.button>

                    <div className="bg-primary-500/20 rounded-lg px-2 py-1 min-w-[40px] text-center cursor-ns-resize" title="Scroll to change">
                        <span className="text-white text-xl font-bold">{String(displayHour).padStart(2, '0')}</span>
                    </div>

                    <motion.button
                        type="button"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => updateHour(-1)}
                        className="p-1 hover:bg-white/10 rounded transition-colors"
                    >
                        <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                    </motion.button>
                </div>

                <span className="text-white text-xl font-bold">:</span>

                {/* Minutes */}
                <div
                    className="flex flex-col items-center gap-1"
                    onWheel={(e) => { e.preventDefault(); updateMinute(e.deltaY < 0 ? 1 : -1); }}
                >
                    <motion.button
                        type="button"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => updateMinute(1)}
                        className="p-1 hover:bg-white/10 rounded transition-colors"
                    >
                        <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                        </svg>
                    </motion.button>

                    <div className="bg-primary-500/20 rounded-lg px-2 py-1 min-w-[40px] text-center cursor-ns-resize" title="Scroll to change">
                        <span className="text-white text-xl font-bold">{String(minutes).padStart(2, '0')}</span>
                    </div>

                    <motion.button
                        type="button"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => updateMinute(-1)}
                        className="p-1 hover:bg-white/10 rounded transition-colors"
                    >
                        <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                    </motion.button>
                </div>

                {/* AM/PM Toggle */}
                <div className="flex flex-col items-center">
                    <motion.button
                        type="button"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={toggleAMPM}
                        className="bg-primary-500/20 rounded-lg px-2 py-1 text-white font-semibold text-xs hover:bg-primary-500/30 transition-colors"
                    >
                        {isAM ? 'AM' : 'PM'}
                    </motion.button>
                </div>
            </div>

            <motion.button
                type="button"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleDone}
                className="w-full px-3 py-1.5 text-sm bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-lg font-medium hover:from-primary-600 hover:to-primary-700 transition-all shadow-lg shadow-primary-500/30"
            >
                Done
            </motion.button>
        </motion.div>
    );

    if (anchorRef) {
        return createPortal(content, document.body);
    }

    return content;
}
