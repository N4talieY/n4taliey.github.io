import React from "react";
import FadeInSection from "./FadeInSection";
import "../styles/SelectedProjects.css";

const projects = [
  {
    title: "Melodify",
    date: "Feb - May 2025",
    description: "A full-stack music resource platform with authentication, uploads, tagging, playback, search, moderation, and audit logs.",
    tags: ["Spring Boot", "JWT", "MySQL", "Redis", "Docker", "Jenkins"],
  },
  {
    title: "WearAI",
    date: "Feb - May 2025",
    description: "An AI-driven outfit recommender combining live weather, wardrobe inventory, calendar events, and privacy-aware personalization, refined through a 78-person user study.",
    tags: ["Generative AI", "Mobile UX", "Figma", "User Research"],
  },
  {
    title: "Route Planning & Sorting",
    date: "Apr - May 2025",
    description: "A Java route-planning system using Dijkstra's algorithm, CSV data loaders, JavaFX visualization, and comparative sorting benchmarks.",
    tags: ["Java", "JavaFX", "Dijkstra", "Algorithms"],
  },
  {
    title: "Water Level Prediction",
    date: "Mar 2024",
    description: "A predictive model and web visualization for Great Lakes water levels, awarded second prize in HackDKU's Energy & Environment track.",
    tags: ["Machine Learning", "Data Visualization", "Web"],
  },
];

const SelectedProjects = () => (
  <div id="projects">
    <FadeInSection>
      <div className="section-header">
        <span className="section-title">/ selected projects</span>
      </div>
      <div className="selected-projects-grid">
        {projects.map((project, index) => (
          <FadeInSection key={project.title} delay={`${(index + 1) * 100}ms`}>
            <article className="selected-project-card">
              <div className="selected-project-heading">
                <h3>{project.title}</h3>
                <span>{project.date}</span>
              </div>
              <p>{project.description}</p>
              <div className="selected-project-tags" aria-label={`${project.title} technologies`}>
                {project.tags.map((tag) => <span key={tag}>{tag}</span>)}
              </div>
            </article>
          </FadeInSection>
        ))}
      </div>
    </FadeInSection>
  </div>
);

export default SelectedProjects;
