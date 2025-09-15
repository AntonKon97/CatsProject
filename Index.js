const form = document.querySelector(".todo-form");
const input = document.querySelector(".todo-form__input");
const list = document.querySelector(".todo-list");
const counter = document.querySelector(".todo-header__counter");

let tasks = JSON.parse(localStorage.getItem("tasks")) || [];

// 🔹 Функція рендеру завдань
function renderTasks() {
  list.innerHTML = "";

  tasks.forEach((task, index) => {
    const li = document.createElement("li");
    li.className = "todo-list__item";

    li.innerHTML = `
      <input class="todo-list__checkbox" type="checkbox" ${
        task.done ? "checked" : ""
      } data-index="${index}">
      <span class="todo-list__text ${
        task.done ? "todo-list__text--done" : ""
      }">${task.text}</span>
      <button class="todo-list__btn todo-list__btn--delete" data-index="${index}">❌</button>
    `;

    list.appendChild(li);
  });

  updateCounter();
  localStorage.setItem("tasks", JSON.stringify(tasks));
}

// 🔹 Оновлення лічильника
function updateCounter() {
  const doneCount = tasks.filter((t) => t.done).length;
  counter.textContent = `${doneCount} виконано з ${tasks.length}`;
}

// 🔹 Додавання нового завдання
form.addEventListener("submit", (e) => {
  e.preventDefault();
  const text = input.value.trim();
  if (text === "") return;

  tasks.push({ text, done: false });
  input.value = "";
  renderTasks();
});

// 🔹 Клік по списку (делегування)
list.addEventListener("click", (e) => {
  const index = e.target.dataset.index;

  // Чекбокс
  if (e.target.classList.contains("todo-list__checkbox")) {
    tasks[index].done = !tasks[index].done;
    renderTasks();
  }

  // Видалення
  if (e.target.classList.contains("todo-list__btn--delete")) {
    tasks.splice(index, 1);
    renderTasks();
  }
});

renderTasks();