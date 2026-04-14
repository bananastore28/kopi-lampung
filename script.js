// ============ PAGE TRANSITIONS ============
function initTransitions() {
    const overlay = document.querySelector('.page-transition-overlay');
    
    // Page load fade-in
    window.addEventListener('load', () => {
        if (overlay) {
            overlay.style.opacity = '1';
            setTimeout(() => {
                overlay.style.opacity = '0';
            }, 50);
        }
    });

    // Link click fade-out
    document.querySelectorAll('a').forEach(link => {
        // Only target internal links
        if (link.hostname === window.location.hostname && 
            !link.hash && 
            !link.getAttribute('target')) {
            
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const destination = link.href;
                if(overlay) {
                    overlay.classList.add('active');
                    overlay.style.opacity = '1';
                }
                
                // Save audio state before leaving
                saveAudioState();
                
                setTimeout(() => {
                    window.location.href = destination;
                }, 600);
            });
        }
    });
}

// ============ AUDIO PERSISTENCE ============
function saveAudioState() {
    const bgMusic = document.getElementById('bgMusic');
    if (bgMusic) {
        localStorage.setItem('ls_audio_time', bgMusic.currentTime);
        localStorage.setItem('ls_audio_playing', !bgMusic.paused);
    }
}

function restoreAudioState() {
    const bgMusic = document.getElementById('bgMusic');
    const musicToggle = document.getElementById('musicToggle');
    if (!bgMusic) return;

    const savedTime = localStorage.getItem('ls_audio_time');
    const wasPlaying = localStorage.getItem('ls_audio_playing') === 'true';

    if (savedTime) bgMusic.currentTime = parseFloat(savedTime);
    
    bgMusic.volume = 0.4;

    if (wasPlaying) {
        // Autoplay policy usually requires interaction. 
        // We'll try to play, if fails, wait for first click.
        bgMusic.play().then(() => {
            if(musicToggle) musicToggle.classList.add('playing');
        }).catch(() => {
            document.body.addEventListener('click', () => {
                if (bgMusic.paused) {
                    bgMusic.play();
                    if(musicToggle) musicToggle.classList.add('playing');
                }
            }, { once: true });
        });
    }
}

// ============ LOADING SCREEN (Only on Home) ============
function initLoader() {
    const loaderCounter = document.getElementById('loaderCounter');
    const loader = document.getElementById('loader');
    if (!loader) return;
    
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
                loader.classList.add('hidden');
            }, 200);
        }
        if (loaderCounter) loaderCounter.innerText = Math.floor(progress) + '%';
    }, intervalTime);
}

// ============ THREE.JS 3D ENGINE (Hero) ============
function initThreeJS() {
    const container = document.getElementById('three-canvas-container');
    if (!container) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    
    renderer.setSize(window.innerWidth, window.innerHeight);
    container.appendChild(renderer.domElement);

    const geometry = new THREE.TorusGeometry(10, 3, 16, 100);
    const material = new THREE.MeshBasicMaterial({ color: 0xC96614, wireframe: true, transparent: true, opacity: 0.3 });
    const torus = new THREE.Mesh(geometry, material);
    scene.add(torus);

    camera.position.z = 30;

    function animate() {
        requestAnimationFrame(animate);
        torus.rotation.x += 0.005;
        torus.rotation.y += 0.005;
        renderer.render(scene, camera);
    }
    animate();

    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });

    document.addEventListener('mousemove', (e) => {
        const mouseX = (e.clientX / window.innerWidth) - 0.5;
        const mouseY = (e.clientY / window.innerHeight) - 0.5;
        gsap.to(torus.rotation, { y: mouseX * 2.5, x: mouseY * 2.5, duration: 2, ease: "power2.out" });
    });
}

// ============ GLOBAL SCROLL LOGIC ============
function initScroll() {
    const navbar = document.querySelector('.navbar');
    const scrollProgress = document.getElementById('scrollProgress');
    const backToTop = document.getElementById('backToTop');

    window.addEventListener('scroll', () => {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        
        if (scrollTop > 50) navbar?.classList.add('scrolled');
        else navbar?.classList.remove('scrolled');

        const progress = scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0;
        if (scrollProgress) scrollProgress.style.width = Math.min(progress, 100) + '%';
        
        if (backToTop) {
            if (scrollTop > 500) backToTop.classList.add('visible');
            else backToTop.classList.remove('visible');
        }
    });

    backToTop?.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
}

// ============ SWIPERS INITIALIZATION ============
function initSwipers() {
    if (document.querySelector('.heroSwiper')) {
        new Swiper('.heroSwiper', {
            effect: 'fade',
            fadeEffect: { crossFade: true },
            loop: true,
            speed: 1600,
            autoplay: { delay: 5500, disableOnInteraction: false },
            pagination: { el: '.hero-pagination', clickable: true }
        });
    }

    if (document.querySelector('.founderSwiper')) {
        new Swiper('.founderSwiper', {
            effect: 'cards',
            grabCursor: true,
            loop: true,
            cardsEffect: { perSlideOffset: 9, perSlideRotate: 3, rotate: true, slideShadows: true },
            navigation: { nextEl: '.swiper-button-next', prevEl: '.swiper-button-prev' },
            pagination: { el: '.swiper-pagination', clickable: true },
            autoplay: { delay: 4500, disableOnInteraction: false },
            speed: 700
        });
    }

    if (document.querySelector('.gallerySwiper')) {
        new Swiper('.gallerySwiper', {
            effect: 'coverflow',
            grabCursor: true,
            centeredSlides: true,
            slidesPerView: 'auto',
            coverflowEffect: { rotate: 25, stretch: 0, depth: 220, modifier: 1, slideShadows: true },
            loop: true,
            pagination: { el: '.gallery-pagination', clickable: true },
            navigation: { nextEl: '.gallery-next', prevEl: '.gallery-prev' },
            autoplay: { delay: 3000, disableOnInteraction: false },
            speed: 700
        });
    }
}

// ============ GUESTBOOK & FORM ============
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
                <div class="gb-nama">${String(m.nama).replace(/</g, '&lt;')}</div>
                <div class="gb-pesan">${String(m.pesan).replace(/</g, '&lt;')}</div>
            </div>
        `).join('');
    } catch {
        container.innerHTML = '<div class="gb-empty">Jalankan server untuk melihat pesan.</div>';
    }
}

// ============ INITIALIZE EVERYTHING ============
document.addEventListener('DOMContentLoaded', () => {
    AOS.init({ once: false, mirror: true, offset: 40, duration: 900, easing: 'ease-out-quart' });
    initTransitions();
    initLoader();
    initThreeJS();
    initScroll();
    initSwipers();
    restoreAudioState();
    loadGuestbook();

    // Mobile menu logic
    const menuToggle = document.querySelector('#mobile-menu');
    const navLinks = document.querySelector('.nav-links');
    menuToggle?.addEventListener('click', () => {
        menuToggle.classList.toggle('is-active');
        navLinks?.classList.toggle('active');
    });

    // Custom Cursor
    const cursor = document.querySelector('.custom-cursor');
    const cursorGlow = document.querySelector('.custom-cursor-glow');
    if (cursor && cursorGlow) {
        document.addEventListener('mousemove', (e) => {
            cursor.style.left = e.clientX + 'px';
            cursor.style.top = e.clientY + 'px';
            cursorGlow.style.left = e.clientX + 'px';
            cursorGlow.style.top = e.clientY + 'px';
        });
    }

    // Music Toggle
    const musicToggle = document.getElementById('musicToggle');
    const bgMusic = document.getElementById('bgMusic');
    musicToggle?.addEventListener('click', () => {
        if (!bgMusic) return;
        if (bgMusic.paused) {
            bgMusic.play();
            musicToggle.classList.add('playing');
        } else {
            bgMusic.pause();
            musicToggle.classList.remove('playing');
        }
        localStorage.setItem('ls_audio_playing', !bgMusic.paused);
    });

    // Form logic
    const contactForm = document.getElementById('contactForm');
    contactForm?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const nama = document.getElementById('formNama').value;
        const pesan = document.getElementById('formPesan').value;
        const submitBtn = document.getElementById('submitBtn');
        const feedback = document.getElementById('formFeedback');
        
        submitBtn.disabled = true;
        submitBtn.innerText = 'MENGIRIM...';

        try {
            const res = await fetch('/api/messages', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ nama, pesan })
            });
            if (res.ok) {
                feedback.innerText = 'Pesan terkirim!';
                contactForm.reset();
                loadGuestbook();
            }
        } catch (err) {
            feedback.innerText = 'Gagal mengirim.';
        }
        submitBtn.disabled = false;
        submitBtn.innerText = 'KIRIM PESAN';
    });
});
