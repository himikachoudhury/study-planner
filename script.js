// === ELEMENTS ===
const taskForm       = document.getElementById("taskForm");
const taskList       = document.getElementById("taskList");
const completedTasks = document.getElementById("completedTasks");
const darkModeBtn    = document.getElementById("darkModeBtn");
const ringFill       = document.getElementById("ringFill");
const progressPercent= document.getElementById("progressPercent");
const progressText   = document.getElementById("progressText");
const activeCount    = document.getElementById("activeCount");
const completedCount = document.getElementById("completedCount");
const dateDisplay    = document.getElementById("dateDisplay");

// === DATE ===
dateDisplay.textContent = new Date().toLocaleDateString("en-GB", {
  weekday: "long", day: "numeric", month: "long"
});

// === STORAGE ===
let tasks = JSON.parse(localStorage.getItem("tasks")) || [];

// === DARK MODE ===
if (localStorage.getItem("darkMode") === "true") {
  document.body.classList.add("dark");
}

darkModeBtn.addEventListener("click", () => {
  document.body.classList.toggle("dark");
  localStorage.setItem("darkMode", document.body.classList.contains("dark"));
});

renderTasks();

// === ADD TASK ===
taskForm.addEventListener("submit", function (e) {
  e.preventDefault();

  const title    = document.getElementById("taskTitle").value.trim();
  const module   = document.getElementById("taskModule").value.trim();
  const deadline = document.getElementById("taskDeadline").value;
  const priority = document.getElementById("taskPriority").value;

  tasks.push({ id: Date.now(), title, module, deadline, priority, completed: false });

  saveTasks();
  renderTasks();
  taskForm.reset();
});

// === SAVE ===
function saveTasks() {
  localStorage.setItem("tasks", JSON.stringify(tasks));
}

// === RENDER TASKS ===
function renderTasks() {
  taskList.innerHTML     = "";
  completedTasks.innerHTML = "";

  const active    = tasks.filter(t => !t.completed);
  const completed = tasks.filter(t =>  t.completed);

  activeCount.textContent    = active.length;
  completedCount.textContent = completed.length;

  if (active.length === 0) {
    taskList.innerHTML = `<p class="empty-state">Nothing due yet — add a task to get started.</p>`;
  } else {
    active.forEach(t => taskList.appendChild(buildCard(t)));
  }

  if (completed.length === 0) {
    completedTasks.innerHTML = `<p class="empty-state">Tasks you finish will appear here.</p>`;
  } else {
    completed.forEach(t => completedTasks.appendChild(buildCard(t)));
  }

  updateProgress();
}

// === BUILD CARD ===
function buildCard(task) {
  const card = document.createElement("div");
  card.classList.add("task-card", task.priority.toLowerCase());
  if (task.completed) card.classList.add("completed");

  // Format deadline nicely
  const deadlineFormatted = task.deadline
    ? new Date(task.deadline + "T00:00").toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })
    : "";

  // Days until deadline
  let daysLabel = "";
  if (task.deadline && !task.completed) {
    const diff = Math.ceil((new Date(task.deadline + "T00:00") - new Date()) / 86400000);
    if (diff < 0)       daysLabel = "Overdue";
    else if (diff === 0) daysLabel = "Due today";
    else if (diff === 1) daysLabel = "Due tomorrow";
    else                 daysLabel = `${diff}d left`;
  }

  card.innerHTML = `
    <div class="task-info">
      <h3>${task.title}</h3>
      <div class="task-meta">
        <span class="meta-chip">📘 ${task.module}</span>
        ${task.deadline ? `<span class="meta-chip">📅 ${deadlineFormatted}</span>` : ""}
        ${daysLabel ? `<span class="meta-chip">${daysLabel}</span>` : ""}
        <span class="priority-chip ${task.priority.toLowerCase()}">${task.priority}</span>
      </div>
    </div>
    <div class="task-actions">
      <button class="btn-complete" onclick="toggleTask(${task.id})">
        ${task.completed ? "↩ Undo" : "✓ Done"}
      </button>
      <button class="btn-delete" onclick="deleteTask(${task.id})">Delete</button>
    </div>
  `;

  return card;
}

// === TOGGLE ===
function toggleTask(id) {
  tasks = tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t);
  saveTasks();
  renderTasks();
}

// === DELETE ===
function deleteTask(id) {
  tasks = tasks.filter(t => t.id !== id);
  saveTasks();
  renderTasks();
}

// === PROGRESS ===
function updateProgress() {
  const total     = tasks.length;
  const done      = tasks.filter(t => t.completed).length;
  const percent   = total === 0 ? 0 : Math.round((done / total) * 100);
  const circumference = 251.2;

  ringFill.style.strokeDashoffset = circumference - (circumference * percent) / 100;
  progressPercent.textContent = percent + "%";
  progressText.textContent = total === 0
    ? "No tasks yet"
    : `${done} of ${total} task${total !== 1 ? "s" : ""} complete`;
}
