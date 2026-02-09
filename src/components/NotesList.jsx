import { motion, AnimatePresence } from 'framer-motion';
import { NoteCard } from './NoteCard';
import { listVariants } from '../utils/animations';

export function NotesList({ notes, onDelete, onUpdate, theme }) {
    if (notes.length === 0) {
        return (
            <div className="flex-1 flex items-center justify-center p-8">
                <div className="text-center space-y-2">
                    <div className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center ${theme === 'dark' ? 'bg-white/5' : 'bg-slate-200'
                        }`}>
                        <svg className={`w-8 h-8 ${theme === 'dark' ? 'text-white/30' : 'text-slate-400'
                            }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                    </div>
                    <p className={`text-sm ${theme === 'dark' ? 'text-white/50' : 'text-slate-500'
                        }`}>No notes yet</p>
                    <p className={`text-xs ${theme === 'dark' ? 'text-white/30' : 'text-slate-400'
                        }`}>Create your first note above</p>
                </div>
            </div>
        );
    }

    return (
        <motion.div
            variants={listVariants}
            initial="hidden"
            animate="visible"
            className="absolute inset-0 overflow-y-auto px-4 pb-4 space-y-3"
        >
            <AnimatePresence mode="popLayout">
                {notes.map((note, index) => (
                    <NoteCard
                        key={note.id}
                        note={note}
                        index={index}
                        theme={theme}
                        onDelete={onDelete}
                        onUpdate={onUpdate}
                    />
                ))}
            </AnimatePresence>
        </motion.div>
    );
}
