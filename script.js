$('#search-submit').click((event) => {
  event.preventDefault();
  const query = $('#search-city').val();
  getWeatherWithUV({q: query}).then((response) => {
    renderCurrentWeather(response);
  })
  let queries = localStorage.getItem('cities');
  if (queries) {
    queries = JSON.parse(queries);
    queries.push(query);
    localStorage.setItem('cities', JSON.stringify(queries));
  } else {
    localStorage.setItem('cities', JSON.stringify([query]));
  }

})

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

const getWeatherIconUrl = (iconCode) => {
  return `http://openweathermap.org/img/wn/${iconCode}.png`;
}

const getLocation = () => {
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



$(document).ready(() => {
  getLocation().then(response => {
    const { city } = response;
    getWeatherWithUV({q: city}).then((response) => {
      renderCurrentWeather(response);
    })
  })
})