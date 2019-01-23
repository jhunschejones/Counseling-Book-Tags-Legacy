function logOut() {
  firebase.auth().signOut().then(function() {
    // Sign-out successful.
    userID = null;
    $('#logged-in-content').hide();
    $('#logged-out-message').show();
    $(".delete-button").hide();
  }).catch(function(error) {
    // An error happened.
  });
}

// checking if user is logged in or logs in during session
firebase.auth().onAuthStateChanged(function(user) {
  if (user) {
    // User is already signed in
    // console.log("signed in")
    $('#log-out-button').show();
    document.getElementById("log-out-button").addEventListener("click", logOut);
  } else {
    // User is not signed in yet
    // console.log("signed out")
    $('#log-out-button').hide();
  }
});