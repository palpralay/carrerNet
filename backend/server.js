import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import postsRoutes from "./routes/posts.routes.js";
import userRoutes from "./routes/user.routes.js";
import uploadRoutes from "./routes/upload.routes.js";


dotenv.config();

const app = express();


app.use(cors({
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['Authorization']
}));

app.use(express.json());

// Serve static files from uploads directory
app.use('/uploads', express.static("uploads"));


app.get("/", (req, res) => {
  res.send("CarrerNet Backend Server is running");
});

app.use(postsRoutes);
app.use(userRoutes);
app.use('/api/upload', uploadRoutes);

// Global error handler - must be after all routes
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    message: err.message || 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? err : {}
  });
});

// 404 handler - must be after all routes
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

//-----connect to MongoDB and start the server-----------
const start = async () => {
  try {
    const connectDB = await mongoose.connect(
      "mongodb+srv://pralaypal111_db_user:oUzuEkuScIEStk5z@cluster0.eez6q0b.mongodb.net/?appName=Cluster0"
    );
    console.log("Connected to MongoDB");
    app.listen(9000, () => {
      console.log("Server is running on port 9000");
    });
  } catch (error) {
    console.error("Failed to connect to MongoDB", error);
    process.exit(1);
  }
};
start();