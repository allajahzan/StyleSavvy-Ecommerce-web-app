function loadSizes() {
    setTimeout(() => {
        document.getElementById('loading').style.display = 'none'
        document.getElementById('contents').style.display = 'block'
    }, 400);

    // edit Size

    const forms = document.getElementById('edit_form')
    forms.addEventListener('submit', async (e) => {
        e.preventDefault()

        const id = forms[0].value
        const size = forms[1].value

        const obj = {
            size: size,
            id: id
        }

        const btn = document.getElementById('edit_button')
        btn.setAttribute('disabled', 'disabled')

        try {
            const resp = await fetch('/admin/editSizes', {
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

                document.getElementById('size_name_td_unlisted' + id).innerHTML = data.text

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
        window.location.href = '/admin/unlistedSizes'
    }, 400);
}

// get size data un modal

function getData(name, id) {

    const form = document.getElementById('edit_form')
    form[0].value = id
    form[1].value = name
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



// get modal for list

function getDataTolist(name, id) {

    document.getElementById('name_').innerHTML = name

    const confirmButton = document.getElementById('confirm_btn');
    confirmButton.setAttribute('onclick', `listType('${id}')`);
}

// to list type
async function listType(id) {

    const obj = {
        id: id
    }

    try {

        const resp = await fetch(`/admin/size/list`, {
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

