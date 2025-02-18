const btnLogout =document.getElementsByClassName ('icon-logout')[0];
const btnMenuLogo = document.getElementsByClassName('menu-logo')[0];
const btnCart =document.getElementsByClassName ('icon-cart')[0];


btnLogout.addEventListener('click', logout);
btnMenuLogo.addEventListener('click', ()=>{
    window.location.href='../webshop_frontend/home.html';
});

btnCart.addEventListener('click', ()=>{
    window.location.href='../webshop_frontend/cart.html';
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