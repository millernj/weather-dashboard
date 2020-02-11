const renderCurrentWeather = (weatherData) => {



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
  uvElement.children('span').text(uvi || "---");

}

const renderForecast = (forecast) => {

  const forecastList = $('#forecast-list');
  forecastList.empty();

  for (const day of forecast) {
    const { date, temp, humidity, icon } = day;

    const weatherItem = $('<li>');
    weatherItem.addClass('weather-item');

    const weatherCard = $('<div>');
    weatherCard.addClass('card col-sm bg-primary weather-card');

    const body = $('<div>');
    body.addClass('card-body');

    const dateElement = $('<h5>');
    dateElement.text(date);
    dateElement.addClass('card-title');

    const iconElement = $('<img>');
    iconElement.attr('src', getWeatherIconUrl(icon));
    
    const tempElement = $('<p>');
    tempElement.text(`Temperature: ${convertToFahrenheit(temp).toFixed(2)} °F`);

    const humidityElement = $('<p>');
    humidityElement.text(`Humidity: ${humidity}%`);

    body.append(dateElement, iconElement, tempElement, humidityElement);
    weatherCard.append(body);
    weatherItem.append(weatherCard);
    forecastList.append(weatherItem);
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
        getForecast({q: search}).then((response) => {
          const forecast = processForecasts(response);
          renderForecast(forecast);
        })
      })
      searchHistoryElement.prepend(searchItem);
    }
  }
}

const renderError = (query) => {

  const errorElement = $(`<div role="alert">Error: City "${query}" not found</div>`);
  errorElement.addClass('alert alert-danger alert-dismissible fade show');
  const closeButton = $('<button type="button" class="close" data-dismiss="alert" aria-label="Close"></button>');
  const closeIcon = $('<span aria-hidden="true">&times;</span>');
  closeButton.append(closeIcon);
  errorElement.append(closeButton);

  $('#search-area').append(errorElement);
}

const getWeatherIconUrl = (iconCode) => {
  return `https://openweathermap.org/img/wn/${iconCode}.png`;
}

const getCurrentLocation = () => {

  const apiKey = 'at_J4YUbQJLBo70I6nkFBAPHjSrT95xw';

  return new Promise((resolve, reject) => {
    $.ajax({
      url: 'https://jsonip.com/',
      method: 'GET'
    })
      .then(response => {
        const { ip } = response;
        
        return $.ajax({
          url: `https://geo.ipify.org/api/v1?apiKey=${apiKey}&ipAddress=${ip}`
        });
      })
      .then(response => {
        resolve(response);
      })
      .catch(error => {
        console.error(error);
        reject(error);
      })
  })
}

$('.navbar-toggler').click((event) => {
  event.preventDefault();
  $('#main').toggleClass('toggled');
})

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
      return getForecast({q: query});
    })
    .then((response) => {
      const forecast = processForecasts(response);
      renderForecast(forecast);
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
    });
    
    getForecast({q: lastSearchedCity}).then((response) => {
      const forecast = processForecasts(response);
      renderForecast(forecast);
    });


  } else {

    getCurrentLocation().then(response => {
      const { location: { city } } = response;
      getWeatherWithUV({q: city}).then((response) => {
        renderCurrentWeather(response);
      });
      getForecast({q: city}).then((response) => {
        const forecast = processForecasts(response);
        renderForecast(forecast);
      });
    });
  }
})