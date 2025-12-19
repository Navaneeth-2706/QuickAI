import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import { clerkMiddleware, requireAuth } from '@clerk/express';
import aiRoutes from "./routes/aiRoutes.js";
import connectCloudinary from './configs/cloudinary.js';
import userRouter from './routes/userRoutes.js';

const app = express();


await connectCloudinary()
app.use(cors());
app.use(express.json());
app.use(clerkMiddleware());

app.get('/', (req, res) => res.send('Server is Live!'));

app.use(requireAuth());

// AI ROUTES
app.use("/api/ai", aiRoutes);

//user router
app.use("/api/user",userRouter);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Server is running on port", PORT);
  console.log("HF KEY Loaded:", process.env.HF_API_KEY ? "YES" : "NO");
});

process.on("unhandledRejection", (reason, promise) => {
  console.error("UNHANDLED REJECTION:", reason);
});

process.on("uncaughtException", (error) => {
  console.error("UNCAUGHT EXCEPTION:", error);
});


// import express from "express";
// import cors from "cors";
// import "dotenv/config";
// import { clerkMiddleware, requireAuth } from "@clerk/express";
// import aiRoutes from "./routes/aiRoutes.js";
// import connectCloudinary from "./configs/cloudinary.js";
// import userRouter from "./routes/userRoutes.js";

// const app = express();

// const startServer = async () => {
//   try {
//     await connectCloudinary();
//     console.log("✅ Cloudinary connected");

//     app.use(cors());
//     app.use(express.json());
//     app.use(clerkMiddleware());

//     // public route
//     app.get("/", (req, res) => res.send("Server is Live!"));

//     // protected routes
//     app.use(requireAuth());

//     app.use("/api/ai", aiRoutes);
//     app.use("/api/user", userRouter);

//     const PORT = process.env.PORT || 3000;

//     app.listen(PORT, () => {
//       console.log("🚀 Server is running on port", PORT);
//       console.log("HF KEY Loaded:", process.env.HF_API_KEY ? "YES" : "NO");
//     });

//   } catch (error) {
//     console.error("❌ Failed to start server:", error);
//     process.exit(1);
//   }
// };

// startServer();

// // safety logs
// process.on("unhandledRejection", (reason) => {
//   console.error("UNHANDLED REJECTION:", reason);
// });

// process.on("uncaughtException", (error) => {
//   console.error("UNCAUGHT EXCEPTION:", error);
// });


