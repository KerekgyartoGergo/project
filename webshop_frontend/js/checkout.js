const btnLogout =document.getElementsByClassName('icon-logout')[0];
const btnProfile =document.getElementsByClassName('icon-user')[0];
const btnMenuLogo = document.getElementsByClassName('menu-logo')[0];
const btnCart = document.getElementsByClassName('icon-cart')[0];


btnLogout.addEventListener('click', logout);
window.addEventListener('DOMContentLoaded', getCartItems);
window.addEventListener('DOMContentLoaded', getCartTotal);




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
        productName.innerHTML = `<strong>${item.product_name}</strong>`;

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


function updateOrderSummary(cartTotal) {
    const deliveryCost = 1200; // Szállítási költség

    // Győződjünk meg róla, hogy mindkét érték szám típusú
    const cartTotalAmount = parseFloat(cartTotal) || 0;  // Kosár összegének biztosítása számként
    const deliveryCostAmount = parseFloat(deliveryCost) || 0; // Szállítási költség biztosítása számként

    // Kiszámítjuk a végösszeget (kosár összeg + szállítási költség)
    const totalAmount = cartTotalAmount + deliveryCostAmount;

    // Frissítjük az összeg szövegeit
    document.querySelector('.summary p:nth-child(1)').innerHTML = `<strong>Összeg:</strong> ${cartTotalAmount.toLocaleString()} Ft`;  // Kosár összegének frissítése
    document.querySelector('.summary p:nth-child(2)').innerHTML = `<strong>Szállítási költség:</strong> ${deliveryCostAmount.toLocaleString()} Ft`;  // Szállítási költség frissítése

    // A végösszeg most a kosár összeg és a szállítási költség összeadva
    document.querySelector('.total p').innerHTML = `<strong>Végösszeg:</strong> ${totalAmount.toLocaleString()} Ft`;  // Végösszeg frissítése
}



//rendelés leadása
// Rendelés leadása
document.getElementById('orderForm').addEventListener('submit', function(event) {
    event.preventDefault(); // Megakadályozza az alapértelmezett form elküldést
    
    // Form adatainak lekérése
    const phone = document.getElementById('phone').value;
    const iranyitoszam = document.getElementById('iranyitoszam').value;
    const varos = document.getElementById('varos').value;
    const cim = document.getElementById('cim').value;

    // Form adatainak validálása
    if (!phone || !iranyitoszam || !varos || !cim) {
        alert("Minden mezőt ki kell tölteni!");
        return;
    }

    // POST kérés küldése a backend API-hoz
    fetch('http://127.0.0.1:3000/api/addOrderWithItems', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: 'include',  // Az autentikációhoz szükséges sütik (cookies) átadása

        body: JSON.stringify({
            tel: phone,
            iranyitoszam: iranyitoszam,
            varos: varos,
            cim: cim,
        }),
    })
    .then(response => response.json())
    .then(data => {
        if (data.error) {
            // Ha nincs elég készlet, akkor a details mezőt használjuk az alerthez
            if (data.details) {
                alert(`Nincs elegendő készlet az alábbi termékekből:\n\n${data.details}`);
            } else {
                alert(data.error);
            }
        } else {
            alert('✅ Rendelés sikeresen leadva!');
            // Opcionálisan átirányíthatjuk a felhasználót a rendelés részletező oldalra
             window.location.href = '../webshop_frontend/home.html';
        }
    })
    .catch(error => {
        console.error('Hiba történt a rendelés leadásakor:', error);
        alert('Hiba történt a rendelés leadásakor!');
    });
});
