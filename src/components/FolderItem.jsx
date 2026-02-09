import { motion } from 'framer-motion';
import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';

export function FolderItem({ folder, onNavigate, onDelete, onRename, onMoveItem, onAddFile }) {
    const [showMenu, setShowMenu] = useState(false);
    const [isDragOver, setIsDragOver] = useState(false);
    const [isRenaming, setIsRenaming] = useState(false);
    const [menuCoords, setMenuCoords] = useState({ top: 0, left: 0 });
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

    const handleDrop = async (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragOver(false);

        // Internal Move
        const fileId = e.dataTransfer.getData('file-id');
        if (fileId) {
            onMoveItem(Number(fileId), folder.id);
            onNavigate(folder.id, folder.name);
            return;
        }

        // External Drop
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0 && onAddFile) {
            const fileList = Array.from(e.dataTransfer.files);
            for (const f of fileList) {
                if (f.path) {
                    await onAddFile({
                        name: f.name,
                        originalPath: f.path,
                        fileType: f.type || 'unknown',
                        size: f.size,
                        folderId: folder.id
                    });
                }
            }
            onNavigate(folder.id, folder.name);
        }
    };

    const handleRenameSubmit = (value) => {
        const finalValue = value.trim();
        if (finalValue && finalValue !== folder.name) {
            onRename('folder', folder.id, finalValue);
        }
        setIsRenaming(false);
    };

    const handleMenuClick = (e) => {
        e.stopPropagation();
        if (!showMenu) {
            // Scroll if needed
            const initialRect = e.currentTarget.getBoundingClientRect();
            const spaceBelow = window.innerHeight - initialRect.bottom;
            if (spaceBelow < 150) {
                e.currentTarget.scrollIntoView({ block: 'center', behavior: 'auto' });
            }

            const rect = e.currentTarget.getBoundingClientRect();
            let left = rect.right - 128; // Align flush right (w-32 = 128px)
            let top = rect.bottom; // 0px gap

            // Refined positioning: Force Below (Clamp)
            const menuHeight = 130;
            if (top + menuHeight > window.innerHeight) {
                top = window.innerHeight - menuHeight - 10;
            }

            if (left + 128 > window.innerWidth) left = window.innerWidth - 138;
            if (left < 10) left = 10;

            setMenuCoords({ top, left });
            setShowMenu(true);
        } else {
            setShowMenu(false);
        }
    };

    return (
        <motion.div
            layout
            className={`no-drag-region group relative p-3 rounded-xl transition-colors cursor-pointer border flex flex-col items-center gap-2 aspect-square justify-center
                ${isDragOver ? 'bg-primary-500/20 border-primary-500' : 'bg-white/5 hover:bg-white/10 border-transparent hover:border-white/10'}
            `}
            onDoubleClick={() => !isRenaming && onNavigate(folder.id, folder.name)}
            onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
            onDragLeave={() => setIsDragOver(false)}
            onDrop={handleDrop}
            title={folder.name}
        >
            {/* Icon */}
            <div className="flex justify-center text-blue-400">
                <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19.906 9c.382 0 .749.057 1.094.162V9a3 3 0 00-3-3h-3.879a.75.75 0 01-.53-.22L11.47 3.66A2.25 2.25 0 009.879 3H6a3 3 0 00-3 3v3.162A3.756 3.756 0 014.094 9h15.812zM4.094 9a2.25 2.25 0 00-2.25 2.25v9.25A2.25 2.25 0 004.094 22.75h15.812a2.25 2.25 0 002.25-2.25v-9.25a2.25 2.25 0 00-2.25-2.25H4.094z" />
                </svg>
            </div>

            {/* Name */}
            {isRenaming ? (
                <input
                    ref={inputRef}
                    className="w-full bg-transparent text-center text-[10px] text-white outline-none border-b border-white/20 focus:border-white/50 px-1"
                    defaultValue={folder.name}
                    onClick={(e) => e.stopPropagation()}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') handleRenameSubmit(e.currentTarget.value);
                        if (e.key === 'Escape') setIsRenaming(false);
                    }}
                    onBlur={(e) => setIsRenaming(false)}
                />
            ) : (
                <p className="text-[10px] text-center text-white/90 truncate w-full px-1">
                    {folder.name}
                </p>
            )}

            {/* Menu Button */}
            {!isRenaming && (
                <button
                    onClick={(e) => { e.stopPropagation(); setShowMenu(!showMenu); }}
                    className={`absolute top-1 right-1 p-1 rounded-full hover:bg-black/40 text-white/50 hover:text-white transition-opacity ${showMenu ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" /></svg>
                </button>
            )}

            {/* Dropdown Menu - Portal */}
            {showMenu && createPortal(
                <div
                    ref={menuRef}
                    className="fixed z-[9999] w-32 bg-gray-900 border border-white/10 rounded-lg shadow-xl overflow-hidden glass-effect-dark"
                    style={{ top: menuCoords.top, left: menuCoords.left }}
                    onClick={(e) => e.stopPropagation()}
                >
                    <button onClick={() => { onNavigate(folder.id, folder.name); setShowMenu(false); }} className="w-full text-left px-3 py-1.5 text-xs text-white hover:bg-white/10">Open</button>
                    <button onClick={(e) => {
                        e.stopPropagation();
                        setShowMenu(false);
                        setIsRenaming(true);
                    }} className="w-full text-left px-3 py-1.5 text-xs text-white hover:bg-white/10">Rename</button>
                    <button onClick={() => { onDelete('folder', folder.id); setShowMenu(false); }} className="w-full text-left px-3 py-1.5 text-xs text-red-400 hover:bg-white/10">Delete</button>
                </div>,
                document.body
            )}
        </motion.div>
    );
}
