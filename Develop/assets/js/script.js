
//Retrieve tasks and nextId from localStorage
let taskList = JSON.parse(localStorage.getItem("tasks")) ;
let nextId = JSON.parse(localStorage.getItem("nextId"));

// Create a function to generate a unique task id
function generateTaskId() {
    let id = nextId;
    nextId++;
    localStorage.setItem("nextId", JSON.stringify(nextId));
    return id;
}

// Create a function to create a task card
function createTaskCard(task){
  const taskCard= $('<div>').addClass('card project-card draggable my-3').attr('data-task-id',task.id);
  const cardHeader= $('<div>').addClass('card-header h4').text(task.title);
  const cardBody=$('<div>').addClass('card-body');
  const cardDescription= $('<p>').addClass('card-text').text(task.description);
  const cardDueDate= $('<p>').addClass('card-text').text(`Due: ${dayjs(task.deadline).format('MMM D, YYYY')}`);
  const cardDeleteBtn = $('<button>').addClass('btn btn-danger delete').text('Delete').attr('data-task-id', task.id);
     
  
  cardDeleteBtn.on('click', function() {
     handleDeleteTask(task.id);
  });



  if (task.deadline && task.status !== 'done') {
    const now= dayjs();
    const taskDueDate =dayjs(task.deadline, 'YYYY-MM-DD');

    //If the task is due today, make it yellow. If it is overdue, make it red.

    if (now.isSame(taskDueDate, 'day')) {

        taskCard.addClass('bg-warning text-white');

    } else if( now.isAfter(taskDueDate)) {
            taskCard.addClass( 'bg-danger text-white');
    }
  }

    //Append elements to the card body and card
  cardBody.append(cardDescription, cardDueDate, cardDeleteBtn);
  taskCard.append(cardHeader, cardBody);
    // Return the card so it can be appended to the correct lane
  return taskCard;
} 



// Create a function to render the task list and make cards draggable
function renderTaskList() {
    ['to-do', 'in-progress', 'done'].forEach(status => {
        let column = document.getElementById(status);
        column.innerHTML = '';
        taskList.filter(task => task.status === status).forEach(task => {
            let card = createTaskCard(task);
            (column).appendChild(card[0]);
        });
    });

    // Make cards draggable
    $('.draggable').draggable({
        containment: 'document',
        revert: 'invalid',
        start: function(event, ui) {
            $(this).css('opacity', '0.5');
        },
        stop: function(event, ui) {
            $(this).css('opacity', '1');
        }
    });

    // Columns droppable
    $('.lane').droppable({
        accept: '.task-card',
        drop: function(event, ui) {
            let newStatus = this.id;
            let taskId = ui.draggable.attr('data-task-id');
            handleDrop(taskId, newStatus);
        }
    });
}

// Create a function to handle adding a new task
function handleAddTask(event) {
    event.preventDefault();
    let title = document.getElementById('task-title').value;
    let description = document.getElementById('task-description').value;
    let deadline = document.getElementById('task-deadline').value;

    let newTask = {
        id: generateTaskId(),
        title: title,
        description: description,
        deadline: deadline,
        status: 'to-do' // Default status for new task
    };

    taskList.push(newTask);
    localStorage.setItem('tasks', JSON.stringify(taskList));
    renderTaskList();
    
    //Close the modal

    $('#addTaskModal').modal('hide');
}

// Create a function to handle deleting a task
function handleDeleteTask(taskId) {
    taskList = taskList.filter(task => task.id != taskId);
    localStorage.setItem('tasks', JSON.stringify(taskList));
    renderTaskList();
}

// Create a function to handle dropping a task into a new status lane
function handleDrop(taskId, newStatus) {
    let task = taskList.find(t => t.id == taskId);
    if (task) {
        task.status = newStatus;
        localStorage.setItem('tasks', JSON.stringify(taskList));
        renderTaskList();
    }
}

//Adding event listener to the form element 

$('#task-form').on('submit', handleAddTask);

$(document).on('click', '.delete', function() {

    let taskId =$(this).attr('data-task-id');
    handleDeleteTask(taskId);

});


// When the page loads, render the task list, add event listeners, make lanes droppable, and make the due date field a date picker
$(document).ready(function () {
    renderTaskList();


    $('#task-deadline').datepicker({
        changeMonth: true,
        changeYear: true,

    });

    $('.lane').droppable({

        accept: '.draggable',
        drop: handleDrop,

    })
});
