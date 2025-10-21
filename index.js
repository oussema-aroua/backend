// index.js
const express = require("express");
const dotenv = require("dotenv");
const pool = require("./db");

dotenv.config();
const app = express();
app.use(express.json());

// 🔧 Helper: Unified response
function sendResponse(res, code, data = null, message = "OK") {
  res.status(code).json({ code, data, message });
}

// 🩺 Health Check
app.get("/health", async (req, res) => {
  try {
    await pool.query("SELECT 1");
    sendResponse(res, 200, { status: "healthy" }, "Service is running");
  } catch (err) {
    console.error(err);
    sendResponse(res, 500, null, "Database connection failed");
  }
});

// 🏠 Root
app.get("/", (req, res) => {
  sendResponse(res, 200, null, "Task API is running 🚀");
});

// 📝 Create Task
app.post("/tasks", async (req, res) => {
  try {
    console.log(req.headers);
    const { title, subtitle } = req.body;
    if (!title) return sendResponse(res, 400, null, "Title is required");

    const result = await pool.query(
      "INSERT INTO tasks (title, subtitle ) VALUES ($1, $2, $3) RETURNING *",
      [title, subtitle]
    );

    sendResponse(res, 201, result.rows[0], "Task created");
  } catch (err) {
    console.error(err);
    sendResponse(res, 500, null, "Failed to create task");
  }
});

// 📋 Get All Tasks
app.get("/tasks", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM tasks ORDER BY id DESC");
    sendResponse(res, 200, result.rows, "Tasks fetched");
  } catch (err) {
    console.error(err);
    sendResponse(res, 500, null, "Failed to fetch tasks");
  }
});

// ✅ Update Task
app.put("/tasks/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { title, subtitle } = req.body;

    const result = await pool.query(
      "UPDATE tasks SET title=$1, subtitle=$2, =$3 WHERE id=$4 RETURNING *",
      [title, subtitle, , id]
    );

    if (result.rowCount === 0)
      return sendResponse(res, 404, null, "Task not found");

    sendResponse(res, 200, result.rows[0], "Task updated");
  } catch (err) {
    console.error(err);
    sendResponse(res, 500, null, "Failed to update task");
  }
});

// ❌ Delete Task
app.delete("/tasks/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      "DELETE FROM tasks WHERE id=$1 RETURNING *",
      [id]
    );

    if (result.rowCount === 0)
      return sendResponse(res, 404, null, "Task not found");

    sendResponse(res, 200, result.rows[0], "Task deleted");
  } catch (err) {
    console.error(err);
    sendResponse(res, 500, null, "Failed to delete task");
  }
});

// 🌐 Start Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
