/* ==========================================================================
   FUNCTIONALITY SYSTEM: INTERACTIVE GREETING CARD (KONSTANTINA)
   Features: Ambient Particles, 3D Interactive Gifts, Canvas Fireworks, Transitions
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {

    // ==========================================================================
    // 1. NAVIGATION & CARD SWITCHER
    // ==========================================================================
    const cards = document.querySelectorAll('.card');
    const btnToCard2 = document.getElementById('btn-to-card-2');
    const btnToCard3 = document.getElementById('btn-to-card-3');
    const btnToCard4 = document.getElementById('btn-to-card-4');
    const btnRestart = document.getElementById('btn-restart');

    // Smooth navigation helper
    function showCard(cardIndex) {
        cards.forEach(card => card.classList.remove('active'));
        const targetCard = document.getElementById(`card-${cardIndex}`);
        if (targetCard) {
            targetCard.classList.add('active');
            
            // Trigger specific animations or canvas loaders
            if (cardIndex === 4) {
                startFireworks();
            } else {
                stopFireworks();
            }
        }
    }

    btnToCard2.addEventListener('click', () => showCard(2));
    btnToCard3.addEventListener('click', () => showCard(3));
    btnToCard4.addEventListener('click', () => {
        if (!btnToCard4.classList.contains('disabled-btn')) {
            showCard(4);
        }
    });

    btnRestart.addEventListener('click', () => {
        // Reset gifts
        const gifts = document.querySelectorAll('.gift-box');
        gifts.forEach(gift => gift.classList.remove('opened'));
        
        // Disable next button
        btnToCard4.classList.add('disabled-btn');
        btnToCard4.setAttribute('disabled', 'true');
        openedGifts.clear();
        
        // Go to Card 1
        showCard(1);
    });


    // ==========================================================================
    // 2. AMBIENT BACKGROUND PARTICLES
    // ==========================================================================
    const ambientCanvas = document.getElementById('ambient-particles');
    const actx = ambientCanvas.getContext('2d');
    let ambientParticles = [];
    const maxAmbientParticles = 50;

    function resizeAmbientCanvas() {
        ambientCanvas.width = window.innerWidth;
        ambientCanvas.height = window.innerHeight;
    }
    resizeAmbientCanvas();
    window.addEventListener('resize', resizeAmbientCanvas);

    class AmbientParticle {
        constructor() {
            this.reset(true);
        }

        reset(initial = false) {
            this.x = Math.random() * ambientCanvas.width;
            this.y = initial ? Math.random() * ambientCanvas.height : ambientCanvas.height + 10;
            this.size = Math.random() * 3 + 1;
            this.speedY = -(Math.random() * 0.5 + 0.2); // Slowly float up
            this.speedX = Math.random() * 0.4 - 0.2;     // Subtle sway
            this.opacity = Math.random() * 0.5 + 0.1;
            this.color = Math.random() > 0.5 ? '255, 215, 0' : '142, 83, 179'; // Gold or Violet
        }

        update() {
            this.y += this.speedY;
            this.x += this.speedX;

            // Subtle opacity oscillation
            this.opacity += (Math.random() * 0.02 - 0.01);
            if (this.opacity < 0.1) this.opacity = 0.1;
            if (this.opacity > 0.6) this.opacity = 0.6;

            // Reset if goes off screen
            if (this.y < -10 || this.x < -10 || this.x > ambientCanvas.width + 10) {
                this.reset();
            }
        }

        draw() {
            actx.beginPath();
            actx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            actx.fillStyle = `rgba(${this.color}, ${this.opacity})`;
            actx.shadowBlur = 10;
            actx.shadowColor = `rgba(${this.color}, ${this.opacity})`;
            actx.fill();
        }
    }

    // Initialize particles
    for (let i = 0; i < maxAmbientParticles; i++) {
        ambientParticles.push(new AmbientParticle());
    }

    function animateAmbient() {
        actx.clearRect(0, 0, ambientCanvas.width, ambientCanvas.height);
        actx.shadowBlur = 0; // Reset shadow for clean state
        
        ambientParticles.forEach(p => {
            p.update();
            p.draw();
        });
        
        requestAnimationFrame(animateAmbient);
    }
    animateAmbient();


    // ==========================================================================
    // 3. BACKGROUND MUSIC TOGGLE
    // ==========================================================================
    const musicBtn = document.getElementById('music-toggle');
    const bgMusic = document.getElementById('bg-music');
    let isMusicPlaying = false;

    // Set lower initial volume so it's pleasant
    bgMusic.volume = 0.45;

    musicBtn.addEventListener('click', () => {
        if (isMusicPlaying) {
            bgMusic.pause();
            musicBtn.classList.remove('playing');
            musicBtn.setAttribute('aria-label', 'Ενεργοποίηση Μουσικής');
        } else {
            // Attempt to play music (handles modern browser auto-play policies)
            bgMusic.play()
                .then(() => {
                    musicBtn.classList.add('playing');
                    musicBtn.setAttribute('aria-label', 'Απενεργοποίηση Μουσικής');
                })
                .catch(err => {
                    console.log("Η αυτόματη αναπαραγωγή μπλοκαρίστηκε. Απαιτείται αλληλεπίδραση.", err);
                });
        }
        isMusicPlaying = !isMusicPlaying;
    });

    // Auto-play attempt on first user click anywhere on screen
    document.body.addEventListener('click', () => {
        if (!isMusicPlaying && bgMusic.paused) {
            bgMusic.play().then(() => {
                isMusicPlaying = true;
                musicBtn.classList.add('playing');
            }).catch(() => {});
        }
    }, { once: true });


    // ==========================================================================
    // 4. INTERACTIVE GIFT BOXES SYSTEM
    // ==========================================================================
    const gifts = document.querySelectorAll('.gift-box');
    const openedGifts = new Set();

    gifts.forEach(gift => {
        gift.addEventListener('click', () => {
            if (!gift.classList.contains('opened')) {
                gift.classList.add('opened');
                openedGifts.add(gift.id);

                // Play soft click or sparkle effect sound (optional)
                triggerConfettiFromGift(gift);

                // Enable continue button if at least one gift is opened
                if (openedGifts.size >= 1) {
                    btnToCard4.classList.remove('disabled-btn');
                    btnToCard4.removeAttribute('disabled');
                }
            }
        });

        // Accessibility Support (keyboard press)
        gift.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                gift.click();
            }
        });
    });

    // Create subtle local confetti explosion when gift is opened
    function triggerConfettiFromGift(giftElement) {
        const rect = giftElement.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        
        // Spawn small bursts in Canvas if currently on fireworks card or ambient
        // For simplicity, we just trigger standard canvas bursts at coordinates
        if (fireworksActive) {
            createExplosion(centerX, centerY);
        }
    }


    // ==========================================================================
    // 5. INTERACTIVE CANVAS FIREWORKS SYSTEM (CARD 4)
    // ==========================================================================
    const canvas = document.getElementById('fireworks-canvas');
    const ctx = canvas.getContext('2d');
    
    let fireworksActive = false;
    let animId = null;
    let fireworks = [];
    let particles = [];
    let autoLaunchTimer = 0;

    function resizeCanvas() {
        canvas.width = canvas.parentElement.clientWidth;
        canvas.height = canvas.parentElement.clientHeight;
    }

    // Coordinates setup for Canvas fireworks
    class Firework {
        constructor(sx, sy, tx, ty) {
            this.x = sx;
            this.y = sy;
            this.sx = sx;
            this.sy = sy;
            this.tx = tx;
            this.ty = ty;
            
            // Distance to target
            this.distanceToTarget = calculateDistance(sx, sy, tx, ty);
            this.distanceTraveled = 0;
            
            // Trajectory path tracking
            this.coordinates = [];
            this.coordinateCount = 3;
            while (this.coordinateCount--) {
                this.coordinates.push([this.x, this.y]);
            }
            
            this.angle = Math.atan2(ty - sy, tx - sx);
            this.speed = 3;
            this.acceleration = 1.04;
            this.brightness = Math.random() * 30 + 50;
        }

        update(index) {
            this.coordinates.pop();
            this.coordinates.unshift([this.x, this.y]);
            
            this.speed *= this.acceleration;
            
            let vx = Math.cos(this.angle) * this.speed;
            let vy = Math.sin(this.angle) * this.speed;
            this.distanceTraveled = calculateDistance(this.sx, this.sy, this.x + vx, this.y + vy);
            
            if (this.distanceTraveled >= this.distanceToTarget) {
                createExplosion(this.tx, this.ty);
                fireworks.splice(index, 1);
            } else {
                this.x += vx;
                this.y += vy;
            }
        }

        draw() {
            ctx.beginPath();
            ctx.moveTo(this.coordinates[this.coordinates.length - 1][0], this.coordinates[this.coordinates.length - 1][1]);
            ctx.lineTo(this.x, this.y);
            ctx.strokeStyle = `hsl(${Math.random() * 360}, 100%, ${this.brightness}%)`;
            ctx.lineWidth = 2;
            ctx.stroke();
        }
    }

    class FireworkParticle {
        constructor(x, y) {
            this.x = x;
            this.y = y;
            
            // Track trail coordinates
            this.coordinates = [];
            this.coordinateCount = 5;
            while (this.coordinateCount--) {
                this.coordinates.push([this.x, this.y]);
            }
            
            this.angle = Math.random() * Math.PI * 2;
            this.speed = Math.random() * 6 + 1;
            
            this.friction = 0.95;
            this.gravity = 0.12;
            this.hue = Math.random() * 360;
            this.brightness = Math.random() * 20 + 70;
            this.alpha = 1;
            this.decay = Math.random() * 0.015 + 0.012;
        }

        update(index) {
            this.coordinates.pop();
            this.coordinates.unshift([this.x, this.y]);
            
            this.speed *= this.friction;
            this.x += Math.cos(this.angle) * this.speed;
            this.y += Math.sin(this.angle) * this.speed + this.gravity;
            this.alpha -= this.decay;
            
            if (this.alpha <= this.decay) {
                particles.splice(index, 1);
            }
        }

        draw() {
            ctx.beginPath();
            ctx.moveTo(this.coordinates[this.coordinates.length - 1][0], this.coordinates[this.coordinates.length - 1][1]);
            ctx.lineTo(this.x, this.y);
            ctx.strokeStyle = `hsla(${this.hue}, 100%, ${this.brightness}%, ${this.alpha})`;
            ctx.lineWidth = 1.5;
            ctx.stroke();
        }
    }

    function calculateDistance(x1, y1, x2, y2) {
        return Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2));
    }

    function createExplosion(x, y) {
        let count = 45;
        while (count--) {
            particles.push(new FireworkParticle(x, y));
        }
    }

    // Launch firework to destination coordinates
    function launchFirework(tx, ty) {
        const sx = canvas.width / 2 + (Math.random() * 100 - 50); // Start near bottom center
        const sy = canvas.height;
        fireworks.push(new Firework(sx, sy, tx, ty));
    }

    // Mouse/Touch click interactive launching
    canvas.addEventListener('mousedown', (e) => {
        if (!fireworksActive) return;
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        launchFirework(x, y);
    });

    canvas.addEventListener('touchstart', (e) => {
        if (!fireworksActive) return;
        const rect = canvas.getBoundingClientRect();
        const x = e.touches[0].clientX - rect.left;
        const y = e.touches[0].clientY - rect.top;
        launchFirework(x, y);
    });

    // Main animation loop for fireworks
    function animateFireworks() {
        if (!fireworksActive) return;
        
        animId = requestAnimationFrame(animateFireworks);
        
        // Semi-transparent clearing for motion blur trails
        ctx.fillStyle = 'rgba(11, 7, 26, 0.15)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        let i = fireworks.length;
        while (i--) {
            fireworks[i].draw();
            fireworks[i].update(i);
        }
        
        let j = particles.length;
        while (j--) {
            particles[j].draw();
            particles[j].update(j);
        }

        // Auto-launch random fireworks
        autoLaunchTimer++;
        if (autoLaunchTimer > 45) { // Roughly every 45 frames
            const randomX = Math.random() * canvas.width * 0.8 + canvas.width * 0.1;
            const randomY = Math.random() * canvas.height * 0.5 + canvas.height * 0.1;
            launchFirework(randomX, randomY);
            autoLaunchTimer = 0;
        }
    }

    function startFireworks() {
        fireworksActive = true;
        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);
        
        // Trigger initial bursts
        launchFirework(canvas.width / 2, canvas.height * 0.3);
        launchFirework(canvas.width * 0.3, canvas.height * 0.4);
        launchFirework(canvas.width * 0.7, canvas.height * 0.4);
        
        animateFireworks();
    }

    function stopFireworks() {
        fireworksActive = false;
        if (animId) {
            cancelAnimationFrame(animId);
            animId = null;
        }
        fireworks = [];
        particles = [];
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        window.removeEventListener('resize', resizeCanvas);
    }

});
