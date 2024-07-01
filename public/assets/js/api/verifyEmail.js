// load page
async function loadVerifyEmail() {

    const endTime = localStorage.getItem('endTime')

    let num;
    if (endTime) {
        if (endTime == 0) {

            document.getElementById('otp_p').style.display = 'none'
            document.getElementById('otp_button').style.display = 'block'
        } else {

            num = endTime
            document.getElementById('timer_otp').innerHTML = num;
        }
    } else {
        num = 36
        document.getElementById('timer_otp').innerHTML = num;
    }

    function timer() {

        const intervalId = setInterval(async () => {
            if (num > 0) {
                document.getElementById('timer_otp').innerHTML = num;
                localStorage.setItem('endTime', num);
                // document.getElementById('timer_otp').innerHTML = num;
                num--;
            } else {
                // clear intervel
                localStorage.setItem('endTime', 0);
                clearInterval(intervalId)

                // delete OTP after 37 seconds
                await fetch('/user/deleteOTP', { method: 'DELETE' })
                document.getElementById('otp_p').style.display = 'none'
                document.getElementById('otp_button').style.display = 'block'

            }
        }, 1000);
    }

    timer();





    // resend OTP here------------------------------------------------

    document.getElementById('otp_button').addEventListener('click', async (e) => {

        document.getElementById('error_otp').innerHTML = ''
        document.getElementById('otp1').style.borderColor = '#bf8040'
        document.getElementById('otp2').style.borderColor = '#bf8040'
        document.getElementById('otp3').style.borderColor = '#bf8040'
        document.getElementById('otp4').style.borderColor = '#bf8040'
        document.getElementById('otp5').style.borderColor = '#bf8040'
        document.getElementById('otp6').style.borderColor = '#bf8040'

        try {
            const resp = await fetch('/user/resendOTP', {
                method: 'GET',
            })

            const data = await resp.json()

            // setintervel

            if (data.type === 'success') {


                let num = 37

                function timer() {
                    document.getElementById('timer_otp').innerHTML = num;
                    document.getElementById('otp_p').style.display = 'block'
                    document.getElementById('otp_button').style.display = 'none'

                    const intervalId = setInterval(async () => {
                        if (num > 0) {
                            document.getElementById('timer_otp').innerHTML = num;
                            localStorage.setItem('endTime', num);
                            num--;
                        } else {
                            // clear intervel
                            localStorage.setItem('endTime', 0);
                            clearInterval(intervalId)

                            // delete OTP after 37 seconds
                            await fetch('/user/deleteOTP', { method: 'DELETE' })
                            document.getElementById('otp_p').style.display = 'none'
                            document.getElementById('otp_button').style.display = 'block'

                        }
                    }, 1000);
                }

                timer();
            } else {
                window.location.href = '/signUp'
            }
        } catch (err) {
            console.log(err);
            alert("ok")
            window.location.href = '/500-Server-Error';
        }

    })

    // verify otp
    const form_otp = document.getElementById('verify_form');
    form_otp.addEventListener('submit', async (e) => {
        e.preventDefault()

        let n1 = document.getElementById('otp1').value
        let n2 = document.getElementById('otp2').value
        let n3 = document.getElementById('otp3').value
        let n4 = document.getElementById('otp4').value
        let n5 = document.getElementById('otp5').value
        let n6 = document.getElementById('otp6').value

        let arr = [n1, n2, n3, n4, n5, n6]
        let otp = Number(arr.join(''))
        const obj = {
            otp: otp
        }

        try {
            const resp = await fetch('/user/verify', {
                method: 'POST',
                headers: {
                    'Content-type': 'application/json'
                },
                body: JSON.stringify(obj)
            })

            const data = await resp.json()

            if (data.type === 'error') {

                form_otp.reset()
                document.getElementById('otp1').focus();
                document.getElementById('error_otp').innerHTML = data.msg
                document.getElementById('otp1').style.borderColor = 'red'
                document.getElementById('otp2').style.borderColor = 'red'
                document.getElementById('otp3').style.borderColor = 'red'
                document.getElementById('otp4').style.borderColor = 'red'
                document.getElementById('otp5').style.borderColor = 'red'
                document.getElementById('otp6').style.borderColor = 'red'

            } else {

                form_otp.reset()
                document.getElementById('error_otp').innerHTML = ''
                document.getElementById('otp1').style.borderColor = '#bf8040'
                document.getElementById('otp2').style.borderColor = '#bf8040'
                document.getElementById('otp3').style.borderColor = '#bf8040'
                document.getElementById('otp4').style.borderColor = '#bf8040'
                document.getElementById('otp5').style.borderColor = '#bf8040'
                document.getElementById('otp6').style.borderColor = '#bf8040'
                showSnackBar(data.msg)

                setTimeout(() => {
                    window.location.href = '/signIn'
                }, 3000);

            }
        } catch (err) {
            console.log(err);
            window.location.href = '/500-Server-Error'
        }
    })


}

function moveToNext(current, nextFieldID) {
    if (current.value.length >= current.maxLength) {
        if (nextFieldID) {
            document.getElementById(nextFieldID).focus();
        }
    }
}

// show snack bar
function showSnackBar(text) {
    document.getElementById('snackbar_msg').innerHTML = text
    const x = document.getElementById("snackbar");
    x.className = "show1";
}


// show and remove Errors

function showError(input, err, msg, visibility) {
    input.style.color = 'red'
    input.value = msg
    input.type = 'text'
    input.removeAttribute('required')
    input.setAttribute('readOnly', 'readOnly')
    err.innerHTML = 'error'
    if (visibility) {
        visibility.style.display = 'none'
    }
}

function removeError(input, err, visibility) {
    setTimeout(() => {
        input.value = ''
        input.style.color = 'black'
        input.removeAttribute('readOnly')
        input.setAttribute('required', 'required')
        err.innerHTML = ''
        if (visibility) {
            visibility.style.display = 'block'
            visibility.innerHTML = 'visibility_off'
            input.type = 'password'
        }
    }, 2000);
}

