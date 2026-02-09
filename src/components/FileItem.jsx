import { motion } from 'framer-motion';
import { useState, useRef, useEffect } from 'react';

export function FileItem({ file, onOpen, onDelete, onRename }) {
    const [showMenu, setShowMenu] = useState(false);
    const [isRenaming, setIsRenaming] = useState(false);
    const menuRef = useRef(null);
    const inputRef = useRef(null);

    // Close menu on click outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setShowMenu(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Focus input when renaming starts
    useEffect(() => {
        if (isRenaming && inputRef.current) {
            inputRef.current.focus();
            inputRef.current.select();
        }
    }, [isRenaming]);

    const handleRenameSubmit = (value) => {
        const finalValue = value.trim();
        if (finalValue && finalValue !== file.name) {
            onRename('file', file.id, finalValue);
        }
        setIsRenaming(false);
    };

    // Helper for file icon based on extension
    const getIcon = () => {
        const ext = file.name.split('.').pop().toLowerCase();

        // Image
        if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(ext)) {
            return (
                <svg className="w-8 h-8 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
            );
        }

        // PDF
        if (ext === 'pdf') {
            return (
                <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
            );
        }

        // Code
        if (['js', 'jsx', 'ts', 'tsx', 'html', 'css', 'json', 'py'].includes(ext)) {
            return (
                <svg className="w-8 h-8 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                </svg>
            );
        }

        // Default
        return (
            <svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
        );
    };

    return (
        <motion.div
            layout
            draggable
            onDragStart={(e) => {
                e.preventDefault();
                window.electronAPI.startDrag(file.originalPath);
            }}
            className="no-drag-region group relative p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors cursor-pointer border border-transparent hover:border-white/10 flex flex-col items-center gap-2 aspect-square justify-center"
            onDoubleClick={() => !isRenaming && onOpen(file.originalPath)}
            title={file.originalPath}
        >
            {/* Icon */}
            <div className="flex justify-center text-white/70">
                {getIcon()}
            </div>

            {/* Name */}
            {isRenaming ? (
                <input
                    ref={inputRef}
                    className="w-full bg-transparent text-center text-[10px] text-white outline-none border-b border-white/20 focus:border-white/50 px-1"
                    defaultValue={file.name}
                    onClick={(e) => e.stopPropagation()}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') handleRenameSubmit(e.currentTarget.value);
                        if (e.key === 'Escape') setIsRenaming(false);
                    }}
                    onBlur={(e) => setIsRenaming(false)}
                />
            ) : (
                <p className="text-[10px] text-center text-white/90 truncate w-full px-1">
                    {file.name}
                </p>
            )}

            {/* Menu Button (visible on hover or when open) */}
            {!isRenaming && (
                <button
                    onClick={(e) => { e.stopPropagation(); setShowMenu(!showMenu); }}
                    className={`absolute top-1 right-1 p-1 rounded-full hover:bg-black/40 text-white/50 hover:text-white transition-opacity ${showMenu ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" /></svg>
                </button>
            )}

            {/* Dropdown Menu */}
            {showMenu && (
                <div ref={menuRef} className="absolute top-6 right-2 z-50 w-32 bg-gray-900 border border-white/10 rounded-lg shadow-xl overflow-hidden glass-effect-dark">
                    <button onClick={() => { onOpen(file.originalPath); setShowMenu(false); }} className="w-full text-left px-3 py-1.5 text-xs text-white hover:bg-white/10">Open</button>
                    <button onClick={(e) => {
                        e.stopPropagation();
                        setShowMenu(false);
                        setIsRenaming(true);
                    }} className="w-full text-left px-3 py-1.5 text-xs text-white hover:bg-white/10">Rename</button>
                    <button onClick={() => { onDelete('file', file.id); setShowMenu(false); }} className="w-full text-left px-3 py-1.5 text-xs text-red-400 hover:bg-white/10">Delete</button>
                </div>
            )}
        </motion.div>
    );
}
