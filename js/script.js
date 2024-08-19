let map, bounds;
const apiKey = "c3926d7198msh7f865f753f0716bp1348e9jsn75c8521a48ba";
// For Puplish =>  const apiKey = "YOUR_API_KEY"; // Use Your Api Key
const limit = 10;
const offset = 150;
const searchForm = document.querySelector("#searchForm");
const selectCountry = document.querySelector("#selectCountry");
const submit = document.querySelector("#submit");
submit.setAttribute("disabled", ""); // Initially disable the submit button


async function initMap() {
      // Initialize the Google Map
  map = new google.maps.Map(document.querySelector("#mapContainer"), {
    center: { lat: 51.507351, lng: -0.127758 },  // London coordinates
    zoom: 8,
    disableDefaultUI: true, // Disable default UI controls
  });
  bounds = new google.maps.LatLngBounds(); // Initialize bounds for fitting markers
}
window.initMap = initMap; // Make initMap available globally

let markers = []; // Array to store marker positions

const fetchCountries = async () => {
  // Fetch country data from the API
  const URL = `https://wft-geo-db.p.rapidapi.com/v1/geo/countries?limit=${limit}&offset=${offset}`;
  const options = {
      method: "GET",
      headers: {
          "X-RapidAPI-Key": apiKey,
          "X-RapidAPI-Host": "wft-geo-db.p.rapidapi.com",
      },
  };
  try {
      const response = await fetch(URL, options);
      const result = await response.json();
      return result; // Return the fetched country data
  } catch (error) {
      console.error("Error fetching countries:", error); // Log any errors
  }
};

async function getMarkers(country) {
  // Fetch marker data for the selected country
  const url = `https://hotels4.p.rapidapi.com/locations/v3/search?q=${country}`;
  const options = {
      method: "GET",
      headers: {
          "X-RapidAPI-Key": apiKey,
          "X-RapidAPI-Host": "hotels4.p.rapidapi.com",
      },
  };

  try {
      const response = await fetch(url, options);
      const result = await response.json();
      markers = []; // Clear previous markers

      result.sr.map((pos) => {
          const lat = parseFloat(pos.coordinates.lat);
          const lng = parseFloat(pos.coordinates.long);
          const position = { lat, lng };
          markers.push(position); // Add new marker positions
          bounds.extend(new google.maps.LatLng(position)); // Extend bounds to include new marker
      });

      submit.removeAttribute("disabled", ""); // Enable the submit button
  } catch (error) {
      console.error("Error fetching markers:", error); // Log any errors
  }
}

(async function loadCountries() {
  // Load country data and populate the dropdown
  const result = await fetchCountries();

  if (result && result.data) {
      for (let i = 0; i < result.data.length; i++) {
          const e = result.data[i];
          // Populate the select dropdown with country data
          selectCountry.innerHTML += `
      <option value="${e.name}" data-code="${e.code}">${e.name}</option>`;
      }

      // Add event listener to the select dropdown
      selectCountry.addEventListener("change", (e) => {
          const selectedCountry = e.target.value;
          getMarkers(selectedCountry); // Fetch markers for the selected country
      });
  }
})();


searchForm.addEventListener("submit", function (e) {
  e.preventDefault(); // Prevent the default form submission behavior

  const selectedCountry = selectCountry.value; // Get the selected country from the dropdown
  if (selectedCountry) { // Check if a country is selected
    getMarkers(selectedCountry).then(() => { // Fetch markers for the selected country
      markers.map((marker) => { // Iterate over the markers array
        new google.maps.Marker({ position: marker, map }); // Create a new marker on the map for each position
      });
      map.fitBounds(bounds); // Adjust the map view to fit all markers
      markers = []; // Clear the markers array
    });
  }
});
