import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { projectsApi } from '../../services/api';
import {
  FolderGit2,
  Plus,
  Search,
  CheckCircle2,
  EyeOff,
  Star,
  Edit2,
  Trash2,
  ArrowLeft,
  X,
  ExternalLink,
  Loader2,
  AlertTriangle,
  Layers,
  ArrowUpDown,
} from 'lucide-react';

const INITIAL_FORM_STATE = {
  title: '',
  slug: '',
  short_description: '',
  description: '',
  category: 'Backend',
  technologies: '',
  github_url: '',
  live_demo_url: '',
  image_url: '',
  display_order: 0,
  featured: false,
  published: true,
  start_date: '',
  completion_date: '',
  key_features: '',
  challenges: '',
};

function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

export function AdminProjectsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all'); // all | published | drafts | featured
  const [filterCategory, setFilterCategory] = useState('all');

  // Modal and action states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProjectId, setEditingProjectId] = useState(null);
  const [formData, setFormData] = useState(INITIAL_FORM_STATE);
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState(null);

  // Delete modal state
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Row inline action loading state
  const [togglingId, setTogglingId] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (msg, isError = false) => {
    setToastMessage({ text: msg, isError });
    setTimeout(() => setToastMessage(null), 4000);
  };

  const loadProjects = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await projectsApi.getAdminProjects({ page_size: 100 });
      setProjects(res.items || []);
    } catch (err) {
      setError(err.message || 'Failed to fetch projects.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  // Open create modal if query param ?create=true
  useEffect(() => {
    if (searchParams.get('create') === 'true') {
      openCreateModal();
      searchParams.delete('create');
      setSearchParams(searchParams, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  const openCreateModal = () => {
    setEditingProjectId(null);
    setFormData(INITIAL_FORM_STATE);
    setSlugManuallyEdited(false);
    setFormError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (p) => {
    setEditingProjectId(p.id);
    setFormData({
      title: p.title || '',
      slug: p.slug || '',
      short_description: p.short_description || '',
      description: p.description || '',
      category: p.category || 'Backend',
      technologies: Array.isArray(p.technologies) ? p.technologies.join(', ') : '',
      github_url: p.github_url || '',
      live_demo_url: p.live_demo_url || '',
      image_url: p.image_url || '',
      display_order: p.display_order ?? 0,
      featured: !!p.featured,
      published: !!p.published,
      start_date: p.start_date || '',
      completion_date: p.completion_date || '',
      key_features: Array.isArray(p.key_features) ? p.key_features.join('\n') : '',
      challenges: Array.isArray(p.challenges) ? p.challenges.join('\n') : '',
    });
    setSlugManuallyEdited(true); // Don't overwrite slug when editing
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleTitleChange = (e) => {
    const newTitle = e.target.value;
    setFormData((prev) => ({
      ...prev,
      title: newTitle,
      slug: !slugManuallyEdited && !editingProjectId ? slugify(newTitle) : prev.slug,
    }));
  };

  const handleSlugChange = (e) => {
    setSlugManuallyEdited(true);
    setFormData((prev) => ({ ...prev, slug: slugify(e.target.value) }));
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setFormError(null);

    if (!formData.title.trim()) {
      setFormError('Title is required.');
      return;
    }
    if (!formData.slug.trim()) {
      setFormError('Slug is required.');
      return;
    }
    if (!formData.short_description.trim()) {
      setFormError('Short description is required.');
      return;
    }
    if (!formData.description.trim()) {
      setFormError('Detailed description is required.');
      return;
    }

    const techArray = formData.technologies
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    if (techArray.length === 0) {
      setFormError('At least one technology is required.');
      return;
    }

    const keyFeaturesArray = formData.key_features
      ? formData.key_features.split('\n').map((f) => f.trim()).filter(Boolean)
      : null;

    const challengesArray = formData.challenges
      ? formData.challenges.split('\n').map((c) => c.trim()).filter(Boolean)
      : null;

    const payload = {
      title: formData.title.trim(),
      slug: formData.slug.trim(),
      short_description: formData.short_description.trim(),
      description: formData.description.trim(),
      category: formData.category.trim() || null,
      technologies: techArray,
      github_url: formData.github_url.trim() || null,
      live_demo_url: formData.live_demo_url.trim() || null,
      image_url: formData.image_url.trim() || null,
      display_order: parseInt(formData.display_order, 10) || 0,
      featured: Boolean(formData.featured),
      published: Boolean(formData.published),
      start_date: formData.start_date || null,
      completion_date: formData.completion_date || null,
      key_features: keyFeaturesArray && keyFeaturesArray.length > 0 ? keyFeaturesArray : null,
      challenges: challengesArray && challengesArray.length > 0 ? challengesArray : null,
    };

    setIsSubmitting(true);
    try {
      if (editingProjectId) {
        await projectsApi.updateProject(editingProjectId, payload);
        showToast(`Project "${payload.title}" updated successfully.`);
      } else {
        await projectsApi.createProject(payload);
        showToast(`Project "${payload.title}" created successfully.`);
      }
      setIsModalOpen(false);
      await loadProjects();
    } catch (err) {
      setFormError(err.message || 'Operation failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTogglePublished = async (project) => {
    setTogglingId(project.id);
    try {
      const updated = await projectsApi.updateProject(project.id, {
        published: !project.published,
      });
      setProjects((prev) =>
        prev.map((p) => (p.id === project.id ? { ...p, published: updated.published } : p))
      );
      showToast(
        `"${project.title}" is now ${updated.published ? 'published' : 'draft/hidden'}.`
      );
    } catch (err) {
      showToast(err.message || 'Failed to toggle published status.', true);
    } finally {
      setTogglingId(null);
    }
  };

  const handleToggleFeatured = async (project) => {
    setTogglingId(project.id);
    try {
      const updated = await projectsApi.updateProject(project.id, {
        featured: !project.featured,
      });
      setProjects((prev) =>
        prev.map((p) => (p.id === project.id ? { ...p, featured: updated.featured } : p))
      );
      showToast(
        `"${project.title}" ${updated.featured ? 'marked as featured' : 'unmarked from featured'}.`
      );
    } catch (err) {
      showToast(err.message || 'Failed to toggle featured status.', true);
    } finally {
      setTogglingId(null);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await projectsApi.deleteProject(deleteTarget.id);
      showToast(`Project "${deleteTarget.title}" deleted.`);
      setDeleteTarget(null);
      await loadProjects();
    } catch (err) {
      showToast(err.message || 'Failed to delete project.', true);
    } finally {
      setIsDeleting(false);
    }
  };

  // Filtered projects
  const filteredProjects = projects.filter((p) => {
    const matchesSearch =
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.short_description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.category && p.category.toLowerCase().includes(searchQuery.toLowerCase()));

    if (!matchesSearch) return false;

    if (filterStatus === 'published' && !p.published) return false;
    if (filterStatus === 'drafts' && p.published) return false;
    if (filterStatus === 'featured' && !p.featured) return false;

    if (filterCategory !== 'all' && p.category !== filterCategory) return false;

    return true;
  });

  const categories = Array.from(new Set(projects.map((p) => p.category).filter(Boolean)));

  return (
    <div className="max-w-6xl mx-auto space-y-6 py-4">
      {/* Toast Alert */}
      {toastMessage && (
        <div
          className={`fixed bottom-6 right-6 z-50 p-4 rounded-xl shadow-xl border text-sm flex items-center space-x-3 transition-all ${
            toastMessage.isError
              ? 'bg-rose-50 border-rose-200 text-rose-800'
              : 'bg-emerald-50 border-emerald-200 text-emerald-800'
          }`}
        >
          {toastMessage.isError ? (
            <AlertTriangle className="w-5 h-5 flex-shrink-0 text-rose-600" />
          ) : (
            <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-emerald-600" />
          )}
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* Header and Actions Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-slate-200">
        <div className="space-y-1">
          <Link
            to="/admin"
            className="inline-flex items-center text-xs text-slate-500 hover:text-blue-600 font-mono transition-colors mb-1"
          >
            <ArrowLeft className="w-3.5 h-3.5 mr-1.5" />
            Back to Dashboard
          </Link>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 flex items-center space-x-2">
            <FolderGit2 className="w-7 h-7 text-blue-600" />
            <span>Project Management</span>
          </h1>
          <p className="text-sm text-slate-600">
            Create, update, reorder, feature, and toggle visibility for all database-driven projects.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          id="admin-create-project-btn"
          className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium shadow-xs transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>New Project</span>
        </button>
      </div>

      {/* Search & Filter Controls */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search projects by title, description, or category..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600 transition-colors"
          />
        </div>

        {/* Status Tabs */}
        <div className="flex items-center space-x-1 p-1 bg-slate-100 rounded-lg border border-slate-200">
          {[
            { id: 'all', label: 'All' },
            { id: 'published', label: 'Published' },
            { id: 'drafts', label: 'Drafts' },
            { id: 'featured', label: 'Featured' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterStatus(tab.id)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                filterStatus === tab.id
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Category Dropdown */}
        {categories.length > 0 && (
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-700 focus:outline-none focus:border-blue-600"
          >
            <option value="all">All Categories</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Projects Table */}
      {loading ? (
        <div className="min-h-[300px] flex flex-col items-center justify-center space-y-3 bg-slate-50 rounded-2xl border border-slate-200">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
          <p className="text-xs text-slate-600 font-mono">Loading projects from PostgreSQL...</p>
        </div>
      ) : error ? (
        <div className="p-6 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-sm">
          {error}
        </div>
      ) : filteredProjects.length === 0 ? (
        <div className="p-12 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-300 space-y-3">
          <Layers className="w-10 h-10 text-slate-400 mx-auto" />
          <p className="text-base text-slate-900 font-medium">No projects found</p>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {searchQuery || filterStatus !== 'all'
              ? 'Try modifying your search or status filter.'
              : 'Add your first project to populate the database.'}
          </p>
          {projects.length === 0 && (
            <button
              onClick={openCreateModal}
              className="mt-2 inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-medium hover:bg-blue-700 transition-colors shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create Project</span>
            </button>
          )}
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-xs">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-mono text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-4">Order</th>
                <th className="py-3 px-4">Project</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Featured</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredProjects.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                  {/* Display Order */}
                  <td className="py-3.5 px-4 font-mono text-xs text-slate-500">
                    <span className="inline-flex items-center space-x-1">
                      <ArrowUpDown className="w-3 h-3 text-slate-400" />
                      <span>{p.display_order}</span>
                    </span>
                  </td>

                  {/* Project Details */}
                  <td className="py-3.5 px-4 max-w-xs sm:max-w-sm">
                    <div className="font-semibold text-slate-900 truncate">{p.title}</div>
                    <div className="text-xs text-slate-500 truncate">{p.short_description}</div>
                    <div className="text-[11px] font-mono text-blue-600 truncate mt-0.5">
                      /{p.slug}
                    </div>
                  </td>

                  {/* Category */}
                  <td className="py-3.5 px-4">
                    <span className="inline-block px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">
                      {p.category || 'General'}
                    </span>
                  </td>

                  {/* Published Toggle */}
                  <td className="py-3.5 px-4">
                    <button
                      onClick={() => handleTogglePublished(p)}
                      disabled={togglingId === p.id}
                      className={`inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                        p.published
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                          : 'bg-slate-100 text-slate-600 border border-slate-200 hover:bg-slate-200'
                      }`}
                    >
                      {p.published ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Published</span>
                        </>
                      ) : (
                        <>
                          <EyeOff className="w-3.5 h-3.5" />
                          <span>Draft</span>
                        </>
                      )}
                    </button>
                  </td>

                  {/* Featured Toggle */}
                  <td className="py-3.5 px-4">
                    <button
                      onClick={() => handleToggleFeatured(p)}
                      disabled={togglingId === p.id}
                      className={`inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                        p.featured
                          ? 'bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100'
                          : 'bg-slate-100 text-slate-600 border border-slate-200 hover:bg-slate-200'
                      }`}
                    >
                      <Star
                        className={`w-3.5 h-3.5 ${p.featured ? 'fill-blue-500 text-blue-500' : ''}`}
                      />
                      <span>{p.featured ? 'Featured' : 'Standard'}</span>
                    </button>
                  </td>

                  {/* Action Buttons */}
                  <td className="py-3.5 px-4 text-right">
                    <div className="inline-flex items-center space-x-2">
                      <Link
                        to={`/projects/${p.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        title="View Public Detail"
                        className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 transition-colors"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </Link>
                      <button
                        onClick={() => openEditModal(p)}
                        title="Edit Project"
                        className="p-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeleteTarget(p)}
                        title="Delete Project"
                        className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* CREATE / EDIT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs overflow-y-auto">
          <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white border border-slate-200 shadow-2xl p-6 sm:p-8 space-y-6 text-slate-900">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200">
              <h2 className="text-xl font-bold text-slate-900">
                {editingProjectId ? 'Edit Project' : 'Create New Project'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="p-3.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs">
                {formError}
              </div>
            )}

            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Title */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1 font-mono">
                    Project Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={handleTitleChange}
                    placeholder="e.g. Distributed Task Queue"
                    className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                  />
                </div>

                {/* Slug */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1 font-mono">
                    URL Slug * (Unique)
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.slug}
                    onChange={handleSlugChange}
                    placeholder="distributed-task-queue"
                    className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 font-mono text-xs"
                  />
                </div>
              </div>

              {/* Short Description */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1 font-mono">
                  Short Description * (Brief summary for listings)
                </label>
                <input
                  type="text"
                  required
                  maxLength={500}
                  value={formData.short_description}
                  onChange={(e) => setFormData({ ...formData, short_description: e.target.value })}
                  placeholder="Asynchronous job execution engine built with Python, Redis, and FastAPI."
                  className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                />
              </div>

              {/* Detailed Description */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1 font-mono">
                  Detailed Description * (Plaintext with paragraph breaks)
                </label>
                <textarea
                  rows={4}
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Explain the architectural decisions, design tradeoffs, and systems concepts implemented..."
                  className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Category */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1 font-mono">
                    Category (e.g. Backend, Machine Learning, Data Science)
                  </label>
                  <input
                    type="text"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    placeholder="Machine Learning"
                    className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                  />
                </div>

                {/* Technologies */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1 font-mono">
                    Technologies * (Comma-separated)
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.technologies}
                    onChange={(e) => setFormData({ ...formData, technologies: e.target.value })}
                    placeholder="Python, Scikit-learn, Pandas, FastAPI"
                    className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* GitHub URL */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1 font-mono">
                    GitHub Repository Link
                  </label>
                  <input
                    type="url"
                    value={formData.github_url}
                    onChange={(e) => setFormData({ ...formData, github_url: e.target.value })}
                    placeholder="https://github.com/Indra-2005/task-queue"
                    className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                  />
                </div>

                {/* Live Demo URL */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1 font-mono">
                    Live Demo Link
                  </label>
                  <input
                    type="url"
                    value={formData.live_demo_url}
                    onChange={(e) => setFormData({ ...formData, live_demo_url: e.target.value })}
                    placeholder="https://demo.example.com"
                    className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Image URL */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1 font-mono">
                    Image / Banner URL
                  </label>
                  <input
                    type="url"
                    value={formData.image_url}
                    onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                    placeholder="https://..."
                    className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                  />
                </div>

                {/* Display Order */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1 font-mono">
                    Display Order (Priority)
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={formData.display_order}
                    onChange={(e) => setFormData({ ...formData, display_order: e.target.value })}
                    className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                  />
                </div>

                {/* Dates */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1 font-mono">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={formData.start_date}
                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                    className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Key Features */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1 font-mono">
                    Key Features (One per line)
                  </label>
                  <textarea
                    rows={3}
                    value={formData.key_features}
                    onChange={(e) => setFormData({ ...formData, key_features: e.target.value })}
                    placeholder="Worker pool processing&#10;Dead letter queue handling&#10;Exponential retry backoff"
                    className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 font-mono text-xs"
                  />
                </div>

                {/* Technical Challenges */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1 font-mono">
                    Technical Challenges &amp; Solutions (One per line)
                  </label>
                  <textarea
                    rows={3}
                    value={formData.challenges}
                    onChange={(e) => setFormData({ ...formData, challenges: e.target.value })}
                    placeholder="Race condition avoidance during parallel dequeues&#10;Graceful worker shutdown handling"
                    className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 font-mono text-xs"
                  />
                </div>
              </div>

              {/* Toggles */}
              <div className="flex flex-wrap items-center gap-6 pt-2 pb-2">
                <label className="flex items-center space-x-2 text-xs text-slate-700 cursor-pointer font-medium">
                  <input
                    type="checkbox"
                    checked={formData.published}
                    onChange={(e) =>
                      setFormData({ ...formData, published: e.target.checked })
                    }
                    className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-600"
                  />
                  <span>Published (Visible to public)</span>
                </label>

                <label className="flex items-center space-x-2 text-xs text-slate-700 cursor-pointer font-medium">
                  <input
                    type="checkbox"
                    checked={formData.featured}
                    onChange={(e) =>
                      setFormData({ ...formData, featured: e.target.checked })
                    }
                    className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-600"
                  />
                  <span>Featured (Showcased on home page)</span>
                </label>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 text-xs font-medium transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium shadow-xs transition-all flex items-center space-x-2 disabled:opacity-60 cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <span>{editingProjectId ? 'Update Project' : 'Save Project'}</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION DIALOG */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl bg-white border border-slate-200 shadow-2xl p-6 space-y-4 text-slate-900">
            <div className="flex items-center space-x-3 text-rose-600">
              <div className="p-2.5 rounded-full bg-rose-50 border border-rose-200">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Delete Project</h3>
            </div>
            <p className="text-sm text-slate-600">
              Are you sure you want to permanently delete{' '}
              <strong className="text-slate-900">"{deleteTarget.title}"</strong>? This will remove it from the PostgreSQL database.
            </p>
            <div className="flex items-center justify-end space-x-3 pt-2">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setDeleteTarget(null)}
                className="px-4 py-2 rounded-lg bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 text-xs font-medium transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={confirmDelete}
                className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-medium shadow-xs transition-all flex items-center space-x-2 disabled:opacity-60 cursor-pointer"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <span>Delete Permanently</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminProjectsPage;
