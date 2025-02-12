const btnLogout =document.getElementsByClassName ('icon-logout')[0];
const btnProfile =document.getElementsByClassName ('icon-user')[0];
const btnCart =document.getElementsByClassName ('icon-home')[0];
const btnMenuLogo = document.getElementsByClassName('menu-logo')[0];

btnLogout.addEventListener('click', ()=>{
    window.location.href='../webshop_frontend/index.html';
});

btnProfile.addEventListener('click', ()=>{
    window.location.href='../webshop_frontend/profile.html';
});

btnCart.addEventListener('click', ()=>{
    window.location.href='../webshop_frontend/cart.html';
});

btnMenuLogo.addEventListener('click', ()=>{
    window.location.href='../webshop_frontend/home.html';
});

document.addEventListener('DOMContentLoaded', function() {
   
    const urlParams = new URLSearchParams(window.location.search);
    const termek = urlParams.get('termek'); 

    
    const termekAdatok = {
        'Wireless-Noise-Canceling-Headphones': {
            name: 'Wireless Noise Canceling Headphones',
            image: 'images/jbl1-removebg-preview.png',
            price: '$20,456',
            description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer nec odio. Praesent libero. Sed cursus ante dapibus diam.'
        }
    };

    
    if (termekAdatok[termek]) {
        const product = termekAdatok[termek];

        
        document.getElementById('productName').textContent = product.name;
        document.getElementById('productDescription').textContent = product.description;
        document.getElementById('productPrice').textContent = product.price;
        document.getElementById('productImage').src = product.image;
    } else {
        
        document.getElementById('productName').textContent = 'Termék nem található';
        document.getElementById('productDescription').textContent = 'Sajnáljuk, a keresett termék nem elérhető.';
        document.getElementById('productPrice').textContent = '';
        document.getElementById('productImage').style.display = 'none';
    }
});
// aaaaaaaaaaaaaaaaaaaaa