// Retrieve tasks and nextId from localStorage
let taskList = JSON.parse(localStorage.getItem("tasks")) || [];
let nextId = JSON.parse(localStorage.getItem("nextId")) || 1;

// Function to generate a unique task id
function generateTaskId() {
    return nextId++;
}

// Function to create a task card
function createTaskCard(task) {
    const { id, title, description, deadline, status } = task;
    const taskCard = $(`
      <div class="card task-card mb-3" data-id="${id}" data-status="${status}">
        <div class="card-body">
          <h5 class="card-title">${title}</h5>
          <p class="card-text">${description}</p>
          <p class="card-text"><strong>Deadline:</strong> ${dayjs(deadline).format('MM-DD-YYYY')}</p>
          <button class="btn btn-danger btn-sm delete-btn"><i class="fas fa-trash"></i></button>
        </div>
      </div>
    `);

    // Function for color rendering based on deadlines
    if (task.deadline && task.status !== 'done') {
        const now = dayjs();
        const taskDueDate = dayjs(task.deadline, 'MM-DD-YYYY');

        // If the task is due today
        if (now.isSame(taskDueDate, 'day')) {
            taskCard.addClass('bg-warning text-dark'); // Use text-dark for better contrast
        }
        // If the task is overdue
        else if (now.isAfter(taskDueDate)) {
            taskCard.find('.card-body').addClass('bg-danger text-white');
            taskCard.find('.delete-btn').addClass('border-light');
        }
    }
    return taskCard;
}

// Function to render the task list and make cards draggable
function renderTaskList() {
    $("#to-do-cards").empty();
    $("#in-progress-cards").empty();
    $("#done-cards").empty();

    taskList.forEach(task => {
        const taskCard = createTaskCard(task);
        $(`#${task.status}-cards`).append(taskCard); // Ensure tasks are appended to the correct lane
    });

    $(".task-card").draggable({
        revert: "invalid",
        cursor: "move",
        helper: "clone"
    });
}

// Function to handle adding a new task
function handleAddTask(event) {
    event.preventDefault();
  
    const title = $("#title").val().trim();
    const description = $("#description").val().trim();
    const deadline = $("#deadline").val();
    const status = "to-do"; // Updated to match the ID of the "To Do" column
  
    if (title && description && deadline) {
        const newTask = {
            id: generateTaskId(),
            title,
            description,
            deadline,
            status
        };
  
        taskList.push(newTask);
        localStorage.setItem("tasks", JSON.stringify(taskList));
        localStorage.setItem("nextId", nextId);
        
        $("#formModal").modal("hide");
        $("#title").val("");
        $("#description").val("");
        $("#deadline").val("");
  
        renderTaskList();
    }
}

// Function to handle deleting a task
function handleDeleteTask(event) {
    const taskId = $(this).closest(".task-card").data("id");
    taskList = taskList.filter(task => task.id !== taskId);
    localStorage.setItem("tasks", JSON.stringify(taskList));
    renderTaskList();
}

// Function to handle dropping a task into a new status lane
function handleDrop(event, ui) {
    const taskId = ui.draggable.data("id");
    const newStatus = $(this).closest('.lane').attr("id").replace('-cards', ''); // Ensure correct status is set

    const taskIndex = taskList.findIndex(task => task.id === taskId);

    if (taskIndex !== -1) {
        taskList[taskIndex].status = newStatus;
    }

    localStorage.setItem("tasks", JSON.stringify(taskList));
    renderTaskList(); // Re-render task list to reflect changes
}

// Initialize the page when loaded
$(document).ready(function () {
    renderTaskList();
  
    $("#formModal").on("shown.bs.modal", function () {
        $("#title").focus();
    });
  
    $("#addTaskForm").on("submit", handleAddTask);
  
    $(document).on("click", ".delete-btn", handleDeleteTask);
  
    $(".lane").droppable({
        accept: ".task-card",
        drop: handleDrop
    });
  
    $("#deadline").datepicker({
        dateFormat: "yy-mm-dd"
    });
});