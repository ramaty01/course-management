const mongoose = require('mongoose');

const CourseNoteSchema = new mongoose.Schema({
  userId: String,
  moduleId: String,
  timestamp: { type: Date, default: Date.now },
  votes: { type: Number, default: 0 },
  isFlagged: { type: Boolean, default: false },
  content: String,
});

const CourseNote = mongoose.model('CourseNote', CourseNoteSchema);
module.exports = CourseNote;
