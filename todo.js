// todo.js — стійка реалізація з делегуванням подій та повторним рендером після HTMX swap

// Зчитуємо/ініціалізуємо масив завдань
let tasks = JSON.parse(localStorage.getItem("tasks")) || [];

// Зберегти tasks у localStorage
function saveTasks() {
  localStorage.setItem("tasks", JSON.stringify(tasks));
}

// Безпечне екранування тексту (щоб не вставляти HTML)
function escapeHtml(str = "") {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// Рендер списку (активуєтьcя коли в DOM є .todo-list)
function renderTasks() {
  const list = document.querySelector(".todo-list");
  const counter = document.querySelector(".todo-header__counter");

  if (!list) return; // якщо контейнера ще немає — нічого не робимо

  list.innerHTML = "";

  tasks.forEach((task, index) => {
    const li = document.createElement("li");
    li.className = "todo-list__item";

    li.innerHTML = `
      <input class="todo-list__checkbox" type="checkbox" ${task.done ? "checked" : ""} data-index="${index}">
      <span class="todo-list__text ${task.done ? "todo-list__text--done" : ""}">${escapeHtml(task.text)}</span>
      <button class="todo-list__btn todo-list__btn--delete" data-index="${index}" aria-label="Видалити завдання">❌</button>
    `;

    list.appendChild(li);
  });

  if (counter) {
    const doneCount = tasks.filter((t) => t.done).length;
    counter.textContent = `${doneCount} tasks done from ${tasks.length}`;
  }

  saveTasks();
}

// Делегування: обробляємо submit форми, навіть якщо сама форма додається пізніше HTMX
document.addEventListener("submit", function (e) {
  if (!e.target.matches(".todo-form")) return;
  e.preventDefault();

  const input = e.target.querySelector(".todo-form__input");
  if (!input) return;

  const text = input.value.trim();
  if (!text) return;

  tasks.push({ text, done: false });
  input.value = "";
  renderTasks();
});

// Делегування: обробляємо кліки по чекбоксах і по кнопках видалення
document.addEventListener("click", function (e) {
  // чекбокс
  const checkbox = e.target.closest(".todo-list__checkbox");
  if (checkbox) {
    const idx = Number(checkbox.dataset.index);
    if (!Number.isNaN(idx) && tasks[idx]) {
      tasks[idx].done = !tasks[idx].done;
      renderTasks();
    }
    return;
  }

  // кнопка видалення (може клікнути внутрішній текст — .closest забезпечує стабільність)
  const delBtn = e.target.closest(".todo-list__btn--delete");
  if (delBtn) {
    const idx = Number(delBtn.dataset.index);
    if (!Number.isNaN(idx) && tasks[idx]) {
      tasks.splice(idx, 1);
      renderTasks();
    }
  }
});

// Початковий рендер при DOMContentLoaded — може нічого не зробити, якщо HTMX ще не вставив partial-и
document.addEventListener("DOMContentLoaded", renderTasks);

// Додатково: коли HTMX щось підвантажує/заміє — повторно рендеримо (якщо HTMX використовується)
if (window.htmx) {
  // 'htmx:afterSwap' спрацьовує після того, як HTMX вставив новий контент у DOM
  document.body.addEventListener("htmx:afterSwap", function () {
    renderTasks();
  });
}
