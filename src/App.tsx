import { useEffect, useRef, useState } from "react";
import { translateWeather } from "./translateWeather";
import { cities } from "./cities";
import axios from "axios";
import Map from "ol/Map";
import View from "ol/View";
import TileLayer from "ol/layer/Tile";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import OSM from "ol/source/OSM";
import Feature from "ol/Feature";
import Point from "ol/geom/Point";
import { fromLonLat } from "ol/proj";
import { Style, Icon } from "ol/style";
import "./App.css";

interface WeatherData {
  name: string;
  main: {
    temp: number;
    humidity: number;
  };
  weather: Array<{
    description: string;
    main: string;
  }>;
  wind: {
    speed: number;
  };
  coord: {
    lat: number;
    lon: number;
  };
}

interface CityData {
  name: string;
  lat: number;
  lon: number;
}

function App() {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [city, setCity] = useState<string>("");
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [recentCities, setRecentCities] = useState<CityData[]>([]);
  const [isMapMode, setIsMapMode] = useState<boolean>(false);
  const mapRef = useRef<HTMLDivElement>(null);
  const API_KEY = "c779ffd58f6e91de8f67a822f3751c02";

  const fetchWeather = async (searchCity: string) => {
    setLoading(true);
    try {
      const response = await axios.get(
        `https://api.openweathermap.org/data/2.5/weather?q=${searchCity}&appid=${API_KEY}&units=metric`
      );
      setWeather(response.data);
      setError(null);
      const newCity = {
        name: response.data.name,
        lat: response.data.coord.lat,
        lon: response.data.coord.lon,
      };
      if (!recentCities.some((city) => city.name === newCity.name)) {
        const updatedCities = [...recentCities, newCity];
        if (updatedCities.length > 5) {
          updatedCities.shift();
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
    setCity("");
  };

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
        return "🌫️";
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

  const clearRecentCities = () => {
    if (confirm("Listeyi Silmek İstediğinize Emin Misiniz?")) {
      setRecentCities([]);
    }
  };

  const filterSuggestions = (input: string) => {
    if (input.trim() === "" || input.length < 3) {
      setSuggestions([]);
    } else {
      const filteredCities = cities.filter((city) =>
        city.toLowerCase().includes(input.toLowerCase())
      );
      setSuggestions(filteredCities);
    }
  };

  useEffect(() => {
    if (!mapRef.current || !isMapMode) return;

    const vectorSource = new VectorSource();
    recentCities.forEach((city) => {
      const feature = new Feature({
        geometry: new Point(fromLonLat([city.lon, city.lat])),
      });
      feature.setStyle(
        new Style({
          image: new Icon({
            src: "https://openlayers.org/en/latest/examples/data/icon.png",
            scale: 0.4,
          }),
        })
      );
      vectorSource.addFeature(feature);
    });

    const map = new Map({
      target: mapRef.current,
      layers: [
        new TileLayer({
          source: new OSM(),
        }),
        new VectorLayer({
          source: vectorSource,
        }),
      ],
      view: new View({
        center:
          recentCities.length > 0
            ? fromLonLat([
                recentCities[recentCities.length - 1].lon,
                recentCities[recentCities.length - 1].lat,
              ])
            : fromLonLat([0, 0]),
        zoom: 7,
      }),
    });

    return () => map.setTarget(undefined);
  }, [isMapMode, recentCities]);

  return (
    <div
      className="App"
      style={{
        backgroundColor:
          weather && !isMapMode
            ? getBackgroundColor(weather.weather[0].main)
            : "lightgrey",
      }}
    >
      {isMapMode ? (
        <div>
          <button onClick={() => setIsMapMode(false)}>Geri Dön</button>
          <div
            ref={mapRef}
            className="map"
            style={{ width: "100%", height: "100vh" }}
          ></div>
        </div>
      ) : (
        <>
          <h1>Hava Durumu</h1>
          <input
            type="text"
            placeholder="Şehir giriniz.."
            value={city}
            onChange={(e) => {
              setCity(e.target.value);
              filterSuggestions(e.target.value);
            }}
          />
          <button onClick={() => fetchWeather(city)}>Ara</button>
          <ul className="suggestions">
            {suggestions.map((suggestion) => (
              <li
                key={suggestion}
                onClick={() => {
                  setCity(suggestion);
                  fetchWeather(suggestion);
                  setSuggestions([]);
                }}
              >
                {suggestion}
              </li>
            ))}
          </ul>
          {loading ? (
            <div className="spinner"></div>
          ) : error ? (
            <div style={{ color: "red" }}>{error}</div>
          ) : weather ? (
            <div>
              <h2>
                {weather.name} {getWeatherIcon(weather.weather[0].main)}
              </h2>
              <p>Sıcaklık: {Number(weather.main.temp).toFixed(0)}°C</p>
              <p>Durum: {translateWeather(weather.weather[0].description)}</p>
              <p>Nem: {weather.main.humidity}%</p>
              <p>Rüzgar Hızı: {weather.wind.speed} m/s</p>
              <button onClick={() => setIsMapMode(true)}>
                Haritada Göster
              </button>
            </div>
          ) : (
            <p>Şehir giriniz.</p>
          )}
          <h3>Son Aranan Şehirler</h3>
          {recentCities.length >= 1 && (
            <button onClick={clearRecentCities}>Listeyi Sil</button>
          )}
          <ul>
            {recentCities.map((recentCity) => (
              <li
                key={recentCity.name}
                onClick={() => {
                  setCity(recentCity.name);
                  fetchWeather(recentCity.name);
                }}
              >
                {recentCity.name}
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}

export default App;
