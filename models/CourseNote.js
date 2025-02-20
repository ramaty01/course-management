const mongoose = require('mongoose');

const CourseNoteSchema = new mongoose.Schema({
  userId: {type: String, ref: 'User'},
  moduleId: {type: String, ref: 'CourseModule'},
  timestamp: { type: Date, default: Date.now },
  votes: { type: Number, default: 0 },
  isFlagged: { type: Boolean, default: false },
  content: String,
  votedUsers: { type: [String], default: [] }, 
});

const CourseNote = mongoose.model('CourseNote', CourseNoteSchema);
module.exports = CourseNote;
