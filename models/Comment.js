const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const commentSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User" },
    line: { type: String },
    title: { type: String },
    commentBody: { type: String },
    rating: { type: Number },
    img: { type: String },
    rain: { type: Boolean },
   // lostObject: { type: Boolean },
    date: { type: String }
  },
  {
    timestamps: {
      createdAt: "created_at",
      updatedAt: "updated_at"
    }
  }
);

const Comment = mongoose.model("Comment", commentSchema);
module.exports = Comment;
