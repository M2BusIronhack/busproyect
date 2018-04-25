const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const FavLineSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "user" },
    line: { type: String }
  },
  {
    timestamps: {
      createdAt: "created_at",
      updatedAt: "updated_at"
    }
  }
);

const FavLine = mongoose.model("FavLine", FavLineSchema);
module.exports = FavLine;
