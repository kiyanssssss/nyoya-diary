// firebase-messaging-sw.js
// This file MUST live at the ROOT of your GitHub Pages site (same folder as index.html),
// not inside any subfolder — that's a browser requirement for service workers.
//
// It receives push notifications sent by the GitHub Actions checker and shows them
// even when this site/tab is completely closed.

importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyATgCutd78kMRTPk9W-wxZaN-vp4xelOvM",
  authDomain: "nyoya-diary.firebaseapp.com",
  projectId: "nyoya-diary",
  storageBucket: "nyoya-diary.firebasestorage.app",
  messagingSenderId: "261530141158",
  appId: "1:261530141158:web:c60b0e281e85a17c625627"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  const title = (payload.notification && payload.notification.title) || 'Our Little Diary 💛';
  const body = (payload.notification && payload.notification.body) || '';
  self.registration.showNotification(title, {
    body,
    icon: 'https://em-content.zobj.net/source/apple/391/love-letter_1f48c.png',
    badge: 'https://em-content.zobj.net/source/apple/391/love-letter_1f48c.png'
  });
});
