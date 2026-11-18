'use strict';
(() => {
  const menuButton = document.querySelector('.menu-toggle');
  const menu = document.querySelector('.main-nav');
  const links = document.querySelectorAll('.nav-link');
  const closeMenu = () => {
    menu.classList.remove('open');
    menuButton.setAttribute('aria-expanded', 'false');
    menuButton.setAttribute('aria-label', 'Открыть меню');
  };
  menuButton?.addEventListener('click', () => {
    const opened = menu.classList.toggle('open');
    menuButton.setAttribute('aria-expanded', String(opened));
    menuButton.setAttribute('aria-label', opened ? 'Закрыть меню' : 'Открыть меню');
  });
  links.forEach((a) => a.addEventListener('click', closeMenu));
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeMenu(); });

  const sections = ['home','about','projects','contacts'].map((id) => document.getElementById(id)).filter(Boolean);
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(({target, isIntersecting}) => {
      if (isIntersecting) {
        links.forEach((a) => a.classList.toggle('active', a.getAttribute('href') === '#' + target.id));
      }
    });
  }, {rootMargin: '-25% 0px -60% 0px'});
  sections.forEach((section) => observer.observe(section));

  const form = document.getElementById('contact-form');
  const status = document.getElementById('form-status');
  const copyButton = document.getElementById('copy-message');
  const copyFallback = document.getElementById('copy-fallback');
  let prepared = '';
  form?.addEventListener('submit', (event) => {
    event.preventDefault();
    const name = form.elements.name.value.trim();
    const email = form.elements.email.value.trim();
    const message = form.elements.message.value.trim();
    const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    const valid = {
      'full-name': name.length > 0,
      'email': emailValid,
      'message': message.length >= 10,
    };
    Object.entries(valid).forEach(([id, ok]) => document.getElementById(id).setAttribute('aria-invalid', String(!ok)));
    if (Object.values(valid).some((ok) => !ok)) {
      status.className = 'form-status';
      status.textContent = 'Проверьте имя, email и сообщение: в email должен быть символ @, а текст сообщения — не короче 10 символов.';
      copyButton.hidden = true;
      copyFallback.hidden = true;
      return;
    }
    const subject = 'Сообщение с сайта Platon Robotics от ' + name;
    prepared = `Здравствуйте!

${message}

Имя: ${name}
Email: ${email}`;
    const mailto = 'mailto:platon.robotics.portfolio@mail.ru?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(prepared);
    status.className = 'form-status success';
    status.textContent = 'Сообщение подготовлено. Если почтовая программа не открылась, используйте кнопку копирования ниже.';
    copyButton.hidden = false;
    copyFallback.hidden = true;
    window.location.href = mailto;
  });

  copyButton?.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(prepared);
      status.textContent = 'Текст сообщения скопирован.';
      copyFallback.hidden = true;
    } catch (error) {
      copyFallback.value = prepared;
      copyFallback.hidden = false;
      copyFallback.focus();
      copyFallback.select();
      status.textContent = 'Автокопирование недоступно. Скопируйте текст из поля ниже вручную.';
    }
  });

  const dialog = document.getElementById('qr-dialog');
  const graphic = document.getElementById('qr-graphic');
  const qrURL = document.getElementById('qr-url');
  let currentSvg = '';
  document.getElementById('qr-open')?.addEventListener('click', () => {
    const url = 'https://platon-svg.github.io/';
    qrURL.textContent = url;
    if (!window.PortfolioQRCode) {
      graphic.textContent = 'Генератор QR недоступен';
      dialog.showModal();
      return;
    }
    try {
      currentSvg = window.PortfolioQRCode(url);
      graphic.innerHTML = currentSvg;
    } catch (error) {
      graphic.textContent = 'Не удалось создать QR-код';
      currentSvg = '';
    }
    dialog.showModal();
  });
  document.querySelector('.qr-close')?.addEventListener('click', () => dialog.close());
  dialog?.addEventListener('click', (event) => { if (event.target === dialog) dialog.close(); });
  document.getElementById('download-qr')?.addEventListener('click', () => {
    if (!currentSvg) return;
    const blob = new Blob([currentSvg], {type: 'image/svg+xml;charset=utf-8'});
    const fileURL = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = fileURL;
    link.download = 'platon-robotics-qr.svg';
    document.body.append(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(fileURL), 1000);
  });
})();
