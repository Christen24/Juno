import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DatePicker } from './DatePicker';
import { TimePicker } from './TimePicker';

export function TaskInput({ onAdd, onCancel, theme }) {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [priority, setPriority] = useState('medium');
    const [selectedDate, setSelectedDate] = useState('');
    const [selectedTime, setSelectedTime] = useState('');
    const [showCalendar, setShowCalendar] = useState(false);
    const [showTimePicker, setShowTimePicker] = useState(false);

    const dateBtnRef = useRef(null);
    const timeBtnRef = useRef(null);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!title.trim()) return;

        let dueTimestamp = null;

        if (selectedDate) {
            // Ensure local time parsing
            const date = new Date(`${selectedDate}T00:00:00`);
            if (selectedTime) {
                const [h, m] = selectedTime.split(':').map(Number);
                date.setHours(h, m, 0, 0);
            } else {
                // Default to 9 AM if only date set
                date.setHours(9, 0, 0, 0);
            }
            dueTimestamp = date.getTime();
        }

        onAdd({
            title: title.trim(),
            description: description.trim(),
            priority,
            dueDate: dueTimestamp,
            reminderAt: dueTimestamp // Auto-set reminder for now
        });

        // Reset
        setTitle('');
        setDescription('');
        setPriority('medium');
        setSelectedDate('');
        setSelectedTime('');
    };

    const formatTimeDisplay = (timeStr) => {
        if (!timeStr) return 'Time';
        const [h, m] = timeStr.split(':').map(Number);
        const period = h >= 12 ? 'PM' : 'AM';
        const displayH = h % 12 || 12;
        return `${displayH}:${String(m).padStart(2, '0')} ${period}`;
    };

    const formatDateDisplay = (dateStr) => {
        if (!dateStr) return 'Date';
        // Parse manually to avoid timezone issues for display
        const [y, m, d] = dateStr.split('-').map(Number);
        const date = new Date(y, m - 1, d);
        return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    };

    const handleTimeClick = () => {
        if (!selectedDate) {
            // Auto-select today if no date set
            const now = new Date();
            const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
            setSelectedDate(todayStr);
        }
        setShowTimePicker(!showTimePicker);
        setShowCalendar(false);
    };

    const priorities = [
        { id: 'low', color: 'bg-blue-500', label: 'Low' },
        { id: 'medium', color: 'bg-yellow-500', label: 'Med' },
        { id: 'high', color: 'bg-red-500', label: 'High' }
    ];

    return (
        <motion.form
            onSubmit={handleSubmit}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-4 rounded-xl border mb-4 space-y-4 shadow-lg backdrop-blur-md relative z-10"
            style={{
                backgroundColor: 'var(--theme-card-bg)',
                borderColor: 'var(--theme-border)'
            }}
        >
            {/* Title */}
            <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="What needs to be done?"
                className="w-full text-lg font-medium bg-transparent border-none placeholder-opacity-50 focus:outline-none focus:ring-1 focus:ring-black rounded-sm p-0"
                style={{ color: 'var(--theme-text-primary)' }}
                autoFocus
            />

            {/* Description */}
            <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Details (optional)"
                rows={2}
                className="w-full text-sm bg-transparent border-none resize-none placeholder-opacity-50 focus:outline-none focus:ring-1 focus:ring-black rounded-sm p-0"
                style={{ color: 'var(--theme-text-secondary)' }}
            />

            {/* Toolbar */}
            <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-white/10">

                {/* Priority Selector */}
                <div className="flex gap-1 p-1 rounded-lg bg-black/10 dark:bg-white/5">
                    {priorities.map(p => (
                        <button
                            key={p.id}
                            type="button"
                            onClick={() => setPriority(p.id)}
                            className={`px-2 py-1 rounded text-[10px] font-bold uppercase transition-all ${priority === p.id
                                ? `${p.color} text-white shadow-sm`
                                : 'text-zinc-500 hover:text-zinc-300'
                                }`}
                        >
                            {p.label}
                        </button>
                    ))}
                </div>

                {/* Date Picker Toggle */}
                <div className="relative">
                    <button
                        ref={dateBtnRef}
                        type="button"
                        onClick={() => { setShowCalendar(!showCalendar); setShowTimePicker(false); }}
                        className={`flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs transition-colors ${selectedDate
                            ? 'bg-primary-500/20 text-primary-400'
                            : 'hover:bg-white/10 text-zinc-400'
                            }`}
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        {formatDateDisplay(selectedDate)}
                    </button>

                    <AnimatePresence>
                        {showCalendar && (
                            <DatePicker
                                anchorRef={dateBtnRef}
                                value={selectedDate}
                                onChange={(date) => {
                                    setSelectedDate(date);
                                    // Auto open time picker after short delay to allow DatePicker to close smoothly?
                                    // Or just open it?
                                    // DatePicker closes via setTimeout inside itself.
                                    // But updating state here causes re-render.
                                    setTimeout(() => setShowTimePicker(true), 100);
                                }}
                                onClose={() => setShowCalendar(false)}
                            />
                        )}
                    </AnimatePresence>
                </div>

                {/* Time Picker Toggle */}
                <div className="relative">
                    <button
                        ref={timeBtnRef}
                        type="button"
                        onClick={handleTimeClick}
                        className={`flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs transition-colors ${selectedTime
                            ? 'bg-primary-500/20 text-primary-400'
                            : 'hover:bg-white/10 text-zinc-400'
                            }`}
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {formatTimeDisplay(selectedTime)}
                    </button>

                    <AnimatePresence>
                        {showTimePicker && selectedDate && (
                            <TimePicker
                                anchorRef={timeBtnRef}
                                value={selectedTime}
                                onChange={(time) => setSelectedTime(time)}
                                onClose={() => setShowTimePicker(false)}
                            />
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-2">
                <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-primary-500 text-white rounded-lg text-sm font-medium hover:bg-primary-600 transition-colors shadow-lg shadow-primary-500/30"
                >
                    Create Task
                </button>
                <button
                    type="button"
                    onClick={onCancel}
                    className="px-4 py-2 rounded-lg text-sm transition-colors hover:bg-white/10 border border-white/10"
                    style={{ color: 'var(--theme-text-primary)' }}
                >
                    Cancel
                </button>
            </div>
        </motion.form>
    );
}
