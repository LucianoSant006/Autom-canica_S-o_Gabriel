// MENU MOBILE
const menu = document.querySelector(".menu");
const menuBtn = document.querySelector(".menu-btn");
const closeBtn = document.querySelector(".close-btn");
const menuLinks = document.querySelectorAll(".menu a");

const toggleMenu = () => {
    menu.classList.toggle("active");
};

if(menuBtn) menuBtn.addEventListener("click", toggleMenu);
if(closeBtn) closeBtn.addEventListener("click", toggleMenu);

// Fechar menu ao clicar em links
menuLinks.forEach(link => {
    link.addEventListener("click", () => {
        menu.classList.remove("active");
    });
});

// NAVBAR STICKY (Fundo do menu aparece ao rolar)
const navbar = document.querySelector("nav");
window.addEventListener("scroll", () => {
    if(navbar) navbar.classList.toggle("sticky", window.scrollY > 0);
});

// --- REMOVIDO: SMOOTH SCROLL (Lenis) ---
// --- REMOVIDO: SCROLL REVEAL (Animações/Zoom) ---
// --- REMOVIDO: GSAP (Animação de Texto) ---

// HIGHLIGHT MENU ATIVO (SCROLLSPY)
// Destaca o link do menu correspondente à seção visível
const sections = document.querySelectorAll("section[id]"); 

window.addEventListener("scroll", () => {
    let scrollY = window.pageYOffset;
    
    sections.forEach(current => {
        const sectionHeight = current.offsetHeight;
        const sectionTop = current.offsetTop - 150; 
        const sectionId = current.getAttribute("id");
        const menuLink = document.querySelector(`.menu a[href*=${sectionId}]`);

        if(menuLink) {
            if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
                menuLink.classList.add("active-link");
            } else {
                menuLink.classList.remove("active-link");
            }
        }
    });
});

// FLIP CARD NO MOBILE (CLIQUE)
const cards = document.querySelectorAll('.flip-card');
cards.forEach(card => {
    card.addEventListener('click', () => {
        // Remove a classe de outros cards
        cards.forEach(c => {
            if(c !== card) c.querySelector('.flip-card-inner').classList.remove('flipped-mobile');
        });
        // Alterna no card atual
        card.querySelector('.flip-card-inner').classList.toggle('flipped-mobile');
    });
});

// INTERAÇÃO DO MODO AUTOMÁTICO (Mindfulness)
document.addEventListener("DOMContentLoaded", () => {
    const switchEl = document.getElementById("automaticModeSwitch");
    const sectionEl = document.getElementById("mindfulness");
    const messageEl = document.getElementById("mindfulness-message");
    const statusText = document.getElementById("switch-status-text");

    if(switchEl) {
        let isOff = false; 

        switchEl.addEventListener("click", () => {
            isOff = !isOff; 

            if (isOff) {
                switchEl.classList.add("switched-off");
                sectionEl.classList.add("calm-mode");
                statusText.innerText = "MODO AUTOMÁTICO: DESLIGADO";
                statusText.style.color = "#fff"; 
                setTimeout(() => {
                    messageEl.classList.add("visible");
                }, 300);
            } else {
                switchEl.classList.remove("switched-off");
                sectionEl.classList.remove("calm-mode");
                statusText.innerText = "MODO AUTOMÁTICO: LIGADO";
                statusText.style.color = "#2C3E50"; 
                messageEl.classList.remove("visible");
            }
        });
    }
});