function loadCoupons() {
    setTimeout(() => {
        document.getElementById('loading').style.display = 'none'
        document.getElementById('products').style.display = 'block'
    }, 400);

    // add coupons

    const form = document.getElementById("add_form")
    form.addEventListener('submit', async (event) => {
        event.preventDefault()

        document.getElementById('add_product').removeAttribute('disabled')

        const obj = {
            coupon_code: form[0].value,
            discription: form[1].value,
            discount: form[2].value,
            min_amount: form[3].value,
            max_amount: form[4].value,
            expiryDate: form[5].value
        }

        if (form[5].value !== '') {

            try {
                const resp = await fetch('/admin/addCoupons', {
                    method: 'POST',
                    headers: {
                        'Content-type': 'application/json'
                    },
                    body: JSON.stringify(obj)
                })

                const data = await resp.json()

                const error_code = document.getElementById('error_code')
                const input1 = form[0]

                const error_discription = document.getElementById('error_discription')
                const input2 = form[1]

                if (data.type === 'redirect') {
                    window.location.href = '/admin/signIn'
                }
                else if (data.type === 'code') {

                    showError(input1, error_code, data.msg)
                    removeError(input1, error_code)

                } else if (data.type === 'discription') {

                    showError(input2, error_discription, data.msg)
                    removeError(input2, error_discription)

                } else {
                    form.reset()
                    document.getElementById('add_product').removeAttribute('disabled')
                    const myModal = new bootstrap.Modal(document.getElementById('message'));
                    myModal.show();
                }
            } catch (err) {
                console.log(err);
                window.location.href = '/admin/500-Server-Error'
            }
        }

    })
}


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