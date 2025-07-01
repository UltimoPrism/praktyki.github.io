
const map =L.map('map', {
  doubleClickZoom: false
}).setView([52.2297, 21.0122], 13); // Warszawa

L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
  attribution: '&copy; <a href="https://carto.com/">CARTO</a> | © OpenStreetMap contributors'
}).addTo(map);
let startMarker
let endMarker
let polylines = [];
let fin = true;
let clickCount = 0;
let startPoint = null;
let endPoint = null;
let kolors = []

//Interakcja z mapą
map.on('dblclick', async function(e) {
  const latlng = [e.latlng.lat, e.latlng.lng];

  if (clickCount === 0) {
    startPoint = latlng;
    clickCount++;
    fin = false
    if (startMarker) {
      map.removeLayer(startMarker);
    }
    startMarker = L.marker(latlng, { draggable: true }).addTo(map).bindPopup("Start").openPopup()
    startMarker.on('dragend', async function (e) {
      const newStart = [startMarker.getLatLng().lat,startMarker.getLatLng().lng];
      console.log(newStart);
      fin = false;
      const address = await reverseGeocode(newStart);
      fin = true;
      document.getElementById("start").value = address;
    });
    const address = await reverseGeocode(latlng);
    fin = true
    document.getElementById("start").value = address;

  } else if (clickCount === 1) {
    endPoint = latlng;
    clickCount++
    if (endMarker) {
      map.removeLayer(startMarker);
    }
    endMarker = L.marker(latlng, { draggable: true }).addTo(map).bindPopup("Cel").openPopup()
    endMarker.on('dragend', async function (e) {
      const newEnd = [endMarker.getLatLng().lat,endMarker.getLatLng().lng];
      fin = false;
      const address = await reverseGeocode(newEnd);
      fin = true;
      document.getElementById("end").value = address; // ✅ fixed this line
    });
    fin = false
    const address = await reverseGeocode(latlng);
    fin = true
    document.getElementById("end").value = address;
  }
  else{
    if (startMarker) {
      map.removeLayer(startMarker);
    }
    if (endMarker) {
      map.removeLayer(startMarker);
    }
  }

});



//Koordynaty -> Ulica
async function reverseGeocode(latlng) {
  const url = `https://nominatim.openstreetmap.org/reverse?lat=${latlng[0]}&lon=${latlng[1]}&format=json`;
  try {
    const res = await fetch(url);
    const data = await res.json();
    return data.display_name || `${latlng[0]}, ${latlng[1]}`;
  } catch (e) {
    return `${latlng[0]}, ${latlng[1]}`;
  }
}
//Wyznacz trasę
document.getElementById('routeButton').addEventListener('click', async () => {
  if(!fin){return}
  const start = document.getElementById('start').value;
  const end = document.getElementById('end').value;
  if (!start || !end) {
    alert("Wpisz oba adresy!");
    return;
  }

  const startCoords = await geocode(start);
  const endCoords = await geocode(end);

  if (!startCoords || !endCoords) {
    alert("Nie znaleziono współrzędnych dla jednego z punktów.");
    return;
  }
  drawRoute(startCoords, endCoords);
});
//Ulica -> Koordynaty
async function geocode(address) {
  const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(address)}&format=json&limit=1`;
  const res = await fetch(url);
  const data = await res.json();
  if (data.length === 0) return null;
  return [parseFloat(data[0].lat), parseFloat(data[0].lon)];
}

async function drawRoute(start, end) {
  //Rodzaj poruszania się
   const profile = document.querySelector('input[name="profile"]:checked').value;
  // Wyczyść poprzednie
  polylines.forEach(p => map.removeLayer(p));
  document.getElementById('alternatives').innerHTML = "";
  kolors = [];

  if (startMarker) {
      map.removeLayer(startMarker);
  }
  if (endMarker) {
      map.removeLayer(endMarker);
  }
  startMarker = L.marker(start, { draggable: true }).addTo(map).bindPopup("Start").openPopup()
  startMarker.on('dragend', async function (e) {
    const newStart = [startMarker.getLatLng().lat,startMarker.getLatLng().lng];
    fin = false;
    const address = await reverseGeocode(newStart);
    fin = true;
    document.getElementById("start").value = address;
  });
  endMarker = L.marker(end, { draggable: true }).addTo(map).bindPopup("Start").openPopup()
  endMarker.on('dragend', async function (e) {
    const newEnd = [endMarker.getLatLng().lat,endMarker.getLatLng().lng];
    fin = false;
    const address = await reverseGeocode(newEnd);
    fin = true;
    document.getElementById("end").value = address; // ✅ fixed this line
  });
  console.log(JSON.stringify({
      coordinates: [[start[0], start[1]], [end[0], end[1]]],
      alternative_routes: {
        share_factor: 0.5,
        target_count: 3
      }
    }))
  const url = `https://api.openrouteservice.org/v2/directions/${profile}`;//Mało bezpieczne ale z GitHub pages nie wiem czy istnieje możliwość ukrycia Klucza.
  const res = await fetch(url, {
    method: "POST",
    headers: { 
    'Accept': 'application/json, application/geo+json, application/gpx+xml, img/png; charset=utf-8',
    'Authorization': '5b3ce3597851110001cf624857089426726c421bb5ae2c4cccaed7b6',
    'Content-Type': 'application/json; charset=utf-8' },
    body: JSON.stringify({
      coordinates: [[start[1], start[0]], [end[1], end[0]]],
      alternative_routes: {
        target_count: 2,
        share_factor: 0.6,
      }
    })
  });
  if(res.status == 400){
    alert("Trasa zbyt długa.")
    return
  }
  const data = await res.json();
  console.log("test")
  data.routes.forEach((route, i) => {
    kolors.push(random_rgba())
    const coords = decodePolyline(route.geometry)
    const polyline = L.polyline(coords, {
      color: kolors[i],
      weight: i === 0 ? 5 : 3,
      opacity: 0.7
    }).addTo(map);
    polylines.push(polyline);

    const distance = (route.summary.distance / 1000).toFixed(1);
    const duration = Math.round(route.summary.duration / 60);
    const li = document.createElement("li");
    li.innerHTML = `<span style="
      display:inline-block;
      width:10px;
      height:10px;
      border-radius:50%;
      background:${kolors[i]};
      margin-right:8px;
    "></span>Trasa ${i + 1}: ${distance} km, ${duration} min`;
    document.getElementById("alternatives").appendChild(li);
  });

  map.fitBounds(polylines[0].getBounds());
}
//Podpowiedzi
function setupAutocomplete(inputId, containerId) {
  const input = document.getElementById(inputId);
  const container = document.getElementById(containerId);

  input.addEventListener("input", async () => {
    const query = input.value;
    if (query.length < 3) {
      container.innerHTML = "";
      return;
    }

    const res = await fetch(`https://photon.komoot.io/api/?q=${encodeURIComponent(query)}&limit=5`);
    const data = await res.json();

    container.innerHTML = "";
    data.features.forEach(feature => {
      const div = document.createElement("div");
      div.textContent = feature.properties.name + (feature.properties.city ? `, ${feature.properties.city}` : "");
      div.addEventListener("click", () => {
        input.value = div.textContent;
        container.innerHTML = "";
      });
      container.appendChild(div);
    });
  });

  // Schowaj listę po kliknięciu poza pole
  document.addEventListener("click", (e) => {
    if (!container.contains(e.target) && e.target !== input) {
      container.innerHTML = "";
    }
  });
}

//Dekodowanie Geometrii
  function decodePolyline(encodedPolyline, includeElevation){
    // array that holds the points
    let points = []
    let index = 0
    const len = encodedPolyline.length
    let lat = 0
    let lng = 0
    let ele = 0
    while (index < len) {
      let b
      let shift = 0
      let result = 0
      do {
        b = encodedPolyline.charAt(index++).charCodeAt(0) - 63 // finds ascii
        // and subtract it by 63
        result |= (b & 0x1f) << shift
        shift += 5
      } while (b >= 0x20)

      lat += ((result & 1) !== 0 ? ~(result >> 1) : (result >> 1))
      shift = 0
      result = 0
      do {
        b = encodedPolyline.charAt(index++).charCodeAt(0) - 63
        result |= (b & 0x1f) << shift
        shift += 5
      } while (b >= 0x20)
      lng += ((result & 1) !== 0 ? ~(result >> 1) : (result >> 1))

      if (includeElevation) {
        shift = 0
        result = 0
        do {
          b = encodedPolyline.charAt(index++).charCodeAt(0) - 63
          result |= (b & 0x1f) << shift
          shift += 5
        } while (b >= 0x20)
        ele += ((result & 1) !== 0 ? ~(result >> 1) : (result >> 1))
      }
      try {
        let location = [(lat / 1E5), (lng / 1E5)]
        if (includeElevation) location.push((ele / 100))
        points.push(location)
      } catch (e) {
        console.log(e)
      }
    }
    return points
  }

//Losowe Kolory
function random_rgba() {
  var o = Math.round, r = Math.random, s = 255;
  return 'rgba(' + o(r()*s) + ',' + o(r()*s) + ',' + o(r()*s) + ',' +255+ ')';
}
//Sprawdzanie odległości darmowe API tylko do 350km 
function getDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // 🌍 Radius of Earth in kilometers
  const toRad = deg => deg * Math.PI / 180;

  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a = Math.sin(dLat / 2) ** 2 +
            Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
            Math.sin(dLon / 2) ** 2;

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // Distance in km
}

// Ustaw autouzupełnianie dla obu pól
setupAutocomplete("start", "autocomplete-start");
setupAutocomplete("end", "autocomplete-end");