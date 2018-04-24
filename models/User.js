const mongoose = require('mongoose');
const Schema   = mongoose.Schema;

const userSchema = new Schema({
  username: {type: String},
  email: {type: String},
  password: {type: String}, 
  img: { type: String }, 
  commentBody: { type: Schema.Types.ObjectId, ref: 'Comment' }

}, {
  timestamps: {
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  }
});

const User = mongoose.model('User', userSchema);
module.exports = User;
