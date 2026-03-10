function calculateComfortIndex(weather) {
  const temp = weather.temp;
  const humidity = weather.humidity;
  const wind = weather.windSpeed;
  const clouds = weather.cloudiness;
  const pressure = weather.pressure;

  const tempPenalty = Math.abs(temp - 22) * 2;
  const humidityPenalty = Math.abs(humidity - 50) * 0.4;
  const windPenalty = Math.abs(wind - 3) * 3;
  const cloudPenalty = Math.abs(clouds - 20) * 0.2;
  const pressurePenalty = Math.abs(pressure - 1013) * 0.05;

  let score =
    100 -
    (tempPenalty +
      humidityPenalty +
      windPenalty +
      cloudPenalty +
      pressurePenalty);

  score = Math.max(0, Math.min(100, score));

  return Math.round(score);
}

module.exports = {
  calculateComfortIndex,
};

