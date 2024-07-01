// add mondet from razorpay

async function addMoney() {

    $('#add_money').modal('show')

}

async function addMoneyToWallet(event) {
    event.preventDefault()
    try {

        const amount = Number(document.getElementById('amount_to_add').value)

        const resp = await fetch('/wallet/createOrderId', {
            method: 'POST',
            headers: {
                'Content-type': 'application/json'
            },
            body: JSON.stringify({
                amount: amount
            })
        })

        const data = await resp.json()

        if (data.type === 'redirect') {
            window.location.href = '/signIn'
        } else if (data.type === 'network') {
            document.getElementById('snackbar_icon').innerHTML = 'error'
            document.getElementById('snackbar_icon').style.color = 'red'
            showSnackBar(data.msg)
        }
        else {

            $('#add_money').modal('hide')
            document.getElementById('amount_to_add').value = ''

            const orderId = data.orderId
            const price = amount

            var options = {
                "key": 'rzp_test_skAEQgQt7EzPTE',
                "amount": price * 100,
                "currency": "INR",
                "name": "StyleSavvy",
                "image": "/assets/images/demos/demo-5/logo11.png",
                "order_id": orderId,
                "handler": async function (response) {

                    const object = {
                        razorpay_order_id: response.razorpay_order_id,
                        razorpay_payment_id: response.razorpay_payment_id,
                        razorpay_signature: response.razorpay_signature,
                        amount: price
                    }

                    const verificationResponse = await fetch('/wallet/verifyPayment', {
                        method: 'POST',
                        headers: {
                            'Content-type': 'application/json'
                        },
                        body: JSON.stringify(object)
                    })

                    const verificationResponseData = await verificationResponse.json()

                    if (verificationResponseData.paymentStatus === 'Failure') {

                        document.getElementById('snackbar_icon').innerHTML = 'error'
                        document.getElementById('snackbar_icon').style.color = 'red'
                        showSnackBar(`Rs ${price} failed to add to wallet`)
                    } else {

                        document.getElementById('balance_amount').innerHTML = `Balance : Rs ${verificationResponseData.wallet.balance}`

                        const div = document.getElementById('collapseExample')
                        const html = generateTable(verificationResponseData.wallet)
                        div.innerHTML = html;

                        document.getElementById('snackbar_icon').innerHTML = 'task_alt'
                        document.getElementById('snackbar_icon').style.color = 'rgb(37, 199, 37)'
                        showSnackBar(`Rs ${price} successfully added to wallet`)
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
                        document.getElementById('snackbar_icon').innerHTML = 'error'
                        document.getElementById('snackbar_icon').style.color = 'red'
                        showSnackBar('Failed to add money to wallet')
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

function generateTable(wallet) {
    const transactions = wallet.transaction_history.reverse(); // Reverse to show the latest first

    let tableHTML = `
    <table class="table table-striped">
        <thead>
            <tr>
                <th>Amount</th>
                <th>Type</th>
                <th>Date and Time</th>
                <th>Description</th>
            </tr>
        </thead>
        <tbody>
    `;

    transactions.forEach(element => {
        const typeColor = element.type === 'Credited' ? 'green' : 'red';
        tableHTML += `
        <tr>
            <td>${element.amount}</td>
            <td style="color: ${typeColor}">${element.type}</td>
            <td>${formatDate(new Date(element.dateTime))} ${new Date(element.dateTime).toLocaleTimeString()}</td>
            <td>${element.discription}</td>
        </tr>
        `;
    });

    tableHTML += `
        </tbody>
    </table>
    `;

    return tableHTML;
}

function formatDate(date) {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString(undefined, options);
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