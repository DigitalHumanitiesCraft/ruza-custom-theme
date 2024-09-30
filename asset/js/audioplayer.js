$(document).ready(function () {
  const $audioPlayerWindow = $("#audioPlayerWindow");
  const $restoreIcon = $("#restoreIcon");

  // Minimize the window
  $(".minimize-btn").on("click", function() {
    $audioPlayerWindow.hide(); // Hide the window
    $restoreIcon.show();       // Show the restore icon
  });

  // Restore the window
  $restoreIcon.on("click", function() {
    $audioPlayerWindow.show(); // Show the window
    $restoreIcon.hide();       // Hide the restore icon
  });

  // Make the audio player window draggable by the header and resizable
  $audioPlayerWindow
    .draggable({
      handle: ".window-header",
      containment: "window", // This keeps the window within the browser viewport
    })

  // Open the audio player window when the play button in the carousel is clicked and play first song
  $(".carousel .play-button").on("click", function (e) {
    e.preventDefault();
    $audioPlayerWindow.show();
    const firstSongUrl = $("#songList").find(".play-btn").data("url");
    $("#audioPlayer").attr("src", firstSongUrl)[0].play();
  });

  // Handle play buttons for individual songs
  $("#songList").on("click", ".play-btn", function () {
    const audioSrc = $(this).data("url");
    $("#audioPlayer").attr("src", audioSrc)[0].play();
  });

  // Close the audio player window
  $(".close-btn").on("click", function () {
    $audioPlayerWindow.hide();
    $("#audioPlayer")[0].pause();
  });
});
