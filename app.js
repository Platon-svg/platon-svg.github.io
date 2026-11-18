'use strict';
(() => {
  const menuButton = document.querySelector('.menu-toggle');
  const menu = document.querySelector('.main-nav');
  const links = document.querySelectorAll('.nav-link');
  const closeMenu = () => { menu.classList.remove('open'); menuButton.setAttribute('aria-expanded', 'false'); menuButton.setAttribute('aria-label', 'Открыть меню'); document.body.classList.remove('menu-open'); };
  menuButton.addEventListener('click', () => {
    const opened = menu.classList.toggle('open');
    menuButton.setAttribute('aria-expanded', String(opened));
    menuButton.setAttribute('aria-label', opened ? 'Закрыть меню' : 'Открыть меню');
    document.body.classList.toggle('menu-open', opened);
  });
  links.forEach((a) => a.addEventListener('click', closeMenu));
  document.addEventListener('keydown', (e) => {if(e.key === 'Escape') closeMenu();});
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(({target, isIntersecting}) => { if(isIntersecting) links.forEach((a) => a.classList.toggle('active', a.getAttribute('href') === '#' + target.id)); });
  }, {rootMargin:'-25% 0px -65% 0px'});
  ['home','about','works','contact'].forEach((id) => observer.observe(document.getElementById(id)));

  document.querySelectorAll('.filter-btn').forEach(btn => btn.addEventListener('click', () => {
    const filter = btn.dataset.filter;
    document.querySelectorAll('.filter-btn').forEach(item => { item.classList.toggle('is-active',item === btn);item.setAttribute('aria-pressed',String(item === btn)); });
    document.querySelectorAll('.project').forEach(item => item.hidden = !(filter === 'all' || item.dataset.category === filter));
  }));

  const form = document.querySelector('#contact-form');
  const status = document.querySelector('#form-status');
  const copyButton = document.querySelector('#copy-message');
  const copyFallback = document.querySelector('#copy-fallback');
  let prepared = '';
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const name = form.elements.name.value.trim();
    const email = form.elements.email.value.trim();
    const message = form.elements.message.value.trim();
    const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    const valid = { 'full-name': name.length > 0, 'email': emailValid, 'message': message.length >= 10 };
    Object.entries(valid).forEach(([id, ok]) => document.getElementById(id).setAttribute('aria-invalid', String(!ok)));
    if(Object.values(valid).some(ok => !ok)) {status.className='form-status';status.textContent='Проверьте имя, адрес электронной почты и сообщение (не менее 10 символов).';(document.querySelector('[aria-invalid="true"]')||form).focus();copyButton.hidden=true;copyFallback.hidden=true;return;}
    const subject = 'Новый проект от ' + name;
    prepared = `Здравствуйте!\n\n${message}\n\nОтправитель: ${name}\nE-mail: ${email}`;
    const mailto = 'mailto:hello@example.com?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(prepared);
    status.className='form-status success';
    status.textContent='Письмо подготовлено, но ещё не отправлено. Если почтовая программа не открылась, скопируйте текст кнопкой ниже.';
    copyButton.hidden=false;
    copyFallback.hidden=true;
    window.location.href = mailto;
  });
  copyButton.addEventListener('click', async () => {
    try {await navigator.clipboard.writeText(prepared);status.textContent='Текст письма скопирован. Отправьте его на hello@example.com.';copyFallback.hidden=true;}
    catch {copyFallback.value=prepared;copyFallback.hidden=false;copyFallback.focus();copyFallback.select();status.textContent='Автоматическое копирование недоступно. Текст письма выделен ниже, скопируйте его вручную.';}
  });

  const dialog = document.querySelector('#qr-dialog');
  const graphic = document.querySelector('#qr-graphic');
  const qrURL = document.querySelector('#qr-url');
  let currentSvg = '';
  document.querySelector('#qr-open').addEventListener('click', () => {
    const url = location.href.split('#')[0];
    qrURL.textContent = url;
    if (location.protocol !== 'https:') {graphic.textContent='QR-код будет доступен после публикации сайта по HTTPS.';currentSvg='';dialog.showModal();return;}
    if (!window.PortfolioQRCode) {graphic.textContent='Генератор QR недоступен';dialog.showModal();return;}
    try { currentSvg = window.PortfolioQRCode(url);graphic.innerHTML=currentSvg; }
    catch(e) {graphic.textContent='Не удалось создать QR-код'; currentSvg='';}
    dialog.showModal();
  });
  dialog.querySelector('.qr-close').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click',(event) => {if(event.target===dialog)dialog.close();});
  document.querySelector('#download-qr').addEventListener('click', () => {
    if(!currentSvg)return;
    const blob = new Blob([currentSvg],{type:'image/svg+xml;charset=utf-8'});
    const fileURL = URL.createObjectURL(blob);
    const link=document.createElement('a');link.href=fileURL;link.download='portfolio-qr-v2.svg';document.body.append(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(fileURL),1000);
  });
})();
