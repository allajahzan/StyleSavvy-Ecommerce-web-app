// loading types page

function loadTypes() {
    setTimeout(() => {
        document.getElementById('loading').style.display = 'none'
        document.getElementById('contents').style.display = 'block'
    }, 400);

    // add types 

    const form = document.getElementById('add_form')
    form.addEventListener('submit', async (e) => {
        e.preventDefault()

        const type = form[0].value

        const obj = {
            type: type
        }

        const btn = document.getElementById('add_confirm_button')
        btn.setAttribute('disabled', 'disabled')

        try {
            const resp = await fetch('/admin/addTypes', {
                method: 'POST',
                headers: {
                    'Content-type': 'application/json'
                },
                body: JSON.stringify(obj)
            })

            const data = await resp.json()

            const err_ = document.getElementById('error_add')
            const input = form[0]

            if (data.type === 'redirect') {
                window.location.href = '/admin/signIn'
            }
            else if (data.type === 'error') {
                showError(err_, input, 'error', data, 'red')
                setTimeout(() => {
                    btn.removeAttribute('disabled')
                    removeError(err_, input)
                }, 2000)
            } else {

                const tableBody = document.getElementById('tableBody_listed');
                tableBody.innerHTML = '';

                data.types.reverse().forEach((type, no) => {
                    const newRow = document.createElement('tr');
                    newRow.innerHTML = `
                    <td>${type.type_name}</td>
                    <td><button class="edit_">Edit</button></td>
                    <td><button class="unlist_">Unlist</button></td>
                    <td>Listed</td>
                  `;

                    tableBody.appendChild(newRow);
                });

                showError(err_, input, 'task_alt', data, 'green')
                setTimeout(() => {
                    btn.removeAttribute('disabled')
                    removeError(err_, input)
                }, 2000);

                const close_btn = document.getElementById('close_btn');
                close_btn.setAttribute('onclick', 'reload()');
            }
        } catch (err) {
            console.log(err);
            window.location.href = '/admin/500-Server-Error'
        }

    })

    // edit type

    const forms = document.getElementById('edit_form')
    forms.addEventListener('submit', async (e) => {
        e.preventDefault()

        const id = forms[0].value
        const type = forms[1].value
        const obj = {
            id: id,
            type: type
        }

        const btn = document.getElementById('edit_button')
        btn.setAttribute('disabled', 'disabled')

        try {
            const resp = await fetch('/admin/editTypes', {
                method: 'PATCH',
                headers: {
                    'Content-type': 'application/json'
                },
                body: JSON.stringify(obj)
            })


            const data = await resp.json()

            const err_ = document.getElementById('error_edit')
            const input = forms[1]

            if (data.type === 'redirect') {
                window.location.href = '/admin/signIn'
            }
            else if (data.type === 'error') {
                showError(err_, input, 'error', data, 'red')
                setTimeout(() => {
                    btn.removeAttribute('disabled')
                    removeError(err_, input, data.text)
                }, 2000)
            } else {
                document.getElementById('type_name_td_listed' + id).innerHTML = data.text
                showError(err_, input, 'task_alt', data, 'green')
                setTimeout(() => {
                    btn.removeAttribute('disabled')
                    removeError(err_, input, data.text)
                }, 2000);

                const close_btn = document.getElementById('close_btn_edit');
                close_btn.setAttribute('onclick', 'reload()');
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
        window.location.href = '/admin/listedTypes'
    }, 400);
}


// get edit modal

function getData(name, id) {

    const form = document.getElementById('edit_form')
    form[0].value = id
    form[1].value = name
    form[2].value = name
}

// show and remove errors

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


// get modal for unlist

function getDataToUnlist(name, id) {

    document.getElementById('name_').innerHTML = name

    const confirmButton = document.getElementById('confirm_btn');
    confirmButton.setAttribute('onclick', `unlistType('${id}')`);
}

// to unlist type
async function unlistType(id) {

    const obj = {
        id: id
    }

    try {

        const resp = await fetch(`/admin/type/unlist`, {
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

