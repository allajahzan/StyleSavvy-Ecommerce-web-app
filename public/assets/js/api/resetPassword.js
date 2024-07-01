// get passwords

async function saveNewPassword(event) {
    event.preventDefault()

    document.getElementById('reset_btn').setAttribute('disabled', 'disabled')
    document.getElementById('reset_btn').style.opacity = '0.8'

    const form = document.getElementById('password_form')

    const newPassword = form[0].value
    const confirmPassword = form[1].value

    const obj = {
        newPassword: newPassword,
        cPassword: confirmPassword
    }

    try {
        const resp = await fetch('/resetpassword', {
            method: 'POST',
            headers: {
                'Content-type': 'application/json'
            },
            body: JSON.stringify(obj)
        })

        const data = await resp.json()

        const input1 = document.getElementById('password1')
        const input2 = document.getElementById('password2')

        const err1 = document.getElementById('password_error1')
        const err2 = document.getElementById('password_error2')

        const visibility1 = document.getElementById('password_visibility1')
        const visibility2 = document.getElementById('password_visibility2')


        if (data.type === 'newP') {

            showError(input1, err1, data.msg, visibility1)
            setTimeout(() => {
                document.getElementById('reset_btn').removeAttribute('disabled')
                document.getElementById('reset_btn').style.opacity = '1'
                removeError(input1, err1, newPassword, visibility1)
            }, 2000);

        } else if (data.type === 'cP') {

            showError(input2, err2, data.msg, visibility2)
            setTimeout(() => {
                 document.getElementById('reset_btn').removeAttribute('disabled')
                document.getElementById('reset_btn').style.opacity = '1'
                removeError(input2, err2, confirmPassword, visibility2)
            }, 2000);

        } else if (data.type === 'redirect') {

            window.location.href = '/signIn'

        } else {
            form.reset()
            showSnackBar(data.msg)

            setTimeout(() => {
                window.location.href = '/signIn'
            }, 2000);
        }
    } catch (err) {
        console.log(err);
        window.location.href = '/500-Server-Error'
    }
}

function showPassword1() {
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

function showPassword2() {
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
// show snack bar
function showSnackBar(text) {
    document.getElementById('snackbar_msg').innerHTML = text
    const x = document.getElementById("snackbar");
    x.className = "show";
    setTimeout(function () { x.className = x.className.replace("show", ""); }, 3000);
}
