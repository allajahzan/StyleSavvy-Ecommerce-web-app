function loadColors() {
    setTimeout(() => {
        document.getElementById('loading').style.display = 'none'
        document.getElementById('contents').style.display = 'block'
    }, 400);

    // add size

    const form = document.getElementById('add_form')
    form.addEventListener('submit', async (e) => {
        e.preventDefault()

        const color = form[0].value
        const hexCode = form[1].value

        const obj = {
            color: color,
            hexcode: hexCode
        }

        const btn = document.getElementById('add_confirm_button')
        btn.setAttribute('disabled', 'disabled')

        try {
            const resp = await fetch('/admin/addColors', {
                method: 'POST',
                headers: {
                    'Content-type': 'application/json'
                },
                body: JSON.stringify(obj)
            })

            const data = await resp.json()

            const err_1 = document.getElementById('error_add')
            const input1 = form[0]

            const err_2 = document.getElementById('error_hexa')
            const input2 = form[1]

            if (data.type === 'redirect') {
                window.location.href = '/admin/signIn'
            }
            else if (data.type === 'error') {
                showError(err_1, input1, 'error', data, 'red')
                setTimeout(() => {
                    btn.removeAttribute('disabled')
                    removeError(err_1, input1, data.text)
                }, 2000)
            }
            else if (data.type === 'error1') {
                showError(err_2, input2, 'error', data, 'red')
                setTimeout(() => {
                    btn.removeAttribute('disabled')
                    removeError(err_2, input2, data.text)
                }, 2000)
            } else {

                form[1].value = ''
                const tableBody = document.getElementById('tableBody_listed');
                tableBody.innerHTML = '';

                data.colors.reverse().forEach((color, no) => {
                    const newRow = document.createElement('tr');
                    newRow.innerHTML = `
                    <td>${color.color_name}</td>
                    <td>${color.color_code}</td>
                    <td><button class="edit_">Edit</button></td>
                    <td><button class="unlist_">Unlist</button></td>
                    <td>Listed</td>
                  `;

                    tableBody.appendChild(newRow);
                });

                showError(err_1, input1, 'task_alt', data, 'green')
                setTimeout(() => {
                    btn.removeAttribute('disabled')
                    removeError(err_1, input1)
                }, 2000);

                const close_btn = document.getElementById('close_btn');
                close_btn.setAttribute('onclick', 'reload()');
            }
        } catch (err) {
            const err_ = document.getElementById('error_add')
            const input = form[0]
            showError(err_, input, 'error', { msg: 'Network Error' }, 'red')
            setTimeout(() => {
                btn.removeAttribute('disabled')
                removeError(err_, input)
            }, 2000)
        }

    })


    // edit sizes

    const forms = document.getElementById('edit_form')
    forms.addEventListener('submit', async (e) => {
        e.preventDefault()

        const id = forms[0].value
        const color = forms[1].value
        const hexacode = forms[2].value

        const obj = {
            color: color,
            id: id,
            hexacode: hexacode
        }

        const btn = document.getElementById('edit_button')
        btn.setAttribute('disabled', 'disabled')

        try {
            const resp = await fetch('/admin/editColors', {
                method: 'PATCH',
                headers: {
                    'Content-type': 'application/json'
                },
                body: JSON.stringify(obj)
            })

            const data = await resp.json()

            const err_1 = document.getElementById('error_edit')
            const input1 = forms[1]

            const err_2 = document.getElementById('error_hexa_edit')
            const input2 = forms[2]

            if (data.type === 'redirect') {
                window.location.href = '/admin/signIn'
            }
            else if (data.type === 'error') {
                showError(err_1, input1, 'error', data, 'red')
                setTimeout(() => {
                    btn.removeAttribute('disabled')
                    removeError(err_1, input1, data.text)
                }, 2000)
            }
            else if (data.type === 'error1') {
                showError(err_2, input2, 'error', data, 'red')
                setTimeout(() => {
                    btn.removeAttribute('disabled')
                    removeError(err_2, input2, data.text)
                }, 2000)
            } else {

                document.getElementById('color_name_td_listed' + id).innerHTML = data.text
                document.getElementById('color_code_td_listed' + id).innerHTML = data.code

                showError(err_1, input1, 'task_alt', data, 'green')
                setTimeout(() => {
                    btn.removeAttribute('disabled')
                    removeError(err_1, input1, data.text)
                }, 2000);

                const close_btn = document.getElementById('close_btn_edit');
                close_btn.setAttribute('onclick', 'reload()');
            }
        } catch (err) {
            const err_ = document.getElementById('error_edit')
            const input = form[0]
            showError(err_, input, 'error', { msg: 'Network Error' }, 'red')
            setTimeout(() => {
                btn.removeAttribute('disabled')
                removeError(err_, input, size)
            }, 2000)
        }

    })

}



// realod the page 

function reload() {
    setTimeout(() => {
        window.location.href = '/admin/listedColors'
    }, 400);
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

// get color data in modal

function getData(name, id, code) {

    const form = document.getElementById('edit_form')
    form[0].value = id
    form[1].value = name
    form[2].value = code
}

// get modal for unlist

function getDataToUnlist(name, id) {

    document.getElementById('name_').innerHTML = name
    const confirmButton = document.getElementById('confirm_btn');
    confirmButton.setAttribute('onclick', `unlistColor('${id}')`);
}


// unlist Size

async function unlistColor(id) {

    const obj = {
        id: id
    }

    try {

        const resp = await fetch(`/admin/color/unlist`, {
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

        document.getElementById('error_p').innerHTML = "Network Error"
        document.getElementById('error_symbol').style.color = 'red'
        document.getElementById('error_symbol').innerHTML = 'error'
        const myModal = new bootstrap.Modal(document.getElementById('message'));
        myModal.show();
    }

}

