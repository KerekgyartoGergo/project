const iconHome = document.getElementsByClassName('icon-home')[0];
const iconLogout = document.getElementsByClassName('icon-logout')[0];
const btnPic = document.getElementsByClassName('edit-pic')[0];
const btnName = document.getElementById('editName');
const btnPsw = document.getElementById('editPsw');
window.addEventListener('DOMContentLoaded', getProfiePic);

iconHome.addEventListener('click', () => {
    window.location.href = '../home.html';
});

iconLogout.addEventListener('click',logout);
btnPic.addEventListener('click', () => {
    window.location.href = '../profilePic.html';
});

btnName.addEventListener('click', () => {
    window.location.href = '../profileName.html';
});

btnPsw.addEventListener('click', () => {
    window.location.href = '../profilePsw.html';
});

async function logout() {
    const res = await fetch('http://127.0.0.1:3000/api/logout',{
        method: 'POST',
        credentials: 'include'
    });

    const data = await res.json();

    if (res.ok) {
        alert(data.message);
        window.location.href = '../index.html';
    } else {
        alert('Hiba a kijelentkezéskor!')
    }
}

// a profilkép megjelenítése
async function getProfiePic() {
    const res = await fetch('http://127.0.0.1:3000/api/getProfilePic', {
        method: 'GET',
        credentials: 'include'
    });

    const data = await res.json();
    console.log(data);

    if (res.ok) {
        btnPic.style.backgroundImage = `url('http://127.0.0.1:3000/uploads/${data[0].profile_pic}')`;
    }
}

