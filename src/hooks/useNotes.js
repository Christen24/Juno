import { useState, useEffect } from 'react';

export function useNotes() {
    const [notes, setNotes] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadNotes();
    }, []);

    const loadNotes = async () => {
        try {
            const allNotes = await window.electronAPI.getNotes();
            setNotes(allNotes);
        } catch (error) {
            console.error('Failed to load notes:', error);
        } finally {
            setLoading(false);
        }
    };

    const addNote = async (noteData) => {
        try {
            const newNote = await window.electronAPI.addNote(noteData);
            setNotes(prev => [newNote, ...prev]);
            return newNote;
        } catch (error) {
            console.error('Failed to add note:', error);
            throw error;
        }
    };

    const deleteNote = async (id) => {
        try {
            await window.electronAPI.deleteNote(id);
            setNotes(prev => prev.filter(note => note.id !== id));
        } catch (error) {
            console.error('Failed to delete note:', error);
            throw error;
        }
    };

    const updateNote = async (id, updates) => {
        try {
            const updatedNote = await window.electronAPI.updateNote(id, updates);
            setNotes(prev => prev.map(note => note.id === id ? updatedNote : note));
            return updatedNote;
        } catch (error) {
            console.error('Failed to update note:', error);
            throw error;
        }
    };

    return {
        notes,
        loading,
        addNote,
        deleteNote,
        updateNote,
        refreshNotes: loadNotes,
    };
}
