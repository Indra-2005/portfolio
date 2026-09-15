import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { projectsApi } from '../services/api';
import { SEO } from '../components/SEO';
import { Button } from '../components/Button';
import { SectionHeading } from '../components/SectionHeading';
import { ProjectGrid } from '../components/ProjectGrid';
import { LoadingState } from '../components/LoadingState';
import { EmptyState } from '../components/EmptyState';
import { TechnologyTag } from '../components/TechnologyTag';
import {
  ArrowRight,
  Github,
  Mail,
  Server,
  Database,
  Cpu,
  Wrench,
  GraduationCap,
  Sparkles,
} from 'lucide-react';

const SKILL_CATEGORIES = [
  {
    title: 'Machine Learning & Data',
    icon: Cpu,
    skills: [
      'Python',
      'Pandas',
      'NumPy',
      'Scikit-Learn',
      'Exploratory Data Analysis',
      'Data Preprocessing',
      'Feature Engineering',
      'Model Evaluation',
    ],
  },
  {
    title: 'Databases & SQL',
    icon: Database,
    skills: ['PostgreSQL', 'SQL Queries', 'Relational Schema Design', 'Alembic Migrations', 'SQLAlchemy 2.x'],
  },
  {
    title: 'Backend & APIs',
    icon: Server,
    skills: ['FastAPI', 'REST API Development', 'Pydantic v2', 'Endpoint Design', 'Modular Architecture'],
  },
  {
    title: 'Currently Learning',
    icon: Sparkles,
    skills: ['Deep Learning', 'PyTorch', 'Computer Vision', 'Neural Networks'],
  },
  {
    title: 'Tools & Development',
    icon: Wrench,
    skills: ['Git', 'GitHub', 'Linux / Bash', 'Postman', 'Docker Basics'],
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
        title="Machine Learning & AI Enthusiast | Computer Engineering"
        description="Devendra Bhoi — Computer Engineering graduate from SSBT COET (2026) focused on Machine Learning, AI fundamentals, Python, SQL, and data-driven systems."
      />

      <div className="space-y-20 sm:space-y-28">
        {/* ==================================================================== */}
        {/* HERO SECTION */}
        {/* ==================================================================== */}
        <section className="pt-4 sm:pt-10 pb-6 max-w-4xl mx-auto text-left space-y-8">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-mono font-medium tracking-wide uppercase bg-blue-50 text-blue-700 border border-blue-200/80">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>SSBT COET (2026) • Computer Engineering</span>
          </div>

          <div className="space-y-4">
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 leading-tight">
              Applying Machine Learning &amp; AI Fundamentals to Practical Systems.
            </h1>
            <p className="text-base sm:text-xl text-slate-600 leading-relaxed font-normal max-w-3xl">
              I am <span className="font-semibold text-slate-900">Devendra Bhoi</span>, a Computer Engineering student graduating in 2026 from SSBT COET with a primary interest in Machine Learning and Artificial Intelligence. I develop data-driven applications, clean predictive pipelines, and structured backend services with Python, SQL, and modern frameworks.
            </p>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center gap-4 pt-2">
            <Button
              to="/projects"
              variant="primary"
              size="lg"
              icon={ArrowRight}
              iconPosition="right"
            >
              Explore Projects
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

        {/* ==================================================================== */}
        {/* SELECTED WORK / FEATURED PROJECTS */}
        {/* ==================================================================== */}
        <section className="space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <SectionHeading
              eyebrow="Selected Work"
              title="Featured Engineering Projects"
              description="Data-driven applications and software systems built with disciplined structure, relational persistence, and clean APIs."
            />
            <Link
              to="/projects"
              className="inline-flex items-center space-x-1.5 text-xs sm:text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors group flex-shrink-0"
            >
              <span>View all projects</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>

          {loading ? (
            <LoadingState message="Fetching featured projects from PostgreSQL..." />
          ) : error ? (
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 text-center text-xs text-slate-600">
              {error}
            </div>
          ) : featuredProjects.length === 0 ? (
            <EmptyState
              title="Projects Updating"
              description="Featured projects are currently being organized in the database. You can explore all published projects via the link below."
              actionText="View Projects Directory"
              actionTo="/projects"
            />
          ) : (
            <ProjectGrid projects={featuredProjects} />
          )}
        </section>

        {/* ==================================================================== */}
        {/* TECHNICAL COMPETENCIES / SKILLS */}
        {/* ==================================================================== */}
        <section className="space-y-10">
          <SectionHeading
            eyebrow="Technical Competencies"
            title="Core Skills &amp; Technical Focus"
            description="Foundations in Machine Learning, predictive modeling, relational databases, and clean software development."
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {SKILL_CATEGORIES.map((cat) => {
              const Icon = cat.icon;
              return (
                <div
                  key={cat.title}
                  className="p-6 rounded-2xl bg-white border border-slate-200 hover:border-slate-300 hover:shadow-sm transition-all space-y-4"
                >
                  <div className="flex items-center space-x-3">
                    <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600 border border-blue-100">
                      <Icon className="w-5 h-5" />
                    </div>
                    <h3 className="font-semibold text-slate-900 text-base tracking-tight">
                      {cat.title}
                    </h3>
                  </div>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {cat.skills.map((skill) => (
                      <TechnologyTag key={skill} name={skill} />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* ==================================================================== */}
        {/* ABOUT PREVIEW */}
        {/* ==================================================================== */}
        <section className="p-8 sm:p-12 rounded-3xl bg-slate-50 border border-slate-200 space-y-6">
          <div className="flex items-center space-x-2.5 text-xs font-mono uppercase tracking-wider text-blue-700 font-semibold">
            <GraduationCap className="w-4 h-4" />
            <span>Academic Background Snapshot</span>
          </div>

          <div className="space-y-4 max-w-3xl">
            <h3 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              Solid foundations in Computer Engineering, ML workflows, and clean code.
            </h3>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
              With a background in Computer Engineering at SSBT COET (Graduation Year: 2026), I approach problem solving with a focus on data preprocessing, feature engineering, predictive modeling, and clean relational architecture.
            </p>
          </div>

          <div className="pt-2">
            <Button
              to="/about"
              variant="outline"
              size="md"
              icon={ArrowRight}
              iconPosition="right"
            >
              Read Full Academic &amp; Engineering Profile
            </Button>
          </div>
        </section>

        {/* ==================================================================== */}
        {/* CONTACT CTA BANNER */}
        {/* ==================================================================== */}
        <section className="text-center max-w-2xl mx-auto py-8 sm:py-12 space-y-6">
          <div className="inline-flex p-3 rounded-2xl bg-blue-50 text-blue-600 border border-blue-200/80 mx-auto">
            <Sparkles className="w-6 h-6" />
          </div>

          <div className="space-y-3">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Interested in collaborating or discussing opportunities?
            </h2>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
              I am actively seeking entry-level opportunities in Machine Learning, AI, and Software Engineering where I can apply my skills to real-world challenges.
            </p>
          </div>

          <div className="pt-2">
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
