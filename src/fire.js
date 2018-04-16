import firebase from 'firebase'
var config = {
    apiKey: "AIzaSyCA3uihCBSy6d_GMv747yoigN6L-HeE_3Y",
    authDomain: "rockpaperscisors-5155a.firebaseapp.com",
    databaseURL: "https://rockpaperscisors-5155a.firebaseio.com",
    projectId: "rockpaperscisors-5155a",
    storageBucket: "rockpaperscisors-5155a.appspot.com",
    messagingSenderId: "147445391912"
  };
var fire = firebase.initializeApp(config);
export default fire;