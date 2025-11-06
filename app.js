import { initializeApp } from "https://www.gstatic.com/firebasejs/12.5.0/firebase-app.js";
import { getDatabase, ref, onValue } from "https://www.gstatic.com/firebasejs/12.5.0/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyDGYuI3yxJbUTc6T_0pm6WiEKZul11tXS0",
  authDomain: "suchartwork-1487382986748.firebaseapp.com",
  databaseURL: "https://suchartwork-1487382986748.firebaseio.com",
  projectId: "suchartwork-1487382986748",
  storageBucket: "suchartwork-1487382986748.firebasestorage.app",
  messagingSenderId: "353884592527",
  appId: "1:353884592527:web:4233ac2ae7eef075eb13fa"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

let map = L.map("map").setView([16.4419, 102.835], 13);
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png").addTo(map);

const foodIcon = L.icon({ iconUrl: "pin_food.png", iconSize: [40, 40] });
const retailIcon = L.icon({ iconUrl: "pin_shop.png", iconSize: [40, 40] });
const serviceIcon = L.icon({ iconUrl: "pin_service.png", iconSize: [40, 40] });

let markers = [];
let storeData = {};
let currentFilter = "ทั้งหมด";
let searchKeyword = "";

onValue(ref(db, "stores"), (snapshot) => {
  storeData = snapshot.val() || {};
  refreshMarkers();
});

function refreshMarkers() {
  markers.forEach(m => map.removeLayer(m));
  markers = [];

  let total = 0, f=0,r=0,s=0;
  const kw = searchKeyword.trim().toLowerCase();

  Object.keys(storeData).forEach(id => {
    const o = storeData[id];
    total++;
    if (o.type === "ร้านอาหารเครื่องดื่ม") f++;
    if (o.type === "ร้านค้าปลีก") r++;
    if (o.type === "ร้านบริการ") s++;

    if (currentFilter !== "ทั้งหมด" && currentFilter !== o.type) return;
    if (kw && !o.name.toLowerCase().includes(kw)) return;

    const icon = o.type === "ร้านอาหารเครื่องดื่ม" ? foodIcon :
                 o.type === "ร้านค้าปลีก" ? retailIcon : serviceIcon;

    let m = L.marker([o.lat, o.lng], { icon }).addTo(map);
    m.bindPopup(`
      <b>${o.name}</b><br>${o.type}<br>${o.desc}<br>
      <a target="_blank" href="https://www.google.com/maps/dir/?api=1&destination=${o.lat},${o.lng}">
        นำทางไปที่นี่
      </a>
    `);
    markers.push(m);
  });

  document.getElementById("storeCount").innerText = `รวม ${total} ร้าน`;
  btnFood.innerText = `ร้านอาหาร (${f})`;
  btnRetail.innerText = `ร้านค้าปลีก (${r})`;
  btnService.innerText = `ร้านบริการ (${s})`;
}

document.getElementById("searchBox").oninput = e => {
  searchKeyword = e.target.value;
  refreshMarkers();
};

function setFilter(v){
  currentFilter=v;
  document.querySelectorAll(".filter-bar button").forEach(b=>b.classList.remove("active"));
  if(v==="ทั้งหมด") btnAll.classList.add("active");
  if(v==="ร้านอาหารเครื่องดื่ม") btnFood.classList.add("active");
  if(v==="ร้านค้าปลีก") btnRetail.classList.add("active");
  if(v==="ร้านบริการ") btnService.classList.add("active");
  refreshMarkers();
}

btnAll.onclick = ()=>setFilter("ทั้งหมด");
btnFood.onclick = ()=>setFilter("ร้านอาหารเครื่องดื่ม");
btnRetail.onclick = ()=>setFilter("ร้านค้าปลีก");
btnService.onclick = ()=>setFilter("ร้านบริการ");
