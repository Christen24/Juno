import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createPortal } from 'react-dom';

export function DatePicker({ value, onChange, onClose, anchorRef }) {
    const [currentDate, setCurrentDate] = useState(value ? new Date(value) : new Date());
    const [selectedDate, setSelectedDate] = useState(value || '');
    const [coords, setCoords] = useState({ top: 0, left: 0 });

    useEffect(() => {
        if (anchorRef?.current) {
            const rect = anchorRef.current.getBoundingClientRect();
            // Check if it fits on the right, else move left?
            // For now, simple positioning
            setCoords({
                top: rect.bottom + 8,
                left: rect.left
            });
        }
    }, [anchorRef]);

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'];

    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = new Date(year, month, 1).getDay();

    const previousMonth = () => {
        setCurrentDate(new Date(year, month - 1, 1));
    };

    const nextMonth = () => {
        setCurrentDate(new Date(year, month + 1, 1));
    };

    const selectDate = (day) => {
        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        setSelectedDate(dateStr);
        onChange(dateStr);
        // Do not close immediately to allow seeing selection?
        // Or keep existing behavior
        setTimeout(onClose, 200);
    };

    const renderDays = () => {
        const days = [];
        const today = new Date();
        const isToday = (day) =>
            day === today.getDate() &&
            month === today.getMonth() &&
            year === today.getFullYear();

        // Empty cells for days before month starts
        for (let i = 0; i < firstDayOfMonth; i++) {
            days.push(<div key={`empty-${i}`} className="text-center py-2" />);
        }

        // Actual days
        for (let day = 1; day <= daysInMonth; day++) {
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const isSelected = dateStr === selectedDate;

            days.push(
                <motion.button
                    type="button"
                    key={day}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => selectDate(day)}
                    className={`relative text-center py-1 text-sm rounded-lg transition-all ${isSelected
                        ? 'bg-primary-500 text-white font-bold'
                        : isToday(day)
                            ? 'bg-primary-500/20 text-primary-400 font-semibold'
                            : 'hover:bg-white/10 text-white/80'
                        }`}
                >
                    {day}
                </motion.button>
            );
        }

        return days;
    };

    const content = (
        <motion.div
            initial={{ opacity: 0, scale: 0.9, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: -10 }}
            className="absolute z-[9999] glass-effect-dark border border-white/10 rounded-lg shadow-2xl p-3 min-w-[240px]"
            style={anchorRef ? { top: coords.top, left: coords.left, position: 'fixed' } : {}}
        >
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
                <motion.button
                    type="button"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={previousMonth}
                    className="p-1 hover:bg-white/10 rounded transition-colors"
                >
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                </motion.button>

                <h3 className="text-white font-semibold text-sm">
                    {monthNames[month]} {year}
                </h3>

                <motion.button
                    type="button"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={nextMonth}
                    className="p-1 hover:bg-white/10 rounded transition-colors"
                >
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                </motion.button>
            </div>

            {/* Weekday headers */}
            <div className="grid grid-cols-7 gap-1 mb-1">
                {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((day) => (
                    <div key={day} className="text-center text-[10px] text-white/50 font-semibold py-1">
                        {day}
                    </div>
                ))}
            </div>

            {/* Days grid */}
            <div className="grid grid-cols-7 gap-1">
                {renderDays()}
            </div>
        </motion.div>
    );

    if (anchorRef) {
        return createPortal(content, document.body);
    }

    return content;
}
