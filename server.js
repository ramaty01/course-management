const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Course = require('./models/Course');
const Comment = require('./models/Comment');
const CourseModule = require('./models/CourseModule');
const CourseNote = require('./models/CourseNote');
require ('dotenv').config();

const app = express();
app.use(cors());
app.use(bodyParser.json());

const SECRET_KEY = 'your_secret_key';

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Middleware to verify token and roles
const verifyToken = (roles = []) => {
  return (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Unauthorized' });

    try {
      const decoded = jwt.verify(token, SECRET_KEY);
      req.user = decoded;
      if (roles.length && !roles.includes(decoded.role)) {
        return res.status(403).json({ error: 'Forbidden' });
      }
      next();
    } catch (error) {
      res.status(401).json({ error: 'Invalid token' });
    }
  };
};

// ========== AUTH ROUTES ========== //

// Register new user
app.post('/auth/register', async (req, res) => {
  const { email, username, password, role } = req.body;

  try {
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) return res.status(400).json({ error: 'Email or username already exists' });

    const user = new User({ email, username, password, role });
    await user.save();
    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Registration failed' });
  }
});

// Login user
app.post('/auth/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await User.findOne({ username });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user._id, role: user.role }, SECRET_KEY, { expiresIn: '1d' });
    res.json({ token, role: user.role });
  } catch (error) {
    res.status(500).json({ error: 'Login failed' });
  }
});

// Verify token and get user role
app.get('/auth/verify', verifyToken(), async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    res.json({ role: user.role });
  } catch (error) {
    res.status(500).json({ error: 'Failed to verify user' });
  }
});

// ========== COURSE ROUTES ========== //

// Create a new course (Admin only)
app.post('/courses', verifyToken(['admin']), async (req, res) => {
  try {
    const course = new Course(req.body);
    await course.save();
    res.status(201).json(course);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create course' });
  }
});

// Get all courses
app.get('/courses', async (req, res) => {
  try {
    const courses = await Course.find();
    res.json(courses);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch courses' });
  }
});

// ========== COURSE MODULE ROUTES ========== //

// Add a module to a course (Admin only)
app.post('/courses/:courseId/modules', verifyToken(['admin']), async (req, res) => {
  const { courseId } = req.params;
  const { name } = req.body;

  try {
    const module = new CourseModule({ name, courseId });
    await module.save();
    res.status(201).json(module);
  } catch (error) {
    res.status(500).json({ error: 'Failed to add module' });
  }
});

// Get all modules for a course
app.get('/courses/:courseId/modules', async (req, res) => {
  const { courseId } = req.params;

  try {
    const modules = await CourseModule.find({ courseId });
    res.json(modules);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch modules' });
  }
});

// ========== COURSE NOTE ROUTES ========== //

// Add a note to a module (Registered Users)
app.post('/modules/:moduleId/notes', verifyToken(['user', 'admin']), async (req, res) => {
  const { moduleId } = req.params;
  const { content } = req.body;

  try {
    const note = new CourseNote({ userId: req.user.id, moduleId, content });
    await note.save();
    res.status(201).json(note);
  } catch (error) {
    res.status(500).json({ error: 'Failed to add note' });
  }
});

// Get all notes for a module (All Users)
app.get('/modules/:moduleId/notes', async (req, res) => {
  const { moduleId } = req.params;

  try {
    const notes = await CourseNote.find({ moduleId });
    res.json(notes);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch notes' });
  }
});

// Upvote a note (Registered Users)
app.put('/notes/:noteId/vote', verifyToken(['user', 'admin']), async (req, res) => {
  const { noteId } = req.params;

  try {
    const note = await CourseNote.findById(noteId);
    if (!note) return res.status(404).json({ error: 'Note not found' });

    note.votes += 1;
    await note.save();
    res.json(note);
  } catch (error) {
    res.status(500).json({ error: 'Failed to upvote note' });
  }
});

// Flag a note (Admin only)
app.put('/notes/:noteId/flag', verifyToken(['admin']), async (req, res) => {
  const { noteId } = req.params;

  try {
    const note = await CourseNote.findById(noteId);
    if (!note) return res.status(404).json({ error: 'Note not found' });

    note.isFlagged = true;
    await note.save();
    res.json(note);
  } catch (error) {
    res.status(500).json({ error: 'Failed to flag note' });
  }
});

// Delete a note (Admin only)
app.delete('/notes/:noteId', verifyToken(['admin']), async (req, res) => {
  const { noteId } = req.params;

  try {
    await CourseNote.findByIdAndDelete(noteId);
    res.json({ message: 'Note deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete note' });
  }
});

// ========== COMMENT ROUTES ========== //

// Add a comment to a course note
app.post('/notes/:courseNoteId/comments', verifyToken(['user', 'admin']), async (req, res) => {
  try {
    const comment = new Comment({
      userId: req.user.id,
      courseNoteId: req.params.courseNoteId,
      content: req.body.content,
    });
    await comment.save();
    res.status(201).json(comment);
  } catch (error) {
    res.status(500).json({ error: 'Failed to add comment' });
  }
});

// Get all comments for a course note
app.get('/notes/:courseNoteId/comments', async (req, res) => {
  try {
    const comments = await Comment.find({ courseNoteId: req.params.courseNoteId });
    res.json(comments);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch comments' });
  }
});

// Upvote a comment
app.put('/comments/:commentId/vote', verifyToken(['user', 'admin']), async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.commentId);
    if (!comment) return res.status(404).json({ error: 'Comment not found' });

    comment.votes += 1;
    await comment.save();
    res.json(comment);
  } catch (error) {
    res.status(500).json({ error: 'Failed to upvote comment' });
  }
});

// Flag a comment (Admin only)
app.put('/comments/:commentId/flag', verifyToken(['admin']), async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.commentId);
    if (!comment) return res.status(404).json({ error: 'Comment not found' });

    comment.isFlagged = true;
    await comment.save();
    res.json(comment);
  } catch (error) {
    res.status(500).json({ error: 'Failed to flag comment' });
  }
});

// Delete a comment (Admin only)
app.delete('/comments/:commentId', verifyToken(['admin']), async (req, res) => {
  try {
    await Comment.findByIdAndDelete(req.params.commentId);
    res.json({ message: 'Comment deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete comment' });
  }
});

// Start server
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
