import { SEO } from '../components/SEO';
import { SectionHeading } from '../components/SectionHeading';
import { Button } from '../components/Button';
import {
  ArrowRight,
  CheckCircle2,
} from 'lucide-react';

const EDUCATION = {
  degree: 'Bachelor of Engineering (B.E.) in Computer Engineering',
  institution: "SSBT's College of Engineering and Technology (SSBT COET)",
  graduationYear: '2026',
  keyAreas: [
    'Data Structures & Algorithms',
    'Relational Database Management Systems',
    'Machine Learning & Statistical Foundations',
    'Object-Oriented Design',
    'Operating Systems & Computer Networks',
  ],
};

const FOCUS_AREAS = [
  {
    title: 'Machine Learning & Predictive Modeling',
    description:
      'Building and evaluating predictive models using Python, Scikit-learn, Pandas, and NumPy for classification, regression, and clustering tasks.',
  },
  {
    title: 'Data Preprocessing & Feature Engineering',
    description:
      'Exploratory data analysis, cleaning datasets, handling missing values, encoding categorical variables, and engineering features for modeling.',
  },
  {
    title: 'Python & Relational Databases',
    description:
      'Data manipulation, relational schema design with PostgreSQL, SQL queries, and schema migrations with Alembic.',
  },
  {
    title: 'REST API & Backend Development',
    description:
      'RESTful services with FastAPI, strict data contracts via Pydantic v2, and clean service/repository architecture.',
  },
];

export function AboutPage() {
  return (
    <>
      <SEO
        title="About"
        description="Learn about Devendra Bhoi's background in Computer Engineering, Machine Learning, and software development."
      />

      <div className="max-w-3xl mx-auto space-y-14 py-4">
        {/* Page Header */}
        <SectionHeading
          eyebrow="About"
          title="Devendra Bhoi"
          description="Computer Engineering graduate from SSBT COET (2026) interested in machine learning, AI fundamentals, and building practical software."
        />

        {/* Introduction */}
        <section className="space-y-3 text-slate-600 dark:text-slate-300 text-sm sm:text-base leading-relaxed">
          <p>
            I approach technology with a methodical mindset. Rather than viewing machine learning models or software systems as black boxes, I focus on understanding the underlying data, mathematical concepts, and system boundaries.
          </p>
          <p>
            My primary interest is in applied machine learning — preprocessing datasets, engineering features, training models, and validating results. Alongside that, I build software applications that connect data workflows with structured backend services.
          </p>
        </section>

        {/* Education */}
        <section className="space-y-4">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white tracking-tight">
            Education
          </h3>

          <div className="p-5 sm:p-6 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="space-y-1">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs font-mono uppercase tracking-wider text-blue-600 dark:text-blue-400 font-medium">
                  Bachelor of Engineering
                </span>
                <span className="text-xs font-mono text-slate-500 dark:text-slate-400">
                  Graduation: {EDUCATION.graduationYear}
                </span>
              </div>
              <h4 className="text-base sm:text-lg font-semibold text-slate-900 dark:text-white">
                {EDUCATION.degree}
              </h4>
              <p className="text-sm text-slate-600 dark:text-slate-300">{EDUCATION.institution}</p>
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2">
              <span className="text-xs font-mono uppercase tracking-wider text-slate-500 dark:text-slate-400 font-medium">
                Core Coursework
              </span>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-slate-600 dark:text-slate-300">
                {EDUCATION.keyAreas.map((area) => (
                  <li key={area} className="flex items-center space-x-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                    <span>{area}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* Technical Focus */}
        <section className="space-y-4">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white tracking-tight">
            Technical Focus
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {FOCUS_AREAS.map((area) => (
              <div
                key={area.title}
                className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2"
              >
                <h4 className="text-sm font-semibold text-slate-900 dark:text-white">
                  {area.title}
                </h4>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  {area.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Currently Learning */}
        <section className="space-y-3">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white tracking-tight">
            Currently Learning
          </h3>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
            Expanding into deep learning, PyTorch, and computer vision — implementing neural network architectures, gradient-based optimization, and image dataset transformations.
          </p>
        </section>

        {/* Career Direction */}
        <section className="space-y-3">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white tracking-tight">
            Career Direction
          </h3>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
            Seeking an entry-level role in machine learning, AI, or software engineering where I can apply my computer engineering foundations and grow as an engineer.
          </p>
        </section>

        {/* CTAs */}
        <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex flex-wrap gap-3 items-center">
          <Button
            to="/projects"
            variant="primary"
            size="md"
            icon={ArrowRight}
            iconPosition="right"
          >
            View Projects
          </Button>
          <Button
            to="/contact"
            variant="secondary"
            size="md"
          >
            Contact Me
          </Button>
        </div>
      </div>
    </>
  );
}

export default AboutPage;
