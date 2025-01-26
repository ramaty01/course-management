const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
require ('dotenv').config();
const { router: authRoutes, verifyToken } = require('./auth');
const Course = require('./models/Course');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Authentication routes
app.use('/auth', authRoutes);

// Routes for course management
app.post('/courses', verifyToken(['admin']), async (req, res) => {
  try {
    const course = new Course(req.body);
    await course.save();
    res.status(201).json(course);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create course' });
  }
});

app.get('/courses', async (req, res) => {
  try {
    const courses = await Course.find();
    res.json(courses);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch courses' });
  }
});

app.post('/courses/:courseId/assignments', verifyToken(['admin']), async (req, res) => {
  try {
    const { courseId } = req.params;
    const assignment = req.body;
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }
    course.assignments.push(assignment);
    await course.save();
    res.status(201).json(course);
  } catch (error) {
    res.status(500).json({ error: 'Failed to add assignment' });
  }
});

app.post('/courses/:courseId/assignments/:assignmentId/notes', verifyToken(['admin', 'user']), async (req, res) => {
  try {
    const { courseId, assignmentId } = req.params;
    const note = req.body;
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }
    const assignment = course.assignments.id(assignmentId);
    if (!assignment) {
      return res.status(404).json({ error: 'Assignment not found' });
    }
    assignment.notes.push(note);
    await course.save();
    res.status(201).json(course);
  } catch (error) {
    res.status(500).json({ error: 'Failed to add note' });
  }
});

app.get('/courses/:courseId/assignments/:assignmentId/notes', async (req, res) => {
  const { courseId, assignmentId } = req.params;

  try {
    // Find the course by ID
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }

    // Find the assignment by ID within the course
    const assignment = course.assignments.id(assignmentId);
    if (!assignment) {
      return res.status(404).json({ error: 'Assignment not found' });
    }

    // Respond with the notes from the assignment
    res.json(assignment.notes);
  } catch (error) {
    console.error('Error fetching notes:', error);
    res.status(500).json({ error: 'Failed to fetch notes' });
  }
});


// Start the server
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
