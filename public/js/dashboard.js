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

document.getElementById('addForm').addEventListener('submit', async e => {
  e.preventDefault();
  const payload = Object.fromEntries(new FormData(e.target));
  try {
    await api('/books/create.php', 'POST', payload);
    loadBooks();
    e.target.closest('dialog').close();
  } catch (err) {
    alert(err.message);
  }
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
