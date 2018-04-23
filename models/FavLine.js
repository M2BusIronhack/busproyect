const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const FavLineSchema = new Schema(
  {
    user: { type: String },
    line: [{ type: Schema.Types.ObjectId, ref:'line'}]
  },
  {
    timestamps: {
      createdAt: "created_at",
      updatedAt: "updated_at"
    }
  }
);

const FavLine = mongoose.model("User", FavLineSchema);
module.exports = FavLine;
