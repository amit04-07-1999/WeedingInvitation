// ===== MAIN JAVASCRIPT =====
document.addEventListener('DOMContentLoaded', function () {

    // ===== FLOATING GOLDEN PARTICLES =====
    const particlesCanvas = document.getElementById('particles-canvas');
    const pCtx = particlesCanvas.getContext('2d');
    let particles = [];

    function resizeParticlesCanvas() {
        particlesCanvas.width = window.innerWidth;
        particlesCanvas.height = window.innerHeight;
    }
    resizeParticlesCanvas();
    window.addEventListener('resize', resizeParticlesCanvas);

    class Particle {
        constructor() {
            this.reset();
        }
        reset() {
            this.x = Math.random() * particlesCanvas.width;
            this.y = Math.random() * particlesCanvas.height;
            this.size = Math.random() * 3 + 0.5;
            this.speedX = (Math.random() - 0.5) * 0.5;
            this.speedY = -Math.random() * 0.8 - 0.2;
            this.opacity = Math.random() * 0.6 + 0.1;
            this.fadeSpeed = Math.random() * 0.005 + 0.002;
            this.growing = Math.random() > 0.5;
        }
        update() {
            this.x += this.speedX;
            this.y += this.speedY;
            if (this.growing) {
                this.opacity += this.fadeSpeed;
                if (this.opacity >= 0.7) this.growing = false;
            } else {
                this.opacity -= this.fadeSpeed;
                if (this.opacity <= 0) this.reset();
            }
            if (this.y < -10 || this.x < -10 || this.x > particlesCanvas.width + 10) {
                this.reset();
                this.y = particlesCanvas.height + 10;
            }
        }
        draw() {
            pCtx.beginPath();
            pCtx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            pCtx.fillStyle = `rgba(212, 168, 83, ${this.opacity})`;
            pCtx.fill();
            pCtx.beginPath();
            pCtx.arc(this.x, this.y, this.size * 2, 0, Math.PI * 2);
            pCtx.fillStyle = `rgba(255, 215, 0, ${this.opacity * 0.2})`;
            pCtx.fill();
        }
    }

    function initParticles() {
        const count = window.innerWidth < 768 ? 40 : 80;
        particles = [];
        for (let i = 0; i < count; i++) {
            particles.push(new Particle());
        }
    }
    initParticles();

    function animateParticles() {
        pCtx.clearRect(0, 0, particlesCanvas.width, particlesCanvas.height);
        particles.forEach(p => {
            p.update();
            p.draw();
        });
        requestAnimationFrame(animateParticles);
    }
    animateParticles();

    // ===== MUSIC TOGGLE =====
    const musicBtn = document.getElementById('music-toggle');
    const bgMusic = document.getElementById('bg-music');
    const iconOn = document.getElementById('music-icon-on');
    const iconOff = document.getElementById('music-icon-off');
    let musicPlaying = false;

    bgMusic.volume = 0.3;

    musicBtn.addEventListener('click', function () {
        if (musicPlaying) {
            bgMusic.pause();
            iconOn.classList.add('hidden');
            iconOff.classList.remove('hidden');
            musicPlaying = false;
        } else {
            bgMusic.play().catch(() => {});
            iconOn.classList.remove('hidden');
            iconOff.classList.add('hidden');
            musicPlaying = true;
        }
    });

    // Try autoplay on first user interaction
    document.addEventListener('click', function autoplayOnce() {
        if (!musicPlaying) {
            bgMusic.play().then(() => {
                musicPlaying = true;
                iconOn.classList.remove('hidden');
                iconOff.classList.add('hidden');
            }).catch(() => {});
        }
        document.removeEventListener('click', autoplayOnce);
    }, { once: true });

    // ===== IMMEDIATELY SHOW WELCOME SECTION =====
    const welcomeFadeIn = document.querySelector('.welcome-section .fade-in');
    if (welcomeFadeIn) {
        welcomeFadeIn.classList.add('visible');
    }

    // ===== SCROLL-BASED FADE-IN ANIMATIONS =====
    const fadeElements = document.querySelectorAll('.fade-in');

    const observerOptions = {
        root: null,
        rootMargin: '0px 0px -50px 0px',
        threshold: 0.1
    };

    const fadeObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, observerOptions);

    fadeElements.forEach(el => fadeObserver.observe(el));

    // ===== NAME REVEAL ANIMATION =====
    const namesContainer = document.querySelector('.names-container');

    if (namesContainer) {
        const nameObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const groomName = document.querySelector('.groom-name');
                    const brideName = document.querySelector('.bride-name');
                    const ampersand = document.querySelector('.ampersand');

                    if (groomName) {
                        setTimeout(() => groomName.classList.add('revealed'), 200);
                    }
                    if (ampersand) {
                        setTimeout(() => ampersand.classList.add('revealed'), 600);
                    }
                    if (brideName) {
                        setTimeout(() => brideName.classList.add('revealed'), 1000);
                    }

                    nameObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.2 });

        nameObserver.observe(namesContainer);
    }

    // ===== NAVIGATION DOTS =====
    const sections = document.querySelectorAll('.section');
    const navDots = document.querySelectorAll('.nav-dot');

    const sectionObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const sectionId = entry.target.id;
                navDots.forEach(dot => {
                    dot.classList.remove('active');
                    if (dot.dataset.section === sectionId) {
                        dot.classList.add('active');
                    }
                });
            }
        });
    }, { threshold: 0.4 });

    sections.forEach(section => sectionObserver.observe(section));

    // ===== COUNTDOWN TIMER =====
    const weddingDate = new Date('2026-03-10T00:00:00+05:30').getTime();

    function updateCountdown() {
        const now = new Date().getTime();
        const distance = weddingDate - now;

        if (distance < 0) {
            document.getElementById('days').textContent = '00';
            document.getElementById('hours').textContent = '00';
            document.getElementById('minutes').textContent = '00';
            document.getElementById('seconds').textContent = '00';
            return;
        }

        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);

        document.getElementById('days').textContent = String(days).padStart(2, '0');
        document.getElementById('hours').textContent = String(hours).padStart(2, '0');
        document.getElementById('minutes').textContent = String(minutes).padStart(2, '0');
        document.getElementById('seconds').textContent = String(seconds).padStart(2, '0');
    }

    updateCountdown();
    setInterval(updateCountdown, 1000);

    // ===== QR CODE GENERATION =====
    const qrContainer = document.getElementById('qr-code');
    if (qrContainer && typeof QRCode !== 'undefined') {
        try {
            new QRCode(qrContainer, {
                text: window.location.href || 'https://ashish-sapna-wedding.com',
                width: 180,
                height: 180,
                colorDark: '#0B3D2E',
                colorLight: '#FFFDF5',
                correctLevel: QRCode.CorrectLevel.H
            });
        } catch (e) {
            console.log('QR Code generation failed:', e);
        }
    }

    // ===== RSVP FORM =====
    const rsvpForm = document.getElementById('rsvp-form');
    const rsvpSuccess = document.getElementById('rsvp-success');

    if (rsvpForm) {
        rsvpForm.addEventListener('submit', function (e) {
            e.preventDefault();

            const formData = new FormData(rsvpForm);
            const name = formData.get('name');
            const email = formData.get('email');
            const attendance = formData.get('attendance');

            if (!name || !email || !attendance) return;

            // Hide form, show success
            rsvpForm.style.display = 'none';
            if (rsvpSuccess) {
                rsvpSuccess.classList.remove('hidden');
            }

            // Launch confetti
            if (attendance === 'yes') {
                launchConfetti();
            }
        });
    }

    // ===== CONFETTI ANIMATION =====
    function launchConfetti() {
        const confettiCanvas = document.getElementById('confetti-canvas');
        if (!confettiCanvas) return;

        const cCtx = confettiCanvas.getContext('2d');
        const section = confettiCanvas.parentElement;
        confettiCanvas.width = section.offsetWidth;
        confettiCanvas.height = section.offsetHeight;

        const confettiPieces = [];
        const colors = ['#D4A853', '#F0D78C', '#FFD700', '#B8860B', '#E8D5B7', '#FF6B6B', '#FF8E53', '#48BB78', '#E53E3E', '#9F7AEA'];

        for (let i = 0; i < 200; i++) {
            confettiPieces.push({
                x: Math.random() * confettiCanvas.width,
                y: -Math.random() * confettiCanvas.height * 0.5,
                w: Math.random() * 10 + 5,
                h: Math.random() * 6 + 3,
                color: colors[Math.floor(Math.random() * colors.length)],
                speedY: Math.random() * 4 + 2,
                speedX: (Math.random() - 0.5) * 4,
                rotation: Math.random() * 360,
                rotationSpeed: (Math.random() - 0.5) * 12,
                opacity: 1
            });
        }

        let confettiFrame;
        function animateConfetti() {
            cCtx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
            let allDone = true;

            confettiPieces.forEach(c => {
                if (c.opacity <= 0) return;
                allDone = false;

                c.y += c.speedY;
                c.x += c.speedX;
                c.rotation += c.rotationSpeed;
                c.speedY += 0.05;

                if (c.y > confettiCanvas.height) {
                    c.opacity -= 0.02;
                }

                cCtx.save();
                cCtx.translate(c.x, c.y);
                cCtx.rotate((c.rotation * Math.PI) / 180);
                cCtx.globalAlpha = Math.max(0, c.opacity);
                cCtx.fillStyle = c.color;
                cCtx.fillRect(-c.w / 2, -c.h / 2, c.w, c.h);
                cCtx.restore();
            });

            if (!allDone) {
                confettiFrame = requestAnimationFrame(animateConfetti);
            }
        }
        animateConfetti();

        setTimeout(() => {
            if (confettiFrame) cancelAnimationFrame(confettiFrame);
            cCtx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
        }, 6000);
    }

    // ===== SMOOTH SCROLL FOR NAV DOTS =====
    navDots.forEach(dot => {
        dot.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetSection = document.querySelector(targetId);
            if (targetSection) {
                targetSection.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });

});