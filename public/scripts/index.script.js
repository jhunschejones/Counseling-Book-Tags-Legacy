// defining global variables (try to keep this list short Jones)
var allBooks
var tagElements

function getAllBooks(handleData) {
  $("#results-for-this-letter").html('')
  $.ajax({
    method: "GET",
    url: "/api/v1/book",
    success: function(data) {
      handleData(data)
    }
  })
}  
// sets book data returned from database to a variable without making the call synchronous
// though the asynchronous nature of this script breaks down to synchronous function calls
// pretty fast
getAllBooks(function(output) {
  allBooks = output
  populateTags()
  tagElements = document.getElementsByClassName("tag")
})

function populateTags() {
  let allTags = []
  allBooks.forEach(book => {
    book.tags.forEach(tag => {
      if (allTags.indexOf(tag) == -1) {
        allTags.push(tag)
      }
    })
  })

  // case-insensitive alphabetical sort, does not change data
  allTags.sort(function (a, b) {
    return a.toLowerCase().localeCompare(b.toLowerCase());
  })

  allTags.forEach(tag => {
    let letter = tag.charAt(0).toLowerCase()
    let displayTag
    if (tag.length > 40) { displayTag = truncate(tag, 40) }
    else { displayTag = tag }
    
    $(`#${letter}-results`).append(`<button class="tag badge badge-pill" value="${tag}">${displayTag}</button>`)
    $(`#${letter}-results`).show()
    $(`#all-${letter}-results`).append(`<button class="tag badge badge-pill" value="${tag}">${displayTag}</button>`)
    $(`#all-${letter}-results`).show()
  });
  alphabetFilter()

  // ====== Add event listener to each tag ======
  // calling here so all tags are on the page before it is called
  $(".tag").on("click", function() { window.location.href = "/results?tags=" + $(this).attr("value").replace(/,/g, '%2C') })
}

function searchFilter() {
  userInput = document.getElementById("user-search-input").value.toUpperCase()
  // if you remove all spaces and there is nothing in the input field then set all 
  // buttons to visible. This addresses empty searches and is used later to display 
  // all buttons when the box is blank
  if (userInput.trim().length == 0){
    for (var i = 0; i < tagElements.length; i++){
      tagElements[i].style.display = ""
    }
  } else {
    for (var i = 0; i < tagElements.length; i++) {
      if (tagElements[i].value.toUpperCase().indexOf(userInput)!= -1) {
        tagElements[i].style.display = ""
      } else {
        tagElements[i].style.display = "none"
      }
    }
  }
}

function alphabetFilter(evt) {
  $('#all-columns').hide()
  $('#alphabet-columns').show()

  // ====== Clear Filter Input ======
  let searchInput = document.getElementById("user-search-input")
  if (searchInput.value.trim()) { 
    searchInput.value = ""
    searchFilter()
  }

  let letters
  let defaultLetters = sessionStorage.getItem("alphabetSelection") || ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z"]

  if (evt) { 
    letters = evt.target.letters 
    sessionStorage.setItem("alphabetSelection", letters) 
    toggleSelectedFilter(evt)
    setPageContentLabel(letters)
  } else { 
    letters = defaultLetters 
    sessionStorage.setItem("alphabetSelection", letters) 
    if (letters.length > 5) {
      allFilter()
      setPageContentLabel(letters)
    } else {
      toggleSelectedFilter()
      setPageContentLabel(letters)
    }
  } 

  let alphabetResults = document.getElementsByClassName("alphabet-results")

  for (let index = 0; index < alphabetResults.length; index++) {
    const element = alphabetResults[index]
    element.style.display = "none"

    for (let index = 0; index < letters.length; index++) {
      const letter = letters[index];

      if (element.id.charAt(0) == letter) {
        element.style.display = ""
      } 
    }     
  }
}

function allFilter(evt) {
  $('#all-columns').show()
  $('#alphabet-columns').hide()

  // ====== Clear Filter Input ======
  let searchInput = document.getElementById("user-search-input")
  if (searchInput.value.trim()) { 
    searchInput.value = ""
    searchFilter()
  }

  if (evt) {
    let letters = evt.target.letters 
    sessionStorage.setItem("alphabetSelection", letters) 
    toggleSelectedFilter(evt)
    setPageContentLabel(letters)
  } else {
    toggleSelectedFilter()
    let letters = sessionStorage.getItem("alphabetSelection") || ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z"]
    setPageContentLabel()
  }
}

function toggleSelectedFilter(evt) {
  if (evt) {
    let selected = document.getElementsByClassName("selected-filter")
    if (selected) {
      for (let index = 0; index < selected.length; index++) {
        const element = selected[index];
        element.classList.remove("selected-filter")         
      }
    }

    evt.target.classList.add("selected-filter")
  } else {
    let defaultLetters = sessionStorage.getItem("alphabetSelection") || ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z"]
    if (defaultLetters.length < 5) {
      document.getElementById(`books-${defaultLetters[0]}-${defaultLetters[2]}-nav`).classList.add("selected-filter")
    } else {
      document.getElementById('books-all-nav').classList.add("selected-filter")
    }
  }
}

function setPageContentLabel(input) {
  let letters = input || sessionStorage.getItem("alphabetSelection") || ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z"]

  if (letters.length < 5) {
    let firstLetter = letters[0].toUpperCase()
    let secondLetter = letters[1].toUpperCase()
    if (secondLetter == "-" || secondLetter == ",") { secondLetter = letters[2].toUpperCase() }

    $('#page-content-label').text(`Book Tags: ${firstLetter} - ${secondLetter}`)
    document.getElementById("user-search-input").placeholder = `Filter tags ${firstLetter.toLowerCase()} - ${secondLetter.toLowerCase()}...`
  } else {
    $('#page-content-label').text(`Book Tags: All`)
    document.getElementById("user-search-input").placeholder = `Filter all tags...`
  }
}

function truncate(str, len){
  // set up the substring
  var subString = str.substr(0, len-1);
  
  return (
    // add elipse after last complete word
    subString.substr(0, subString.lastIndexOf(' '))
    // trim trailing comma
    .replace(/(^[,\s]+)|([,\s]+$)/g, '') + '...'
  )
}

// ========= Add event listeners =========
// =======================================
document.getElementById("user-search-input").addEventListener("input", searchFilter)
let alltags_nav = document.getElementById("books-all-nav")
alltags_nav.addEventListener("click", allFilter)
alltags_nav.letters = ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z"]
let ab_nav = document.getElementById("books-a-b-nav")
ab_nav.addEventListener("click", alphabetFilter)
ab_nav.letters = ["a", "b"]
let cd_nav = document.getElementById("books-c-d-nav")
cd_nav.addEventListener("click", alphabetFilter)
cd_nav.letters = ["c", "d"]
let ef_nav = document.getElementById("books-e-f-nav")
ef_nav.addEventListener("click", alphabetFilter)
ef_nav.letters = ["e", "f"]
let gh_nav = document.getElementById("books-g-h-nav")
gh_nav.addEventListener("click", alphabetFilter)
gh_nav.letters = ["g", "h"]
let ij_nav = document.getElementById("books-i-j-nav")
ij_nav.addEventListener("click", alphabetFilter)
ij_nav.letters = ["i", "j"]
let kl_nav = document.getElementById("books-k-l-nav")
kl_nav.addEventListener("click", alphabetFilter)
kl_nav.letters = ["k", "l"]
let mn_nav = document.getElementById("books-m-n-nav")
mn_nav.addEventListener("click", alphabetFilter)
mn_nav.letters = ["m", "n"]
let op_nav = document.getElementById("books-o-p-nav")
op_nav.addEventListener("click", alphabetFilter)
op_nav.letters = ["o", "p"]
let qr_nav = document.getElementById("books-q-r-nav")
qr_nav.addEventListener("click", alphabetFilter)
qr_nav.letters = ["q", "r"]
let st_nav = document.getElementById("books-s-t-nav")
st_nav.addEventListener("click", alphabetFilter)
st_nav.letters = ["s", "t"]
let uv_nav = document.getElementById("books-u-v-nav")
uv_nav.addEventListener("click", alphabetFilter)
uv_nav.letters = ["u", "v"]
let wx_nav = document.getElementById("books-w-x-nav")
wx_nav.addEventListener("click", alphabetFilter)
wx_nav.letters = ["w", "x"]
let yz_nav = document.getElementById("books-y-z-nav")
yz_nav.addEventListener("click", alphabetFilter)
yz_nav.letters = ["y", "z"]