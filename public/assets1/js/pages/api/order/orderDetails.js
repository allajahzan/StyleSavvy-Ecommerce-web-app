// loading orderdetails page

function loadOrders() {
    setTimeout(() => {
        document.getElementById('loading').style.display = 'none'
        document.getElementById('products').style.display = 'block'
    }, 400);

}


// change order status

async function changeStatus(itemId) {

    const select = document.getElementById('select_status' + itemId)

    const form = document.getElementById('order_details' + itemId)

    const obj = {
        userId: form[0].value,
        orderId: form[1].value,
        itemIndex: form[2].value,
        orderStatus: select.value
    }

    try {
        const resp = await fetch('/admin/orderStatus', {
            method: 'PATCH',
            headers: {
                'Content-type': 'application/json'
            },
            body: JSON.stringify(obj)
        })

        const data = await resp.json()

        if (data.type === 'redirect') {
            window.location.href = '/admin/signIn'
        }
        else {

            const tr1 = document.getElementById(itemId + 'paymentSts')
            const tr2 = document.getElementById(itemId + 'orderSts')
            const tr3 = document.getElementById(itemId + 'changeSts')

            const html1 = generateTr1(data.item)
            tr1.innerHTML = html1

            const html2 = generateTr2(data.item, data.orders)
            tr2.innerHTML = html2

            const html3 = generateTr3(data.item, form[2].value, data.orders)
            tr3.innerHTML = html3

            data.orders.orderedItems.forEach((item) => {
                document.getElementById('item_totalPrice' + item._id).innerHTML = '₹ ' + item.totalPrice
                document.getElementById('item_discountAmount' + item._id).innerHTML = '₹ ' + item.discountAmount
                document.getElementById('item_totalAmount' + item._id).innerHTML = '₹ ' + item.totalAmount
            })
        }

    } catch (err) {
        console.log(err);
        window.location.href = '/admin/500-Server-Error'
    }
}


// accept or reject request for return

async function requestStatus(itemId) {

    const select = document.getElementById('select_request' + itemId)

    const form = document.getElementById('order_details' + itemId)

    const obj = {
        userId: form[0].value,
        orderId: form[1].value,
        itemIndex: form[2].value,
        requestStatus: select.value
    }

    try {
        const resp = await fetch('/admin/requestStatus', {
            method: 'PATCH',
            headers: {
                'Content-type': 'application/json'
            },
            body: JSON.stringify(obj)
        })

        const data = await resp.json()

        if (data.type === 'redirect') {
            window.location.href = '/admin/signIn'
        }
        else {

            const tr1 = document.getElementById(itemId + 'paymentSts')
            const tr2 = document.getElementById(itemId + 'orderSts')
            const tr3 = document.getElementById(itemId + 'changeSts')

            const html1 = generateTr1(data.item)
            tr1.innerHTML = html1

            const html2 = generateTr2(data.item, data.orders)
            tr2.innerHTML = html2

            const html3 = generateTr3(data.item, form[2].value, data.orders)
            tr3.innerHTML = html3
        }
    } catch (err) {
        console.log(err);
        window.location.href = '/admin/500-Server-Error'
    }

}

// recieve returned product

async function recieveReturn(itemId) {

    // const select = document.getElementById('select_recieve' + itemId)

    const form = document.getElementById('order_details' + itemId)

    const obj = {
        userId: form[0].value,
        orderId: form[1].value,
        itemIndex: form[2].value,
    }

    try {
        const resp = await fetch('/admin/recieveReturned', {
            method: 'PATCH',
            headers: {
                'Content-type': 'application/json'
            },
            body: JSON.stringify(obj)
        })

        const data = await resp.json()

        if (data.type === 'redirect') {
            window.location.href = '/admin/signIn'
        }
        else {

            const tr1 = document.getElementById(itemId + 'paymentSts')
            const tr2 = document.getElementById(itemId + 'orderSts')
            const tr3 = document.getElementById(itemId + 'changeSts')

            const html1 = generateTr1(data.item)
            tr1.innerHTML = html1

            const html2 = generateTr2(data.item, data.orders)
            tr2.innerHTML = html2

            const html3 = generateTr3(data.item, form[2].value, data.orders)
            tr3.innerHTML = html3

            data.orders.orderedItems.forEach((item, index) => {

                document.getElementById('item_totalPrice' + item._id).innerHTML = '₹ ' + item.totalPrice
                document.getElementById('item_discountAmount' + item._id).innerHTML = '₹ ' + item.discountAmount
                document.getElementById('item_totalAmount' + item._id).innerHTML = '₹ ' + item.totalAmount

                if (item.orderStatus === 'RequestedReturn') {
                    // console.log(item);


                    document.getElementById(item._id + 'paymentSts').innerHTML = `
                <p style="color: ${item.paymentStatus === 'Pending' ? 'orange' : 'green'}; font-weight: bold;">
                    ${item.paymentStatus}
                </p>
        `;

                    document.getElementById(item._id + 'orderSts').innerHTML = `
                <p style="font-weight: bold; color: ${getStatusColor(data.orders, item)};">
                    ${getOrderStatus(data.orders, item)}
                </p>
        `;

                    document.getElementById(item._id + 'changeSts').innerHTML = `
                <div class="form-group">
                    ${getOrderActions(item)}
                    <form id="order_details${item._id}" action="">
                        <input type="hidden" value="${data.orders.customerId}">
                        <input type="hidden" value="${data.orders._id}">
                        <input type="hidden" value="${index}">
                    </form>
                </div>
    `;
                }

                if (item.orderStatus === 'Cancelled') {
                    // console.log(item);


                    document.getElementById(item._id + 'paymentSts').innerHTML = `
                <p style="color: ${item.paymentStatus === 'Pending' ? 'orange' : 'green'}; font-weight: bold;">
                    ${item.paymentStatus}
                </p>
        `;

                    document.getElementById(item._id + 'orderSts').innerHTML = `
                <p style="font-weight: bold; color: ${getStatusColor(data.orders, item)};">
                    ${getOrderStatus(data.orders, item)}
                </p>
        `;

                    document.getElementById(item._id + 'changeSts').innerHTML = `
                <div class="form-group">
                    ${getOrderActions(item)}
                    <form id="order_details${item._id}" action="">
                        <input type="hidden" value="${data.orders.customerId}">
                        <input type="hidden" value="${data.orders._id}">
                        <input type="hidden" value="${index}">
                    </form>
                </div>
    `;

                }


            })

        }


    } catch (err) {
        console.log(err);
        window.location.href = '/admin/500-Server-Error'
    }


}


// template string 
function generateTr1(item) {
    return `
            <p style="color: ${item.paymentStatus === 'Pending' ? 'orange' : 'green'}; font-weight: bold;">
                ${item.paymentStatus}
            </p>
    `;
}

function generateTr2(item, orders) {
    return `
            <p style="font-weight: bold; color: ${getStatusColor(orders, item)};">
                ${getOrderStatus(orders, item)}
            </p>
    `;
}

function generateTr3(item, index, orders) {
    return `
                <div class="form-group">
                    ${getOrderActions(item)}
                    <form id="order_details${item._id}" action="">
                        <input type="hidden" value="${orders.customerId}">
                        <input type="hidden" value="${orders._id}">
                        <input type="hidden" value="${index}">
                    </form>
                </div>
    `;
}

function getStatusColor(orders, item) {
    if ((orders.paymentMethod === 'COD' || orders.paymentMethod === 'wallet') && item.orderStatus === 'Pending') {
        return 'green';
    } else if (orders.paymentMethod === 'Online' && item.paymentStatus === 'Pending') {
        return 'orange';
    } else if (orders.paymentMethod === 'Online' && item.paymentStatus === 'Success') {
        return 'green';
    } else if (item.orderStatus === 'Cancelled') {
        return 'red';
    } else if (item.orderStatus === 'RequestedReturn') {
        return 'orange';
    } else if (item.orderStatus === 'RequestAccepted') {
        return 'black';
    } else if (item.orderStatus === 'RequestRejected') {
        return 'black';
    } else if (item.orderStatus === 'Returned') {
        return 'green';
    }
    else {
        return 'green';
    }
}

function getOrderStatus(orders, item) {
    if ((orders.paymentMethod === 'COD' || orders.paymentMethod === 'wallet') && item.orderStatus === 'Pending') {
        return 'Confirmed';
    } else if (orders.paymentMethod === 'Online' && item.paymentStatus === 'Pending' && item.orderStatus !== 'RequestAccepted' && item.orderStatus !== 'RequestRejected') {
        return item.orderStatus;
    } else if (orders.paymentMethod === 'Online' && item.paymentStatus === 'Success' && item.orderStatus === 'Pending') {
        return 'Confirmed';
    } else if (item.orderStatus === 'Cancelled') {
        return item.orderStatus;
    } else if (item.orderStatus === 'RequestedReturn') {
        return item.orderStatus;
    } else if (item.orderStatus === 'RequestAccepted') {
        return 'Return Request <span style="color: green;">Accepted</span>';
    } else if (item.orderStatus === 'RequestRejected') {
        return 'Return Request <span style="color: red;">Rejected</span>';
    } else if (item.orderStatus === 'Returned') {
        return item.orderStatus;
    }
    else {
        return item.orderStatus;
    }
}

function getOrderActions(item) {
    if (item.orderStatus === 'Delivered') {
        return ` 
        <select disabled style="border: none; border-style: solid; border-width: 1px; border-color: rgb(218, 218, 218);" class="show-tick ms select2" data-placeholder="Search and select" required>
        <option disabled selected hidden>Status</option>
        </select>
        `;
    } else if (item.orderStatus === 'Cancelled') {
        return ` 
        <select disabled style="border: none; border-style: solid; border-width: 1px; border-color: rgb(218, 218, 218);" class="show-tick ms select2" data-placeholder="Search and select" required>
        <option disabled selected hidden>Status</option>
        </select>
        `;
    } else if (item.orderStatus === 'RequestedReturn') {
        return `
            <select onchange="requestStatus('${item._id}')" style="border: none; border-style: solid; border-width: 1px; border-color: rgb(218, 218, 218);" id="select_request${item._id}" class="show-tick ms select2" data-placeholder="Search and select" required>
                <option disabled selected hidden>Status</option>
                <option value="Accept">Accept</option>
                <option value="Reject">Reject</option>
            </select>
        `;
    } else if (item.orderStatus === 'RequestAccepted') {
        return `
            <select onchange="recieveReturn('${item._id}')" style="border: none; border-style: solid; border-width: 1px; border-color: rgb(218, 218, 218);" id="select_recieve${item._id}" class="show-tick ms select2" data-placeholder="Search and select" required>
                <option disabled selected hidden>Status</option>
                <option disabled selected hidden>Return</option>
                <option value="Accept">Recieved</option>
            </select>
        `;
    } else if (item.orderStatus === 'RequestRejected') {
        return `
            <select disabled style="border: none; border-style: solid; border-width: 1px; border-color: rgb(218, 218, 218);" class="show-tick ms select2" data-placeholder="Search and select" required>
                <option disabled selected hidden>Status</option>
            </select>
        `;
    } else if (item.orderStatus === 'Returned') {
        return ` 
        <select disabled style="border: none; border-style: solid; border-width: 1px; border-color: rgb(218, 218, 218);" class="show-tick ms select2" data-placeholder="Search and select" required>
        <option disabled selected hidden>Status</option>
        </select>
        `;
    } else {
        return `
            <select onchange="changeStatus('${item._id}')" style="border: none; border-style: solid; border-width: 1px; border-color: rgb(218, 218, 218);" id="select_status${item._id}" class="show-tick ms select2" data-placeholder="Search and select" required>
                <option disabled selected hidden>Status</option>
                <option value="Shipped" ${item.orderStatus === 'Shipped' ? 'disabled' : ''}>Shipped</option>
                <option value="Delivered" ${item.orderStatus === 'Pending' ? 'disabled' : ''}>Delivered</option>
            </select>
        `;
    }
}


