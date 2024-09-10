function loadProducts() {

    const url = window.location.href
    localStorage.setItem('url', url);

    document.getElementById('product').style.display = 'block'

    // search products for each letter

    const checkboxes = document.querySelectorAll('input[name="sub_category"]');

    checkboxes.forEach((checkbox) => {
        checkbox.addEventListener('change', function () {
            if (this.checked) {
                checkboxes.forEach((cb) => {
                    if (cb !== this) {
                        cb.checked = false;
                    }
                });
            }
        });
    });

   

}


async function addToCart(vId) {
    try {
        const obj = {
            vId: vId,
            quantity: 1,
            sizeId: document.getElementById('select_size' + vId).value,
            price: document.getElementById('price' + vId).value
        }

        console.log(obj);

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
            document.getElementById('snackbar_icon').innerHTML = 'task_alt'
            document.getElementById('snackbar_icon').style.color = 'rgb(37, 199, 37)'
            showSnackBar(data.msg);
        }
    } catch (err) {
        console.log(err);
        window.location.href = '/500-Server-Error'
    }
}

async function addToWishList(vId) {
    try {
        const obj = {
            vId: vId,
            quantity: 1,
            sizeId: document.getElementById('select_size' + vId).value,
            price: document.getElementById('price' + vId).value
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
            document.getElementById('snackbar_icon').innerHTML = 'task_alt'
            document.getElementById('snackbar_icon').style.color = 'rgb(37, 199, 37)'
            showSnackBar(data.msg);
        }
    } catch (err) {
        console.log(err);
        window.location.href = '/500-Server-Error'
    }
}


// scroll to top

function scrollToTop() {
    document.documentElement.style.scrollBehavior = 'auto';
    document.body.style.scrollBehavior = 'auto';

    window.scrollTo({
        top: 0
    });

    setTimeout(() => {
        document.documentElement.style.scrollBehavior = 'smooth';
        document.body.style.scrollBehavior = 'smooth';
    }, 1000);
}



// get clothes depends on the color

async function getClothe(pId, cId) {
    try {
        const resp = await fetch(`/home/product/varient?pId=${pId}&cId=${cId}`)
        const data = await resp.json()
        document.getElementById("varient_image1" + pId).src = `/products/uploads/${data.varient.images[0]}`
        document.getElementById("varient_image2" + pId).src = `/products/uploads/${data.varient.images[1]}`
        document.getElementById("anchor_tag" + pId).href = `/product?pId=${pId}&vId=${data.varient._id}`
        document.getElementById("product_price" + pId).innerHTML = '₹ ' + data.varient.price[0]

        if (data.varient.stock[0] === 0) {
            document.getElementById('label_' + pId).style.display = 'block'
            document.getElementById('label_' + pId).innerHTML = 'Out of stock'
        } else {
            document.getElementById('label_' + pId).style.display = 'none'
        }

        // document.getElementById(`${pId} + ${data.varient.color.color_name}`).classList.add('active')

    } catch (err) {
        console.log(err);
        window.location.href = '/500-Server-Error'
    }
}

// get page

function changePage(pageNo) {

    let url = new URL(window.location.href);
    url.searchParams.set('page', pageNo);
    window.location.href = url.toString();

}

// GET category and sub category

function getFilterAndCategory() {
    const selectedCategory = document.querySelector('input[name="category"]:checked');
    const selectedFilter = document.querySelector('input[name="sub_category"]:checked');
    const selectedColor = document.querySelector('input[name="color"]:checked');

    if (!selectedCategory && !selectedFilter && !selectedColor) {

        showSnackBar('Select any one of the filters');
        return;
    }

    let url = new URL(window.location.href);

    if (selectedCategory) {
        url.searchParams.set('category', selectedCategory.value);
    } else {
        url.searchParams.set('category', 'all');
    }

    if (selectedFilter) {
        url.searchParams.set('subcategory', selectedFilter.value);
    } else {
        url.searchParams.set('subcategory', 'all');
    }

    if (selectedColor) {
        url.searchParams.set('color', selectedColor.value);
    } else {
        url.searchParams.set('color', 'all');
    }

    url.searchParams.set('page', '1');

    window.location.href = url.toString();
}

function pageDecrement() {
    let page = document.getElementById('page_number').value
    page--;
    if (page >= 1) {
        let url = new URL(window.location.href);
        url.searchParams.set('page', page);
        window.location.href = url.toString();
    }
}

function pageIncrement() {
    let page = document.getElementById('page_number').value
    page++;

    const totalPages = document.getElementById('total_pages').value

    if (page <= totalPages) {
        let url = new URL(window.location.href);
        url.searchParams.set('page', page);
        window.location.href = url.toString();
    }
}


// get sort by
async function getSotyBy() {

    const value = document.getElementById('sortby').value

    let filter
    const sub_category = document.getElementsByName('sub_category').value
    if (sub_category === undefined) {
        filter = 'all'
    } else {
        filter = sub_category
    }



    if (value === '1') {


        // Get the current URL
        let url = new URL(window.location.href);

        let category = url.searchParams.get('category');
        let subcategory = url.searchParams.get('subcategory');

        let newCategory = category && category !== 'all' ? category : 'all';
        let newSubcategory = subcategory && subcategory !== 'all' ? subcategory : 'all';

        url.searchParams.set('category', newCategory);
        url.searchParams.set('subcategory', newSubcategory);
        url.searchParams.set('sortby', 'name');
        url.searchParams.set('order', 'ascending');
        url.searchParams.set('page', '1');

        window.location.href = url.toString();

    } else if (value === '2') {



        let url = new URL(window.location.href);

        let category = url.searchParams.get('category');
        let subcategory = url.searchParams.get('subcategory');

        let newCategory = category && category !== 'all' ? category : 'all';
        let newSubcategory = subcategory && subcategory !== 'all' ? subcategory : 'all';

        url.searchParams.set('category', newCategory);
        url.searchParams.set('subcategory', newSubcategory);
        url.searchParams.set('sortby', 'name');
        url.searchParams.set('order', 'descending');
        url.searchParams.set('page', '1');

        window.location.href = url.toString();

    } else if (value === '3') {



        let url = new URL(window.location.href);

        let category = url.searchParams.get('category');
        let subcategory = url.searchParams.get('subcategory');

        let newCategory = category && category !== 'all' ? category : 'all';
        let newSubcategory = subcategory && subcategory !== 'all' ? subcategory : 'all';

        url.searchParams.set('category', newCategory);
        url.searchParams.set('subcategory', newSubcategory);
        url.searchParams.set('sortby', 'price');
        url.searchParams.set('order', 'ascending');
        url.searchParams.set('page', '1');

        window.location.href = url.toString();

    } else if (value === '4') {



        let url = new URL(window.location.href);

        let category = url.searchParams.get('category');
        let subcategory = url.searchParams.get('subcategory');

        let newCategory = category && category !== 'all' ? category : 'all';
        let newSubcategory = subcategory && subcategory !== 'all' ? subcategory : 'all';

        url.searchParams.set('category', newCategory);
        url.searchParams.set('subcategory', newSubcategory);
        url.searchParams.set('sortby', 'price');
        url.searchParams.set('order', 'descending');
        url.searchParams.set('page', '1');

        window.location.href = url.toString();

    } else {

        window.location.href = `/shop`

    }

}


// show snack bar
function showSnackBar(text) {
    document.getElementById('snackbar_msg').innerHTML = text
    const x = document.getElementById("snackbar");
    x.className = "show";
    setTimeout(function () {
        x.className = x.className.replace("show", "");
    }, 3000);
}


function createTemplate(varients, totalPages, currentPage) {

    const htmlTemplate = `
    <div class="tab-content">
        <div class="tab-pane p-0 fade show active" id="new-all-tab" role="tabpanel" aria-labelledby="new-all-link">
            <div class="products">
                <div id="product_loading" class="row">
                    <div class="product product-2 load-div">
                        <h2 style="text-align: center;" class="logo">StyleSavvy</h2>
                        <span class="loader"></span>
                    </div>
                </div>
                <div id="product_not_available" class="row">
                    <div class="product product-2 load-div">
                        <h2 class="title">No products found!</h2>
                    </div>
                </div>
                <div id="tab1_items" class="row justify-content-center">
                    ${varients.map(v => `
                        <div class="col-6 col-md-4 col-lg-3 varient_image">
                            <div class="product product-2">
                                <figure style="margin-top: 10px;" class="product-media">
                                    ${v.stock[0] === 0 ?
            `<span id="label_${v._id}" class="product-label label-out">Out of stock</span>` :
            `<span style="display: none;" id="label_${v._id}" class="product-label label-out"></span>`
        }
                                    <a id="anchor_tag${v._id}" href="/product?pId=${v.product._id}&vId=${v._id}">
                                        <img id="varient_image1${v._id}" src="/products/uploads/${v.images[0]}" alt="Product image" class="product-image">
                                        <img id="varient_image2${v._id}" src="/products/uploads/${v.images[1]}" alt="Product image" class="product-image-hover">
                                    </a>
                                    <div class="product-action-vertical">
                                        <a id="wishlist_btn" onclick="addToWishList('${v._id}')" class="btn-product-icon btn-wishlist" title="Add to wishlist"><span>add to wishlist</span></a>       
                                    </div>
                                    <div style="padding-bottom: 12px;" class="product-action action-icon-top">
                                        <a style="cursor: pointer; color: #c96;" onclick="addToCart('${v._id}')" class="btn-product btn-cart add_to_cart_" title="Add To Cart"><span>add to cart</span></a>
                                        <form action="">
                                            <input type="hidden" value="${v.size[0]._id}" id="select_size${v._id}">
                                            <input type="hidden" value="${v.actualPrice}" id="price${v._id}" >
                                        </form>
                                        <a style="cursor: pointer;" href="popup/quickView.html" class="btn-product btn-quickview add_to_cart_" title="Quick view"><span>quick view</span></a>
                                    </div>
                                </figure>
                                <div class="product-body">
                                    <p style="font-weight: 500;" class="product-title"><a href="/product?pId=${v.product._id}&vId=${v._id}">${v.product.product_name}</a></p>
                                    <p style="font-weight: 500; font-size: 13px; margin-top: 4px;" id="product_price${v._id}" class="product-price">Rs. ${v.actualPrice}.00</p>
                                    <div style="margin-left: 0px; margin-top: 8px;" class="product-nav product-nav-dots1">
                                        ${v.allColors.map(color => `
                                            <a style="border: none; background-color:${color.color_code}" class="${color.color_name}  color_btn"></a>
                                        `).join('')}
                                    </div>
                                </div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        </div>
    </div>
    <nav style="display: flex; justify-content: center; margin-top: 40px;" aria-label="Page navigation example">
        <ul class="pagination">
            <li class="page-item">
                <a class="page-link" onclick="pageDecrement()" style="cursor: pointer;" aria-label="Previous">
                    <span style="font-size: 20px;" aria-hidden="true">&laquo;</span>
                </a>
            </li>
            ${(() => {
            let pages = '';
            for (let i = 1; i <= totalPages; i++) {
                pages += `
                        <li style="cursor: pointer;" class="page-item ${i === currentPage ? 'active' : ''}">
                            <a class="page-link" style="font-weight: 500; font-size: 15px;" onclick="changePage('${i}')">${i}</a>
                        </li>
                    `;
            }
            return pages;
        })()}
            <form action="">
                <input type="hidden" id="total_pages" value="${totalPages}">
            </form>
            <li class="page-item">
                <a class="page-link" onclick="pageIncrement()" style="cursor: pointer;" aria-label="Next">
                    <span style="font-size: 20px;" aria-hidden="true">&raquo;</span>
                </a>
            </li>
        </ul>
    </nav>
    <form id="pagination-form" action="/your-pagination-endpoint" method="get" style="display:none;">
        <input type="hidden" id="page_number" name="page" value="${currentPage}">
    </form>
`;

    return htmlTemplate

}

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

// function getColor1(){
//     alert("oks")
// }
