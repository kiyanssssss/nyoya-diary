import { db, auth, storage } from "./firebase.js";

const today = document.getElementById("today");

today.textContent = new Date().toLocaleDateString("id-ID", {
  weekday: "long",
  day: "numeric",
  month: "long",
  year: "numeric"
});

console.log("✅ Firebase Connected");
console.log(db);
console.log(auth);
console.log(storage);
