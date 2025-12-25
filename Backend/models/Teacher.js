import mongoose from "mongoose";

const teacherSchema = new mongoose.Schema({
  username:{
    type:String,
    required:true
  },
  email: {
    type: String,
    unique: true,
    required:true
  },
  password:{
    type:String
  },
  subjects: [{
    name:String,
    semester:Number,
  }],
});

export const Teacher = mongoose.model("Teacher", teacherSchema);
export default Teacher;

