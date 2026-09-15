import { ProjectCard } from './ProjectCard';

export function ProjectGrid({ projects, className = '' }) {
  if (!projects || projects.length === 0) {
    return null;
  }

  // Adjust grid layout dynamically based on count:
  // If 1 project, limit width so it doesn't stretch awkwardly across the screen.
  const gridClasses =
    projects.length === 1
      ? 'grid grid-cols-1 max-w-xl mx-auto'
      : projects.length === 2
      ? 'grid grid-cols-1 md:grid-cols-2 max-w-4xl mx-auto gap-6 sm:gap-8'
      : 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8';

  return (
    <div className={`${gridClasses} ${className}`}>
      {projects.map((project) => (
        <ProjectCard key={project.id} project={project} />
      ))}
    </div>
  );
}

export default ProjectGrid;
