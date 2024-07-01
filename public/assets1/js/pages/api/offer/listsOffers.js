function loadCoupons() {
    setTimeout(() => {
        document.getElementById('loading').style.display = 'none'
        document.getElementById('products').style.display = 'block'
    }, 400);

    const selectOfferType = document.getElementById('selectOfferType');
    selectOfferType.addEventListener('change', async () => {
        const type = selectOfferType.value;
        try {
            const response = await fetch(`/admin/getTypes?type=${type}`);
            const data = await response.json()

            // document.getElementById('pcategory').style.display = 'none'
            // selectType.style.display = 'block'

            //  Clear existing options
            const selectType = document.getElementById('select_typeOffer');
            selectType.innerHTML = ''

            if (data.type === 'redirect') {
                window.location.href = '/admin/signIn'
            }
            else {
                if (type === 'product') {
                    if (data.product.length > 0) {
                        const defaultOption = document.createElement('option')
                        defaultOption.value = ''
                        defaultOption.textContent = 'Select a product'
                        defaultOption.disabled = true
                        defaultOption.selected = true
                        defaultOption.hidden = true;
                        selectType.appendChild(defaultOption);

                        data.product.forEach(product => {
                            const option = document.createElement('option');
                            option.value = product._id
                            option.textContent = product.product_name
                            selectType.appendChild(option)
                        });

                    } else {
                        const defaultOption = document.createElement('option')
                        defaultOption.value = ''
                        defaultOption.textContent = 'No products are added'
                        defaultOption.disabled = true
                        defaultOption.selected = true
                        defaultOption.hidden = true;
                        selectType.appendChild(defaultOption);

                        // document.getElementById('pcategory').style.display = 'block'
                        // document.getElementById('pcategory').setAttribute('placeholder', 'No products are added')
                        // selectType.style.display = 'none'
                    }
                } else {
                    if (data.category.length > 0) {
                        const defaultOption = document.createElement('option')
                        defaultOption.value = ''
                        defaultOption.textContent = 'Select a category'
                        defaultOption.disabled = true
                        defaultOption.selected = true
                        defaultOption.hidden = true;
                        selectType.appendChild(defaultOption);

                        data.category.forEach(category => {
                            const option = document.createElement('option');
                            option.value = category._id
                            option.textContent = category.category_name
                            selectType.appendChild(option)
                        });

                    } else {
                        const defaultOption = document.createElement('option')
                        defaultOption.value = ''
                        defaultOption.textContent = 'No categories are added'
                        defaultOption.disabled = true
                        defaultOption.selected = true
                        defaultOption.hidden = true;
                        selectType.appendChild(defaultOption);

                        // document.getElementById('pcategory').style.display = 'block'
                        // document.getElementById('pcategory').setAttribute('placeholder', 'No categories are added')
                        // selectType.style.display = 'none'
                    }
                }
            }
        } catch (error) {
            console.log(err);
            window.location.href = '/admin/500-Server-Error'
        }
    })
}


// edit button

async function editButton(offerId, offerName, typeName, offerType, offer, redeem_amount) {

    document.getElementById('offerId').value = offerId
    document.getElementById('offerName').value = offerName
    document.getElementById('offer').value = offer
    document.getElementById('redeem_amount').value = redeem_amount

    const select = document.getElementById('selectOfferType');
    for (let i = 0; i < select.options.length; i++) {
        if (select.options[i].value === offerType) {
            select.selectedIndex = i;
            break;
        }
    }

    try {

        const response = await fetch(`/admin/getTypes?type=${offerType}`);
        const data = await response.json()

        const selectType = document.getElementById('select_typeOffer')
        // Clear existing options
        selectType.innerHTML = ''

        if (data.type === 'redirect') {
            window.location.href = '/admin/signIn'
        }
        else {

            if (offerType === 'product') {
                data.product.forEach(product => {
                    const option = document.createElement('option');
                    option.value = product._id
                    option.textContent = product.product_name
                    selectType.appendChild(option)
                });

                const select2 = document.getElementById('select_typeOffer');
                for (let i = 0; i < select2.options.length; i++) {
                    if (select2.options[i].text === typeName) {
                        select2.selectedIndex = i;
                        break;
                    }
                }
            } else {
                data.category.forEach(category => {
                    const option = document.createElement('option');
                    option.value = category._id
                    option.textContent = category.category_name
                    selectType.appendChild(option)
                });

                const select2 = document.getElementById('select_typeOffer');
                for (let i = 0; i < select2.options.length; i++) {
                    if (select2.options[i].text === typeName) {
                        select2.selectedIndex = i;
                        break;
                    }
                }
            }



            $('#varient').modal('show')
        }
    } catch (err) {
        console.log(err);
        window.location.href = '/admin/500-Server-Error'
    }

}

// edit coupons
async function editOffers(event) {
    event.preventDefault()

    document.getElementById('edit_product').setAttribute('disabled', 'disabled')

    const offerId = document.getElementById('offerId').value
    const offer_name = document.getElementById('offerName').value
    const offer = document.getElementById('offer').value
    const redeem_amount = document.getElementById('redeem_amount').value

    const selectType = document.getElementById('select_typeOffer')
    const selectedOption = selectType.options[selectType.selectedIndex];
    const selectedText = selectedOption.text;

    const obj = {
        offerId: offerId,
        offer_name: offer_name,
        offer: offer,
        offerType: document.getElementById('selectOfferType').value,
        itemId: document.getElementById('select_typeOffer').value,
        typeName: selectedText,
        redeem_amount: redeem_amount,
    }

    try {
        const resp = await fetch('/admin/editOffers', {
            method: 'PATCH',
            headers: {
                'Content-type': 'application/json'
            },
            body: JSON.stringify(obj)
        })

        const data = await resp.json()

        const error1 = document.getElementById('error_code')
        const input1 = document.getElementById('code')

        // const error2 = document.getElementById('error_discription')
        // const input2 = document.getElementById('discription')

        if (data.type === 'redirect') {
            window.location.href = '/admin/signIn'
        }
        else if (data.type === 'offerName') {

            showError(input1, error1, data.msg)
            removeError(input1, error1)

        } else if (data.type === 'invalid') {
            $('#varient').modal('hide')
            document.getElementById('edit_product').removeAttribute('disabled')
            document.getElementById('ok_btn').setAttribute('onclick', `getMoadl()`);
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

function getMoadl() {
    $('#varient').modal('show')
}



// activate or deactivate the coupon

async function activation(offerId) {


    document.getElementById('activation_btn' + offerId).setAttribute('disabled', 'disabled')

    try {
        const resp = await fetch(`/admin/activationOffer?offerId=${offerId}`, { method: 'GET' })
        const data = await resp.json()

        if (data.type === 'redirect') {
            window.location.href = '/admin/signIn'
        }
        else if (data.type === 'invalid') {
            document.getElementById('activation_btn' + offerId).removeAttribute('disabled')
            document.getElementById('ok_btn').setAttribute('onclick', `reload()`);
            document.getElementById('error_p').innerHTML = data.msg
            document.getElementById('error_symbol').style.color = 'red'
            document.getElementById('error_symbol').innerHTML = 'error'
            const myModal = new bootstrap.Modal(document.getElementById('message'));
            myModal.show();
        } else if (data.type === 'Activate') {
            document.getElementById('activation_btn' + offerId).removeAttribute('disabled')
            document.getElementById('activation_btn' + offerId).innerHTML = 'Deactivate'
            document.getElementById('activation_btn' + offerId).style.paddingLeft = '40px'
            document.getElementById('activation_btn' + offerId).style.paddingRight = '40px'
            document.getElementById('activation_btn' + offerId).style.backgroundColor = 'rgb(251, 60, 60)'
        } else {
            document.getElementById('activation_btn' + offerId).removeAttribute('disabled')
            document.getElementById('activation_btn' + offerId).innerHTML = 'Activate'
            document.getElementById('activation_btn' + offerId).style.paddingLeft = '50px'
            document.getElementById('activation_btn' + offerId).style.paddingRight = '50px'
            document.getElementById('activation_btn' + offerId).style.backgroundColor = 'rgb(34, 143, 34)'
        }
    } catch (err) {
        console.log(err);
        window.location.href = '/admin/500-Server-Error'
    }
}

// remove coupon
function removeCoupon(offerId, offetType) {
    document.getElementById('name_').innerHTML = offetType + 'Offer ?'
    document.getElementById('confirm_btn').setAttribute('onclick', `remove('${offerId}')`)
    $('#unlist').modal('show')
}

// remove
async function remove(offerId) {

    document.getElementById('remove_btn' + offerId).setAttribute('disabled', 'disabled')

    $('#unlist').modal('hide')
    document.getElementById('row' + offerId).style.display = 'none'

    try {

        const resp = await fetch(`/admin/removeOffer?offerId=${offerId}`, { method: 'DELETE' })
        const data = await resp.json()

        if (data.type === 'redirect') {
            window.location.href = '/admin/signIn'
        }
        else if (data.type === 'invalid') {
            document.getElementById('remove_btn' + offerId).removeAttribute('disabled')
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
        window.location.href = '/admin/listsOffers'
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