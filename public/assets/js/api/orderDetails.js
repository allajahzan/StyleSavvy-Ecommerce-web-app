function loadPage(){
    const url = window.location.href
    localStorage.setItem('url', url);
}
// pay now 
async function payNow(placedOrderId) {
    document.getElementById('sts_p').removeAttribute('onclick');

    try {
        const resp = await fetch('/check/repayment', {
            method: 'POST',
            headers: {
                'Content-type': 'application/json'
            },
            body: JSON.stringify({
                orderId: placedOrderId
            })
        })

        const data = await resp.json()

        if (data.type === 'redirect') {
            window.location.href = '/signIn'
        } else if (data.type === 'network') {
            document.getElementById('sts_p').setAttribute('onclick', `payNow('${placedOrderId}')`);
            document.getElementById('snackbar_icon').innerHTML = 'error'
            document.getElementById('snackbar_icon').style.color = 'red'
            showSnackBar(data.msg)
        } else {
            localStorage.setItem('placedOrderId', placedOrderId);
            if (data.arrayOfItems.length !== 0) {
                displayErrorProducts(data.arrayOfItems)
            } else {
                $('#add_money').modal('show')
            }
        }
    } catch (err) {
        console.log(err);
        window.location.href = '/500-Server-Error'
    }
}


// template for modal with outofstcok items
function displayErrorProducts(array) {
    const html = array.map(product => `
        <div class="row">
            <div class="col-3 col-sm-3 col-md-3 img-div">
                <img id="product_img" src="/products/uploads/${product.image}" alt="">
            </div>
            <div class="col-9 col-sm-9 col-md-9 name-div">
                <div class="row">
                    <div class="col">
                        <h6 id="product_name">${product.name}</h6>
                        <p id="category_of_p">${product.types} > ${product.category}  > ${product.color}  > <span style="color:#bf8040">${product.size}</span></p>
                        <p id="show_label_p">${product.msg}</p>
                    </div>
                </div>
            </div>
        </div>
    `).join('');

    document.getElementById('show_unavailable_p').innerHTML = html;
    $('#outofstock').modal('show');
}

// cancel 
function cancelModal() {
    let placedOrderId = localStorage.getItem('placedOrderId');
    document.getElementById('sts_p').setAttribute('onclick', `payNow('${placedOrderId}')`);
    localStorage.clear()
}

// dont order button
function dontOrder() {
    let placedOrderId = localStorage.getItem('placedOrderId');
    document.getElementById('sts_p').setAttribute('onclick', `payNow('${placedOrderId}')`);
    localStorage.clear()
}

// order button
async function orderNow() {
    $('#add_money').modal('hide')
    let placedOrderId = localStorage.getItem('placedOrderId');
    await onlinePayment(placedOrderId)
    localStorage.clear()
    document.getElementById('ordernow_button').setAttribute('disabled', 'disabled')
    document.getElementById('ordernow_button').style.opacity = '0.8'
}


// order with razor pay

async function onlinePayment(placedOrderId) {

    try {
        const resp = await fetch(`/createOrderId?orderId=${placedOrderId}`, { method: 'GET', })
        const data = await resp.json()

        if (data.type === 'redirect') {
            window.location.href = '/signIn'
        } else if (data.type === 'network') {
            document.getElementById('sts_p').setAttribute('onclick', `payNow('${placedOrderId}')`);
            document.getElementById('ordernow_button').removeAttribute('disabled')
            document.getElementById('ordernow_button').style.opacity = '1'
            document.getElementById('snackbar_icon').innerHTML = 'error'
            document.getElementById('snackbar_icon').style.color = 'red'
            showSnackBar(data.msg)
        }
        else {
            const orderId = data.orderId
            const totalPrice = data.totalPrice
            const razorPayKey = data.razorPayKey

            var options = {
                "key": `${razorPayKey}`,
                "amount": totalPrice * 100,
                "currency": "INR",
                "name": "StyleSavvy",
                // "image": "/assets/images/demos/demo-5/logo11.png",
                "order_id": orderId,
                "handler": async function (response) {

                    const object = {
                        razorpay_order_id: response.razorpay_order_id,
                        razorpay_payment_id: response.razorpay_payment_id,
                        razorpay_signature: response.razorpay_signature,
                        placedOrderId: placedOrderId
                    }

                    const verificationResponse = await fetch('/verifyRePayment', {
                        method: 'POST',
                        headers: {
                            'Content-type': 'application/json'
                        },
                        body: JSON.stringify(object)
                    })

                    const verificationResponseData = await verificationResponse.json()

                    if (verificationResponseData.paymentStatus === 'Failure') {
                        document.getElementById('sts_p').setAttribute('onclick', `payNow('${placedOrderId}')`);
                        document.getElementById('ordernow_button').removeAttribute('disabled')
                        document.getElementById('ordernow_button').style.opacity = '1'
                        document.getElementById('snackbar_icon').innerHTML = 'error'
                        document.getElementById('snackbar_icon').style.color = 'red'
                        showSnackBar(verificationResponseData.msg)
                    } else {

                        showSnackBar(verificationResponseData.msg)
                        setTimeout(() => {
                            window.location.href = `/orderDetails?orderId=${placedOrderId}`;
                        }, 1000);

                    }
                },
                // "prefill": {
                //     "name": "Gaurav Kumar",
                //     "email": "gaurav.kumar@example.com",
                //     "contact": "9000090000"
                // },
                "notes": {
                    "address": "Razorpay Corporate Office"
                },
                "theme": {
                    "color": "#bf8040"
                },
                "modal": {
                    "ondismiss": async function () {
                        document.getElementById('sts_p').setAttribute('onclick', `payNow('${placedOrderId}')`);
                        document.getElementById('ordernow_button').removeAttribute('disabled')
                        document.getElementById('ordernow_button').style.opacity = '1'
                        document.getElementById('snackbar_icon').innerHTML = 'error'
                        document.getElementById('snackbar_icon').style.color = 'red'
                        showSnackBar("Payment failed or dismised")
                    }
                },
            };

            var rzp1 = new Razorpay(options);
            rzp1.open();
        }
    } catch (err) {
        console.log(err);
        window.location.href = '/500-Server-Error'
    }
}


// show snack bar
function showSnackBar(text) {
    document.getElementById('snackbar_msg').innerHTML = text
    const x = document.getElementById("snackbar");
    x.className = "show";
    setTimeout(function () {
        x.className = x.className.replace("show", "");
        document.getElementById('snackbar_icon').innerHTML = 'task_alt'
        document.getElementById('snackbar_icon').style.color = 'rgb(37, 199, 37)'
    }, 3000);
}