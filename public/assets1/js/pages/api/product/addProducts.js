// loading products page 

async function loadProducts() {
    setTimeout(() => {
        document.getElementById('loading').style.display = 'none'
        document.getElementById('products').style.display = 'block'
        document.getElementById('imageInput1').value = ''
        document.getElementById('imageInput2').value = ''
        document.getElementById('imageInput3').value = ''
    }, 400);


    // to crop images

    const imageInputs = [
        document.getElementById('imageInput1'),
        document.getElementById('imageInput2'),
        document.getElementById('imageInput3'),
        document.getElementById('imageInput4')
    ];
    const cropContainer = document.getElementById('crop-container');
    const cropImage = document.getElementById('crop-image');
    const cropButton = document.getElementById('crop-button');
    let cropper;
    let currentInput;
    let currentPreview;

    imageInputs.forEach(input => {
        input.addEventListener('change', function (event) {
            document.getElementById('crop-button').style.display = 'block'
            currentPreview = document.getElementById(`imagePreview${imageInputs.indexOf(input) + 1}`);
            currentPreview.innerHTML = ''
            currentInput = input;
            const file = event.target.files[0];
            input.value = ''
            if (file) {
                const reader = new FileReader();
                reader.onload = function (e) {
                    cropImage.src = e.target.result;
                    cropContainer.style.display = 'block';
                    if (cropper) {
                        cropper.destroy();
                    }
                    cropper = new Cropper(cropImage, {
                        aspectRatio: 0.72,
                        viewMode: 1,
                        movable: false,
                        zoomable: false,
                        rotatable: false,
                        scalable: false,
                    });
                };
                reader.readAsDataURL(file);
            }
        });
    });

    cropButton.addEventListener('click', () => {
        if (cropper) {

            const canvas = cropper.getCroppedCanvas();
            const croppedImageDataURL = canvas.toDataURL();
            // You can now use croppedImageDataURL to display the cropped image or send it to the server
            // console.log(croppedImageDataURL);
            cropContainer.style.display = 'none';

            // Show the cropped image in the preview
            currentPreview.innerHTML = '';
            const imgElement = document.createElement('img');
            imgElement.src = croppedImageDataURL;
            imgElement.style.maxWidth = '100%';
            currentPreview.appendChild(imgElement);

            // Here we can reset the file input and update it with the cropped image
            const dataTransfer = new DataTransfer();
            dataTransfer.items.add(new File([dataURLtoBlob(croppedImageDataURL)], 'cropped.png', { type: 'image/png' }));
            currentInput.files = dataTransfer.files;
        }
    });

    function dataURLtoBlob(dataurl) {
        let arr = dataurl.split(','), mime = arr[0].match(/:(.*?);/)[1],
            bstr = atob(arr[1]), n = bstr.length, u8arr = new Uint8Array(n);
        while (n--) {
            u8arr[n] = bstr.charCodeAt(n);
        }
        return new Blob([u8arr], { type: mime });
    }



    // Get a categories depends on the type selected
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

                document.getElementById('pcategory').style.display = 'none'
                selectCategory.style.display = 'block'

                // Clear existing options
                selectCategory.innerHTML = ''

                // Create a default option
                if (data.cats.length > 0) {
                    const defaultOption = document.createElement('option')
                    defaultOption.value = ''
                    defaultOption.textContent = 'Select a category'
                    defaultOption.disabled = true
                    defaultOption.selected = true
                    defaultOption.hidden = true;
                    selectCategory.appendChild(defaultOption);

                    data.cats.forEach(category => {
                        const option = document.createElement('option');
                        option.value = category._id
                        option.textContent = category.category_name
                        selectCategory.appendChild(option)
                    });

                } else {
                    const defaultOption = document.createElement('option')
                    defaultOption.value = ''
                    defaultOption.textContent = 'Categories are not added'
                    defaultOption.disabled = true
                    defaultOption.selected = true
                    defaultOption.hidden = true;
                    selectCategory.appendChild(defaultOption);

                    document.getElementById('pcategory').style.display = 'block'
                    document.getElementById('pcategory').setAttribute('placeholder', 'Categories are not added')
                    selectCategory.style.display = 'none'

                }
            }
        } catch (error) {
            console.log(err);
            window.location.href = '/admin/500-Server-Error'
        }
    });


    // add product

    const form = document.getElementById('add_form')

    form.addEventListener('submit', async (event) => {
        event.preventDefault(); // Prevent the default form submission

        document.getElementById('add_product').setAttribute('disabled', 'disabled')

        let tags
        if (document.getElementById('ptag').value === '') {
            tags = null
        } else {
            tags = document.getElementById('ptag').value
        }

        const obj = {
            product: document.getElementById('pname').value,
            title: document.getElementById('ptitle').value,
            type: document.getElementById('select_type').value,
            category: document.getElementById('select_category').value,
            discription: document.getElementById('pdescription').value,
            tags: tags
        }

        try {
            const resp = await fetch('/admin/addProducts', {
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
            else if (data.type === 'name') {
                const input = document.getElementById('pname')
                const err = document.getElementById('error_add')
                input.style.color = 'red'
                input.value = data.msg
                input.removeAttribute('required')
                input.setAttribute('readOnly', 'readOnly')
                err.innerHTML = 'error'
                err.style.color = 'red'

                setTimeout(() => {
                    const input = document.getElementById('pname')
                    const err = document.getElementById('error_add')
                    input.style.color = 'black'
                    input.value = ''
                    input.removeAttribute('readOnly')
                    input.setAttribute('required', 'required')
                    err.innerHTML = ''
                    document.getElementById('add_product').removeAttribute('disabled')
                }, 2000)

            } else if (data.type === 'title') {
                const input = document.getElementById('ptitle')
                const err = document.getElementById('error_add_title')
                input.style.color = 'red'
                input.value = data.msg
                input.removeAttribute('required')
                input.setAttribute('readOnly', 'readOnly')
                err.innerHTML = 'error'
                err.style.color = 'red'

                setTimeout(() => {
                    const input = document.getElementById('ptitle')
                    const err = document.getElementById('error_add_title')
                    input.style.color = 'black'
                    input.value = ''
                    input.removeAttribute('readOnly')
                    input.setAttribute('required', 'required')
                    err.innerHTML = ''
                    document.getElementById('add_product').removeAttribute('disabled')
                }, 2000)

            }
            else if (data.type === 'error') {
                document.getElementById('error_p').innerHTML = data.msg
                document.getElementById('error_symbol').style.color = 'red'
                document.getElementById('error_symbol').innerHTML = 'error'
                const myModal = new bootstrap.Modal(document.getElementById('message'));
                myModal.show();
            } else {
                document.getElementById('add_product').removeAttribute('disabled')
                document.getElementById('close_btn').setAttribute('onclick', `deleteProduct('${data.pId}')`);
                document.getElementById('product_id').value = data.pId
                // document.getElementById('product_name').innerHTML = data.pname
                const myModal = new bootstrap.Modal(document.getElementById('varient'));
                myModal.show();
            }
        } catch (err) {
            console.log(err);
            window.location.href = '/admin/500-Server-Error'
        }

    })

}

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


// add  varients

async function addVarient() {

    // Get form data

    const formData = new FormData();

    formData.append('pId', document.getElementById('product_id').value)
    formData.append('color', document.getElementById('select_color').value);
    formData.append('actualPrice', document.getElementById('pprice').value)
    const sizes = document.getElementById('sizes_length').value;
    const size = [];
    const stock = [];
    const price = [];

    for (let i = 0; i < sizes; i++) {
        const sizeValue = document.getElementById('size' + i).value;
        const stockValue = parseInt(document.getElementById('quantity' + i).value);
        const priceValue = parseFloat(document.getElementById('pprice').value);

        if (stockValue && priceValue) {
            size.push(sizeValue);
            stock.push(stockValue);
            price.push(priceValue);
        }
    }

    formData.append('size', size);
    formData.append('stock', stock);
    formData.append('price', price);
    formData.append('file1', document.getElementById('imageInput1').files[0]);
    formData.append('file2', document.getElementById('imageInput2').files[0]);
    formData.append('file3', document.getElementById('imageInput3').files[0]);
    formData.append('file4', document.getElementById('imageInput4').files[0]);


    console.log(Object.fromEntries(formData));

    if (size.length > 0 && stock.length > 0 && price.length > 0) {
        $('#varient').modal('hide');

        try {

            const resp = await fetch('/admin/addVarients', {
                method: 'POST',
                body: formData
            })

            const data = await resp.json()

            if (data.type === 'redirect') {
                window.location.href = '/admin/signIn'
            }
            else if (data.type === 'error') {
                document.getElementById('error_p').innerHTML = data.msg
                document.getElementById('error_symbol').style.color = 'red'
                document.getElementById('error_symbol').innerHTML = 'error'
                document.getElementById('ok_btn').setAttribute('onclick', `getVarientAddModal()`);
                const myModal = new bootstrap.Modal(document.getElementById('message'));
                myModal.show();
            } else {
                document.getElementById('close_btn').removeAttribute('onclick', `deleteProduct('${data.pId}')`);
                document.getElementById('close_btn').setAttribute('onclick', `clearAllForm()`);
                document.getElementById('btn_close1').setAttribute('onclick', `clearAllForm()`);
                document.getElementById('add_another').setAttribute('onclick', `addAnotherVarient()`);
                document.getElementById('error_p1').innerHTML = data.msg
                document.getElementById('error_symbol1').style.color = 'green'
                document.getElementById('error_symbol1').innerHTML = 'task_alt'
                const myModal = new bootstrap.Modal(document.getElementById('message1'));
                myModal.show();
            }
        } catch (err) {
            console.log(err);
            // window.location.href = '/admin/500-Server-Error'
        }

    }
}



// get varient add form

function getVarientAddModal() {
    const myModal = new bootstrap.Modal(document.getElementById('varient'));
    myModal.show();

}

// add anotehr varient

function addAnotherVarient() {
    $('#message1').modal('hide')
    document.getElementById('add_varient_form').reset()
    document.getElementById('imagePreview1').innerHTML = ''
    document.getElementById('imagePreview2').innerHTML = ''
    document.getElementById('imagePreview3').innerHTML = ''
    document.getElementById('imagePreview4').innerHTML = ''
    const myModal = new bootstrap.Modal(document.getElementById('varient'));
    myModal.show();
}

// clear all form after adding varients

function clearAllForm() {
    document.getElementById('add_varient_form').reset()
    document.getElementById('add_form').reset()
    document.getElementById('select_category').style.display = 'none'
    document.getElementById('pcategory').style.display = 'block'
    document.getElementById('imagePreview1').innerHTML = ''
    document.getElementById('imagePreview2').innerHTML = ''
    document.getElementById('imagePreview3').innerHTML = ''
    document.getElementById('imagePreview4').innerHTML = ''
}


// clear product add form

function clearForm() {
    document.getElementById('select_category').style.display = 'none'
    document.getElementById('pcategory').style.display = 'block'
    document.getElementById('add_varient_form').reset()
    document.getElementById('imagePreview1').innerHTML = ''
    document.getElementById('imagePreview2').innerHTML = ''
    document.getElementById('imagePreview3').innerHTML = ''
    document.getElementById('imagePreview4').innerHTML = ''
    // document.getElementById('para').style.display = 'block'
}


// to delete the product if no varients are added

async function deleteProduct(id) {

    try {
        const resp = await fetch(`/admin/deleteProduct?id=${id}`, { method: 'delete' })
        const data = await resp.json()

        if (data.type === 'redirect') {
            window.location.href = '/admin/signIn'
        }
        else {
            document.getElementById('add_varient_form').reset()
            document.getElementById('imagePreview1').innerHTML = ''
            document.getElementById('imagePreview2').innerHTML = ''
            document.getElementById('imagePreview3').innerHTML = ''
            document.getElementById('imagePreview4').innerHTML = ''
        }
    } catch (err) {
        console.log(err);
        window.location.href = '/admin/500-Server-Error'
    }
}


