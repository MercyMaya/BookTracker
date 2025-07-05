/**
 * dashboard.js – lists, adds, updates, deletes books for the logged-in user
 */
import { api } from './api.js';

const lists = {
  want:     document.getElementById('want'),
  reading:  document.getElementById('reading'),
  finished: document.getElementById('finished')
};

/* ---------- RENDER ---------- */
async function loadBooks () {
  const books = await api('/books/list.php');
  Object.values(lists).forEach(ul => ul.innerHTML = '');

  books.forEach(b => {
    const li = document.createElement('li');
    li.className = 'book';
    li.dataset.id = b.id;
    li.innerHTML = `
      <img src="${b.cover_url || ''}" alt="">
      <span>${b.title}${b.author ? ` – ${b.author}` : ''}</span>
      <select class="status">
        <option value="want"    ${b.status==='want'    ?'selected':''}>Want</option>
        <option value="reading" ${b.status==='reading' ?'selected':''}>Reading</option>
        <option value="finished"${b.status==='finished'?'selected':''}>Finished</option>
      </select>
      <button class="delete" title="Remove">&times;</button>`;
    lists[b.status].appendChild(li);
  });
}

/* ---------- ADD ---------- */
document.getElementById('fabAdd')
  .addEventListener('click', () => document.getElementById('addDialog').showModal());

/* --- Google Books live search --- */
const searchBox      = document.getElementById('searchBook');
const resultsList    = document.getElementById('searchResults');
const addBtn         = document.getElementById('addBtn');
const hiddenFields   = ['google_id','title','author','cover_url','description']
                         .reduce((o,k)=>({ ...o, [k]:document.querySelector(`[name=${k}]`) }),{});

let searchTimer;
searchBox.addEventListener('input', () => {
  clearTimeout(searchTimer);
  const q = searchBox.value.trim();
  if (q.length < 3) { resultsList.innerHTML=''; return; }
  searchTimer = setTimeout(() => googleSearch(q), 400);
});

async function googleSearch (query) {
  resultsList.innerHTML = '<li>Searching…</li>';
  try {
    const res = await fetch(`https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&maxResults=5`);
    const { items=[] } = await res.json();
    if (!items.length) { resultsList.innerHTML = '<li>No results</li>'; return; }

    /* render results */
    resultsList.innerHTML = items.map(item => {
      const info = item.volumeInfo;
      return `<li class="result" data-id="${item.id}"
                 data-title="${info.title}"
                 data-author="${(info.authors||[]).join(', ')}"
                 data-cover="${(info.imageLinks||{}).thumbnail||''}"
                 data-desc="${info.description||''}">
                ${info.title}${info.authors?` – <em>${info.authors[0]}</em>`:''}
              </li>`;
    }).join('');
  } catch { resultsList.innerHTML = '<li>Error contacting Google</li>'; }
}

/* choose a book from results */
resultsList.addEventListener('click', e=>{
  const li = e.target.closest('li.result');
  if (!li) return;
  hiddenFields.google_id.value  = li.dataset.id;
  hiddenFields.title.value      = li.dataset.title;
  hiddenFields.author.value     = li.dataset.author;
  hiddenFields.cover_url.value  = li.dataset.cover;
  hiddenFields.description.value= li.dataset.desc;
  addBtn.disabled = false;
  searchBox.value = li.dataset.title;       // show chosen title
  resultsList.innerHTML = '';               // clear list
});

/* submit */
document.getElementById('addForm').addEventListener('submit', async e => {
  e.preventDefault();
  if (!hiddenFields.google_id.value) return;   // safety guard
  const payload = Object.fromEntries(new FormData(e.target));
  try {
    await api('/books/create.php', 'POST', payload);
    loadBooks();
    e.target.closest('dialog').close();
    e.target.reset();                  // clear form for next use
    addBtn.disabled = true;
  } catch (err) { alert(err.message); }
});

/* ---------- UPDATE + DELETE via event delegation ---------- */
document.getElementById('bookLists').addEventListener('change', async e => {
  if (!e.target.matches('select.status')) return;
  const id     = e.target.closest('li.book').dataset.id;
  const status = e.target.value;
  try {
    await api('/books/update.php', 'PUT', { id, status });
    loadBooks();                    // re-render lists
  } catch (err) { alert(err.message); }
});

document.getElementById('bookLists').addEventListener('click', async e => {
  if (!e.target.matches('button.delete')) return;
  const id = e.target.closest('li.book').dataset.id;
  if (!confirm('Remove this book from your list?')) return;
  try {
    await api('/books/delete.php', 'DELETE', { id });
    loadBooks();
  } catch (err) { alert(err.message); }
});

/* ---------- LOGOUT ---------- */
document.getElementById('logout').onclick = () =>
  api('/auth/logout.php').then(() => (location.href = 'index.html'));

/* FIRST LOAD */
loadBooks();
