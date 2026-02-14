const state = {
  generatedOtp: '',
  countdown: 60,
  timerId: null,
  resendAttempts: 0,
  maxResendAttempts: 3,
};

const tabs = document.querySelectorAll('.toggle-tab');
const panels = document.querySelectorAll('.auth-panel');
const bgLayers = document.querySelectorAll('.bg-layer');

const passwordForm = document.getElementById('passwordForm');
const togglePasswordBtn = document.querySelector('.toggle-password');
const passwordInput = document.getElementById('password');

const otpForm = document.getElementById('otpForm');
const otpIdentity = document.getElementById('otpIdentity');
const otpStep = document.getElementById('otpStep');
const otpStatus = document.getElementById('otpStatus');
const sendOtpBtn = document.getElementById('sendOtpBtn');
const resendOtpBtn = document.getElementById('resendOtpBtn');
const verifyOtpBtn = document.getElementById('verifyOtpBtn');
const countdownText = document.getElementById('countdownText');
const resendHint = document.getElementById('resendHint');
const otpDigits = Array.from(document.querySelectorAll('.otp-digit'));

const textInputs = document.querySelectorAll('input[type="email"], input[type="password"], input[type="text"]');

const syncFloatingState = (input) => {
  input.classList.toggle('has-value', input.value.trim().length > 0);
};

const setStatus = (message, mode = '') => {
  otpStatus.textContent = message;
  otpStatus.classList.remove('success', 'error');
  if (mode) otpStatus.classList.add(mode);
};

const setInvalid = (input, invalid) => {
  input.closest('.field-group')?.classList.toggle('invalid', invalid);
};

const maskPreview = (otp) => `••••${otp.slice(-2)}`;

const generateOtp = () => String(Math.floor(100000 + Math.random() * 900000));

const isValidIdentity = (value) => {
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const mobilePattern = /^\+?[0-9]{8,15}$/;
  return emailPattern.test(value) || mobilePattern.test(value.replace(/\s+/g, ''));
};

const resetOtpInputs = () => {
  otpDigits.forEach((input) => {
    input.value = '';
    input.classList.remove('invalid');
  });
};

const startCountdown = () => {
  clearInterval(state.timerId);
  state.countdown = 60;
  resendOtpBtn.disabled = true;

  state.timerId = setInterval(() => {
    state.countdown -= 1;
    countdownText.textContent = state.countdown > 0 ? `Resend available in ${state.countdown}s` : 'You can resend OTP now';

    if (state.countdown <= 0) {
      clearInterval(state.timerId);
      const limitReached = state.resendAttempts >= state.maxResendAttempts;
      resendOtpBtn.disabled = limitReached;
      if (limitReached) countdownText.textContent = 'Resend limit reached';
    }
  }, 1000);
};

const sendOtp = () => {
  const identityValue = otpIdentity.value.trim();
  const valid = isValidIdentity(identityValue);
  setInvalid(otpIdentity, !valid);

  if (!valid) {
    setStatus('Enter a valid email or mobile number to receive OTP.', 'error');
    otpIdentity.focus();
    return;
  }

  // Frontend-only demo OTP generation.
  state.generatedOtp = generateOtp();
  setStatus(`OTP sent successfully. Demo masked code: ${maskPreview(state.generatedOtp)}`, 'success');
  console.info('[Demo OTP] Use this code for verification:', state.generatedOtp);

  otpStep.classList.add('is-visible');
  otpStep.setAttribute('aria-hidden', 'false');

  resetOtpInputs();
  otpDigits[0]?.focus();
  startCountdown();
};

const switchTab = (mode) => {
  tabs.forEach((tab) => {
    const active = tab.id === `tab-${mode}`;
    tab.classList.toggle('is-active', active);
    tab.setAttribute('aria-selected', String(active));
  });

  panels.forEach((panel) => {
    const active = panel.id === `${mode}-panel`;
    panel.classList.toggle('is-active', active);
    panel.setAttribute('aria-hidden', String(!active));
  });
};

const validatePasswordForm = () => {
  const email = document.getElementById('email');
  const pwd = document.getElementById('password');
  const emailValid = isValidIdentity(email.value.trim()) && email.value.includes('@');
  const passValid = pwd.value.trim().length >= 1;

  setInvalid(email, !emailValid);
  setInvalid(pwd, !passValid);

  if (!emailValid) {
    email.focus();
    return false;
  }

  if (!passValid) {
    pwd.focus();
    return false;
  }

  alert('Password login validated. Connect to your backend auth endpoint.');
  passwordForm.reset();
  [email, pwd].forEach(syncFloatingState);
  return true;
};

const getEnteredOtp = () => otpDigits.map((d) => d.value).join('');

const verifyOtp = () => {
  const entered = getEnteredOtp();

  if (entered.length < 6 || /\D/.test(entered)) {
    setStatus('Please enter the complete 6-digit OTP.', 'error');
    otpStep.classList.add('shake');
    setTimeout(() => otpStep.classList.remove('shake'), 360);
    otpDigits.find((d) => !d.value)?.focus();
    return;
  }

  if (entered !== state.generatedOtp) {
    setStatus('Incorrect OTP. Please try again.', 'error');
    otpStep.classList.add('shake');
    setTimeout(() => otpStep.classList.remove('shake'), 360);
    otpDigits.forEach((d) => d.classList.add('invalid'));
    otpDigits[0]?.focus();
    return;
  }

  setStatus('OTP verified successfully. Secure login complete.', 'success');
  otpStep.classList.add('verified');
  setTimeout(() => otpStep.classList.remove('verified'), 550);
};

textInputs.forEach((input) => {
  syncFloatingState(input);
  input.addEventListener('input', () => {
    syncFloatingState(input);
    input.closest('.field-group')?.classList.remove('invalid');
  });
});

passwordForm.addEventListener('submit', (event) => {
  event.preventDefault();
  validatePasswordForm();
});

togglePasswordBtn?.addEventListener('click', () => {
  const showing = passwordInput.type === 'text';
  passwordInput.type = showing ? 'password' : 'text';
  togglePasswordBtn.textContent = showing ? 'Show' : 'Hide';
  togglePasswordBtn.setAttribute('aria-label', showing ? 'Show password' : 'Hide password');
});

tabs.forEach((tab) => {
  tab.addEventListener('click', () => {
    const mode = tab.id.replace('tab-', '');
    switchTab(mode);
  });
});

sendOtpBtn.addEventListener('click', sendOtp);

resendOtpBtn.addEventListener('click', () => {
  if (state.resendAttempts >= state.maxResendAttempts) return;
  state.resendAttempts += 1;
  resendHint.textContent = `Resend attempts left: ${Math.max(state.maxResendAttempts - state.resendAttempts, 0)}`;
  sendOtp();
  if (state.resendAttempts >= state.maxResendAttempts) {
    resendOtpBtn.disabled = true;
  }
});

otpForm.addEventListener('submit', (event) => {
  event.preventDefault();
  verifyOtp();
});

otpDigits.forEach((input, index) => {
  input.addEventListener('input', () => {
    input.value = input.value.replace(/\D/g, '').slice(0, 1);
    input.classList.remove('invalid');
    if (input.value && index < otpDigits.length - 1) {
      otpDigits[index + 1].focus();
    }
  });

  input.addEventListener('keydown', (event) => {
    if (event.key === 'Backspace' && !input.value && index > 0) {
      otpDigits[index - 1].focus();
    }

    if (event.key === 'ArrowLeft' && index > 0) otpDigits[index - 1].focus();
    if (event.key === 'ArrowRight' && index < otpDigits.length - 1) otpDigits[index + 1].focus();
  });

  input.addEventListener('paste', (event) => {
    event.preventDefault();
    const pasted = (event.clipboardData?.getData('text') || '').replace(/\D/g, '').slice(0, 6);
    pasted.split('').forEach((char, charIndex) => {
      if (otpDigits[charIndex]) otpDigits[charIndex].value = char;
    });
    const nextIndex = Math.min(pasted.length, otpDigits.length - 1);
    otpDigits[nextIndex]?.focus();
  });
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
