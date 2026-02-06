import { motion } from 'framer-motion';

export function Settings({ theme, onToggleTheme, onClose }) {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className={`absolute inset-0 backdrop-blur-xl rounded-2xl z-50 p-6 ${theme === 'dark' ? 'bg-slate-900/95' : 'bg-white/95'
                }`}
        >
            <div className="flex justify-between items-center mb-6">
                <h2 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-slate-800'}`}>Settings</h2>
                <button
                    onClick={onClose}
                    className={`p-2 rounded-lg transition-colors ${theme === 'dark' ? 'hover:bg-white/10' : 'hover:bg-slate-200'
                        }`}
                >
                    <svg className={`w-5 h-5 ${theme === 'dark' ? 'text-white' : 'text-slate-700'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>

            <div className="space-y-6">
                {/* Theme Toggle */}
                <div className="space-y-2">
                    <label className={`text-sm font-medium ${theme === 'dark' ? 'text-white/80' : 'text-slate-700'}`}>Appearance</label>
                    <button
                        onClick={onToggleTheme}
                        className={`w-full flex items-center justify-between p-3 rounded-lg transition-colors border ${theme === 'dark' ? 'bg-white/5 hover:bg-white/10 border-white/10' : 'bg-slate-100 hover:bg-slate-200 border-slate-300'
                            }`}
                    >
                        <div className="flex items-center gap-3">
                            {theme === 'dark' ? (
                                <svg className={theme === 'dark' ? 'w-5 h-5 text-white' : 'w-5 h-5 text-slate-700'} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                                </svg>
                            ) : (
                                <svg className={theme === 'dark' ? 'w-5 h-5 text-white' : 'w-5 h-5 text-slate-700'} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                                </svg>
                            )}
                            <span className={theme === 'dark' ? 'text-white' : 'text-slate-800'}>{theme === 'dark' ? 'Dark Mode' : 'Light Mode'}</span>
                        </div>
                        <svg className={theme === 'dark' ? 'w-5 h-5 text-white/50' : 'w-5 h-5 text-slate-500'} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    </button>
                </div>

                {/* Hotkey Info */}
                <div className="space-y-2">
                    <label className={`text-sm font-medium ${theme === 'dark' ? 'text-white/80' : 'text-slate-700'}`}>Keyboard Shortcut</label>
                    <div className={`p-3 rounded-lg border ${theme === 'dark' ? 'bg-white/5 border-white/10' : 'bg-slate-100 border-slate-300'
                        }`}>
                        <div className="flex items-center justify-between">
                            <span className={`text-sm ${theme === 'dark' ? 'text-white/70' : 'text-slate-600'}`}>Toggle Widget</span>
                            <div className="flex gap-1">
                                <kbd className={`px-2 py-1 rounded text-xs font-mono ${theme === 'dark' ? 'bg-white/10 text-white' : 'bg-slate-200 text-slate-800'
                                    }`}>Ctrl</kbd>
                                <span className={theme === 'dark' ? 'text-white/50' : 'text-slate-500'}>+</span>
                                <kbd className={`px-2 py-1 rounded text-xs font-mono ${theme === 'dark' ? 'bg-white/10 text-white' : 'bg-slate-200 text-slate-800'
                                    }`}>Shift</kbd>
                                <span className={theme === 'dark' ? 'text-white/50' : 'text-slate-500'}>+</span>
                                <kbd className={`px-2 py-1 rounded text-xs font-mono ${theme === 'dark' ? 'bg-white/10 text-white' : 'bg-slate-200 text-slate-800'
                                    }`}>N</kbd>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
