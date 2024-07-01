async function loadProductDetails(vId) {
 
    const url = window.location.href
    localStorage.setItem('url', url);

    document.getElementById('productDetails').style.display = 'block'



    // to reset the select size tag
    try {

        const resp = await fetch(`/varients/sizes?vId=${vId}`, { method: 'GET' })
        const data = await resp.json()

        const select = document.getElementById('select_size')
        select.innerHTML = '';

        // Add options for each size
        data.sizes.forEach(size => {
            const option = document.createElement('option');
            option.value = size._id;
            option.textContent = size.size_name;
            select.appendChild(option);
        });

    } catch (err) {
        console.log(err);
        window.location.href = '/500-Server-Error'
    }

    // check quantity for each size

    // const btn = document.querySelector('.checkQuantity')
    // btn.addEventListener('click',()=>{
    //     alert("ok")
    // })



    // get price according to the size we select
    const selectSize = document.getElementById('select_size')
    selectSize.addEventListener('change', async () => {

        document.getElementById('quantity').value = 1 //make quantity 1 for each sizes

        const size_id = selectSize.value;
        const vId = document.getElementById('varient_id').value
        const pId = document.getElementById('product_id').value

        try {

            const presentQuantity = Number(document.getElementById('presentQuantity').value)

            const response = await fetch(`/product/varient?vId=${vId}&sId=${size_id}&pId=${pId}`, { method: 'GET' });
            const data = await response.json()

            if (data.msg === 'unlisted') {
                window.location.href = `/product?pId=${data.pid}&vId=${data.vid}`
            } else if (data.msg === 'redirect') {
                window.location.href = '/allProducts'
            }
            else if (data.msg === 'stock') {

                if (data.quantity === 0) {

                    if (presentQuantity === 0) {

                        // document.getElementById('varient_price').innerHTML = '₹' + ' ' + data.price
                        // document.getElementById('price').value = data.price

                        document.getElementById('varient_available').style.color = ''
                        document.getElementById('varient_available').innerHTML = 'Out of stock'
                        document.getElementById('varient_available').style.color = 'rgb(255, 0, 0)'

                        document.getElementById('btn_quantity1').style.display = 'none'
                        document.getElementById('btn_addtocart1').style.display = 'none'
                        document.getElementById('show_message1').style.display = 'block'
                        // document.getElementById('btn_wishlist').classList.add('details-action-wrapper')
                        document.getElementById('btn_wishlist22').style.display = 'block'
                        document.getElementById('btn_wishlist11').style.display = 'none'

                    } else {

                        // document.getElementById('varient_price').innerHTML = '₹' + ' ' + data.price
                        // document.getElementById('price').value = data.price

                        document.getElementById('varient_available').style.color = ''
                        document.getElementById('varient_available').innerHTML = 'Out of stock'
                        document.getElementById('varient_available').style.color = 'rgb(255, 0, 0)'

                        document.getElementById('btn_quantity').style.display = 'none'
                        document.getElementById('btn_addtocart').style.display = 'none'
                        document.getElementById('show_message').style.display = 'block'
                        // document.getElementById('btn_wishlist').classList.add('details-action-wrapper')
                        document.getElementById('btn_wishlist2').style.display = 'block'
                        document.getElementById('btn_wishlist1').style.display = 'none'
                    }


                } else if (data.quantity !== 0) {

                    if (presentQuantity === 0) {

                        // document.getElementById('varient_price').innerHTML = '₹' + ' ' + data.price
                        // document.getElementById('price').value = data.price

                        document.getElementById('varient_available').style.color = ''
                        document.getElementById('varient_available').innerHTML = 'Available'
                        document.getElementById('varient_available').style.color = 'green';

                        document.getElementById('btn_quantity1').style.display = 'flex'
                        document.getElementById('btn_addtocart1').style.display = 'flex'
                        document.getElementById('show_message1').style.display = 'none'
                        // document.getElementById('btn_wishlist').classList.remove('details-action-wrapper')
                        document.getElementById('btn_wishlist22').style.display = 'none'
                        document.getElementById('btn_wishlist11').style.display = 'block'

                    } else {

                        // document.getElementById('varient_price').innerHTML = '₹' + ' ' + data.price
                        // document.getElementById('price').value = data.price

                        document.getElementById('varient_available').style.color = ''
                        document.getElementById('varient_available').innerHTML = 'Available'
                        document.getElementById('varient_available').style.color = 'green';

                        document.getElementById('btn_quantity').style.display = 'flex'
                        document.getElementById('btn_addtocart').style.display = 'flex'
                        document.getElementById('show_message').style.display = 'none'
                        // document.getElementById('btn_wishlist').classList.remove('details-action-wrapper')
                        document.getElementById('btn_wishlist2').style.display = 'none'
                        document.getElementById('btn_wishlist1').style.display = 'block'
                    }

                }
            }
        } catch (err) {
            console.log(err);
            window.location.href = '/500-Server-Error'
        }
    })

}


// get color


// get color 

function getColor(color, colorcode) {
    const elements = document.querySelectorAll(`.${color}`);
    elements.forEach(element => {
        if (colorcode === '#FFFFFF') {
            element.style.backgroundColor = '#EEEEEE';
        } else {
            element.style.backgroundColor = colorcode;
        }
    });
}

// get clothes depends on the color

async function getVarient(pId, vId) {
    if (document.getElementById('varient_id').value !== vId) {
        try {
            window.location.href = `/product?pId=${pId}&vId=${vId}`

        } catch (err) {
            console.log(err);
            window.location.href = '/500-Server-Error'
        }
    }
}

// get clothes depends on color in the related products

async function getClothe(pId, cId) {
    try {
        const resp = await fetch(`/home/product/varient?pId=${pId}&cId=${cId}`)
        const data = await resp.json()
        document.getElementById("varient_image1" + pId).src = `/products/uploads/${data.varient.images[0]}`
        document.getElementById("varient_image2" + pId).src = `/products/uploads/${data.varient.images[1]}`
        document.getElementById("anchor_tag" + pId).href = `/product?pId=${pId}&vId=${data.varient._id}`
        document.getElementById("product_price" + pId).innerHTML = '₹ ' + data.varient.price[0]
        // document.getElementById(`${pId} + ${data.varient.color.color_name}`).classList.add('active')

        if (data.varient.stock[0] === 0) {
            document.getElementById('label_' + pId).style.display = 'block'
            document.getElementById('label_' + pId).innerHTML = 'Out of stock'
        } else {
            document.getElementById('label_' + pId).style.display = 'none'
        }

    } catch (err) {
        console.log(err);
        window.location.href = '/500-Server-Error'
    }
}


// add to cart

async function addToCart(vId) {
    try {
        const obj = {
            vId: vId,
            quantity: document.getElementById('quantity').value,
            sizeId: document.getElementById('select_size').value,
            price: document.getElementById('price').value
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
        } else if (data.type === 'failure') {
            document.getElementById('snackbar_icon').innerHTML = 'error'
            document.getElementById('snackbar_icon').style.color = 'red'
            showSnackBar(data.msg);
        } else {
            document.getElementById('cart_count').innerHTML = data.count
            showSnackBar(data.msg);
        }
    } catch (err) {
        console.log(err);
        // window.location.href = '/500-Server-Error'
    }
}

// add to wishlist

async function addToWishList(vId) {
    try {
        const obj = {
            vId: vId,
            quantity: document.getElementById('quantity').value,
            sizeId: document.getElementById('select_size').value,
            price: document.getElementById('price').value
        };

        console.log(obj);

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
            document.getElementById('wishlist_count').innerHTML = data.count
            showSnackBar(data.msg);
        }
    } catch (err) {
        console.log(err);
        window.location.href = '/500-Server-Error'
    }
}

// decremnet
async function decrement() {
    let num = Number(document.getElementById('quantity').value);
    num = num - 1;
    if (num > 0) {
        document.getElementById('quantity').value = num;
    }
}

// increment
async function increment() {

    const vId = document.getElementById('varient_id').value
    const sId = document.getElementById('select_size').value

    let num = Number(document.getElementById('quantity').value);
    num = num + 1
    if (num <= 5) {
        try {
            const resp = await fetch(`/check/stock?quantity=${num}&vId=${vId}&sId=${sId}`, { method: 'GET' })
            const data = await resp.json()

            if (data.type === 'error') {
                showSnackBar(data.msg)
            }
            else {
                document.getElementById('quantity').value = num;
            }
        } catch (err) {
            console.log(err);
            window.location.href = '/500-Server-Error'
        }
    }
}


// show snack bar
function showSnackBar(text) {
    document.getElementById('snackbar_msg').innerHTML = text
    const x = document.getElementById("snackbar");
    x.className = "show";
    setTimeout(function () {
        document.getElementById('snackbar_icon').innerHTML = 'task_alt'
        document.getElementById('snackbar_icon').style.color = 'rgb(37, 199, 37)'
        x.className = x.className.replace("show", "");
    }, 3000);
}

