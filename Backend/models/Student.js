import mongoose from "mongoose";

const studentSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true
  },
  email: {
    type: String,
    unique: true,
    required: true
  },
  password: {
    type: String
  },
  semester: { type: Number, default: 1 },
  attendence: [{
    subject: String, attendend: { type: Number, default: 0 }, total: { type: Number, default: 0 }
  }],
  marks: [{
    subject: String, internalMarks: { type: Number, default: 0 }, totalMarks: { type: Number, default: 0 }
  }]
});

const Student = mongoose.model("Student", studentSchema);
export default Student;
