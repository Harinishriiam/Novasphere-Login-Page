const form = document.getElementById('loginForm');
const inputs = form.querySelectorAll('input[type="email"], input[type="password"]');
const togglePasswordBtn = document.querySelector('.toggle-password');
const passwordInput = document.getElementById('password');
const bgLayers = document.querySelectorAll('.bg-layer');

const syncFloatingState = (input) => {
  input.classList.toggle('has-value', input.value.trim().length > 0);
};

inputs.forEach((input) => {
  syncFloatingState(input);

  input.addEventListener('input', () => {
    syncFloatingState(input);
    if (input.closest('.field-group')?.classList.contains('invalid') && input.value.trim()) {
      input.closest('.field-group')?.classList.remove('invalid');
    }
  });
});

form.addEventListener('submit', (event) => {
  event.preventDefault();
  let isValid = true;

  inputs.forEach((input) => {
    const group = input.closest('.field-group');
    const empty = !input.value.trim();
    group?.classList.toggle('invalid', empty);
    if (empty) isValid = false;
  });

  if (!isValid) {
    form.querySelector('.field-group.invalid input')?.focus();
    return;
  }

  form.reset();
  inputs.forEach((input) => syncFloatingState(input));
  alert('Login validated successfully. Connect this form to your backend authentication endpoint.');
});

togglePasswordBtn?.addEventListener('click', () => {
  const showing = passwordInput.type === 'text';
  passwordInput.type = showing ? 'password' : 'text';
  togglePasswordBtn.textContent = showing ? 'Show' : 'Hide';
  togglePasswordBtn.setAttribute('aria-label', showing ? 'Show password' : 'Hide password');
});

window.addEventListener('pointermove', (event) => {
  const { innerWidth, innerHeight } = window;
  const xRatio = (event.clientX / innerWidth - 0.5) * 2;
  const yRatio = (event.clientY / innerHeight - 0.5) * 2;

  bgLayers.forEach((layer, index) => {
    const depth = index === 0 ? 12 : 20;
    layer.style.setProperty('--tx', `${xRatio * depth}px`);
    layer.style.setProperty('--ty', `${yRatio * depth}px`);
  });
});
