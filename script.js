const searchBtn = document.getElementById('searchBtn');
const cityInput = document.getElementById('cityInput');
const weatherInfo = document.getElementById('weatherInfo');

searchBtn.addEventListener('click', () => {
    const city = cityInput.value.trim();
    if (city) {
        getWeather(city);
    } else {
        showError('Veuillez entrer un nom de ville');
    }
});

cityInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        const city = cityInput.value.trim();
        if (city) {
            getWeather(city);
        }
    }
});

async function getWeather(city) {
    showLoading();
    
    try {
        const geocodeUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=fr&format=json`;
        const geoResponse = await fetch(geocodeUrl);
        const geoData = await geoResponse.json();
        
        if (!geoData.results || geoData.results.length === 0) {
            throw new Error('Ville non trouvée');
        }
        
        const location = geoData.results[0];
        const latitude = location.latitude;
        const longitude = location.longitude;
        const cityName = location.name;
        const country = location.country;
        
        const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true&timezone=auto&forecast_days=1`;
        const weatherResponse = await fetch(weatherUrl);
        const weatherData = await weatherResponse.json();
        
        if (!weatherData.current_weather) {
            throw new Error('Données météo non disponibles');
        }
        
        displayWeather(cityName, country, weatherData.current_weather);
        
    } catch (error) {
        showError(error.message);
    }
}

function displayWeather(cityName, country, weather) {
    const temperature = weather.temperature;
    const windspeed = weather.windspeed;
    const weatherCode = weather.weathercode;
    
    const weatherDescription = getWeatherDescription(weatherCode);
    
    weatherInfo.innerHTML = `
        <div class="weather-card">
            <div class="city-name">${cityName}, ${country}</div>
            <div class="temperature">
                ${Math.round(temperature)}<span>°C</span>
            </div>
            <div class="weather-description">${weatherDescription}</div>
            <div class="details">
                <div class="detail-item">
                    <div class="detail-label">Vent</div>
                    <div class="detail-value">${Math.round(windspeed)} km/h</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Humidité</div>
                    <div class="detail-value">N/A</div>
                </div>
            </div>
        </div>
    `;
}

function getWeatherDescription(code) {
    const descriptions = {
        0: 'Ciel dégagé',
        1: 'Principalement dégagé',
        2: 'Partiellement nuageux',
        3: 'Nuageux',
        45: 'Brouillard',
        48: 'Brouillard givrant',
        51: 'Bruine légère',
        53: 'Bruine modérée',
        55: 'Bruine dense',
        61: 'Pluie légère',
        63: 'Pluie modérée',
        65: 'Pluie forte',
        71: 'Neige légère',
        73: 'Neige modérée',
        75: 'Neige forte',
        80: 'Averses légères',
        81: 'Averses modérées',
        82: 'Averses fortes',
        95: 'Orage',
        96: 'Orage avec grêle légère',
        99: 'Orage avec grêle forte'
    };
    
    return descriptions[code] || 'Conditions météo variables';
}

function showLoading() {
    weatherInfo.innerHTML = '<div class="loading">Chargement des données météo...</div>';
}

function showError(message) {
    weatherInfo.innerHTML = `
        <div class="error-message">
            Erreur : ${message}
        </div>
    `;
}