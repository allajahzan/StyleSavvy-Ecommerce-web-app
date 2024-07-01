

// for user signin
function loadSignIn() {


    document.body.style.overflow = 'hidden';
    setTimeout(() => {
        document.getElementById('signIn_page').style.display = 'block'
        document.getElementById('signIn_page').style.visibility = 'hidden'
    }, 500);
    setTimeout(() => {
        document.getElementById('loading').style.display = 'none'
        document.getElementById('signIn_page').style.visibility = 'visible'
        document.body.style.overflow = '';
    }, 1000);



    // const form = document.getElementById('signin_form')
    // form.addEventListener('submit', async (e) => {
    //     e.preventDefault()

    //     const email = form[0].value
    //     const password = form[1].value

    //     const obj = {
    //         email: email,
    //         password: password
    //     }

    //     try {
    //         const resp = await fetch('/signIn', {
    //             method: 'POST',
    //             headers: {
    //                 'Content-type': 'application/json'
    //             },
    //             body: JSON.stringify(obj)
    //         })

    //         const data = await resp.json()

    //         const email_error = document.getElementById('email_error')
    //         const password_error = document.getElementById('password_error')

    //         if(data.type === 'error'){
    //             data.error_array.forEach(err => {
    //                 if(err.type === 'email'){
    //                     showError(form[0], email_error, err.msg)
    //                 }else if(err.type === 'ok_email'){
    //                     removeError(form[0], email_error)
    //                 }else{
    //                     showError(form[1], password_error, err.msg)
    //                 }
    //             });
    //         }else if(data.type === 'blocked'){
    //               showSnackBar(data.msg)
    //               removeError(form[0], email_error)
    //               removeError(form[1], password_error)
    //         }
    //         else{
    //             form.reset()
    //             removeError(form[1], password_error)
    //             removeError(form[0], email_error)
    //             document.getElementById('snackbar_icon').innerHTML = 'task_alt'
    //             document.getElementById('snackbar_icon').style.color = 'green'
    //             window.location.href = '/home'
    //         }

    //     } catch (err) {
    //         console.log(err);
    //         // window.location.href = '/500-Server-Error'
    //     }

    // })

    const form = document.getElementById('signin_form')
    form.addEventListener('submit', async (e) => {

        e.preventDefault()

        document.getElementById('signin_btn').setAttribute('disabled', 'disabled');
        document.getElementById('signin_btn').style.opacity = '0.8';

        const email = form[0].value
        const password = form[1].value

        const obj = {
            email: email,
            password: password
        }

        try {
            const resp = await fetch('/signIn', {
                method: 'POST',
                headers: {
                    'Content-type': 'application/json'
                },
                body: JSON.stringify(obj)
            })

            const data = await resp.json()

            const email_error = document.getElementById('email_signin_error')
            const password_error = document.getElementById('password_signin_error')
            const visibility = document.getElementById('password_visibility3')

            if (data.type === 'email') {
                showError(form[0], email_error, data.msg)
                setTimeout(() => {
                    removeError(form[0], email_error, email)
                    document.getElementById('signin_btn').removeAttribute('disabled')
                    document.getElementById('signin_btn').style.opacity = '1'
                }, 2000);

            } else if (data.type === 'blocked') {
                showSnackBar(data.msg)
            }
            else if (data.type === 'password') {
                showError(form[1], password_error, data.msg, visibility)
                setTimeout(() => {
                    document.getElementById('signin_btn').removeAttribute('disabled')
                    document.getElementById('signin_btn').style.opacity = '1'
                    removeError(form[1], password_error, password, visibility)
                }, 2000);
            } else {

                const url = localStorage.getItem('url')

                if(url === null){
                    window.location.href = '/home'
                }else{
                    window.location.href = url
                }
                
            }
        } catch (err) {
            console.log(err);
            // window.location.href = '/500-Server-Error'
        }

    })
}

// show snack bar
function showSnackBar(text) {
    document.getElementById('snackbar_msg').innerHTML = text
    const x = document.getElementById("snackbar");
    x.className = "show";
    setTimeout(function () {
        x.className = x.className.replace("show", "");
        document.getElementById('snackbar_icon').innerHTML = 'error'
        document.getElementById('snackbar_icon').style.color = 'red'
    }, 3000);
}

// show and remove Errors

// function showError(input, para, msg) {
//     para.innerHTML = msg
//     input.style.borderColor = 'red'
//     input.style.borderWidth = '1px'
//     input.style.borderStyle = 'solid'
// }

// function removeError(input, para) {
//     para.innerHTML = ''
//     input.style.borderColor = ''
//     input.style.borderWidth = '1px'
//     input.style.borderStyle = 'solid'
// }

function showError(input, err, msg, visibility) {
    input.style.color = 'red'
    input.style.borderColor = 'red'
    input.value = msg
    input.type = 'text'
    input.removeAttribute('required')
    input.setAttribute('readOnly', 'readOnly')
    err.innerHTML = 'error'
    if (visibility) {
        visibility.style.display = 'none'
    }
}

function removeError(input, err, msg, visibility) {
    input.value = msg
    input.style.borderColor = ''
    input.style.color = 'black'
    input.removeAttribute('readOnly')
    input.setAttribute('required', 'required')
    err.innerHTML = ''
    if (visibility) {
        visibility.style.display = 'block'
        visibility.innerHTML = 'visibility'
        input.type = 'text'
    }
}



//show Password SignIn

function showPasswordSignIn() {
    const password = document.getElementById('singin-password-2');
    const password_visibility = document.getElementById('password_visibility3');
    if (password_visibility.innerText === "visibility_off") {
        password_visibility.innerText = "visibility";
        password.type = "text";
    } else {
        password_visibility.innerText = "visibility_off";
        password.type = "password";
    }
}


// for got password button

function forgotPassword() {
    window.location.href = '/forgotPassword?'
}

