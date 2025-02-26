const btnLogout =document.getElementsByClassName ('icon-logout')[0];
const btnProfile =document.getElementsByClassName ('icon-user')[0];
const btnCart =document.getElementsByClassName ('icon-cart')[0];
const btnAddToCart = document.getElementsByClassName('add-to-cart-btn')[0];
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

window.addEventListener('DOMContentLoaded', getProduct)



// Termék azonosító kinyerése az URL-ből
const urlParams2 = new URLSearchParams(window.location.search);
const product_id2 = urlParams2.get('product_id');

// Gomb kiválasztása és eseményfigyelő hozzáadása
document.addEventListener('DOMContentLoaded', () => {
    const addToCartButton = document.querySelector('.add-to-cart-btn');

    if (addToCartButton) {
        addToCartButton.addEventListener('click', () => {
            if (product_id2) {
                addToCart(product_id2); // A termék azonosító átadása a függvénynek
            } else {
                alert('Hiba: A termék azonosítója nem található.');
            }
        });
    }
});




async function getProduct() {
    // Az URL-ből lekérjük a product_id értékét
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('product_id');

    if (!id) {
        console.error("Nincs megadva product_id az URL-ben.");
        return;
    }
    console.log("Lekért termék ID:", id);

    try {
        // Módosított végpont és helyes GET kérés használata query paraméterrel
        const res = await fetch(`http://127.0.0.1:3000/api/getItem?id=${id}`, {
            method: 'GET',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            }
        });

        if (!res.ok) {
            throw new Error(`Hiba a lekérés során: ${res.status}`);
        }

        const product = await res.json();
        console.log("Kapott termék adatok:", product);

        renderProduct(product); // A termék megjelenítésére szolgáló függvény
    } catch (error) {
        console.error("Hiba történt:", error);
    }
}

function renderProduct(product) {
    // cím és leírás létrehozása
    const row = document.getElementsByClassName('proba')[0];
    row.innerHTML = '';


        const cim = document.createElement('h2');
        cim.textContent= product.name;

        const leiras =document.createElement('p');
        leiras.classList.add('product-description');
        leiras.textContent= product.description;


        row.append(cim);
        row.append(leiras)
    


        // kép létrehozása
        const row2 = document.getElementsByClassName('pic-div')[0];
        row2.innerHTML = '';


        const kep = document.createElement('img');
        kep.classList.add('large-product-img')
        kep.src=(`http://127.0.0.1:3000/uploads/${product.pic}`)


        row2.append(kep)
}



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
