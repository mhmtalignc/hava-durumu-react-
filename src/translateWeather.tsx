interface translateWeather {
  [key: string]: string;
}

const translations: translateWeather = {
  "clear sky": "Açık Hava",
  "few clouds": "Az Bulutlu",
  "scattered clouds": "Dağınık Bulutlu",
  "broken clouds": "Parçalı Bulutlu",
  "overcast clouds": "Kapalı Hava",
  "light rain": "Hafif Yağmur",
  "moderate rain": "Orta Şiddetli Yağmur",
  "heavy intensity rain": "Şiddetli Yağmur",
  snow: "Kar",
  "light snow": "Hafif Kar",
  thunderstorm: "Gök Gürültülü Fırtına",
  drizzle: "Çiseleme",
};
export const translateWeather = (description: string): string => {
  return translations[description.toLowerCase()] || description; // Çeviri yoksa orijinal döner
};
