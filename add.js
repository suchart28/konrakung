import { initializeApp } from "https://www.gstatic.com/firebasejs/12.5.0/firebase-app.js";
import { getDatabase, ref, push } from "https://www.gstatic.com/firebasejs/12.5.0/firebase-database.js";

const firebaseConfig = { /* same config as app.js */ };
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

document.getElementById("saveBtn").onclick = () => {
  navigator.geolocation.getCurrentPosition(pos => {
    push(ref(db, "shops"), {
      name: document.getElementById("name").value,
      type: document.getElementById("type").value,
      desc: document.getElementById("desc").value,
      lat: pos.coords.latitude,
      lng: pos.coords.longitude
    });
    alert("บันทึกแล้ว");
    location.href = "index.html";
  });
};
