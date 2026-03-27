let notes = JSON.parse(localStorage.getItem("notes")) || [];
let editingIndex = null;
let currentFilter = "All";
let sortPinnedFirst = true;
let unlockIndex = null;

const titleInput = document.getElementById("title");
const categoryInput = document.getElementById("category");
const contentInput = document.getElementById("content");
const saveBtn = document.getElementById("saveBtn");
const resetBtn = document.getElementById("resetBtn");
const clearAllBtn = document.getElementById("clearAllBtn");
const notesGrid = document.getElementById("notesGrid");
const searchInput = document.getElementById("searchInput");
const sortBtn = document.getElementById("sortBtn");
const totalNotes = document.getElementById("totalNotes");
const pinnedNotes = document.getElementById("pinnedNotes");
const categoryCount = document.getElementById("categoryCount");
const protectedCount = document.getElementById("protectedCount");
const themeToggle = document.getElementById("themeToggle");
const toast = document.getElementById("toast");
const chips = document.querySelectorAll(".chip");

const isProtected = document.getElementById("isProtected");
const notePassword = document.getElementById("notePassword");

const passwordModal = document.getElementById("passwordModal");
const unlockPassword = document.getElementById("unlockPassword");
const unlockBtn = document.getElementById("unlockBtn");
const closeModalBtn = document.getElementById("closeModalBtn");

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 2200);
}

function saveNotes() {
  localStorage.setItem("notes", JSON.stringify(notes));
  renderNotes();
}

function resetForm() {
  titleInput.value = "";
  categoryInput.value = "All";
  contentInput.value = "";
  isProtected.checked = false;
  notePassword.value = "";
  editingIndex = null;
  saveBtn.textContent = "💾 Save Note";
}

function addOrUpdateNote() {
  const title = titleInput.value.trim();
  const category = categoryInput.value;
  const content = contentInput.value.trim();
  const protectedNote = isProtected.checked;
  const password = notePassword.value.trim();

  if (!title || !content || category === "All") {
    showToast("Please fill all fields!");
    return;
  }

  if (protectedNote && !password) {
    showToast("Please enter password for protected note!");
    return;
  }

  const note = {
    title,
    category,
    content,
    pinned: editingIndex !== null ? notes[editingIndex].pinned : false,
    protected: protectedNote,
    password: protectedNote ? password : ""
  };

  if (editingIndex !== null) {
    notes[editingIndex] = note;
    showToast("Note updated successfully!");
  } else {
    notes.unshift(note);
    showToast("Note saved successfully!");
  }

  saveNotes();
  resetForm();
}

function renderNotes() {
  let filtered = [...notes];

  const search = searchInput.value.toLowerCase();

  if (currentFilter !== "All") {
    filtered = filtered.filter(note => note.category === currentFilter);
  }

  if (search) {
    filtered = filtered.filter(note =>
      note.title.toLowerCase().includes(search) ||
      note.content.toLowerCase().includes(search)
    );
  }

  if (sortPinnedFirst) {
    filtered.sort((a, b) => b.pinned - a.pinned);
  }

  notesGrid.innerHTML = "";

  if (filtered.length === 0) {
    notesGrid.innerHTML = `
      <div class="note-card">
        <h3>No notes found</h3>
        <p class="note-content">Try creating a new note or changing your search/filter.</p>
      </div>
    `;
  }

  filtered.forEach(note => {
    const originalIndex = notes.indexOf(note);

    notesGrid.innerHTML += `
      <div class="note-card">
        <div class="note-top">
          <div>
            <div class="note-title">${note.pinned ? "📌 " : ""}${note.title}</div>
            <div class="note-category">${note.category}</div>
          </div>
          <div>${note.protected ? "🔐" : "📝"}</div>
        </div>

        <div class="note-content">
          ${note.protected ? "This note is protected. Click Unlock to view content." : note.content}
        </div>

        <div class="note-actions">
          <button class="action-btn pin" onclick="togglePin(${originalIndex})">${note.pinned ? "Unpin" : "Pin"}</button>
          <button class="action-btn edit" onclick="editNote(${originalIndex})">Edit</button>
          <button class="action-btn delete" onclick="deleteNote(${originalIndex})">Delete</button>
          ${note.protected ? `<button class="action-btn lock" onclick="openProtectedNote(${originalIndex})">Unlock</button>` : ""}
        </div>
      </div>
    `;
  });

  totalNotes.textContent = notes.length;
  pinnedNotes.textContent = notes.filter(n => n.pinned).length;
  protectedCount.textContent = notes.filter(n => n.protected).length;
  categoryCount.textContent = filtered.length;
}

function togglePin(index) {
  notes[index].pinned = !notes[index].pinned;
  saveNotes();
  showToast(notes[index].pinned ? "Note pinned!" : "Note unpinned!");
}

function editNote(index) {
  const note = notes[index];

  if (note.protected) {
    showToast("Protected note can't be edited directly. Unlock/view it first.");
  }

  titleInput.value = note.title;
  categoryInput.value = note.category;
  contentInput.value = note.content;
  isProtected.checked = note.protected;
  notePassword.value = note.password || "";
  editingIndex = index;
  saveBtn.textContent = "✏️ Update Note";
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function deleteNote(index) {
  if (confirm("Are you sure you want to delete this note?")) {
    notes.splice(index, 1);
    saveNotes();
    showToast("Note deleted!");
  }
}

function openProtectedNote(index) {
  unlockIndex = index;
  passwordModal.classList.remove("hidden");
  unlockPassword.value = "";
  unlockPassword.focus();
}

unlockBtn.addEventListener("click", () => {
  const entered = unlockPassword.value.trim();
  const note = notes[unlockIndex];

  if (entered === note.password) {
    alert(`🔓 ${note.title}\n\n${note.content}`);
    passwordModal.classList.add("hidden");
    showToast("Protected note unlocked!");
  } else {
    showToast("Wrong password!");
  }
});

closeModalBtn.addEventListener("click", () => {
  passwordModal.classList.add("hidden");
});

function clearAllNotes() {
  if (confirm("Delete all notes permanently?")) {
    notes = [];
    saveNotes();
    resetForm();
    showToast("All notes cleared!");
  }
}

saveBtn.addEventListener("click", addOrUpdateNote);
resetBtn.addEventListener("click", resetForm);
clearAllBtn.addEventListener("click", clearAllNotes);
searchInput.addEventListener("input", renderNotes);

sortBtn.addEventListener("click", () => {
  sortPinnedFirst = !sortPinnedFirst;
  sortBtn.textContent = sortPinnedFirst ? "⭐ Sort: Pinned First" : "🕒 Sort: Normal";
  renderNotes();
});

chips.forEach(chip => {
  chip.addEventListener("click", () => {
    chips.forEach(c => c.classList.remove("active"));
    chip.classList.add("active");
    currentFilter = chip.dataset.filter;
    renderNotes();
  });
});

themeToggle.addEventListener("click", () => {
  document.body.classList.toggle("dark");
  localStorage.setItem("theme", document.body.classList.contains("dark") ? "dark" : "light");
});

if (localStorage.getItem("theme") === "dark") {
  document.body.classList.add("dark");
}

renderNotes();