function loadCoupons() {
    setTimeout(() => {
        document.getElementById('loading').style.display = 'none'
        document.getElementById('products').style.display = 'block'
    }, 400);
}


// edit button

function editButton(couponId, code, discri, discount, min_amount, redeem_amount, date) {

    document.getElementById('couponId').value = couponId
    document.getElementById('code').value = code
    document.getElementById('discription').value = discri
    document.getElementById('discount').value = discount
    document.getElementById('min_amount').value = min_amount
    document.getElementById('redeem_amount').value = redeem_amount
    document.getElementById('datePicker').value = date

    $('#varient').modal('show')

}

// edit coupons
async function editCoupons() {

    document.getElementById('edit_product').setAttribute('disabled', 'disabled')

    const coupon_id = document.getElementById('couponId').value
    const code = document.getElementById('code').value
    const discription = document.getElementById('discription').value
    const discount = document.getElementById('discount').value
    const min_amount = document.getElementById('min_amount').value
    const redeem_amount = document.getElementById('redeem_amount').value
    const expiry_date = document.getElementById('datePicker').value

    const obj = {
        coupon_id: coupon_id,
        code: code,
        discription: discription,
        discount: discount,
        min_amount: min_amount,
        redeem_amount: redeem_amount,
        expiry_date: expiry_date
    }

    try {
        const resp = await fetch('/admin/editCoupons', {
            method: 'PATCH',
            headers: {
                'Content-type': 'application/json'
            },
            body: JSON.stringify(obj)
        })

        const data = await resp.json()

        const error1 = document.getElementById('error_code')
        const input1 = document.getElementById('code')

        const error2 = document.getElementById('error_discription')
        const input2 = document.getElementById('discription')

        if (data.type === 'redirect') {
            window.location.href = '/admin/signIn'
        }
        else if (data.type === 'code') {

            showError(input1, error1, data.msg)
            removeError(input1, error1)

        } else if (data.type === 'discription') {

            showError(input2, error2, data.msg)
            removeError(input2, error2)

        } else if (data.type === 'invalid') {
            $('#varient').modal('hide')
            document.getElementById('edit_product').removeAttribute('disabled')
            document.getElementById('ok_btn').setAttribute('onclick', `reload()`);
            document.getElementById('error_p').innerHTML = data.msg
            document.getElementById('error_symbol').style.color = 'red'
            document.getElementById('error_symbol').innerHTML = 'error'
            const myModal = new bootstrap.Modal(document.getElementById('message'));
            myModal.show();
        } else {

            $('#varient').modal('hide')
            document.getElementById('edit_product').removeAttribute('disabled')
            document.getElementById('ok_btn').setAttribute('onclick', `reload()`);
            document.getElementById('error_p').innerHTML = data.msg
            document.getElementById('error_symbol').style.color = 'green'
            document.getElementById('error_symbol').innerHTML = 'task_alt'
            const myModal = new bootstrap.Modal(document.getElementById('message'));
            myModal.show();

        }
    } catch (err) {
        console.log(err);
        window.location.href = '/admin/500-Server-Error'
    }

}



// activate or deactivate the coupon

async function activation(coupon_id) {


    document.getElementById('activation_btn' + coupon_id).setAttribute('disabled', 'disabled')

    try {
        const resp = await fetch(`/admin/activationCoupon?couponId=${coupon_id}`, { method: 'GET' })
        const data = await resp.json()

        if (data.type === 'redirect') {
            window.location.href = '/admin/signIn'
        }
        else if (data.type === 'invalid') {
            document.getElementById('activation_btn' + coupon_id).removeAttribute('disabled')
            document.getElementById('ok_btn').setAttribute('onclick', `reload()`);
            document.getElementById('error_p').innerHTML = data.msg
            document.getElementById('error_symbol').style.color = 'red'
            document.getElementById('error_symbol').innerHTML = 'error'
            const myModal = new bootstrap.Modal(document.getElementById('message'));
            myModal.show();
        } else if (data.type === 'Activate') {
            document.getElementById('activation_btn' + coupon_id).removeAttribute('disabled')
            document.getElementById('activation_btn' + coupon_id).innerHTML = 'Deactivate'
            document.getElementById('activation_btn' + coupon_id).style.paddingLeft = '40px'
            document.getElementById('activation_btn' + coupon_id).style.paddingRight = '40px'
            document.getElementById('activation_btn' + coupon_id).style.backgroundColor = 'rgb(251, 60, 60)'
        } else {
            document.getElementById('activation_btn' + coupon_id).removeAttribute('disabled')
            document.getElementById('activation_btn' + coupon_id).innerHTML = 'Activate'
            document.getElementById('activation_btn' + coupon_id).style.paddingLeft = '50px'
            document.getElementById('activation_btn' + coupon_id).style.paddingRight = '50px'
            document.getElementById('activation_btn' + coupon_id).style.backgroundColor = 'rgb(34, 143, 34)'
        }
    } catch (err) {
        console.log(err);
        window.location.href = '/admin/500-Server-Error'
    }
}

// remove coupon
function removeCoupon(couponId, code) {
    document.getElementById('name_').innerHTML = code
    document.getElementById('confirm_btn').setAttribute('onclick', `remove('${couponId}')`)
    $('#unlist').modal('show')
}

// remove
async function remove(couponId) {

    document.getElementById('remove_btn' + couponId).setAttribute('disabled', 'disabled')

    $('#unlist').modal('hide')
    document.getElementById('row' + couponId).style.display = 'none'

    try {

        const resp = await fetch(`/admin/removeCoupon?couponId=${couponId}`, { method: 'DELETE' })
        const data = await resp.json()

        if (data.type === 'redirect') {
            window.location.href = '/admin/signIn'
        }
        else if (data.type === 'invalid') {
            document.getElementById('remove_btn' + couponId).removeAttribute('disabled')
            document.getElementById('ok_btn').setAttribute('onclick', `reload()`);
            document.getElementById('error_p').innerHTML = data.msg
            document.getElementById('error_symbol').style.color = 'red'
            document.getElementById('error_symbol').innerHTML = 'error'
            const myModal = new bootstrap.Modal(document.getElementById('message'));
            myModal.show();
        } else {
            document.getElementById('error_p').innerHTML = data.msg
            document.getElementById('error_symbol').style.color = 'green'
            document.getElementById('error_symbol').innerHTML = 'task_alt'
            const myModal = new bootstrap.Modal(document.getElementById('message'));
            myModal.show();
        }
    } catch (err) {
        console.log(err);
        window.location.href = '/admin/500-Server-Error'
    }
}

function reload() {
    setTimeout(() => {
        window.location.href = '/admin/listsCoupons'
    }, 400)
}

// show and remove errors
function showError(input, err, msg) {
    input.style.color = 'red'
    input.value = msg
    input.removeAttribute('required')
    input.setAttribute('readOnly', 'readOnly')
    err.innerHTML = 'error'
    err.style.color = 'red'
}

function removeError(input, err) {
    setTimeout(() => {
        input.style.color = 'black'
        input.value = ''
        input.removeAttribute('readOnly')
        input.setAttribute('required', 'required')
        err.innerHTML = ''
        document.getElementById('add_product').removeAttribute('disabled')
    }, 2000)
}