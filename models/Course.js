const mongoose = require('mongoose');

const CourseSchema = new mongoose.Schema({
  name: String,
  description: String,
  semester: String,
  year: Number,
  format: { type: String, enum: ['online', 'in-person', 'hybrid'] },
});

const Course = mongoose.model('Course', CourseSchema);
module.exports = Course;
