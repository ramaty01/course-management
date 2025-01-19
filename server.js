const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const CourseSchema = new mongoose.Schema({
  name: String,
  assignments: [
    {
      title: String,
      comments: [String],
    },
  ],
});

const Course = mongoose.model('Course', CourseSchema);

// Routes
app.get('/courses', async (req, res) => {
  const courses = await Course.find();
  res.json(courses);
});

app.post('/courses', async (req, res) => {
  const course = new Course(req.body);
  await course.save();
  res.json(course);
});

app.post('/courses/:courseId/assignments', async (req, res) => {
  const { courseId } = req.params;
  const assignment = req.body;
  const course = await Course.findById(courseId);
  course.assignments.push(assignment);
  await course.save();
  res.json(course);
});

app.post('/courses/:courseId/assignments/:assignmentId/comments', async (req, res) => {
  const { courseId, assignmentId } = req.params;
  const comment = req.body.comment;
  const course = await Course.findById(courseId);
  const assignment = course.assignments.id(assignmentId);
  assignment.comments.push(comment);
  await course.save();
  res.json(course);
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
