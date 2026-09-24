function showForm(id) {
    const sections = document.querySelectorAll('.container > form, .container > div[id]');
    sections.forEach((section) => section.classList.remove('active'));
    const target = document.getElementById(id);
    if (target) {
        target.classList.add('active');
    }
}

function formFromLocation() {
    const path = window.location.pathname.replace(/\/$/, '') || '/';
    if (path === '/login') {
        return 'login';
    }
    if (path === '/register') {
        return 'register';
    }
    const hash = window.location.hash.replace('#', '');
    if (hash && document.getElementById(hash)) {
        return hash;
    }
    return 'register';
}

document.addEventListener('DOMContentLoaded', () => {
    showForm(formFromLocation());
});
