import { useFiles } from '../hooks/useFiles';
import { FileItem } from './FileItem';
import { FolderItem } from './FolderItem';
import { useState, useRef, useEffect } from 'react';

export function FileManager() {
    const {
        currentFolderId, files, folders, breadcrumbs,
        navigateTo, addFile, createFolder, deleteItem,
        renameItem, openFile, moveItem, selectAndAddFiles, navigateUp
    } = useFiles();

    const [isCreating, setIsCreating] = useState(false);
    const inputRef = useRef(null);

    useEffect(() => {
        if (isCreating && inputRef.current) {
            inputRef.current.focus();
            inputRef.current.select();
        }
    }, [isCreating]);

    const handleDrop = async (e) => {
        e.preventDefault();
        e.stopPropagation();

        // Handle external files
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            const fileList = Array.from(e.dataTransfer.files);
            for (const file of fileList) {
                // In Electron, file.path is the full path
                if (file.path) {
                    await addFile({
                        name: file.name,
                        originalPath: file.path,
                        fileType: file.type || 'unknown',
                        size: file.size
                    });
                }
            }
        }
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        e.stopPropagation();
    };

    return (
        <div
            className="flex flex-col h-full"
            onDrop={handleDrop}
            onDragOver={handleDragOver}
        >
            {/* Header / Breadcrumbs */}
            <div className="flex items-center justify-between p-3 border-b border-white/10 bg-white/5 sticky top-0 z-10 glass-effect">
                <div className="flex items-center gap-1 overflow-x-auto no-scrollbar mask-gradient-right text-sm">
                    {/* Back Button */}
                    <button
                        onClick={navigateUp}
                        className={`p-1 mr-1 rounded hover:bg-white/10 transition-colors no-drag-region ${breadcrumbs.length > 1 ? 'text-white' : 'text-white/20 cursor-default'}`}
                        disabled={breadcrumbs.length <= 1}
                        title="Go Back"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                    </button>

                    {breadcrumbs.map((crumb, index) => (
                        <div key={crumb.id || 'root'} className="flex items-center whitespace-nowrap">
                            {index > 0 && <span className="text-white/30 mx-1">/</span>}
                            <button
                                onClick={() => navigateTo(crumb.id, crumb.name)}
                                className={`transition-colors no-drag-region ${index === breadcrumbs.length - 1 ? 'text-white font-medium' : 'text-white/50 hover:text-white'
                                    }`}
                            >
                                {crumb.name}
                            </button>
                        </div>
                    ))}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 no-drag-region">
                    <button
                        onClick={selectAndAddFiles}
                        className="p-1.5 hover:bg-white/10 rounded-lg text-white/70 hover:text-white transition-colors"
                        title="Add File"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                    </button>
                    <button
                        onClick={() => setIsCreating(true)}
                        className="p-1.5 hover:bg-white/10 rounded-lg text-white/70 hover:text-white transition-colors"
                        title="New Folder"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                        </svg>
                    </button>
                </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-3">
                <div className="grid grid-cols-3 gap-3 pb-safe">
                    {/* Creation Input */}
                    {isCreating && (
                        <div className="p-3 rounded-xl bg-white/5 border border-primary-500/50 flex flex-col items-center gap-2 aspect-square justify-center">
                            <div className="flex justify-center text-blue-400">
                                <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M19.906 9c.382 0 .749.057 1.094.162V9a3 3 0 00-3-3h-3.879a.75.75 0 01-.53-.22L11.47 3.66A2.25 2.25 0 009.879 3H6a3 3 0 00-3 3v3.162A3.756 3.756 0 014.094 9h15.812zM4.094 9a2.25 2.25 0 00-2.25 2.25v9.25A2.25 2.25 0 004.094 22.75h15.812a2.25 2.25 0 002.25-2.25v-9.25a2.25 2.25 0 00-2.25-2.25H4.094z" />
                                </svg>
                            </div>
                            <input
                                ref={inputRef}
                                className="w-full bg-transparent text-center text-[10px] text-white outline-none border-b border-white/20 focus:border-white/50 px-1"
                                defaultValue="New Folder"
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        if (e.currentTarget.value.trim()) {
                                            createFolder(e.currentTarget.value.trim());
                                        }
                                        setIsCreating(false);
                                    }
                                    if (e.key === 'Escape') setIsCreating(false);
                                }}
                                onBlur={(e) => {
                                    if (e.currentTarget.value.trim()) {
                                        createFolder(e.currentTarget.value.trim());
                                    }
                                    setIsCreating(false);
                                }}
                            />
                        </div>
                    )}

                    {/* Folders */}
                    {folders.map(folder => (
                        <FolderItem
                            key={folder.id}
                            folder={folder}
                            onNavigate={navigateTo}
                            onDelete={deleteItem}
                            onRename={renameItem}
                            onMoveItem={moveItem}
                            onAddFile={addFile}
                        />
                    ))}

                    {/* Files */}
                    {files.map(file => (
                        <FileItem
                            key={file.id}
                            file={file}
                            onOpen={openFile}
                            onDelete={deleteItem}
                            onRename={renameItem}
                        />
                    ))}
                </div>

                {/* Empty State */}
                {folders.length === 0 && files.length === 0 && !isCreating && (
                    <div className="flex flex-col items-center justify-center h-40 text-white/30 text-sm">
                        <svg className="w-8 h-8 mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                        <p>Drop files here</p>
                    </div>
                )}
            </div>

            {/* Permanent Drag Hint */}
            <div className="p-2 text-center border-t border-white/5 bg-white/5 backdrop-blur-sm z-10">
                <p className="text-[10px] text-white/30 font-medium tracking-wide">Drag and Drop files to add</p>
            </div>
        </div>
    );
}
