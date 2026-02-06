// Framer Motion animation variants for components

export const ballVariants = {
    initial: { scale: 0.9, opacity: 0 },
    animate: {
        scale: 1,
        opacity: 1,
        transition: {
            duration: 0.3,
            ease: [0.4, 0, 0.2, 1]
        }
    },
    hover: {
        scale: 1.1,
        transition: {
            duration: 0.2,
            ease: [0.4, 0, 0.2, 1]
        }
    },
    tap: {
        scale: 0.95,
        transition: {
            duration: 0.1,
            ease: [0.4, 0, 0.2, 1]
        }
    }
};

export const widgetVariants = {
    collapsed: {
        width: 80,
        height: 80,
        borderRadius: '50%',
        transition: {
            duration: 0.3,
            ease: [0.4, 0, 0.2, 1]
        }
    },
    expanded: {
        width: 400,
        height: 600,
        borderRadius: 16,
        transition: {
            duration: 0.3,
            ease: [0.4, 0, 0.2, 1]
        }
    }
};

export const contentVariants = {
    hidden: {
        opacity: 0,
        y: 20,
        transition: {
            duration: 0.2
        }
    },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.3,
            delay: 0.1,
            ease: [0.4, 0, 0.2, 1]
        }
    }
};

export const noteCardVariants = {
    hidden: {
        opacity: 0,
        y: -10,
        scale: 0.95
    },
    visible: (i) => ({
        opacity: 1,
        y: 0,
        scale: 1,
        transition: {
            delay: i * 0.05,
            duration: 0.2,
            ease: [0.4, 0, 0.2, 1]
        }
    }),
    exit: {
        opacity: 0,
        x: -20,
        scale: 0.95,
        transition: {
            duration: 0.2
        }
    }
};

export const springConfig = {
    type: "spring",
    stiffness: 300,
    damping: 30
};

export const listVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.05
        }
    }
};
