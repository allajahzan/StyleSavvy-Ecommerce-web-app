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

// remove from wihslist 

async function removeFromWishList(vId, sizeId, itemId) {

    $('#remove').modal('show')

    document.getElementById('confirm_btn').setAttribute('onclick', `removeItem('${vId}','${sizeId}','${itemId}')`)
}

async function removeItem(vId, sizeId, itemId) {
    try {
        const obj = {
            vId: vId,
            sizeId: sizeId
        };

        const resp = await fetch('/wishlist/add', {
            method: 'POST',
            headers: {
                'Content-type': 'application/json'
            },
            body: JSON.stringify(obj)
        });

        const data = await resp.json();

        if (data.type === 'redirect') {
            window.location.href = '/signIn';
        } else {

            if (data.count > 0) {
                document.getElementById('wishlist_count').innerHTML = data.count
                document.getElementById(`${itemId}`).style.display = 'none'
                $('#remove').modal('hide')
                showSnackBar(data.msg);
            } else {

                document.getElementById('wishlist_count').innerHTML = data.count
                document.getElementById(`${itemId}`).style.display = 'none'
                document.getElementById('page-content').style.paddingBottom = '0rem'
                document.getElementById('nowishlist_div').style.display = 'block'
                $('#remove').modal('hide')
                showSnackBar(data.msg);
            }

        }
    } catch (err) {
        console.log(err);
        window.location.href = '/500-Server-Error'
    }
}


// add to cart

async function addToCart(vId, sizeId, price) {
    try {
        const obj = {
            vId: vId,
            quantity: 1,
            sizeId: sizeId,
            price: price
        };

        // console.log(obj);

        const resp = await fetch('/cart/add', {
            method: 'POST',
            headers: {
                'Content-type': 'application/json'
            },
            body: JSON.stringify(obj)
        });

        const data = await resp.json();

        if (data.type === 'error') {
            window.location.href = '/signIn';
        } else {
            document.getElementById('cart_count').innerHTML = data.count
            showSnackBar(data.msg);
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
    setTimeout(function () { x.className = x.className.replace("show", ""); }, 3000);
}


