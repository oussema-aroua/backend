// index.js
import express from "express";
import pool from "./db.js";
import dotenv from "dotenv";

dotenv.config();
const app = express();
app.use(express.json());

// 🏠 Root
app.get("/", (req, res) => {
  res.send("Task API is running 🚀");
});

// 📝 Create Task
app.post("/tasks", async (req, res) => {
  try {
    const { title, subtitle, isChecked } = req.body;
    const result = await pool.query(
      "INSERT INTO tasks (title, subtitle, isChecked) VALUES ($1, $2, $3) RETURNING *",
      [title, subtitle, isChecked]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create task" });
  }
});

// 📋 Get All Tasks
app.get("/tasks", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM tasks ORDER BY id DESC");
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch tasks" });
  }
});

// ✅ Update Task (checked or title/subtitle)
app.put("/tasks/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { title, subtitle, isChecked } = req.body;
    const result = await pool.query(
      "UPDATE tasks SET title=$1, subtitle=$2, isChecked=$3 WHERE id=$4 RETURNING *",
      [title, subtitle, isChecked, id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update task" });
  }
});

// ❌ Delete Task
app.delete("/tasks/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query("DELETE FROM tasks WHERE id=$1", [id]);
    res.json({ message: "Task deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete task" });
  }
});

// 🌐 Start Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT} 🚀`));
