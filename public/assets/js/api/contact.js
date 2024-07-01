async function loadContactPage() {
    document.body.style.overflow = 'hidden';
    setTimeout(() => {
        document.getElementById('cart').style.display = 'block'
        document.getElementById('cart').style.visibility = 'hidden'
    }, 500);
    setTimeout(() => {
        document.getElementById('loading').style.display = 'none'
        document.getElementById('cart').style.visibility = 'visible'
        document.body.style.overflow = '';
    }, 1000);

    const url = window.location.href
    localStorage.setItem('url', url);
}