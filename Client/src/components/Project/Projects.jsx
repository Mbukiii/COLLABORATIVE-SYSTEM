import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faList, 
  faGrip, 
  faPlus,
  faSort,
  faFilter,
  faCalendarAlt,
  faTasks
} from '@fortawesome/free-solid-svg-icons';
import { useAuth } from '../../context/AuthContext';
import { useProjects } from '../../context/ProjectContext';
import { usePreferences } from '../../context/UserPreferencesContext';
import Modal from '../shared/Modal';
import './Projects.css';

export default function Projects() {
  const { user } = useAuth();
  const { projects, loading, error, fetchProjects, createProject, updateProject, deleteProject } = useProjects();
  const { preferences, toggleView, updateSort } = usePreferences();
  const [selectedProject, setSelectedProject] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filters, setFilters] = useState({
    status: 'all'
  });
  const [newProject, setNewProject] = useState({
    name: '',
    description: '',
    status: 'planning',
    deadline: ''
  });

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const handleInputChange = (e) => {
    setNewProject({
      ...newProject,
      [e.target.name]: e.target.value
    });
  };

  const handleFilterChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createProject(newProject);
      setNewProject({
        name: '',
        description: '',
        status: 'planning',
        deadline: ''
      });
      setIsModalOpen(false);
    } catch (err) {
      console.error('Failed to create project:', err);
    }
  };

  const handleStatusChange = async (projectId, newStatus) => {
    try {
      await updateProject(projectId, { status: newStatus });
    } catch (err) {
      console.error('Failed to update project status:', err);
    }
  };

  const handleDeleteProject = async (projectId) => {
    try {
      await deleteProject(projectId);
      if (selectedProject?._id === projectId) {
        setSelectedProject(null);
      }
    } catch (err) {
      console.error('Failed to delete project:', err);
    }
  };

  const filteredProjects = projects.filter(project => {
    if (filters.status === 'all') return true;
    return project.status === filters.status;
  });

  // Sort projects based on preferences
  const sortedProjects = [...filteredProjects].sort((a, b) => {
    switch (preferences.defaultProjectSort) {
      case 'deadline':
        return new Date(a.deadline) - new Date(b.deadline);
      case 'status':
        const statusOrder = { planning: 0, 'in-progress': 1, completed: 2, 'on-hold': 3 };
        return statusOrder[a.status] - statusOrder[b.status];
      case 'createdAt':
      default:
        return new Date(b.createdAt) - new Date(a.createdAt);
    }
  });

  return (
    <div className="projects-page">
      <header className="page-header">
        <h1>Projects</h1>
        <div className="header-actions">
          <div className="view-toggles">
            <button
              className={`view-toggle ${preferences.projectView === 'list' ? 'active' : ''}`}
              onClick={() => toggleView('project')}
              title="List view"
            >
              <FontAwesomeIcon icon={faList} />
            </button>
            <button
              className={`view-toggle ${preferences.projectView === 'grid' ? 'active' : ''}`}
              onClick={() => toggleView('project')}
              title="Grid view"
            >
              <FontAwesomeIcon icon={faGrip} />
            </button>
          </div>
          <button className="add-button" onClick={() => setIsModalOpen(true)}>
            <FontAwesomeIcon icon={faPlus} /> New Project
          </button>
        </div>
      </header>

      <div className="filters-bar">
        <div className="filter-group">
          <label>
            <FontAwesomeIcon icon={faFilter} /> Status:
          </label>
          <select name="status" value={filters.status} onChange={handleFilterChange}>
            <option value="all">All</option>
            <option value="planning">Planning</option>
            <option value="in-progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="on-hold">On Hold</option>
          </select>
        </div>

        <div className="filter-group">
          <label>
            <FontAwesomeIcon icon={faSort} /> Sort by:
          </label>
          <select
            value={preferences.defaultProjectSort}
            onChange={(e) => updateSort('project', e.target.value)}
          >
            <option value="createdAt">Created Date</option>
            <option value="deadline">Deadline</option>
            <option value="status">Status</option>
          </select>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className={`projects-container ${preferences.projectView}`}>
        {loading ? (
          <div className="loading">Loading projects...</div>
        ) : sortedProjects.length === 0 ? (
          <div className="empty-state">
            <p>No projects found. Create your first project!</p>
          </div>
        ) : (
          sortedProjects.map(project => (
            <div 
              key={project._id} 
              className={`project-card ${selectedProject?._id === project._id ? 'selected' : ''}`}
              onClick={() => setSelectedProject(project)}
            >
              <div className="project-header">
                <h3>{project.name}</h3>
                <span className={`status-badge ${project.status}`}>
                  {project.status}
                </span>
              </div>
              
              <p className="project-description">{project.description}</p>
              
              <div className="project-meta">
                {project.deadline && (
                  <div className="deadline">
                    <FontAwesomeIcon icon={faCalendarAlt} />
                    Deadline: {new Date(project.deadline).toLocaleDateString()}
                  </div>
                )}
                <div className="project-tasks">
                  <FontAwesomeIcon icon={faTasks} />
                  {project.taskCount || 0} tasks
                </div>
              </div>

              <div className="project-actions">
                <select
                  value={project.status}
                  onChange={(e) => {
                    e.stopPropagation();
                    handleStatusChange(project._id, e.target.value);
                  }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <option value="planning">Planning</option>
                  <option value="in-progress">In Progress</option>
                  <option value="completed">Completed</option>
                  <option value="on-hold">On Hold</option>
                </select>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteProject(project._id);
                  }}
                  className="delete-btn"
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title="Create New Project"
      >
        <form onSubmit={handleSubmit} className="project-form">
          <div className="form-group">
            <label htmlFor="name">Project Name</label>
            <input
              type="text"
              id="name"
              name="name"
              value={newProject.name}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              value={newProject.description}
              onChange={handleInputChange}
              rows="3"
            />
          </div>

          <div className="form-group">
            <label htmlFor="status">Status</label>
            <select
              id="status"
              name="status"
              value={newProject.status}
              onChange={handleInputChange}
            >
              <option value="planning">Planning</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="on-hold">On Hold</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="deadline">Deadline</label>
            <input
              type="date"
              id="deadline"
              name="deadline"
              value={newProject.deadline}
              onChange={handleInputChange}
            />
          </div>

          <div className="modal-actions">
            <button type="button" onClick={() => setIsModalOpen(false)} className="button secondary">
              Cancel
            </button>
            <button type="submit" className="button primary">
              Create Project
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}