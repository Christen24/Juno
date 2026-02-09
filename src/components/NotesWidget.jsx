import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { NoteInput } from './NoteInput';
import { NotesList } from './NotesList';
import { Settings } from './Settings';
import { contentVariants } from '../utils/animations';
import { useTasks } from '../hooks/useTasks';
import { TaskList } from './TaskList';
import { TaskInput } from './TaskInput';
import { FileManager } from './FileManager';

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
    const { tasks, addTask, updateTask, deleteTask } = useTasks();
    const [activeTab, setActiveTab] = useState('notes'); // 'notes' | 'tasks' | 'files'
    const [showSettings, setShowSettings] = useState(false);

    const getThemeStyle = (t) => {
        const createStyle = (props) => ({
            ...props,
            '--theme-bg': props.background || props.backgroundColor,
        });

        switch (t) {
            case 'midnight':
                return createStyle({
                    backgroundColor: '#0A0E18', // Primary background (deep cosmic coal)
                    backdropFilter: 'none',
                    WebkitBackdropFilter: 'none',
                    '--theme-text-primary': '#E8F1FF',
                    '--theme-text-secondary': '#AAB4D6',
                    '--theme-border': '#23304D',
                    '--theme-card-bg': '#1E2436',
                    '--theme-accent': '#356AC3',
                    '--theme-accent-hover': '#75A8F7',
                    '--theme-overlay': 'none'
                });
            case 'nebula':
                return createStyle({
                    background: 'linear-gradient(135deg, #1A0D3F 0%, #4B2273 35%, #7E42A4 70%, #8FABD4 100%)',
                    backdropFilter: 'blur(20px)',
                    WebkitBackdropFilter: 'blur(20px)',
                    '--theme-text-primary': '#F2E9FF',
                    '--theme-text-secondary': '#C8B6F0',
                    '--theme-border': '#AD7BCF',
                    '--theme-card-bg': 'rgba(255, 255, 255, 0.06)',
                    '--theme-accent': '#2323FF',
                    '--theme-accent-hover': '#E3D6F5',
                    '--theme-overlay': 'rgba(255, 255, 255, 0.06)'
                });
            case 'dark':
                return createStyle({
                    background: 'rgba(15, 23, 42, 0.8)',
                    backdropFilter: 'blur(20px)',
                    WebkitBackdropFilter: 'blur(20px)',
                    '--theme-text-primary': '#ffffff',
                    '--theme-text-secondary': 'rgba(255, 255, 255, 0.6)',
                    '--theme-border': 'rgba(255, 255, 255, 0.1)',
                    '--theme-card-bg': 'rgba(255, 255, 255, 0.05)',
                    '--theme-accent': '#3b82f6',
                    '--theme-accent-hover': '#60a5fa',
                    '--theme-overlay': 'none'
                });
            default: // light
                return createStyle({
                    background: 'rgba(225, 217, 188, 0.9)',
                    backdropFilter: 'blur(20px)',
                    WebkitBackdropFilter: 'blur(20px)',
                    '--theme-text-primary': '#1e293b',
                    '--theme-text-secondary': '#64748b',
                    '--theme-border': '#d6d3c0',
                    '--theme-card-bg': 'rgba(255, 255, 255, 0.4)',
                    '--theme-accent': '#3b82f6',
                    '--theme-accent-hover': '#2563eb',
                    '--theme-overlay': 'none'
                });
        }
    };

    const isDark = ['dark', 'midnight', 'nebula'].includes(theme);

    if (!isExpanded) return null;

    return (
        <motion.div
            variants={contentVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            className="w-full h-full flex flex-col rounded-2xl overflow-hidden shadow-2xl transition-colors duration-300"
            style={getThemeStyle(theme)}
        >
            {/* Header */}
            <div className={`drag-region px-4 py-3 border-b flex items-center justify-between ${isDark ? 'border-white/10' : 'border-slate-300/50'
                }`}>
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-purple-600 flex items-center justify-center shadow-lg">
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                    </div>

                    <h1 className={`font-semibold text-lg ${isDark ? 'text-white' : 'text-slate-800'}`}>Juno</h1>

                    {/* Tab Switcher */}
                    <div className="flex bg-black/10 dark:bg-white/5 rounded-lg p-0.5 no-drag-region">
                        <button
                            onClick={() => setActiveTab('notes')}
                            className={`px-3 py-1 rounded-md text-xs font-semibold transition-all ${activeTab === 'notes'
                                ? 'bg-white text-primary-600 shadow-sm dark:bg-white/10 dark:text-white'
                                : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-white'
                                }`}
                        >
                            Notes
                        </button>
                        <button
                            onClick={() => setActiveTab('tasks')}
                            className={`px-3 py-1 rounded-md text-xs font-semibold transition-all ${activeTab === 'tasks'
                                ? 'bg-white text-primary-600 shadow-sm dark:bg-white/10 dark:text-white'
                                : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-white'
                                }`}
                        >
                            Tasks
                        </button>
                        <button
                            onClick={() => setActiveTab('files')}
                            className={`px-3 py-1 rounded-md text-xs font-semibold transition-all ${activeTab === 'files'
                                ? 'bg-white text-primary-600 shadow-sm dark:bg-white/10 dark:text-white'
                                : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-white'
                                }`}
                        >
                            Files
                        </button>
                    </div>
                </div>

                <div className="flex items-center gap-1 no-drag-region">
                    <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setShowSettings(!showSettings)}
                        className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                        title="Settings"
                    >
                        <svg className={`w-5 h-5 ${isDark ? 'text-white' : 'text-slate-700'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                        <svg className={`w-5 h-5 ${isDark ? 'text-white' : 'text-slate-700'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                        </svg>
                    </motion.button>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 flex flex-col overflow-hidden p-4 pt-2">
                <AnimatePresence mode="wait">
                    {showSettings ? (
                        <Settings
                            key="settings"
                            theme={theme}
                            onToggleTheme={onToggleTheme}
                            onClose={() => setShowSettings(false)}
                        />
                    ) : activeTab === 'notes' ? (
                        <motion.div
                            key="notes"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.2 }}
                            className="flex-1 flex flex-col overflow-hidden"
                        >
                            <NoteInput onAdd={onAddNote} theme={theme} />

                            <div className="flex-1 overflow-hidden relative">
                                <NotesList
                                    notes={notes}
                                    theme={theme}
                                    onDelete={onDeleteNote}
                                    onUpdate={onUpdateNote}
                                />
                            </div>
                        </motion.div>
                    ) : activeTab === 'tasks' ? (
                        <motion.div
                            key="tasks"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            transition={{ duration: 0.2 }}
                            className="flex-1 flex flex-col overflow-hidden"
                        >
                            <TaskInput onAdd={addTask} theme={theme} />

                            <div className="flex-1 overflow-hidden relative">
                                <TaskList
                                    tasks={tasks}
                                    theme={theme}
                                    onToggle={(id, completed) => updateTask(id, { completed })}
                                    onDelete={deleteTask}
                                    onUpdate={updateTask}
                                />
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="files"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            transition={{ duration: 0.2 }}
                            className="flex-1 flex flex-col overflow-hidden"
                        >
                            <FileManager />
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Footer */}
            <div className={`px-4 py-2 border-t flex items-center justify-between text-xs ${isDark ? 'border-white/10 bg-black/20 text-white/50' : 'border-slate-300/50 bg-slate-100/50 text-slate-600'
                }`}>
                <span>
                    {activeTab === 'notes'
                        ? `${notes.length} note${notes.length !== 1 ? 's' : ''}`
                        : activeTab === 'tasks'
                            ? `${tasks.filter(t => !t.completed).length} pending`
                            : 'File Manager'
                    }
                </span>
                <span>Ctrl+Shift+N to toggle</span>
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
