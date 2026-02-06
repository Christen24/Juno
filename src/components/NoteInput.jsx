import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DatePicker } from './DatePicker';
import { TimePicker } from './TimePicker';

const NOTE_COLORS = [
    '#3b82f6', // Blue
    '#ef4444', // Red
    '#22c55e', // Green
    '#eab308', // Yellow
    '#ffffff', // White
];

export function NoteInput({ onAdd, onCancel, theme }) {
    const [content, setContent] = useState('');
    const [color, setColor] = useState(NOTE_COLORS[0]);
    const [reminderDate, setReminderDate] = useState('');
    const [reminderTime, setReminderTime] = useState('');
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [showTimePicker, setShowTimePicker] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!content.trim()) return;

        let reminderAt = null;
        if (reminderDate && reminderTime) {
            reminderAt = new Date(`${reminderDate}T${reminderTime}`).getTime();
        }

        console.log('Adding note with color:', color); // Debug log

        onAdd({
            content: content.trim(),
            color,
            reminderAt,
        });

        // Reset form
        setContent('');
        setColor(NOTE_COLORS[0]);
        setReminderDate('');
        setReminderTime('');
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return 'Select Date';
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    };

    const formatTime = (timeStr) => {
        if (!timeStr) return 'Select Time';
        const [hours, minutes] = timeStr.split(':').map(Number);
        const period = hours >= 12 ? 'PM' : 'AM';
        const displayHours = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
        return `${displayHours}:${String(minutes).padStart(2, '0')} ${period}`;
    };

    return (
        <motion.form
            onSubmit={handleSubmit}
            className="p-4 space-y-3"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
        >
            {/* Note input */}
            <div>
                <textarea
                    autoFocus
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="What's on your mind?"
                    className={`w-full px-3 py-2 border rounded-lg resize-none focus:outline-none focus:ring-2 
                   focus:ring-primary-500/50 transition-all ${theme === 'dark'
                            ? 'bg-white/5 border-white/10 text-white placeholder-white/50'
                            : 'bg-slate-50 border-slate-300 text-slate-800 placeholder-slate-400'
                        }`}
                    rows={3}
                />
            </div>

            {/* Color picker */}
            <div className="flex items-center gap-2">
                <span className={`text-xs font-semibold ${theme === 'dark' ? 'text-white/60' : 'text-slate-600'
                    }`}>Color of the note:</span>
                <div className="flex gap-2">
                    {NOTE_COLORS.map((noteColor) => (
                        <motion.button
                            key={noteColor}
                            type="button"
                            onClick={() => setColor(noteColor)}
                            whileHover={{ scale: 1.15 }}
                            whileTap={{ scale: 0.95 }}
                            className="w-7 h-7 rounded-full transition-all relative shadow-lg"
                            style={{ backgroundColor: noteColor }}
                        >
                            {color === noteColor && (
                                <motion.div
                                    layoutId="color-selector"
                                    className="absolute inset-0 rounded-full ring-2 ring-white ring-offset-2 ring-offset-transparent"
                                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                                />
                            )}
                        </motion.button>
                    ))}
                </div>
            </div>

            {/* Reminder */}
            <div className="space-y-2 relative">
                <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                    </svg>
                    <span className={`text-xs font-semibold ${theme === 'dark' ? 'text-white/60' : 'text-slate-600'
                        }`}>Set Reminder (Optional):</span>
                </div>

                <div className="flex gap-2 relative">
                    <div className="flex-1 relative">
                        <button
                            type="button"
                            onClick={() => {
                                setShowDatePicker(!showDatePicker);
                                setShowTimePicker(false);
                            }}
                            className={`w-full px-3 py-2 text-sm border rounded-lg transition-all text-left flex items-center justify-between ${theme === 'dark'
                                ? 'bg-white/5 border-white/10 text-white hover:bg-white/10'
                                : 'bg-slate-50 border-slate-300 text-slate-800 hover:bg-slate-100'
                                }`}
                        >
                            <span>{formatDate(reminderDate)}</span>
                            <svg className={`w-4 h-4 ${theme === 'dark' ? 'text-white/50' : 'text-slate-500'
                                }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                        </button>

                        <AnimatePresence>
                            {showDatePicker && (
                                <DatePicker
                                    value={reminderDate}
                                    onChange={(date) => {
                                        setReminderDate(date);
                                        setShowDatePicker(false);
                                    }}
                                    onClose={() => setShowDatePicker(false)}
                                />
                            )}
                        </AnimatePresence>
                    </div>

                    <div className="flex-1 relative">
                        <button
                            type="button"
                            onClick={() => {
                                setShowTimePicker(!showTimePicker);
                                setShowDatePicker(false);
                            }}
                            className={`w-full px-3 py-2 text-sm border rounded-lg transition-all text-left flex items-center justify-between ${theme === 'dark'
                                ? 'bg-white/5 border-white/10 text-white hover:bg-white/10'
                                : 'bg-slate-50 border-slate-300 text-slate-800 hover:bg-slate-100'
                                }`}
                        >
                            <span>{formatTime(reminderTime)}</span>
                            <svg className={`w-4 h-4 ${theme === 'dark' ? 'text-white/50' : 'text-slate-500'
                                }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </button>

                        <AnimatePresence>
                            {showTimePicker && (
                                <TimePicker
                                    value={reminderTime}
                                    onChange={(time) => {
                                        setReminderTime(time);
                                    }}
                                    onClose={() => setShowTimePicker(false)}
                                />
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-2">
                <button
                    type="submit"
                    disabled={!content.trim()}
                    className="flex-1 px-4 py-2 bg-gradient-to-r from-primary-500 to-primary-600 
                   text-white rounded-lg font-medium hover:from-primary-600 hover:to-primary-700 
                   transition-all disabled:opacity-50 disabled:cursor-not-allowed 
                   shadow-lg shadow-primary-500/30"
                >
                    Add Note
                </button>
                {onCancel && (
                    <button
                        type="button"
                        onClick={onCancel}
                        className={`px-4 py-2 rounded-lg transition-all border ${theme === 'dark'
                            ? 'bg-white/5 hover:bg-white/10 text-white border-white/10'
                            : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-300'
                            }`}
                    >
                        Cancel
                    </button>
                )}
            </div>
        </motion.form>
    );
}
