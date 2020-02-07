const renderCurrentWeather = (weatherData) => {

  const panelElement = $('#weather-panel');

  const cityElement = $('#current-city');
  const dateElement = $('#current-date');
  const iconElement = $('#current-weather-icon');

  const tempElement = $('#current-temp');
  const humidityElement = $('#current-humidity');
  const windspeedElement = $('#current-windspeed');
  const uvElement = $('#current-uv');

  const { 
    name, 
    main: {
      temp, 
      humidity
    },
    wind: {
      speed
    },
    weather,
    uvi
  } = weatherData;

  cityElement.text(name);
  dateElement.text(moment().format('(MM/DD/YYYY)'));

  iconElement.attr('src', getWeatherIconUrl(weather[0].icon));

  tempElement.children('span').text(convertToFahrenheit(temp).toFixed(2));
  humidityElement.children('span').text(humidity);
  windspeedElement.children('span').text(speed);
  uvElement.children('span').text(uvi);


  if (panelElement.hasClass('hidden')) {
    panelElement.removeClass('hidden');
  }
}

const renderSearchHistory = () => {

  const searchHistoryElement = $('#search-history');
  searchHistoryElement.empty();

  let searchHistory = localStorage.getItem('searches');

  if (searchHistory) {

    searchHistory = JSON.parse(searchHistory);

    for (const search of searchHistory) {

      const searchItem = $(`<li>${search}</li>`);

      searchItem.addClass('list-group-item list-group-item-action');

      searchItem.click(() => {

        getWeatherWithUV({q: search}).then((response) => {
          renderCurrentWeather(response);
        })
      })
      searchHistoryElement.prepend(searchItem);
    }
  }
}

const renderError = (query) => {

  const errorElement = $(`<div role="alert">Error: City "${query}" not found</div>`);
  errorElement.addClass('alert alert-danger alert-dismissible fade show');
  const closeButton = $('<button type="button" class="close" data-dismiss="alert" aria-label="Close"></button>')
  const closeIcon = $('<span aria-hidden="true">&times;</span>');
  closeButton.append(closeIcon);
  errorElement.append(closeButton);

  $('#search-area').append(errorElement);
}

const getWeatherIconUrl = (iconCode) => {
  return `http://openweathermap.org/img/wn/${iconCode}.png`;
}

const getCurrentLocation = () => {
  const apiKey = 'fb15c41db5fee25ded055f95bf360b72';
  return new Promise((resolve, reject) => {
    $.ajax({
      url: 'https://jsonip.com/',
      method: 'GET'
    })
      .then(response => {
        const { ip } = response;
        return $.ajax({
          url: `http://api.ipstack.com/${ip}?access_key=${apiKey}`
        })
      })
      .then(response => {
        console.log(response);
        resolve(response);
      })
      .catch(error => {
        console.error(error);
        reject(error);
      })
  })
}

$('#search-submit').click((event) => {

  event.preventDefault();
  const query = $('#search-city').val();

  getWeatherWithUV({q: query})
    .then((response) => {

      const { name } = response;
      let queries = localStorage.getItem('searches');

      if (queries) {

        queries = JSON.parse(queries);
        if (!queries.includes(name)) {
          queries.push(name);
        }
        if (queries.length > 10) {
          queries.shift();
        }

        localStorage.setItem('searches', JSON.stringify(queries));

      } else {

        localStorage.setItem('searches', JSON.stringify([query]));

      }

      renderSearchHistory();
      renderCurrentWeather(response);
    })
    .catch((error) => {

      console.log(error);
      renderError(query);
    })
})


$(document).ready(() => {

  renderSearchHistory();

  let searchHistory = localStorage.getItem('searches');

  if (searchHistory) {

    searchHistory = JSON.parse(searchHistory);
    const lastSearchedCity = searchHistory.pop();

    getWeatherWithUV({q: lastSearchedCity}).then((response) => {
      renderCurrentWeather(response);
    })

    // getForecast({q: lastSearchedCity}).then((response) => {
    //   console.log(response)
    // })

  } else {

    getCurrentLocation().then(response => {
      const { city } = response;
      getWeatherWithUV({q: city}).then((response) => {
        renderCurrentWeather(response);
      })
      // getForecast({q: lastSearchedCity}).then((response) => {
      //   console.log(response)
      // })
    })
  }
})