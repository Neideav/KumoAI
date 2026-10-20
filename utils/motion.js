// Shared Motion constants and animation presets for KumoAI
// Adheres strictly to restrained, fluid, and minimal motion principles

export const TRANSITION_FAST = {
  duration: 0.16,
  ease: [0.16, 1, 0.3, 1]
};

export const TRANSITION_NORMAL = {
  duration: 0.22,
  ease: [0.16, 1, 0.3, 1]
};

export const TRANSITION_MODAL = {
  duration: 0.24,
  ease: [0.16, 1, 0.3, 1]
};

// Dropdown / Popover entrance and exit
export const dropdownVariants = {
  hidden: {
    opacity: 0,
    scale: 0.96,
    y: -4
  },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: TRANSITION_FAST
  },
  exit: {
    opacity: 0,
    scale: 0.96,
    y: -4,
    transition: { duration: 0.12, ease: [0.16, 1, 0.3, 1] }
  }
};

// Modal backdrop fade
export const modalOverlayVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.18, ease: 'easeOut' } },
  exit: { opacity: 0, transition: { duration: 0.14, ease: 'easeIn' } }
};

// Modal card container
export const modalCardVariants = {
  hidden: {
    opacity: 0,
    scale: 0.97,
    y: 8
  },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: TRANSITION_MODAL
  },
  exit: {
    opacity: 0,
    scale: 0.98,
    y: 6,
    transition: { duration: 0.14, ease: [0.16, 1, 0.3, 1] }
  }
};

// Message entrance transition
export const messageEntranceVariants = {
  hidden: {
    opacity: 0,
    y: 10
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: TRANSITION_NORMAL
  }
};

// Hero Welcome Stagger Container
export const heroContainerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.04
    }
  }
};

// Hero child items
export const heroItemVariants = {
  hidden: { opacity: 0, y: 8 },
  visible: {
    opacity: 1,
    y: 0,
    transition: TRANSITION_NORMAL
  }
};

// View route transition
export const routeViewVariants = {
  hidden: { opacity: 0, y: 6 },
  visible: {
    opacity: 1,
    y: 0,
    transition: TRANSITION_NORMAL
  },
  exit: {
    opacity: 0,
    transition: { duration: 0.12, ease: 'easeIn' }
  }
};
