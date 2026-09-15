import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { projectsApi } from '../services/api';
import { SEO } from '../components/SEO';
import { Button } from '../components/Button';
import { TechnologyTag } from '../components/TechnologyTag';
import { LoadingState } from '../components/LoadingState';
import {
  ArrowLeft,
  Calendar,
  ExternalLink,
  Github,
  Star,
  CheckCircle2,
  AlertCircle,
  Code2,
  Layers,
  Sparkles,
} from 'lucide-react';

export function ProjectDetailPage() {
  const { slug } = useParams();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const fetchProject = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await projectsApi.getPublicProjectBySlug(slug);
        if (isMounted) {
          setProject(data);
        }
      } catch (err) {
        if (isMounted) {
          setError(
            err.status === 404
              ? 'Project not found or is currently marked as an unpublished draft.'
              : err.message || 'Failed to load project details.'
          );
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchProject();
    return () => {
      isMounted = false;
    };
  }, [slug]);

  if (loading) {
    return (
      <div className="py-12">
        <LoadingState message="Retrieving case study details from PostgreSQL..." />
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="max-w-xl mx-auto py-16 text-center space-y-6">
        <div className="p-8 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
          <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-500 flex items-center justify-center mx-auto">
            <Layers className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-slate-900">Project Not Found</h2>
          <p className="text-sm text-slate-600 leading-relaxed">
            {error || 'The requested project could not be located in the database.'}
          </p>
        </div>
        <Button to="/projects" variant="secondary" icon={ArrowLeft}>
          Back to Projects
        </Button>
      </div>
    );
  }

  const {
    title,
    short_description,
    description,
    category,
    technologies = [],
    github_url,
    live_demo_url,
    image_url,
    featured,
    start_date,
    completion_date,
    key_features = [],
    challenges = [],
  } = project;

  const hasImage = image_url && !imageError;

  return (
    <>
      <SEO
        title={title}
        description={short_description}
      />

      <article className="max-w-4xl mx-auto space-y-12 py-4">
        {/* Navigation Breadcrumb */}
        <div>
          <Link
            to="/projects"
            className="inline-flex items-center space-x-1.5 text-xs font-mono text-slate-500 hover:text-blue-600 transition-colors focus-visible:outline-none focus-visible:underline"
          >
            <ArrowLeft className="w-3.5 h-3.5 mr-1" />
            <span>Back to Projects Feed</span>
          </Link>
        </div>

        {/* Hero Media / Banner */}
        {hasImage ? (
          <div className="w-full aspect-[21/9] sm:aspect-[16/7] rounded-3xl overflow-hidden bg-slate-100 border border-slate-200 shadow-sm">
            <img
              src={image_url}
              alt={`${title} banner`}
              onError={() => setImageError(true)}
              className="w-full h-full object-cover object-top"
            />
          </div>
        ) : (
          <div className="w-full aspect-[21/7] rounded-3xl bg-gradient-to-br from-slate-50 to-slate-100 border border-slate-200 p-8 flex flex-col justify-between relative overflow-hidden shadow-xs">
            <div className="flex items-center justify-between text-xs font-mono text-blue-700 z-10">
              <span className="uppercase tracking-wider font-semibold">{category || 'Engineering'}</span>
              <span className="text-slate-500 font-mono">/{slug}</span>
            </div>
            <div className="flex items-center justify-between z-10">
              <div className="p-3 rounded-2xl bg-white border border-slate-200 text-slate-500 shadow-xs">
                <Code2 className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>
        )}

        {/* Case Study Header */}
        <header className="space-y-5 pb-8 border-b border-slate-200">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="px-3 py-1 rounded-full text-xs font-mono font-medium tracking-wide uppercase bg-blue-50 text-blue-700 border border-blue-200/80">
              {category || 'Engineering'}
            </span>

            {featured && (
              <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
                <Star className="w-3 h-3 fill-blue-500 text-blue-500" />
                <span>Featured Project</span>
              </span>
            )}

            {(start_date || completion_date) && (
              <span className="inline-flex items-center space-x-1.5 text-xs text-slate-500 font-mono pl-1">
                <Calendar className="w-3.5 h-3.5" />
                <span>
                  {start_date || 'N/A'} — {completion_date || 'Present'}
                </span>
              </span>
            )}
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
            {title}
          </h1>

          <p className="text-base sm:text-lg text-slate-600 leading-relaxed font-normal">
            {short_description}
          </p>

          {/* Action CTAs */}
          <div className="flex flex-wrap gap-3 pt-2">
            {live_demo_url && (
              <Button
                href={live_demo_url}
                variant="primary"
                size="md"
                icon={ExternalLink}
                iconPosition="right"
              >
                Launch Live Demo
              </Button>
            )}
            {github_url && (
              <Button
                href={github_url}
                variant="secondary"
                size="md"
                icon={Github}
              >
                View Source Code
              </Button>
            )}
          </div>
        </header>

        {/* Tech Stack */}
        {Array.isArray(technologies) && technologies.length > 0 && (
          <section className="space-y-3">
            <h2 className="text-xs uppercase tracking-wider font-mono font-semibold text-slate-700">
              Technologies &amp; Tools
            </h2>
            <div className="flex flex-wrap gap-2">
              {technologies.map((tech) => (
                <TechnologyTag key={tech} name={tech} size="md" />
              ))}
            </div>
          </section>
        )}

        {/* Detailed Plaintext Description (Preserving Paragraphs) */}
        {description && (
          <section className="space-y-4">
            <h2 className="text-xs uppercase tracking-wider font-mono font-semibold text-slate-700">
              Project Details &amp; Implementation
            </h2>
            <div className="p-6 sm:p-8 rounded-2xl bg-white border border-slate-200 text-sm sm:text-base text-slate-700 leading-relaxed whitespace-pre-line font-normal shadow-xs">
              {description}
            </div>
          </section>
        )}

        {/* Key Features (Only rendered if data exists) */}
        {Array.isArray(key_features) && key_features.length > 0 && (
          <section className="space-y-4">
            <h2 className="text-xs uppercase tracking-wider font-mono font-semibold text-slate-700">
              Key Features &amp; Capabilities
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {key_features.map((feature, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-start space-x-3"
                >
                  <CheckCircle2 className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                  <span className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                    {feature}
                  </span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Challenges & Solutions (Only rendered if data exists) */}
        {Array.isArray(challenges) && challenges.length > 0 && (
          <section className="space-y-4">
            <h2 className="text-xs uppercase tracking-wider font-mono font-semibold text-slate-700">
              Technical Tradeoffs &amp; Challenges Overcome
            </h2>
            <div className="space-y-3">
              {challenges.map((challenge, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-start space-x-3"
                >
                  <Sparkles className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                  <span className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                    {challenge}
                  </span>
                </div>
              ))}
            </div>
          </section>
        )}
      </article>
    </>
  );
}

export default ProjectDetailPage;
