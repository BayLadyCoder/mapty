'use strict';

// prettier-ignore
const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

class Workout {
  date = new Date();

  // creating unique identity
  id = (Date.now() + '').slice(-10);

  constructor(coords, distance, duration) {
    this.coords = coords; // [lat, lng]
    this.distance = distance; // in km
    this.duration = duration; // in min
  }
}

class Running extends Workout {
  type = 'running';

  constructor(coords, distance, duration, cadence) {
    super(coords, distance, duration);
    this.cadence = cadence;
    this.calcPace();
  }

  calcPace() {
    // min/km
    this.pace = this.duration / this.distance;
    return this.pace;
  }
}

class Cycling extends Workout {
  type = 'cycling';

  constructor(coords, distance, duration, elevationGain) {
    super(coords, distance, duration);
    this.elevationGain = elevationGain;
    this.calcSpeed();
  }

  calcSpeed() {
    // km/h
    this.speed = this.distance / (this.duration / 60);
    return this.speed;
  }
}

// ------------------------- //
// APPLICATION ARCHITECTURE

const form = document.querySelector('.form');
const containerWorkouts = document.querySelector('.workouts');
const inputType = document.querySelector('.form__input--type');
const inputDistance = document.querySelector('.form__input--distance');
const inputDuration = document.querySelector('.form__input--duration');
const inputCadence = document.querySelector('.form__input--cadence');
const inputElevation = document.querySelector('.form__input--elevation');

class App {
  // private properties
  #map;
  #mapEvent;
  #workouts = [];

  constructor() {
    this._getPosition();

    form.addEventListener('submit', this._newWorkout.bind(this));
    inputType.addEventListener('change', this._toggleElevationField);
  }

  // _ prefix is convention of private methods
  _getPosition() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        this._loadMap.bind(this),
        (err) => console.log('err', err)
      );
    }
  }
  _loadMap(position) {
    console.log('position', position);

    const { latitude, longitude } = position.coords;

    // console.log(`https://www.google.pt/maps/@${latitude},${longitude}`);

    const coords = [latitude, longitude];
    const zoomLevel = 13;

    // 'map' must be the same name with an `id` in an HTML element for rendering map in HTML
    this.#map = L.map('map').setView(coords, zoomLevel);

    // tile layer is where you can change map theme
    // for more theme, see: https://leaflet-extras.github.io/leaflet-providers/preview/
    L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(this.#map);

    this.#map.on('click', this._showForm.bind(this));
  }
  _showForm(mapE) {
    this.#mapEvent = mapE;
    form.classList.remove('hidden');
    inputDistance.focus();
  }
  _toggleElevationField() {
    // The closest() method of the Element interface
    // traverses the element and its parents
    // (heading toward the document root) until it finds a node
    // that matches the specified CSS selector.
    inputElevation.closest('.form__row').classList.toggle('form__row--hidden');
    inputCadence.closest('.form__row').classList.toggle('form__row--hidden');
  }
  _newWorkout(e) {
    e.preventDefault();

    const validInputs = (...inputs) => {
      return inputs.every((input) => Number.isFinite(input));
    };

    const allPositive = (...inputs) => inputs.every((input) => input > 0);

    // Get data from form
    const type = inputType.value;
    const distance = +inputDistance.value; // convert string to number
    const duration = +inputDuration.value;
    const { lat, lng } = this.#mapEvent.latlng;
    let workout;

    // Check if data is valid

    // If workout is running, create running object
    if (type === 'running') {
      const cadence = +inputCadence.value;

      // check if data is valid
      if (
        !validInputs(distance, duration, cadence) ||
        !allPositive(distance, duration, cadence)
      ) {
        return alert('Inputs have to be positive numbers! 1');
      }

      workout = new Running([lat, lng], distance, duration, cadence);
    }

    // If workout is cycling, create cycling object
    if (type === 'cycling') {
      const elevation = +inputElevation.value;

      // check if data is valid
      if (
        !validInputs(distance, duration, elevation) ||
        !allPositive(distance, duration)
      ) {
        return alert('Inputs have to be positive numbers! 2');
      }

      workout = new Cycling([lat, lng], distance, duration, elevation);
    }

    this.#workouts.push(workout);
    console.log('app this', this);

    // Add new object to workout array

    // Render workout on map as marker
    this._renderWorkoutMarker(workout);

    // Render workout on list

    // Hide form and clear input fields;
    inputDistance.value = '';
    inputDuration.value = '';
    inputCadence.value = '';
    inputElevation.value = '';
  }

  _renderWorkoutMarker(workout) {
    console.log('workout', workout);
    // create marker, add marker to the map, bind popup to the marker, and open it when click on a specific location in the map
    L.marker(workout.coords)
      .addTo(this.#map)
      .bindPopup(
        L.popup({
          maxWidth: 250,
          minWidth: 100,
          autoClose: false,
          closeOnClick: false,
          className: `${workout.type}-popup`,
        })
      )
      .setPopupContent('Workout')
      .openPopup();
  }
}

const app = new App();
