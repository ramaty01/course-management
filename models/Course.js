const mongoose = require('mongoose');

const CourseSchema = new mongoose.Schema({
  name: String,
  description: String,
  assignments: [
    {
      title: String,
      description: String,
      notes: [
        {
          content: String,
          createdAt: { type: Date, default: Date.now },
        },
      ],
    },
  ],
});

const Course = mongoose.model('Course', CourseSchema);
module.exports = Course;
