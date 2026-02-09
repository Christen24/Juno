import { useState, useEffect, useCallback } from 'react';

export function useFiles() {
    const [currentFolderId, setCurrentFolderId] = useState(null);
    const [files, setFiles] = useState([]);
    const [folders, setFolders] = useState([]);
    const [breadcrumbs, setBreadcrumbs] = useState([{ id: null, name: 'Home' }]);
    const [isLoading, setIsLoading] = useState(false);

    const loadContent = useCallback(async () => {
        setIsLoading(true);
        try {
            const [fetchedFolders, fetchedFiles] = await Promise.all([
                window.electronAPI.getFolders(currentFolderId),
                window.electronAPI.getFiles(currentFolderId)
            ]);
            setFolders(fetchedFolders);
            setFiles(fetchedFiles);
        } catch (error) {
            console.error('Failed to load files:', error);
        } finally {
            setIsLoading(false);
        }
    }, [currentFolderId]);

    useEffect(() => {
        loadContent();
    }, [loadContent]);

    const navigateTo = useCallback((folderId, folderName) => {
        if (folderId === null) {
            setBreadcrumbs([{ id: null, name: 'Home' }]);
        } else {
            // Check if navigating inside or back
            const index = breadcrumbs.findIndex(b => b.id === folderId);
            if (index !== -1) {
                setBreadcrumbs(breadcrumbs.slice(0, index + 1));
            } else {
                setBreadcrumbs(prev => [...prev, { id: folderId, name: folderName }]);
            }
        }
        setCurrentFolderId(folderId);
    }, [breadcrumbs]);

    const addFile = async (fileData) => {
        try {
            const targetFolderId = fileData.folderId !== undefined ? fileData.folderId : currentFolderId;
            const newFile = await window.electronAPI.addFile({ ...fileData, folderId: targetFolderId });

            // Only add to state if added to current folder
            if (targetFolderId === currentFolderId) {
                setFiles(prev => [...prev, newFile]);
            }
        } catch (err) {
            console.error('Error adding file:', err);
        }
    };

    const createFolder = async (name) => {
        try {
            await window.electronAPI.createFolder(name, currentFolderId);
            await loadContent();
        } catch (err) {
            console.error(err);
        }
    };

    const deleteItem = async (type, id) => {
        try {
            if (type === 'folder') await window.electronAPI.deleteFolder(id);
            else await window.electronAPI.deleteFile(id);
            await loadContent();
        } catch (err) {
            console.error(err);
        }
    };

    const renameItem = async (type, id, newName) => {
        try {
            if (type === 'folder') await window.electronAPI.renameFolder(id, newName);
            else await window.electronAPI.renameFile(id, newName);
            await loadContent();
        } catch (err) {
            console.error(err);
        }
    };

    const moveItem = async (id, targetFolderId) => {
        try {
            await window.electronAPI.moveFile(id, targetFolderId);
            await loadContent();
        } catch (err) {
            console.error(err);
        }
    }

    const openFile = async (path) => {
        await window.electronAPI.openFile(path);
    };

    const revealFile = async (path) => {
        await window.electronAPI.revealFile(path);
    };

    const selectAndAddFiles = async () => {
        try {
            console.log('Requesting file selection...');
            const selectedFiles = await window.electronAPI.selectFile();
            console.log('Selected files from main:', selectedFiles);

            if (selectedFiles && selectedFiles.length > 0) {
                for (const file of selectedFiles) {
                    console.log('Adding file to DB:', file, 'Folder:', currentFolderId);
                    const result = await window.electronAPI.addFile({ ...file, folderId: currentFolderId });
                    console.log('Add result:', result);
                }
                await loadContent();
            }
        } catch (err) {
            console.error('selectAndAddFiles error:', err);
        }
    };

    const navigateUp = () => {
        if (breadcrumbs.length > 1) {
            const parent = breadcrumbs[breadcrumbs.length - 2];
            navigateTo(parent.id, parent.name);
        }
    };

    return {
        currentFolderId,
        files,
        folders,
        breadcrumbs,
        isLoading,
        navigateTo,
        navigateUp,
        addFile,
        createFolder,
        deleteItem,
        renameItem,
        moveItem,
        openFile,
        revealFile,
        selectAndAddFiles,
        refresh: loadContent
    };
}
