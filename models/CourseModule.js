const mongoose = require('mongoose');

const CourseModuleSchema = new mongoose.Schema({
  name: String,
  courseId: {type: String, ref: 'Course'},
});

const CourseModule = mongoose.model('CourseModule', CourseModuleSchema);
module.exports = CourseModule;
