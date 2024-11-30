// // Array to store tasks
let tasks = [];

// Toggle the visibility of the task form
function toggleTaskForm(show, task = null) {
  const form = document.querySelector(".task-form");
  form.style.display = show ? "flex" : "none";

  if (task) {
    // Populate the form fields if a task is provided (for updating)
    document.getElementById("task-title").value = task.title;
    document.getElementById("task-desc").value = task.description;
    document.getElementById("task-priority").value = task.priority;
    document.getElementById("task-date").value = task.date;
  } else {
    // Clear the form fields for adding a new task
    clearForm();
  }
}

// Toggle the visibility of the nav-bar
const toggleButton = document.getElementById("toggleButton");
const closeButton = document.getElementById("closeButton");
const navbar = document.getElementById("navbar");

// Toggle the visibility of the filter
function toggleFilterInput(show, filter = null) {
  const input = document.querySelector(".filter-bar");
  input.style.display = show ? "flex" : "none";

  if (filter) {
    // Populate the form fields if a task is provided (for updating)
    document.getElementById("filter-priority").value = filter.priority;
    document.getElementById("filter-date").value = filter.date;
  } else {
  }
}

// Add a new task

const API_URL = "https://taskmaster-backend-api.fly.dev/api/tasks";

function addTask() {
  const token = localStorage.getItem("token"); // Get JWT from localStorage

  const title = document.getElementById("task-title").value;
  const description = document.getElementById("task-desc").value;
  const priority = document.getElementById("task-priority").value;
  const date = document.getElementById("task-date").value;

  // Validate required fields
  if (title.trim() === "" || description.trim() === "") {
    alert("Title and Description are required!");
    return;
  }

  // Prepare task object
  const taskData = JSON.stringify({ title, description, priority, date });

  // Create an XMLHttpRequest to save the task
  const xhr = new XMLHttpRequest();
  xhr.open("POST", API_URL, true);
  xhr.setRequestHeader("Authorization", `Bearer ${token}`);
  xhr.setRequestHeader("Content-Type", "application/json");

  xhr.onreadystatechange = function () {
    if (xhr.readyState === XMLHttpRequest.DONE) {
      if (xhr.status >= 200 && xhr.status < 300) {
        const response = JSON.parse(xhr.responseText);
        alert(response.message || "Task saved successfully.");
        loadTasks(); // Refresh the task list
        clearForm(); // Clear the form fields
        toggleTaskForm(false); // Hide the task form
      } else {
        console.error("Error saving task:", xhr.responseText);
        try {
          const errorResponse = JSON.parse(xhr.responseText);
          alert(errorResponse.message || "Failed to save task.");
        } catch (parseError) {
          alert("An unknown error occurred.");
        }
      }
    }
  };

  // Send the task data to the backend
  xhr.send(taskData);
}

function deleteTask(taskId) {
  const token = localStorage.getItem("token"); // Retrieve the token from localStorage
  if (!token) {
    alert("You are not authorized to perform this action.");
    return;
  }

  const xhr = new XMLHttpRequest();
  xhr.open("DELETE", `https://backend-snowy-snow-5492.fly.dev/api/tasks/${taskId}`, true);
  xhr.setRequestHeader("Authorization", `Bearer ${token}`);

  xhr.onreadystatechange = function () {
    if (xhr.readyState === XMLHttpRequest.DONE) {
      if (xhr.status >= 200 && xhr.status < 300) {
        alert("Task deleted successfully.");
        loadTasks(); // Reload tasks
      } else {
        console.error("Error deleting task:", xhr.responseText);
        try {
          const errorResponse = JSON.parse(xhr.responseText);
          alert(errorResponse.message || "Failed to delete task.");
        } catch (parseError) {
          alert("An unknown error occurred.");
        }
      }
    }
  };

  xhr.send();
}

// Edit prefill task
function editTask(
  taskId,
  currentTitle,
  currentDescription,
  currentPriority,
  currentDate
) {
  const editForm = document.getElementById("task-form");
  editForm.style.display = "block"; // Show the edit form

  document.getElementById("task-title").value = currentTitle;
  document.getElementById("task-desc").value = currentDescription;
  document.getElementById("task-priority").value = currentPriority;
  document.getElementById("task-date").value = currentDate;

  const saveButton = document.getElementById("btn");
  saveButton.onclick = () => updateTask(taskId);
}

// Update a task
function updateTask(taskId) {
  const token = localStorage.getItem("token");
  const title = document.getElementById("task-title").value;
  const description = document.getElementById("task-desc").value;
  const priority = document.getElementById("task-priority").value;
  const date = document.getElementById("task-date").value;

  const xhr = new XMLHttpRequest();
  xhr.open("PUT", `https://taskmaster-backend-api.fly.dev/api/tasks/${taskId}`, true);
  xhr.setRequestHeader("Authorization", `Bearer ${token}`);
  xhr.setRequestHeader("Content-Type", "application/json");

  xhr.onreadystatechange = function () {
    if (xhr.readyState === XMLHttpRequest.DONE) {
      if (xhr.status === 200) {
        const result = JSON.parse(xhr.responseText);
        alert("Task updated successfully.");
        loadTasks(); // Reload tasks
        // clearForm();
        toggleTaskForm(false); // Hide the task form after adding a task
      } else {
        console.error("Error updating task:", xhr.responseText);
        try {
          const errorResponse = JSON.parse(xhr.responseText);
          alert(errorResponse.message || "Error updating task");
        } catch (e) {
          alert("An error occurred, please try again.");
        }
      }
    }
  };

  const taskData = JSON.stringify({
    title,
    description,
    priority,
    date,
  });

  xhr.send(taskData);
}

// Search tasks
async function searchTasks() {
  const token = localStorage.getItem("token"); // Get the JWT token
  const keyword = document.getElementById("search-keyword").value;

  if (!keyword.trim()) {
    alert("Please enter a keyword to search.");
    return;
  }

  try {
    const xhr = new XMLHttpRequest();
    xhr.open(
      "GET",
      `https://taskmaster-backend-api.fly.dev/api/tasks/search?keyword=${encodeURIComponent(
        keyword
      )}`,
      true
    );
    xhr.setRequestHeader("Authorization", `Bearer ${token}`);

    xhr.onreadystatechange = function () {
      if (xhr.readyState === XMLHttpRequest.DONE) {
        if (xhr.status === 200) {
          const response = JSON.parse(xhr.responseText);
          displayTasks(response.tasks); // Reuse your displayTasks function
        } else {
          console.error("Error searching tasks:", xhr.responseText);
          alert("Failed to search tasks.");
        }
      }
    };

    xhr.send();
  } catch (error) {
    console.error("Error searching tasks:", error);
    alert("An error occurred while searching tasks.");
  }
}

// Render tasks in the list
function renderTasks(filteredTasks = tasks) {
  const taskList = document.getElementById("task-list");
  taskList.innerHTML = "";

  filteredTasks.forEach((task) => {
    const li = document.createElement("li");

    li.innerHTML = `
      <div class="task-details">
        <strong>Title: ${task.title}</strong> <br>
        <strong>Description: ${task.description}</strong> <br>
        <strong class="p"><em>Priority:</em> ${task.priority}</strong> <br> 
        <strong class="date"><em>Date:</em> ${task.date}</strong>
      </div>
      <div class="actions">
       <button class="update" onclick="editTask('${task._id}', '${task.title}', '${task.description}', '${task.date}', '${task.priority}')">Update</button>
      <button class="delete" onclick="deleteTask('${task._id}')">Delete</button>   
      </div>
    `;

    taskList.appendChild(li);
  });
}

// Clear the form after adding/updating a task
function clearForm() {
  document.getElementById("task-title").value = "";
  document.getElementById("task-desc").value = "";
  document.getElementById("task-priority").value = "Low";
  document.getElementById("task-date").value = "";
}

// Function to filter tasks by priority or date

async function filterTasks() {
  const token = localStorage.getItem("token"); // Retrieve the user's JWT token
  const priority = document.getElementById("filter-priority").value.trim();
  const date = document.getElementById("filter-date").value.trim();

  let query = "";
  if (priority) query += `priority=${encodeURIComponent(priority)}&`;
  if (date) query += `date=${encodeURIComponent(date)}&`;

  // Remove trailing "&"
  if (query.endsWith("&")) query = query.slice(0, -1);

  const API_URL = `https://taskmaster-backend-api.fly.dev/api/tasks/filter?${query}`;

  try {
    const response = await fetch(API_URL, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const error = await response.json();
      alert(error.message || "Failed to fetch tasks.");
      return;
    }

    const tasks = await response.json();
    if (tasks.length === 0) {
      alert("No tasks found.");
      return;
    }

    displayTasks(tasks); // Display tasks on the frontend
  } catch (error) {
    console.error("Error fetching tasks:", error);
    alert("An error occurred while fetching tasks.");
  }
}

// reset filter
function resetFilters() {
  document.getElementById("filter-priority").value = "";
  document.getElementById("filter-date").value = "";
  loadTasks(); // Reload all tasks
}

async function loadTasks() {
  const token = localStorage.getItem("token"); // Retrieve the token

  if (!token) {
    alert("You need to log in to view your tasks.");
    window.location.href = "login.html";
    return;
  }

  try {
    const xhr = new XMLHttpRequest();
    xhr.open("GET", "https://taskmaster-backend-api.fly.dev/api/tasks", true);
    xhr.setRequestHeader("Authorization", `Bearer ${token}`);

    xhr.onreadystatechange = function () {
      if (xhr.readyState === XMLHttpRequest.DONE) {
        if (xhr.status === 200) {
          const tasks = JSON.parse(xhr.responseText);
          displayTasks(tasks); // Render tasks on the dashboard
        } else {
          console.error("Error loading tasks:", xhr.responseText);
          alert("Please login to load tasks.");
        }
      }
    };

    xhr.send();
  } catch (error) {
    console.error("Error loading tasks:", error);
    alert("An error occurred while loading tasks.");
  }
}

function formatDate(dateString) {
  const date = new Date(dateString); // Convert to Date object

  // Format the date (e.g., "2024-12-07")
  const formattedDate = date.toLocaleDateString("en-GB"); // You can change 'en-GB' to any locale

  return formattedDate;
}

// Example usage
const taskDate = "2024-12-07T00:00:00.000Z"; // ISO string
const formattedDate = formatDate(taskDate);
console.log(formattedDate); // Outputs: "07/12/2024" (or "2024-12-07" depending on the locale)

function displayTasks(tasks) {
  const taskList = document.getElementById("task-list");
  taskList.innerHTML = ""; // Clear current tasks

  if (!tasks || tasks.length === 0) {
    taskList.innerHTML = "<p>No tasks to display.</p>";
    return;
  }

  tasks.forEach((task) => {
    const taskDate = formatDate(task.date); // Format the date before displaying
    const li = document.createElement("li");

    li.innerHTML = `
      <div class="task-details">
        <strong>Title: ${task.title}</strong> <br>
        <strong>Description: ${task.description}</strong> <br>
        <strong class="p"><em>Priority:</em> ${task.priority}</strong> <br> 
        <strong class="date"><em>Date:</em> ${taskDate}</strong>
      </div>
      <div class="actions">
       <button class="update" onclick="editTask('${task._id}', '${task.title}', '${task.description}', '${task.date}', '${task.priority}')">Update</button>
      <button class="delete" onclick="deleteTask('${task._id}')">Delete</button>   
      </div>
    `;

    taskList.appendChild(li);
  });
}

// Call loadTasks when the dashboard loads
document.addEventListener("DOMContentLoaded", loadTasks);
