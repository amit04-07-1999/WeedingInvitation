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

    // ===== MUSIC TOGGLE & PERSISTENCE =====
    const musicBtn = document.getElementById('music-toggle');
    const bgMusic = document.getElementById('bg-music');
    const iconOn = document.getElementById('music-icon-on');
    const iconOff = document.getElementById('music-icon-off');
    const musicPrompt = document.getElementById('music-prompt');

    // Check localStorage for saved state
    let musicPlaying = localStorage.getItem('musicPlaying') !== 'false'; // Default to true
    let savedTime = parseFloat(localStorage.getItem('musicCurrentTime')) || 0;

    console.log("Initial State -> Playing:", musicPlaying, "Time:", savedTime);

    bgMusic.volume = 0.4;

    // Ensure accurate time setting if valid
    if (!isNaN(savedTime) && savedTime > 0) {
        bgMusic.currentTime = savedTime;
    }

    // Function to update UI and play/pause
    function updateMusicUI() {
        if (musicPlaying) {
            iconOn.classList.remove('hidden');
            iconOff.classList.add('hidden');

            const playPromise = bgMusic.play();

            if (playPromise !== undefined) {
                playPromise.then(() => {
                    console.log("Audio playing successfully");
                    if (musicPrompt) musicPrompt.classList.remove('visible');
                }).catch(error => {
                    console.warn("Autoplay blocked:", error);
                    // Show prompt to user
                    if (musicPrompt) musicPrompt.classList.add('visible');

                    if (musicPrompt) musicPrompt.classList.add('visible');

                    // Add listeners to ENTIRE document to catch ANY interaction
                    // Using 'capture' phase to catch events early
                    const enableAudio = () => {
                        if (musicPlaying) {
                            bgMusic.play().then(() => {
                                if (musicPrompt) musicPrompt.classList.remove('visible');
                                console.log("Audio enabled by USER INTERACTION");
                                // Remove listeners once successful
                                ['click', 'touchstart', 'touchend', 'pointerdown', 'keydown', 'scroll', 'wheel', 'resize'].forEach(evt => {
                                    document.removeEventListener(evt, enableAudio, { capture: true });
                                    window.removeEventListener(evt, enableAudio, { capture: true });
                                });
                            }).catch(e => {
                                // console.log("Still blocked on this event, keeping listeners:", e);
                                // Don't remove listeners if still blocked
                            });
                        }
                    };

                    const events = ['click', 'touchstart', 'touchend', 'pointerdown', 'keydown', 'scroll', 'wheel', 'resize'];
                    events.forEach(evt => {
                        document.addEventListener(evt, enableAudio, { capture: true, passive: true }); // passive: true for scroll perfs
                        window.addEventListener(evt, enableAudio, { capture: true, passive: true });
                    });
                });
            }
        } else {
            iconOn.classList.add('hidden');
            iconOff.classList.remove('hidden');
            bgMusic.pause();
            if (musicPrompt) musicPrompt.classList.remove('visible');
        }
    }

    // Execute initial check slightly delayed to ensure DOM/Audio readiness
    setTimeout(updateMusicUI, 500);

    // Toggle Button Listener
    musicBtn.addEventListener('click', function (e) {
        e.stopPropagation(); // Avoid triggering document-level listeners

        if (musicPlaying) {
            musicPlaying = false;
            bgMusic.pause();
            iconOn.classList.add('hidden');
            iconOff.classList.remove('hidden');
            if (musicPrompt) musicPrompt.classList.remove('visible');
        } else {
            musicPlaying = true;
            // When user explicitly clicks button, we can play immediately
            bgMusic.play().then(() => {
                iconOn.classList.remove('hidden');
                iconOff.classList.add('hidden');
                if (musicPrompt) musicPrompt.classList.remove('visible');
            }).catch(e => console.error("Play failed on click:", e));
        }

        // Save state
        localStorage.setItem('musicPlaying', musicPlaying);
        localStorage.setItem('musicCurrentTime', bgMusic.currentTime);
    });

    // Save playback time logic
    function saveMusicState() {
        // Only save current time if it's playing or advanced
        if (bgMusic.currentTime > 0) {
            localStorage.setItem('musicCurrentTime', bgMusic.currentTime);
        }
        localStorage.setItem('musicPlaying', musicPlaying);
    }

    // Save periodically
    setInterval(saveMusicState, 1000);

    // Save on visibility change and unload
    window.addEventListener('beforeunload', saveMusicState);
    document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'hidden') saveMusicState();
    });

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
        rsvpForm.addEventListener('submit', async function (e) {
            e.preventDefault();

            const formData = new FormData(rsvpForm);
            const name = formData.get('name');
            const message = formData.get('message');
            const attendance = formData.get('attendance');

            if (!name || !attendance) return;

            const submitBtn = rsvpForm.querySelector('button[type="submit"]');
            const originalBtnText = submitBtn.innerHTML;
            submitBtn.innerHTML = 'Sending...';
            submitBtn.disabled = true;

            try {
                const response = await fetch('https://weeding-invitation-backend.vercel.app/api/rsvp', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ name, message, attendance })
                });

                const result = await response.json();

                if (result.success) {
                    // Hide form, show success
                    rsvpForm.style.display = 'none';
                    if (rsvpSuccess) {
                        rsvpSuccess.classList.remove('hidden');
                    }

                    // Launch confetti
                    if (attendance === 'yes') {
                        launchConfetti();
                    }
                } else {
                    alert('Failed to send RSVP. Please try again.');
                    submitBtn.innerHTML = originalBtnText;
                    submitBtn.disabled = false;
                }
            } catch (error) {
                console.error('Error:', error);
                alert('Something went wrong. Please check your connection.');
                submitBtn.innerHTML = originalBtnText;
                submitBtn.disabled = false;
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


    // ===== CUSTOM CURSOR =====
    const customCursor = document.querySelector('.custom-cursor');

    if (customCursor) {
        document.addEventListener('mousemove', (e) => {
            customCursor.style.left = `${e.clientX}px`;
            customCursor.style.top = `${e.clientY}px`;
            customCursor.style.display = 'block';
        });

        document.addEventListener('mouseleave', () => {
            customCursor.style.display = 'none';
        });

        document.addEventListener('mouseenter', () => {
            customCursor.style.display = 'block';
        });

        // Hide default cursor interaction
        document.querySelectorAll('a, button, input, [role="button"]').forEach(el => {
            el.style.cursor = 'none';
        });
    }

});