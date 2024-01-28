const books = [];
let filteredBooks = [];
const RENDER_EVENT = "render-book";
const RENDER_FILTERED_EVENT = "render-filtered-book";
const SAVED_EVENT = "saved-book";
const STORAGE_KEY = "LIBRALINK_APPS";

function generateID() {
  return +new Date();
}

function generateBookObject(id, title, author, year, isComplete) {
  return {
    id,
    title,
    author,
    year,
    isComplete,
  };
}

function findBook(bookID) {
  return books.find((book) => book.id == bookID) || null;
}

function findBookIndex(bookID) {
  return books.findIndex((book) => book.id == bookID);
}

function showPopup(status) {
  const overlay = document.getElementById("overlay");
  overlay.style.display = "block";

  const popup = document.getElementById("popup");
  popup.classList.add("show-popup");

  const messages = {
    add: "Book Successfully Added!",
    update: "Book Successfully Updated!",
    delete: "Book Successfully Deleted!",
  };

  const popupMsg = document.querySelector("#popup>p");
  popupMsg.innerText = messages[status];
}

function closePopup() {
  const overlay = document.getElementById("overlay");
  overlay.style.display = "none";

  const popup = document.getElementById("popup");
  popup.classList.remove("show-popup");
}

function showConfirmPopup(bookTitle) {
  return new Promise((resolve, reject) => {
    const overlay = document.getElementById("overlay");
    overlay.style.display = "block";

    const confirmPopup = document.getElementById("confirm-popup");
    confirmPopup.classList.add("show-popup");

    const confirmMsg = document.querySelector("#confirm-popup>p");
    confirmMsg.innerText = `Delete the book "${bookTitle}"?`;

    const buttonOk = document.querySelector(".button-ok");
    const buttonCancel = document.querySelector(".button-popup-cancel");

    buttonOk.addEventListener("click", () => {
      resolve(true);
      closeConfirmPopup();
    });

    buttonCancel.addEventListener("click", () => {
      resolve(false);
      closeConfirmPopup();
    });

    resetFormInput();
  });
}

function closeConfirmPopup() {
  const overlay = document.getElementById("overlay");
  overlay.style.display = "none";

  const confirmPopup = document.getElementById("confirm-popup");
  confirmPopup.classList.remove("show-popup");
}

function resetFormInput() {
  const form = document.getElementById("input-book");
  form.reset();

  const formInputHeading = document.querySelector(".input-section>h2");
  formInputHeading.innerText = "Add New Book";

  const formButtonUpdate = document.getElementById("book-update-submit");
  formButtonUpdate.classList.add("hidden");

  const formButtonAdd = document.getElementById("book-add-submit");
  formButtonAdd.classList.remove("hidden");

  const inputSearch = document.getElementById("search-book-title");
  inputSearch.value = "";
}

function resetBookshelfList() {
  const incompleteBookshelfList = document.getElementById(
    "incomplete-bookshelf-list"
  );
  incompleteBookshelfList.innerHTML = "";

  const completeBookshelfList = document.getElementById(
    "complete-bookshelf-list"
  );
  completeBookshelfList.innerHTML = "";

  const titleIncompleteBookshelfList = document.createElement("h2");
  titleIncompleteBookshelfList.innerText = "Unfinished Reads";

  const titleCompleteBookshelfList = document.createElement("h2");
  titleCompleteBookshelfList.innerText = "Finished Reads";

  incompleteBookshelfList.append(titleIncompleteBookshelfList);
  completeBookshelfList.append(titleCompleteBookshelfList);

  return {
    incompleteBookshelfList,
    completeBookshelfList,
  };
}

function setFormUpdate(bookObject) {
  const formInputHeading = document.querySelector(".input-section>h2");
  formInputHeading.innerText = "Update Book";

  const bookID = document.getElementById("input-book-id");
  bookID.value = bookObject.id;

  const bookTitle = document.getElementById("input-book-title");
  bookTitle.value = bookObject.title;

  const bookAuthor = document.getElementById("input-book-author");
  bookAuthor.value = bookObject.author;

  const bookYear = document.getElementById("input-book-year");
  bookYear.value = bookObject.year;

  const bookIsComplete = document.getElementById("input-book-is-complete");
  if (bookObject.isComplete) {
    bookIsComplete.checked = true;
  } else {
    bookIsComplete.checked = false;
  }

  const formButtonAdd = document.getElementById("book-add-submit");
  formButtonAdd.classList.add("hidden");

  const formButtonUpdate = document.getElementById("book-update-submit");
  formButtonUpdate.classList.remove("hidden");
}

function getFormValue() {
  const generatedBookID = generateID();
  const bookTitle = document.getElementById("input-book-title").value;
  const bookAuthor = document.getElementById("input-book-author").value;
  const bookYear = parseInt(document.getElementById("input-book-year").value);
  const bookIsComplete = document.getElementById(
    "input-book-is-complete"
  ).checked;

  return {
    generatedBookID,
    bookTitle,
    bookAuthor,
    bookYear,
    bookIsComplete,
  };
}

function createBookElement(bookObject) {
  const elementTitle = document.createElement("h3");
  elementTitle.innerText = bookObject.title;

  const elementAuthorAndYear = document.createElement("p");
  elementAuthorAndYear.innerText = `${bookObject.author}, ${bookObject.year}`;

  const elementAction = document.createElement("div");
  elementAction.classList.add("action");

  const elementArticle = document.createElement("article");
  elementArticle.classList.add("book-item");
  elementArticle.append(elementTitle, elementAuthorAndYear, elementAction);

  if (bookObject.isComplete) {
    const unfinishedButton = document.createElement("button");
    unfinishedButton.classList.add("button-action", "undo");
    unfinishedButton.innerHTML = `<i class="ri-arrow-go-back-line"></i>`;

    unfinishedButton.addEventListener("click", () => {
      markAsUnfinished(bookObject.id);
    });

    elementAction.append(unfinishedButton);
  } else {
    const finishedButton = document.createElement("button");
    finishedButton.classList.add("button-action", "check");
    finishedButton.innerHTML = `<i class="ri-check-line"></i>`;

    finishedButton.addEventListener("click", () => {
      markAsFinished(bookObject.id);
    });

    elementAction.append(finishedButton);
  }

  const updateBookButton = document.createElement("button");
  updateBookButton.classList.add("button-action", "update");
  updateBookButton.innerHTML = `<i class="ri-pencil-line"></i>`;

  updateBookButton.addEventListener("click", () => {
    setFormUpdate(bookObject);
  });

  const deleteBookButton = document.createElement("button");
  deleteBookButton.classList.add("button-action", "delete");
  deleteBookButton.innerHTML = `<i class="ri-delete-bin-line"></i>`;

  deleteBookButton.addEventListener("click", async () => {
    const deleteConfirmed = await showConfirmPopup(bookObject.title);

    if (deleteConfirmed) {
      deleteBook(bookObject.id);
    }
  });

  elementAction.append(updateBookButton, deleteBookButton);

  return elementArticle;
}

function isStorageExist() {
  if (typeof Storage === "undefined") {
    alert("Browser kamu tidak mendukung local storage");
    return false;
  }

  return true;
}

function loadDataFromStorage() {
  const dataStored = localStorage.getItem(STORAGE_KEY);
  const dataParsed = JSON.parse(dataStored);

  if (dataParsed !== null) {
    for (const book of dataParsed) {
      books.push(book);
    }
  }

  document.dispatchEvent(new Event(RENDER_EVENT));
}

function saveData() {
  if (isStorageExist()) {
    const parsed = JSON.stringify(books);

    localStorage.setItem(STORAGE_KEY, parsed);
    document.dispatchEvent(new Event(SAVED_EVENT));
  }
}

function addBook() {
  const { generatedBookID, bookTitle, bookAuthor, bookYear, bookIsComplete } =
    getFormValue();

  const bookObject = generateBookObject(
    generatedBookID,
    bookTitle,
    bookAuthor,
    bookYear,
    bookIsComplete
  );

  books.push(bookObject);

  saveData();
  showPopup("add");
  resetFormInput();
  document.dispatchEvent(new Event(RENDER_EVENT));
}

function markAsFinished(bookID) {
  const bookTarget = findBook(bookID);

  if (bookTarget == null) return;

  bookTarget.isComplete = true;

  saveData();
  resetFormInput();
  document.dispatchEvent(new Event(RENDER_EVENT));
}

function markAsUnfinished(bookID) {
  const bookTarget = findBook(bookID);

  if (bookTarget == null) return;

  bookTarget.isComplete = false;

  saveData();
  resetFormInput();
  document.dispatchEvent(new Event(RENDER_EVENT));
}

function updateBook(bookID) {
  const { bookTitle, bookAuthor, bookYear, bookIsComplete } = getFormValue();

  const bookTarget = findBookIndex(bookID);

  if (bookTarget === -1) return;

  books[bookTarget] = {
    id: parseInt(bookID),
    title: bookTitle,
    author: bookAuthor,
    year: bookYear,
    isComplete: bookIsComplete,
  };

  saveData();
  showPopup("update");
  resetFormInput();
  document.dispatchEvent(new Event(RENDER_EVENT));
}

function deleteBook(bookID) {
  const bookTarget = findBookIndex(bookID);

  if (bookTarget === -1) return;

  books.splice(bookTarget, 1);

  saveData();
  showPopup("delete");
  resetFormInput();
  document.dispatchEvent(new Event(RENDER_EVENT));
}

function searchBooks() {
  const searchInput = document.getElementById("search-book-title").value;

  filteredBooks = books.filter((book) => {
    return book.title.toLowerCase().includes(searchInput.toLowerCase());
  });

  document.dispatchEvent(new Event(RENDER_FILTERED_EVENT));
}

document.addEventListener(SAVED_EVENT, () => {
  console.log(localStorage.getItem(STORAGE_KEY));
});

document.addEventListener(RENDER_EVENT, () => {
  const { incompleteBookshelfList, completeBookshelfList } =
    resetBookshelfList();

  for (const bookItem of books) {
    const bookElement = createBookElement(bookItem);

    if (!bookItem.isComplete) {
      incompleteBookshelfList.append(bookElement);
    } else {
      completeBookshelfList.append(bookElement);
    }
  }
});

document.addEventListener(RENDER_FILTERED_EVENT, () => {
  const { incompleteBookshelfList, completeBookshelfList } =
    resetBookshelfList();

  for (const bookItem of filteredBooks) {
    const bookElement = createBookElement(bookItem);
    if (!bookItem.isComplete) {
      incompleteBookshelfList.append(bookElement);
    } else {
      completeBookshelfList.append(bookElement);
    }
  }
});

document.addEventListener("DOMContentLoaded", () => {
  const inputHiddenID = document.getElementById("input-book-id");
  const submitBook = document.getElementById("input-book");
  const searchInputField = document.getElementById("search-book-title");

  submitBook.addEventListener("submit", (event) => {
    event.preventDefault();

    const hiddenIDValue = inputHiddenID.value;

    if (hiddenIDValue != "") {
      updateBook(hiddenIDValue);
    } else {
      addBook();
    }
  });

  searchInputField.addEventListener("input", () => {
    searchBooks();
  });

  if (isStorageExist()) {
    loadDataFromStorage();
  }
});
