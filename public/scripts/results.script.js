// to search a tag, navigate to `/search?TAG1,TAG2,TAG3` passing in tag names seperated by commas
// this variable will retrieve them to store as an array
let searchedTags = [];
let bookData;
function truncate(str, len){
  // set up the substring
  let subString = str.substr(0, len-1);
  
  return (
    // add elipse after last complete word
    subString.substr(0, subString.lastIndexOf(' '))
    // trim trailing comma
    .replace(/(^[,\s]+)|([,\s]+$)/g, '') + '...'
  );
}

(new URL(document.location)).searchParams.get("tags").replace(/\%20/g, ' ').replace(/\%27/g, "'").split(',').forEach(element => {
  searchedTags.push(element.replace(/\%2C/g, ','));
});

function getAllBooks(handleData) {
  $("#results-for-this-letter").html('');
  $.ajax({
    method: "GET",
    url: "/api/v1/book/tags/" + searchedTags,
    success: function(data) {
      handleData(data);
    },
    error: function(error) {
      // still calling handle data if no data is returned
      handleData();
    }
  });
}  
// sets book data returned from database to a variable without making the call synchronous
// though the asynchronous nature of this script breaks down to synchronous function calls
// pretty fast
getAllBooks(function(output) {
  bookData = output || [];
  
  if (bookData && bookData.length !== 0) { 
    poulatePage();
  } else {
    // handle no results
    $('#selected-tags').html('');
    $('#selected-tags').append(`<br/><p class="warning-text">Oops, looks like you didn't select any tags to search by. Head back <a href="/">home</a> to try again!</p>`);
  }
});

function poulatePage() {

  // ====== Put main search tag on page ======
  let displayTag;
  if (searchedTags[0] && searchedTags[0].length > 40) { 
    displayTag = truncate(searchedTags[0], 40); 
  } else {
    displayTag = searchedTags[0];
  }
  $('#selected-tags').html('');
  $('#selected-tags').append(`<a class="static-tag badge badge-pill" value="${searchedTags[0]}">${displayTag}</a>`);

  // ====== Put any secondary search tags on page ======
  for (let index = 1; index < searchedTags.length; index++) {
    const tag = searchedTags[index];
    let shortTag;
    if (tag && tag.length > 40) { 
      shortTag = truncate(tag, 40); 
    } else {
      shortTag = tag;
    }
    $('#selected-tags').append(`<a class="badge selected-tag badge-pill badge-light" value="${tag}">${shortTag}<span class="delete-button" data-tag="${tag}">&#10005;</span></a>`);
  }

  // ====== Put book results on page ======
  $('#matching-books').html('');
  bookData.forEach(book => {
    let author = book.author[0];
    let title = book.title;
    let bookID = book._id;
    let tagPile = "";
    book.tags.forEach(tag => {
      let shortTag;
      if (tag && tag.length > 40) { 
        shortTag = truncate(tag, 40); 
      } else {
        shortTag = tag;
      }
      tagPile = tagPile + `<button class="tag badge badge-pill" value="${tag}" style="display:inline;">${shortTag}</button>`;
    });

    $('#matching-books').append(`<hr/><div class="row"><div class="col"><a href="/details?id=${bookID}" class="book-info" style="display:inline;">${title} - ${author}</a></div><div class="col">${tagPile}</div></div>`);
  });

  // ====== Add event listeners ======
  $(".tag").on("click", function() { 
    let clickedTag = $(this).attr("value");
    if (searchedTags.indexOf(clickedTag) == -1) {
      window.location.href = window.location.href.replace(/\#/g, '') + "," + clickedTag.replace(/,/g, '%2C'); 
    } else {
      alert(`You already selected the "${clickedTag}" tag!`);
    }
  });

  $(".delete-button").on("click", function() { 
    let clickedTag = $(this).attr("data-tag");
    let index = searchedTags.indexOf(clickedTag);
    searchedTags = searchedTags.splice(0, index);
    for (let index = 0; index < searchedTags.length; index++) {
      searchedTags[index] = searchedTags[index].replace(/,/g, '%2C');
    }
    searchedTags.join(',');
    window.location.href = "/results?tags=" + searchedTags;
  });
}