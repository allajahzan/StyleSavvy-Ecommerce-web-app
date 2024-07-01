// for user signUp with email verification

function loadSignUp() {

    localStorage.clear()
    // const form = document.getElementById('signup_form');

    // form.addEventListener('submit', async (e) => {
    //     e.preventDefault();

    //     try {
    //         const resp = await fetch('/signUp', {
    //             method: 'POST',
    //             headers: {
    //                 'Content-type': 'application/json'
    //             },
    //             body: JSON.stringify({
    //                 name: form[0].value,
    //                 email: form[1].value,
    //                 phoneNo: form[2].value,
    //                 password: form[3].value,
    //                 cpassword: form[4].value
    //             })
    //         })

    //         const data = await resp.json()

    //         const name = form[0]
    //         const email = form[1]
    //         const phoneNo = form[2]
    //         const password = form[3]
    //         const cpassword = form[4]

    //         const name_err = document.getElementById('name_error')
    //         const email_err = document.getElementById('email_error')
    //         const phoneNo_err = document.getElementById('phone_error')
    //         const passsword_err = document.getElementById('p1_error')
    //         const cpassword_err = document.getElementById('p2_error')
    //         // const visibility1 = document.getElementById('password_visibility1')
    //         // const visibility2 = document.getElementById('password_visibility2')

    //         if (data.type === 'error') {
    //             document.getElementById('signup_btn').removeAttribute('disabled')
    //             document.getElementById('signup_btn').style.opacity = '1'
    //             data.error_array.forEach(err => {

    //                 if (err.type === 'name') {
    //                     showError(name, name_err, err.msg)
    //                 } else if (err.type === 'email') {
    //                     showError(email, email_err, err.msg)
    //                 } else if (err.type === 'phoneNo') {
    //                     showError(phoneNo, phoneNo_err, err.msg)
    //                 } else if (err.type === 'password') {
    //                     showError(password, passsword_err, err.msg)
    //                 } else if (err.type === 'cpassword') {
    //                     showError(cpassword, cpassword_err, err.msg)
    //                 } else if (err.type === 'ok_name') {
    //                     removeError(name, name_err)
    //                 } else if (err.type === 'ok_email') {
    //                     removeError(email, email_err)
    //                 } else if (err.type === 'ok_phone') {
    //                     removeError(phoneNo, phoneNo_err)
    //                 } else if (err.type === 'ok_p1') {
    //                     removeError(password, passsword_err)
    //                 } else {
    //                     removeError(cpassword, cpassword_err)
    //                 }

    //             });
    //         } else {
    //             document.getElementById('signup_btn').setAttribute('disabled','disabled')
    //             document.getElementById('signup_btn').style.opacity = '0.8'
    //             removeError(name, name_err)
    //             removeError(email, email_err)
    //             removeError(phoneNo, phoneNo_err)
    //             removeError(password, passsword_err)
    //             removeError(cpassword, cpassword_err)
    //             document.getElementById('snackbar_icon').innerHTML = 'task_alt'
    //             document.getElementById('snackbar_icon').style.color = 'rgb(37, 199, 37)'
    //             showSnackBar('OTP has been sent your email')
    //             setTimeout(() => {
    //                 window.location.href = '/verifyEmail'
    //             }, 2000);
    //         }

    //     } catch (err) {
    //         console.log(err);
    //         window.location.href = '/500-Server-Error'
    //     }

    // })


    const form = document.getElementById('signup_form');

    form.addEventListener('submit', async (e) => {

        e.preventDefault();

        document.getElementById('signup_btn').setAttribute('disabled', 'disabled');
        document.getElementById('signup_btn').style.opacity = '0.8';

        const formData = new FormData(form)
        const obj = Object.fromEntries(formData)

        try {
            const resp = await fetch('/signUp', {
                method: 'POST',
                headers: {
                    'Content-type': 'application/json'
                },
                body: JSON.stringify(obj)
            })

            const data = await resp.json()

            const name = form[0]
            const email = form[1]
            const phoneNo = form[2]
            const password = form[3]
            const cpassword = form[4]

            const name_err = document.getElementById('name_error')
            const email_err = document.getElementById('email_error')
            const phoneNo_err = document.getElementById('phoneNo_error')
            const passsword_err = document.getElementById('password_error')
            const cpassword_err = document.getElementById('cpassword_error')
            const visibility1 = document.getElementById('password_visibility1')
            const visibility2 = document.getElementById('password_visibility2')


            if (data.type === 'name') {
                showError(name, name_err, data.msg)
                setTimeout(() => {
                    document.getElementById('signup_btn').removeAttribute('disabled')
                    document.getElementById('signup_btn').style.opacity = '1'
                    removeError(name, name_err, obj.name)
                }, 2000);
            } else if (data.type === 'email') {
                showError(email, email_err, data.msg)
                setTimeout(() => {
                    document.getElementById('signup_btn').removeAttribute('disabled')
                    document.getElementById('signup_btn').style.opacity = '1'
                    removeError(email, email_err, obj.email)
                }, 2000);
            } else if (data.type === 'phoneNo') {
                showError(phoneNo, phoneNo_err, data.msg)
                setTimeout(() => {
                    document.getElementById('signup_btn').removeAttribute('disabled')
                    document.getElementById('signup_btn').style.opacity = '1'
                    removeError(phoneNo, phoneNo_err, obj.phoneNo)
                }, 2000);
            } else if (data.type === 'password') {
                showError(password, passsword_err, data.msg, visibility1)
                setTimeout(() => {
                    document.getElementById('signup_btn').removeAttribute('disabled')
                    document.getElementById('signup_btn').style.opacity = '1'
                    removeError(password, passsword_err, obj.password, visibility1)
                }, 2000);
            } else if (data.type === 'cpassword') {
                showError(cpassword, cpassword_err, data.msg, visibility2)
                setTimeout(() => {
                    document.getElementById('signup_btn').removeAttribute('disabled')
                    document.getElementById('signup_btn').style.opacity = '1'
                    removeError(cpassword, cpassword_err, obj.cpassword, visibility2)
                }, 2000);
            } else {
                window.location.href = '/verifyEmail'
            }
        } catch (err) {
            console.log(err);
            window.location.href = '/500-Server-Error'
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

// show password SignUp1

function showPasswordSignUp1() {
    const password = document.getElementById('password1');
    const password_visibility = document.getElementById('password_visibility1');
    if (password_visibility.innerText === "visibility_off") {
        password_visibility.innerText = "visibility";
        password.type = "text";
    } else {
        password_visibility.innerText = "visibility_off";
        password.type = "password";
    }
}

function showPasswordSignUp2() {
    const password = document.getElementById('password2');
    const password_visibility = document.getElementById('password_visibility2');
    if (password_visibility.innerText === "visibility_off") {
        password_visibility.innerText = "visibility";
        password.type = "text";
    } else {
        password_visibility.innerText = "visibility_off";
        password.type = "password";
    }
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
