import { useState, useMemo } from 'react';
import { TaskItem } from './TaskItem';
import { AnimatePresence, motion } from 'framer-motion';

export function TaskList({ tasks, onToggle, onDelete, onUpdate }) {
    const [filter, setFilter] = useState('all'); // all, pending, completed, overdue
    const [sort, setSort] = useState('dueDate'); // dueDate, priority

    const filteredTasks = useMemo(() => {
        let result = [...tasks];
        const now = Date.now();

        // 1. Filter
        if (filter === 'pending') {
            result = result.filter(t => !t.completed);
        } else if (filter === 'completed') {
            result = result.filter(t => t.completed);
        }

        // 2. Sort
        result.sort((a, b) => {
            // prioritize overdue first if sorting by date
            if (sort === 'dueDate') {
                // If no due date, push to end
                if (!a.dueDate) return 1;
                if (!b.dueDate) return -1;
                return a.dueDate - b.dueDate;
            } else if (sort === 'priority') {
                const pMap = { high: 3, medium: 2, low: 1 };
                return (pMap[b.priority] || 0) - (pMap[a.priority] || 0);
            }
            return 0;
        });

        return result;
    }, [tasks, filter, sort]);

    const tabs = [
        { id: 'all', label: 'All' },
        { id: 'pending', label: 'Pending' },
        { id: 'completed', label: 'Done' }
    ];

    return (
        <div className="flex flex-col h-full">
            {/* Filter Tabs */}
            <div className="flex items-center gap-2 mb-4">
                <div className="flex-1 flex gap-1 p-1 bg-black/20 dark:bg-white/5 rounded-lg">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setFilter(tab.id)}
                            className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-all ${filter === tab.id
                                ? 'bg-white/10 text-white shadow-sm'
                                : 'text-zinc-500 dark:text-zinc-400 hover:text-white hover:bg-white/5'
                                }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Sort Toggle (Simple Icon) */}
                <button
                    onClick={() => setSort(sort === 'dueDate' ? 'priority' : 'dueDate')}
                    className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                    title={`Sort by ${sort === 'dueDate' ? 'Priority' : 'Date'}`}
                >
                    <svg className="w-4 h-4 text-white/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        {sort === 'dueDate' ? (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        ) : (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
                        )}
                    </svg>
                </button>
            </div>

            {/* Task List */}
            <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                <AnimatePresence mode="popLayout">
                    {filteredTasks.length > 0 ? (
                        filteredTasks.map(task => (
                            <TaskItem
                                key={task.id}
                                task={task}
                                onToggle={onToggle}
                                onDelete={onDelete}
                                onUpdate={onUpdate}
                            />
                        ))
                    ) : (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="flex flex-col items-center justify-center h-40 text-center"
                            style={{ color: 'var(--theme-text-secondary)' }}
                        >
                            <svg className="w-12 h-12 mb-3 opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                            </svg>
                            <p className="text-sm">No tasks found</p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
