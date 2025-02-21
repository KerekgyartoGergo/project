const btnLogout =document.getElementsByClassName('icon-logout')[0];
const btnProfile =document.getElementsByClassName('icon-user')[0];
const btnMenuLogo = document.getElementsByClassName('menu-logo')[0];

window.addEventListener('DOMContentLoaded', getCartItems);

btnLogout.addEventListener('click', logout);



btnMenuLogo.addEventListener('click', ()=>{
    window.location.href='../webshop_frontend/home.html';
});

btnProfile.addEventListener('click', ()=>{
    window.location.href='../webshop_frontend/profile.html';
});






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
    const row = document.getElementsByClassName('row')[0];
    row.innerHTML = ''; // Töröljük a korábbi elemeket

    for (const item of cartItems) {
        // Fő kártya div létrehozása
        const cardDiv = document.createElement('div');
        cardDiv.classList.add('card');

        // Termékkép
        const cardImg = document.createElement('img');
        cardImg.src = `http://127.0.0.1:3000/uploads/${item.product_image}`;
        cardImg.alt = 'Termék Képe';
        cardImg.classList.add('card-image');

        // Tartalom div
        const cardContent = document.createElement('div');
        cardContent.classList.add('card-content');

        const cardText = document.createElement('p');
        cardText.classList.add('card-text');
        cardText.textContent = item.description;

        cardContent.appendChild(cardText);

        // Akciók div
        const cardActions = document.createElement('div');
        cardActions.classList.add('card-actions');

        const cardPrice = document.createElement('span');
        cardPrice.classList.add('card-price');
        cardPrice.textContent = `${item.price} Ft`;

        const quantityInput = document.createElement('input');
        quantityInput.type = 'number';
        quantityInput.classList.add('card-quantity');
        quantityInput.value = item.quantity;
        quantityInput.min = 1;
        quantityInput.dataset.cartItemId = item.cart_item_id; // Adunk egy adatattribútumot az elemhez

        // Eseménykezelő a mennyiség változására
        quantityInput.addEventListener('change', (e) => {
            const newQuantity = e.target.value;
            updateCartItemQuantity(item.cart_item_id, newQuantity); // Frissítjük a kosár mennyiségét
        });

        const deleteButton = document.createElement('button');
        deleteButton.classList.add('card-delete');
        deleteButton.textContent = 'Törlés';
        deleteButton.addEventListener('click', () => deleteItemFromCart(item.product_id));

        cardActions.append(cardPrice, quantityInput, deleteButton);

        // Kártya div összeállítása
        cardDiv.append(cardImg, cardContent, cardActions);
        row.appendChild(cardDiv);
    }
}


















document.addEventListener('DOMContentLoaded', function() {
    const footerColumns = document.querySelectorAll('.footer-column');

    footerColumns.forEach(column => {
        const title = column.querySelector('.footer-column-title');
        title.addEventListener('click', () => {
            column.classList.toggle('active');
        });
    });
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








// termék törlését a kosárból
async function deleteItemFromCart(productId) {
    if (confirm('Biztosan törölni akarod a terméket a kosárból?')) {
        try {
            const res = await fetch('http://127.0.0.1:3000/api/deleteCart', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',                },
                body: JSON.stringify({ product_id: productId, quantity: 1 }), // A törlendő termék és mennyiség
                credentials: 'include' // Hitelesítési adatok automatikus küldése (ha szükséges)
            });

            // Válasz adatainak beolvasása JSON formátumban
            let data;
            try {
                data = await res.json();
            } catch (err) {
                // Ha a JSON parsing hiba, naplózunk
                console.error('JSON parsing error:', err);
                data = { error: 'Nem lehetett beolvasni a választ JSON formátumban' };
            }

            console.log(data);

            if (res.ok) {
                alert('Termék sikeresen törölve a kosárból');
                // Itt hívhatod a kosár frissítésére szolgáló funkciót, ha szükséges
                getProducts(); // Feltételezem, hogy van egy getProducts függvény a kosár frissítésére
            } else if (data.error) {
                alert(data.error);
            } else {
                alert('Ismeretlen hiba történt');
            }
        } catch (error) {
            console.error('Hálózati hiba történt:', error);
            //alert('Hálózati hiba történt');
        }
    } else {
        alert('A törlési művelet megszakítva');
    }
}