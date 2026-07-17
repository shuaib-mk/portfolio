import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Code2, ExternalLink, Search } from 'lucide-react';
import ScrollReveal from '../ScrollReveal/ScrollReveal';
import InfiniteMenu from '../InfiniteMenu/InfiniteMenu';
import './Projects.css';

const projectData = [
  {
    id: 1,
    title: 'E-Commerce Platform',
    description: 'A full-stack e-commerce solution with React, Node.js, and Stripe integration. Features real-time inventory and a custom CMS.',
    tags: ['React', 'Node.js', 'MongoDB', 'Stripe'],
    category: 'web',
    image: 'https://images.unsplash.com/photo-1557821552-17105176677c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    github: 'https://github.com',
    demo: 'https://example.com'
  },
  {
    id: 2,
    title: 'Fitness Tracker App',
    description: 'Mobile-first progressive web app for tracking workouts, nutrition, and personal goals. Includes data visualization with D3.js.',
    tags: ['Next.js', 'TypeScript', 'Tailwind', 'D3.js'],
    category: 'mobile',
    image: 'https://images.unsplash.com/photo-1526506114642-540c0b4e33cb?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    github: 'https://github.com',
    demo: 'https://example.com'
  },
  {
    id: 3,
    title: 'Design System',
    description: 'Comprehensive component library and design system built for enterprise applications. Includes dark mode and accessibility features.',
    tags: ['React', 'Storybook', 'Figma', 'CSS Modules'],
    category: 'design',
    image: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    github: 'https://github.com',
    demo: 'https://example.com'
  },
  {
    id: 4,
    title: 'Real-time Chat App',
    description: 'WebSocket-based chat application with end-to-end encryption, file sharing, and group messaging capabilities.',
    tags: ['Vue.js', 'Socket.io', 'Express', 'PostgreSQL'],
    category: 'web',
    image: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    github: 'https://github.com',
    demo: 'https://example.com'
  }
];

const categories = ['all', 'web', 'mobile', 'design'];

const Projects = () => {
  const [filter, setFilter] = useState('all');

  const filteredProjects = projectData.filter(project => 
    filter === 'all' ? true : project.category === filter
  );

  return (
    <section id="projects" className="section-container">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.6 }}
      >
        <ScrollReveal textClassName="section-title">Featured Projects</ScrollReveal>
      </motion.div>

      <div className="filter-container">
        {categories.map(cat => (
          <button
            key={cat}
            className={`filter-btn ${filter === cat ? 'active' : ''}`}
            onClick={() => setFilter(cat)}
          >
            {cat.charAt(0).toUpperCase() + cat.slice(1)}
          </button>
        ))}
      </div>

      <div className="infinite-menu-container">
        <InfiniteMenu 
          scale={1.6}
          items={filteredProjects.map(p => ({
            image: p.image,
            link: p.demo || p.github,
            title: p.title,
            description: p.description
          }))} 
        />
      </div>
      
      {filteredProjects.length === 0 && (
        <div className="no-results">
          <Search size={48} className="no-results-icon" />
          <p>No projects found in this category.</p>
        </div>
      )}
    </section>
  );
};

export default Projects;
