function loadOrders() {
    document.body.style.overflow = 'hidden';
    setTimeout(() => {
        document.getElementById('cart').style.display = 'block'
        document.getElementById('cart').style.visibility = 'hidden'
    }, 500);
    setTimeout(() => {
        document.getElementById('loading').style.display = 'none'
        document.getElementById('cart').style.visibility = 'visible'
        document.body.style.overflow = '';
    }, 1000);

    const url = window.location.href
    localStorage.setItem('url', url);
}


// get order details page

function getDetails(orderId, id) {
    window.location.href = `/orderDetails?orderId=${id}`
}

// cancel order

function cancelItem(event, itemId) {
    event.stopPropagation();
    $('#cancel').modal('show');

    document.getElementById('confirm_btn_cancel').setAttribute(`onclick`, `cancel('${itemId}')`);
}

async function cancel(itemId) {
    const form = document.getElementById('order_details' + itemId)

    document.getElementById('confirm_btn_cancel').setAttribute('disabled', 'disabled')
    document.getElementById('confirm_btn_cancel').style.opacity = '0.8'

    const obj = {
        orderId: form[0].value,
        itemIndex: form[1].value,
    }

    try {
        const resp = await fetch('/cancelOrder', {
            method: 'PATCH',
            headers: {
                'Content-type': 'application/json',
            },
            body: JSON.stringify(obj)
        })

        const data = await resp.json()

        if (data.type === 'redirect') {
            window.location.href = '/signIn'
        }
        else if (data.type === 'success') {

            document.getElementById('confirm_btn_cancel').removeAttribute('disabled')
            document.getElementById('confirm_btn_cancel').style.opacity = '1'

            data.orders.orderedItems.forEach((item) => {
                let price = item.totalPrice - item.discountAmount
                document.getElementById('price_item' + item._id).innerHTML = "₹ " + price + ` (${item.quantity})`
            })

            if (data.items.length > 1) {
                data.items.forEach((item) => {
                    let div = document.getElementById('status_details' + item._id)

                    if (item.orderStatus === 'Cancelled') {
                        div.innerHTML = `
        <div style="display: flex;">
            <div style="height: 12px; width: 13px; background-color: rgb(240, 58, 58); border-radius: 100px; margin-right: 10px; margin-top: 1px;"></div>
            <h6 style="font-size: 14px;">Cancelled on ${formatDate(item.cancelledDate)}</h6>
        </div>
        <p style="font-size: 13px;">Your order has been cancelled</p>
    `;

                    } else if (item.orderStatus === 'Pending') {

                        div.innerHTML = `
                     <div style="display: flex;">
                        <span style="font-size: 16px; color: green; margin-right: 10px;" class="material-symbols-outlined">
                        clock_loader_20
                        </span>
                        <h6  style="font-size: 14px;" >Confirmed on ${formatDate(item.orderedDate)}</h6>
                    </div>
                     <p style="font-size: 13px;">Your order has been confirmed</p>
                    <p id="sts_p" onclick="cancelItem(event, '${item._id}')">Do you wanna cancel this item ? <span style="margin-top: 5px; text-decoration: underline;">cancel</span></p>
                `;

                    } else {
                        div.innerHTML = `
                        <div style="display: flex;">
                        <span style="font-size: 15px; color: orange; margin-right: 10px;" class="material-symbols-outlined">
                        clock_loader_40
                        </span>
                        <h6 style="font-size: 14px;">Requested to return</h6>
                      </div>
                      <p style="font-size: 13px;">You have requested to return</p>
            `;
                    }
                })
            } else {
                let div = document.getElementById('status_details' + itemId)
                div.innerHTML = `
                <div style="display: flex;">
                    <div style="height: 12px; width: 13px; background-color: rgb(240, 58, 58); border-radius: 100px; margin-right: 10px; margin-top: 1px;"></div>
                    <h6 style="font-size: 14px;">Cancelled on ${formatDate(data.items[0].cancelledDate)}</h6>
                </div>
                <p style="font-size: 13px;">Your order has been cancelled</p>
            `;

            }

            document.getElementById('snackbar_icon').innerHTML = 'task_alt'
            document.getElementById('snackbar_icon').style.color = 'rgb(37, 199, 37)'
            showSnackBar(data.msg)
        } else {
            let div = document.getElementById('status_details' + itemId)

            div.innerHTML = `
    <div style="display: flex;">
    <div style="height: 12px; width: 13px; background-color: green; border-radius: 100px; margin-right: 10px; margin-top: 1px;"></div>
    <h6 style="font-size: 14px;">Delivered on ${formatDate(data.item.deliveredDate)}</h6>
  </div>
  <p style="font-size: 13px;">Your order has been delivered</p>

  <p id="sts_p" onclick="returnItem(event, '${data.item._id}')"> Do you wanna return this item ? <span style="margin-top: 5px; text-decoration: underline;">return</span></p>
`;


            document.getElementById('snackbar_icon').innerHTML = 'error'
            document.getElementById('snackbar_icon').style.color = 'red'
            showSnackBar(data.msg)
        }

        $('#cancel').modal('hide');
    } catch (err) {
        console.log(err);
        window.location.href = '/500-Server-Error'
    }

}

// Function to format the date
function formatDate(dateString) {
    const date = new Date(dateString);
    const options = { day: 'numeric', month: 'long', year: 'numeric' };
    return date.toLocaleDateString('en-GB', options);
}

// retuen order

async function returnItem(event, itemId) {
    event.stopPropagation()

    $('#reason').modal('show')

    document.getElementById('itemId').value = itemId
}

async function returns(event) {

    event.preventDefault()

    const itemId = document.getElementById('itemId').value
    const form = document.getElementById('order_details' + itemId)
    const reason = document.getElementById('reason_return').value

    const obj = {
        orderId: form[0].value,
        itemIndex: form[1].value,
        reason: reason
    }

    try {

        const resp = await fetch('/requestReturn', {
            method: 'PATCH',
            headers: {
                'Content-type': 'application/json'
            },
            body: JSON.stringify(obj)
        })

        const data = await resp.json()

        if (data.type === 'redirect') {
            window.location.href = '/signIn'
        }
        else if (data.type === 'error') {
            const input = document.getElementById('reason_return')
            const errorSymbol = document.getElementById('error_reason')
            showError(input, errorSymbol, data.msg)
            setTimeout(() => {
                removeError(input, errorSymbol)
            }, 2000);
        }
        else {

            if (data.items.length > 1) {

                data.items.forEach((item) => {
                    let div = document.getElementById('status_details' + item._id)

                    if (item.orderStatus === 'RequestedReturn') {
                        div.innerHTML = `
                        <div style="display: flex;">
                        <span style="font-size: 15px; color: orange; margin-right: 10px;" class="material-symbols-outlined">
                        clock_loader_40
                        </span>
                        <h6 style="font-size: 14px;">Requested to return</h6>
                      </div>
                      <p style="font-size: 13px;">You have requested to return</p>
            `;
                    } else {
                        div.innerHTML = `
                <div style="display: flex;">
                    <div style="height: 12px; width: 13px; background-color: rgb(240, 58, 58); border-radius: 100px; margin-right: 10px; margin-top: 1px;"></div>
                    <h6 style="font-size: 14px;">Cancelled on ${formatDate(item.cancelledDate)}</h6>
                </div>
                <p style="font-size: 13px;">Your order has been cancelled</p>
            `;
                    }

                })

            } else {
                let div = document.getElementById('status_details' + itemId)

                div.innerHTML = `
            <div style="display: flex;">
            <span style="font-size: 15px; color: orange; margin-right: 10px;" class="material-symbols-outlined">
            clock_loader_40
            </span>
            <h6 style="font-size: 14px;">Requested to return</h6>
          </div>
          <p style="font-size: 13px;">You have requested to return</p>
`;
            }

            document.getElementById('snackbar_icon').innerHTML = 'task_alt'
            document.getElementById('snackbar_icon').style.color = 'rgb(37, 199, 37)'
            showSnackBar(data.msg)

            document.getElementById('reason_return').value = ''
            $('#reason').modal('hide');
        }

    } catch (err) {
        console.log(err);
        window.location.href = '/500-Server-Error'
    }

}

// clear reason form

function clearForm() {
    document.getElementById('reason_form').reset()
}


// show and remove Errors

function showError(input, err, msg) {
    input.style.color = 'red'
    input.value = msg
    input.type = 'text'
    input.removeAttribute('required')
    input.setAttribute('readOnly', 'readOnly')
    err.innerHTML = 'error'
}

function removeError(input, err) {
    input.value = ''
    input.style.color = 'black'
    input.removeAttribute('readOnly')
    input.setAttribute('required', 'required')
    err.innerHTML = ''
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