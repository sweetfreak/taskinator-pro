var tasks = {};

//audit tasks
var auditTask = function(taskEl) {
  //get date from task element
  var date = $(taskEl).find("span").text().trim();
  
  //convert to moment object at 5pm
  var time = moment(date, "L").set("hour", 17);
 
  //remove any old classes from element
  $(taskEl).removeClass("list-group-item-warning list=group-item-danger");

  //apply new class if task is near/over due date
  if (moment().isAfter(time)) {
    $(taskEl).addClass("list-group-item-danger");
    //checks if date is 2 days away or less, but you have to convert it to the absolute value, first
  } else if (Math.abs(moment().diff(time, "days")) <= 2) {
    $(taskEl).addClass("list-group-item-warning");
  }

};

var createTask = function(taskText, taskDate, taskList) {
  // create elements that make up a task item
  var taskLi = $("<li>").addClass("list-group-item");

  var taskSpan = $("<span>")
    .addClass("badge badge-primary badge-pill")
    .text(taskDate);

  var taskP = $("<p>")
    .addClass("m-1")
    .text(taskText);

  // append span and p element to parent li
  taskLi.append(taskSpan, taskP);

  //check due date
  auditTask(taskLi);

  // append to ul list on the page
  $("#list-" + taskList).append(taskLi);
};

var loadTasks = function() {
  tasks = JSON.parse(localStorage.getItem("tasks"));

  // if nothing in localStorage, create a new object to track all task status arrays
  if (!tasks) {
    tasks = {
      toDo: [],
      inProgress: [],
      inReview: [],
      done: []
    };
  }

  // loop over object properties
  $.each(tasks, function(list, arr) {
    console.log(list, arr);
    // then loop over sub-array
    arr.forEach(function(task) {
      createTask(task.text, task.date, list);
    });
  });
};

var saveTasks = function() {
  localStorage.setItem("tasks", JSON.stringify(tasks));
};
//find .list-group, when i click on the <p>, grab this text
$(".list-group").on("click", "p", function() {
  var text = $(this)
  .text()
  .trim();
//textInput = create new textArea with that class and the value of text
  var textInput = $("<textarea>")
  .addClass("form-control")
  .val(text);
//replaces the text with the textInput (the editable textarea box)
 $(this).replaceWith(textInput);
//highlights the box
 textInput.trigger("focus)");
//blur event triggers when you click outside textarea
$(".list-group").on("blur", "textarea", function() {
  //get text area's current value/text
  var text = $(this)
  .val()
  .trim();

  //get the parent ul's id attribute
  var status = $(this)
  .closest(".list-group")
  .attr("id")
  .replace("list-", "");

  //get the task's position in the list of other li elements
  var index = $(this)
  .closest(".list-group-item")
  .index();
  //finds the place in the array and saves it there
  tasks[status][index].text = text;
  saveTasks();
  //turns back into <p> object
  //recreates p element
  var taskP = $("<p>")
  .addClass("m-1")
  .text(text);

  //replace textarea with p element
  $(this).replaceWith(taskP);


})

});


// modal was triggered
$("#task-form-modal").on("show.bs.modal", function() {
  // clear values
  $("#modalTaskDescription, #modalDueDate").val("");
});

// modal is fully visible
$("#task-form-modal").on("shown.bs.modal", function() {
  // highlight textarea
  $("#modalTaskDescription").trigger("focus");
});

// save button in modal was clicked
$("#task-form-modal .btn-primary").click(function() {
  // get form values
  var taskText = $("#modalTaskDescription").val();
  var taskDate = $("#modalDueDate").val();

  if (taskText && taskDate) {
    createTask(taskText, taskDate, "toDo");

    // close modal
    $("#task-form-modal").modal("hide");

    // save in tasks array
    tasks.toDo.push({
      text: taskText,
      date: taskDate
    });

    saveTasks();
  }
});

// remove all tasks
$("#remove-tasks").on("click", function() {
  for (var key in tasks) {
    tasks[key].length = 0;
    $("#list-" + key).empty();
  }
  saveTasks();
});

// load tasks for the first time
loadTasks();

//due date was clicked
$(".list-group").on("click", "span", function(){
  //get current text
  var date= $(this)
  .text()
  .trim();

  //create new input element
  var dateInput = $("<input>")
    //two arguments, so attr sets the attribute (gives it a kind/type and a value)
  .attr("type", "text")
  .addClass("form-control")
  .val(date);

  //swap out elements
  $(this).replaceWith(dateInput);

  //enable jquery UI datepicker
  dateInput.datepicker({
    minDate: 0,
    //when calendar is closed, force a "change" event on the 'dateInput'
    onClose: function() {
      $(this).trigger("change");
    }
  })

  //automatically focus on new element
  dateInput.trigger("focus");
});

//value of due date was changed
$(".list-group").on("change", "input[type='text']", function() {
  //get current text
  var date = $(this)
  .val()
  .trim();

  //get the parent ul's id attribute
  var status = $(this)
  .closest(".list-group")
    //one element in attr, so it just gets the attribute
  .attr("id")
  .replace("list-", "");

  //get the task's position int he list of other li elemnts
  var index = $(this)
  .closest(".list-group-item")
  .index();

  //update task in array and re-save to localstorage
  tasks[status][index].date = date;
  saveTasks();

  //recreate span element with bootstrap classes
  var taskSpan = $("<span>")
  .addClass("badge badge-primary badge-pill")
  .text(date);
  //replace input with span element
  $(this).replaceWith(taskSpan);

  //pass task's <li> element into auditTask() to check new due date
  auditTask($(taskSpan).closest(".list-group-item"));
});


//draggable/droppable/sortable
//turns every element withing .card .list-group sortable amongst other .card and .list groups

$(".card .list-group").sortable({
  connectWith: $(".card .list-group"),
  scroll: false,
  tolerance: "pointer",
  helper: "clone",
  activate: function(event) {
    $(this).addClass("dropover");
    $(".bottom-trash").addClass("bottom-trash-drag");
    console.log("activate", this);
  },
  deactivate: function(event) {
    $(this).removeClass("dropover");
    $(".bottom-trash").removeClass("bottom-trash-drag");
    console.log("deactivate", this);
  },
  over: function(event) {
    $(event.target).addClass("dropover-active");
    console.log("over", event.target);
  },
  out: function(event) {
    $(this).removeClass("dropover-active");
    console.log("out", event.target);
  },
  //loop over current set of children in a sortable list
  //every time something is altered, this update method is called
                                              //IMPORTANT FOR HOMEWORK?
  update: function(event) {
    var tempArr = [];

    $(this).children().each(function(){
      // a second $(this) within the callback function refers to a child element - these "this"s are two different things
      
      var text = $(this)
        .find("p")
        .text()
        .trim();
      
      var date = $(this)
        .find("span")
        .text() 
        .trim(); 

      // add task data to the temp array as an object:
      tempArr.push({
        text: text,
        date: date
      })

      console.log(tempArr);

    });

    //trim down list's ID to match object property
    //aka, finds the id and replaces it 
    var arrName = $(this)
      .attr("id")
      .replace("list-", "");

    //update array on tasks object and save
    tasks[arrName] = tempArr;
    saveTasks();  

  }
});

$("#trash").droppable({
  accept: ".card .list-group-item",
  tolerance: "touch",
  drop: function(event, ui) {
    ui.draggable.remove();
    console.log("drop");
  },
  over: function(event, ui) {
    $(".bottom-trash").addClass("bottom-trash-active");
    console.log("over");
  },
  out: function(event, ui) {
    $(".bottom-trash").removeClass("bottom-trash-active");
    console.log("out");
  }
})

//Datepicker for new tasks
$("#modalDueDate").datepicker({
  //won't let you choose a date before "today" - swapping to a "1" woudl make it tomorrow. "2" woudl be day after tomorrow. -1 would be yesterday, etc
  minDate: 0
});

//every 30 min, it runs the auditTask function, to check if any updates in regards to the current day/time are needed.
setInterval(function() {
  $(".card .list-group-item").each(function(index, el) {
    auditTask(el);
  });
}, (1000 * 60) * 30);