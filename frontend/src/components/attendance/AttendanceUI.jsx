import React, { useState, useEffect } from "react";
import axios from "axios";

const API_URL = "http://localhost:5050/api/attendance";

const AttendanceUI = () => {
  const [employeeId, setEmployeeId] = useState("");
  const [message, setMessage] = useState("");
  const [logs, setLogs] = useState([]);

  const handleCheckIn = async () => {
    try {
      const res = await axios.post(`${API_URL}/checkin`, { employeeId });
      setMessage(res.data.message);
    } catch (err) {
      setMessage(err.response?.data?.message || "Check-in failed");
    }
  };

  const handleCheckOut = async () => {
    try {
      const res = await axios.post(`${API_URL}/checkout`, { employeeId });
      setMessage(res.data.message);
    } catch (err) {
      setMessage(err.response?.data?.message || "Check-out failed");
    }
  };

  const fetchLogs = async () => {
    try {
      const res = await axios.get(`${API_URL}/logs`, { params: { employeeId } });
      setLogs(res.data);
    } catch (err) {
      setMessage("Failed to fetch logs");
    }
  };

  useEffect(() => {
    if (employeeId) fetchLogs();
  }, [employeeId]);

  return (
    <div className="max-w-xl mx-auto mt-10 p-4 bg-white rounded shadow">
      <h1 className="text-2xl font-bold mb-4">Attendance Management</h1>

      <input
        type="text"
        placeholder="Enter Employee ID"
        value={employeeId}
        onChange={(e) => setEmployeeId(e.target.value)}
        className="w-full p-2 mb-4 border rounded"
      />

      <div className="flex gap-4 mb-4">
        <button
          onClick={handleCheckIn}
          className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
        >
          Check In
        </button>
        <button
          onClick={handleCheckOut}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
        >
          Check Out
        </button>
      </div>

      {message && <p className="text-center text-sm text-gray-700 mb-4">{message}</p>}

      <h2 className="text-xl font-semibold mb-2">Attendance Logs</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm text-left">
          <thead>
            <tr>
              <th className="border px-2 py-1">Date</th>
              <th className="border px-2 py-1">Check In</th>
              <th className="border px-2 py-1">Check Out</th>
              <th className="border px-2 py-1">Hours</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log, idx) => (
              <tr key={idx}>
                <td className="border px-2 py-1">{new Date(log.date).toLocaleDateString()}</td>
                <td className="border px-2 py-1">
                  {log.checkIn ? new Date(log.checkIn).toLocaleTimeString() : "-"}
                </td>
                <td className="border px-2 py-1">
                  {log.checkOut ? new Date(log.checkOut).toLocaleTimeString() : "-"}
                </td>
                <td className="border px-2 py-1">
                  {log.workHours ? log.workHours.toFixed(2) : "-"}
                </td>
              </tr>
            ))}
            {logs.length === 0 && (
              <tr>
                <td colSpan="4" className="text-center text-gray-500 py-4">
                  No attendance records found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AttendanceUI;