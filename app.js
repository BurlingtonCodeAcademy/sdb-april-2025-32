// import necessary modules
import express from 'express'
import mongoose from 'mongoose'
import cors from 'cors'
import dotenv from 'dotenv'

// import the student route
import studentRoute from "./routes/student.route.js"

// load environment variables
dotenv.config()

// create an instance of express
const app = express()

// set the port and MongoDB connection string
const PORT = process.env.PORT || 8080;
const MONGO = process.env.MONGODB;

// connect to MongoDB
mongoose.connect(`${MONGO}/myMongooseTest`)
const db = mongoose.connection
db.once("open", () => {
    console.log(`connected: ${MONGO}`)
})

// middleware to parse JSON and handle CORS
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