const btnLogout =document.getElementsByClassName ('icon-logout')[0];
const btnProfile =document.getElementsByClassName ('icon-user')[0];
const btnCart =document.getElementsByClassName ('icon-home')[0];
const btnAddToCart = document.getElementsByClassName('add-to-cart-btn')[0];
const btnMenuLogo = document.getElementsByClassName('menu-logo')[0];

btnLogout.addEventListener('click', ()=>{
    window.location.href='../webshop_frontend/index.html';
});

btnAddToCart.addEventListener('click', ()=>{
    cart.addEventListener('click', () => addToCart(product.product_id, 1));
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


async function logout(){
    const res =await fetch('http://127.0.0.1:3000/api/logout',{
        method:'POST',
        credentials: 'include'
    });

    const data =await res.json();

    if(res.ok){
        alert(data.message);
        window.location.href='../webshop_frontend/index.html';
    }else{
        alert('Hiba a kijelentkezéskor!')
    }
}

//termék kosárhoz adása
async function addToCart(product_id, quantity = 1) {
    try {
        const response = await fetch('http://127.0.0.1:3000/api/addCart/', {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ product_id, quantity })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Hiba történt a termék kosárba helyezésekor.');
        }

        Swal.fire({
            position: "center",
            icon: "success",
            title: data.message,
            showConfirmButton: false,
            timer: 1500,
            theme: 'dark'
        });
    } catch (error) {
        console.error('Hiba a kosárhoz adás során:', error);
        alert(error.message);
    }
}
