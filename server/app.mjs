import express from "express";
import connectionPool from "./utils/db.mjs";
const app = express();
const port = 4001;
app.use(express.json());

app.get("/test", (req, res) => {
  return res.json("Server API is working 🚀");
});

app.post("/assignments", async (req, res) => {
  const newAssignment = {
    ...req.body,
    created_at: new Date(),
    updated_at: new Date(),
    published_at: new Date(),
  };

  if (
    !newAssignment.title ||
    !newAssignment.content ||
    !newAssignment.category
  ) {
    return res.status(400).json({
      message:
        "Server could not create assignment because there are missing data from client",
    });
  }

  try {
    await connectionPool.query(
      `insert into assignments (
      title, 
      content,
      category, 
      length, 
      user_id,
      status,
      created_at,
      updated_at, 
      published_at)
    values ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
      [
        newAssignment.title,
        newAssignment.content,
        newAssignment.category,
        newAssignment.length,
        1,
        newAssignment.status,
        newAssignment.created_at,
        newAssignment.updated_at,
        newAssignment.published_at,
      ]
    );
  } catch (error) {
    console.error("DB insert error:", error);
    return res.status(500).json({
      message: "Server could not create assignment because database connection",
      error: error.message,
    });
  }
  return res.status(201).json({
    message: "Created assignment sucessfully",
  });
});

app.get("/assignments", async (req, res) => {
  let results;
  try {
    results = await connectionPool.query("select * from assignments");
    return res.status(200).json({
      data: results.rows,
    });
  } catch {
    return res.status(500).json({
      message: "Server could not read assignment because database connection",
    });
  }
});

app.get("/assignments/:assignmentId", async (req, res) => {
  let results;
  try {
    const assignmentIdFromClient = req.params.assignmentId;
    results = await connectionPool.query(
      `select * from assignments where assignment_id=$1`,
      [assignmentIdFromClient]
    );
    if (!results.rows[0]) {
      return res.status(404).json({
        message: "Server could not find a requested assignment",
      });
    }
  } catch {
    return res.status(500).json({
      message: "Server could not read assignment because database connection",
    });
  }
  return res.status(200).json({
    data: results.rows[0],
  });
});

app.put("/assignments/:assignmentId", async (req, res) => {
  const assignmentIdFromClient = req.params.assignmentId;
  const updatedAssignments = { ...req.body, updated_at: new Date() };

  try {
    const results = await connectionPool.query(
      `update assignments set
      title =$2, 
      content =$3, 
      category =$4, 
      length =$5, 
      user_id =$6,
      status =$7,
      updated_at =$8,  
      published_at =$9
      where assignment_id = $1`,
      [
        assignmentIdFromClient,
        updatedAssignments.title,
        updatedAssignments.content,
        updatedAssignments.category,
        updatedAssignments.length,
        1,
        updatedAssignments.status,
        updatedAssignments.updated_at,
        updatedAssignments.published_at,
      ]
    );
    if (results.rowCount === 0) {
      return res.status(404).json({
        message: "Server could not find a requested assignment to update",
      });
    }
    return res.status(200).json({
      message: "Updated assignment sucessfully",
    });
  } catch {
    return res.status(500).json({
      message: "Server could not update assignment because database connection",
    });
  }
});

app.delete("/assignments/:assignmentId", async (req, res) => {
  const assignmentIdFromClient = req.params.assignmentId;
  let results;
  try {
    results = await connectionPool.query(
      `delete from assignments where assignment_id=$1`,
      [assignmentIdFromClient]
    );
    if (results.rowCount === 0) {
      return res.status(404).json({
        message: "Server could not find a requested assignment to delete",
      });
    }
  } catch {
    return res.status(500).json({
      message: "Server could not delete assignment because database connection",
    });
  }
  return res.status(200).json({
    message: "Deleted assignment sucessfully",
  });
});

app.listen(port, () => {
  console.log(`Server is running at ${port}`);
});
