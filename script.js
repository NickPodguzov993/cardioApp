'use strict';

const form = document.querySelector('.form');
const containerWorkouts = document.querySelector('.workouts');
const inputType = document.querySelector('.form__input--type');
const inputDistance = document.querySelector('.form__input--distance');
const inputDuration = document.querySelector('.form__input--duration');
const inputTemp = document.querySelector('.form__input--temp');
const inputElevation = document.querySelector('.form__input--climb');

class Workout {
  date = new Date();
  id = (Date.now() + '').slice(-10);

  constructor(coords, distance, duration) {
    this.coords = coords;
    this.distance = distance;
    this.duration = duration;
  }
}

class Running extends Workout {

  type = 'running'

  constructor(coords, distance, duration, temp) {
    super(coords, distance, duration);
    this.temp = temp;
    this.calculatePace();
  }

  calculatePace() {
    this.pace = this.duration / this.distance;
  }
}

class Cycling extends Workout {

  type = 'cycling'

  constructor(coords, distance, duration, climb) {
    super(coords, distance, duration);
    this.climb = climb;
    this.calculateSpeed();
  }

  calculateSpeed() {
    this.speed = this.distance / this.duration / 60;
  }
}

class App {
  #map;
  #mapEvent;
  #workouts = []

  constructor() {

    this._getPosition();

    form.addEventListener('submit', this._newWorkout.bind(this));

    inputType.addEventListener('change', this._toggleClimbField);
  }

  _getPosition() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        this._loadMap.bind(this), function() {
          alert('Невозможно определить местоположение');
        });
    }
  }

  _loadMap(position) {
    const { latitude } = position.coords;
    const { longitude } = position.coords;
    console.log(`https://www.google.com/maps/@${latitude},${longitude},16z`);
    const coords = [latitude, longitude];
    this.#map = L.map('map').setView(coords, 13);

    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(this.#map);


    this.#map.on('click', this._showForm.bind(this));

  }

  _showForm(e) {
    this.#mapEvent = e;
    form.classList.remove('hidden');
    inputDistance.focus();
  }

  _toggleClimbField() {
    inputElevation.closest('.form__row').classList.toggle('form__row--hidden');
    inputTemp.closest('.form__row').classList.toggle('form__row--hidden');
  }

  _newWorkout(e) {

    const areNumbers = (...numbers) => numbers.every(num => Number.isFinite(num));

    const areNumberPositive = (...numbers) => numbers.every(num => num > 0);


    e.preventDefault();

    const { lat, lng } = this.#mapEvent.latlng;
    let workout
    // получить данные из формы
    const type = inputType.value;
    const distance = +inputDistance.value;
    const duration = +inputDuration.value;
    // проверка валидности данных

    // если тренировка является пробежкой создать объект Running
    if (type === 'running') {
      const temp = +inputTemp.value;
      if (!areNumbers(distance, duration, temp) ||
        areNumberPositive(distance, duration, temp)) {
        return alert('Введите положительное число');
      }
       workout = new Running([lat,lng], distance,duration,temp)

    }

    // если тренировка является велотренировкой создать объект Cycling
    if (type === 'cycling') {

      const climb = +inputElevation.value;
      if (/*!Number.isFinite(distance)
        || !Number.isFinite(duration)
        || !Number.isFinite(climb)*/
        !areNumbers(distance, duration, climb) ||
        areNumberPositive(distance, duration)) {
        return alert('Введите положительное число');
      }
       workout = new Cycling([lat,lng], distance,duration,climb)

    }
    // добавить  новый обьект в массив тренировок
    this.#workouts.push(workout)
    // отобразить тренировку на карте

    this.displayWorkout(workout)


    inputDistance.value =
      inputDuration.value =
        inputTemp.value =
          inputElevation.value = '';

  }

  displayWorkout(workout) {
    L.marker(workout.coords)
      .addTo(this.#map)
      .bindPopup(
        L.popup({
          maxWidth: 200,
          minWidth: 100,
          autoClose: false,
          closeOnClick: false,
          className: `${workout.type}-popup`
        }))
      .setPopupContent('Тренировка')
      .openPopup();
  }
}

const app = new App();




