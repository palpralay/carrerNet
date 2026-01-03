import mongoose from "mongoose";

/* ---------------- Education Schema ---------------- */
const educationSchema = new mongoose.Schema(
  {
    school: {
      type: String,
      trim: true,
      default: "",
    },
    degree: {
      type: String,
      trim: true,
      default: "",
    },
    fieldOfStudy: {
      type: String,
      trim: true,
      default: "",
    },
  },
  { _id: false }
);

/* ---------------- Work Schema ---------------- */
const workSchema = new mongoose.Schema(
  {
    company: {
      type: String,
      trim: true,
      default: "",
    },
    position: {
      type: String,
      trim: true,
      default: "",
    },
    years: {
      type: String,
      default: "",
    },
  },
  { _id: false }
);

/* ---------------- Profile Schema ---------------- */
const profileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true, // one profile per user
      index: true,
    },
    bio: {
      type: String,
      trim: true,
      default: "",
    },
    currentPost: {
      type: String,
      trim: true,
      default: "",
    },
    pastWork: {
      type: [workSchema],
      default: [],
    },
    education: {
      type: [educationSchema],
      default: [],
    },
  },
  { timestamps: true }
);

const Profile = mongoose.model("Profile", profileSchema);

export default Profile;
