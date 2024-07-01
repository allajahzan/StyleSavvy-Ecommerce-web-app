// show and hide password in admin login page

function showPassword() {
    const password = document.getElementById('password');
    const password_visibility = document.getElementById('password_visibility');
    if (password_visibility.innerText === "visibility_off") {
        password_visibility.innerText = "visibility";
        password.type = "text";
    } else {
        password_visibility.innerText = "visibility_off";
        password.type = "password";
    }
}


// admin signin

function adminSign() {
    const form = document.getElementById('signin_form')
    form.addEventListener('submit', async (e) => {
        e.preventDefault()

        const email = form[0].value
        const password = form[1].value

        const obj = {
            email: email,
            password: password
        }

        // console.log(obj);

        try {

            const resp = await fetch('/admin/signIn', {
                method: "POST",
                headers: {
                    'Content-type': 'application/json'
                },
                body: JSON.stringify(obj)
            })


            const data = await resp.json()
            // console.log(data.msg);

            const email_err = document.getElementById('email_error')
            const password_err = document.getElementById('password_error')
            const password_visibility = document.getElementById('password_visibility');
            const btn = document.getElementById('admin_signin_btn')

            if (data.type === 'email') {
                showError(form[0], email_err, data.msg)
                btn.setAttribute('disabled', 'disabled')
                setTimeout(() => {
                    remmoveError(form[0], email_err)
                    btn.removeAttribute('disabled')
                }, 2000);
            } else if (data.type === 'password') {
                showError(form[1], password_err, data.msg, password_visibility)
                btn.setAttribute('disabled', 'disabled')
                setTimeout(() => {
                    remmoveError(form[1], password_err, password_visibility)
                    btn.removeAttribute('disabled')
                }, 2000);
            } else {
                window.location.href = '/admin/dashboard'
            }
        } catch (err) {
            console.log(err);
            window.location.href = '/admin/500-Server-Error'
        }
    })
}


// show error

function showError(input, err, msg, visibility) {
    input.style.color = 'red'
    input.type = 'text'
    input.value = msg
    input.removeAttribute('required')
    input.setAttribute('readonly', 'readonly')
    err.innerHTML = 'error'
    if (visibility) {
        visibility.style.display = 'none'
    }
}

function remmoveError(input, err, visibility) {
    input.value = ''
    input.style.color = 'black'
    input.removeAttribute('readonly')
    input.setAttribute('required', 'required')
    err.innerHTML = ''
    if (visibility) {
        visibility.style.display = 'block'
        input.type = 'password'
    }
}
