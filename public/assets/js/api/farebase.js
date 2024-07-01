
// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-app.js";
import { getAuth, signInWithPopup, GoogleAuthProvider } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-auth.js";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyB1puJBYRMn8y6heJGrCnDjCqrQmH31fKk",
    authDomain: "stylesavvy-2d944.firebaseapp.com",
    projectId: "stylesavvy-2d944",
    storageBucket: "stylesavvy-2d944.appspot.com",
    messagingSenderId: "537406649736",
    appId: "1:537406649736:web:dd68c2654fd7899a9c363d"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
auth.languageCode = 'en';
const provider = new GoogleAuthProvider();


const btn = document.getElementById('google_login_btn')

btn.addEventListener('click', () => {
    signInWithPopup(auth, provider)
        .then((result) => {
            const credential = GoogleAuthProvider.credentialFromResult(result);
            const user = result.user;

            const obj = {
                name: user.displayName,
                email: user.email // Use user.email instead of email
            };

            console.log(user);

            fetch('/user/google', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(obj)
            }).then((resp) => {
                return resp.json();
            }).then((data) => {

                if (data.type === 'error') {
                    showSnackBar(data.msg)
                } else {
                    const url = localStorage.getItem('url')

                    if(url === null){
                        window.location.href = '/home'
                    }else{
                        window.location.href = url
                    }

                    
                }

            }).catch((error) => {
                // Handle fetch request errors
                console.error('Fetch error:', error);
                window.location.href = '/500-Server-Error'
            });
        }).catch((error) => {
            // Handle sign-in errors
            const errorCode = error.code;
            const errorMessage = error.message;
            const email = error.customData.email;
            const credential = GoogleAuthProvider.credentialFromError(error);
            console.error('Sign-in error:', errorCode, errorMessage);
            window.location.href = '/500-Server-Error'
        });
});


// show snack bar
function showSnackBar(text) {
    document.getElementById('snackbar_msg').innerHTML = text
    const x = document.getElementById("snackbar");
    x.className = "show";
    setTimeout(function () { x.className = x.className.replace("show", ""); }, 3000);
}






















































































































































































