function showForm(id) {
    const sections = document.querySelectorAll('.container > form, .container > div[id]');
    sections.forEach(section => section.style.display = 'none');
    document.getElementById(id).style.display = 'block';
}