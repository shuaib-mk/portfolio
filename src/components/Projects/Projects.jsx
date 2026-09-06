import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Code2, ExternalLink, Search } from 'lucide-react';
import ScrollReveal from '../ScrollReveal/ScrollReveal';
import InfiniteMenu from '../InfiniteMenu/InfiniteMenu';
import './Projects.css';

const projectData = [
  {
    id: 1,
    title: 'Nexus AI',
    description: 'An intelligent AI assistant & conversational platform built for context-aware chat, rapid knowledge retrieval, and seamless natural language interactions.',
    tags: ['React', 'TypeScript', 'Tailwind', 'AI API'],
    category: 'web',
    image: '/sunniai.jpg',
    github: 'https://github.com/q04ti',
    demo: 'https://sunniai.vercel.app/'
  },
  {
    id: 2,
    title: 'ForgeFlow',
    description: 'Local developer workflow dashboard & durable task execution platform featuring real-time log streaming, operational analytics, and plugin extensions.',
    tags: ['React', 'TypeScript', 'Node.js', 'Railway'],
    category: 'web',
    image: '/forgeflow.jpg',
    github: 'https://github.com/q04ti',
    demo: 'https://forge-flow.up.railway.app/'
  },
  {
    id: 3,
    title: 'Loop & Bloom',
    description: 'Handmade crochet & artisanal gift storefront featuring product showcases, custom gift order flows, and responsive aesthetic design.',
    tags: ['React', 'Tailwind', 'Supabase', 'Vercel'],
    category: 'web',
    image: '/handmadebloom.jpg',
    github: 'https://github.com/q04ti',
    demo: 'https://handmadebloom.vercel.app/'
  }
];

const categories = ['all', 'web'];

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
