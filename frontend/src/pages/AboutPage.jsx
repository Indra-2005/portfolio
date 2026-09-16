import { SEO } from '../components/SEO';
import { SectionHeading } from '../components/SectionHeading';
import { Button } from '../components/Button';
import {
  GraduationCap,
  Layers,
  Code2,
  Compass,
  ArrowRight,
  BookOpen,
  CheckCircle2,
} from 'lucide-react';

const EDUCATION_DETAILS = [
  {
    degree: 'Bachelor of Engineering (B.E.) in Computer Engineering',
    institution: "SSBT's College of Engineering and Technology (SSBT COET)",
    graduationYear: '2026',
    focus: 'Computer Engineering, Machine Learning & AI, and Data-Driven Systems',
    keyAreas: [
      'Data Structures & Algorithms',
      'Relational Database Management Systems (RDBMS & SQL)',
      'Machine Learning & Statistical Foundations',
      'Object-Oriented & Modular System Design',
      'Operating Systems & Computer Networks',
    ],
  },
];

const TECHNICAL_FOCUS_AREAS = [
  {
    title: 'Machine Learning & Predictive Modeling',
    description:
      'Developing and evaluating predictive models using Python, Scikit-learn, Pandas, and NumPy for classification, regression, and clustering tasks with standard evaluation metrics.',
  },
  {
    title: 'Data Preprocessing & Feature Engineering',
    description:
      'Conducting exploratory data analysis (EDA), cleaning real-world datasets, handling missing values, encoding categorical variables, and engineering features for modeling.',
  },
  {
    title: 'Python & Relational Databases',
    description:
      'Writing structured data manipulation scripts, designing relational schemas in PostgreSQL, writing efficient SQL queries, and managing schema migrations with Alembic.',
  },
  {
    title: 'REST API & System Development',
    description:
      'Constructing maintainable RESTful services using FastAPI, enforcing strict request/response data contracts with Pydantic v2, and organizing clean router, service, and repository layers.',
  },
];

export function AboutPage() {
  return (
    <>
      <SEO
        title="About"
        description="Learn about Devendra Bhoi's Computer Engineering background from SSBT COET (2026), focus on Machine Learning, AI fundamentals, and software development."
      />

      <div className="max-w-4xl mx-auto space-y-16 py-4">
        {/* Page Header */}
        <div className="space-y-4">
          <SectionHeading
            eyebrow="Academic & Engineering Profile"
            title="About Devendra Bhoi"
            description="Computer Engineering student at SSBT COET (Graduation Year: 2026) passionate about Machine Learning, AI fundamentals, and data-driven systems."
          />
        </div>

        {/* Introduction Section */}
        <section className="space-y-4">
          <h3 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center space-x-2">
            <Code2 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <span>Engineering Perspective &amp; Approach</span>
          </h3>
          <div className="space-y-3 text-slate-600 dark:text-slate-300 text-sm sm:text-base leading-relaxed">
            <p>
              I approach technology with an analytical and methodical mindset. Rather than viewing machine learning models or software systems as black boxes, I prioritize understanding the underlying data distributions, mathematical concepts, and system boundaries.
            </p>
            <p>
              My primary interest centers on applied Machine Learning and Artificial Intelligence: preprocessing structured datasets, engineering informative features, training baseline models, and validating results with rigor. Concurrently, I build practical software applications that connect data workflows with structured backend services.
            </p>
          </div>
        </section>

        {/* Education Section */}
        <section className="space-y-6">
          <h3 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center space-x-2">
            <GraduationCap className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <span>Academic Background</span>
          </h3>

          <div className="space-y-4">
            {EDUCATION_DETAILS.map((edu) => (
              <div
                key={edu.degree}
                className="p-6 sm:p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4"
              >
                <div className="space-y-1.5">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-xs font-mono uppercase tracking-wider text-blue-700 dark:text-blue-400 font-semibold bg-blue-50 dark:bg-blue-950/60 px-2.5 py-0.5 rounded-md border border-blue-200/60 dark:border-blue-800/60">
                      Bachelor of Engineering
                    </span>
                    <span className="text-xs font-mono text-slate-500 dark:text-slate-400 font-medium">
                      Graduation: {edu.graduationYear}
                    </span>
                  </div>
                  <h4 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                    {edu.degree}
                  </h4>
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-300">{edu.institution}</p>
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">{edu.focus}</p>
                </div>

                <div className="pt-2 space-y-2.5 border-t border-slate-100 dark:border-slate-800">
                  <span className="text-xs font-mono uppercase tracking-wider text-slate-700 dark:text-slate-300 font-semibold">
                    Core Coursework &amp; Academic Foundations:
                  </span>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs sm:text-sm text-slate-600 dark:text-slate-300">
                    {edu.keyAreas.map((area) => (
                      <li key={area} className="flex items-center space-x-2">
                        <CheckCircle2 className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                        <span>{area}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Technical Focus Areas */}
        <section className="space-y-6">
          <h3 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center space-x-2">
            <Layers className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <span>Core Technical Focus</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {TECHNICAL_FOCUS_AREAS.map((area) => (
              <div
                key={area.title}
                className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 shadow-xs hover:shadow-sm transition-all space-y-2.5"
              >
                <h4 className="font-semibold text-slate-900 dark:text-white text-base tracking-tight">
                  {area.title}
                </h4>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  {area.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* What I am currently building / learning */}
        <section className="space-y-4">
          <h3 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center space-x-2">
            <BookOpen className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <span>Currently Learning</span>
          </h3>
          <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-3 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            <p>
              I am actively expanding my skillset into <strong>Deep Learning</strong>, <strong>PyTorch</strong>, and <strong>Computer Vision</strong>. I focus on implementing neural network architectures, understanding gradient-based optimization, and working with image dataset transformations.
            </p>
            <p>
              Alongside deep learning studies, I continuously practice data preprocessing workflows, clean relational data modeling with PostgreSQL, and testing backend APIs using automated pytest suites.
            </p>
          </div>
        </section>

        {/* Career Direction */}
        <section className="space-y-4">
          <h3 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center space-x-2">
            <Compass className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <span>Career Direction</span>
          </h3>
          <div className="p-6 rounded-2xl bg-blue-50/50 dark:bg-blue-950/30 border border-blue-200/80 dark:border-blue-800/60 space-y-2 text-sm sm:text-base text-slate-700 dark:text-slate-300 leading-relaxed">
            <p>
              I am seeking an entry-level opportunity in <strong>Machine Learning</strong>, <strong>Artificial Intelligence</strong>, or <strong>Software Engineering</strong> where I can apply my foundational computer engineering knowledge, contribute to real-world projects, and grow as an engineer.
            </p>
          </div>
        </section>

        {/* CTAs */}
        <div className="pt-6 border-t border-slate-200 dark:border-slate-800 flex flex-wrap gap-4 items-center">
          <Button
            to="/projects"
            variant="primary"
            size="md"
            icon={ArrowRight}
            iconPosition="right"
          >
            View Projects Portfolio
          </Button>
          <Button
            to="/contact"
            variant="secondary"
            size="md"
          >
            Contact Me Directly
          </Button>
        </div>
      </div>
    </>
  );
}

export default AboutPage;
