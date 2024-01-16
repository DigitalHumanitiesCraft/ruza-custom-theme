$(document).ready(function() {
  if (document.getElementById('date-facet-slider')) {
    var slider = document.getElementById('date-facet-slider');
    var min = $(slider).data('min');
    var max = $(slider).data('max');
    var minInput = document.getElementById('dateRangeMin');
    var maxInput = document.getElementById('dateRangeMax');
    noUiSlider.create(slider, {
      start: [min, max],
      step: 1,
      range: {
        'min': min,
        'max': max
      }
    });
    slider.noUiSlider.on('update', function(values, handle) {
      var value = values[handle];

      if (handle) {
        maxInput.value = Math.round(value);
      } else {
        minInput.value = Math.round(value);
      }
    });
    minInput.addEventListener('change', function() {
      slider.noUiSlider.set([this.value, null]);
    });

    maxInput.addEventListener('change', function() {
      slider.noUiSlider.set([null, this.value]);
    });
    $('#dateRangeFacet').submit(function(event) {
      event.preventDefault();
      let url = new URL($(this).attr('action'));
      url.searchParams.append($(minInput).attr('name'), $(minInput).val());
      url.searchParams.append($(maxInput).attr('name'), $(maxInput).val());
      window.location.href = url;
    });
  }
});