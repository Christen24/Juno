import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export function Settings({ theme, onToggleTheme, onClose }) {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [showContact, setShowContact] = useState(false);
    const isDark = ['dark', 'midnight', 'nebula'].includes(theme);

    const getContainerStyle = (t) => {
        switch (t) {
            case 'midnight':
                return {
                    backgroundColor: '#0f172a',
                    // No blur for midnight
                };
            case 'nebula':
                return {
                    background: 'linear-gradient(135deg, rgba(46, 16, 101, 0.95) 0%, rgba(76, 29, 149, 0.95) 100%)',
                    backdropFilter: 'blur(20px)',
                    WebkitBackdropFilter: 'blur(20px)'
                };
            case 'dark':
                return {
                    backgroundColor: 'rgba(15, 23, 42, 0.95)',
                    backdropFilter: 'blur(20px)',
                    WebkitBackdropFilter: 'blur(20px)'
                };
            default: // light
                return {
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    backdropFilter: 'blur(20px)',
                    WebkitBackdropFilter: 'blur(20px)'
                };
        }
    };

    const themes = [
        { id: 'light', name: 'Light', color: '#E1D9BC', border: '#d6d3c0' },
        { id: 'dark', name: 'Dark', color: '#0f172a', border: '#1e293b' },
        { id: 'midnight', name: 'Midnight', color: '#0A0E18', border: '#23304D' },
        { id: 'nebula', name: 'Nebula', color: 'linear-gradient(135deg, #1A0D3F, #7E42A4, #8FABD4)', border: '#AD7BCF' }
    ];

    const currentTheme = themes.find(t => t.id === theme) || themes[0];

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="absolute inset-0 rounded-2xl z-50 p-6 flex flex-col"
            style={getContainerStyle(theme)}
        >
            <div className="flex justify-between items-center mb-6">
                <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>Settings</h2>
                <button
                    onClick={onClose}
                    className={`p-2 rounded-lg transition-colors ${isDark ? 'hover:bg-white/10' : 'hover:bg-slate-200'
                        }`}
                >
                    <svg className={`w-5 h-5 ${isDark ? 'text-white' : 'text-slate-700'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>

            <div className="space-y-6 flex-1 overflow-y-auto pr-1">
                {/* Theme Selection - Dropdown */}
                <div className="space-y-3 relative z-20">
                    <label className={`text-sm font-medium ${isDark ? 'text-white/80' : 'text-slate-700'}`}>Appearance</label>

                    <div className="relative">
                        <button
                            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                            className={`w-full p-3 rounded-xl border text-left transition-all flex items-center justify-between ${isDark
                                ? 'bg-white/5 border-white/10 hover:bg-white/10'
                                : 'bg-white border-slate-200 hover:bg-slate-50'
                                }`}
                        >
                            <div className="flex items-center gap-3">
                                <div
                                    className="w-6 h-6 rounded-full border shadow-sm"
                                    style={{ background: currentTheme.color, borderColor: currentTheme.border }}
                                />
                                <span className={`text-sm font-medium ${isDark ? 'text-white' : 'text-slate-800'}`}>
                                    {currentTheme.name}
                                </span>
                            </div>
                            <svg
                                className={`w-4 h-4 transition-transform ${isDropdownOpen ? 'rotate-180' : ''} ${isDark ? 'text-white/50' : 'text-slate-400'}`}
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                        </button>

                        <AnimatePresence>
                            {isDropdownOpen && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className={`absolute top-full left-0 right-0 mt-2 rounded-xl border shadow-xl overflow-hidden backdrop-blur-xl ${isDark ? 'bg-slate-900/95 border-white/10' : 'bg-white/95 border-slate-200'
                                        }`}
                                >
                                    {themes.map((t) => (
                                        <button
                                            key={t.id}
                                            onClick={() => {
                                                onToggleTheme(t.id);
                                                setIsDropdownOpen(false);
                                            }}
                                            className={`w-full p-3 text-left flex items-center gap-3 transition-colors ${theme === t.id
                                                ? (isDark ? 'bg-white/10' : 'bg-slate-100')
                                                : (isDark ? 'hover:bg-white/5' : 'hover:bg-slate-50')
                                                }`}
                                        >
                                            <div
                                                className="w-6 h-6 rounded-full border shadow-sm"
                                                style={{ background: t.color, borderColor: t.border }}
                                            />
                                            <span className={`text-sm font-medium ${isDark ? 'text-white' : 'text-slate-800'}`}>
                                                {t.name}
                                            </span>
                                            {theme === t.id && (
                                                <svg className="w-4 h-4 ml-auto text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                </svg>
                                            )}
                                        </button>
                                    ))}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>

                {/* Hotkey Info */}
                <div className="space-y-2 z-10 relative">
                    <label className={`text-sm font-medium ${isDark ? 'text-white/80' : 'text-slate-700'}`}>Keyboard Shortcut</label>
                    <div className={`p-3 rounded-lg border ${isDark ? 'bg-white/5 border-white/10' : 'bg-slate-100 border-slate-300'
                        }`}>
                        <div className="flex items-center justify-between">
                            <span className={`text-sm ${isDark ? 'text-white/70' : 'text-slate-600'}`}>Toggle Widget</span>
                            <div className="flex gap-1">
                                <kbd className={`px-2 py-1 rounded text-xs font-mono ${isDark ? 'bg-white/10 text-white' : 'bg-slate-200 text-slate-800'
                                    }`}>Ctrl</kbd>
                                <span className={isDark ? 'text-white/50' : 'text-slate-500'}>+</span>
                                <kbd className={`px-2 py-1 rounded text-xs font-mono ${isDark ? 'bg-white/10 text-white' : 'bg-slate-200 text-slate-800'
                                    }`}>Shift</kbd>
                                <span className={isDark ? 'text-white/50' : 'text-slate-500'}>+</span>
                                <kbd className={`px-2 py-1 rounded text-xs font-mono ${isDark ? 'bg-white/10 text-white' : 'bg-slate-200 text-slate-800'
                                    }`}>N</kbd>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Contact Info */}
            <div className="pt-6 border-t border-white/10">
                <button
                    onClick={() => setShowContact(!showContact)}
                    className={`text-xs font-medium w-full text-center transition-opacity ${isDark ? 'text-white/30 hover:text-white/80' : 'text-slate-400 hover:text-slate-700'
                        }`}
                >
                    {showContact ? 'Close' : 'Developed by Christen Fds'}
                </button>

                <AnimatePresence>
                    {showContact && (
                        <motion.div
                            initial={{ height: 0, opacity: 0, marginTop: 0 }}
                            animate={{ height: 'auto', opacity: 1, marginTop: 16 }}
                            exit={{ height: 0, opacity: 0, marginTop: 0 }}
                            className="overflow-hidden"
                        >
                            <div className="space-y-2">
                                <a
                                    href="mailto:chrisfds2407@gmail.com"
                                    className={`flex items-center gap-3 p-3 rounded-xl border transition-all group ${isDark
                                        ? 'bg-white/5 border-white/10 hover:bg-white/10'
                                        : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                                        }`}
                                >
                                    <div className={`p-2 rounded-lg ${isDark ? 'bg-indigo-500/20 text-indigo-400' : 'bg-indigo-100 text-indigo-600'}`}>
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                        </svg>
                                    </div>
                                    <div className="flex-1">
                                        <div className={`text-xs font-medium ${isDark ? 'text-white/50' : 'text-slate-500'}`}>Email</div>
                                        <div className={`text-sm ${isDark ? 'text-white' : 'text-slate-800'}`}>chrisfds2407@gmail.com</div>
                                    </div>
                                    <svg className={`w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity ${isDark ? 'text-white/50' : 'text-slate-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                    </svg>
                                </a>

                                <a
                                    href="https://www.linkedin.com/in/christenfds/"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={`flex items-center gap-3 p-3 rounded-xl border transition-all group ${isDark
                                        ? 'bg-white/5 border-white/10 hover:bg-white/10'
                                        : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                                        }`}
                                >
                                    <div className={`p-2 rounded-lg ${isDark ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-100 text-blue-600'}`}>
                                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                                        </svg>
                                    </div>
                                    <div className="flex-1">
                                        <div className={`text-xs font-medium ${isDark ? 'text-white/50' : 'text-slate-500'}`}>LinkedIn</div>
                                        <div className={`text-sm ${isDark ? 'text-white' : 'text-slate-800'}`}>Christen Fds</div>
                                    </div>
                                    <svg className={`w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity ${isDark ? 'text-white/50' : 'text-slate-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                    </svg>
                                </a>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </motion.div>
    );
}
