import { useState } from "react";
import { translateWeather } from "./translateWeather";

import axios from "axios";
import "./App.css";

interface WeatherData {
  name: string;
  main: {
    temp: number;
    humidity: number; //nem bilgisi
  };
  weather: Array<{
    description: string;
    main: string; //hava durumuna göre ikon
  }>;
  wind: {
    speed: number; //rüzgar hızı
  };
}

function App() {
  const [city, setCity] = useState<string>(""); //kullanıcının girdiği şehir
  const [weather, setWeather] = useState<WeatherData | null>(null); //hava durumu verisi
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false); // Yüklenme durumu
  const [recentCities, setRecentCities] = useState<string[]>([]);
  const API_KEY = "c779ffd58f6e91de8f67a822f3751c02";

  const fetchWeather = async (searchCity: string) => {
    setLoading(true);
    try {
      const response = await axios.get(
        `https://api.openweathermap.org/data/2.5/weather?q=${searchCity}&appid=${API_KEY}&units=metric`
      );
      setWeather(response.data);
      setError(null); //hata yoksa sıfırla
      if (!recentCities.includes(response.data.name)) {
        const updatedCities = [...recentCities, response.data.name];
        if (updatedCities.length > 5) {
          updatedCities.shift(); // en sondaki şehri çıkar
        }
        setRecentCities(updatedCities);
      }
    } catch (error) {
      console.error("Hava durumu bilgisi alınamadı.", error);
      setWeather(null);
      setError("Hava durumu bilgisi alınamadı geçerli bir şehir giriniz...");
    } finally {
      setLoading(false);
    }
  };

  /*   useEffect(() => {
    if (city.trim() !== "") {
      fetchWeather();
    }
  }, [city]); //city state değiştiğinde fetchWeather fonksiyonu çalışacak */

  const getWeatherIcon = (main: string) => {
    switch (main) {
      case "Clear":
        return "☀️";
      case "Clouds":
        return "☁️";
      case "Rain":
        return "🌧️";
      case "Snow":
        return "❄️";
      case "Thunderstorm":
        return "⛈️";
      case "Drizzle":
        return "🌦️";
      default:
        return "🌫️"; // Bilinmeyen durumlar için
    }
  };

  const getBackgroundColor = (main: string) => {
    switch (main) {
      case "Clear":
        return "lightblue";
      case "Clouds":
        return "lightgray";
      case "Rain":
        return "lightgreen";
      case "Snow":
        return "darkgray";
      case "Thunderstorm":
        return "lightblue";
      case "Drizzle":
        return "lightcyan";
      default:
        return "black";
    }
  };

  function deleteAllList() {
    if (confirm("Listeyi Silmek İstediğinize emin Misiniz?"))
      setRecentCities([]);
  }
  return (
    <>
      <div
        className="App"
        style={{
          backgroundColor: weather
            ? getBackgroundColor(weather.weather[0].main)
            : "lightgrey",
        }}
      >
        <h1>Hava Durumu</h1>
        <input
          type="text"
          placeholder="Şehir giriniz.."
          value={city}
          onChange={(e) => setCity(e.target.value)}
        />
        <button onClick={() => fetchWeather(city)}>Ara</button>
        {loading ? (
          <h2>Yükleniyor...</h2>
        ) : error ? (
          <div style={{ color: "red" }}>{error}</div>
        ) : weather ? (
          <div>
            <h2>
              {weather.name} {getWeatherIcon(weather.weather[0].main)}
            </h2>
            <p>Sıcaklık : {Number(weather.main.temp).toFixed(0)}°C</p>
            <p>Durum : {translateWeather(weather.weather[0].description)}</p>
            <p>Nem: {weather.main.humidity}%</p>
            <p>Rüzgar Hızı: {weather.wind.speed} m/s</p>
          </div>
        ) : (
          <p>Şehir giriniz.</p>
        )}
        <h3>Son Aranan Şehirler</h3>
        <ul>
          {recentCities.map((recentCity, index) => (
            <li
              key={index}
              onClick={() => {
                setCity(recentCity);
                fetchWeather(recentCity);
              }}
            >
              {recentCity}
            </li>
          ))}
        </ul>
        {recentCities.length >= 1 && (
          <button onClick={deleteAllList}>Listeyi Sil</button>
        )}
      </div>
    </>
  );
}

export default App;
