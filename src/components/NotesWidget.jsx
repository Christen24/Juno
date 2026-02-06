import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { NoteInput } from './NoteInput';
import { NotesList } from './NotesList';
import { Settings } from './Settings';
import { contentVariants } from '../utils/animations';

export function NotesWidget({
    isExpanded,
    notes,
    onAddNote,
    onDeleteNote,
    onUpdateNote,
    onCollapse,
    theme,
    onToggleTheme
}) {
    const [showSettings, setShowSettings] = useState(false);

    if (!isExpanded) return null;

    return (
        <motion.div
            variants={contentVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            className={`w-full h-full flex flex-col rounded-2xl overflow-hidden shadow-2xl ${theme === 'dark' ? 'glass-effect-dark' : 'glass-effect-light'
                }`}
        >
            {/* Header */}
            <div className={`drag-region px-4 py-3 border-b flex items-center justify-between bg-gradient-to-r from-primary-600/20 to-purple-600/20 ${theme === 'dark' ? 'border-white/10' : 'border-slate-300/50'
                }`}>
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-purple-600 flex items-center justify-center shadow-lg">
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                    </div>
                    <h1 className={`font-semibold text-lg ${theme === 'dark' ? 'text-white' : 'text-slate-800'}`}>Juno</h1>
                </div>

                <div className="flex items-center gap-1 no-drag-region">
                    <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setShowSettings(!showSettings)}
                        className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                        title="Settings"
                    >
                        <svg className={`w-5 h-5 ${theme === 'dark' ? 'text-white' : 'text-slate-700'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                    </motion.button>

                    <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={onCollapse}
                        className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                        title="Minimize"
                    >
                        <svg className={`w-5 h-5 ${theme === 'dark' ? 'text-white' : 'text-slate-700'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                        </svg>
                    </motion.button>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 flex flex-col overflow-hidden">
                <AnimatePresence>
                    {showSettings ? (
                        <Settings
                            theme={theme}
                            onToggleTheme={onToggleTheme}
                            onClose={() => setShowSettings(false)}
                        />
                    ) : (
                        <>
                            <NoteInput onAdd={onAddNote} theme={theme} />

                            <div className="flex-1 overflow-hidden relative">
                                <NotesList
                                    notes={notes}
                                    theme={theme}
                                    onDelete={onDeleteNote}
                                    onUpdate={onUpdateNote}
                                />
                            </div>
                        </>
                    )}
                </AnimatePresence>
            </div>

            {/* Footer */}
            <div className={`px-4 py-2 border-t ${theme === 'dark' ? 'border-white/10 bg-black/20' : 'border-slate-300/50 bg-slate-100/50'}`}>
                <div className={`flex items-center justify-between text-xs ${theme === 'dark' ? 'text-white/50' : 'text-slate-600'}`}>
                    <span>{notes.length} {notes.length === 1 ? 'note' : 'notes'}</span>
                    <span>Ctrl+Shift+N to toggle</span>
                </div>
            </div>

            {/* Resize handle indicator - bottom right corner */}
            <div
                className="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize opacity-50 hover:opacity-100 transition-opacity"
                style={{
                    backgroundImage: 'linear-gradient(135deg, transparent 50%, rgba(255,255,255,0.3) 50%)',
                }}
                title="Drag to resize"
            />
        </motion.div>
    );
}
