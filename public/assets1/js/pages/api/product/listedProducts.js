// loading products page 

function loadProducts() {
    setTimeout(() => {
        document.getElementById('loading').style.display = 'none'
        document.getElementById('products').style.display = 'block'
    }, 400);


    // get categories depedns on the types

    const selectCategory = document.getElementById('select_category');
    const selectType = document.getElementById('select_type');


    selectType.addEventListener('change', async () => {
        const typeId = selectType.value;
        try {
            const response = await fetch(`/admin/categories?id=${typeId}`);
            const data = await response.json()

            if (data.type === 'redirect') {
                window.location.href = '/admin/signIn'
            }
            else {

                // Clear existing options
                selectCategory.innerHTML = ''

                data.cats.forEach(category => {
                    const option = document.createElement('option');
                    option.value = category._id
                    option.textContent = category.category_name
                    selectCategory.appendChild(option)
                });
            }
        } catch (error) {
            console.log(err);
            window.location.href = '/admin/500-Server-Error'
        }
    });


}

// get product detials

function getProductDetails(id) {
    window.location.href = `/admin/products?id=${id}&isListed=${true}`
}


// get edit product modal

async function getDataForEdit(pid) {

    try {
        const response = await fetch(`/admin/product/${pid}`);
        const data = await response.json()

        if (data.type === 'redirect') {
            window.location.href = '/admin/signIn'
        }
        else {

            document.getElementById('product_id').value = data.product._id
            document.getElementById('product_name_edit').value = data.product.product_name
            document.getElementById('product_title_edit').value = data.product.title
            document.getElementById('pdescription').value = data.product.discription
            if (data.product.tags !== undefined) {
                document.getElementById('ptag').value = data.product.tags
            }

            const select = document.getElementById('select_type');
            for (let i = 0; i < select.options.length; i++) {
                if (select.options[i].text === data.product.type.type_name) {
                    select.selectedIndex = i;
                    break;
                }
            }

            const resp = await fetch(`/admin/categories?id=${data.product.type._id}`);
            const data2 = await resp.json()


            const selectCategory = document.getElementById('select_category')
            // Clear existing options
            selectCategory.innerHTML = ''

            data2.cats.forEach(category => {
                const option = document.createElement('option');
                option.value = category._id
                option.textContent = category.category_name
                selectCategory.appendChild(option)
            });


            const select2 = document.getElementById('select_category');
            for (let i = 0; i < select2.options.length; i++) {
                if (select2.options[i].text === data.product.category.category_name) {
                    select2.selectedIndex = i;
                    break;
                }
            }

            $('#varient').modal('show')
        }
    } catch (err) {
        console.log(err);
        window.location.href = '/admin/500-Server-Error'
    }

}

// edit product

async function editProducts() {

    document.getElementById('edit_product').setAttribute('disabled', 'disabled')

    const formData = new FormData();

    formData.append('pId', document.getElementById('product_id').value)
    formData.append('product_name', document.getElementById('product_name_edit').value)
    formData.append('title', document.getElementById('product_title_edit').value)
    formData.append('type', document.getElementById('select_type').value);
    formData.append('category', document.getElementById('select_category').value);
    formData.append('discription', document.getElementById('pdescription').value);
    formData.append('tags', document.getElementById('ptag').value);

    const obj = Object.fromEntries(formData)

    try {
        const resp = await fetch('/admin/editProducts', {
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
        else if (data.type === 'name') {
            const input = document.getElementById('product_name_edit')
            const err = document.getElementById('error_add')
            input.style.color = 'red'
            input.value = data.msg
            input.removeAttribute('required')
            input.setAttribute('readOnly', 'readOnly')
            err.innerHTML = 'error'
            err.style.color = 'red'

            setTimeout(() => {
                const input = document.getElementById('product_name_edit')
                const err = document.getElementById('error_add')
                input.style.color = 'black'
                input.value = data.product_name
                input.removeAttribute('readOnly')
                input.setAttribute('required', 'required')
                err.innerHTML = ''
                document.getElementById('edit_product').removeAttribute('disabled')
            }, 2000)

        } else if (data.type === 'title') {
            const input = document.getElementById('product_title_edit')
            const err = document.getElementById('error_add_title')
            input.style.color = 'red'
            input.value = data.msg
            input.removeAttribute('required')
            input.setAttribute('readOnly', 'readOnly')
            err.innerHTML = 'error'
            err.style.color = 'red'

            setTimeout(() => {
                const input = document.getElementById('product_title_edit')
                const err = document.getElementById('error_add_title')
                input.style.color = 'black'
                input.value = data.title
                input.removeAttribute('readOnly')
                input.setAttribute('required', 'required')
                err.innerHTML = ''
                document.getElementById('edit_product').removeAttribute('disabled')
            }, 2000)

        } else if (data.type === 'tags') {
            const input = document.getElementById('ptag')
            const err = document.getElementById('error_tag')
            input.style.color = 'red'
            input.value = data.msg
            input.setAttribute('readOnly', 'readOnly')
            err.innerHTML = 'error'
            err.style.color = 'red'

            setTimeout(() => {
                const input = document.getElementById('ptag')
                const err = document.getElementById('error_tag')
                input.style.color = 'black'
                input.value = data.tags
                input.removeAttribute('readOnly')
                err.innerHTML = ''
                document.getElementById('edit_product').removeAttribute('disabled')
            }, 2000)
        }
        else if (data.type === 'error') {
            $('#varient').modal('hide')
            document.getElementById('error_p').innerHTML = data.msg
            document.getElementById('error_symbol').style.color = 'red'
            document.getElementById('error_symbol').innerHTML = 'error'
            const myModal = new bootstrap.Modal(document.getElementById('message'));
            myModal.show();
        } else {

            function formatDate(dateString) {
                const date = new Date(dateString);
                const options = { day: 'numeric', month: 'long', year: 'numeric' };
                return date.toLocaleDateString('en-GB', options);
            }

            function formatLocalTime(dateString) {
                const date = new Date(dateString);
                return date.toLocaleTimeString();
            }


            const id = document.getElementById('product_id').value

            document.getElementById('p_image_td' + id).src = `/products/uploads/${data.product.varients[0].images[0]}`
            document.getElementById('p_name_td' + id).innerHTML = data.product.product_name
            document.getElementById('p_stock_details' + id).innerHTML = data.product.type.type_name + ' ' + data.product.category.category_name
            document.getElementById('p_tags' + id).innerHTML = data.product.tags

            const date = formatDate(data.product.addedDateTime)
            const time = formatLocalTime(data.product.addedDateTime)

            document.getElementById('date_time' + id).innerHTML = date + ' ' + time

            $('#varient').modal('hide')
            document.getElementById('edit_product').removeAttribute('disabled')
            document.getElementById('ok_btn').setAttribute('onclick', `reload()`);
            document.getElementById('error_p').innerHTML = data.msg
            document.getElementById('error_symbol').style.color = 'green'
            document.getElementById('error_symbol').innerHTML = 'task_alt'
            const myModal = new bootstrap.Modal(document.getElementById('message'));
            myModal.show();
        }
    } catch (err) {
        console.log(err);
        window.location.href = '/admin/500-Server-Error'
    }

}

// reload form

function reload() {
    window.location.href = '/admin/listedProducts'
}

// get data to unlist

function getDataToUnlist(id, name) {
    document.getElementById('name_').innerHTML = name
    const confirmButton = document.getElementById('confirm_btn');
    confirmButton.setAttribute('onclick', `unlistproduct('${id}')`);
}


async function unlistproduct(id) {
    const obj = {
        id: id
    }

    try {

        const resp = await fetch(`/admin/product/unlist`, {
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
        else if (data.type === 'success') {
            const row = document.getElementById('row' + id)
            row.style.display = 'none'

            document.getElementById('ok_btn').removeAttribute('onclick', `reload()`);
            document.getElementById('error_p').innerHTML = data.msg
            document.getElementById('error_symbol').style.color = 'green'
            document.getElementById('error_symbol').innerHTML = 'task_alt'
            const myModal = new bootstrap.Modal(document.getElementById('message'));
            myModal.show();

        }

    } catch (err) {

        console.log(err);
        window.location.href = '/admin/500-Server-Error'
    }

}