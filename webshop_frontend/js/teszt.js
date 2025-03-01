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
    // Fő container kiválasztása
    const container = document.querySelector('.container');
    container.innerHTML = '';

    // Fő div létrehozása
    const productDetail = document.createElement('div');
    productDetail.classList.add('product-detail');

    // Kép rész
    const productImage = document.createElement('div');
    productImage.classList.add('product-image');
    
    const picDiv = document.createElement('div');
    picDiv.classList.add('pic-div');
    
    const img = document.createElement('img');
    img.src = `http://127.0.0.1:3000/uploads/${product.pic || 'default.jpg'}`;
    img.alt = 'Product Image';
    img.classList.add('large-product-img');
    
    picDiv.appendChild(img);
    productImage.appendChild(picDiv);

    // Termék információk
    const productInfo = document.createElement('div');
    productInfo.classList.add('product-info');

    const probaDiv = document.createElement('div');
    probaDiv.classList.add('proba');
    
    const title = document.createElement('h2');
    title.textContent = product.name || '-';
    
    const description = document.createElement('p');
    description.classList.add('product-description');
    description.textContent = product.description || '-';
    
    probaDiv.appendChild(title);
    probaDiv.appendChild(description);

    // Specifikációk létrehozása
    const productSpecs = document.createElement('div');
    productSpecs.classList.add('product-specs');

    const columns = [document.createElement('div'), document.createElement('div'), document.createElement('div')];
    columns.forEach((col, index) => {
        col.classList.add('specs-column');
        if (index === 2) {
            col.id = 'specs-column2';
        }
    });

    const specsData = [
        ['Jelátvitel', product.Jelátvitel],
        ['Max. működési idő', product.Max_működési_idő],
        ['Hordhatósági változatok', product.Hordhatósági_változatok],
        ['Termék típusa', product.Termék_típusa],
        ['Kivitel', product.Kivitel],
        ['Bluetooth verzió', product.Bluetooth_verzió],
        ['Hangszóró-meghajtók', product.Hangszóró_meghajtók],
        ['Szín', product.Szín],
        ['Csatlakozók', product.Csatlakozók],
        ['Bluetooth', product.Bluetooth],
        ['Frekvenciaátvitel', product.Frekvenciaátvitel],
        ['Érzékenység', product.Érzékenység]
    ];

    specsData.forEach((spec, index) => {
        const [title, value] = spec;
        const h3 = document.createElement('h3');
        h3.textContent = title;
        const p = document.createElement('p');
        p.textContent = value || '-';
        columns[index % 3].appendChild(h3);
        columns[index % 3].appendChild(p);
    });

    columns.forEach(col => productSpecs.appendChild(col));

    // Kosárba rakom gomb
    const addToCartBtn = document.createElement('button');
    addToCartBtn.classList.add('add-to-cart-btn');
    addToCartBtn.textContent = 'Kosárba rakom';

    // Összeállítás
    productInfo.appendChild(probaDiv);
    productInfo.appendChild(productSpecs);
    productInfo.appendChild(addToCartBtn);
    
    productDetail.appendChild(productImage);
    productDetail.appendChild(productInfo);
    container.appendChild(productDetail);
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
