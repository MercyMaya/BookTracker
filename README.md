# 📚 BookTracker

**Live demo → [voxursa.com/booktracker](https://voxursa.com/booktracker)**  
A minimalist, framework-free web app for keeping tabs on your reading list – built with nothing but **vanilla JS**, **modern CSS**, and a clean **PHP 8 JSON API**.

[![MIT License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

---

## Features

- 🔒 Register / log in with secure PHP sessions
- ➕ Add books (Google Books ID optional)
- 🗂 Organise into **Want**, **Reading**, **Finished** lists
- 🎚 Update status, rating, review, pages-read in-place
- 🌗 Responsive design that respects dark mode
- 🛠 Zero JS/CSS frameworks – just browser APIs & modern CSS
- 🌎 Runs on any cheap LAMP shared host (e.g., DreamHost)

## Stack

| Layer      | Tech                                      |
| ---------- | ----------------------------------------- |
| Front-end  | HTML5 · CSS3 · ES2022 modules · Fetch API |
| Back-end   | PHP 8.2 (PSR-12) · PDO-MySQL              |
| Database   | MySQL 8 (“sql/initialize.sql”)            |
| Deployment | DreamHost shared hosting (Apache + PHP)   |

## Project structure

```text
public/         # static assets, HTML, CSS, JS modules
│  index.html
│  dashboard.html
│  css/styles.css
│  js/
│     api.js
│     auth.js
│     dashboard.js
│
api/            # pure-PHP JSON endpoints
│  config.example.php   # <- copy to config.php locally
│  auth/ (register, login, logout)
│  books/ (list, create, update, delete)
│
sql/initialize.sql
.gitignore
README.md
LICENSE
```
