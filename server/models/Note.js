import mongoose from "mongoose";

const noteSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    content: { type: String, required: true },
    category: {
      type: String,
      required: true,
      enum: ["learning", "debugging", "ideas", "reflection"],
    },
    timestamp: { type: String, required: true }, // Human-readable date
    isoDate: { type: Date }, // For sorting
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true },
);

export default mongoose.model("Note", noteSchema);
