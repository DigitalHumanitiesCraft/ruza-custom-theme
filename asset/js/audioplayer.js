$(document).ready(function () {
  const $audioPlayerWindow = $("#audioPlayerWindow");
  const $restoreIcon = $("#restoreIcon");
  let currentSongElement = null; // To keep track of the currently playing song

  // Minimize the window
  $(".minimize-btn").on("click", function () {
    $audioPlayerWindow.hide(); // Hide the window
    $restoreIcon.show(); // Show the restore icon
  });

  // Restore the window
  $restoreIcon.on("click", function () {
    $audioPlayerWindow.show(); // Show the window
    $restoreIcon.hide(); // Hide the restore icon
  });

  // Make the audio player window draggable by the header and resizable
  $audioPlayerWindow.draggable({
    handle: ".window-header",
    containment: "window", // This keeps the window within the browser viewport
  });

  // Open the audio player window when the play button in the carousel is clicked and play the first song
  $(".carousel .play-button").on("click", function (e) {
    e.preventDefault();
    $audioPlayerWindow.show();

    // Automatically play the first song
    const firstSongBtn = $("#songList").find(".play-btn").first();
    const firstSongUrl = firstSongBtn.data("url");
    $("#audioPlayer").attr("src", firstSongUrl)[0].play();

    // Update the first song UI (play button, bold title)
    resetPlayButtons(); // Reset other play buttons and titles
    firstSongBtn
      .removeClass("btn-outline-primary")
      .addClass("btn-outline-danger"); // Change button style to danger
    firstSongBtn.find("i").removeClass("fa-play").addClass("fa-stop"); // Change play icon to stop icon

    const firstSongItem = firstSongBtn.closest("li");
    currentSongElement = firstSongItem;
    firstSongItem.find(".song-title").attr("style", "font-weight: bold;"); // Use inline style to bold the title
  });

  // Handle play buttons for individual songs
  $("#songList").on("click", ".play-btn", function () {
    const $playButton = $(this);
    const audioSrc = $playButton.data("url");

    // If the same song is clicked again, stop the song
    if (
      $("#audioPlayer").attr("src") === audioSrc &&
      !$("#audioPlayer")[0].paused
    ) {
      $("#audioPlayer")[0].pause(); // Pause the song
      resetPlayButtons(); // Reset play buttons and boldness
      return; // Exit the function
    }

    // Play the new song
    $("#audioPlayer").attr("src", audioSrc)[0].play();

    // Update UI: change play button to stop icon, bold the current song title
    resetPlayButtons(); // Reset other play buttons and titles
    $playButton
      .removeClass("btn-outline-primary")
      .addClass("btn-outline-danger"); // Change button style to danger
    $playButton.find("i").removeClass("fa-play").addClass("fa-stop"); // Change play icon to stop icon

    const $songItem = $playButton.closest("li"); // Get the parent list item of the clicked play button
    currentSongElement = $songItem; // Set the current song element to the one that is playing
    $songItem.find(".song-title").attr("style", "font-weight: bold;"); // Use inline style to bold the title
  });

  // Reset all play buttons to default state
  function resetPlayButtons() {
    const playButtons = $(".play-btn");
    playButtons.each(function () {
      $(this).removeClass("btn-outline-danger").addClass("btn-outline-primary"); // Reset button to primary
      $(this).find("i").removeClass("fa-stop").addClass("fa-play"); // Reset stop icon to play icon
    });

    // Remove bold styling from all song titles
    $(".song-title").removeAttr("style");
  }

  // Close the audio player window
  $(".close-btn").on("click", function () {
    $audioPlayerWindow.hide();
    $("#audioPlayer")[0].pause(); // Pause the audio player when closing the window
    resetPlayButtons(); // Reset the buttons and song titles when the window is closed
  });
});
