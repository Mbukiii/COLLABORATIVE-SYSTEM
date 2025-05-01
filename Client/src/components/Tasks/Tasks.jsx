// src/components/Tasks/Tasks.jsx
import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faList, 
  faGrip, 
  faPlus,
  faSort,
  faFilter,
  faCalendarAlt,
  faTag,
  faEdit,
  faTrash
} from '@fortawesome/free-solid-svg-icons';
import { useAuth } from '../../context/AuthContext';
import { useProjects } from '../../context/ProjectContext';
import { usePreferences } from '../../context/UserPreferencesContext';
import { tasksApi } from '../../services/api';
import Modal from '../shared/Modal';
import './Tasks.css';

export default function Tasks() {
  const { user } = useAuth();
  const { projects } = useProjects();
  const { preferences, toggleView, updateSort } = usePreferences();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [filters, setFilters] = useState({
    status: 'all',
    priority: 'all',
    project: 'all'
  });

  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    project: '',
    dueDate: '',
    priority: 'medium',
    status: 'todo'
  });

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const response = await tasksApi.getAll();
      let filteredTasks = response.data;

      // Apply filters
      if (filters.status !== 'all') {
        filteredTasks = filteredTasks.filter(task => task.status === filters.status);
      }
      if (filters.priority !== 'all') {
        filteredTasks = filteredTasks.filter(task => task.priority === filters.priority);
      }
      if (filters.project !== 'all') {
        filteredTasks = filteredTasks.filter(task => task.project === filters.project);
      }

      // Sort tasks based on preferences
      filteredTasks.sort((a, b) => {
        switch (preferences.defaultTaskSort) {
          case 'dueDate':
            return new Date(a.dueDate) - new Date(b.dueDate);
          case 'priority': {
            const priorityOrder = { high: 0, medium: 1, low: 2 };
            return priorityOrder[a.priority] - priorityOrder[b.priority];
          }
          case 'status': {
            const statusOrder = { todo: 0, 'in-progress': 1, completed: 2 };
            return statusOrder[a.status] - statusOrder[b.status];
          }
          default:
            return new Date(b.createdAt) - new Date(a.createdAt);
        }
      });

      setTasks(filteredTasks);
      setError('');
    } catch (err) {
      setError('Failed to fetch tasks');
      console.error('Error fetching tasks:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setNewTask({
      ...newTask,
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
      const response = await tasksApi.create(newTask);
      setTasks([response.data, ...tasks]);
      setNewTask({
        title: '',
        description: '',
        project: '',
        dueDate: '',
        priority: 'medium',
        status: 'todo'
      });
      setIsModalOpen(false);
    } catch (err) {
      setError('Failed to create task');
      console.error('Error creating task:', err);
    }
  };

  const handleUpdateTask = async (taskId, updates) => {
    try {
      const response = await tasksApi.update(taskId, updates);
      setTasks(tasks.map(task => 
        task._id === taskId ? response.data : task
      ));
    } catch (err) {
      setError('Failed to update task');
      console.error('Error updating task:', err);
    }
  };

  const handleDeleteTask = async (taskId) => {
    try {
      await tasksApi.delete(taskId);
      setTasks(tasks.filter(task => task._id !== taskId));
    } catch (err) {
      setError('Failed to delete task');
      console.error('Error deleting task:', err);
    }
  };

  const handleEditClick = (task, e) => {
    e.stopPropagation();
    setEditingTask(task);
    setIsEditModalOpen(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      await handleUpdateTask(editingTask._id, editingTask);
      setIsEditModalOpen(false);
      setEditingTask(null);
    } catch (err) {
      setError('Failed to update task');
      console.error('Error updating task:', err);
    }
  };

  const handleEditChange = (e) => {
    setEditingTask({
      ...editingTask,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className={`tasks-page ${preferences.theme}`}>
      <header className="page-header">
        <h1>Tasks</h1>
        <div className="header-actions">
          <div className="view-toggles">
            <button
              className={`view-toggle ${preferences.taskView === 'list' ? 'active' : ''}`}
              onClick={() => toggleView('task')}
              title="List view"
            >
              <FontAwesomeIcon icon={faList} />
            </button>
            <button
              className={`view-toggle ${preferences.taskView === 'grid' ? 'active' : ''}`}
              onClick={() => toggleView('task')}
              title="Grid view"
            >
              <FontAwesomeIcon icon={faGrip} />
            </button>
          </div>
          <button className="add-button" onClick={() => setIsModalOpen(true)}>
            <FontAwesomeIcon icon={faPlus} /> New Task
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
            <option value="todo">To Do</option>
            <option value="in-progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>
        </div>

        <div className="filter-group">
          <label>
            <FontAwesomeIcon icon={faTag} /> Priority:
          </label>
          <select name="priority" value={filters.priority} onChange={handleFilterChange}>
            <option value="all">All</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>

        <div className="filter-group">
          <label>
            <FontAwesomeIcon icon={faCalendarAlt} /> Project:
          </label>
          <select name="project" value={filters.project} onChange={handleFilterChange}>
            <option value="all">All Projects</option>
            {projects.map(project => (
              <option key={project._id} value={project._id}>
                {project.name}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label>
            <FontAwesomeIcon icon={faSort} /> Sort by:
          </label>
          <select
            value={preferences.defaultTaskSort}
            onChange={(e) => updateSort('task', e.target.value)}
          >
            <option value="dueDate">Due Date</option>
            <option value="priority">Priority</option>
            <option value="status">Status</option>
            <option value="createdAt">Created Date</option>
          </select>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className={`tasks-container ${preferences.taskView}`}>
        {loading ? (
          <div className="loading">Loading tasks...</div>
        ) : tasks.length === 0 ? (
          <div className="empty-state">
            <p>No tasks found. Create your first task!</p>
          </div>
        ) : (
          tasks.map(task => (
            <div key={task._id} className="task-card">
              <div className="task-header">
                <h3>{task.title}</h3>
                <span className={`priority-badge ${task.priority}`}>
                  {task.priority}
                </span>
              </div>
              
              <p className="task-description">{task.description}</p>
              
              {task.project && (
                <div className="project-badge">
                  <FontAwesomeIcon icon={faTag} />
                  {projects.find(p => p._id === task.project)?.name}
                </div>
              )}
              
              {task.dueDate && (
                <div className="due-date">
                  <FontAwesomeIcon icon={faCalendarAlt} />
                  {new Date(task.dueDate).toLocaleDateString()}
                </div>
              )}

              <div className="task-actions">
                <button
                  onClick={(e) => handleEditClick(task, e)}
                  className="edit-btn"
                  title="Edit task"
                >
                  <FontAwesomeIcon icon={faEdit} />
                </button>
                <select
                  value={task.status}
                  onChange={(e) => handleUpdateTask(task._id, { status: e.target.value })}
                  className={`status-badge ${task.status}`}
                >
                  <option value="todo">To Do</option>
                  <option value="in-progress">In Progress</option>
                  <option value="completed">Completed</option>
                </select>
                <button
                  onClick={() => handleDeleteTask(task._id)}
                  className="delete-btn"
                  title="Delete task"
                >
                  <FontAwesomeIcon icon={faTrash} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title="Create New Task"
      >
        <form onSubmit={handleSubmit} className="task-form">
          <div className="form-group">
            <label htmlFor="title">Title</label>
            <input
              type="text"
              id="title"
              name="title"
              value={newTask.title}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              value={newTask.description}
              onChange={handleInputChange}
              rows="3"
            />
          </div>

          <div className="form-group">
            <label htmlFor="project">Project</label>
            <select
              id="project"
              name="project"
              value={newTask.project}
              onChange={handleInputChange}
            >
              <option value="">No Project</option>
              {projects.map(project => (
                <option key={project._id} value={project._id}>
                  {project.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="status">Status</label>
            <select
              id="status"
              name="status"
              value={newTask.status}
              onChange={handleInputChange}
            >
              <option value="todo">To Do</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="priority">Priority</label>
            <select
              id="priority"
              name="priority"
              value={newTask.priority}
              onChange={handleInputChange}
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="dueDate">Due Date</label>
            <input
              type="date"
              id="dueDate"
              name="dueDate"
              value={newTask.dueDate}
              onChange={handleInputChange}
            />
          </div>

          <div className="modal-actions">
            <button type="button" onClick={() => setIsModalOpen(false)} className="button secondary">
              Cancel
            </button>
            <button type="submit" className="button primary">
              Create Task
            </button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingTask(null);
        }}
        title="Edit Task"
      >
        {editingTask && (
          <form onSubmit={handleEditSubmit} className="task-form">
            <div className="form-group">
              <label htmlFor="edit-title">Title</label>
              <input
                type="text"
                id="edit-title"
                name="title"
                value={editingTask.title}
                onChange={handleEditChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="edit-description">Description</label>
              <textarea
                id="edit-description"
                name="description"
                value={editingTask.description}
                onChange={handleEditChange}
                rows="3"
              />
            </div>

            <div className="form-group">
              <label htmlFor="edit-project">Project</label>
              <select
                id="edit-project"
                name="project"
                value={editingTask.project || ''}
                onChange={handleEditChange}
              >
                <option value="">No Project</option>
                {projects.map(project => (
                  <option key={project._id} value={project._id}>
                    {project.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="edit-status">Status</label>
              <select
                id="edit-status"
                name="status"
                value={editingTask.status}
                onChange={handleEditChange}
              >
                <option value="todo">To Do</option>
                <option value="in-progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="edit-priority">Priority</label>
              <select
                id="edit-priority"
                name="priority"
                value={editingTask.priority}
                onChange={handleEditChange}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="edit-dueDate">Due Date</label>
              <input
                type="date"
                id="edit-dueDate"
                name="dueDate"
                value={editingTask.dueDate}
                onChange={handleEditChange}
              />
            </div>

            <div className="modal-actions">
              <button 
                type="button" 
                onClick={() => {
                  setIsEditModalOpen(false);
                  setEditingTask(null);
                }} 
                className="button secondary"
              >
                Cancel
              </button>
              <button type="submit" className="button primary">
                Save Changes
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}