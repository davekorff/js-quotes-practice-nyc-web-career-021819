document.addEventListener('DOMContentLoaded', () => {

  const BASE_URL = 'http://localhost:3000/quotes'

  //DOM elements:
  const quoteList = document.querySelector('#quote-list')
  const newQuoteForm = document.querySelector('#new-quote-form')
  const sortButton = document.querySelector('#sort-button')

  // --- FETCHES ---

  // fetch quotes
  const getQuotes = () => {
    return fetch(BASE_URL)
      .then(r => r.json())
  }


  // add a quote
  const addQuote = (quote, author) => {
    return fetch(BASE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        'quote': quote,
        'author': author,
        'likes': 0
      })
    })
    .then(r => r.json())
  }


  // add a like
  const addLike = (quoteId, likes) => {
    return fetch(BASE_URL + `/${quoteId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        'likes': likes + 1
      })
    })
    .then(r => r.json())
  }


  // delete a quote
  const deleteQuote = (quoteId) => {
    return fetch(BASE_URL + `/${quoteId}`, {
      method: 'DELETE'
    })
    .then(r => r.json())
  }

  // edit a quote
  const editQuote = (quoteId, quote, author) => {
    return fetch(BASE_URL + `/${quoteId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        'quote': quote,
        'author': author
      })
    })
    .then(r => r.json())
  }


  // --- ON PAGE LOAD ---

  // get quotes and append them to the DOM
  renderQuotes()

  function renderQuotes() {
    getQuotes()
      .then(json => {
        json.forEach(quote => {
          let li = document.createElement('li')
          li.setAttribute('class', 'quote-card')
          li.innerHTML = renderCard(quote)
          li.addEventListener('click', handleDelete)
          li.addEventListener('click', handleLike)
          li.addEventListener('click', handleEdit)
          quoteList.appendChild(li)
        })
      })
  }

  //render a single quote's inner HTML
  function renderCard(quote) {
    return `
      <blockquote class="blockquote">
        <p class="mb-0" data-id="${quote.id}">${quote.quote}</p>
        <footer class="blockquote-footer" data-id="${quote.id}">${quote.author}</footer>
        <br>
        <button class='btn-success' data-id="${quote.id}">Likes: <span>${quote.likes}</span></button>
        <button class='btn-success' data-id="${quote.id}">Edit</button>
        <button class='btn-danger' data-id="${quote.id}">Delete</button>
        </blockquote>
        <form id="edit-quote-form" data-id="${quote.id}" hidden>
          <div class="form-group">
            <label for="edit-quote">Edit Quote</label>
            <input name="edited-quote" type="text" class="form-control" id="edit-quote" value="${quote.quote}">
          </div>
          <div class="form-group">
            <label for="Author">Author</label>
            <input name="edited-quote-author" type="text" class="form-control" id="edit-author" value="${quote.author}">
          </div>
          <button type="submit" class="btn btn-primary" id="save-edited-quote">Save</button>
        <br>
        <br>
        <br>
        </form>
    `
  }


  // --- EVENT LISTENERS ---

  // User clicks on submit button to add a new quote
  newQuoteForm.addEventListener('submit', handleSubmit)
  sortButton.addEventListener('click', toggleSort)


  // --- EVENT DELEGATION ---

  function handleSubmit(e) {
    e.preventDefault()
    let quote = newQuoteForm.querySelector('#new-quote').value
    let author = newQuoteForm.querySelector('#author').value
    addQuote(quote, author)
      .then(newQuote => {
        if (!quote.error) {
          let li = document.createElement('li')
          li.setAttribute('class', 'quote-card')
          li.innerHTML = renderCard(newQuote)
          li.addEventListener('click', handleDelete)
          li.addEventListener('click', handleLike)
          li.addEventListener('click', handleEdit)
          quoteList.appendChild(li)
        }
      })
  }

  function handleEdit(e) {
    if (e.target.innerText === 'Edit') {
      let quoteId = e.target.dataset.id
      let editQuoteForm = document.querySelector(`form[data-id='${quoteId}']`)
      editQuoteForm.hidden = false


      editQuoteForm.addEventListener('submit', (e) => {
        e.preventDefault()
        let editedQuoteText = e.target.querySelector('input[name=edited-quote]').value
        let editedQuoteAuthor = e.target.querySelector('input[name=edited-quote-author]').value

        editQuote(quoteId, editedQuoteText, editedQuoteAuthor)

        document.querySelector(`p[data-id='${quoteId}']`).innerText = editedQuoteText
        document.querySelector(`footer[data-id='${quoteId}']`).innerText = editedQuoteAuthor

        editQuoteForm.hidden = true
      })
    }
  }

  function handleLike(e) {
    if (e.target.tagName === 'BUTTON' && e.target.innerText.includes('Likes')) {
      let quoteId = e.target.dataset.id
      let likes = e.target.querySelector('span')
      let numLikes = parseInt(likes.innerText)
      likes.innerText = numLikes + 1
      addLike(quoteId, numLikes)
    }
  }


  function handleDelete(e) {
    if (e.target.innerText === 'Delete') {
      let quoteId = e.target.dataset.id
      let block = e.target.parentNode
      block.parentNode.remove()
      deleteQuote(quoteId)
    }
  }

  function toggleSort(e) {
    if (e.target.innerText === 'Sort by author name: OFF') {
      e.target.innerText = 'Sort by author name: ON'
      quoteList.innerHTML = ''
      getQuotes()
        .then(json => {
          json.sort(function (a, b) {
            if (a.author.split(' ')[1] > b.author.split(' ')[1]) {
              return 1
            } else {
              return -1
            }
          }).forEach(quote => {
            let li = document.createElement('li')
            li.setAttribute('class', 'quote-card')
            li.innerHTML = renderCard(quote)
            li.addEventListener('click', handleDelete)
            li.addEventListener('click', handleLike)
            li.addEventListener('click', handleEdit)
            quoteList.appendChild(li)
          })
        })
    } else {
      e.target.innerText = 'Sort by author name: OFF'
      quoteList.innerHTML = ''
      renderQuotes()
    }
  }
})
