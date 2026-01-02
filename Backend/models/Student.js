import mongoose from "mongoose";
const attendanceSchema = new mongoose.Schema({
  subject: { type: String, required: true },
  semester: { type: Number, required: true },
  attendedDays: { type: Number, default: 0 },
  totalDays: { type: Number, default: 0 },
  percentage: { type: Number, default: 0 },
  marks: { type: Number, default: 0 },
  qualified: { type: Boolean, default: true }
});
const marksSchema = new mongoose.Schema({
  subject: { type: String, required: true },
  semester: { type: Number, required: true },
  internal: { type: Number, default: 0 },
  midTerm: { type: Number, default: 0 },
  assignment1: { type: Number, default: 0 },
  assignment2: { type: Number, default: 0 },
  assignment3: { type: Number, default: 0 },
  assignment1Submitted: { type: Boolean, default: false },
  assignment2Submitted: { type: Boolean, default: false },
  assignment3Submitted: { type: Boolean, default: false },
  total: { type: Number, default: 0 }
});

const studentSchema = new mongoose.Schema({
  username: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  password: { type: String },
  faculty: { type: String, required: true },
  semester: { type: Number, default: 1 },
  role: { type: String, default: "student" },
  attendance: [attendanceSchema],
  marks: [marksSchema]
});
const Student = mongoose.model("Student", studentSchema);
export default Student;
