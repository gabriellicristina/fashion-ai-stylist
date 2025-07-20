'use client'

import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'

interface PurpleCatProps {
  size?: 'small' | 'medium' | 'large' | 'hero'
  className?: string
  animated?: boolean
}

export default function PurpleCat({ size = 'medium', className = '', animated = true }: PurpleCatProps) {
  const [isBlinking, setIsBlinking] = useState(false)

  const sizeClasses = {
    small: 'w-12 h-12',
    medium: 'w-16 h-16',
    large: 'w-24 h-24',
    hero: 'w-72 h-72 md:w-80 md:h-80'
  }

  // Blinking animation
  useEffect(() => {
    if (!animated) return
    
    const blinkInterval = setInterval(() => {
      setIsBlinking(true)
      setTimeout(() => setIsBlinking(false), 200)
    }, 3000)

    return () => clearInterval(blinkInterval)
  }, [animated])

  const catVariants = {
    idle: {
      scale: 1,
      rotate: 0,
    },
    hover: {
      scale: 1.1,
      rotate: [0, -2, 2, 0],
      transition: {
        duration: 0.3,
        rotate: {
          duration: 0.6,
          repeat: Infinity,
          repeatType: "reverse" as const
        }
      }
    }
  }

  const tailVariants = {
    idle: {
      rotate: 0,
    },
    wag: {
      rotate: [0, 15, -15, 0],
      transition: {
        duration: 1.5,
        repeat: Infinity,
        repeatType: "loop" as const
      }
    }
  }

  const glowVariants = {
    idle: {
      boxShadow: '0 0 20px rgba(139, 92, 246, 0.3)',
    },
    hover: {
      boxShadow: '0 0 40px rgba(139, 92, 246, 0.8)',
      transition: {
        duration: 0.3
      }
    }
  }

  return (
    <motion.div
      className={`relative ${sizeClasses[size]} ${className}`}
      variants={catVariants}
      initial="idle"
      whileHover={animated ? "hover" : undefined}
      animate={animated ? "idle" : undefined}
    >
      {/* Glow effect */}
      <motion.div
        className="absolute inset-0 rounded-full"
        variants={glowVariants}
        initial="idle"
        whileHover={animated ? "hover" : undefined}
      />
      
      {/* Cat SVG */}
      <svg
        viewBox="0 0 200 200"
        className="w-full h-full relative z-10"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Cat body */}
        <ellipse cx="100" cy="130" rx="45" ry="35" fill="#8B5CF6" />
        
        {/* Cat head */}
        <circle cx="100" cy="80" r="40" fill="#8B5CF6" />
        
        {/* Cat ears */}
        <path d="M70 50 L85 80 L55 75 Z" fill="#8B5CF6" />
        <path d="M130 50 L145 75 L115 80 Z" fill="#8B5CF6" />
        
        {/* Inner ears */}
        <path d="M72 58 L80 72 L64 70 Z" fill="#A78BFA" />
        <path d="M128 58 L136 70 L120 72 Z" fill="#A78BFA" />
        
        {/* Eyes */}
        <ellipse 
          cx="88" 
          cy="75" 
          rx="6" 
          ry={isBlinking ? "1" : "8"} 
          fill="#FFFFFF"
          style={{ transition: 'all 0.1s ease' }}
        />
        <ellipse 
          cx="112" 
          cy="75" 
          rx="6" 
          ry={isBlinking ? "1" : "8"} 
          fill="#FFFFFF"
          style={{ transition: 'all 0.1s ease' }}
        />
        
        {/* Eye pupils */}
        {!isBlinking && (
          <>
            <circle cx="88" cy="77" r="3" fill="#1F2937" />
            <circle cx="112" cy="77" r="3" fill="#1F2937" />
            
            {/* Eye shine */}
            <circle cx="89" cy="75" r="1" fill="#FFFFFF" />
            <circle cx="113" cy="75" r="1" fill="#FFFFFF" />
          </>
        )}
        
        {/* Nose */}
        <path d="M100 85 L95 90 L105 90 Z" fill="#D8B4FE" />
        
        {/* Mouth */}
        <path 
          d="M100 92 Q95 96 90 94" 
          stroke="#1F2937" 
          strokeWidth="2" 
          fill="none"
          strokeLinecap="round"
        />
        <path 
          d="M100 92 Q105 96 110 94" 
          stroke="#1F2937" 
          strokeWidth="2" 
          fill="none"
          strokeLinecap="round"
        />
        
        {/* Whiskers */}
        <line x1="60" y1="82" x2="75" y2="80" stroke="#1F2937" strokeWidth="2" strokeLinecap="round" />
        <line x1="60" y1="88" x2="75" y2="88" stroke="#1F2937" strokeWidth="2" strokeLinecap="round" />
        <line x1="125" y1="80" x2="140" y2="82" stroke="#1F2937" strokeWidth="2" strokeLinecap="round" />
        <line x1="125" y1="88" x2="140" y2="88" stroke="#1F2937" strokeWidth="2" strokeLinecap="round" />
        
        {/* Tail */}
        <motion.path
          d="M145 130 Q160 120 165 100 Q170 80 160 60"
          stroke="#8B5CF6"
          strokeWidth="12"
          fill="none"
          strokeLinecap="round"
          variants={tailVariants}
          animate={animated ? "wag" : "idle"}
          style={{ transformOrigin: "145px 130px" }}
        />
        
        {/* Paws */}
        <ellipse cx="80" cy="160" rx="8" ry="6" fill="#6D28D9" />
        <ellipse cx="100" cy="165" rx="8" ry="6" fill="#6D28D9" />
        <ellipse cx="120" cy="160" rx="8" ry="6" fill="#6D28D9" />
        
        {/* Chest marking */}
        <ellipse cx="100" cy="120" rx="12" ry="8" fill="#A78BFA" />
      </svg>
      
      {/* Floating particles effect for hero size */}
      {size === 'hero' && animated && (
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-purple-400 rounded-full opacity-60"
              animate={{
                y: [-20, -60, -20],
                x: [0, Math.random() * 40 - 20, 0],
                opacity: [0.6, 0.2, 0.6],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                delay: i * 0.5,
                ease: "easeInOut"
              }}
              style={{
                left: `${20 + (i * 12)}%`,
                top: '10%'
              }}
            />
          ))}
        </div>
      )}
    </motion.div>
  )
}
