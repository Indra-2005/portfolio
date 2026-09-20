import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { projectsApi } from '../services/api';
import { SEO } from '../components/SEO';
import { Button } from '../components/Button';
import { SectionHeading } from '../components/SectionHeading';
import { ProjectGrid } from '../components/ProjectGrid';
import { ProjectGridSkeleton } from '../components/LoadingState';
import { EmptyState } from '../components/EmptyState';
import { TechnologyTag } from '../components/TechnologyTag';
import {
  ArrowRight,
  Github,
  Mail,
} from 'lucide-react';

const SKILL_CATEGORIES = [
  {
    title: 'Programming',
    skills: ['Python', 'C++', 'JavaScript', 'SQL'],
  },
  {
    title: 'AI / Machine Learning',
    skills: [
      'Machine Learning',
      'Deep Learning',
      'Computer Vision',
      'Predictive Analytics',
      'Model Development',
      'Model Evaluation',
      'Classification',
      'Regression',
      'Clustering',
    ],
  },
  {
    title: 'Data',
    skills: [
      'Pandas',
      'NumPy',
      'Matplotlib',
      'Data Preprocessing',
      'Feature Engineering',
      'EDA',
    ],
  },
  {
    title: 'Databases',
    skills: ['MySQL', 'PostgreSQL', 'MongoDB'],
  },
  {
    title: 'Tools',
    skills: ['Git', 'GitHub', 'VS Code', 'Jupyter Notebook'],
  },
];

export function HomePage() {
  const [featuredProjects, setFeaturedProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    const fetchFeatured = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await projectsApi.getPublicProjects({ featured: true, page_size: 3 });
        if (isMounted) {
          setFeaturedProjects(res.items || []);
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message || 'Failed to load featured projects.');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchFeatured();
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <>
      <SEO
        title="Devendra Bhoi | Machine Learning & Software Portfolio"
        description="Devendra Bhoi — Computer Engineering graduate from SSBT COET (2026) focused on Machine Learning, AI fundamentals, Python, SQL, and software development."
      />

      <div className="space-y-20 sm:space-y-28">
        {/* ================================================================ */}
        {/* HERO */}
        {/* ================================================================ */}
        <section className="pt-4 sm:pt-10 pb-6 max-w-3xl text-left space-y-6">
          <p className="text-sm font-mono text-slate-500 dark:text-slate-400 tracking-wide">
            Computer Engineering Graduate · SSBT COET, 2026
          </p>

          <div className="space-y-4">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-slate-900 dark:text-white leading-[1.15]">
              Hi, I'm Devendra Bhoi.
              <br />
              <span className="text-slate-500 dark:text-slate-400">
                AI/ML & Software Development.
              </span>
            </h1>
            <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl">
              I build machine learning models and software applications using Python, SQL, and modern frameworks. Currently focused on predictive modeling, computer vision, and clean backend development.
            </p>
          </div>

          {/* CTAs */}
          <div className="flex flex-wrap items-center gap-3 pt-1">
            <Button
              to="/projects"
              variant="primary"
              size="lg"
              icon={ArrowRight}
              iconPosition="right"
            >
              View Projects
            </Button>
            <Button
              to="/contact"
              variant="secondary"
              size="lg"
              icon={Mail}
            >
              Contact Me
            </Button>
            <Button
              href="https://github.com/Indra-2005"
              variant="ghost"
              size="lg"
              icon={Github}
            >
              GitHub
            </Button>
          </div>
        </section>

        {/* ================================================================ */}
        {/* FEATURED PROJECTS */}
        {/* ================================================================ */}
        <section className="space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <SectionHeading
              eyebrow="Selected Work"
              title="Featured Projects"
              description="Projects I've built to explore machine learning, data analysis, and software engineering."
            />
            <Link
              to="/projects"
              className="inline-flex items-center space-x-1.5 text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors group flex-shrink-0"
            >
              <span>All projects</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>

          {loading ? (
            <ProjectGridSkeleton count={3} />
          ) : error ? (
            <div className="p-6 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center space-y-2">
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Unable to load featured projects at this time.
              </p>
              <Link
                to="/projects"
                className="inline-flex items-center space-x-1 text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline"
              >
                <span>Browse all projects</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          ) : featuredProjects.length === 0 ? (
            <EmptyState
              title="Projects Coming Soon"
              description="Featured projects are being organized. Check the projects page for all published work."
              actionText="View Projects"
              actionTo="/projects"
            />
          ) : (
            <ProjectGrid projects={featuredProjects} />
          )}
        </section>

        {/* ================================================================ */}
        {/* SKILLS */}
        {/* ================================================================ */}
        <section className="space-y-8">
          <SectionHeading
            eyebrow="Technical Skills"
            title="Technologies & Tools"
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {SKILL_CATEGORIES.map((cat) => (
              <div
                key={cat.title}
                className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3"
              >
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white tracking-tight">
                  {cat.title}
                </h3>
                <div className="flex flex-wrap gap-1.5">
                  {cat.skills.map((skill) => (
                    <TechnologyTag key={skill} name={skill} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ================================================================ */}
        {/* ABOUT PREVIEW */}
        {/* ================================================================ */}
        <section className="max-w-3xl space-y-4">
          <SectionHeading
            eyebrow="About"
            title="Background"
          />
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
            Computer Engineering graduate from SSBT COET (2026) with a focus on machine learning, data preprocessing, and building practical software systems. I enjoy turning ideas into working applications while strengthening my foundations in computer science.
          </p>
          <div className="pt-1">
            <Button
              to="/about"
              variant="outline"
              size="md"
              icon={ArrowRight}
              iconPosition="right"
            >
              Learn More
            </Button>
          </div>
        </section>

        {/* ================================================================ */}
        {/* CONTACT CTA */}
        {/* ================================================================ */}
        <section className="text-center max-w-xl mx-auto py-8 sm:py-12 space-y-5">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
            Interested in working together?
          </h2>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
            I'm looking for entry-level opportunities in machine learning, AI, and software engineering. Feel free to reach out.
          </p>
          <div className="pt-1">
            <Button
              to="/contact"
              variant="primary"
              size="lg"
              icon={Mail}
            >
              Get In Touch
            </Button>
          </div>
        </section>
      </div>
    </>
  );
}

export default HomePage;
