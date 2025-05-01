// src/components/Dashboard/Dashboard.jsx
import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faChartPie, 
  faTasks, 
  faProjectDiagram, 
  faClock,
  faCheckCircle
} from '@fortawesome/free-solid-svg-icons';
import { useAuth } from '../../context/AuthContext';
import './Dashboard.css';

export default function Dashboard() {
  const { user, token, logout } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch tasks
        const tasksResponse = await fetch('http://localhost:5000/api/tasks', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const tasksData = await tasksResponse.json();

        // Fetch projects
        const projectsResponse = await fetch('http://localhost:5000/api/projects', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const projectsData = await projectsResponse.json();

        setTasks(tasksData);
        setProjects(projectsData);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, [token]);

  const stats = useMemo(() => {
    const completedTasks = tasks.filter(task => task.completed).length;
    const activeProjects = projects.filter(project => project.status === 'in-progress').length;
    
    return {
      totalTasks: tasks.length,
      completedTasks,
      completionRate: tasks.length ? Math.round((completedTasks / tasks.length) * 100) : 0,
      totalProjects: projects.length,
      activeProjects
    };
  }, [tasks, projects]);

  const recentTasks = useMemo(() => {
    return [...tasks]
      .sort((a, b) => new Date(b.dueDate) - new Date(a.dueDate))
      .slice(0, 5);
  }, [tasks]);

  const recentProjects = useMemo(() => {
    return [...projects]
      .sort((a, b) => new Date(b.deadline) - new Date(a.deadline))
      .slice(0, 3);
  }, [projects]);

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1>Welcome, {user?.username}!</h1>
        <button onClick={logout} className="logout-btn">Logout</button>
      </header>

      <div className="content-wrapper">
        <div className="page-header">
          <h1>Dashboard</h1>
        </div>

        <div className="stats-grid">
          <div className="stat-card">
            <FontAwesomeIcon icon={faTasks} className="stat-icon" />
            <div className="stat-info">
              <h3>Total Tasks</h3>
              <p>{stats.totalTasks}</p>
              <small>{stats.completedTasks} completed</small>
            </div>
          </div>

          <div className="stat-card">
            <FontAwesomeIcon icon={faProjectDiagram} className="stat-icon" />
            <div className="stat-info">
              <h3>Active Projects</h3>
              <p>{stats.activeProjects}</p>
              <small>of {stats.totalProjects} total</small>
            </div>
          </div>

          <div className="stat-card">
            <FontAwesomeIcon icon={faCheckCircle} className="stat-icon" />
            <div className="stat-info">
              <h3>Completion Rate</h3>
              <p>{stats.completionRate}%</p>
              <div className="progress-bar">
                <div 
                  className="progress-fill" 
                  style={{ width: `${stats.completionRate}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="dashboard-grid">
          <div className="dashboard-card recent-tasks">
            <div className="card-header">
              <h2>
                <FontAwesomeIcon icon={faClock} /> Recent Tasks
              </h2>
              <Link to="/tasks" className="view-all">View All</Link>
            </div>
            <div className="card-content">
              {recentTasks.length > 0 ? (
                <ul className="task-list">
                  {recentTasks.map(task => (
                    <li key={task._id} className="task-item">
                      <div className="task-info">
                        <h4>{task.title}</h4>
                        <span className={`status-badge ${task.completed ? 'completed' : 'pending'}`}>
                          {task.completed ? '✓' : '○'}
                        </span>
                      </div>
                      <p className="due-date">Due: {new Date(task.dueDate).toLocaleDateString()}</p>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="empty-state">No tasks created yet</p>
              )}
            </div>
          </div>

          <div className="dashboard-card recent-projects">
            <div className="card-header">
              <h2>
                <FontAwesomeIcon icon={faProjectDiagram} /> Active Projects
              </h2>
              <Link to="/projects" className="view-all">View All</Link>
            </div>
            <div className="card-content">
              {recentProjects.length > 0 ? (
                <ul className="project-list">
                  {recentProjects.map(project => (
                    <li key={project.id} className="project-item">
                      <div className="project-info">
                        <h4>{project.name}</h4>
                        <span className={`status-badge ${project.status.toLowerCase().replace(' ', '-')}`}>
                          {project.status}
                        </span>
                      </div>
                      <p className="deadline">Deadline: {project.deadline}</p>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="empty-state">No projects created yet</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}