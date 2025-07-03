import { Router } from "express"
import Student from "../models/student.model.js"

const router = Router()

// GET - /api/student - get all students
router.get("/", async (req, res) => {
    try {
        const students = await Student.find()
        res.status(200).json({
            students: students,
            message: "Students retrieved successfully"
        })
    } catch (error) {
        console.error(error)
        res.status(500).json({
            message: "Error retrieving students"
        })
    }
})

// GET - /api/student/:id - get student by ID
router.get("/:id", async (req, res) => {
    try {
        const student = await Student.findById(req.params.id)

        if (!student) {
            return res.status(404).json({
                message: "Student not found"
            })
        }

        res.status(200).json({
            student: student,
            message: "Student retrieved successfully"
        })
    } catch (error) {
        console.error(error)
        res.status(500).json({
            message: "Error retrieving student"
        })
    }
})

// POST - /api/student/new - create a new student
router.post("/new", async (req, res) => {
    try {
        // create student to compare to model
        const student = new Student({
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            email: req.body.email,
            password: req.body.password
        })

        // save student to database
        const newStudent = await student.save()

        // return success message
        res.status(201).json({
            student: newStudent,
            message: "Student created successfully!"
        })
    } catch (error) {
        // return an error message
        console.error(error)
        res.status(400).json({
            message: "Error creating student"
        })
    }
})

// PUT - /api/student/:id - update student by id
router.put("/:id", async (req, res) => {
    try {
        const updatedStudent = await Student.findByIdAndUpdate(
            req.params.id,
            {
                firstName: req.body.firstName,
                lastName: req.body.lastName,
                email: req.body.email,
                password: req.body.password
            },
            { new: true, runValidators: true }
        )

        if (!updatedStudent) {
            return res.status(404).json({
                message: "Student not found"
            })
        }

        res.status(200).json({
            student: updatedStudent,
            message: "Student updated successfully"
        })
    } catch (error) {
        console.error(error)
        res.status(400).json({
            message: "Error updating student"
        })
    }
})

// DELETE - /api/student/:id - delete a student by id
router.delete("/:id", async (req, res) => {
    try {
        const deletedStudent = await Student.findByIdAndDelete(req.params.id)

        if (!deletedStudent) {
            return res.status(404).json({
                message: "Student not found"
            })
        }

        res.status(200).json({
            student: deletedStudent,
            message: "Student deleted successfully"
        })
    } catch (error) {
        console.error(error)
        res.status(500).json({
            message: "Error deleting student"
        })
    }
})

// BONUS - DELETE - /api/student - delete all students
router.delete("/", async (req, res) => {
    try {
        const result = await Student.deleteMany({})

        res.status(200).json({
            deletedCount: result.deletedCount,
            message: `Successfully deleted ${result.deletedCount} students`
        })
    } catch (error) {
        console.error(error)
        res.status(500).json({
            message: "Error deleting all students"
        })
    }
})

export default router;