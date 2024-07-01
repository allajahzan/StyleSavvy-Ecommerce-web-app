async function loadCartPage() {
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

    let placedOrderId = localStorage.getItem('placedOrderId');

    if (placedOrderId !== null) {
        document.getElementById('snackbar_icon').innerHTML = 'error'
        document.getElementById('snackbar_icon').style.color = 'red'
        showSnackBar("Order failed or dismised")
        try {
            await fetch('/increaseQuantity', {
                method: 'POST',
                headers: {
                    'Content-type': 'application/json'
                },
                body: JSON.stringify({
                    placedOrderId: placedOrderId
                })
            })


            localStorage.clear()

            setTimeout(() => {
                window.location.href = `/orderDetails?orderId=${placedOrderId}`;
            }, 1000);
        } catch (err) {
            console.log(err);
            window.location.href = '/500-Server-Error'
        }

    }

}

// update whole  the cart

async function updateCart() {

    document.getElementById('update_cart_btn').setAttribute('disabled', 'disabled')
    document.getElementById('update_cart_btn').style.opacity = '0.5'

    try {
        const resp = await fetch('/cart/items', { method: 'GET' })
        const data = await resp.json()

        if (data.type === 'redirect') {
            window.location.href = '/signIn'
        }

        if (data.items.length > 0) {


            document.getElementById('update_cart_btn').removeAttribute('disabled')
            document.getElementById('update_cart_btn').style.opacity = '1'

            document.getElementById('count').innerHTML = `Price(${data.count} Items):`

            // total amout updated
            let subTotal = (Number(data.total) + Number(0.00)).toFixed(2);
            document.getElementById('sub_total').innerHTML = '₹ ' + subTotal;

            let lastTotal = (Number(data.total) + 0.00).toFixed(2);
            document.getElementById('last_total').innerHTML = '₹ ' + lastTotal;

            const cartContainer = document.getElementById('cart_whole_items_div');

            cartContainer.style.visibility = 'hidden';
            cartContainer.style.opacity = '0';
            cartContainer.innerHTML = renderCartItems(data.items);

            setTimeout(() => {
                cartContainer.style.visibility = 'visible';
                cartContainer.style.opacity = '1';
            }, 50);

        }
        else {
            setTimeout(() => {
                document.getElementById('nocart_div').style.display = 'flex'
                document.getElementById('checkout_div').style.display = 'none'
            }, 50)
        }

    } catch (err) {
        console.log(err);
        window.location.href = '/500-Server-Error'
    }

}


// checkout from cart

async function checkOut() {
    const checkoutBtn = document.getElementById('checkout_btn');
    checkoutBtn.setAttribute('disabled', 'disabled');
    checkoutBtn.style.opacity = '0.8';

    try {
        await Promise.all([fetchAndProcessCheckoutData()]);
    } catch (err) {
        console.log(err);
        window.location.href = '/500-Server-Error'
    } finally {
        checkoutBtn.removeAttribute('disabled');
        checkoutBtn.style.opacity = '1';
    }
}

async function fetchAndProcessCheckoutData() {
    try {
        const resp = await fetch('/cart/checkout', { method: 'GET' });
        const data = await resp.json();

        if (data.type === 'redirect') {
            window.location.href = '/signIn';
        } else {
            const arrayForError = data.arrayForError.filter(data => data.type === 'error');
            if (arrayForError.length > 0) {
                displayErrorProducts(arrayForError);
            } else {
                window.location.href = '/checkout'
            }
        }
    } catch (err) {
        console.log(err);
        window.location.href = '/500-Server-Error'
    }
}

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


// function to continue checkout and store cart token

async function continueCheckOut() {

    document.getElementById('understood_btn_unavailable').setAttribute('disabled', 'disabled')

    try {

        const resp = await fetch('/cart/storeToken', { method: 'GET' })
        const data = await resp.json()

        if (data.type === ' redirect') {
            window.location.href = '/signIn'
        }
        else if (data.type === 'reduce') {
            showSnackBar(data.msg)
            document.getElementById('snackbar_icon').innerHTML = 'error'
            document.getElementById('snackbar_icon').style.color = 'red'

            document.getElementById('understood_btn_unavailable').removeAttribute('disabled')

        } else if (data.type === 'empty') {
            showSnackBar(data.msg)
            document.getElementById('snackbar_icon').innerHTML = 'error'
            document.getElementById('snackbar_icon').style.color = 'red'

            document.getElementById('understood_btn_unavailable').removeAttribute('disabled')
        }
        else {
            window.location.href = '/checkout'
        }

    } catch (err) {
        console.log(err);
        window.location.href = '/500-Server-Error'
    }
}




// decremnet the quantity
async function decrement(vId, sId, id) {

    let num = Number(document.getElementById('quantity' + id).value)
    num = num - 1
    if (num > 0) {
        try {
            const obj = {
                itemId: document.getElementById('itemId' + id).value,
                vId: vId,
                sId: sId,
                quantity: num,
                indx: document.getElementById('itemIndex' + id).value
            }

            const resp = await fetch('/cart/update',
                {
                    method: 'PATCH',
                    headers: {
                        'Content-type': 'application/json'
                    },
                    body: JSON.stringify(obj)
                })
            const data = await resp.json()

            if (data.type === 'unavailable') {

                await updateCart()
                showSnackBar(data.msg)


            }
            else if (data.type === 'error') {

                document.getElementById('count').innerHTML = `Price(${data.count} Items):`
                // total amout updated
                let subTotal = (Number(data.total) + Number(0.00)).toFixed(2);
                document.getElementById('sub_total').innerHTML = '₹ ' + subTotal;
                let lastTotal = (Number(data.total) + 0.00).toFixed(2);
                document.getElementById('last_total').innerHTML = '₹ ' + lastTotal;

                if (data.stock === 0) {
                    document.getElementById('stock_lable' + id).style.color = 'red'
                    document.getElementById('stock_lable' + id).innerHTML = `Out of stock`
                    document.getElementById('totalPrice' + id).style.display = 'none'
                    document.getElementById('quantity_btn_' + id).style.display = 'none'
                    showSnackBar("We are sorry! No stocks are available")
                }
                else if (data.stock < num || data.stock >= num) {

                    document.getElementById('quantity' + id).value = data.stock
                    document.getElementById('stock_lable' + id).style.color = 'red'
                    document.getElementById('stock_lable' + id).innerHTML = `Only ${data.stock} stock(s) left`
                    showSnackBar(data.msg)
                }
            } else if (data.type === 'redirect') {
                window.location.href = '/signIn'
            } else if (data.type === 'network') {
                showSnackBar(data.msg)
            }
            else {


                document.getElementById('count').innerHTML = `Price(${data.count} Items):`
                // total amout updated
                let subTotal = (Number(data.total) + Number(0.00)).toFixed(2);
                document.getElementById('sub_total').innerHTML = '₹ ' + subTotal;

                let lastTotal = (Number(data.total) + 0.00).toFixed(2);
                document.getElementById('last_total').innerHTML = '₹ ' + lastTotal;

                // update price and quantity of item
                document.getElementById('quantity' + id).value = num;
                document.getElementById('totalPrice' + id).innerHTML = '₹ ' + data.price;
                if (data.stock > num && data.stock > 5) {
                    document.getElementById('stock_lable' + id).style.color = 'green'
                    document.getElementById('stock_lable' + id).innerHTML = `In stock`
                }
            }
        } catch (err) {
            console.log(err);
            window.location.href = '/500-Server-Error'
        }
    }
}

// increment the quantity
async function increment(vId, sId, id) {

    let num = Number(document.getElementById('quantity' + id).value)
    num = num + 1;

    try {

        const obj = {
            itemId: document.getElementById('itemId' + id).value,
            vId: vId,
            sId: sId,
            quantity: num,
            indx: document.getElementById('itemIndex' + id).value
        }

        const resp = await fetch('/cart/update',
            {
                method: 'PATCH',
                headers: {
                    'Content-type': 'application/json'
                },
                body: JSON.stringify(obj)
            })
        const data = await resp.json()

        if (data.type === 'unavailable') {

            await updateCart()
            showSnackBar(data.msg)


        }
        else if (data.type === 'error') {


            document.getElementById('count').innerHTML = `Price(${data.count} Items):`
            // total amount update
            let subTotal = (Number(data.total) + Number(0.00)).toFixed(2);
            document.getElementById('sub_total').innerHTML = '₹ ' + subTotal;
            let lastTotal = (Number(data.total) + 0.00).toFixed(2);
            document.getElementById('last_total').innerHTML = '₹ ' + lastTotal;

            if (data.stock === 0) {

                document.getElementById('stock_lable' + id).style.color = 'red'
                document.getElementById('stock_lable' + id).innerHTML = `Out of stock`
                document.getElementById('totalPrice' + id).style.display = 'none'
                document.getElementById('quantity_btn_' + id).style.display = 'none'

                showSnackBar("We are sorry! No stocks are available")
            }
            else if (data.stock <= 5) {

                document.getElementById('quantity' + id).value = data.stock
                document.getElementById('stock_lable' + id).style.color = 'red'
                document.getElementById('stock_lable' + id).innerHTML = `Only ${data.stock} stock(s) left`
                showSnackBar(data.msg)

            } else {
                showSnackBar(data.msg)
            }
        }
        else if (data.type === 'redirect') {
            window.location.href = '/signIn'
        } else if (data.type === 'network') {
            showSnackBar(data.msg)
        }
        else {

            document.getElementById('count').innerHTML = `Price(${data.count} Items):`
            // total amount update
            let subTotal = (Number(data.total) + Number(0.00)).toFixed(2);
            document.getElementById('sub_total').innerHTML = '₹ ' + subTotal;

            let lastTotal = (Number(data.total) + 0.00).toFixed(2);
            document.getElementById('last_total').innerHTML = '₹ ' + lastTotal;

            // update price and quantity of item
            document.getElementById('quantity' + id).value = num;
            document.getElementById('totalPrice' + id).innerHTML = '₹ ' + data.price;
            if (data.stock > num && data.stock > 5) {
                document.getElementById('stock_lable' + id).style.color = 'green'
                document.getElementById('stock_lable' + id).innerHTML = `In stock`
            }
        }
    } catch (err) {
        console.log(err);
        window.location.href = '/500-Server-Error'
    }
}

// get modal to remove item
function getRemoveModal(id) {
    document.getElementById('confirm_btn').setAttribute('onclick', `removeItem('${id}')`)

}

// function to remove item

async function removeItem(id) {
    try {

        document.getElementById('confirm_btn').setAttribute('disabled', 'disabled')
        document.getElementById('confirm_btn').style.opacity = '0.8'

        const resp = await fetch(`/cart/remove?itemId=${id}`, { method: 'DELETE' })
        const data = await resp.json()

        if (data.type === 'redirect') {
            window.location.href = '/signIn'
        } else if (data.type === 'error') {

            document.getElementById('confirm_btn').removeAttribute('disabled')
            document.getElementById('confirm_btn').style.opacity = '1'
            document.getElementById('snackbar_icon').innerHTML = 'error'
            document.getElementById('snackbar_icon').style.color = 'red'
            showSnackBar(data.msg)
            $('#remove').modal('hide')
        }
        else {

            document.getElementById('cart_count').innerHTML = data.cartCount

            document.getElementById('confirm_btn').removeAttribute('disabled')
            document.getElementById('confirm_btn').style.opacity = '1'

            document.getElementById('row' + id).style.display = 'none'
            $('#remove').modal('hide')

            // show msg
            showSnackBar(data.msg)

            // text (price -- items)
            document.getElementById('count').innerHTML = `Price(${data.count} Items):`

            // total amount update
            let subTotal = (Number(data.total) + Number(0.00)).toFixed(2);
            document.getElementById('sub_total').innerHTML = '₹ ' + subTotal;

            let lastTotal = (Number(data.total) + 0.00).toFixed(2);
            document.getElementById('last_total').innerHTML = '₹ ' + lastTotal;


            if (data.items.length === 0) {
                document.getElementById('nocart_div').style.display = 'flex'
                document.getElementById('checkout_div').style.display = 'none'
            }

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



// template for cart items

function renderCartItems(cart) {
    let cartHTML = '';

    cart.reverse().forEach(item => {
        cartHTML += `
            <div id="row${item._id}" class="row lap_size">
                <div class="col-3 col-sm-3 col-md-2 img-div">
                    <img src="/products/uploads/${item.image}" alt="">
                    ${item.stock !== 0 ? `
                            <div id="quantity_btn_${item._id}">
                                <div class="quantity${item._id}" id="btn_quantity_cart">
                                    <div class="product-details-quantity">
                                        <button onclick="decrement('${item.vId}', '${item.sId}','${item._id}')" id="btn_decrement">
                                            <span class="material-symbols-outlined">remove</span>
                                        </button>
                                        <input disabled type="text" id="quantity${item._id}" value="${item.quantity}" readonly required>
                                        <button onclick="increment('${item.vId}', '${item.sId}','${item._id}')" id="btn_increment">
                                            <span class="material-symbols-outlined">add</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ` : `
                            <div id="quantity_btn_${item._id}">
                                <div class="quantity${item._id}" style="display: none;" id="btn_quantity_cart">
                                    <div class="product-details-quantity">
                                        <button onclick="decrement('${item.vId}', '${item.sId}','${item._id}')" id="btn_decrement">
                                            <span class="material-symbols-outlined">remove</span>
                                        </button>
                                        <input disabled type="text" id="quantity${item._id}" value="${item.quantity}" readonly required>
                                        <button onclick="increment('${item.vId}', '${item.sId}','${item._id}')" id="btn_increment">
                                            <span class="material-symbols-outlined">add</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        `
            }
                </div>
                <div class="col-8 col-sm-8 col-md-9 name-div">
                    <p class="name-p">
                        <h6>${item.product_name}</h6>
                        <p class="category">
                            ${item.type} > ${item.category} > ${item.color} > <span style="color: #bf8040;">${item.size}</span>
                        </p>
                        ${item.stock !== 0 ? `<h5 id="totalPrice${item._id}">₹ ${item.totalPrice}</h5>` : ''
            }
                        ${item.stock <= 5 && item.stock > 0 ? `
                                ${item.stock < item.quantity || item.stock === item.quantity ? `
                                        <p id="stock_lable${item._id}" class="p" style="color: red;">Only ${item.stock} stock(s) left</p>
                                    ` : `
                                        <p id="stock_lable${item._id}" class="p" style="color: red;">Only few stocks</p>
                                    `
                }
                            ` : item.stock > 5 ? `
                                <p class="p" id="stock_lable${item._id}" style="color: green;">In stock</p>
                            ` : `
                                <p class="p" id="stock_lable${item._id}" style="color: red;">Out of stock</p>
                            `
            }
                    </p>
                    <form action="">
                        <input type="hidden" id="itemId${item._id}" value="${item._id}">
                        <input type="hidden" id="itemIndex${item._id}" value="${item.index}">
                    </form>
                </div>
                <div class="col-1 col-sm-1 col-md-1 remove">
                    <span onclick="getRemoveModal('${item._id}')" data-bs-toggle="modal" data-bs-target="#remove" class="material-symbols-outlined">
                        close
                    </span>
                </div>
            </div>
        `;
    });

    return cartHTML;
}
