const btnLogout =document.getElementsByClassName ('icon-logout')[0];
const btnProfile =document.getElementsByClassName ('icon-user')[0];


btnLogout.addEventListener('click', ()=>{
    window.location.href='../webshop_frontend/index.html';
});

btnProfile.addEventListener('click', ()=>{
    window.location.href='../webshop_frontend/profile.html';
});