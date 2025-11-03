// Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.5.0/firebase-app.js";
import { getDatabase, ref, onValue } from "https://www.gstatic.com/firebasejs/12.5.0/firebase-database.js";

// Firebase Config (ใช้ของคุณ)
const firebaseConfig = {
  apiKey: "AIzaSyDGYuI3yxJbUTc6T_0pm6WiEKZul11tXS0",
  authDomain: "suchartwork-1487382986748.firebaseapp.com",
  databaseURL: "https://suchartwork-1487382986748.firebaseio.com",
  projectId: "suchartwork-1487382986748",
  storageBucket: "suchartwork-1487382986748.firebasestorage.app",
  messagingSenderId: "353884592527",
  appId: "1:353884592527:web:4233ac2ae7eef075eb13fa"
};

// Init Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const shopRef = ref(db, "shops");

// --- Map Setup ---
const map = L.map('map').setView([16.4419, 102.8350], 13); // Default ขอนแก่น

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 19
}).addTo(map);

// --- Marker Icons ---
const icons = {
  "อาหารเครื่องดื่ม": L.icon({ iconUrl: "pin_food.png", iconSize: [40, 40] }),
  "ค้าปลีก": L.icon({ iconUrl: "pin_shop.png", iconSize: [40, 40] }),
  "บริการ": L.icon({ iconUrl: "pin_service.png", iconSize: [40, 40] })
};

let userLocation = null;
let markers = [];

// --- Track User Location ---
navigator.geolocation.watchPosition(pos => {
  userLocation = [pos.coords.latitude, pos.coords.longitude];
  L.circleMarker(userLocation, { radius: 8 }).addTo(map);
});

// --- Load Shops ---
onValue(shopRef, (snapshot) => {
  const data = snapshot.val();
  markers.forEach(m => map.removeLayer(m)); // Clear old markers
  markers = [];

  for (let id in data) {
    const shop = data[id];

    const marker = L.marker([shop.lat, shop.lng], {
      icon: icons[shop.type] || icons["อาหารเครื่องดื่ม"]
    });

    let distanceText = "";
    if (userLocation) {
      const dist = calcDistance(userLocation[0], userLocation[1], shop.lat, shop.lng);
      distanceText = `<br>📍 ระยะจากคุณ: <b>${dist.toFixed(1)} กม.</b>`;
    }

   marker.bindPopup(`
  <b>${shop.name}</b><br>
  ประเภท: ${shop.type}<br>
  ${shop.desc || ""}${distanceText}
  <br><br>
  <a href="https://www.google.com/maps/dir/?api=1&destination=${shop.lat},${shop.lng}" 
     target="_blank" 
     style="display:inline-block;padding:10px 14px;background:#0d47a1;color:white;border-radius:6px;text-decoration:none;font-size:1.1rem;">
     🧭 นำทางไปยังร้าน
  </a>
`);

    marker.addTo(map);
    markers.push({ marker, type: shop.type });
  }
});

// --- Filter Buttons ---
document.querySelectorAll("#filter-bar button").forEach(btn => {
  btn.onclick = () => {
    document.querySelectorAll("#filter-bar button").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    filterMarkers(btn.dataset.type);
  };
});

function filterMarkers(type) {
  markers.forEach(obj => {
    if (type === "all" || obj.type === type) {
      map.addLayer(obj.marker);
    } else {
      map.removeLayer(obj.marker);
    }
  });
}

// --- Calculate Distance (km) ---
function calcDistance(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI/180;
  const dLon = (lon2 - lon1) * Math.PI/180;
  const a =
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1*Math.PI/180) * Math.cos(lat2*Math.PI/180) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}
