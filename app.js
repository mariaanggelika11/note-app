class BookInputForm extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
      <h2>Masukkan Catatan Baru</h2>
      <form id="inputCatatan">
        <div class="input">
          <label for="inputBookTitle">Judul</label>
          <input id="inputBookTitle" type="text" required />
        </div>
        <div class="input">
          <label for="inputBookAuthor">Penulis</label>
          <input id="inputBookAuthor" type="text" required />
        </div>
        <div class="input">
          <label for="inputBookYear">Tahun</label>
          <input id="inputBookYear" type="number" required />
        </div>
        <div class="input_inline">
          <label for="inputBookIsComplete">Selesai dibaca</label>
          <input id="inputBookIsComplete" type="checkbox" />
        </div>
        <button id="bookSubmit" type="submit">Masukkan Buku ke rak <span>Belum selesai dibaca</span></button>
      </form>
    `;
  }
}

class BookSearchForm extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
      <h2>Cari Buku</h2>
      <form id="searchBook">
        <label for="searchBookTitle">Judul</label>
        <input id="searchBookTitle" type="text" />
        <button id="searchSubmit" type="submit">Cari</button>
      </form>
    `;
  }
}

class IncompleteBookShelf extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
      <h2>Belum selesai dibaca</h2>
      <div id="incompleteBookshelfList" class="book_list"></div>
    `;
  }
}

class CompleteBookShelf extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
      <h2>Selesai dibaca</h2>
      <div id="completeBookshelfList" class="book_list"></div>
    `;
  }
}

customElements.define("book-input-form", BookInputForm);
customElements.define("book-search-form", BookSearchForm);
customElements.define("incomplete-book-shelf", IncompleteBookShelf);
customElements.define("complete-book-shelf", CompleteBookShelf);

document.addEventListener("DOMContentLoaded", function () {
  const BOOKS_KEY = "books";
  let books = [];

  function saveBooks() {
    localStorage.setItem(BOOKS_KEY, JSON.stringify(books));
  }

  function loadBooks() {
    const booksString = localStorage.getItem(BOOKS_KEY);
    const savedBooks = JSON.parse(booksString);
    if (savedBooks) {
      books = savedBooks;
      renderBooks();
    }
  }

  function addBookToShelf(title, author, year, isComplete) {
    const yearNumeric = parseInt(year, 10);

    const newBook = {
      id: +new Date(),
      title,
      author,
      year: yearNumeric,
      isComplete,
    };
    books.push(newBook);
    saveBooks();
    renderBooks();
  }

  function renderBooks(filteredBooks = null) {
    const incompleteBookshelfList = document.getElementById("incompleteBookshelfList");
    const completeBookshelfList = document.getElementById("completeBookshelfList");

    incompleteBookshelfList.innerHTML = "";
    completeBookshelfList.innerHTML = "";

    const booksToRender = filteredBooks || books;

    if (booksToRender.length === 0) {
      document.getElementById("noResultsMessage").innerText = "Tidak ada hasil yang ditemukan.";
    } else {
      document.getElementById("noResultsMessage").innerText = "";

      booksToRender.forEach((book) => {
        const bookItem = createBookItemElement(book);
        if (book.isComplete) {
          completeBookshelfList.appendChild(bookItem);
        } else {
          incompleteBookshelfList.appendChild(bookItem);
        }
      });
    }
  }

  function createBookItemElement(book) {
    const bookItem = document.createElement("article");
    bookItem.classList.add("book_item");
    bookItem.innerHTML = `
      <h3>${book.title}</h3>
      <p>Penulis: ${book.author}</p>
      <p>Tahun: ${book.year}</p>
      <div class="action"></div>
    `;

    const actionDiv = bookItem.querySelector(".action");

    const deleteButton = document.createElement("button");
    deleteButton.classList.add("red");
    deleteButton.innerText = "Hapus buku";
    deleteButton.addEventListener("click", () => {
      if (confirm("Apakah Anda yakin ingin menghapus buku ini?")) {
        deleteBook(book.id);
      }
    });
    actionDiv.appendChild(deleteButton);

    if (book.isComplete) {
      const undoButton = document.createElement("button");
      undoButton.classList.add("green");
      undoButton.innerText = "Belum dibaca";
      undoButton.addEventListener("click", () => {
        moveToIncomplete(book.id);
      });
      actionDiv.appendChild(undoButton);
    } else {
      const checkButton = document.createElement("button");
      checkButton.classList.add("green");
      checkButton.innerText = "Selesai dibaca";
      checkButton.addEventListener("click", () => {
        moveToComplete(book.id);
      });
      actionDiv.appendChild(checkButton);
    }

    return bookItem;
  }

  function deleteBook(id) {
    books = books.filter((book) => book.id !== id);
    saveBooks();
    renderBooks();
  }

  function moveToIncomplete(id) {
    const book = books.find((book) => book.id === id);
    if (book) {
      book.isComplete = false;
      saveBooks();
      renderBooks();
    }
  }

  function moveToComplete(id) {
    const book = books.find((book) => book.id === id);
    if (book) {
      book.isComplete = true;
      saveBooks();
      renderBooks();
    }
  }

  const inputBookForm = document.getElementById("inputBook");
  inputBookForm.addEventListener("submit", function (event) {
    event.preventDefault();
    const title = document.getElementById("inputBookTitle").value;
    const author = document.getElementById("inputBookAuthor").value;
    const year = document.getElementById("inputBookYear").value;
    const isComplete = document.getElementById("inputBookIsComplete").checked;
    addBookToShelf(title, author, year, isComplete);
    inputBookForm.reset();
  });

  loadBooks();
});
