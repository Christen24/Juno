import { useState, useEffect, useCallback } from 'react';

export function useTasks() {
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);

    const loadTasks = useCallback(async () => {
        try {
            const fetchedTasks = await window.electronAPI.getTasks();
            setTasks(fetchedTasks);
        } catch (error) {
            console.error('Failed to load tasks:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadTasks();
    }, [loadTasks]);

    const addTask = async (taskData) => {
        try {
            const newTask = await window.electronAPI.addTask(taskData);
            // Re-sort or just formatting?
            // Since getAllTasks sorts by completed/due_date/priority,
            // we might want to reload or insert carefully.
            // For now, reloading ensures sort order.
            await loadTasks();
            return newTask;
        } catch (error) {
            console.error('Failed to add task:', error);
            throw error;
        }
    };

    const updateTask = async (id, updates) => {
        try {
            const updatedTask = await window.electronAPI.updateTask(id, updates);
            // Optimistic update or reload?
            // Reload to fix sort order if priority/date changed.
            await loadTasks();
            return updatedTask;
        } catch (error) {
            console.error('Failed to update task:', error);
            throw error;
        }
    };

    const deleteTask = async (id) => {
        try {
            await window.electronAPI.deleteTask(id);
            setTasks(prev => prev.filter(t => t.id !== id));
        } catch (error) {
            console.error('Failed to delete task:', error);
            throw error;
        }
    };

    return { tasks, loading, addTask, updateTask, deleteTask, refreshTasks: loadTasks };
}
