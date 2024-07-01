// loading categories page

function loadCategories() {
    setTimeout(() => {
        document.getElementById('loading').style.display = 'none'
        document.getElementById('contents').style.display = 'block'
    }, 400);


    // edit category

    const forms = document.getElementById('edit_form')
    forms.addEventListener('submit', async (e) => {
        e.preventDefault()

        const category = document.getElementById('cname').value;
        const typeId = document.getElementById('select_type_edit').value;
        const catId = forms[0].value

        const obj = {
            category: category,
            typeId: typeId,
            catId: catId
        }

        const btn = document.getElementById('edit_btn')
        btn.setAttribute('disabled', 'disabled')

        try {
            const resp = await fetch('/admin/editCategories', {
                method: 'PATCH',
                headers: {
                    'Content-type': 'application/json'
                },
                body: JSON.stringify(obj)
            })

            const data = await resp.json()

            const err_ = document.getElementById('error_edit')
            const input = document.getElementById('cname')

            if (data.type === 'redirect') {
                window.location.href = '/admin/signIn'
            }
            else if (data.type === 'error') {
                showError(err_, input, 'error', data, 'red')

                setTimeout(() => {
                    removeError(err_, input, data.text)
                    btn.removeAttribute('disabled')
                }, 2000)

            } else {
                document.getElementById('cat_name_td' + catId).innerHTML = data.cat_name
                document.getElementById('type_name_td' + catId).innerHTML = data.type_name
                showError(err_, input, 'task_alt', data, 'green')

                setTimeout(() => {
                    removeError(err_, input, data.cat_name)
                    btn.removeAttribute('disabled')
                }, 2000);

                document.getElementById('close_btn').setAttribute('onclick', 'reload()');

            }
        } catch (err) {
            console.log(err);
            window.location.href = '/admin/500-Server-Error'
        }

    })

}


// realod the page after adding the type

function reload() {
    setTimeout(() => {
        window.location.href = '/admin/unlistedCategories'
    }, 400);
}


// get Data to display on edit modal

function getData(name, id, type) {

    const form = document.getElementById('edit_form')
    form[0].value = id
    form[1].value = name
    const select = document.getElementById('select_type_edit');
    for (let i = 0; i < select.options.length; i++) {
        if (select.options[i].text === type) {
            select.selectedIndex = i;
            break;
        }
    }

}

// get Data to disply on edit mod


// show and remove error

function showError(err_, input, err, data, color) {
    input.style.color = color
    input.value = data.msg
    input.removeAttribute('required')
    input.setAttribute('readOnly', 'readOnly')
    err_.innerHTML = err
    err_.style.color = color
}

function removeError(err_, input, typ_name) {
    err_.innerHTML = ''
    if (typ_name !== undefined) {
        input.value = typ_name
    } else {
        input.value = ''
    }
    input.style.color = 'black'
    input.removeAttribute('readOnly')
    input.setAttribute('required', 'required')

}


// get modal for unlist category

function getDatalist(name, id) {

    document.getElementById('name_').innerHTML = name

    const confirmButton = document.getElementById('confirm_btn');
    confirmButton.setAttribute('onclick', `listCategory('${id}')`);
}

async function listCategory(id) {

    const obj = {
        id: id
    }

    try {

        const resp = await fetch(`/admin/category/list`, {
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