import React from 'react';
import DotField from './components/DotField/DotField';
import Navigation from './components/Navigation/Navigation';
import Hero from './components/Hero/Hero';
import Projects from './components/Projects/Projects';
import Skills from './components/Skills/Skills';
import Contact from './components/Contact/Contact';

function App() {
  return (
    <div className="app-container">
      <DotField
        dotRadius={1.2}
        dotSpacing={16}
        cursorRadius={400}
        bulgeStrength={85}
        glowRadius={200}
        sparkle={true}
        waveAmplitude={0.8}
        gradientFrom="rgba(99, 102, 241, 0.4)"
        gradientTo="rgba(139, 92, 246, 0.2)"
        glowColor="#1a1a2e"
      />
      
      <div className="content-overlay">
        <Navigation />
        <main>
          <Hero />
          <Projects />
          <Skills />
          <Contact />
        </main>
      </div>
    </div>
  );
}

export default App;
