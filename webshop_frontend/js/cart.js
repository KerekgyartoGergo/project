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

        const deleteButton = document.createElement('button');
        deleteButton.classList.add('card-delete');
        deleteButton.textContent = 'Törlés';

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