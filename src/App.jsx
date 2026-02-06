import { useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { FloatingBall } from './components/FloatingBall';
import { NotesWidget } from './components/NotesWidget';
import { useNotes } from './hooks/useNotes';
import { useTheme } from './hooks/useTheme';
import './styles/index.css';

function App() {
    const [isExpanded, setIsExpanded] = useState(false);
    const { notes, addNote, deleteNote, updateNote } = useNotes();
    const { theme, toggleTheme } = useTheme();

    // Handle expand/collapse
    const handleToggleExpand = async (expanded) => {
        setIsExpanded(expanded);
        await window.electronAPI.toggleExpand(expanded);
    };

    const handleBallClick = () => {
        handleToggleExpand(true);
    };

    const handleCollapse = () => {
        handleToggleExpand(false);
    };

    const handleAddNote = async (noteData) => {
        await addNote(noteData);
    };

    const handleDeleteNote = async (id) => {
        await deleteNote(id);
    };

    const handleUpdateNote = async (id, updates) => {
        await updateNote(id, updates);
    };

    // Listen for notification clicks
    useEffect(() => {
        if (window.electronAPI?.onNotificationClick) {
            const cleanup = window.electronAPI.onNotificationClick((noteId) => {
                // Expand widget when notification is clicked
                handleToggleExpand(true);
            });
            return cleanup;
        }
    }, []);

    // Listen for tray toggle
    useEffect(() => {
        if (window.electronAPI?.onToggleFromTray) {
            const cleanup = window.electronAPI.onToggleFromTray(() => {
                handleToggleExpand(!isExpanded);
            });
            return cleanup;
        }
    }, [isExpanded]);

    // Listen for ESC key to collapse when expanded
    useEffect(() => {
        const handleKeyDown = (event) => {
            if (event.key === 'Escape' && isExpanded) {
                handleCollapse();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isExpanded]);

    return (
        <div className="w-full h-full">
            <AnimatePresence mode="wait">
                {!isExpanded ? (
                    <FloatingBall key="ball" onClick={handleBallClick} />
                ) : (
                    <NotesWidget
                        key="widget"
                        isExpanded={isExpanded}
                        notes={notes}
                        onAddNote={handleAddNote}
                        onDeleteNote={handleDeleteNote}
                        onUpdateNote={handleUpdateNote}
                        onCollapse={handleCollapse}
                        theme={theme}
                        onToggleTheme={toggleTheme}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}

export default App;
