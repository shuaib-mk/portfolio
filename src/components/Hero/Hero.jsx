import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, MousePointer2, Code, Database, Paintbrush } from 'lucide-react';
import CardSwap, { Card } from '../CardSwap/CardSwap';
import ScrollReveal from '../ScrollReveal/ScrollReveal';
import './Hero.css';

const roles = [
  "Full Stack Developer",
  "UI/UX Designer",
  "Problem Solver",
  "Creative Thinker"
];

const Hero = () => {
  const [currentRoleIndex, setCurrentRoleIndex] = useState(0);
  const [displayText, setDisplayText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Typewriter effect
  useEffect(() => {
    let timer;
    const currentRole = roles[currentRoleIndex];
    
    if (isDeleting) {
      if (displayText === '') {
        setIsDeleting(false);
        setCurrentRoleIndex((prev) => (prev + 1) % roles.length);
      } else {
        timer = setTimeout(() => {
          setDisplayText(currentRole.substring(0, displayText.length - 1));
        }, 50); // Delete speed
      }
    } else {
      if (displayText === currentRole) {
        timer = setTimeout(() => setIsDeleting(true), 2000); // Wait before deleting
      } else {
        timer = setTimeout(() => {
          setDisplayText(currentRole.substring(0, displayText.length + 1));
        }, 100); // Type speed
      }
    }
    
    return () => clearTimeout(timer);
  }, [displayText, isDeleting, currentRoleIndex]);

  return (
    <section id="home" className="hero-section">
      <div className="hero-content">
        <motion.div 
          className="availability-badge"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <span className="pulse-dot"></span>
          Available for projects
        </motion.div>
        
        <motion.h1 
          className="hero-title"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          Hi, I'm <span className="text-gradient">q04ti</span>
        </motion.h1>
        
        <motion.h2 
          className="hero-role"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          A <span className="typewriter-text">{displayText}<span className="cursor">|</span></span>
        </motion.h2>
        
        <motion.div 
          className="hero-bio"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <ScrollReveal>
            Passionate about creating beautiful, functional, and user-centric digital experiences. Specializing in modern web technologies and innovative design solutions.
          </ScrollReveal>
        </motion.div>
        
        <motion.div 
          className="hero-actions"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <a href="#projects" className="btn btn-primary">
            View Projects <ArrowRight size={18} className="btn-icon" />
          </a>
          <a href="#contact" className="btn btn-secondary">
            Contact Me
          </a>
        </motion.div>
        
        <motion.div 
          className="hero-stats"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.8 }}
        >
          <div className="stat-item">
            <h3 className="stat-value text-gradient">5+</h3>
            <p className="stat-label">Projects Completed</p>
          </div>
          <div className="stat-item">
            <h3 className="stat-value text-gradient">2+</h3>
            <p className="stat-label">Years Experience</p>
          </div>
          <div className="stat-item">
            <h3 className="stat-value text-gradient">100%</h3>
            <p className="stat-label">Client Satisfaction</p>
          </div>
        </motion.div>
      </div>
      
      <div className="hero-card-swap-container">
        <CardSwap
          cardDistance={60}
          verticalDistance={70}
          delay={5000}
          pauseOnHover={false}
        >
          <Card className="glass-panel" style={{ padding: '30px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <div style={{ padding: '12px', background: 'rgba(168, 85, 247, 0.15)', borderRadius: '12px', width: 'fit-content' }}>
              <Code size={28} color="var(--color-primary)" />
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--color-text)' }}>Frontend Dev</h3>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem', lineHeight: '1.6' }}>Building responsive and dynamic user interfaces.</p>
          </Card>
          <Card className="glass-panel" style={{ padding: '30px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <div style={{ padding: '12px', background: 'rgba(168, 85, 247, 0.15)', borderRadius: '12px', width: 'fit-content' }}>
              <Database size={28} color="var(--color-primary)" />
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--color-text)' }}>Backend Dev</h3>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem', lineHeight: '1.6' }}>Architecting robust and scalable APIs.</p>
          </Card>
          <Card className="glass-panel" style={{ padding: '30px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <div style={{ padding: '12px', background: 'rgba(168, 85, 247, 0.15)', borderRadius: '12px', width: 'fit-content' }}>
              <Paintbrush size={28} color="var(--color-primary)" />
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--color-text)' }}>UI/UX Design</h3>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem', lineHeight: '1.6' }}>Crafting beautiful and intuitive user experiences.</p>
          </Card>
        </CardSwap>
      </div>
      
      <motion.div 
        className="scroll-indicator"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 1 }}
      >
        <MousePointer2 size={24} />
      </motion.div>
    </section>
  );
};

export default Hero;
