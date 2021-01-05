const apiKey = "a0fe58708e6d694a289790f09cf8e633";
var currWeatherDiv = $("#currentWeather");
var forecastDiv = $("#weatherForecast");
var citiesArray;

if (localStorage.getItem("localWeatherSearches")) {
    citiesArray = JSON.parse(localStorage.getItem("localWeatherSearches"));
    writeSearchHistory(citiesArray);
} else {
    citiesArray = [];
};


function returnCurrentWeather(cityName) {
    let queryURL = `https://api.openweathermap.org/data/2.5/weather?q=${cityName}&units=metric&APPID=${apiKey}`;

    $.get(queryURL).then(function(response){
        let currTime = new Date(response.dt*1000);
        let weatherIcon = `https://openweathermap.org/img/wn/${response.weather[0].icon}@2x.png`;

        currWeatherDiv.html(`
        <h2>${response.name}, ${response.sys.country} (${currTime.getMonth()+1}/${currTime.getDate()}/${currTime.getFullYear()})<img src=${weatherIcon} height="80px"></h2>
        <p>Temperature: ${response.main.temp} &#176;C</p>
        <p>Humidity: ${response.main.humidity}%</p>
        <p>Wind Speed: ${response.wind.speed} m/s</p>
        `, returnUV(response.coord))
        createHistoryButton(response.name);
    })
};

function returnWeatherForecast(cityName) {
    let queryURL = `https://api.openweathermap.org/data/2.5/forecast?q=${cityName}&units=metric&APPID=${apiKey}`;

    $.get(queryURL).then(function(response){
        let forecastInfo = response.list;
        forecastDiv.empty();
        $.each(forecastInfo, function(i) {
            if (!forecastInfo[i].dt_txt.includes("12:00:00")) {
                return;
            }
            let forecastDate = new Date(forecastInfo[i].dt*1000);
            let weatherIcon = `https://openweathermap.org/img/wn/${forecastInfo[i].weather[0].icon}.png`;

            forecastDiv.append(`
            <div class="col-md">
                <div class="card text-white bg-success">
                    <div class="card-body">
                        <h4>${forecastDate.getMonth()+1}/${forecastDate.getDate()}/${forecastDate.getFullYear()}</h4>
                        <img src=${weatherIcon} alt="Icon">
                        <p>Temp: ${forecastInfo[i].main.temp} &#176;C</p>
                        <p>Humidity: ${forecastInfo[i].main.humidity}%</p>
                    </div>
                </div>
            </div>
            `)
        })
    })
};


function returnUV(coordinates) {
    let queryURL = `https://api.openweathermap.org/data/2.5/uvi?lat=${coordinates.lat}&lon=${coordinates.lon}&APPID=${apiKey}`;

    $.get(queryURL).then(function(response){
        let currUV = response.value;
        let uvSeverity = "#40E0D0";
        let textColour = "white"
      
        if (currUV >= 11) {
            uvSeverity = "r#8B008B";
        } else if (currUV >= 8) {
            uvSeverity = "#FF4500";
        } else if (currUV >= 6) {
            uvSeverity = "#FFB6C1";
            textColour = "white"
        } else if (currUV >= 3) {
            uvSeverity = "#DAA520";
            textColour = "white"
        }
        currWeatherDiv.append(`<p>UV Index: <span class="text-${textColour} uvPadding" style="background-color: ${uvSeverity};">${currUV}</span></p>`);
    })
}

function createHistoryButton(cityName) {

    var citySearch = cityName.trim();
    var buttonCheck = $(`#storedSearches > BUTTON[value='${citySearch}']`);
    if (buttonCheck.length == 1) {
      return;
    }
    
    if (!citiesArray.includes(cityName)){
        citiesArray.push(cityName);
        localStorage.setItem("localWeatherSearches", JSON.stringify(citiesArray));
    }

    $("#storedSearches").prepend(`
    <button class="btn btn-light cityHistoryBtn " value='${cityName}'>${cityName}</button>
    `);
    
}

function writeSearchHistory(array) {
    $.each(array, function(i) {
        createHistoryButton(array[i]);
    })
}

$("#submitCity").click(function() {
    event.preventDefault();
    let cityName = $("#cityInput").val();
    returnCurrentWeather(cityName);
    returnWeatherForecast(cityName);
});

$("#storedSearches").click(function() {
    let cityName = event.target.value;
    returnCurrentWeather(cityName);
    returnWeatherForecast(cityName);
});
$("#deleteButton").click(function() {
    window.localStorage.clear();
    location.reload();
})