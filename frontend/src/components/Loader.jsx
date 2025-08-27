import { motion } from 'framer-motion';
import { Home } from 'lucide-react';

const Loader = ({ size = 'md', text = 'Loading...' }) => {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  };

  const containerVariants = {
    start: {
      transition: {
        staggerChildren: 0.2
      }
    },
    end: {
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const circleVariants = {
    start: {
      y: "0%"
    },
    end: {
      y: "100%"
    }
  };

  const circleTransition = {
    duration: 0.5,
    repeat: Infinity,
    repeatType: "reverse",
    ease: "easeInOut"
  };

  return (
    <div className="flex flex-col items-center justify-center space-y-4">
      {/* Animated Icon */}
      <motion.div
        animate={{ 
          rotate: 360,
          scale: [1, 1.1, 1]
        }}
        transition={{ 
          rotate: { duration: 2, repeat: Infinity, ease: "linear" },
          scale: { duration: 1, repeat: Infinity }
        }}
        className={`${sizeClasses[size]} text-primary-500`}
      >
        <Home className="w-full h-full" />
      </motion.div>

      {/* Bouncing Dots */}
      <motion.div
        variants={containerVariants}
        initial="start"
        animate="end"
        className="flex space-x-2"
      >
        {[0, 1, 2].map((index) => (
          <motion.div
            key={index}
            variants={circleVariants}
            transition={circleTransition}
            className="w-2 h-2 bg-primary-500 rounded-full"
          />
        ))}
      </motion.div>

      {/* Loading Text */}
      {text && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-secondary-600 dark:text-secondary-400 font-medium"
        >
          {text}
        </motion.p>
      )}
    </div>
  );
};

// Full screen loader variant
const FullScreenLoader = ({ text = 'Loading...' }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-white dark:bg-secondary-900 flex items-center justify-center z-50"
    >
      <Loader size="xl" text={text} />
    </motion.div>
  );
};

// Button loader variant
const ButtonLoader = () => {
  return (
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
      className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
    />
  );
};

Loader.FullScreen = FullScreenLoader;
Loader.Button = ButtonLoader;

export default Loader; 