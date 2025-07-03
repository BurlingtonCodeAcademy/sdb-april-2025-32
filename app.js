import express from 'express'
import mongoose from 'mongoose'
import cors from 'cors'
import dotenv from 'dotenv'

import studentRoute from "./routes/student.route.js"

dotenv.config()

const app = express()

const PORT = process.env.PORT || 8080;
const MONGO = process.env.MONGODB;

mongoose.connect(`${MONGO}/myMongooseTest`)

const db = mongoose.connection

db.once("open", () => {
    console.log(`connected: ${MONGO}`)
})

app.use(express.json())

app.use(cors())

// use the student route
app.use("/api/student", studentRoute)

// health endpoint
app.get("/api/health", (req, res) => {
    res.send("all good!")
})

app.listen(PORT, () => {
    console.log("server is running")
})