function showForm(id) {
  const sections = document.querySelectorAll('.container > form, .container > div[id]');
  sections.forEach(section => section.classList.remove('active'));
  const target = document.getElementById(id);
  if (target) target.classList.add('active');
}

window.addEventListener('DOMContentLoaded', () => {
  showForm('register');
});