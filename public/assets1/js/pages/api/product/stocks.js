
function loadProducts() {
    setTimeout(() => {
        document.getElementById('loading').style.display = 'none'
        document.getElementById('products').style.display = 'block'
    }, 400);
}

// get data to edit
function getDataForEdit(vId) {
    $('#edit').modal('show')
    document.getElementById('varient_id').value = vId
}

// refresh form

function refresh() {
    document.getElementById('add_stock').reset()
}

// reload page

function reload(vId) {
    // alert(vId)
    setTimeout(() => {
        window.location.href = `/admin/variant?vid=${vId}`
    }, 400);
}

// get add stock modal

function addStockModal(vId) {

    $('#add').modal('show')
    document.getElementById('varient_id1').value = vId
    document.getElementById('close_btn1').setAttribute('onclick', 'refresh()')
}

// get size for adding
async function addStock() {

    const formData = new FormData()

    const presentInputs = document.querySelectorAll('.present');
    const presentValues = Array.from(presentInputs).map(input => input.value);

    console.log(presentValues);

    const sizes = document.getElementById('sizes_length1').value;
    const size = [];
    const stock = [];
    const price = [];

    for (let i = 0; i < sizes; i++) {
        // Check if i is not present in presentValues
        if (!presentValues.includes(i.toString())) {
            const sizeValue = document.getElementById('size1' + i).value;
            const stockValue = parseInt(document.getElementById('quantity1' + i).value);
            const priceValue = parseFloat(document.getElementById('price1' + i).value);

            if (stockValue && priceValue) {
                size.push(sizeValue);
                stock.push(stockValue);
                price.push(priceValue);
            }
        }
    }

    formData.append('vId', document.getElementById('varient_id1').value);
    formData.append('size', size);
    formData.append('stock', stock);
    formData.append('price', price);

    const obj = Object.fromEntries(formData);

    if (size.length !== 0 && stock.length !== 0 && price.length !== 0) {
        $('#add').modal('hide');

        try {
            const resp = await fetch(`/admin/varient/addStock`, {
                method: 'POST',
                headers: {
                    'Content-type': 'application/json'
                },
                body: JSON.stringify(obj)
            })

            const data = await resp.json()

            if (data.type === 'redirect') {
                window.location.href = '/admin/signIn'
            }
            else {

                const tableBody = document.getElementById('tableBody_listed');
                tableBody.innerHTML = '';


                data.stock.reverse().forEach((stock, index) => {
                    const newRow = document.createElement('tr');
                    newRow.innerHTML = `
               <td id="size_td_${index + 1}">${stock.size.size_name}</td>
               <td id="quantity_td_${index + 1}">${stock.stock}</td>
               <td id="price_td_${index + 1}">₹&nbsp;${stock.price}</td>
         
       `;
                    tableBody.appendChild(newRow);
                });

                $('#message').modal('show')
                document.getElementById('error_p').innerHTML = data.msg
                document.getElementById('error_symbol').style.color = 'green'
                document.getElementById('error_symbol').innerHTML = 'task_alt'
                document.getElementById('ok_btn').setAttribute('onclick', `reload('${data.stock[0].vId}')`);

            }
        } catch (err) {
            console.log(err);
            window.location.href = '/admin/500-Server-Error'
        }
    }

}


// edit stock
async function editStock() {

    $('#edit').modal('hide')

    const formData = new FormData()

    const sizes = document.getElementById('sizes_length').value;
    const size = [];
    const stock = [];
    const price = [];

    for (let i = 0; i < sizes; i++) {
        const sizeValue = document.getElementById('size' + i).value;
        const stockValue = document.getElementById('quantity' + i).value;
        const priceValue = document.getElementById('price' + i).value;

        if (stockValue && priceValue) {
            size.push(sizeValue);
            stock.push(stockValue);
            price.push(priceValue);
        }
    }

    formData.append('vId', document.getElementById('varient_id').value)
    formData.append('size', size);
    formData.append('stock', stock);
    formData.append('price', price);

    const obj = Object.fromEntries(formData)

    try {

        const resp = await fetch('/admin/varient/stockUpdate', {
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
        else {

            const tableBody = document.getElementById('tableBody_listed');
            tableBody.innerHTML = '';


            data.stock.reverse().forEach((stock, index) => {
                const newRow = document.createElement('tr');
                newRow.innerHTML = `
            <td id="size_td_${index + 1}">${stock.size.size_name}</td>
            <td id="quantity_td_${index + 1}">${stock.stock}</td>
            <td id="price_td_${index + 1}">₹&nbsp;${stock.price}</td>
      
    `;
                tableBody.appendChild(newRow);
            });

            $('#message').modal('show')
            document.getElementById('error_p').innerHTML = data.msg
            document.getElementById('error_symbol').style.color = 'green'
            document.getElementById('error_symbol').innerHTML = 'task_alt'
            document.getElementById('ok_btn').setAttribute('onclick', `reload('${data.stock[0].vId}')`);
        }

    } catch (err) {
        console.log(err);
        window.location.href = '/admin/500-Server-Error'
    }

}