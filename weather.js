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
  };

  return $.ajax(settings);
}

const getUVIndex = ({lat, lon}) => {

  const uri = `https://api.openweathermap.org/data/2.5/uvi?appid=${apiKey}&lat=${lat}&lon=${lon}`;

  const settings = {
    url: uri,
    method: 'GET'
  };

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

const dayMapReducer = (accumulator, currentValue) => {
  const day = moment.unix(currentValue.dt).format('MM_DD_YYYY');
  if (day != moment().format('MM_DD_YYYY')){
    if (accumulator && accumulator.hasOwnProperty(day)) {
      accumulator[day].push(currentValue);
    } else {
      accumulator[day] = [currentValue];
    }
  }
  return accumulator;
}

const processForecastAverage = (accumulator, currentValue, currentIndex, sourceArray) => {
  const {
    main: {
      temp,
      humidity
    },
    dt,
    weather
  } = currentValue;
  const arrayLength = sourceArray.length;
  if (currentIndex == Math.floor(arrayLength/2.0)) {
    const icon = weather[0].icon;
    accumulator.icon = icon;
  }
  if (accumulator.hasOwnProperty('temp') && accumulator.hasOwnProperty('humidity')) {
    accumulator.temp += parseFloat(temp)/arrayLength;
    accumulator.humidity += parseFloat(humidity)/arrayLength;
  } else {
    accumulator = { 
      temp: parseFloat(temp)/arrayLength,
      humidity: parseFloat(humidity)/arrayLength,
      date: moment.unix(dt).format('MM/DD/YYYY')
    };
  }
  return accumulator;
}

const processForecasts = (forecast) => {
  let result = [];
  const { list: intervals } = forecast;
  const days = intervals.reduce(dayMapReducer, {});
  for (let forecasts of Object.values(days)) {
    let average = forecasts.reduce(processForecastAverage, {});
    average.temp = average.temp.toFixed(2);
    average.humidity = average.humidity.toFixed(2);
    result.push(average);
  }
  return result;
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
      });
  });
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