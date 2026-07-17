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
        dotRadius={2.5}
        dotSpacing={14}
        bulgeStrength={67}
        glowRadius={160}
        sparkle={false}
        waveAmplitude={0}
        cursorRadius={500}
        cursorForce={0.1}
        bulgeOnly
        gradientFrom="rgba(255, 255, 255, 0.8)"
        gradientTo="rgba(255, 255, 255, 0.4)"
        glowColor="#120F17"
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
