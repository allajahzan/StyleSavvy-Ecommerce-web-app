function loadCoupons() {
    setTimeout(() => {
        document.getElementById('loading').style.display = 'none'
        document.getElementById('products').style.display = 'block'
    }, 400);



    // get categoris or products base on the offer type

    // Get a categories depends on the type selected
    const selectOfferType = document.getElementById('selectOfferType');
    const selectType = document.getElementById('select_typeOffer');


    selectOfferType.addEventListener('change', async () => {
        const type = selectOfferType.value;
        try {
            const response = await fetch(`/admin/getTypes?type=${type}`);
            const data = await response.json()

            document.getElementById('pcategory').style.display = 'none'
            selectType.style.display = 'block'

            //  Clear existing options
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

                        document.getElementById('pcategory').style.display = 'block'
                        document.getElementById('pcategory').setAttribute('placeholder', 'No products are added')
                        selectType.style.display = 'none'
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

                        document.getElementById('pcategory').style.display = 'block'
                        document.getElementById('pcategory').setAttribute('placeholder', 'No categories are added')
                        selectType.style.display = 'none'
                    }
                }
            }
        } catch (error) {
            console.log(err);
            window.location.href = '/admin/500-Server-Error'
        }
    });


    // add coupons

    const form = document.getElementById("add_form")
    form.addEventListener('submit', async (event) => {
        event.preventDefault()

        document.getElementById('add_product').removeAttribute('disabled')
        const selectType = document.getElementById('select_typeOffer');
        const selectedOption = selectType.options[selectType.selectedIndex];
        const selectedText = selectedOption.text;

        const obj = {
            offer_name: form[0].value,
            offerType: form[1].value,
            itemId: selectType.value,
            typeName: selectedText,
            offer: document.getElementById('offer').value,
            redeem_amount: document.getElementById('redeem').value,
        }



            try {
                const resp = await fetch('/admin/addOffers', {
                    method: 'POST',
                    headers: {
                        'Content-type': 'application/json'
                    },
                    body: JSON.stringify(obj)
                })

                const data = await resp.json()

                const error_code = document.getElementById('error_code')
                const input1 = form[0]

                if (data.type === 'redirect') {
                    window.location.href = '/admin/signIn'
                }
                else if (data.type === 'offerName') {

                    showError(input1, error_code, data.msg)
                    removeError(input1, error_code)

                } else {
                    form.reset()
                    document.getElementById('pcategory').style.display = 'block'
                    document.getElementById('select_typeOffer').style.display = 'none'
                    document.getElementById('add_product').removeAttribute('disabled')
                    const myModal = new bootstrap.Modal(document.getElementById('message'));
                    myModal.show();
                }
            } catch (err) {
                console.log(err);
                window.location.href = '/admin/500-Server-Error'
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