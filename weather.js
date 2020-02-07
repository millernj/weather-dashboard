const apiKey = '531c059ea600bda3cbe5aee75ec46e5f';

const getWeather = (params) => {

  let uri = `https://api.openweathermap.org/data/2.5/weather?appid=${apiKey}`;

  for (const param in params) {
    if (params.hasOwnProperty(param)) {
      const value = params[param];
      uri+=`&${param}=${value}`;
    }
  }

  const settings = {
    url: uri,
    method: 'GET'
  }

  return $.ajax(settings);
}

const getUVIndex = ({lat, lon}) => {

  const uri = `https://api.openweathermap.org/data/2.5/uvi?appid=${apiKey}&lat=${lat}&lon=${lon}`;

  const settings = {
    url: uri,
    method: 'GET'
  }

  return $.ajax(settings);
}

const getForecast = (params) => {

  let uri = `https://api.openweathermap.org/data/2.5/forecast?appid=${apiKey}`;

  for (const param in params) {
    if (params.hasOwnProperty(param)) {
      const value = params[param];
      uri+=`&${param}=${value}`;
    }
  }

  const settings = {
    url: uri,
    method: 'GET'
  }

  return $.ajax(settings);
}

const getWeatherWithUV = (params) => {
  return new Promise((resolve, reject) => {
    let result = {};

    getWeather(params)
      .then((response) => {

        const { coord } = response;
        result = response;

        return getUVIndex(coord);
      })
      .then((response) => {

        const { value: uvi } = response;
        result.uvi = uvi;

        resolve(result);
      })
      .catch((error) => {
        console.error(error);

        if (result.cod != "200") {
          reject(error);
        }

        resolve(result);
      })
  })
}

const convertToCelcius = (temperature, inputUnit='K') => {
  switch (inputUnit) {
    case 'K':
      return parseFloat(temperature) - 273.15;
    case 'F':
      return (parseFloat(temperature) - 32) * 5 / 9;
  }
}

const convertToFahrenheit = (temperature, inputUnit='K') => {
  switch (inputUnit) {
    case 'K':
      return (convertToCelcius(temperature) * 9 / 5) + 32;
    case 'C':
      return (parseFloat(temperature) * 9 / 5) + 32;
  }
}

