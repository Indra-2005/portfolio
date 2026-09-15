import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, Github, ExternalLink, Star, Code2 } from 'lucide-react';
import { TechnologyTag } from './TechnologyTag';

export function ProjectCard({ project }) {
  const [imageError, setImageError] = useState(false);

  const {
    title,
    slug,
    short_description,
    category,
    technologies = [],
    github_url,
    live_demo_url,
    image_url,
    featured,
  } = project;

  const hasImage = image_url && !imageError;

  return (
    <article className="group flex flex-col justify-between rounded-2xl bg-white border border-slate-200 hover:border-slate-300 transition-all duration-300 hover:shadow-md shadow-xs overflow-hidden">
      {/* Media / Visual Area */}
      {hasImage ? (
        <div className="relative aspect-[16/9] w-full overflow-hidden bg-slate-100 border-b border-slate-200">
          <img
            src={image_url}
            alt={`${title} project preview`}
            loading="lazy"
            onError={() => setImageError(true)}
            className="w-full h-full object-cover object-top group-hover:scale-[1.02] transition-transform duration-500 ease-out"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent pointer-events-none" />
        </div>
      ) : (
        /* Fallback Visual Banner */
        <div className="relative aspect-[21/9] w-full bg-gradient-to-br from-slate-50 to-slate-100 border-b border-slate-200 flex items-center justify-between px-6 overflow-hidden">
          <div className="space-y-1 z-10">
            <span className="text-[11px] font-mono uppercase tracking-wider text-blue-700 font-semibold">
              {category || 'Engineering'}
            </span>
            <div className="text-sm font-semibold text-slate-700 font-mono">
              /{slug}
            </div>
          </div>
          <div className="p-3 rounded-xl bg-white border border-slate-200 text-slate-500 group-hover:text-blue-600 transition-colors z-10 shadow-xs">
            <Code2 className="w-5 h-5" />
          </div>
        </div>
      )}

      {/* Card Content */}
      <div className="p-6 flex-1 flex flex-col justify-between space-y-5">
        <div className="space-y-3">
          {/* Category & Featured Badges */}
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase tracking-wider text-blue-700 font-semibold">
              {category || 'Engineering'}
            </span>
            {featured && (
              <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-blue-50 text-blue-700 border border-blue-200">
                <Star className="w-3 h-3 fill-blue-500 text-blue-500" />
                <span>Featured</span>
              </span>
            )}
          </div>

          {/* Title */}
          <h3 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight group-hover:text-blue-600 transition-colors">
            <Link to={`/projects/${slug}`} className="focus:outline-none">
              {title}
            </Link>
          </h3>

          {/* Short Description */}
          <p className="text-sm text-slate-600 leading-relaxed line-clamp-3">
            {short_description}
          </p>
        </div>

        {/* Footer Area: Tech tags & Action links */}
        <div className="space-y-4 pt-4 border-t border-slate-100">
          {Array.isArray(technologies) && technologies.length > 0 && (
            <div className="flex flex-wrap gap-1.5" aria-label="Technologies used">
              {technologies.map((tech) => (
                <TechnologyTag key={tech} name={tech} />
              ))}
            </div>
          )}

          <div className="flex items-center justify-between pt-1">
            <Link
              to={`/projects/${slug}`}
              className="inline-flex items-center space-x-1 text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors focus-visible:outline-none focus-visible:underline"
            >
              <span>View Case Study</span>
              <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </Link>

            <div className="flex items-center space-x-3 text-slate-500">
              {github_url && (
                <a
                  href={github_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`GitHub repository for ${title}`}
                  className="p-1 rounded hover:text-slate-900 hover:bg-slate-100 transition-colors"
                >
                  <Github className="w-4 h-4" />
                </a>
              )}
              {live_demo_url && (
                <a
                  href={live_demo_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`Live demo for ${title}`}
                  className="p-1 rounded hover:text-slate-900 hover:bg-slate-100 transition-colors"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}

export default ProjectCard;
