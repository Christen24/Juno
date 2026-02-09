import { motion, AnimatePresence } from 'framer-motion';
import { useState, useRef, useEffect } from 'react';
import { DatePicker } from './DatePicker';
import { TimePicker } from './TimePicker';

export function TaskItem({ task, onToggle, onDelete, onUpdate, theme }) {
    const [isEditing, setIsEditing] = useState(false);
    const [editTitle, setEditTitle] = useState(task.title);
    const [editDate, setEditDate] = useState('');
    const [editTime, setEditTime] = useState('');
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [showTimePicker, setShowTimePicker] = useState(false);

    const dateBtnRef = useRef(null);
    const timeBtnRef = useRef(null);

    // Initialize edit state when entering edit mode
    useEffect(() => {
        if (isEditing) {
            setEditTitle(task.title);
            if (task.dueDate) {
                const date = new Date(task.dueDate);
                const year = date.getFullYear();
                const month = String(date.getMonth() + 1).padStart(2, '0');
                const day = String(date.getDate()).padStart(2, '0');
                setEditDate(`${year}-${month}-${day}`);

                const hours = String(date.getHours()).padStart(2, '0');
                const minutes = String(date.getMinutes()).padStart(2, '0');
                setEditTime(`${hours}:${minutes}`);
            } else {
                setEditDate('');
                setEditTime('');
            }
        }
    }, [isEditing, task]);

    const isOverdue = !task.completed && task.dueDate && task.dueDate < Date.now();

    const getPriorityColor = (p) => {
        switch (p) {
            case 'high': return 'bg-red-500 text-white';
            case 'medium': return 'bg-yellow-500 text-white';
            case 'low': return 'bg-blue-500 text-white';
            default: return 'bg-slate-500 text-white';
        }
    };

    const formatDueDate = (timestamp) => {
        if (!timestamp) return null;
        const date = new Date(timestamp);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
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
        const [y, m, d] = dateStr.split('-').map(Number);
        const date = new Date(y, m - 1, d);
        return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    };

    const handleSave = () => {
        if (editTitle.trim()) {
            let dueTimestamp = null;
            if (editDate) {
                const date = new Date(`${editDate}T00:00:00`);
                if (editTime) {
                    const [h, m] = editTime.split(':').map(Number);
                    date.setHours(h, m, 0, 0);
                } else {
                    date.setHours(9, 0, 0, 0); // Default 9 AM
                }
                dueTimestamp = date.getTime();
            }

            onUpdate(task.id, {
                title: editTitle.trim(),
                dueDate: dueTimestamp,
                reminderAt: dueTimestamp // Sync reminder with due date
            });
            setIsEditing(false);
        }
    };

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className={`group relative p-3 rounded-lg border transition-all ${task.completed ? 'opacity-60' : ''
                }`}
            style={{
                backgroundColor: 'var(--theme-card-bg)',
                borderColor: isOverdue ? '#ef4444' : 'var(--theme-border)',
                boxShadow: isOverdue ? '0 0 10px rgba(239, 68, 68, 0.1)' : 'none'
            }}
        >
            <div className="flex items-start gap-3">
                {/* Checkbox */}
                <button
                    onClick={() => onToggle(task.id, !task.completed)}
                    className={`mt-1 w-5 h-5 rounded border flex items-center justify-center transition-colors ${task.completed
                        ? 'bg-primary-500 border-primary-500 text-white'
                        : 'border-slate-400 hover:border-primary-500'
                        }`}
                >
                    {task.completed && (
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                    )}
                </button>

                {/* Content */}
                <div className="flex-1 min-w-0">
                    {isEditing ? (
                        <div className="space-y-2">
                            <input
                                type="text"
                                value={editTitle}
                                onChange={(e) => setEditTitle(e.target.value)}
                                className="w-full px-2 py-1 bg-black/10 dark:bg-white/5 border border-white/10 rounded text-sm focus:outline-none focus:ring-1 focus:ring-primary-500"
                                style={{ color: 'var(--theme-text-primary)' }}
                                autoFocus
                                onKeyDown={(e) => e.key === 'Enter' && handleSave()}
                            />

                            <div className="flex items-center gap-2">
                                {/* Date Picker Toggle */}
                                <div className="relative">
                                    <button
                                        ref={dateBtnRef}
                                        type="button"
                                        onClick={() => { setShowDatePicker(!showDatePicker); setShowTimePicker(false); }}
                                        className={`flex items-center gap-1 px-2 py-1 rounded text-xs border transition-colors ${editDate
                                            ? 'bg-primary-500/10 border-primary-500/30 text-primary-400'
                                            : 'border-white/10 hover:bg-white/5 text-zinc-400'
                                            }`}
                                    >
                                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                        {formatDateDisplay(editDate)}
                                    </button>

                                    <AnimatePresence>
                                        {showDatePicker && (
                                            <DatePicker
                                                anchorRef={dateBtnRef}
                                                value={editDate}
                                                onChange={(date) => {
                                                    setEditDate(date);
                                                    setTimeout(() => setShowTimePicker(true), 100);
                                                }}
                                                onClose={() => setShowDatePicker(false)}
                                            />
                                        )}
                                    </AnimatePresence>
                                </div>

                                {/* Time Picker Toggle */}
                                <div className="relative">
                                    <button
                                        ref={timeBtnRef}
                                        type="button"
                                        onClick={() => { setShowTimePicker(!showTimePicker); setShowDatePicker(false); }}
                                        className={`flex items-center gap-1 px-2 py-1 rounded text-xs border transition-colors ${editTime
                                            ? 'bg-primary-500/10 border-primary-500/30 text-primary-400'
                                            : 'border-white/10 hover:bg-white/5 text-zinc-400'
                                            }`}
                                    >
                                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        {formatTimeDisplay(editTime)}
                                    </button>

                                    <AnimatePresence>
                                        {showTimePicker && editDate && (
                                            <TimePicker
                                                anchorRef={timeBtnRef}
                                                value={editTime}
                                                onChange={(time) => setEditTime(time)}
                                                onClose={() => setShowTimePicker(false)}
                                            />
                                        )}
                                    </AnimatePresence>
                                </div>
                            </div>

                            <div className="flex gap-2 justify-end">
                                <button
                                    onClick={() => setIsEditing(false)}
                                    className="px-2 py-1 text-xs rounded hover:bg-white/10 opacity-70 hover:opacity-100"
                                    style={{ color: 'var(--theme-text-primary)' }}
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSave}
                                    className="px-3 py-1 text-xs bg-primary-500 text-white rounded hover:bg-primary-600 shadow-lg shadow-primary-500/30"
                                >
                                    Save
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div>
                            <div className="flex items-center gap-2">
                                <span
                                    className={`text-sm font-medium truncate ${task.completed ? 'line-through' : ''}`}
                                    style={{ color: 'var(--theme-text-primary)' }}
                                >
                                    {task.title}
                                </span>
                                {/* Priority Badge */}
                                <span className={`text-[10px] px-1.5 py-0.5 rounded-full uppercase font-bold tracking-wide ${getPriorityColor(task.priority)}`}>
                                    {task.priority}
                                </span>
                            </div>

                            {task.description && (
                                <p className="text-xs mt-1 line-clamp-2" style={{ color: 'var(--theme-text-secondary)' }}>
                                    {task.description}
                                </p>
                            )}

                            {/* Due Date & Reminder */}
                            {(task.dueDate || task.reminderAt) && (
                                <div className="flex items-center gap-3 mt-2 text-xs" style={{ color: isOverdue ? '#ef4444' : 'var(--theme-text-secondary)' }}>
                                    {task.dueDate && (
                                        <div className="flex items-center gap-1">
                                            <svg className="w-3 h-3 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                            </svg>
                                            <span className={isOverdue ? 'font-bold' : ''}>
                                                {formatDueDate(task.dueDate)}
                                                {isOverdue ? ' (Overdue)' : ''}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Actions */}
                {!isEditing && (
                    <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                            onClick={() => setIsEditing(true)}
                            className="p-1 rounded hover:bg-white/10 transition-colors"
                            style={{ color: 'var(--theme-text-secondary)' }}
                        >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                        </button>
                        <button
                            onClick={() => onDelete(task.id)}
                            className="p-1 rounded hover:bg-red-500/20 text-red-400 transition-colors"
                        >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                        </button>
                    </div>
                )}
            </div>
        </motion.div>
    );
}
