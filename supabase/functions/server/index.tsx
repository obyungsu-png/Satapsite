import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import * as kv from "./kv_store.tsx";
const app = new Hono().basePath('/server');

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Health check endpoint
app.get("/health", (c) => {
  return c.json({ status: "ok" });
});

// ============ Students API ============
// Get all students
app.get("/students", async (c) => {
  try {
    const students = await kv.getByPrefix("student:");
    return c.json({ students: students || [] });
  } catch (error) {
    console.error("Error fetching students:", error);
    return c.json({ error: "Failed to fetch students", details: String(error) }, 500);
  }
});

// Add a student
app.post("/students", async (c) => {
  try {
    const body = await c.req.json();
    const studentId = `student:${Date.now()}`;
    
    const student = {
      id: studentId,
      ...body,
      createdAt: new Date().toISOString(),
    };
    
    await kv.set(studentId, student);
    return c.json({ student });
  } catch (error) {
    console.error("Error adding student:", error);
    return c.json({ error: "Failed to add student", details: String(error) }, 500);
  }
});

// Update a student
app.put("/students/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const body = await c.req.json();
    
    const existing = await kv.get(id);
    if (!existing) {
      return c.json({ error: "Student not found" }, 404);
    }
    
    const updated = { ...existing, ...body };
    await kv.set(id, updated);
    return c.json({ student: updated });
  } catch (error) {
    console.error("Error updating student:", error);
    return c.json({ error: "Failed to update student", details: String(error) }, 500);
  }
});

// Delete a student
app.delete("/students/:id", async (c) => {
  try {
    const id = c.req.param("id");
    await kv.del(id);
    
    // Also delete related schedule and attendance
    await kv.del(`schedule:${id}`);
    
    // Delete attendance records
    const allAttendance = await kv.getByPrefix("attendance:");
    const attendanceToDelete = allAttendance.filter((a: any) => a.studentId === id);
    for (const record of attendanceToDelete) {
      await kv.del(record.id);
    }
    
    return c.json({ success: true });
  } catch (error) {
    console.error("Error deleting student:", error);
    return c.json({ error: "Failed to delete student", details: String(error) }, 500);
  }
});

// ============ Schedule API ============
// Get all schedules
app.get("/schedules", async (c) => {
  try {
    const schedules = await kv.getByPrefix("schedule:");
    const scheduleMap: any = {};
    
    for (const item of schedules) {
      const studentId = item.studentId;
      scheduleMap[studentId] = item.schedule;
    }
    
    return c.json({ schedules: scheduleMap });
  } catch (error) {
    console.error("Error fetching schedules:", error);
    return c.json({ error: "Failed to fetch schedules", details: String(error) }, 500);
  }
});

// Update student schedule
app.put("/schedules/:studentId", async (c) => {
  try {
    const studentId = c.req.param("studentId");
    const body = await c.req.json();
    
    const scheduleId = `schedule:${studentId}`;
    await kv.set(scheduleId, {
      id: scheduleId,
      studentId,
      schedule: body.schedule,
    });
    
    return c.json({ success: true });
  } catch (error) {
    console.error("Error updating schedule:", error);
    return c.json({ error: "Failed to update schedule", details: String(error) }, 500);
  }
});

// ============ Attendance API ============
// Get all attendance records
app.get("/attendance", async (c) => {
  try {
    const attendance = await kv.getByPrefix("attendance:");
    return c.json({ attendance: attendance || [] });
  } catch (error) {
    console.error("Error fetching attendance:", error);
    return c.json({ error: "Failed to fetch attendance", details: String(error) }, 500);
  }
});

// Mark attendance
app.post("/attendance", async (c) => {
  try {
    const body = await c.req.json();
    const { studentId, date, status } = body;
    
    // Check if attendance already exists for this student and date
    const allAttendance = await kv.getByPrefix("attendance:");
    const existing = allAttendance.find((a: any) => 
      a.studentId === studentId && a.date === date
    );
    
    const recordId = existing ? existing.id : `attendance:${Date.now()}`;
    const record = {
      id: recordId,
      studentId,
      date,
      status,
    };
    
    await kv.set(recordId, record);
    return c.json({ record });
  } catch (error) {
    console.error("Error marking attendance:", error);
    return c.json({ error: "Failed to mark attendance", details: String(error) }, 500);
  }
});

// Remove attendance
app.delete("/attendance/:studentId/:date", async (c) => {
  try {
    const studentId = c.req.param("studentId");
    const date = c.req.param("date");
    
    const allAttendance = await kv.getByPrefix("attendance:");
    const record = allAttendance.find((a: any) => 
      a.studentId === studentId && a.date === date
    );
    
    if (record) {
      await kv.del(record.id);
    }
    
    return c.json({ success: true });
  } catch (error) {
    console.error("Error removing attendance:", error);
    return c.json({ error: "Failed to remove attendance", details: String(error) }, 500);
  }
});

// ============ Billing Adjustments API ============
// Get all billing adjustments
app.get("/billing-adjustments", async (c) => {
  try {
    const adjustments = await kv.getByPrefix("billing:");
    return c.json({ adjustments: adjustments || [] });
  } catch (error) {
    console.error("Error fetching billing adjustments:", error);
    return c.json({ error: "Failed to fetch billing adjustments", details: String(error) }, 500);
  }
});

// Set billing adjustment
app.post("/billing-adjustments", async (c) => {
  try {
    const body = await c.req.json();
    const { studentId, year, month, adjustedAmount } = body;
    
    const adjustmentId = `billing:${studentId}:${year}:${month}`;
    const adjustment = {
      id: adjustmentId,
      studentId,
      year,
      month,
      adjustedAmount,
    };
    
    await kv.set(adjustmentId, adjustment);
    return c.json({ adjustment });
  } catch (error) {
    console.error("Error setting billing adjustment:", error);
    return c.json({ error: "Failed to set billing adjustment", details: String(error) }, 500);
  }
});

// Remove billing adjustment
app.delete("/billing-adjustments/:studentId/:year/:month", async (c) => {
  try {
    const studentId = c.req.param("studentId");
    const year = c.req.param("year");
    const month = c.req.param("month");
    
    const adjustmentId = `billing:${studentId}:${year}:${month}`;
    await kv.del(adjustmentId);
    
    return c.json({ success: true });
  } catch (error) {
    console.error("Error removing billing adjustment:", error);
    return c.json({ error: "Failed to remove billing adjustment", details: String(error) }, 500);
  }
});

// ============ Payment Status API ============
// Get all payment statuses
app.get("/payment-statuses", async (c) => {
  try {
    const statuses = await kv.getByPrefix("payment:");
    return c.json({ statuses: statuses || [] });
  } catch (error) {
    console.error("Error fetching payment statuses:", error);
    return c.json({ error: "Failed to fetch payment statuses", details: String(error) }, 500);
  }
});

// Set payment status
app.post("/payment-statuses", async (c) => {
  try {
    const body = await c.req.json();
    const { studentId, year, month, isPaid } = body;
    
    const statusId = `payment:${studentId}:${year}:${month}`;
    const status = {
      id: statusId,
      studentId,
      year,
      month,
      isPaid,
    };
    
    await kv.set(statusId, status);
    return c.json({ status });
  } catch (error) {
    console.error("Error setting payment status:", error);
    return c.json({ error: "Failed to set payment status", details: String(error) }, 500);
  }
});

// Remove payment status
app.delete("/payment-statuses/:studentId/:year/:month", async (c) => {
  try {
    const studentId = c.req.param("studentId");
    const year = c.req.param("year");
    const month = c.req.param("month");
    
    const statusId = `payment:${studentId}:${year}:${month}`;
    await kv.del(statusId);
    
    return c.json({ success: true });
  } catch (error) {
    console.error("Error removing payment status:", error);
    return c.json({ error: "Failed to remove payment status", details: String(error) }, 500);
  }
});

Deno.serve(app.fetch);