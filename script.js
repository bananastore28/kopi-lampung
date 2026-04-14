// ============ LOADING SCREEN ============
window.addEventListener('load', () => {
    const loaderCounter = document.getElementById('loaderCounter');
    const loader = document.getElementById('loader');
    
    let progress = 0;
    const duration = 1800; 
    const intervalTime = 30;
    const increment = (100 / (duration / intervalTime));

    const counterInterval = setInterval(() => {
        progress += increment;
        if (progress >= 100) {
            progress = 100;
            clearInterval(counterInterval);
            setTimeout(() => {
                if (loader) loader.classList.add('hidden');
            }, 200);
        }
        if (loaderCounter) loaderCounter.innerText = Math.floor(progress) + '%';
    }, intervalTime);
});

// ============ AOS (Animate on Scroll) ============
AOS.init({
    once: false,
    mirror: true,
    offset: 40,
    duration: 900,
    easing: 'ease-out-quart',
});

// ============ THREE.JS 3D ENGINE ============
function initThreeJS() {
    const container = document.getElementById('three-canvas-container');
    if (!container) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    
    renderer.setSize(window.innerWidth, window.innerHeight);
    container.appendChild(renderer.domElement);

    // Create Wireframe Torus (The "Lingkaran")
    const geometry = new THREE.TorusGeometry(10, 3, 16, 100);
    const material = new THREE.MeshBasicMaterial({ 
        color: 0xC96614, 
        wireframe: true,
        transparent: true,
        opacity: 0.3
    });
    const torus = new THREE.Mesh(geometry, material);
    scene.add(torus);

    camera.position.z = 30;

    // Animation Loop
    function animate() {
        requestAnimationFrame(animate);
        torus.rotation.x += 0.005;
        torus.rotation.y += 0.005;
        renderer.render(scene, camera);
    }

    // Handle Resize
    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });

    // Mouse Interaction
    document.addEventListener('mousemove', (e) => {
        const mouseX = (e.clientX / window.innerWidth) - 0.5;
        const mouseY = (e.clientY / window.innerHeight) - 0.5;
        gsap.to(torus.rotation, {
            y: mouseX * 2.5,
            x: mouseY * 2.5,
            duration: 2,
            ease: "power2.out"
        });
    });

    animate();
}
initThreeJS();

// ============ GSAP ANIMATIONS ============
function initGSAP() {
    gsap.registerPlugin(ScrollTrigger);

    // Fade in sections on scroll
    gsap.from(".hero-content", {
        opacity: 0,
        y: 100,
        duration: 1.5,
        ease: "power4.out",
        delay: 0.5
    });

    // Smooth reveal for titles
    gsap.utils.toArray('.contact-title, .section-title').forEach(title => {
        gsap.from(title, {
            scrollTrigger: {
                trigger: title,
                start: "top 90%",
                toggleActions: "play none none reverse"
            },
            opacity: 0,
            x: -50,
            duration: 1,
            ease: "power2.out"
        });
    });
}
initGSAP();

// ============ NAVIGATION & SCROLL LOGIC ============
const mainContentNode = document.querySelector('.main-content');
const navbar = document.querySelector('.navbar');
const menuToggle = document.querySelector('#mobile-menu');
const navLinks = document.querySelector('.nav-links');
const scrollProgress = document.getElementById('scrollProgress');
const backToTop = document.getElementById('backToTop');

if (mainContentNode) {
    mainContentNode.addEventListener('scroll', () => {
        const scrollTop = mainContentNode.scrollTop;
        const scrollHeight = mainContentNode.scrollHeight - mainContentNode.clientHeight;
        
        // Navbar scrolled effect
        if (scrollTop > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }

        // Scroll Progress logic
        const progress = scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0;
        if (scrollProgress) scrollProgress.style.width = Math.min(progress, 100) + '%';
        
        // Back to top logic
        if (backToTop) {
            if (scrollTop > 500) {
                backToTop.classList.add('visible');
            } else {
                backToTop.classList.remove('visible');
            }
        }
    });

    if (backToTop) {
        backToTop.addEventListener('click', () => {
            mainContentNode.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }
}

// Mobile menu toggle
if (menuToggle) {
    menuToggle.addEventListener('click', () => {
        menuToggle.classList.toggle('is-active');
        navLinks.classList.toggle('active');
    });
}

document.querySelectorAll('.nav-links a').forEach(link => {
    link.addEventListener('click', () => {
        menuToggle.classList.remove('is-active');
        navLinks.classList.remove('active');
    });
});

// ============ SWIPERS ============

// Founder Swiper (Cards Effect)
const founderSwiper = new Swiper('.founderSwiper', {
    effect: 'cards',
    grabCursor: true,
    loop: true,
    cardsEffect: {
        perSlideOffset: 9,
        perSlideRotate: 3,
        rotate: true,
        slideShadows: true,
    },
    navigation: {
        nextEl: '.swiper-button-next',
        prevEl: '.swiper-button-prev',
    },
    pagination: {
        el: '.swiper-pagination',
        clickable: true,
    },
    autoplay: {
        delay: 4500,
        disableOnInteraction: false,
    },
    speed: 700,
});

// Gallery Swiper (Coverflow Effect)
const gallerySwiper = new Swiper('.gallerySwiper', {
    effect: 'coverflow',
    grabCursor: true,
    centeredSlides: true,
    slidesPerView: 'auto',
    coverflowEffect: {
        rotate: 25,
        stretch: 0,
        depth: 220,
        modifier: 1,
        slideShadows: true,
    },
    loop: true,
    pagination: {
        el: '.gallery-pagination',
        clickable: true,
    },
    navigation: {
        nextEl: '.gallery-next',
        prevEl: '.gallery-prev',
    },
    autoplay: {
        delay: 3000,
        disableOnInteraction: false,
    },
    speed: 700,
});

// Hero Swiper (Fade Effect)
const heroSwiper = new Swiper('.heroSwiper', {
    effect: 'fade',
    fadeEffect: { crossFade: true },
    loop: true,
    speed: 1600,
    autoplay: {
        delay: 5500,
        disableOnInteraction: false,
    },
    pagination: {
        el: '.hero-pagination',
        clickable: true,
    },
    on: {
        slideChangeTransitionStart: function () {
            AOS.refreshHard();
        }
    }
});

// ============ CUSTOM CURSOR ============
const cursor = document.querySelector('.custom-cursor');
const cursorGlow = document.querySelector('.custom-cursor-glow');

if (cursor && cursorGlow) {
    let mouseX = 0, mouseY = 0;
    let glowX = 0, glowY = 0;
    const lagFactor = 0.2; // Smoother and less laggy tracking

    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
        cursor.style.left = (mouseX - 4) + 'px';
        cursor.style.top  = (mouseY - 4) + 'px';
    });

    // Smooth trailing glow using requestAnimationFrame
    function animateGlow() {
        glowX += (mouseX - glowX) * lagFactor;
        glowY += (mouseY - glowY) * lagFactor;
        cursorGlow.style.left = (glowX - 18) + 'px';
        cursorGlow.style.top  = (glowY - 18) + 'px';
        requestAnimationFrame(animateGlow);
    }
    animateGlow();

    // Hover effect on interactive elements
    const hoverElements = document.querySelectorAll(
        'a, button, .swiper-button-next, .swiper-button-prev, .menu-toggle, .gallery-slide img, .tag'
    );
    hoverElements.forEach(el => {
        el.addEventListener('mouseenter', () => {
            cursor.classList.add('active');
            cursorGlow.classList.add('active');
        });
        el.addEventListener('mouseleave', () => {
            cursor.classList.remove('active');
            cursorGlow.classList.remove('active');
        });
    });
}

// ============ SECTION REVEAL ANIMATION ============
// Add staggered number counter for hero stats
function animateCounters() {
    const statNums = document.querySelectorAll('.stat-num');
    statNums.forEach(el => {
        const target = el.textContent.trim();
        if (!isNaN(parseInt(target))) {
            const num = parseInt(target);
            let current = 0;
            const increment = Math.ceil(num / 40);
            const timer = setInterval(() => {
                current += increment;
                if (current >= num) {
                    el.textContent = target; // Restore original (incl. "+")
                    clearInterval(timer);
                } else {
                    el.textContent = current;
                }
            }, 40);
        }
    });
}

// Trigger counter when hero is visible
const heroSection = document.getElementById('home');
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            setTimeout(animateCounters, 1500);
            observer.unobserve(entry.target);
        }
    });
}, { threshold: 0.5 });

if (heroSection) observer.observe(heroSection);

// ============ AUDIO PLAYER EXPERIMENTAL ============
const bgMusic = document.getElementById('bgMusic');
const musicToggle = document.getElementById('musicToggle');
let isPlaying = false;

function attemptAutoPlay() {
    if (!bgMusic) return;
    bgMusic.volume = 0.4;
    bgMusic.play().then(() => {
        isPlaying = true;
        if(musicToggle) musicToggle.classList.add('playing');
    }).catch(e => {
        // Autoplay diblokir oleh browser. Tunggu interaksi pertama pengguna (klik dimana saja)
        console.log('Autoplay ditahan browser. Menunggu klik pertama dari pengunjung...');
        document.body.addEventListener('click', function unlockAudio() {
            if(!isPlaying) {
                bgMusic.play();
                isPlaying = true;
                if(musicToggle) musicToggle.classList.add('playing');
            }
            // Hapus pendengar event setelah lagu menyala
            document.body.removeEventListener('click', unlockAudio);
        }, { once: true });
    });
}

if (bgMusic && musicToggle) {
    // Coba mainkan lagu langsung saat halaman dibuka
    attemptAutoPlay();
    
    musicToggle.addEventListener('click', (e) => {
        e.stopPropagation(); // Mencegah trigger klik pada body
        if (isPlaying) {
            bgMusic.pause();
            musicToggle.classList.remove('playing');
        } else {
            bgMusic.play().catch(e => console.log('Audio play failed:', e));
            musicToggle.classList.add('playing');
        }
        isPlaying = !isPlaying;
    });
}

// ============ ADVANCED UI EFFECTS (MAGNETIC & PARALLAX) ============

// 1. Cinematic Grain Overlay
const grain = document.createElement('div');
grain.className = 'grain-overlay';
document.body.appendChild(grain);

// 2. Magnetic Buttons
document.querySelectorAll('.btn').forEach(btn => {
    btn.addEventListener('mousemove', e => {
        const rect = btn.getBoundingClientRect();
        const x = (e.clientX - rect.left - rect.width/2) * 0.3; // magnetic pull strength
        const y = (e.clientY - rect.top - rect.height/2) * 0.3;
        btn.style.transform = `translate(${x}px, ${y}px)`;
    });
    
    btn.addEventListener('mouseleave', () => {
        btn.style.transform = `translate(0px, 0px)`;
    });
});

// 3. Gentle Parallax Hover for Founder Cards
document.querySelectorAll('.founder-slide').forEach(slide => {
    const img = slide.querySelector('.founder-img');
    const info = slide.querySelector('.founder-info');
    
    slide.addEventListener('mousemove', e => {
        const rect = slide.getBoundingClientRect();
        // Calculate mouse position relative to center of slide
        const x = (e.clientX - rect.left - rect.width/2) / 25;
        const y = (e.clientY - rect.top - rect.height/2) / 25;
        
        if(img) img.style.transform = `translate3d(${x}px, ${y}px, 0) scale(1.02)`;
        if(info) info.style.transform = `translate3d(${-x*1.5}px, ${-y*1.5}px, 0)`;
    });
    
    slide.addEventListener('mouseleave', () => {
        if(img) img.style.transform = '';
        if(info) info.style.transform = '';
    });
});

// ============ SMOOTH SCROLL FOR NAV LINKS ============
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        const href = this.getAttribute('href');
        if (href === '#') return;
        const target = document.querySelector(href);
        if (target) {
            e.preventDefault();
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    });
});

// ============ LIVE GUESTBOOK ============
function escapeHtml(str) {
    return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

async function loadGuestbook() {
    const container = document.getElementById('guestbookMessages');
    if (!container) return;
    try {
        const res = await fetch('/api/messages');
        const data = await res.json();
        const messages = data.messages || [];
        if (messages.length === 0) {
            container.innerHTML = '<div class="gb-empty">BELUM ADA PESAN. JADILAH YANG PERTAMA!</div>';
            return;
        }
        container.innerHTML = messages.map(m => `
            <div class="gb-message">
                <div class="gb-nama">${escapeHtml(m.nama)}</div>
                <div class="gb-pesan">${escapeHtml(m.pesan)}</div>
            </div>
        `).join('');
    } catch {
        const container = document.getElementById('guestbookMessages');
        if (container) container.innerHTML = '<div class="gb-empty">Jalankan server untuk melihat pesan.</div>';
    }
}

const contactForm = document.getElementById('contactForm');
const formFeedback = document.getElementById('formFeedback');
const submitBtn = document.getElementById('submitBtn');

if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const nama = document.getElementById('formNama').value;
        const pesan = document.getElementById('formPesan').value;
        submitBtn.disabled = true;
        submitBtn.textContent = 'MENGIRIM...';
        if (formFeedback) { formFeedback.textContent = ''; formFeedback.className = 'form-feedback'; }
        try {
            const res = await fetch('/api/messages', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ nama, pesan })
            });
            const data = await res.json();
            if (res.ok) {
                if (formFeedback) { formFeedback.textContent = '✓ Pesan terkirim! Terima kasih.'; formFeedback.className = 'form-feedback success'; }
                contactForm.reset();
                loadGuestbook(); // Reload guestbook after sending
            } else {
                if (formFeedback) { formFeedback.textContent = data.error || 'Gagal mengirim.'; formFeedback.className = 'form-feedback error'; }
            }
        } catch {
            if (formFeedback) { formFeedback.textContent = 'Server belum berjalan. Jalankan dulu: node server.js'; formFeedback.className = 'form-feedback error'; }
        }
        submitBtn.disabled = false;
        submitBtn.innerHTML = `<svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg> KIRIM PESAN`;
    });
}

// Load guestbook on page ready
loadGuestbook();
