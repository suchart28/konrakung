import { initializeApp } from "https://www.gstatic.com/firebasejs/12.5.0/firebase-app.js";
import { getDatabase, ref, onValue } from "https://www.gstatic.com/firebasejs/12.5.0/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyDGYuI3yxJbUTc6T_0pm6WiEKZul11tXS0",
  authDomain: "suchartwork-1487382986748.firebaseapp.com",
  databaseURL: "https://suchartwork-1487382986748.firebaseio.com",
  projectId: "suchartwork-1487382986748",
  storageBucket: "suchartwork-1487382986748.appspot.com",
  messagingSenderId: "353884592527",
  appId: "1:353884592527:web:4233ac2ae7eef075eb13fa"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

let userLat = null, userLng = null;

const map = L.map("map").setView([16.5, 102.8], 13);
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png").addTo(map);

navigator.geolocation.getCurrentPosition(pos => {
  userLat = pos.coords.latitude;
  userLng = pos.coords.longitude;
  L.marker([userLat, userLng]).addTo(map).bindPopup("ตำแหน่งของคุณ");
});

const markerGroup = L.layerGroup().addTo(map);

function navTo(lat, lng) {
  const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
  window.open(url, "_blank");
}

function loadShops() {
  onValue(ref(db, "shops"), snapshot => {
    markerGroup.clearLayers();
    const search = document.getElementById("searchBox").value.toLowerCase();
    const filter = document.getElementById("filterType").value;
    snapshot.forEach(item => {
      const shop = item.val();
      if (search && !shop.name.toLowerCase().includes(search)) return;
      if (filter && filter !== shop.type) return;

      const popup = `
        <div class="popup-title">${shop.name}</div>
        <div>${shop.type}</div>
        <div>${shop.desc}</div>
        <a class="nav-btn" onclick="navTo(${shop.lat},${shop.lng})">นำทาง</a>
      `;
      L.marker([shop.lat, shop.lng]).addTo(markerGroup).bindPopup(popup);
    });
  });
}

window.navTo = navTo;
loadShops();
document.getElementById("searchBox").oninput = loadShops;
document.getElementById("filterType").onchange = loadShops;
