async function loadCheckouPage() {
    // document.body.style.overflow = 'hidden';
    // setTimeout(() => {
    //     document.getElementById('checkout').style.display = 'block'
    //     document.getElementById('checkout').style.visibility = 'hidden'
    // }, 500);
    // setTimeout(() => {
    //     document.getElementById('loading').style.display = 'none'
    //     document.getElementById('checkout').style.visibility = 'visible'
    //     document.body.style.overflow = '';
    // }, 1000);
}

// update checkout

async function updateCart() {

    const inputs = document.querySelectorAll('input[name="varientsId"]');
    const varients = Array.from(inputs).map((input) => input.value);

    // console.log(varients);

    try {
        const resp = await fetch('/checkout/items', {
            method: 'POST',
            headers: {
                'Content-type': 'application/json'
            },
            body: JSON.stringify({
                varients: varients
            })
        })
        const data = await resp.json();

        if (data.type === "redirect") {
            window.location.href = "/signIn";
        }

        if (data.type === "error") {
            window.location.href = "/cart";
        }

        if (data.items.length > 0) {
            document.getElementById(
                "count"
            ).innerHTML = `Price(${data.count} Items):`;

            // total amout updated
            if (data.sts === true) {

                let subTotal = (Number(data.total) + Number(0.0)).toFixed(2);
                document.getElementById("sub_total").innerHTML = "₹ " + subTotal;

                let lastTotal = (Number(data.sub_total) + 0.0).toFixed(2);
                document.getElementById("last_total").innerHTML = "₹ " + lastTotal;

            } else {

                let subTotal = (Number(data.total) + Number(0.0)).toFixed(2);
                document.getElementById("sub_total").innerHTML = "₹ " + subTotal;

                let lastTotal = (Number(data.sub_total) + 0.0).toFixed(2);
                document.getElementById("last_total").innerHTML = "₹ " + lastTotal;

                document.getElementById('discount_amount').innerHTML = "₹ " + "0.00"

                const buttons = document.querySelectorAll('.coupon');
                buttons.forEach(button => {
                    button.innerHTML = 'Apply';
                });

            }

            const cartContainer = document.getElementById("cart_whole_items_div");

            cartContainer.style.visibility = "hidden";
            cartContainer.style.opacity = "0";
            cartContainer.innerHTML = renderCartItems(data.items);

            setTimeout(() => {
                cartContainer.style.visibility = "visible";
                cartContainer.style.opacity = "1";
            }, 50);
        }
        // else {
        //     setTimeout(() => {
        //         document.getElementById('nocart_div').style.display = 'flex'
        //         document.getElementById('checkout_div').style.display = 'none'
        //     }, 50)
        // }
    } catch (err) {
        console.log(err);
        window.location.href = '/500-Server-Error'
    }
}

// add address

async function addAddress(event) {
    event.preventDefault();

    const addForm = document.getElementById("add_address_form_checkout");

    document
        .getElementById("add_address_btn")
        .setAttribute("disabled", "disabled");

    const obj = {
        name: addForm[0].value,
        streetAddress: addForm[1].value,
        city: addForm[2].value,
        district: addForm[3].value,
        pincode: addForm[4].value,
        phone: addForm[5].value,
    };

    try {
        const resp = await fetch("/profile/address/add", {
            method: "POST",
            headers: {
                "Content-type": "application/json",
            },
            body: JSON.stringify(obj),
        });

        const data = await resp.json();

        const name = addForm[0];
        const city = addForm[2];
        const district = addForm[3];
        const phone = addForm[5];

        const name_error = document.getElementById("Name_error");
        const city_error = document.getElementById("city_error");
        const district_error = document.getElementById("district_error");
        const phone_error = document.getElementById("Phone_error");

        if (data.type === "name") {
            showError(name, name_error, data.msg);
            setTimeout(() => {
                removeError(name, name_error);
                document.getElementById("add_address_btn").removeAttribute("disabled");
            }, 2000);
        } else if (data.type === "city") {
            showError(city, city_error, data.msg);
            setTimeout(() => {
                removeError(city, city_error);
                document.getElementById("add_address_btn").removeAttribute("disabled");
            }, 2000);
        } else if (data.type === "district") {
            showError(district, district_error, data.msg);
            setTimeout(() => {
                removeError(district, district_error);
                document.getElementById("add_address_btn").removeAttribute("disabled");
            }, 2000);
        } else if (data.type === "phone") {
            showError(phone, phone_error, data.msg);
            setTimeout(() => {
                removeError(phone, phone_error);
                document.getElementById("add_address_btn").removeAttribute("disabled");
            }, 2000);
        } else if (data.type === "redirect") {
            window.location.href = "/signIn";
        } else {
            addForm.reset();

            document.getElementById("add_address_btn").removeAttribute("disabled");
            showSnackBar(data.msg);

            const response = await fetch("/checkout/addresses", { method: "GET" });
            const serverData = await response.json();

            const html = generateHTML(serverData);
            const div = document.getElementById("address_section");
            div.innerHTML = "";
            div.innerHTML = html;
            scrollToTop();
        }
    } catch (err) {
        console.log(err);
        window.location.href = '/500-Server-Error'
    }
}

// checkout from cart

async function checkOut(event) {
    event.preventDefault();
    // scrollToTop()
    const checkoutBtn = document.getElementById("checkout_btn");
    document.getElementById("checkout_btn").setAttribute("disabled", "disabled");
    checkoutBtn.style.opacity = "0.8";

    try {
        await Promise.all([fetchAndProcessCheckoutData(), updateCart()]);
    } catch (err) {
        console.log(err);
        window.location.href = '/500-Server-Error'
    }
}

async function fetchAndProcessCheckoutData() {
    const inputs = document.querySelectorAll('input[name="varientsId"]');

    // Extract the values and store them in an array
    const varients = Array.from(inputs).map((input) => input.value);

    try {
        const resp = await fetch("/checkout/isAvailable", {
            method: "POST",
            headers: {
                "Content-type": "application/json",
            },
            body: JSON.stringify({
                varients: varients,
            }),
        });
        const data = await resp.json();

        if (data.type === "redirect") {
            window.location.href = "/signIn";
        } else if (data.type === "error") {
            showSnackBar(data.msg);
        } else {
            const arrayForError = data.arrayForError.filter(
                (data) => data.type === "error"
            );
            if (arrayForError.length > 0) {
                document.getElementById("checkout_btn").removeAttribute("disabled");
                document.getElementById("checkout_btn").style.opacity = "1";
                displayErrorProducts(arrayForError);
            } else {
                // await orderItems()
                $("#add_money").modal("show");
            }
        }
    } catch (err) {
        console.log(err);
        window.location.href = '/500-Server-Error'
    }
}

function displayErrorProducts(array) {
    const html = array
        .map(
            (product) => `
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
    `
        )
        .join("");

    document.getElementById("show_unavailable_p").innerHTML = html;
    $("#outofstock").modal("show");
}

// function to continue checkout

async function continueCheckOut() {
    document
        .getElementById("understood_btn_unavailable")
        .setAttribute("disabled", "disabled");
    document.getElementById("understood_btn_unavailable").style.opacity = "0.8";

    try {
        const resp = await fetch("/checkout/check", { method: "GET" });
        const data = await resp.json();

        if (data.type === " redirect") {
            window.location.href = "/signIn";
        } else if (data.type === "reduce") {
            document.getElementById("checkout_btn").removeAttribute("disabled");
            document.getElementById("checkout_btn").style.opacity = "1";
            showSnackBar(data.msg);
            document.getElementById("snackbar_icon").innerHTML = "error";
            document.getElementById("snackbar_icon").style.color = "red";
            document
                .getElementById("understood_btn_unavailable")
                .removeAttribute("disabled");
            document.getElementById("understood_btn_unavailable").style.opacity = "1";
        } else if (data.type === "empty") {
            document.getElementById("checkout_btn").removeAttribute("disabled");
            document.getElementById("checkout_btn").style.opacity = "1";
            showSnackBar("No items are available to order");
            document.getElementById("snackbar_icon").innerHTML = "error";
            document.getElementById("snackbar_icon").style.color = "red";
            document
                .getElementById("close_btn_unavailable")
                .setAttribute(`onclick`, `closeCheckout()`);
            document
                .getElementById("close_btn_unavailable")
                .removeAttribute("data-bs-dismiss");
            document
                .getElementById("understood_btn_unavailable")
                .removeAttribute("disabled");
            document.getElementById("understood_btn_unavailable").style.opacity = "1";
        } else {
            $("#outofstock").modal("hide");
            $("#add_money").modal("show");
        }
    } catch (err) {
        console.log(err);
        window.location.href = '/500-Server-Error'
    }
}

// order function

async function orderNow() {
    document.getElementById('orderNow_btn').setAttribute('disabled', 'disabled')
    document.getElementById('orderNow_btn').style.opacity = '0.8'
    await orderItems();
    $("#add_money").modal("hide");
}

function dontOrder() {
    document.getElementById('orderNow_btn').removeAttribute('disabled')
    document.getElementById('orderNow_btn').style.opacity = '1'
    document.getElementById("checkout_btn").removeAttribute("disabled");
    document.getElementById("checkout_btn").style.opacity = "1";
    document.getElementById("understood_btn_unavailable").removeAttribute("disabled");
    document.getElementById("understood_btn_unavailable").style.opacity = "1";
}

// close checkout if no items are there

function closeCheckout() {
    window.location.href = "/cart";
}

// order items

async function orderItems() {
    if (document.getElementById("radioBtn_add") === null) {
        document.getElementById("snackbar_icon").innerHTML = "error";
        document.getElementById("snackbar_icon").style.color = "red";
        showSnackBar("No addresses are added");
        document.getElementById("checkout_btn").removeAttribute("disabled");
        document.getElementById("checkout_btn").style.opacity = "1";
        document.getElementById('orderNow_btn').removeAttribute('disabled')
        document.getElementById('orderNow_btn').style.opacity = '1'
    } else {
        const paymentForm = document.getElementById("payment_method_form");

        // Get the selected radio button value
        let paymentMethod = paymentForm.querySelector(
            'input[name="payment_method"]:checked'
        ).value;

        let payMethod;
        if (paymentMethod === "cod") {
            payMethod = "COD";
        } else if (paymentMethod === "online") {
            payMethod = "Online";
        } else {
            payMethod = "Wallet";
        }

        // address selected
        const addressIndex = document.getElementById("radioBtn_add").value;

        const obj = {
            addressIndex: addressIndex,
            paymentMethod: payMethod,
        };

        try {
            if (paymentMethod === "cod") {
                const resp = await fetch("/order", {
                    method: "POST",
                    headers: {
                        "Content-type": "application/json",
                    },
                    body: JSON.stringify(obj),
                });

                const data = await resp.json();

                if (data.type === "redirect") {
                    window.location.href = "/signIn";
                } else if (data.type === "error") {
                    showSnackBar(data.msg);

                    setTimeout(() => {
                        document.getElementById("checkout_btn").removeAttribute("disabled");
                        document.getElementById("checkout_btn").style.opacity = "1";
                        document.getElementById('orderNow_btn').removeAttribute('disabled')
                        document.getElementById('orderNow_btn').style.opacity = '1'
                        window.location.href = "/cart";
                    }, 500);
                } else if (data.type === "cod") {
                    document.getElementById("checkout_btn").removeAttribute("disabled");
                    document.getElementById("checkout_btn").style.opacity = "1";
                    document.getElementById('orderNow_btn').removeAttribute('disabled')
                    document.getElementById('orderNow_btn').style.opacity = '1'
                    document.getElementById("snackbar_icon").innerHTML = "error";
                    document.getElementById("snackbar_icon").style.color = "red";
                    showSnackBar(data.msg);
                } else {
                    showSnackBar(data.msg);
                    setTimeout(() => {
                        window.location.href = `/orderDetails?orderId=${data.placedOrderId}`;
                    }, 1000);
                }
            } else if (paymentMethod === "online") {
                await onlinePayment(addressIndex, payMethod);
            } else {
                const resp = await fetch("/order", {
                    method: "POST",
                    headers: {
                        "Content-type": "application/json",
                    },
                    body: JSON.stringify(obj),
                });

                const data = await resp.json();

                if (data.type === "redirect") {
                    window.location.href = "/signIn";
                } else if (data.type === "error") {
                    showSnackBar(data.msg);
                    setTimeout(() => {
                        document.getElementById("checkout_btn").removeAttribute("disabled");
                        document.getElementById("checkout_btn").style.opacity = "1";
                        document.getElementById('orderNow_btn').removeAttribute('disabled')
                        document.getElementById('orderNow_btn').style.opacity = '1'
                        window.location.href = "/cart";
                    }, 500);
                } else if (data.type === "wallet") {
                    document.getElementById("checkout_btn").removeAttribute("disabled");
                    document.getElementById("checkout_btn").style.opacity = "1";
                    document.getElementById('orderNow_btn').removeAttribute('disabled')
                    document.getElementById('orderNow_btn').style.opacity = '1'
                    document.getElementById("snackbar_icon").innerHTML = "error";
                    document.getElementById("snackbar_icon").style.color = "red";
                    showSnackBar(data.msg);
                } else {
                    showSnackBar(data.msg);
                    setTimeout(() => {
                        window.location.href = `/orderDetails?orderId=${data.placedOrderId}`;
                    }, 1000);
                }
            }
        } catch (err) {
            console.log(err);
            window.location.href = '/500-Server-Error'
        }
    }
}

// order with razor pay

async function onlinePayment(addressIndex, paymentMethod) {
    const obj = {
        addressIndex: addressIndex,
        paymentMethod: paymentMethod,
    };

    try {

        const resp = await fetch("/createOrderId", { method: "GET" });

        const data = await resp.json();

        if (data.type === "redirect") {
            window.location.href = "/signIn";
        } else if (data.type === "network") {
            document.getElementById("checkout_btn").removeAttribute("disabled");
            document.getElementById("checkout_btn").style.opacity = "1";
            document.getElementById('orderNow_btn').removeAttribute('disabled')
            document.getElementById('orderNow_btn').style.opacity = '1'
            document.getElementById("snackbar_icon").innerHTML = "error";
            document.getElementById("snackbar_icon").style.color = "red";
            showSnackBar(data.msg);
        } else {
            const response = await fetch("/order", {
                method: "POST",
                headers: {
                    "Content-type": "application/json",
                },
                body: JSON.stringify(obj),
            });

            const responseData = await response.json();

            if (responseData.type === "redirect") {
                window.location.href = "/signIn";
            } else {
                const placedOrderId = responseData.placedOrderId;
                localStorage.setItem("placedOrderId", placedOrderId);

                const orderId = data.orderId;
                const totalPrice = data.totalPrice;
                const razorPayKey = data.razorPayKey;

                var options = {
                    key: `${razorPayKey}`,
                    amount: totalPrice * 100,
                    currency: "INR",
                    name: "StyleSavvy",
                    // image: "/assets/images/demos/demo-5/logo11.png",
                    order_id: orderId,
                    handler: async function (response) {
                        const object = {
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature,
                            placedOrderId: placedOrderId,
                        };

                        const verificationResponse = await fetch("/verifyPayment", {
                            method: "POST",
                            headers: {
                                "Content-type": "application/json",
                            },
                            body: JSON.stringify(object),
                        });

                        const verificationResponseData = await verificationResponse.json();
                        if (verificationResponseData.type === 'redirect') {
                            window.location.href = "/signIn";
                        }
                        else if (verificationResponseData.paymentStatus === "Failure") {
                            document.getElementById("snackbar_icon").innerHTML = "error";
                            document.getElementById("snackbar_icon").style.color = "red";
                            showSnackBar(verificationResponseData.msg);
                            setTimeout(() => {
                                localStorage.clear()
                                window.location.href = `/orderDetails?orderId=${placedOrderId}`;
                            }, 1000);
                        } else {
                            showSnackBar(verificationResponseData.msg);
                            setTimeout(() => {
                                localStorage.clear()
                                window.location.href = `/orderDetails?orderId=${placedOrderId}`;
                            }, 1000);
                        }
                    },
                    // "prefill": {
                    //     "name": "Gaurav Kumar",
                    //     "email": "gaurav.kumar@example.com",
                    //     "contact": "9000090000"
                    // },
                    notes: {
                        address: "Razorpay Corporate Office",
                    },
                    theme: {
                        color: "#bf8040",
                    },
                    modal: {
                        ondismiss: async function () {
                            document.getElementById("snackbar_icon").innerHTML = "error";
                            document.getElementById("snackbar_icon").style.color = "red";
                            showSnackBar("Payment failed or dismised");
                            await fetch("/increaseQuantity", {
                                method: "POST",
                                headers: {
                                    "Content-type": "application/json",
                                },
                                body: JSON.stringify({
                                    placedOrderId: placedOrderId,
                                }),
                            });
                            setTimeout(() => {
                                localStorage.clear();
                                window.location.href = `/orderDetails?orderId=${placedOrderId}`;
                            }, 1000);
                        },
                    },
                };

                var rzp1 = new Razorpay(options);
                rzp1.open();
            }
        }

    } catch (err) {
        console.log(err);
        window.location.href = '/500-Server-Error'
    }
}

// cancel order

function cancelCheckOut() {
    document
        .getElementById("understood_btn_unavailable")
        .removeAttribute("disabled");
    document.getElementById("understood_btn_unavailable").style.opacity = "1";
}

// decremnet the quantity
async function decrement(vId, sId, id) {
    let num = Number(document.getElementById("quantity" + id).value);
    num = num - 1;
    if (num > 5) {
        document.getElementById("quantity" + id).value = 5;
        num = 5;
    }
    if (num > 0) {
        try {
            const obj = {
                itemId: document.getElementById("itemId" + id).value,
                vId: vId,
                sId: sId,
                quantity: num,
                indx: document.getElementById("itemIndex" + id).value,
            };

            const resp = await fetch("/cart/update", {
                method: "PATCH",
                headers: {
                    "Content-type": "application/json",
                },
                body: JSON.stringify(obj),
            });
            const data = await resp.json();

            if (data.type === "unavailable") {
                await updateCart();
                showSnackBar(data.msg);
            } else if (data.type === "error") {
                document.getElementById(
                    "count"
                ).innerHTML = `Price(${data.count} Items):`;
                // total amout updated
                let subTotal = (Number(data.total) + Number(0.0)).toFixed(2);
                document.getElementById("sub_total").innerHTML = "₹ " + subTotal;
                let lastTotal = (Number(data.total) + 0.0).toFixed(2);
                document.getElementById("last_total").innerHTML = "₹ " + lastTotal;

                document.getElementById("total_price").value = Number(data.total);

                document.getElementById('discount_amount').innerHTML = "₹ " + "0.00"

                const buttons = document.querySelectorAll('.coupon');

                buttons.forEach(button => {
                    button.innerHTML = 'Apply';
                });

                if (data.stock === 0) {
                    document.getElementById("stock_lable" + id).style.color = "red";
                    document.getElementById(
                        "stock_lable" + id
                    ).innerHTML = `Out of stock`;
                    document.getElementById("totalPrice" + id).style.display = "none";
                    document.getElementById("quantity_btn_" + id).style.display = "none";
                    showSnackBar("We are sorry! No stocks are available");
                } else if (data.stock < num || data.stock >= num) {
                    document.getElementById("quantity" + id).value = data.stock;
                    document.getElementById("stock_lable" + id).style.color = "red";
                    document.getElementById(
                        "stock_lable" + id
                    ).innerHTML = `Only ${data.stock} stock(s) left`;
                    showSnackBar(data.msg);
                }
            } else if (data.type === "redirect") {
                window.location.href = "/signIn";
            } else if (data.type === "network") {
                showSnackBar(data.msg);
            } else {
                document.getElementById(
                    "count"
                ).innerHTML = `Price(${data.count} Items):`;
                // total amout updated
                let subTotal = (Number(data.total) + Number(0.0)).toFixed(2);
                document.getElementById("sub_total").innerHTML = "₹ " + subTotal;

                let lastTotal = (Number(data.total) + 0.0).toFixed(2);
                document.getElementById("last_total").innerHTML = "₹ " + lastTotal;

                document.getElementById("total_price").value = Number(data.total);

                document.getElementById('discount_amount').innerHTML = "₹ " + "0.00"

                const buttons = document.querySelectorAll('.coupon');

                buttons.forEach(button => {
                    button.innerHTML = 'Apply';
                });

                // update price and quantity of item
                document.getElementById("quantity" + id).value = num;
                document.getElementById("totalPrice" + id).innerHTML =
                    "₹ " + data.price;
                if (data.stock > num && data.stock > 5) {
                    document.getElementById("stock_lable" + id).style.color = "green";
                    document.getElementById("stock_lable" + id).innerHTML = `In stock`;
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
    let num = Number(document.getElementById("quantity" + id).value);
    num = num + 1;
    if (num > 6) {
        document.getElementById("quantity" + id).value = 5;
        num = 5;
    } else if (num === 6) {
        num = 6;
    }
    try {
        const obj = {
            itemId: document.getElementById("itemId" + id).value,
            vId: vId,
            sId: sId,
            quantity: num,
            indx: document.getElementById("itemIndex" + id).value,
        };

        const resp = await fetch("/cart/update", {
            method: "PATCH",
            headers: {
                "Content-type": "application/json",
            },
            body: JSON.stringify(obj),
        });
        const data = await resp.json();

        if (data.type === "unavailable") {
            await updateCart();
            showSnackBar(data.msg);
        } else if (data.type === "error") {
            document.getElementById(
                "count"
            ).innerHTML = `Price(${data.count} Items):`;
            // total amount update
            let subTotal = (Number(data.total) + Number(0.0)).toFixed(2);
            document.getElementById("sub_total").innerHTML = "₹ " + subTotal;
            let lastTotal = (Number(data.total) + 0.0).toFixed(2);
            document.getElementById("last_total").innerHTML = "₹ " + lastTotal;


            document.getElementById("total_price").value = Number(data.total);

            document.getElementById('discount_amount').innerHTML = "₹ " + "0.00"

            const buttons = document.querySelectorAll('.coupon');

            buttons.forEach(button => {
                button.innerHTML = 'Apply';
            });

            if (data.stock === 0) {
                document.getElementById("stock_lable" + id).style.color = "red";
                document.getElementById("stock_lable" + id).innerHTML = `Out of stock`;
                document.getElementById("totalPrice" + id).style.display = "none";
                document.getElementById("quantity_btn_" + id).style.display = "none";

                showSnackBar("We are sorry! No stocks are available");
            } else if (data.stock <= 5) {
                document.getElementById("quantity" + id).value = data.stock;
                document.getElementById("stock_lable" + id).style.color = "red";
                document.getElementById(
                    "stock_lable" + id
                ).innerHTML = `Only ${data.stock} stock(s) left`;
                showSnackBar(data.msg);
            } else {
                showSnackBar(data.msg);
            }
        } else if (data.type === "redirect") {
            window.location.href = "/signIn";
        } else if (data.type === "network") {
            showSnackBar(data.msg);
        } else {
            document.getElementById(
                "count"
            ).innerHTML = `Price(${data.count} Items):`;
            // total amount update
            let subTotal = (Number(data.total) + Number(0.0)).toFixed(2);
            document.getElementById("sub_total").innerHTML = "₹ " + subTotal;

            let lastTotal = (Number(data.total) + 0.0).toFixed(2);
            document.getElementById("last_total").innerHTML = "₹ " + lastTotal;

            document.getElementById("total_price").value = Number(data.total);

            document.getElementById('discount_amount').innerHTML = "₹ " + "0.00"

            const buttons = document.querySelectorAll('.coupon');

            buttons.forEach(button => {
                button.innerHTML = 'Apply';
            });

            // update price and quantity of item
            document.getElementById("quantity" + id).value = num;
            document.getElementById("totalPrice" + id).innerHTML = "₹ " + data.price;
            if (data.stock > num && data.stock > 5) {
                document.getElementById("stock_lable" + id).style.color = "green";
                document.getElementById("stock_lable" + id).innerHTML = `In stock`;
            }
        }
    } catch (err) {
        console.log(err);
        window.location.href = '/500-Server-Error'
    }
}

// get modal to remove item
function getRemoveModal(id) {
    document
        .getElementById("confirm_btn")
        .setAttribute("onclick", `removeItem('${id}')`);
}

// function to remove item

async function removeItem(id) {
    try {
        document.getElementById("confirm_btn").setAttribute("disabled", "disabled");
        document.getElementById("confirm_btn").style.opacity = "0.8";

        const resp = await fetch(`/cart/remove?itemId=${id}`, { method: "DELETE" });
        const data = await resp.json();

        if (data.type === "redirect") {
            window.location.href = "/signIn";
        } else if (data.type === "error") {
            document.getElementById("confirm_btn").removeAttribute("disabled");
            document.getElementById("confirm_btn").style.opacity = "1";
            document.getElementById("snackbar_icon").innerHTML = "error";
            document.getElementById("snackbar_icon").style.color = "red";
            showSnackBar(data.msg);
            $("#remove").modal("hide");
        } else {
            document.getElementById("confirm_btn").removeAttribute("disabled");
            document.getElementById("confirm_btn").style.opacity = "1";

            document.getElementById("row" + id).style.display = "none";
            $("#remove").modal("hide");

            // show msg
            showSnackBar(data.msg);

            // text (price -- items)
            document.getElementById(
                "count"
            ).innerHTML = `Price(${data.count} Items):`;

            // total amount update
            let subTotal = (Number(data.total) + Number(0.0)).toFixed(2);
            document.getElementById("sub_total").innerHTML = "₹ " + subTotal;

            let lastTotal = (Number(data.total) + 0.0).toFixed(2);
            document.getElementById("last_total").innerHTML = "₹ " + lastTotal;

            document.getElementById("total_price").value = Number(data.total);

            document.getElementById('discount_amount').innerHTML = "₹ " + "0.00"

            const buttons = document.querySelectorAll('.coupon');

            buttons.forEach(button => {
                button.innerHTML = 'Apply';
            });

            // }, 1000)

            if (data.items.length === 0) {
                document
                    .getElementById("checkout_btn")
                    .setAttribute("disabled", "disabled");
                setTimeout(() => {
                    window.location.href = "/cart";
                }, 500);
            }
        }
    } catch (err) {
        console.log(err);
        window.location.href = '/500-Server-Error'
    }
}

// change delivery address

function changeAddress(id) {
    // hide change btn again
    document.getElementById("change_address_btn").style.display = "none";

    // Get all buttons and hide them initially
    const buttons = document.querySelectorAll('button[class^="deliver_here"]');
    buttons.forEach((button) => {
        button.style.visibility = "hidden";
    });

    // Get the specific radio button and its corresponding button
    const radioButton = document.getElementById("address" + id);
    const changebtn = document.getElementById("deliver_here" + id);

    // Function to show the button
    function showButton() {
        changebtn.style.visibility = "visible";
    }

    // Add event listener to the radio button
    radioButton.addEventListener("change", function () {
        if (radioButton.checked) {
            // Hide all buttons first
            buttons.forEach((button) => {
                button.style.visibility = "hidden";
            });
            // Then show the selected button
            showButton();
        }
    });

    // Initially show the button if the radio button is already checked (for cases like page reload)
    if (radioButton.checked) {
        showButton();
    }
}

// select address for changing

function selectThisAddress(
    index,
    addressId,
    name,
    phoneNo,
    address,
    city,
    district,
    pincode
) {
    // show change btn again
    document.getElementById("change_address_btn").style.display = "block";

    document.getElementById("name_add").innerHTML =
        name + `&nbsp;&nbsp;&nbsp;` + phoneNo;
    document.getElementById("address_add").innerHTML = address + ",";
    document.getElementById("place_add").innerHTML =
        city + " " + district + " " + pincode;

    document.getElementById("radioBtn_add").value = `${index}`;

    scrollToTop();

    clearAll();
}

// clear form

function clearAll() {
    let val = document.getElementById("change_address_btn").getAttribute("value");
    if (val === "0") {
        document.getElementById("change_address_btn").innerHTML = "Close";
        document.getElementById("change_address_btn").setAttribute("value", "1");
    } else {
        val = "0";
        document.getElementById("change_address_btn").innerHTML = "Change";
        document.getElementById("change_address_btn").setAttribute("value", "0");
    }

    document.getElementById("address_form_select").reset();

    const buttons = document.querySelectorAll('button[class^="deliver_here"]');
    buttons.forEach((button) => {
        button.style.visibility = "hidden";
    });
}

// close add address form (No address at start)
function closeAddForm2() {
    const addForm = document.getElementById("add_address_form_checkout");
    addForm.reset();
    scrollToTop();
}

// close add address form

function closeAddForm() {
    scrollToTop();
}

// scroll to top
function scrollToTop() {
    document.documentElement.style.scrollBehavior = "auto";
    document.body.style.scrollBehavior = "auto";

    window.scrollTo({
        top: 0,
    });

    setTimeout(() => {
        document.documentElement.style.scrollBehavior = "smooth";
        document.body.style.scrollBehavior = "smooth";
    }, 1000);
}

// show and remove Errors

function showError(input, err, msg, visibility) {
    input.style.color = "red";
    input.value = msg;
    input.type = "text";
    input.removeAttribute("required");
    input.setAttribute("readOnly", "readOnly");
    err.innerHTML = "error";
    if (visibility) {
        visibility.style.display = "none";
    }
}

function removeError(input, err, visibility) {
    input.value = "";
    input.style.color = "black";
    input.removeAttribute("readOnly");
    input.setAttribute("required", "required");
    err.innerHTML = "";
    if (visibility) {
        visibility.style.display = "block";
        input.type = "password";
    }
}

// apply coupon

async function applycoupon(id) {
    try {


        let sts = document.getElementById('btn' + id).innerHTML
        document.getElementById('btn' + id).setAttribute('disabled', 'disaled')
        const [resp, update] = await Promise.all([fetch(`/applyCoupon?coupon_id=${id}&sts=${sts}`, { method: 'GET' }), updateCart()])
        const data = await resp.json()

        if (data.type === "redirect") {
            window.location.href = "/signIn";
        } else if (data.type === "error") {
            window.location.href = "/cart";
        } else if (data.type === "not") {
            document.getElementById('btn' + id).removeAttribute('disabled')
            document.getElementById("snackbar_icon").innerHTML = "error";
            document.getElementById("snackbar_icon").style.color = "red";
            showSnackBar(data.msg)
        } else {

            if (sts === 'Remove') {
                document.getElementById('btn' + id).innerHTML = 'Apply'

                let subTotal = (Number(data.totalAmount) + Number(0.0)).toFixed(2);
                document.getElementById('discount_amount').innerHTML = "₹ " + "0.00"
                document.getElementById('last_total').innerHTML = "₹ " + subTotal
            } else {

                let discount = (Number(data.discountAmount) + Number(0.0)).toFixed(2);
                let subTotal = (Number(data.totalAmount) + Number(0.0)).toFixed(2);
                document.getElementById('discount_amount').innerHTML = "₹ " + discount
                document.getElementById('last_total').innerHTML = "₹ " + subTotal
                document.getElementById('btn' + id).innerHTML = 'Remove'
            }

            document.getElementById('btn' + id).removeAttribute('disabled')
            showSnackBar(data.msg)

        }

    } catch (err) {
        console.log(err);
        window.location.href = '/500-Server-Error'
    }
}


// clear coupon

function clearCoupon() {

}

// show snack bar
function showSnackBar(text) {
    document.getElementById("snackbar_msg").innerHTML = text;
    const x = document.getElementById("snackbar");
    x.className = "show";
    setTimeout(function () {
        x.className = x.className.replace("show", "");
        document.getElementById("snackbar_icon").innerHTML = "task_alt";
        document.getElementById("snackbar_icon").style.color = "rgb(37, 199, 37)";
    }, 3000);
}

// template string for all the addresses and add address

function generateHTML(data) {
    return `
        <p class="d-inline-flex gap-1">
            <div onclick="clearAll()" data-bs-toggle="collapse" data-bs-target=".mm" aria-expanded="false" aria-controls="addresses" style="height: 50px; background-color: #c96; display: flex; justify-content: space-between; align-items: center; cursor: pointer;">
                <h2 style="color: white; margin-left: 12px;" class="checkout-title">Delivery Address</h2>
                <p style="font-weight: 500; font-size: 16px; color: white; margin-right: 10px;" id="change_address_btn" value="1">Close</p>
            </div>
        </p>
        <div style="padding: 15px; padding-top: 20px; border-color: #ebebeb; border-style: solid; border-width: 1px;">
            <form id="address_form_selected" action="">
                <div style="position: relative;">
                    <div style="display: flex; align-items: center;">
                        <label>
                            <h5 id="name_add" style="font-size: 16px; margin-bottom: 0px;">${data.address[0].name
        }&nbsp;&nbsp;&nbsp;${data.address[0].phoneNo}</h5>
                        </label>
                        <input id="radioBtn_add" style="position: absolute; left: 0px; top: 1px; visibility: hidden;" type="radio" checked name="address" value="0">
                    </div>
                    <div>
                        <p id="address_add" style="font-size: 15px; color: black;">
                            ${data.address[0].streetAddress},
                        </p>
                        <p id="place_add" style="font-size: 15px; line-height: 2em; color: black;">
                            ${data.address[0].city} ${data.address[0].district
        } ${data.address[0].pincode}
                        </p>
                    </div>
                </div>
            </form>
        </div>
        <div class="collapse mm show" id="addresses">
            <form id="address_form_select" action="">
                ${data.address
            .map(
                (add, index) => `
                    <div style="padding: 15px; padding-top: 18px; border-color: #ebebeb; border-style: solid; border-width: 0px 1px 1px 1px;">
                        <div style="position: relative;">
                            <div style="display: flex; justify-content: space-between;">
                                <div style="display: flex; align-items: center;">
                                    <input onchange="changeAddress('${add._id}')" style="position: absolute; left: 0px; top: 1px; height: 15px; width: 15px;" type="radio" id="address${add._id}" name="add" value="${index}">
                                    <label for="address${add._id}" style="margin-left: 25px;">
                                        <h5 style="font-size: 16px; margin-bottom: 3px;">${add.name}&nbsp;&nbsp;&nbsp;${add.phoneNo}</h5>
                                    </label>
                                </div>
                                <button data-bs-toggle="collapse" data-bs-target=".mm" aria-expanded="false" style="visibility: hidden;" type="button" class="deliver_here" onclick="selectThisAddress('${index}', '${add._id}', '${add.name}', '${add.phoneNo}', '${add.streetAddress}', '${add.city}', '${add.district}', '${add.pincode}')" id="deliver_here${add._id}">Deliver Here</button>
                            </div>
                            <div style="margin-left: 25px;">
                                <p style="font-size: 15px; color: black;">
                                    ${add.streetAddress},
                                </p>
                                <p style="font-size: 15px; line-height: 2em; color: black;">
                                    ${add.city} ${add.district} ${add.pincode}
                                </p>
                            </div>
                        </div>
                    </div>
                `
            )
            .join("")}
            </form>
            <p class="d-inline-flex gap-1">
                <div data-bs-toggle="collapse" data-bs-target=".multi-collapse" aria-expanded="false" aria-controls="collapseExample" style="height: 50px; cursor: pointer; background-color: #c96; display: flex; align-items: center;">
                    <h2 style="color: white;; margin-left: 12px;" class="checkout-title">Add Address +</h2>
                </div>
            </p>
            <div style="border-color: #ebebeb; border-style: solid; border-width: 1px;" class="collapse multi-collapse hh" id="collapseExample">
                <div>
                    <div style="padding: 15px; padding-top: 0px;">
                    <form id="add_address_form_checkout" onsubmit="addAddress(event)">
                                                    
                    <h2 class="checkout-title">Add Address</h2><!-- End .checkout-title -->

                    <label>Name *</label>
                    <div style="position: relative;">
                        <input type="text" value="${data.user.name
        }" class="form-control" required autocomplete="off">
                    <span id="Name_error" class="material-symbols-outlined pass_icon">
                     
                    </span>
                    </div>
                   

                    <label>Street Address *</label>
                    <textarea class="form-control" required autocomplete="off" ></textarea>
                    

                    <div class="row">

                       <div class="col-sm-6">
                        <label>Town / City *</label>
                        <div style="position: relative;">
                            <input type="text" class="form-control" required autocomplete="off">
                        <span id="city_error" class="material-symbols-outlined pass_icon">
                            
                           </span>
                        </div>
                       </div>

                      <div class="col-sm-6">
                        <label>District / State *</label>
                        <div style="position: relative;">
                       <input type="text" class="form-control" required autocomplete="off">
                        <span id="district_error" class="material-symbols-outlined pass_icon">
                       </span>
                        </div>
                      </div>

                    </div>
                    

                   <div class="row">

                    <div class="col-sm-6">
                        <label>Pin Code *</label>
                        <input type="text" maxlength="6" minlength="6" pattern="[1-9][0-9]*" class="form-control" required autocomplete="off">
                    </div>

                    <div class="col-sm-6">
                        <label>Phone Number *</label>
                        <div style="position: relative;">
                         <input type="text" value="${data.user.phoneNo
        }" class="form-control" required autocomplete="off">
                         <span id="Phone_error" class="material-symbols-outlined pass_icon">
                             
                            </span>
                        </div>
                    </div>

                   </div>

                        <div style="display: flex;">
                            <button style="margin-right: 5px;" id="add_address_btn"  type="submit" class="btn btn-outline-primary-2">
                                <span>Add Address</span>
                                <i class="icon-long-arrow-right"></i>
                            </button>
                            <button id="close_address_btn" onclick="closeAddForm2()" type="button" data-bs-toggle="collapse" data-bs-target=".hh" aria-expanded="false" aria-controls="collapseExample"  class="btn btn-outline-primary-2" type="reset" >Close</button>
                        </div>
         
        </form>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// update template html

// template for cart items

function renderCartItems(cart) {
    let cartHtml = "";

    cart.reverse().forEach((item) => {
        cartHtml += `
            <div id="row${item._id
            }" class="row lap_size" style="margin-right: 0px; margin-left: 0px; margin-bottom: 0px; box-shadow: none; border-color: rgb(241, 241, 241); border-style: solid; border-width: 1px 0px 0px 0px;">
                <div class="col-3 col-sm-3 col-md-2 img-div">
                    <img src="/products/uploads/${item.image}" alt="">
                    <input type="hidden" name="varientId" value="${item.vId}">
                    ${item.stock !== 0
                ? `
                         
                                <div class="quantity${item._id}" id="btn_quantity_cart">
                                    <div class="product-details-quantity">
                                        <button onclick="decrement('${item.vId}', '${item.sId}','${item._id}')" id="btn_decrement">
                                            <span class="material-symbols-outlined">remove</span>
                                        </button>
                                        <input disabled type="text" id="quantity${item._id}" value="${item.quantity}"  name="quantity" readonly required>
                                        <button onclick="increment('${item.vId}', '${item.sId}','${item._id}')" id="btn_increment">
                                            <span class="material-symbols-outlined">add</span>
                                        </button>
                                    </div>
                                </div>
                          
                        `
                : `
                           
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
                        
                        `
            }
                </div>
                <div class="col-8 col-sm-8 col-md-9 name-div">
                    <p class="name-p">
                        <h6>${item.product_name}</h6>
                        <p class="category">
                            ${item.type} > ${item.category} > ${item.color
            } > <span style="color: #bf8040;">${item.size}</span>
                        </p>
                        
                        <input type="hidden" name="sizeId" value="${item.sId}">

                        ${item.stock !== 0
                ? `<h5 id="totalPrice${item._id}">₹ ${item.totalPrice}</h5>`
                : ""
            }
                        ${item.stock <= 5 && item.stock > 0
                ? `
                                ${item.stock < item.quantity ||
                    item.stock === item.quantity
                    ? `
                                        <p id="stock_lable${item._id}" class="p" style="color: red;">Only ${item.stock} stock(s) left</p>
                                    `
                    : `
                                        <p id="stock_lable${item._id}" class="p" style="color: red;">Only few stocks</p>
                                    `
                }
                            `
                : item.stock > 5
                    ? `
                                <p class="p" id="stock_lable${item._id}" style="color: green;">In stock</p>
                            `
                    : `
                                <p class="p" id="stock_lable${item._id}" style="color: red;">Out of stock</p>
                            `
            }
                    </p>
                    <form action="">
                        <input type="hidden" id="itemId${item._id}" value="${item._id
            }">
                        <input type="hidden" id="itemIndex${item._id}" value="${item.index
            }">
                        <input type="hidden" name="varientsId" id="varientId${item._id
            }" value = "${item.vId}" >
                       
                    </form>
                </div>
                <div class="col-1 col-sm-1 col-md-1 remove">
                    <span onclick="getRemoveModal('${item._id
            }')" data-bs-toggle="modal" data-bs-target="#remove" class="material-symbols-outlined">
                        close
                    </span>
                </div>
            </div>
        `;
    });

    return cartHtml;
}
