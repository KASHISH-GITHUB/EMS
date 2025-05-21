import express from "express";
import Attendance from "../models/Attendance.js";
import Employee from "../models/Employee.js";

const router = express.Router();

// Check-in
router.post("/checkin", async (req, res) => {
  const { employeeId } = req.body;
  const employee = await Employee.findOne({ employeeId });

  if (!employee) return res.status(404).json({ message: "Employee not found" });

  const today = new Date().toDateString();

  const existing = await Attendance.findOne({
    employee: employee._id,
    date: new Date(today),
  });

  if (existing) return res.status(400).json({ message: "Already checked in" });

  const attendance = new Attendance({
    employee: employee._id,
    date: new Date(today),
    checkIn: new Date(),
  });

  await attendance.save();
  res.json({ message: "Checked in", attendance });
});

// Check-out
router.post("/checkout", async (req, res) => {
  const { employeeId } = req.body;
  const employee = await Employee.findOne({ employeeId });

  if (!employee) return res.status(404).json({ message: "Employee not found" });

  const today = new Date().toDateString();

  const attendance = await Attendance.findOne({
    employee: employee._id,
    date: new Date(today),
  });

  if (!attendance || attendance.checkOut) {
    return res.status(400).json({ message: "Not checked in or already checked out" });
  }

  attendance.checkOut = new Date();
  attendance.workHours =
    (attendance.checkOut - attendance.checkIn) / (1000 * 60 * 60);

  await attendance.save();
  res.json({ message: "Checked out", attendance });
});

// Get logs by employee or date
router.get("/logs", async (req, res) => {
  const { employeeId, date } = req.query;
  let filter = {};

  if (employeeId) {
    const employee = await Employee.findOne({ employeeId });
    if (!employee) return res.status(404).json({ message: "Employee not found" });
    filter.employee = employee._id;
  }

  if (date) {
    const day = new Date(date);
    filter.date = new Date(day.toDateString());
  }

  const logs = await Attendance.find(filter).populate("employee", "name employeeId");
  res.json(logs);
});

export default router;
