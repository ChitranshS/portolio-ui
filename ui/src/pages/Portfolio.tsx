import React from 'react';
import { 
  Github, 
  Linkedin, 
  Mail, 
  Briefcase, 
  GraduationCap, 
  Code, 
  Award
} from 'lucide-react';
import { BackgroundGradient } from "@/components/ui/background-gradient";

const Portfolio = () => {
  return (
    <div className="w-full min-h-screen bg-background text-foreground p-8">
      {/* Hero Section */}
      <section className="mb-16">
        <BackgroundGradient className="p-8 rounded-lg">
          <h1 className="text-4xl font-bold mb-4">Chitransh Sharma</h1>
          <h2 className="text-2xl mb-4">Full Stack Developer & AI Enthusiast</h2>
          <div className="flex gap-4">
            <a href="https://github.com/yourgithub" target="_blank" rel="noopener noreferrer" className="hover:text-primary">
              <Github />
            </a>
            <a href="https://linkedin.com/in/yourlinkedin" target="_blank" rel="noopener noreferrer" className="hover:text-primary">
              <Linkedin />
            </a>
            <a href="mailto:your.email@example.com" className="hover:text-primary">
              <Mail />
            </a>
          </div>
        </BackgroundGradient>
      </section>

      {/* Experience Section */}
      <section className="mb-16">
        <div className="flex items-center gap-2 mb-6">
          <Briefcase className="text-primary" />
          <h2 className="text-2xl font-semibold">Work Experience</h2>
        </div>
        <div className="space-y-6">
          <div className="p-6 rounded-lg border border-border hover:border-primary transition-colors">
            <h3 className="text-xl font-semibold">Senior Software Engineer</h3>
            <p className="text-muted-foreground">Company Name • 2020 - Present</p>
            <ul className="mt-2 list-disc list-inside text-muted-foreground">
              <li>Led development of key features resulting in 40% user growth</li>
              <li>Architected and implemented scalable microservices</li>
              <li>Mentored junior developers and conducted code reviews</li>
            </ul>
          </div>
          {/* Add more experience items */}
        </div>
      </section>

      {/* Projects Section */}
      <section className="mb-16">
        <div className="flex items-center gap-2 mb-6">
          <Code className="text-primary" />
          <h2 className="text-2xl font-semibold">Featured Projects</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <BackgroundGradient className="p-6 rounded-lg">
            <h3 className="text-xl font-semibold mb-2">AI-Powered Portfolio</h3>
            <p className="text-muted-foreground mb-4">
              Interactive portfolio with AI chat capabilities for a unique user experience
            </p>
            <div className="flex gap-2">
              <span className="px-2 py-1 rounded-full bg-primary/10 text-primary text-sm">React</span>
              <span className="px-2 py-1 rounded-full bg-primary/10 text-primary text-sm">TypeScript</span>
              <span className="px-2 py-1 rounded-full bg-primary/10 text-primary text-sm">AI</span>
            </div>
          </BackgroundGradient>
          {/* Add more project cards */}
        </div>
      </section>

      {/* Skills Section */}
      <section className="mb-16">
        <div className="flex items-center gap-2 mb-6">
          <Award className="text-primary" />
          <h2 className="text-2xl font-semibold">Skills</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            "React", "TypeScript", "Node.js", "Python",
            "AWS", "Docker", "GraphQL", "MongoDB"
          ].map((skill) => (
            <div key={skill} className="p-4 rounded-lg border border-border text-center hover:border-primary transition-colors">
              {skill}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Portfolio;
