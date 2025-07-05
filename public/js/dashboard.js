/**
 * dashboard.js – dashboard with horizontal masonry columns,
 * centered & resizable modal, trash icons, and labeled FAB.
 */
import { api } from './api.js';

// CACHE DOM NODES
const lists = {
  want:     document.getElementById('want'),
  reading:  document.getElementById('reading'),
  finished: document.getElementById('finished'),
};
const fabAdd    = document.getElementById('fabAdd');
const addDialog = document.getElementById('addDialog');
const searchBox   = document.getElementById('searchBook');
const resultsList = document.getElementById('searchResults');
const addBtn      = document.getElementById('addBtn');
const hiddenFields = ['google_id','title','author','cover_url','description']
  .reduce((o, name) => {
    o[name] = document.querySelector(`input[name=${name}]`);
    return o;
  }, {});

// RENDER EXISTING BOOKS
async function loadBooks() {
  try {
    const books = await api('/books/list.php');
    Object.values(lists).forEach(ul => (ul.innerHTML = ''));
    books.forEach(book => {
      const li = document.createElement('li');
      li.className = 'book';
      li.dataset.id = book.id;
      li.innerHTML = `
        <img src="${book.cover_url||''}" alt="Cover of ${book.title}">
        <div class="info">
          <span class="book-title">${book.title}</span>
          ${book.author?`<span class="book-author">– ${book.author}</span>`:''}
        </div>
        <select class="status">
          <option value="want"     ${book.status==='want'    ?'selected':''}>Want</option>
          <option value="reading"  ${book.status==='reading' ?'selected':''}>Reading</option>
          <option value="finished" ${book.status==='finished'?'selected':''}>Finished</option>
        </select>
        <button class="delete" title="Remove book">
          <svg viewBox="0 0 24 24">
            <path d="M3 6h18v2H3zm2 3h14l-1 12H6L5 9zm3-6h6v2H8V3z"/>
          </svg>
        </button>
      `;
      lists[book.status].appendChild(li);
    });
  } catch (e) {
    console.error('Load error:', e);
    alert('Could not load books.');
  }
}
loadBooks();

// SHOW “ADD BOOK” MODAL
fabAdd.addEventListener('click', () => {
  addDialog.showModal();
  searchBox.value = '';
  resultsList.innerHTML = '';
  addBtn.disabled = true;
});

// DEBOUNCED LIVE SEARCH
let timer;
searchBox.addEventListener('input', () => {
  clearTimeout(timer);
  if (searchBox.value.trim().length < 3) {
    resultsList.innerHTML = '';
    return;
  }
  timer = setTimeout(() => googleSearch(searchBox.value.trim()), 400);
});

// GOOGLE BOOKS QUERY
async function googleSearch(q) {
  resultsList.innerHTML = '<li class="loading">Searching…</li>';
  try {
    const res = await fetch(
      `https://www.googleapis.com/books/v1/volumes?` +
      `q=${encodeURIComponent(q)}&maxResults=20`
    );
    const { items=[] } = await res.json();
    if (!items.length) {
      resultsList.innerHTML = '<li class="no-results">No matches</li>';
      return;
    }
    resultsList.innerHTML = items.map(item => {
      const info = item.volumeInfo;
      return `
        <li class="result card"
            data-id="${item.id}"
            data-title="${info.title}"
            data-author="${(info.authors||[]).join(', ')}"
            data-cover="${info.imageLinks?.thumbnail||''}"
            data-desc="${info.description||''}">
          <img src="${info.imageLinks?.thumbnail||''}" alt="">
          <span class="title">${info.title}</span>
          ${info.authors?`<em class="author">${info.authors[0]}</em>`:''}
        </li>
      `;
    }).join('');
  } catch (err) {
    console.error('Search error:', err);
    resultsList.innerHTML = '<li class="error">Error searching</li>';
  }
}

// SELECT RESULT → ENABLE “ADD BOOK”
resultsList.addEventListener('click', e => {
  const li = e.target.closest('li.result');
  if (!li) return;
  hiddenFields.google_id.value   = li.dataset.id;
  hiddenFields.title.value       = li.dataset.title;
  hiddenFields.author.value      = li.dataset.author;
  hiddenFields.cover_url.value   = li.dataset.cover;
  hiddenFields.description.value = li.dataset.desc;
  addBtn.disabled = false;
  searchBox.value = li.dataset.title;
  resultsList.innerHTML = '';
});

// SUBMIT NEW BOOK
document.getElementById('addForm').addEventListener('submit', async e => {
  e.preventDefault();
  const payload = Object.fromEntries(new FormData(e.target));
  try {
    await api('/books/create.php','POST',payload);
    loadBooks();
    e.target.closest('dialog').close();
    e.target.reset();
    addBtn.disabled = true;
  } catch (err) {
    console.error('Add error:', err);
    alert('Could not add book.');
  }
});

// UPDATE STATUS & DELETE
const container = document.getElementById('bookLists');
container.addEventListener('change', async e => {
  if (!e.target.matches('select.status')) return;
  const li = e.target.closest('li.book');
  await api('/books/update.php','PUT',{ id: li.dataset.id, status: e.target.value });
  loadBooks();
});
container.addEventListener('click', async e => {
  if (!e.target.closest('button.delete')) return;
  const id = e.target.closest('li.book').dataset.id;
  if (!confirm('Remove this book?')) return;
  await api('/books/delete.php','DELETE',{ id });
  loadBooks();
});

// LOGOUT
document.getElementById('logout').onclick = () =>
  api('/auth/logout.php').then(() => location.href = 'index.html');


// —── Collapse / Expand Sections ─────────────────────────────────────────
document.querySelectorAll('button.toggle').forEach(btn => {
  btn.addEventListener('click', () => {
    const section = document.getElementById(btn.dataset.target);
    // hide/show the UL
    section.style.display = section.style.display === 'none' ? '' : 'none';
    btn.classList.toggle('collapsed');
  });
});

// —── Live Filter Across All Sections ────────────────────────────────────
const filterInput = document.getElementById('bookFilter');
filterInput.addEventListener('input', () => {
  const term = filterInput.value.trim().toLowerCase();
  // look through every book title + author
  document.querySelectorAll('li.book').forEach(li => {
    const text = li.textContent.toLowerCase();
    li.style.display = text.includes(term) ? '' : 'none';
  });
});
