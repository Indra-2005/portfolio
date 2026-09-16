import { useState, useEffect } from 'react';
import { projectsApi } from '../services/api';
import { SEO } from '../components/SEO';
import { SectionHeading } from '../components/SectionHeading';
import { ProjectGrid } from '../components/ProjectGrid';
import { ProjectGridSkeleton } from '../components/LoadingState';
import { EmptyState } from '../components/EmptyState';
import { ErrorState } from '../components/ErrorState';
import { Search } from 'lucide-react';

export function ProjectsPage() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const fetchProjects = async () => {
    try {
      setLoading(true);
      setError(null);
      // Fetch published projects from PostgreSQL
      const res = await projectsApi.getPublicProjects({ page: 1, page_size: 50 });
      setProjects(res.items || []);
    } catch (err) {
      setError(err.message || 'Failed to retrieve published projects from the database.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  // Compute categories dynamically from real fetched database records
  const uniqueCategories = [
    'All',
    ...Array.from(new Set(projects.map((p) => p.category).filter(Boolean))),
  ];

  // Client-side search and category filtering
  const filteredProjects = projects.filter((p) => {
    const matchesCategory =
      selectedCategory === 'All' ||
      (p.category && p.category.toLowerCase() === selectedCategory.toLowerCase());

    const query = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !query ||
      p.title.toLowerCase().includes(query) ||
      (p.short_description && p.short_description.toLowerCase().includes(query)) ||
      (Array.isArray(p.technologies) &&
        p.technologies.some((t) => t.toLowerCase().includes(query)));

    return matchesCategory && matchesSearch;
  });

  return (
    <>
      <SEO
        title="Projects"
        description="Explore machine learning projects, data-driven applications, and software systems built by Devendra Bhoi."
      />

      <div className="space-y-10 sm:space-y-12">
        {/* Section Header */}
        <div className="space-y-4">
          <SectionHeading
            eyebrow="Portfolio Showcase"
            title="Projects &amp; Case Studies"
            description="All projects are queried dynamically from the PostgreSQL database, respecting priority order rankings and publication controls."
          />
        </div>

        {/* Filter & Search Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
          {/* Category Tabs */}
          <div className="flex items-center space-x-1.5 overflow-x-auto pb-2 sm:pb-0 scrollbar-none" role="tablist">
            {uniqueCategories.map((category) => (
              <button
                key={category}
                type="button"
                role="tab"
                aria-selected={selectedCategory === category}
                onClick={() => setSelectedCategory(category)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-mono font-medium transition-colors whitespace-nowrap cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 ${
                  selectedCategory === category
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
                }`}
              >
                {category}
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 pointer-events-none" />
            <input
              type="text"
              placeholder="Search by tech, keyword, or title..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label="Filter projects"
              className="w-full pl-10 pr-3.5 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-blue-600 dark:focus:border-blue-500 focus:ring-1 focus:ring-blue-600 transition-colors"
            />
          </div>
        </div>

        {/* Projects Viewport */}
        {loading ? (
          <ProjectGridSkeleton count={6} />
        ) : error ? (
          <ErrorState error={error} onRetry={fetchProjects} />
        ) : filteredProjects.length === 0 ? (
          <EmptyState
            title={searchQuery || selectedCategory !== 'All' ? 'No matching projects' : 'No projects published'}
            description={
              searchQuery || selectedCategory !== 'All'
                ? 'Try adjusting your search terms or selecting a different category filter.'
                : 'Projects are currently being cataloged in the database. Please check back soon.'
            }
            actionText={searchQuery || selectedCategory !== 'All' ? 'Reset Filters' : undefined}
            onAction={() => {
              setSearchQuery('');
              setSelectedCategory('All');
            }}
          />
        ) : (
          <ProjectGrid projects={filteredProjects} />
        )}
      </div>
    </>
  );
}

export default ProjectsPage;
