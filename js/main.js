const BASE_URL = 'https://api.openweathermap.org/data/2.5/';
const API_KEY = '6e90bfd22f77be337dd82587a2c0bc74';

//widgets
const locationInput = document.querySelector('.location-input');
const weatherSearchButton = document.querySelector('.weather-search-button');
const weatherWrapper = document.querySelector('.weather-wrapper');
const mainWrapper = document.querySelector('.main-wrapper');
const loadingWrapper = document.querySelector('.loading-wrapper');
const weatherForecast = document.querySelector('.weather-forecast');
const detailDiv = document.querySelector('.detail-div');
const init = () => {
	weatherSearchButton.addEventListener('click', () => getWeatherDataByCity(locationInput.value));
};

const launchSite = (result) =>{
	console.log(result);
	temp = displayWeatherData(result.currentWeather);
	toggleSign(temp);
	days = displayWeatherForecast(result.forecast);
	// console.log(days);
}

const toggleSign = (temp) =>{
	const translateDegreesButton = document.querySelector('.translateDegrees');
	const currentTempP = document.querySelector('.current-temp');
	let sign = 'F';

	if (translateDegreesButton){
		translateDegreesButton.addEventListener('click', () => {
			if (sign === 'F'){
				translateDegreesButton.textContent = `${Math.round(temperatureInCelsium)} °C`;
				sign = 'C';
			}else{
				translateDegreesButton.textContent = `${temp} °F`;
				sign = 'F';
			}
		});
	}
}

const toggleLoading = () => {
	loadingWrapper.classList.toggle('hidden');
	mainWrapper.classList.toggle('hidden');
}

const displayWeatherData = (data) => {
	weatherWrapper.style.opacity = 0;
	weatherWrapper.style.top = '50px';
	weatherWrapper.style.width = '300px';

	nameOfCity = data.name;
	temperatureInCelsium = data.main.temp - 273;

	const cityDataP = document.createElement('h2');

	const currentTempP = document.createElement('p');
	currentTempP.classList.add('current-temp');

	const mainInfoP = document.createElement('p');
	const descriptionP = document.createElement('p');

	currentTempP.innerHTML = `Temperature: <button class='translateDegrees'><span class='temperature-detail'>${data.main.temp} °F</span></button>`;
	cityDataP.innerHTML = `Today in ${nameOfCity}`;
	mainInfoP.innerHTML = `Day is <span class='lowercase'>${data.weather[0].main}</span>`;
	descriptionP.innerHTML = `Description of day: ${data.weather[0].description}`;

	setTimeout(() => {
    	weatherWrapper.style.opacity = 0.8;
    	weatherWrapper.style.width = '100%';
	}, 150);
	setTimeout(() => {
		weatherWrapper.style.top = '0px';
	}, 100);

	weatherWrapper.appendChild(cityDataP);
	weatherWrapper.appendChild(currentTempP);
	weatherWrapper.appendChild(mainInfoP);
	weatherWrapper.appendChild(descriptionP);

	return data.main.temp;
}

const displayWeatherForecast = (data, sorted=false) => {
	console.log('DATA: ', data);
	weatherForecast.innerHTML = '';
	let weatherData = {};
	const icons = {};
	const iconsArray = {};
	data.list.forEach(item => {
		console.log('item: ', item);
		const iconCode = item.weather[0].icon;
		const date = new Date(item.dt * 1000);
		const dateString = `${date.getDate()}.${date.getMonth() + 1}`;
		if (weatherData[dateString]){
			weatherData[dateString].tempList.push(Math.round(item.main.temp - 273));
		} else {
			weatherData[dateString] = {tempList: [Math.round(item.main.temp - 273)]}
		}

		weatherData[dateString].average = Math.round(weatherData[dateString].tempList.reduce((first, second) => first + second, 0)
			/weatherData[dateString].tempList.length);

		const img = new Image();
		img.src = `http://openweathermap.org/img/w/${iconCode}.png`
		if (iconsArray[dateString]){
			iconsArray[dateString].push(img);
		} else {
			iconsArray[dateString] = [img];
		}

		if (icons[dateString]){
			if (icons[dateString][iconCode]){
				icons[dateString][iconCode] += 1;
			} else {
				icons[dateString][iconCode] = 1;
			}
		}else {
			icons[dateString] = {[iconCode]: 1};
		}
	});

	console.log('array img: ', iconsArray)

	for (let [key, value] of Object.entries(icons)){
		console.log('key: ', key, 'value: ', value);
		icons[key] = Object.keys(icons[key]).reduce((a, b) => icons[key][a] > icons[key][b] ? a : b);
	}

	console.log(weatherData);

	const sortButton = document.createElement('button');
	sortButton.classList.add('sort-button');
	sortButton.innerHTML = 'Sort';
	sortButton.addEventListener('click', () => {
		displayWeatherForecast(data, true);
	});
	weatherForecast.appendChild(sortButton);

	console.log(weatherData);

	if (sorted){
		weatherData = Object.entries(weatherData)
    	.sort(([, firstValue],[, secondValue]) => firstValue.average - secondValue.average)
    	.reduce((r, [k, v]) => ({ ...r, [k]: v }), {});
	}

	console.log(weatherData);

	Object.entries(weatherData).forEach(([date, {tempList, average}], index) => {
		const wrapperWeather = document.createElement('div');
		const detailsDiv = document.createElement('div');
		const chartCanvas = document.createElement('canvas');
		const context = chartCanvas.getContext('2d');
		new Chart(context,  {
		    type: 'line',

		    data: {
		        labels: ['00:00', '03:00', '06:00', '09:00', '12:00', '15:00', '18:00', '21:00'].slice(8 - tempList.length),
		        datasets: [{
		            label: date,
		            borderColor: 'rgb(255, 99, 132)',
		            data: tempList,
		            pointStyle: iconsArray[date],
		        }]
    		},
    		options: {
    			tooltips: {
    				custom: function(tooltip){
    					if (!tooltip) return;
    					tooltip.displayColors = false;
    				},
    				callbacks: {
    					label: function(tooltipItem, data){
    						return `${tooltipItem.value} °C`
    					}
    				}

    			}
    		}
		});
		detailsDiv.appendChild(chartCanvas);
		detailsDiv.classList.add('hide');
		wrapperWeather.classList.add('daily-div');
		wrapperWeather.classList.add('flaticon-chevron-up');

		wrapperWeather.style.transition = "all 1s ease-out";
		wrapperWeather.style.opacity = 0;

		const weatherItemDiv = document.createElement('div');
		weatherItemDiv.classList.add('weather-of-day');

		const dateItemDiv = document.createElement('div');
		dateItemDiv.classList.add('date');

		const dateP = document.createElement('p');
		dateP.innerHTML = date;
		const temperatureP = document.createElement('p');
		temperatureP.innerHTML = `${average} C`
		const icoImg = document.createElement('img');
		icoImg.src = `http://openweathermap.org/img/w/${icons[date]}.png`;


		wrapperWeather.addEventListener('click', () => {
			document.querySelectorAll('.daily-div + div').forEach((element, elementIndex) => {
				if (!element.classList.contains('hide') && index !== elementIndex){
					element.classList.add('hide')
				}
			});
			detailsDiv.classList.toggle('hide')
		});

		setTimeout(() => {
	    	wrapperWeather.style.opacity = 1;
		}, 900);

		weatherItemDiv.appendChild(temperatureP);
		weatherItemDiv.appendChild(icoImg);
		dateItemDiv.appendChild(dateP);
		wrapperWeather.appendChild(dateItemDiv);
		wrapperWeather.appendChild(weatherItemDiv);
		weatherForecast.appendChild(wrapperWeather);
		weatherForecast.appendChild(detailsDiv);
		});

}


const getWeatherDataByCity = (city) => {
	toggleLoading();

	document.querySelector('.error').innerHTML = '';
	weatherWrapper.innerHTML = '';

	const currentWeatherUrl = `${BASE_URL}weather?q=${city}&appid=${API_KEY}`;
	const forecastUrl = `${BASE_URL}forecast?q=${city}&appid=${API_KEY}`;

	Promise.all([fetch(currentWeatherUrl), fetch(forecastUrl)])
		.then(([currentWeather, forecast]) => {
			return Promise.all([currentWeather.json(), forecast.json()]);
		})
		.then(([currentWeather, forecast]) => {
			toggleLoading();
			if (currentWeather.cod == 200 && forecast.cod == 200){
				const result = {
					currentWeather: currentWeather,
					forecast: forecast,
				};
				launchSite(result);
			}else{
				document.querySelector('.error').innerHTML = currentWeather.message || forecast.message;
			}
		})
		.catch(error => {
			toggleLoading();
			console.log(error.message);
		});
};

init();