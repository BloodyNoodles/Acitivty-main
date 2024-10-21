// App.js
import React, { useState, useEffect } from "react";
import axios from "axios";
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from "react-router-dom";
import './App.css';

const TaskManagementApp = () => {
  const [tasks, setTasks] = useState([]);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    priority: "medium",
    due_date: "",
  });
  const [isEdit, setIsEdit] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  const [userRole, setUserRole] = useState(null); // Initialize as null to check loading state
  const [isAdmin, setIsAdmin] = useState(false);

  const navigate = useNavigate(); // Hook for navigating programmatically

  useEffect(() => {
    // Check user role from localStorage when the component mounts
    const role = localStorage.getItem('userRole'); // Retrieve the user role from localStorage
    if (role) {
      setUserRole(role); // Set the user role in state
      setIsAdmin(role === "admin"); // Set isAdmin based on the user role
    } else {
      setUserRole('user'); // Default to 'user' if no role is found
      setIsAdmin(false); // Ensure isAdmin is false if user is not an admin
    }

    fetchTasks(); // Fetch tasks after determining user role
  }, []);

  // Helper function to format date to yyyy-MM-dd
  const formatDate = (dateString) => {
    return new Date(dateString).toISOString().split("T")[0];
  };

  // Fetch all tasks from the server
  const fetchTasks = async () => {
    try {
      const response = await axios.get("http://localhost:5000/tasks");
      setTasks(response.data);
    } catch (error) {
      console.error("Error fetching tasks:", error);
    }
  };

  // Handle form submission (create or update task)
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const formDataToSend = {
        title: formData.title,
        description: formData.description,
        priority: formData.priority,
        due_date: formData.due_date,
      };

      if (isEdit) {
        await axios.put(`http://localhost:5000/tasks/${currentId}`, formDataToSend);
        setIsEdit(false);
      } else {
        await axios.post("http://localhost:5000/tasks", formDataToSend);
      }
      fetchTasks();
      resetForm();
    } catch (error) {
      console.error("Error submitting task:", error);
    }
  };

  // Handle task delete
  const handleDelete = async (id) => {
    console.log("Deleting task with ID:", id);
    if (window.confirm("Are you sure you want to delete this task?")) {
      try {
        await axios.delete(`http://localhost:5000/tasks/${id}`);
        fetchTasks();
      } catch (error) {
        console.error("Error deleting task:", error);
      }
    }
  };

  // Handle task edit
  const handleEdit = (task) => {
    setFormData({
      title: task.title,
      description: task.description,
      priority: task.priority,
      due_date: formatDate(task.due_date),
    });
    setIsEdit(true);
    setCurrentId(task.id);
  };

  // Reset form to initial state
  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      priority: "medium",
      due_date: "",
    });
  };

  // Handle logout function
  const handleLogout = () => {
    localStorage.removeItem('userRole'); // Clear user role from localStorage
    setUserRole(null); // Reset userRole in state
    setIsAdmin(false); // Reset isAdmin flag
    navigate("/"); // Redirect to homepage after logout
  };

  // Check if userRole is still being loaded
  if (userRole === null) {
    return <div>Loading...</div>; // Show a loading message or spinner while fetching the role
  }

  return (
    <div className="container">
      <h1>Task Management System</h1>

      {/* Logout button */}
      <div className="logout-button">
        {userRole && (
          <button onClick={handleLogout}>Logout</button>
        )}
      </div>

      <div className="task-table">
        <h2>Task List</h2>
        <table>
          <thead>
            <tr>
              <th>Title</th>
              <th>Description</th>
              <th>Priority</th>
              <th>Due Date</th>
              {isAdmin && (
                <th>Actions</th>
              )}
            </tr>
          </thead>
          <tbody>
            {tasks.length === 0 ? (
              <tr>
                <td colSpan="5">No tasks available.</td>
              </tr>
            ) : (
              tasks.map((task) => (
                <tr key={task.id}>
                  <td>{task.title}</td>
                  <td>{task.description}</td>
                  <td>{task.priority}</td>
                  <td>{formatDate(task.due_date)}</td>
                  {isAdmin && (
                    <td>
                      <div className="action-buttons">
                        <>
                          <button onClick={() => handleEdit(task)}>Edit</button>
                          <button className="delete-btn" onClick={() => handleDelete(task.id)}>
                            🗑
                          </button>
                        </>
                      </div>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Conditionally render the form based on user role */}
      {userRole === 'admin' && (
        <form onSubmit={handleSubmit}>
          <h2>{isEdit ? "Update Task" : "Add Task"}</h2>
          <input
            type="text"
            placeholder="Task Title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            required
          />
          <textarea
            placeholder="Task Description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />
          <select
            value={formData.priority}
            onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
          <input
            type="date"
            value={formData.due_date ? formatDate(formData.due_date) : ""}
            onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
          />
          <button type="submit">{isEdit ? "Update Task" : "Add Task"}</button>
        </form>
      )}
    </div>
  );
};

const HomePage = () => {
  return (
    <div>
      <h1>Welcome to the Task Management App</h1>
      <Link to="/tasks">Go to Task Management</Link>
    </div>
  );
};

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/tasks" element={<TaskManagementApp />} />
      </Routes>
    </Router>
  );
};

export default App;
