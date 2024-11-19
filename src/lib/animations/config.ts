export const SHARED_ANIMATIONS = {
    sidebar: {
        type: "spring",
        stiffness: 150,
        damping: 25,
        mass: 0.8,
        duration: 0.7
    },
    content: {
        type: "spring",
        stiffness: 150,
        damping: 25,
        mass: 0.8,
        duration: 0.7
    },
    fade: {
        duration: 0.2,
        ease: 'easeInOut',
    },
    homepageExit: {
        initial: { opacity: 1, y: 0 },
        exit: { 
            opacity: 0,
            y: -60,
            transition: {
                opacity: { duration: 0.3, ease: "easeOut" },
                y: { 
                    type: "spring",
                    stiffness: 300,
                    damping: 30,
                }
            }
        }
    }
};