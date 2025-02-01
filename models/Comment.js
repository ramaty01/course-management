const mongoose = require('mongoose');

const CommentSchema = new mongoose.Schema({
  userId: String,
  courseNoteId: String,
  timestamp: { type: Date, default: Date.now },
  votes: { type: Number, default: 0 },
  isFlagged: { type: Boolean, default: false },
  content: String,
  votedUsers: { type: [String], default: [] }, 
});

const Comment = mongoose.model('Comment', CommentSchema);
module.exports = Comment;
