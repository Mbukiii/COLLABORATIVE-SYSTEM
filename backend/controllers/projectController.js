const Project = require('../models/Project');
const Task = require('../models/Task');

// Get all projects for current user
exports.getProjects = async (req, res) => {
  try {
    const projects = await Project.find({ user: req.user.userId })
      .sort({ createdAt: -1 });
    res.json(projects);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get project by ID
exports.getProjectById = async (req, res) => {
  try {
    const project = await Project.findOne({
      _id: req.params.id,
      user: req.user.userId
    });
    
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    res.json(project);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
