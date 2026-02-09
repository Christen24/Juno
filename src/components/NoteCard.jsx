import { motion } from 'framer-motion';
import { noteCardVariants } from '../utils/animations';
import { useState } from 'react';

export function NoteCard({ note, index, onDelete, onUpdate, theme }) {
    const [isEditing, setIsEditing] = useState(false);
    const [editContent, setEditContent] = useState(note.content);

    const handleSave = () => {
        if (editContent.trim()) {
            onUpdate(note.id, { content: editContent.trim() });
            setIsEditing(false);
        }
    };

    const formatReminderDate = (timestamp) => {
        if (!timestamp) return null;
        const date = new Date(timestamp);
        const now = new Date();
        const isToday = date.toDateString() === now.toDateString();

        if (isToday) {
            return `Today at ${date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`;
        }
        return date.toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const reminderText = formatReminderDate(note.reminderAt);

    return (
        <motion.div
            custom={index}
            variants={noteCardVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            layout
            className="group relative"
        >
            <div
                className="p-3 rounded-lg backdrop-blur-md border transition-all shadow-sm group-hover:shadow-md"
                style={{
                    backgroundColor: `var(--theme-card-bg)`,
                    borderColor: 'var(--theme-border)',
                    borderLeft: `3px solid ${note.color || 'var(--theme-accent)'}`,
                    // subtle tint of note color
                    boxShadow: theme === 'midnight' ? 'none' : undefined
                }}
            >
                {/* Content */}
                {isEditing ? (
                    <div className="space-y-2">
                        <textarea
                            value={editContent}
                            onChange={(e) => setEditContent(e.target.value)}
                            className="w-full px-2 py-1 bg-black/10 dark:bg-white/5 border border-white/10 rounded 
                       text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary-500/50"
                            style={{ color: 'var(--theme-text-primary)' }}
                            rows={3}
                            autoFocus
                        />
                        <div className="flex gap-2">
                            <button
                                onClick={handleSave}
                                className="px-3 py-1 bg-primary-500 text-white rounded text-xs hover:bg-primary-600 transition-colors"
                            >
                                Save
                            </button>
                            <button
                                onClick={() => {
                                    setEditContent(note.content);
                                    setIsEditing(false);
                                }}
                                className="px-3 py-1 bg-white/5 rounded text-xs hover:bg-white/10 transition-colors"
                                style={{ color: 'var(--theme-text-primary)' }}
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                ) : (
                    <>
                        <p className="text-sm leading-relaxed break-words" style={{ color: 'var(--theme-text-primary)' }}>
                            {note.content}
                        </p>

                        {/* Reminder badge */}
                        {reminderText && (
                            <div className="mt-2 flex items-center gap-1 text-xs" style={{ color: 'var(--theme-text-secondary)' }}>
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                                </svg>
                                <span>{reminderText}</span>
                            </div>
                        )}

                        {/* Timestamp */}
                        <div className="mt-2 text-xs" style={{ color: 'var(--theme-text-secondary)', opacity: 0.7 }}>
                            {new Date(note.createdAt).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                            })}
                        </div>
                    </>
                )}

                {/* Actions */}
                {!isEditing && (
                    <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                            onClick={() => setIsEditing(true)}
                            className="p-1.5 bg-white/10 hover:bg-white/20 rounded-md transition-colors"
                            title="Edit note"
                        >
                            <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                        </button>
                        <button
                            onClick={() => onDelete(note.id)}
                            className="p-1.5 bg-red-500/20 hover:bg-red-500/30 rounded-md transition-colors"
                            title="Delete note"
                        >
                            <svg className="w-3.5 h-3.5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                        </button>
                    </div>
                )}
            </div>
        </motion.div>
    );
}
