import { motion } from 'framer-motion';
import { ballVariants } from '../utils/animations';
import { useDragging } from '../hooks/useDragging';

export function FloatingBall({ onClick }) {
    const { handleMouseDown, shouldBlockClick } = useDragging();

    const handleClick = (e) => {
        // Block click if we just dragged
        if (shouldBlockClick()) {
            e.preventDefault();
            e.stopPropagation();
            return;
        }
        onClick(e);
    };

    const handleContextMenu = (e) => {
        e.preventDefault();
        e.stopPropagation();
        // Use native Electron context menu
        if (window.electronAPI?.showContextMenu) {
            window.electronAPI.showContextMenu();
        }
    };

    return (
        <div className="w-full h-full flex items-center justify-center">
            <motion.div
                className="w-16 h-16 rounded-full cursor-pointer relative overflow-hidden group"
                variants={ballVariants}
                initial="initial"
                animate="animate"
                whileHover="hover"
                onClick={handleClick}
                onMouseDown={handleMouseDown}
                onContextMenu={handleContextMenu}
                style={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    boxShadow: '0 4px 10px rgba(102, 126, 234, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.1)',
                }}
            >
                {/* Shimmer effect */}
                <motion.div
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    style={{
                        background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
                        backgroundSize: '200% 100%',
                    }}
                    animate={{
                        backgroundPosition: ['200% 0', '-200% 0'],
                    }}
                    transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        ease: 'linear',
                    }}
                />

                {/* Pulse animation */}
                <motion.div
                    className="absolute inset-0 rounded-full"
                    animate={{
                        scale: [1, 1.2, 1],
                        opacity: [0.5, 0, 0.5],
                    }}
                    transition={{
                        duration: 3,
                        repeat: Infinity,
                        ease: 'easeInOut',
                    }}
                    style={{
                        background: 'radial-gradient(circle, rgba(255,255,255,0.8) 0%, transparent 70%)',
                    }}
                />

                {/* Icon */}
                <div className="absolute inset-0 flex items-center justify-center">
                    <svg
                        className="w-8 h-8 text-white drop-shadow-lg"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                        />
                    </svg>
                </div>
            </motion.div>
        </div>
    );
}
