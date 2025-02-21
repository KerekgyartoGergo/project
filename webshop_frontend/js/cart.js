const btnLogout =document.getElementsByClassName('icon-logout')[0];
const btnProfile =document.getElementsByClassName('icon-user')[0];
const btnMenuLogo = document.getElementsByClassName('menu-logo')[0];

window.addEventListener('DOMContentLoaded', getCartItems);
window.addEventListener('DOMContentLoaded', getCartTotal);

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

        quantityInput.addEventListener('change', () => updateCartItem(item.product_id, quantityInput.value));

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




function updateCartItem(productId, newQuantity) {
    fetch('http://127.0.0.1:3000/api/updateCart/', {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ product_id: productId, quantity: parseInt(newQuantity, 10) })
    })
    .then(response => response.json())
    .then(data => {
        if (data.error) {
            alert(data.error);
        } else {
            console.log('Mennyiség frissítve:', data);
            getCartTotal(); // Új végösszeg lekérése
        }
    })
    .catch(error => console.error('Hiba a frissítés közben:', error));
}

async function deleteItemFromCart(productId) {
    if (confirm('Biztosan törölni akarod a terméket a kosárból?')) {
        try {
            const res = await fetch('http://127.0.0.1:3000/api/deleteCart', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ product_id: productId }), // A törlendő termék
                credentials: 'include'
            });

            const data = await res.json();

            if (res.ok) {
                alert('Termék sikeresen törölve a kosárból');
                // Frissítjük a kosár tartalmát közvetlenül a DOM-ban
                renderCartItems(data.cartItems);  // Közvetlenül újrarendereljük a kosarat
                getCartTotal(); // Új végösszeg lekérése
            } else if (data.error) {
                alert(data.error);
            } else {
                alert('Ismeretlen hiba történt');
            }
        } catch (error) {
            console.error('Hálózati hiba történt:', error);
        }
    } else {
        alert('A törlési művelet megszakítva');
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


//végösszeg

async function getCartTotal() {
    try {
        const res = await fetch('http://127.0.0.1:3000/api/getCartTotal', {
            method: 'GET',
            credentials: 'include'  // Az autentikációhoz szükséges sütik (cookies) átadása
        });

        // Ha a válasz nem OK, hibát dobunk
        if (!res.ok) {
            throw new Error('Hiba történt a válasz során');
        }

        const data = await res.json(); // JSON válasz beolvasása
        console.log(data);

        // Ha van 'total_price' az API válaszban, akkor frissítjük az összes szekciót
        if (data.total_price !== undefined) {
            updateOrderSummary(data.total_price); // Rendeljük hozzá az összeghez
        } else {
            console.error(data.error); // Hibák megjelenítése konzolon
            updateOrderSummary(0); // Ha hiba történik, nulla összeggel folytatjuk
        }
    } catch (error) {
        console.error(error); // Hálózati hibák vagy bármilyen más hiba kezelése
        updateOrderSummary(0); // Ha hiba történt, nulla összeggel folytatjuk
    }
}

// Funkció a rendelési összeg frissítésére
function updateOrderSummary(cartTotal) {
    const deliveryCost = 1200; // Szállítási költség

    // Győződjünk meg róla, hogy mindkét érték szám típusú
    const cartTotalAmount = parseFloat(cartTotal) || 0;  // Kosár összegének biztosítása számként
    const deliveryCostAmount = parseFloat(deliveryCost) || 0; // Szállítási költség biztosítása számként

    // Kiszámítjuk a végösszeget (kosár összeg + szállítási költség)
    const totalAmount = cartTotalAmount + deliveryCostAmount;

    // Frissítjük az összeg szövegeit
    document.getElementById('vegosszeg').textContent = `Összeg: ${cartTotalAmount} Ft`;  // Kosár összegének frissítése
    document.querySelector('.summary p:nth-child(2)').textContent = `Szállítási költség: ${deliveryCostAmount} Ft`;  // Szállítási költség frissítése

    // A végösszeg most a kosár összeg és a szállítási költség összeadva
    document.querySelector('.total p').textContent = `Végösszeg: ${totalAmount} Ft`;  // Végösszeg frissítése
}
