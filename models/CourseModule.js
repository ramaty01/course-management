const mongoose = require('mongoose');

const CourseModuleSchema = new mongoose.Schema({
  name: String,
  courseId: String,
});

const CourseModule = mongoose.model('CourseModule', CourseModuleSchema);
module.exports = CourseModule;
