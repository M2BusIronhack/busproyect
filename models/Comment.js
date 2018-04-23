const mongoose = require('mongoose');
const Schema   = mongoose.Schema;

const commentSchema = new Schema({
  user:{type: Schema.Types.ObjectId, ref:'user'}, 
  line: {type: Schema.Types.ObjectId, ref: 'line'}, 
  title: {type: String},
  commentBody: {type: String}, 
  rating: {type: Number}, 
  img: {type: String}, 
  isRainDay: {type: Boolean}, 
  lostObject: {type: Boolean}, 
  date: {type: Date}
}, {
  timestamps: {
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  }
});

const Comment = mongoose.model('User', commentSchema);
module.exports = Comment;