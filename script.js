'use strict';

// prettier-ignore
const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const form = document.querySelector('.form');
const containerWorkouts = document.querySelector('.workouts');
const inputType = document.querySelector('.form__input--type');
const inputDistance = document.querySelector('.form__input--distance');
const inputDuration = document.querySelector('.form__input--duration');
const inputCadence = document.querySelector('.form__input--cadence');
const inputElevation = document.querySelector('.form__input--elevation');

if (navigator.geolocation) {
  navigator.geolocation.getCurrentPosition(
    (position) => {
      console.log('position', position);

      const { latitude, longitude } = position.coords;

      // console.log(`https://www.google.pt/maps/@${latitude},${longitude}`);

      const coords = [latitude, longitude];
      const zoomLevel = 13;

      // 'map' must be the same name with an `id` in an HTML element for rendering map in HTML
      const map = L.map('map').setView(coords, zoomLevel);

      // tile layer is where you can change map theme
      // for more theme, see: https://leaflet-extras.github.io/leaflet-providers/preview/
      L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(map);

      map.on('click', (mapEvent) => {
        console.log(mapEvent);
        const { lat, lng } = mapEvent.latlng;

        // marker and popup when click on a specific location in the map
        L.marker([lat, lng]).addTo(map).bindPopup('Workout').openPopup();
      });
    },
    (err) => console.log('err', err)
  );
}
