const btnLogout =document.getElementsByClassName('icon-logout')[0];
const btnProfile =document.getElementsByClassName('icon-user')[0];
const btnMenuLogo = document.getElementsByClassName('menu-logo')[0];
const btnCart = document.getElementsByClassName('icon-cart')[0];


btnLogout.addEventListener('click', logout);



btnMenuLogo.addEventListener('click', ()=>{
    window.location.href='../webshop_frontend/home.html';
});

btnProfile.addEventListener('click', ()=>{
    window.location.href='../webshop_frontend/profile.html';
});

btnCart.addEventListener('click', () => {
    window.location.href = '../webshop_frontend/cart.html';
});


async function logout() {
    const res = await fetch('http://127.0.0.1:3000/api/logout', {
        method: 'POST',
        credentials: 'include'
    });

    const data = await res.json();

    if (res.ok) {
        alert(data.message);
        window.location.href = '../webshop_frontend/index.html';
    } else {
        alert('Hiba a kijelentkezéskor!')
    }
}
  
async function getCartItems() {
    const res = await fetch('http://127.0.0.1:3000/api/getCartItems', {
        method: 'GET',
        credentials: 'include'
    });

    const cartItems = await res.json();
    console.log(cartItems);
    renderCartItems(cartItems);
}



function renderCartItems(cartItems) {
    const row = document.getElementsByClassName('product-list')[0];
    row.innerHTML = ''; // Töröljük a korábbi elemeket

    for (const item of cartItems) {
        // Fő termék div létrehozása
        const productItemDiv = document.createElement('div');
        productItemDiv.classList.add('product-item');

        // Termékkép
        const productImg = document.createElement('img');
        productImg.src = `http://127.0.0.1:3000/uploads/${item.product_image}`;
        productImg.alt = `${item.description}`;
        productImg.classList.add('product-image');

        // Termék információk div
        const productInfoDiv = document.createElement('div');
        productInfoDiv.classList.add('product-info');

        // Termék neve
        const productName = document.createElement('p');
        productName.innerHTML = `<strong>${item.description}</strong>`;

        // Termék ára
        const productPrice = document.createElement('p');
        productPrice.textContent = `Ár: ${item.price} Ft`;

        // Mennyiség
        const productQuantity = document.createElement('p');
        productQuantity.innerHTML = `<strong>Mennyiség:</strong> ${item.quantity} db`;

        // Hozzáadjuk az információkat a productInfoDiv-hez
        productInfoDiv.appendChild(productName);
        productInfoDiv.appendChild(productPrice);
        productInfoDiv.appendChild(productQuantity);

        // Kép és információs div hozzáadása a termék item-hez
        productItemDiv.appendChild(productImg);
        productItemDiv.appendChild(productInfoDiv);

        // Végül hozzáadjuk a terméket a fő sorhoz
        row.appendChild(productItemDiv);
    }
}
