import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import postsRoutes from "./routes/posts.routes.js";
import userRoutes from "./routes/user.routes.js";


dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static("uploads"));


app.get("/", (req, res) => {
  res.send("CarrerNet Backend Server is running");
});

app.use(postsRoutes);
app.use(userRoutes);






//-----connect to MongoDB and start the server-----------
const start = async () => {
  const connectDB = await mongoose.connect(
    "mongodb+srv://pralaypal111_db_user:WrV3j7ENMGgVBGBz@cluster0.v3jrqk9.mongodb.net/carrernet"
  );
  console.log("Connected to MongoDB");
  app.listen(9000, () => {
    console.log("Server is running on port 9000");
  });
};
start();