import { getFirestore, collection, addDoc, onSnapshot } 
  from "https://www.gstatic.com/firebasejs/12.5.0/firebase-firestore.js";

const db = getFirestore();
const storesCol = collection(db, "stores");

// Map setup
const map = L.map('map').setView([16.4419,102.8350], 12);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 19
}).addTo(map);

// Create colored icons
function icon(color){
  return L.divIcon({
    html:`<div style="width:18px;height:18px;border-radius:9px;background:${color};border:2px solid white;box-shadow:0 0 4px rgba(0,0,0,0.5)"></div>`,
    className:""
  });
}
const icons = {
  food: icon("red"),
  retail: icon("blue"),
  service: icon("green")
};

// Temporary draggable marker
let tempMarker = L.marker([16.4419,102.8350],{draggable:true}).addTo(map);

// Use GPS button
document.getElementById("useLocationBtn").onclick = () => {
  navigator.geolocation.getCurrentPosition(pos => {
    const lat = pos.coords.latitude, lng = pos.coords.longitude;
    tempMarker.setLatLng([lat,lng]);
    map.flyTo([lat,lng], 16);
  }, () => alert("ไม่สามารถเข้าถึงตำแหน่ง GPS ได้"));
};

// Save store button
document.getElementById("saveBtn").onclick = async () => {
  const name = document.getElementById("name").value.trim();
  const type = document.getElementById("type").value;
  const desc = document.getElementById("desc").value.trim();
  const { lat, lng } = tempMarker.getLatLng();

  if(!name){
    alert("กรุณากรอกชื่อร้าน");
    return;
  }

  await addDoc(storesCol, { name, type, desc, lat, lng, timestamp: Date.now() });
  alert("บันทึกข้อมูลเรียบร้อย ✅");
};

// Real-time update map
onSnapshot(storesCol, snapshot => {
  snapshot.docChanges().forEach(change => {
    const d = change.doc.data();
    L.marker([d.lat,d.lng], { icon: icons[d.type] })
      .addTo(map)
      .bindPopup(`<b>${d.name}</b><br>${d.desc || ""}`);
  });
});
