// loading users page

function loadUsers() {
    setTimeout(() => {
        document.getElementById('loading').style.display = 'none'
        document.getElementById('users').style.display = 'block'
    }, 400);
}


// get modal to block user

async function getUserDataToBlock(name, id) {

    document.getElementById('user_name_modal').innerHTML = name
    // const myModal = new bootstrap.Modal(document.getElementById('staticBackdrop'));
    // myModal.show();

    const confirmButton = document.getElementById('block_confirm_button');
    confirmButton.setAttribute('onclick', `blockUser('${id}')`);
}

// get modal to unblock user

async function getUserDataTounBlock(name, id) {

    document.getElementById('user_name_modal2').innerHTML = name

    const confirmButton = document.getElementById('block_confirm_button2');
    confirmButton.setAttribute('onclick', `unblockUser('${id}')`);
}


// block user
async function blockUser(id) {

    const obj = {
        id: id
    }

    try {

        const resp = await fetch(`/admin/user/block`, {
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
            document.getElementById('error_symbol').innerHTML = 'task_alt'
            const myModal = new bootstrap.Modal(document.getElementById('staticBackdropok'));
            myModal.show();
        }

    } catch (err) {
        console.log(err);
        window.location.href = '/admin/500-Server-Error'
    }

}


// unblock users 
async function unblockUser(id) {

    const obj = {
        id: id
    }

    try {

        const resp = await fetch(`/admin/user/unblock`, {
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

            document.getElementById('error_p2').innerHTML = " " + data.msg
            document.getElementById('error_symbol2').innerHTML = 'task_alt'
            const myModal = new bootstrap.Modal(document.getElementById('staticBackdropok2'));
            myModal.show();
        }

    } catch (err) {
        console.log(err);
        window.location.href = '/admin/500-Server-Error'
    }

}
