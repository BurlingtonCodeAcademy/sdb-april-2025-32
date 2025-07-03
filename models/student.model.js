// import modules from mongoose
import { Schema, model } from "mongoose"

// create a schema for the student model
const studentSchema = new Schema({
    firstName: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    }
})

// create the student model using the schema
export default model("Student", studentSchema)