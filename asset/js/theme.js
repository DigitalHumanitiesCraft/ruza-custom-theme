$(document).ready(function () {
  //Dropdown fix
  $('.dropdown-menu a.dropdown-toggle').on('click', function (e) {
    if (!$(this).next().hasClass('show')) {
      $(this).parents('.dropdown-menu').first().find('.show').removeClass("show");
    }
    var $subMenu = $(this).next(".dropdown-menu");
    $subMenu.toggleClass('show');


    $(this).parents('li.nav-item.dropdown.show').on('hidden.bs.dropdown', function (e) {
      $('.dropdown-submenu .show').removeClass("show");
    });


    return false;
  });
  // Item browse and search
  if ($('body').hasClass('resource browse') || $('body').hasClass('resource search')) {
    // Infinite scroll/load more
    // check if results have more than one page
    if ($('.pagination .next').length) {
      var status = $(`
        <div class="page-load-status">
          <div class="row justify-content-center pb-5 mb-5">
            <div class="col-auto">
              <div class="spinner-border infinite-scroll-request" role="status">
                <span class="visually-hidden">Loading...</span>
              </div>
            </div>
          </div>
        </div>
        `);
      status.hide();
      var loadButton = `
      <div class="row justify-content-center">
        <div class="col-auto">
          <button id="load-button" class="btn btn-fit-green floating-action" type="button" aria-controls="searchFilters" aria-label="Load more results">
            <span class="action-container">
              <i class="fas fa-plus" aria-hidden="true" title="Load more results">
              </i>
              Load More
            </span>
          </button>
        </div>
      </div>
      `;
      $('.pagination-row').after(loadButton).after(status);
      $('#browse-container').attr('aria-live', 'polite')
      let nextURL;
      let appendElement = '.item-container';
      let currentItemCount;

      function updateNextURL(doc) {
        if ($(doc).find('.next').length) {
          nextURL = $(doc).find('.next').attr('href');
          if (!nextURL.includes('&scroll_request=true')) {
            nextURL = nextURL + '&scroll_request=true';
          }
        } else {
          nextURL = null;
        }
      }

      function getLinkData(doc) {
        if ($(doc).find('script[type="application/ld+json"]').length) {
          var newLinkData = $(doc).find('script[type="application/ld+json"]');
          $('script[type="application/ld+json"]').last().after(newLinkData);
        }
      }

      function updateFocus() {
        var firstLoadedElement = $(appendElement)[currentItemCount];
        $(firstLoadedElement).find('a.card-img').focus();
        getItemCount();
      }

      function getItemCount() {
        currentItemCount = $(appendElement).length
      }
      // get initial nextURL
      updateNextURL(document);
      getItemCount();
      let $container = $('#browse-container').infiniteScroll({
        // options
        // use function to set custom URLs
        path: function () {
          return nextURL;
        },
        checkLastPage: '.next',
        append: appendElement,
        scrollThreshold: false,
        button: '#load-button',
        hideNav: '.pagination-row',
        status: '.page-load-status',
        history: false,
      });
      // update nextURL on page load
      $container.on('load.infiniteScroll', function (event, body, path, response) {
        history.replaceState(null, null, path.replace('&scroll_request=true', ''));
        updateNextURL(body);
        getLinkData(body);
      });
      $container.on('append.infiniteScroll', function () {
        updateFocus();
      });
    }
    // Layout toggle
    function layoutList() {
      $('.btn.list').toggleClass("active", true).attr("aria-pressed", "true");
      $('.btn.grid').toggleClass("active", false).attr("aria-pressed", "false");
      $('#browse-container').hide().toggleClass("list", true).toggleClass("grid", false).fadeIn("slow");
      sessionStorage.setItem("browseLayout", "List");
    }

    function layoutGrid() {
      $('.btn.grid').toggleClass("active", true).attr("aria-pressed", "true");
      $('.btn.list').toggleClass("active", false).attr("aria-pressed", "false");
      $('#browse-container').hide().toggleClass("grid", true).toggleClass("list", false).fadeIn("slow");
      sessionStorage.setItem("browseLayout", "Grid");
    }
    if (sessionStorage.getItem("browseLayout")) {
      if (sessionStorage.getItem("browseLayout") == "List") {
        layoutList();
      } else if (sessionStorage.getItem("browseLayout") == "Grid") {
        layoutGrid();
      }
    }
    $('.btn.list').on("click", function () {
      layoutList();
    });
    $('.btn.grid').on("click", function () {
      layoutGrid();
    });
  }
  //Media viewer
  if ($('body').hasClass('show')) {
    if (window.matchMedia('(min-width: 768px)').matches) {
      //tooltips
      var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'))
      var tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl)
      })
    }
    //advance buttons
    $('#media-sidebar .btnNext').click(function () {
      var next = $('#mediaTab .nav-item').has('button.active').next('li');
      if (next.length) {
        $(next).children('button').trigger('click');
      } else {
        $("#mediaTab .nav-item:first").find('button').trigger('click');
      }
    });
    // Pause video when changing tabs
    $('#media-sidebar .nav-link').click(function () {
      var selectedTab = $(this).data('bs-target');
      $('#mediaTabContent .tab-pane:not(' + selectedTab + ') .youtube').each(function () {
        $(this)[0].contentWindow.postMessage('{"event":"command","func":"pauseVideo","args":""}', '*');
      });
      $('#mediaTabContent .tab-pane:not(' + selectedTab + ') .vimeo').each(function () {
        $(this)[0].contentWindow.postMessage('{"method":"pause"}', '*');
      });
      $('#mediaTabContent .tab-pane:not(' + selectedTab + ') .vjs-tech').each(function () {
        $(this).get(0).pause();
      });
    });
    //clipboard
    $('.clip-button').each(function (index) {
      new ClipboardJS(this);
    });
    //toasts
    if ($('#embargo').length) {
      var embargo = $('#embargo');
      toast = new bootstrap.Toast(embargo);
      toast.show();
    }
  }
  //advanced search item set dropdown
  $('#advanced-search-modal #item-sets option:contains("Select item set…")').text('Select collection…');
});