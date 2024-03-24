(function() {
const headerInput = document.querySelector('#headerInput');
const headerButton = document.querySelector('#headerButton');
const taskList = document.querySelector('#taskList');
const allCheckbox = document.querySelector('#allCheckbox');
const delCompleted = document.querySelector('#delCompleted');
const errorText = document.querySelector('.error-text');
const allChecked = document.querySelector('#all');
const activeChecked = document.querySelector('#active');
const completedChecked = document.querySelector('#completed');
const filters = document.querySelector('.filters');
const paginationBox = document.querySelector('.pagination');

const PER_PAGE = 5;
const ENTER = 'Enter';
const ESCAPE = 'Escape';
const DOUBLE_CLICK = 2;
const INPUT = 'INPUT';
const BUTTON = 'BUTTON';
const TIME_ERROR = 2000;


let tasks = [];
let currentPage = 1;
let filteredTask = 'all';
let pagButtons = '';

const validateText = (pureText) => {
  const specialChar = /["№;%:?*.]/g;
  return pureText.replaceAll(specialChar, '');
}


const addTask = (event) => {
  event.preventDefault();
  let pureText = headerInput.value.trim();
  if(pureText === '') return showError();
  
  const newTask = {
    text: validateText(pureText),
    id: Date.now(),
    isDone: false,
  };

  tasks.push(newTask);
  renderPagination(tasks);
  renderTask();
  headerInput.value = '';
  headerInput.focus();
};


const showError = () => {
  errorText.style.display = 'flex';
  setTimeout(() => {
  errorText.style.display = 'none';
}, TIME_ERROR);
};

const saveChanges = (event) => {
  const taskId = Number(event.target.parentNode.id);
  let taskUpdate = tasks.find((elem) => elem.id === taskId);
  let textUpdate = event.target.value.trim();
  if (textUpdate != '') {
    taskUpdate.text = validateText(textUpdate);
  } else {
    showError();
    return;
  }
  renderTask();
};

const handleInputBlur = (event) => {
  const { target: { tagName, className }} = event;
  if ( tagName === INPUT && className ==='newInput') {
  saveChanges(event);
  }
  };

const handleInputKeypress = (event) => {
  if (event.key === ENTER) {
    saveChanges(event);
  }
  if (event.key === ESCAPE) {
    renderTask();
  }
};

const allTasksDone = () => {
  const status = allCheckbox.checked;
  tasks.forEach((task) => {
    task.isDone = status;
  });
  renderTask(renderPagination(tasks));
};

const deleteChecked = () => {
  tasks = tasks.filter((task) => !task.isDone);
  allCheckbox.checked = false;
  renderTask(renderPagination(tasks));
};

const changeTask = (event) => {
  if (event.target.dataset.action === 'delete') {
    const parenNode = event.target.closest('.list-item');
    const id = Number(parenNode.id);
    tasks = tasks.filter((task) => task.id !== id);
    renderTask(renderPagination(tasks));
  }
  if (event.target.dataset.action === 'isDone') {
    const id = Number(event.target.parentNode.id);
    const task = tasks.find((i) => i.id === id);
    task.isDone = !task.isDone;
    renderTask();
  }
  if (event.target.dataset.action === 'edit' && event.detail == DOUBLE_CLICK) {
      console.log(event.target.innerHTML);
      event.target.hidden = 'true';
      event.target.nextElementSibling.hidden = '';
      event.target.nextElementSibling.focus();
  }
};

const renderTask = () => {
  filteredTasks = checkFilterTask();
  const totalPages = Math.ceil(filteredTasks.length / PER_PAGE);
  if (totalPages < currentPage) {
    currentPage -= 1;
  }
  if (totalPages > currentPage) {
    currentPage = totalPages;
  }
  const startIndex = (currentPage - 1) * PER_PAGE;
  const endIndex = startIndex + PER_PAGE;
  const currentTasks = filteredTasks.slice(startIndex, endIndex);
  renderPagination(filteredTasks);

  let tasksList = '';
  currentTasks.forEach((task) => {
    tasksList += `
    <li id="${task.id}"class="list-item">
      <input 
        id="doneInput" 
        data-action="isDone" 
        class="checkboxTask" 
        type = "checkbox"${task.isDone ? 'checked' : ''}>
      <span class="task"  data-action="edit">${task.text}</span>
      <input 
        type="text" 
        class="newInput" 
        value="${task.text}" 
        hidden>
      <button data-action="delete" class="buttonTask">X</button>
    </li>
    `;
  });
  taskList.innerHTML = tasksList;
  renderTaskCount()
};

const checkFilterTask = () => {
  if (filteredTask === 'active') {
    return tasks.filter((task) => !task.isDone);
  } if (filteredTask === 'completed') {
    return tasks.filter((task) => task.isDone);
  }
  return tasks;
};

const renderPagination = (actualTasks) => {
  const totalPages = Math.ceil(actualTasks.length / PER_PAGE);

  pagButtons = '';
  paginationBox.innerHTML = pagButtons;
  for (let i = 1; i <= totalPages; i++) {
    pagButtons += `<button class="${i === currentPage ? 'active' : 'pag-button'}" data-page ="${i}">${i}</button>`;
    paginationBox.innerHTML = pagButtons;
  }
  checkTotalPages(actualTasks);
};

const checkTotalPages = (actualTasks) => {
  totalPages = Math.ceil(actualTasks.length / PER_PAGE);
  if (totalPages < currentPage) {
    currentPage -= 1;
    renderPagination(actualTasks);
  }
}

const handlePagClick = (event) => {
  if (event.target.tagName === BUTTON) {
    currentPage = parseInt(event.target.dataset.page);
    const childArr = paginationBox.childNodes;
    showActiveButton(childArr)
    renderTask();
  }
};

const handleFilterClick = (event) => {
  currentPage = 1;
  filteredTask = event.target.id;
  const childArr = filters.childNodes;
  showActiveButton(childArr)
  const filteredTasks = checkFilterTask();
  renderTask(filteredTasks);
  renderPagination(filteredTasks);
};

const showActiveButton = (childArr) => {
  childArr.forEach((task) => {
    task.className = 'button-filter';
    event.target.className = 'button-filter-active';
  });
}

const checkKey = (event) => {
  if (event.key === ENTER) {
    addTask(event);
  }
};

const renderTaskCount = () => {
  allChecked.textContent = `All(${tasks.length})`;
  const activeArr = tasks.filter((item) => !item.isDone);
  const completedArr = tasks.filter((item) => item.isDone);
  activeChecked.textContent = `Active(${activeArr.length})`;
  completedChecked.textContent = `Completed(${completedArr.length})`;
}

headerButton.addEventListener('click', addTask);
headerInput.addEventListener('keypress', checkKey);
taskList.addEventListener('click', changeTask);
taskList.addEventListener('blur', handleInputBlur, true);
taskList.addEventListener('keydown', handleInputKeypress);
allCheckbox.addEventListener('click', allTasksDone);
delCompleted.addEventListener('click', deleteChecked);
filters.addEventListener('click', handleFilterClick);
paginationBox.addEventListener('click', handlePagClick);


})();