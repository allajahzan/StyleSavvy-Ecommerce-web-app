let intervalId;

// load prfile page
async function loadProfile() {
    document.body.style.overflow = 'hidden';
    setTimeout(() => {
        document.getElementById('profile').style.display = 'block'
        document.getElementById('profile').style.visibility = 'hidden'
    }, 500);
    setTimeout(() => {
        document.getElementById('loading').style.display = 'none'
        document.getElementById('profile').style.visibility = 'visible'
        document.body.style.overflow = '';
    }, 1000);


    const url = window.location.href
    localStorage.setItem('url', url);

    // update profile

    const gForm = document.getElementById('user_form_google')
    if (gForm !== null) {
        gForm.addEventListener('submit', async (e) => {
            e.preventDefault()
            const name = document.getElementById('name_google').value
            const phone = document.getElementById('phone_no_google').value

            const obj = {
                name: name,
                phoneNo: phone,
            }

            document.getElementById('save_changes_btn_google').setAttribute('disabled', 'disabled')

            const nameInput = document.getElementById('name_google')
            const phoneInput = document.getElementById('phone_no_google')
            const name_err = document.getElementById('name_error_google')
            const phoneNo_err = document.getElementById('phone_error_google')

            try {

                const resp = await fetch('/profile/updategoogle', {
                    method: 'PUT',
                    headers: {
                        'Content-type': 'application/json'
                    },
                    body: JSON.stringify(obj)
                })

                const data = await resp.json()

                if (data.type === 'name') {
                    showError(nameInput, name_err, data.msg)
                    setTimeout(() => {
                        removeError(nameInput, name_err)
                        nameInput.value = data.name
                        document.getElementById('save_changes_btn_google').removeAttribute('disabled')
                    }, 2000);
                } else if (data.type === 'phone') {
                    showError(phoneInput, phoneNo_err, data.msg)
                    setTimeout(() => {
                        removeError(phoneInput, phoneNo_err)
                        phoneInput.value = data.phone
                        document.getElementById('save_changes_btn_google').removeAttribute('disabled')
                    }, 2000);
                } else if (data.type === 'redirect') {
                    window.location.href = '/signIn'
                } else {
                    document.getElementById('save_changes_btn_google').removeAttribute('disabled')
                    showSnackBar(data.msg)
                    document.getElementById('name_google').value = data.user.name
                    document.getElementById('phone_no_google').value = data.user.phoneNo
                    const fname = data.user.name.split(' ')[0]
                    document.getElementById('user_name').innerHTML = fname
                }

            } catch (err) {
                console.log(err);
                window.location.href = '/500-Server-Error'
            }


        })
    }

    // update user account details

    const form = document.getElementById('user_form')
    if (form !== null) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault()
            const name = form[0].value
            const phone = form[1].value
            const password = document.getElementById('p1').value

            const obj = {
                name: name,
                phoneNo: phone,
                password: password
            }

            document.getElementById('save_changes_btn').setAttribute('disabled', 'disabled')

            const nameInput = form[0]
            const phoneInput = form[1]
            const passwordInput = document.getElementById('p1')

            const name_err = document.getElementById('name_error')
            const phoneNo_err = document.getElementById('phone_error')
            const passsword_err = document.getElementById('password_error')
            const visibility = document.getElementById('v1')

            try {

                const resp = await fetch('/profile/update', {
                    method: 'PUT',
                    headers: {
                        'Content-type': 'application/json'
                    },
                    body: JSON.stringify(obj)
                })

                const data = await resp.json()

                if (data.type === 'name') {
                    showError(nameInput, name_err, data.msg)
                    setTimeout(() => {
                        removeError(nameInput, name_err)
                        nameInput.value = data.name
                        document.getElementById('save_changes_btn').removeAttribute('disabled')
                    }, 2000);
                } else if (data.type === 'phone') {
                    showError(phoneInput, phoneNo_err, data.msg)
                    setTimeout(() => {
                        removeError(phoneInput, phoneNo_err)
                        phoneInput.value = data.phone
                        document.getElementById('save_changes_btn').removeAttribute('disabled')
                    }, 2000);
                } else if (data.type === 'password') {
                    showError(passwordInput, passsword_err, data.msg, visibility)
                    setTimeout(() => {
                        removeError(passwordInput, passsword_err, visibility)
                        document.getElementById('save_changes_btn').removeAttribute('disabled')
                    }, 2000);
                } else if (data.type === 'redirect') {
                    window.location.href = '/signIn'
                }
                else {
                    document.getElementById('save_changes_btn').removeAttribute('disabled')
                    showSnackBar(data.msg)
                    document.getElementById('p1').value = ''
                    form[0].value = data.user.name
                    form[1].value = data.user.phoneNo
                    const fname = data.user.name.split(' ')[0]
                    document.getElementById('user_name').innerHTML = fname
                }

            } catch (err) {
                console.log(err);
                window.location.href = '/500-Server-Error'
            }

        })
    }


    // delete otp on page reload

    try {
        await fetch('/profile/deleteOTP', { method: 'DELETE' })
    } catch (err) {
        console.log(err);
        window.location.href = '/500-Server-Error'
    }

    // send otp to verify email

    const otpForm = document.getElementById('otp_form')
    if (otpForm !== null) {
        otpForm.addEventListener('submit', async (e) => {
            e.preventDefault()

            document.getElementById('confirm_btn').setAttribute('disabled', 'disabled')

            const otp = document.getElementById('otp_input').value
            try {

                const resp = await fetch(`/profile/checkOtp?otp=${otp}`, { method: 'GET' })
                const data = await resp.json()

                const otpInput = document.getElementById('otp_input')
                const otp_error = document.getElementById('otp_error')

                if (data.type === 'redirect') {
                    window.location.href = '/signIn'
                } else if (data.type === 'error') {
                    showError(otpInput, otp_error, data.msg)
                    setTimeout(() => {
                        removeError(otpInput, otp_error)
                        document.getElementById('confirm_btn').removeAttribute('disabled')
                    }, 2000);
                } else {
                    resetOtpButtonAndData()
                    document.getElementById('otp_div_profile').style.display = 'none'

                    // delete otp on page reload
                    await fetch('/profile/deleteOTP', { method: 'DELETE' })

                    showSnackBar(data.msg)
                    HideEmailInput()
                    otpForm.reset()
                }

            } catch (err) {
                console.log(err);
                window.location.href = '/500-Server-Error'
            }
        })
    }


    // change password 

    const passwordForm = document.getElementById('password_form')
    if (passwordForm !== null) {
        passwordForm.addEventListener('submit', async (e) => {
            e.preventDefault()

            document.getElementById('password_change_btn').setAttribute('disabled', 'disabled')


            const obj = {
                oldPassword: passwordForm[0].value,
                newPassword: passwordForm[1].value,
                cPassword: passwordForm[2].value
            }

            const p1 = passwordForm[0]
            const p2 = passwordForm[1]
            const p3 = passwordForm[2]

            const p1_error = document.getElementById('password2_error')
            const p2_error = document.getElementById('password3_error')
            const p3_error = document.getElementById('password4_error')

            const v2 = document.getElementById('v2')
            const v3 = document.getElementById('v3')
            const v4 = document.getElementById('v4')

            try {

                const resp = await fetch('/profile/changePassword', {
                    method: 'PATCH',
                    headers: {
                        'Content-type': 'application/json'
                    },
                    body: JSON.stringify(obj)
                })

                const data = await resp.json()

                if (data.type === 'oldP') {
                    showError(p1, p1_error, data.msg, v2)
                    setTimeout(() => {
                        removeError(p1, p1_error, v2)
                        document.getElementById('password_change_btn').removeAttribute('disabled')
                    }, 2000);
                } else if (data.type === 'newP') {
                    showError(p2, p2_error, data.msg, v3)
                    setTimeout(() => {
                        removeError(p2, p2_error, v3)
                        document.getElementById('password_change_btn').removeAttribute('disabled')
                    }, 2000);
                } else if (data.type === 'cP') {
                    showError(p3, p3_error, data.msg, v4)
                    setTimeout(() => {
                        removeError(p3, p3_error, v4)
                        document.getElementById('password_change_btn').removeAttribute('disabled')
                    }, 2000);
                } else if (data.type === 'redirect') {
                    window.location.href = '/signIn'
                }
                else {
                    passwordForm.reset()
                    showSnackBar(data.msg)
                    document.getElementById('password_change_btn').removeAttribute('disabled')
                }

            } catch (err) {
                console.log(err);
                window.location.href = '/500-Server-Error'
            }


        })
    }


    // add addresses

    const addForm = document.getElementById('add_address_form')
    if (addForm !== null) {
        addForm.addEventListener('submit', async (e) => {
            e.preventDefault()

            document.getElementById('add_address_btn').setAttribute('disabled', 'disabled')

            const obj = {
                name: addForm[0].value,
                streetAddress: addForm[1].value,
                city: addForm[2].value,
                district: addForm[3].value,
                pincode: addForm[4].value,
                phone: addForm[5].value,
            }

            try {

                const resp = await fetch('/profile/address/add', {
                    method: 'POST',
                    headers: {
                        'Content-type': 'application/json'
                    },
                    body: JSON.stringify(obj)
                })

                const data = await resp.json()

                const name = addForm[0]
                const city = addForm[2]
                const district = addForm[3]
                const phone = addForm[5]

                const name_error = document.getElementById('Name_error')
                const city_error = document.getElementById('city_error')
                const district_error = document.getElementById('district_error')
                const phone_error = document.getElementById('Phone_error')

                if (data.type === 'name') {
                    showError(name, name_error, data.msg)
                    setTimeout(() => {
                        removeError(name, name_error)
                        document.getElementById('add_address_btn').removeAttribute('disabled')
                    }, 2000);
                } else if (data.type === 'city') {
                    showError(city, city_error, data.msg)
                    setTimeout(() => {
                        removeError(city, city_error)
                        document.getElementById('add_address_btn').removeAttribute('disabled')
                    }, 2000);
                } else if (data.type === 'district') {
                    showError(district, district_error, data.msg)
                    setTimeout(() => {
                        removeError(district, district_error)
                        document.getElementById('add_address_btn').removeAttribute('disabled')
                    }, 2000);
                } else if (data.type === 'phone') {
                    showError(phone, phone_error, data.msg)
                    setTimeout(() => {
                        removeError(phone, phone_error)
                        document.getElementById('add_address_btn').removeAttribute('disabled')
                    }, 2000);
                } else if (data.type === 'redirect') {
                    window.location.href = '/signIn'
                }
                else {
                    addForm.reset()
                    document.getElementById('add_address_btn').removeAttribute('disabled')
                    showSnackBar(data.msg)
                    document.getElementById('addrress_container').innerHTML = ''
                    const div = document.createElement('div')
                    div.id = 'address_div'
                    const newAddressesHTML = createAddressHTML(data.address.addresses);
                    div.innerHTML = newAddressesHTML;
                    document.getElementById('addrress_container').appendChild(div)
                    div.style.display = 'none'

                    document.getElementById('add_address').innerHTML = 'You can add new addresses.'
                    document.getElementById('is_address_available').value = "true"


                    closeAddressForm()
                }

            } catch (err) {
                console.log(err);
                window.location.href = '/500-Server-Error'
            }
        })
    }


    // edit address


    const editForm = document.getElementById('edit_address_form')
    if (editForm !== null) {
        editForm.addEventListener('submit', async (e) => {
            e.preventDefault()

            document.getElementById('edit_address_btn').setAttribute('disabled', 'disabled')

            const obj = {
                name: editForm[0].value,
                streetAddress: editForm[1].value,
                city: editForm[2].value,
                district: editForm[3].value,
                pincode: editForm[4].value,
                phone: editForm[5].value,
                index: editForm[6].value
            }


            try {

                const resp = await fetch('/profile/address/edit', {
                    method: 'PUT',
                    headers: {
                        'Content-type': 'application/json'
                    },
                    body: JSON.stringify(obj)
                })

                const data = await resp.json()

                const name = editForm[0]
                const city = editForm[2]
                const district = editForm[3]
                const phone = editForm[5]

                const name_error = document.getElementById('Name_error_edit')
                const city_error = document.getElementById('city_error_edit')
                const district_error = document.getElementById('district_error_edit')
                const phone_error = document.getElementById('Phone_error_edit')

                if (data.type === 'name') {
                    showError(name, name_error, data.msg)
                    setTimeout(() => {
                        removeError(name, name_error)
                        document.getElementById('edit_address_btn').removeAttribute('disabled')
                        editForm[0].value = data.name
                    }, 2000);
                } else if (data.type === 'city') {
                    showError(city, city_error, data.msg)
                    setTimeout(() => {
                        removeError(city, city_error)
                        document.getElementById('edit_address_btn').removeAttribute('disabled')
                        editForm[2].value = data.city
                    }, 2000);
                } else if (data.type === 'district') {
                    showError(district, district_error, data.msg)
                    setTimeout(() => {
                        removeError(district, district_error)
                        document.getElementById('edit_address_btn').removeAttribute('disabled')
                        editForm[3].value = data.district
                    }, 2000);
                } else if (data.type === 'phone') {
                    showError(phone, phone_error, data.msg)
                    setTimeout(() => {
                        removeError(phone, phone_error)
                        document.getElementById('edit_address_btn').removeAttribute('disabled')
                        editForm[5].value = data.phone
                    }, 2000);
                } else if (data.type === 'redirect') {
                    window.location.href = '/signIn'
                }
                else {
                    addForm.reset()
                    document.getElementById('edit_address_btn').removeAttribute('disabled')
                    showSnackBar(data.msg)

                    const div = document.getElementById(editForm[7].value);

                    const streetAddressWords = data.address.streetAddress.split(' ');
                    const firstLine = streetAddressWords.slice(0, 3).join(' ');
                    const secondLine = streetAddressWords.slice(3).join(' ');

                    const html = `
                    <div class="card card-dashboard">
                        <div class="card-body">
                            <h3 class="card-title">Billing Address ${editForm[6].value + 1}</h3>
                            <p>${data.address.name}<br>
                                ${firstLine}<br>
                                ${secondLine}<br>
                                ${data.address.city}, ${data.address.district}<br>
                                ${data.address.phoneNo}<br>
                                <div style="display: flex;">
                                <a onclick="getEditForm('${editForm[6].value}','${data.address._id}')" style="font-weight: 500;  color: #bf8040; cursor: pointer;">Edit <span style="position: relative; top: 3px; font-size: 16px;" class="material-symbols-outlined">edit</span></a></p>
                                <a onclick="deleteAddress('${editForm[6].value}')" style="font-weight: 500; margin-left: 10px;  color: #bf8040; cursor: pointer;">Delete <span style="position: relative; top: 3px; font-size: 16px;" class="material-symbols-outlined"> delete</span></a></p>
                                </div>
                            </p>
                        </div>
                    </div>
            `;

                    div.innerHTML = html

                    document.getElementById('edit_address_form').style.display = 'none'
                    document.getElementById('address_div').style.display = 'block'

                }
            } catch (err) {
                console.log(err);
                window.location.href = '/500-Server-Error'
            }
        })
    }


}

// delete address

function deleteAddress(index) {
    $('#remove').modal('show')
    document.getElementById('confirm_btn_delete').setAttribute('onclick', `deleteIt('${index}')`);
}

// delete function

async function deleteIt(index) {
    try {

        const resp = await fetch(`/profile/address/delete?index=${index}`, { method: 'DELETE' })
        const data = await resp.json()

        if (data.type === 'redirect') {
            window.location.href = '/signIn'
        } else {
            showSnackBar(data.msg)
            $('#remove').modal('hide')
            if (data.address.addresses.length > 0) {
                document.getElementById('addrress_container').innerHTML = ''
                const div = document.createElement('div')
                div.id = 'address_div'
                const newAddressesHTML = createAddressHTML(data.address.addresses);
                div.innerHTML = newAddressesHTML;
                document.getElementById('addrress_container').appendChild(div)
            } else {
                document.getElementById('add_address').innerHTML = 'You have not set up any addresses yet.'
                document.getElementById('address_div').style.display = 'none'
                document.getElementById('is_address_available').value = "false"
            }

        }

    } catch (err) {
        console.log(err);
        window.location.href = '/500-Server-Error'
    }
}


// verify email

async function verifyEmail(event) {
    event.preventDefault()
    const email = document.getElementById('email').value
    document.getElementById('btn_verify_email').setAttribute('disabled', 'disabled')
    document.getElementById('timer_otp').innerHTML = '37'

    try {

        const obj = {
            email: email
        }

        const resp = await fetch('/profile/verifyEmail', {
            method: 'POST',
            headers: {
                'Content-type': 'application/json'
            },
            body: JSON.stringify(obj)
        })

        const data = await resp.json()

        const emailInput = document.getElementById('email')
        const email_err = document.getElementById('email_error')

        if (data.type === 'email') {
            showError(emailInput, email_err, data.msg)
            setTimeout(() => {
                removeError(emailInput, email_err)
                emailInput.value = data.email
                document.getElementById('btn_verify_email').removeAttribute('disabled')
            }, 2000);
        }
        else if (data.type === 'redirect') {
            window.location.href = '/signIn'
        }
        else {

            function timer() {

                showSnackBar('OTP has send to your email')
                document.getElementById('otp_div_profile').style.display = 'block'
                document.getElementById('verify_btn').style.display = 'none'

                let num = 37;

                intervalId = setInterval(async () => {
                    if (num > 0) {
                        document.getElementById('timer_otp').innerHTML = num;
                        // document.getElementById('email_to_verify').innerHTML = email
                        num--;
                    } else {
                        document.getElementById('btn_verify_email').removeAttribute('disabled')
                        // clear intervel
                        clearInterval(intervalId)

                        // delete OTP after 37 seconds
                        await fetch('/profile/deleteOTP', { method: 'DELETE' })
                        document.getElementById('otp_p').style.display = 'none'
                        document.getElementById('otp_button').style.display = 'block'

                    }
                }, 1000);
            }

            timer();
        }


    } catch (err) {
        console.log(err);
        window.location.href = '/500-Server-Error'
    }
}

// close modal

async function resetOtpButtonAndData() {
    clearInterval(intervalId)
    document.getElementById('otp_form').reset()
    try {
        await fetch('/profile/deleteOTP', { method: 'DELETE' })
    } catch (err) {
        console.log(err);
        window.location.href = '/500-Server-Error'
    }
    document.getElementById('btn_verify_email').removeAttribute('disabled')
    document.getElementById('confirm_btn').removeAttribute('disabled')
}

// resend OTP

async function resendOTP() {
    document.getElementById('otp_p').style.display = 'block'
    document.getElementById('otp_button').style.display = 'none'
    document.getElementById('timer_otp').innerHTML = '37';
    const email = document.getElementById('email').value
    try {

        const obj = {
            email: email
        }

        const resp = await fetch('/profile/verifyEmail', {
            method: 'POST',
            headers: {
                'Content-type': 'application/json'
            },
            body: JSON.stringify(obj)
        })

        const data = await resp.json()

        if (data.type === 'redirect') {
            window.location.href = '/signIn'
        }
        else {

            function timer() {

                showSnackBar('OTP has send to your email')

                let num = 37;

                intervalId = setInterval(async () => {
                    if (num > 0) {
                        document.getElementById('timer_otp').innerHTML = num;
                        num--;
                    } else {
                        // clear intervel
                        clearInterval(intervalId)

                        // delete OTP after 37 seconds
                        await fetch('/profile/deleteOTP', { method: 'DELETE' })
                        document.getElementById('otp_p').style.display = 'none'
                        document.getElementById('otp_button').style.display = 'block'

                    }
                }, 1000);
            }

            timer();
        }


    } catch (err) {
        console.log(err);
        window.location.href = '/500-Server-Error'
    }
}

// template html for adreesss

function createAddressHTML(addresses) {
    let html = `
        <div id="address_div">
            <p>The following addresses will be used on the checkout page by default.</p>
            <div class="row">
    `;

    addresses.forEach((data, index) => {
        const streetAddressWords = data.streetAddress.split(' ');
        const firstLine = streetAddressWords.slice(0, 3).join(' ');
        const secondLine = streetAddressWords.slice(3).join(' ');

        html += `
            <div id="${data._id}" class="col-lg-6">
                <div class="card card-dashboard">
                    <div class="card-body">
                        <h3 class="card-title">Billing Address ${index + 1}</h3>
                        <p>${data.name}<br>
                            ${firstLine}<br>
                            ${secondLine}<br>
                            ${data.city}, ${data.district}<br>
                            ${data.phoneNo}<br>
                            <div style="display: flex;">
                            <a onclick="getEditForm(${index},'${data._id}')" style="font-weight: 500;  color: #bf8040; cursor: pointer;">Edit <span style="position: relative; top: 3px; font-size: 16px;" class="material-symbols-outlined">edit</span></a></p>
                            <a onclick="deleteAddress(${index})" style="font-weight: 500; margin-left: 10px; color: #bf8040; cursor: pointer;">Delete <span style="position: relative; top: 3px; font-size: 16px;" class="material-symbols-outlined"> delete</span></a></p>
                            </div>
                        </p>
                    </div>
                </div>
            </div>
        `;
    });

    html += `
            </div>
        </div>
    `;

    return html;
}


// show add addresss form

function addAddress() {
    document.getElementById('add_address_div').style.display = 'block'
    document.getElementById('address_div').style.display = 'none'
    document.getElementById('edit_address_form').style.display = 'none'
}

// close add clse form address

function closeAddressForm() {
    document.getElementById('add_address_div').style.display = 'none'
    const status = document.getElementById('is_address_available').value
    if (status !== "false") {
        document.getElementById('address_div').style.display = 'block'
    }
    scrollToTop()
}

// get address edit form

async function getEditForm(index, addressId) {

    try {

        const resp = await fetch(`/profile/address?index=${index}`, { method: 'GET' })
        const data = await resp.json()

        if (data.type === 'redirect') {
            window.location.href = '/signIn'
        } else {

            // scrollToTop()
            document.getElementById('edit_address_form').style.display = 'block'
            document.getElementById('address_div').style.display = 'none'
            document.getElementById('add_address_div').style.display = 'none'

            const form = document.getElementById('edit_address_form')
            form[0].value = data.address.name
            form[1].value = data.address.streetAddress
            form[2].value = data.address.city
            form[3].value = data.address.district
            form[4].value = data.address.pincode
            form[5].value = data.address.phoneNo
            form[6].value = index
            form[7].value = addressId

        }

    } catch (err) {
        console.log(err);
        window.location.href = '/500-Server-Error'
    }
}

// close edit form

function closeEditForm() {
    document.getElementById('edit_address_form').style.display = 'none'
    document.getElementById('address_div').style.display = 'block'
    scrollToTop()
}

// scroll to top

function scrollToTop() {
    document.documentElement.style.scrollBehavior = 'auto';
    document.body.style.scrollBehavior = 'auto';

    window.scrollTo({
        top: 0
    });

    setTimeout(() => {
        document.documentElement.style.scrollBehavior = 'smooth';
        document.body.style.scrollBehavior = 'smooth';
    }, 1000);
}


// get email input

function getEmailInput() {
    document.getElementById('verify_btn').style.display = 'block'
    document.getElementById('getEmailInput').style.display = 'none'
    document.getElementById('HideEmailInput').style.display = 'block'
    document.getElementById('submit_btn').style.display = 'none'
    document.getElementById('otp_div_profile').style.display = 'none'
    resetOtpButtonAndData()
}

// hide email input

function HideEmailInput() {
    document.getElementById('HideEmailInput').style.display = 'none'
    document.getElementById('verify_btn').style.display = 'none'
    document.getElementById('getEmailInput').style.display = 'block'
    document.getElementById('submit_btn').style.display = 'block'
    document.getElementById('otp_div_profile').style.display = 'none'
    resetOtpButtonAndData()
}


// show password visibility

function showPassword1() {
    const password = document.getElementById('p1');
    const password_visibility = document.getElementById('v1');
    if (password_visibility.innerText === "visibility_off") {
        password_visibility.innerText = "visibility";
        password.type = "text";
    } else {
        password_visibility.innerText = "visibility_off";
        password.type = "password";
    }
}

function showPassword2() {
    const password = document.getElementById('p2');
    const password_visibility = document.getElementById('v2');
    if (password_visibility.innerText === "visibility_off") {
        password_visibility.innerText = "visibility";
        password.type = "text";
    } else {
        password_visibility.innerText = "visibility_off";
        password.type = "password";
    }
}

function showPassword3() {
    const password = document.getElementById('p3');
    const password_visibility = document.getElementById('v3');
    if (password_visibility.innerText === "visibility_off") {
        password_visibility.innerText = "visibility";
        password.type = "text";
    } else {
        password_visibility.innerText = "visibility_off";
        password.type = "password";
    }
}

function showPassword4() {
    const password = document.getElementById('p4');
    const password_visibility = document.getElementById('v4');
    if (password_visibility.innerText === "visibility_off") {
        password_visibility.innerText = "visibility";
        password.type = "text";
    } else {
        password_visibility.innerText = "visibility_off";
        password.type = "password";
    }
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
}


// show snack bar
function showSnackBar(text) {
    document.getElementById('snackbar_msg').innerHTML = text
    const x = document.getElementById("snackbar");
    x.className = "show";
    setTimeout(function () { x.className = x.className.replace("show", ""); }, 3000);
}