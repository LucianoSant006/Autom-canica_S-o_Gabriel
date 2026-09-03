(() => {
  const menuButton = document.querySelector('.menu-toggle');
  const navigation = document.querySelector('.main-nav');

  function closeMenu() {
    navigation?.classList.remove('open');
    menuButton?.setAttribute('aria-expanded', 'false');
    menuButton?.setAttribute('aria-label', 'Abrir menu');
    document.body.classList.remove('menu-open');
  }

  menuButton?.addEventListener('click', () => {
    const isOpen = menuButton.getAttribute('aria-expanded') === 'true';
    menuButton.setAttribute('aria-expanded', String(!isOpen));
    menuButton.setAttribute('aria-label', isOpen ? 'Abrir menu' : 'Fechar menu');
    navigation.classList.toggle('open', !isOpen);
    document.body.classList.toggle('menu-open', !isOpen);
  });
  navigation?.querySelectorAll('a').forEach((link) => link.addEventListener('click', closeMenu));
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closeMenu();
  });

  const carousel = document.querySelector('.carousel');
  const slides = [...document.querySelectorAll('.slide')];
  const dotsContainer = document.querySelector('.carousel-dots');
  let currentSlide = 0;
  let autoplay;
  let touchStart = 0;

  function showSlide(index) {
    currentSlide = (index + slides.length) % slides.length;
    slides.forEach((slide, slideIndex) => {
      const active = slideIndex === currentSlide;
      slide.classList.toggle('active', active);
      slide.setAttribute('aria-hidden', String(!active));
    });
    dotsContainer?.querySelectorAll('button').forEach((dot, dotIndex) => {
      dot.setAttribute('aria-current', String(dotIndex === currentSlide));
    });
  }

  slides.forEach((_, index) => {
    const dot = document.createElement('button');
    dot.type = 'button';
    dot.setAttribute('aria-label', `Mostrar imagem ${index + 1} de ${slides.length}`);
    dot.addEventListener('click', () => showSlide(index));
    dotsContainer?.appendChild(dot);
  });
  showSlide(0);

  function stopAutoplay() { window.clearInterval(autoplay); }
  function startAutoplay() {
    stopAutoplay();
    if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      autoplay = window.setInterval(() => showSlide(currentSlide + 1), 5000);
    }
  }
  document.querySelector('.carousel-control.prev')?.addEventListener('click', () => showSlide(currentSlide - 1));
  document.querySelector('.carousel-control.next')?.addEventListener('click', () => showSlide(currentSlide + 1));
  carousel?.addEventListener('mouseenter', stopAutoplay);
  carousel?.addEventListener('mouseleave', startAutoplay);
  carousel?.addEventListener('focusin', stopAutoplay);
  carousel?.addEventListener('focusout', startAutoplay);
  carousel?.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowLeft') showSlide(currentSlide - 1);
    if (event.key === 'ArrowRight') showSlide(currentSlide + 1);
  });
  carousel?.addEventListener('touchstart', (event) => { touchStart = event.changedTouches[0].clientX; }, { passive: true });
  carousel?.addEventListener('touchend', (event) => {
    const distance = event.changedTouches[0].clientX - touchStart;
    if (Math.abs(distance) > 45) showSlide(currentSlide + (distance < 0 ? 1 : -1));
  }, { passive: true });
  startAutoplay();

  const serviceSelect = document.querySelector('[name="servico"]');
  document.querySelectorAll('[data-service]').forEach((link) => {
    link.addEventListener('click', () => {
      if (serviceSelect) serviceSelect.value = link.dataset.service;
    });
  });

  const form = document.querySelector('#quote-form');
  form?.addEventListener('submit', (event) => {
    event.preventDefault();
    const fields = [...form.querySelectorAll('[required]')];
    let isValid = true;

    fields.forEach((field) => {
      const valid = field.value.trim().length > 0;
      field.classList.toggle('invalid', !valid);
      field.setAttribute('aria-invalid', String(!valid));
      const error = field.parentElement.querySelector('small');
      if (error) error.textContent = valid ? '' : 'Preencha este campo.';
      if (!valid) isValid = false;
    });

    if (!isValid) {
      form.querySelector('.invalid')?.focus();
      return;
    }

    const data = new FormData(form);
    const message = [
      'Olá! Encontrei a Auto Mecânica São Gabriel pelo site e gostaria de solicitar um orçamento.',
      '',
      `Nome: ${data.get('nome')}`,
      `Telefone: ${data.get('telefone')}`,
      `Veículo: ${data.get('veiculo')}`,
      `Serviço: ${data.get('servico')}`,
      `Mensagem: ${data.get('mensagem')}`
    ].join('\n');
    window.open(`https://wa.me/5519991339760?text=${encodeURIComponent(message)}`, '_blank', 'noopener,noreferrer');
  });

  form?.querySelectorAll('[required]').forEach((field) => {
    field.addEventListener('input', () => {
      if (field.value.trim()) {
        field.classList.remove('invalid');
        field.setAttribute('aria-invalid', 'false');
        const error = field.parentElement.querySelector('small');
        if (error) error.textContent = '';
      }
    });
  });
})();
