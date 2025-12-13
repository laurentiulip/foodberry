// ❄️ Efect de Ninsoare pentru Anul Nou ❄️
// Simulare fizică realistă cu canvas și acumulare pe elemente

(function() {
    'use strict';

    // CONFIGURAȚII
    const CONFIG = {
        maxSnowflakes: 2000,
        gravity: 0.08,
        spawnRate: 1,              // Fulgi noi per frame
        backgroundFlakeInterval: 1000
    };

    let canvas, ctx;
    let wind = 0.2;
    let snowflakes = [];
    let objects = [];
    let backgroundContainer;
    let backgroundFlakes = [];
    let animationId;

    // Clasa pentru fulgi
    class Snowflake {
        constructor() {
            this.reset();
        }

        reset() {
            this.x = Math.random() * canvas.width;
            this.y = -10;
            this.r = Math.random() * 2.5 + 1;
            this.vy = Math.random() * 0.8 + 0.3;
            this.vx = Math.random() * 0.3 - 0.15;
            this.stopped = false;
        }

        update() {
            if (this.stopped) return;

            this.vy += CONFIG.gravity;
            this.x += this.vx + wind;
            this.y += this.vy;

            // Verifică coliziunea cu obiectele
            for (let o of objects) {
                if (
                    this.x >= o.x &&
                    this.x <= o.x + o.w &&
                    this.y + this.r >= o.y - o.snow[Math.floor(this.x - o.x)] &&
                    this.y <= o.y + 10
                ) {
                    const idx = Math.floor(this.x - o.x);
                    if (idx >= 0 && idx < o.snow.length) {
                        o.snow[idx] += 0.8; // Acumulează zăpadă
                    }
                    this.stopped = true;
                    return;
                }
            }

            // Marginea de jos a ecranului
            if (this.y >= canvas.height + 10) {
                this.reset();
            }

            // Marginile laterale - reapare pe cealaltă parte
            if (this.x < -10) this.x = canvas.width + 10;
            if (this.x > canvas.width + 10) this.x = -10;
        }

        draw() {
            if (this.stopped) return;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
            ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
            ctx.fill();
        }
    }

    // Inițializare
    function init() {
        createCanvas();
        createBackgroundContainer();
        createStyles();
        findElements();
        createNewYearMessage();
        startBackgroundSnowing();
        startWindSimulation();
        animate();

        console.log('❄️ Ninsoarea de Anul Nou a început! 🎄');
    }

    // Creează canvas-ul
    function createCanvas() {
        canvas = document.createElement('canvas');
        canvas.id = 'snow-canvas';
        canvas.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: 9999;
        `;
        document.body.appendChild(canvas);
        ctx = canvas.getContext('2d');

        // Setează dimensiunile
        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);
    }

    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        // Recalculează pozițiile obiectelor
        setTimeout(() => updateElementPositions(true), 100);
    }

    // Container pentru fulgi background (simboluri mari)
    function createBackgroundContainer() {
        backgroundContainer = document.createElement('div');
        backgroundContainer.id = 'background-snow-container';
        backgroundContainer.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: 1;
            overflow: hidden;
        `;
        document.body.insertBefore(backgroundContainer, document.body.firstChild);
    }

    // Stiluri CSS
    function createStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .snowflake-bg {
                position: fixed;
                color: rgba(255, 255, 255, 0.35);
                text-shadow: 0 0 10px rgba(255, 255, 255, 0.3);
                user-select: none;
                pointer-events: none;
                z-index: 1;
                will-change: transform;
            }
            
            .new-year-message {
                position: fixed;
                top: 20px;
                left: 50%;
                transform: translateX(-50%);
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                font-size: 18px;
                color: #fff;
                text-shadow: 0 0 10px rgba(255, 215, 0, 0.8), 0 0 20px rgba(255, 215, 0, 0.5);
                z-index: 10002;
                pointer-events: auto;
                cursor: pointer;
                animation: glow 2s ease-in-out infinite alternate, pulse 1s ease-in-out infinite;
                background: linear-gradient(135deg, rgba(102, 126, 234, 0.5), rgba(118, 75, 162, 0.5));
                padding: 12px 30px;
                border-radius: 30px;
                backdrop-filter: blur(5px);
                border: 2px solid rgba(255, 215, 0, 0.5);
                transition: all 0.3s ease;
            }
            
            .new-year-message:hover {
                transform: translateX(-50%) scale(1.1);
                border-color: rgba(255, 215, 0, 0.9);
                box-shadow: 0 0 30px rgba(255, 215, 0, 0.5);
            }
            
            @keyframes glow {
                from { text-shadow: 0 0 10px rgba(255, 215, 0, 0.8), 0 0 20px rgba(255, 215, 0, 0.5); }
                to { text-shadow: 0 0 20px rgba(255, 215, 0, 1), 0 0 40px rgba(255, 215, 0, 0.8), 0 0 60px rgba(255, 215, 0, 0.5); }
            }
            
            @keyframes pulse {
                0%, 100% { box-shadow: 0 0 10px rgba(255, 215, 0, 0.3); }
                50% { box-shadow: 0 0 25px rgba(255, 215, 0, 0.6); }
            }
            
            .new-year-message.hiding {
                animation: moveToBottom 1.5s ease-in-out forwards;
            }
            
            @keyframes moveToBottom {
                0% { top: 20px; transform: translateX(-50%) scale(1); }
                50% { transform: translateX(-50%) scale(1.2); }
                100% { top: calc(100vh - 60px); transform: translateX(-50%) scale(0.9); }
            }
            
            .new-year-message.footer-mode {
                position: relative;
                display: block;
                margin: 30px auto 20px auto;
                left: auto;
                top: auto;
                bottom: auto;
                transform: none;
                pointer-events: auto;
                cursor: pointer;
                animation: gentleGlow 3s ease-in-out infinite;
                background: linear-gradient(135deg, rgba(102, 126, 234, 0.5), rgba(118, 75, 162, 0.5));
                font-size: 16px;
                padding: 12px 25px;
                width: fit-content;
            }
            
            .new-year-message.footer-mode:hover {
                transform: scale(1.1);
                border-color: rgba(255, 215, 0, 0.9);
                box-shadow: 0 0 30px rgba(255, 215, 0, 0.5);
            }
            
            @keyframes gentleGlow {
                0%, 100% { 
                    text-shadow: 0 0 10px rgba(255, 215, 0, 0.6), 0 0 20px rgba(255, 215, 0, 0.3);
                    box-shadow: 0 0 15px rgba(255, 215, 0, 0.2);
                }
                50% { 
                    text-shadow: 0 0 15px rgba(255, 215, 0, 0.8), 0 0 30px rgba(255, 215, 0, 0.5);
                    box-shadow: 0 0 25px rgba(255, 215, 0, 0.4);
                }
            }
            
            @keyframes fadeOut {
                to { opacity: 0; transform: translateX(-50%) scale(0.5); }
            }
            
            /* Canvas pentru artificii */
            #fireworks-canvas {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                pointer-events: none;
                z-index: 10001;
            }
        `;
        document.head.appendChild(style);
    }

    // Găsește elementele din pagină și le transformă în obiecte pentru coliziune
    function findElements() {
        objects = [];
        // Elemente specifice pentru acumulare zăpadă (fără container care e prea lat)
        const selectors = '.calculator, .tavi-calculator';
        const elements = document.querySelectorAll(selectors);

        elements.forEach(el => {
            const rect = el.getBoundingClientRect();
            // Ignoră elementele prea mici sau invizibile
            if (rect.width < 50 || rect.height < 50) return;
            
            const obj = {
                element: el,
                x: rect.left,
                y: rect.top,
                w: rect.width,
                h: rect.height,
                snow: []
            };
            
            // Inițializează array-ul de zăpadă pentru fiecare pixel
            for (let i = 0; i < Math.ceil(obj.w); i++) {
                obj.snow[i] = 0;
            }
            
            objects.push(obj);
        });

        // Sortează obiectele de sus în jos (pentru coliziuni corecte)
        objects.sort((a, b) => a.y - b.y);
        
        // Adaugă listener pentru scroll
        window.addEventListener('scroll', onScroll, { passive: true });
    }
    
    // Handler pentru scroll - actualizează pozițiile
    function onScroll() {
        updateElementPositions(false);
    }
    
    // Actualizează pozițiile elementelor păstrând zăpada
    function updateElementPositions(resetSnow) {
        const selectors = '.calculator, .tavi-calculator';
        const elements = document.querySelectorAll(selectors);
        
        elements.forEach((el, index) => {
            const rect = el.getBoundingClientRect();
            if (rect.width < 50 || rect.height < 50) return;
            
            if (objects[index]) {
                // Actualizează doar poziția, păstrează zăpada
                objects[index].x = rect.left;
                objects[index].y = rect.top;
                
                // Dacă lățimea s-a schimbat, reinițializează array-ul
                if (resetSnow || Math.abs(objects[index].w - rect.width) > 5) {
                    objects[index].w = rect.width;
                    objects[index].h = rect.height;
                    objects[index].snow = [];
                    for (let i = 0; i < Math.ceil(rect.width); i++) {
                        objects[index].snow[i] = 0;
                    }
                }
            }
        });
        
        // Sortează obiectele de sus în jos
        objects.sort((a, b) => a.y - b.y);
    }

    // Netezește zăpada pe obiecte
    function smoothSnow(o) {
        for (let i = 1; i < o.snow.length - 1; i++) {
            const avg = (o.snow[i - 1] + o.snow[i] + o.snow[i + 1]) / 3;
            o.snow[i] += (avg - o.snow[i]) * 0.1;
        }
        // Limitează înălțimea maximă
        for (let i = 0; i < o.snow.length; i++) {
            if (o.snow[i] > 40) o.snow[i] = 40;
        }
    }

    // Desenează zăpada acumulată pe obiecte
    function drawObjectSnow() {
        objects.forEach(o => {
            // Verifică dacă are zăpadă acumulată
            const hasSnow = o.snow.some(s => s > 0.5);
            if (!hasSnow) return;

            // Desenează stratul de zăpadă
            ctx.beginPath();
            ctx.moveTo(o.x, o.y);
            
            for (let i = 0; i < o.snow.length; i++) {
                ctx.lineTo(o.x + i, o.y - o.snow[i]);
            }
            
            ctx.lineTo(o.x + o.w, o.y);
            ctx.closePath();
            
            // Gradient pentru zăpadă
            const gradient = ctx.createLinearGradient(o.x, o.y - 30, o.x, o.y);
            gradient.addColorStop(0, 'rgba(255, 255, 255, 0.95)');
            gradient.addColorStop(0.5, 'rgba(245, 250, 255, 0.9)');
            gradient.addColorStop(1, 'rgba(230, 240, 255, 0.85)');
            
            ctx.fillStyle = gradient;
            ctx.fill();

            // Contur subtil
            ctx.strokeStyle = 'rgba(200, 220, 255, 0.3)';
            ctx.lineWidth = 1;
            ctx.stroke();

            smoothSnow(o);
        });
    }

    // Generează fulgi noi
    function spawnSnow() {
        for (let i = 0; i < CONFIG.spawnRate; i++) {
            if (snowflakes.length < CONFIG.maxSnowflakes) {
                snowflakes.push(new Snowflake());
            }
        }
    }

    // Creează fulgi background (simboluri mari, decorativi)
    function createBackgroundFlake() {
        if (backgroundFlakes.length >= 25) return;

        const snowflake = document.createElement('div');
        snowflake.className = 'snowflake-bg';
        
        const flakeTypes = ['❄', '❅', '❆', '✻', '✼', '❉'];
        snowflake.textContent = flakeTypes[Math.floor(Math.random() * flakeTypes.length)];
        
        const size = Math.random() * 35 + 30;
        const x = Math.random() * window.innerWidth;
        const opacity = Math.random() * 0.25 + 0.15;
        
        snowflake.style.cssText += `
            font-size: ${size}px;
            left: ${x}px;
            top: -60px;
            opacity: ${opacity};
        `;

        backgroundContainer.appendChild(snowflake);

        const flakeData = {
            element: snowflake,
            x: x,
            y: -60,
            speed: Math.random() * 0.4 + 0.2,
            wobble: Math.random() * 0.5 - 0.25,
            wobbleSpeed: Math.random() * 0.008 + 0.003,
            rotation: Math.random() * 360,
            rotationSpeed: (Math.random() - 0.5) * 0.3,
            phase: Math.random() * Math.PI * 2
        };

        backgroundFlakes.push(flakeData);
    }

    function startBackgroundSnowing() {
        setInterval(createBackgroundFlake, CONFIG.backgroundFlakeInterval);
    }

    // Actualizează fulgii background
    function updateBackgroundFlakes() {
        for (let i = backgroundFlakes.length - 1; i >= 0; i--) {
            const flake = backgroundFlakes[i];
            
            flake.y += flake.speed;
            flake.x += wind * 0.3 + Math.sin(flake.phase) * flake.wobble;
            flake.phase += flake.wobbleSpeed;
            flake.rotation += flake.rotationSpeed;

            if (flake.y >= window.innerHeight + 60) {
                flake.element.remove();
                backgroundFlakes.splice(i, 1);
                continue;
            }

            if (flake.x < -60) flake.x = window.innerWidth + 60;
            if (flake.x > window.innerWidth + 60) flake.x = -60;

            flake.element.style.transform = `translate(${flake.x - parseFloat(flake.element.style.left)}px, ${flake.y}px) rotate(${flake.rotation}deg)`;
        }
    }

    // Simulare vânt
    function startWindSimulation() {
        setInterval(() => {
            wind = (Math.random() - 0.5) * 0.5;
        }, 3500);
    }

    // Contor pentru actualizarea poziției
    let frameCount = 0;

    // Bucla de animație
    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Actualizează pozițiile elementelor la fiecare 10 frame-uri
        frameCount++;
        if (frameCount % 10 === 0) {
            updateElementPositions(false);
        }

        // Generează fulgi noi
        spawnSnow();

        // Actualizează și desenează fulgii
        for (let flake of snowflakes) {
            flake.update();
            flake.draw();
        }

        // Elimină fulgii opriți periodic
        if (Math.random() < 0.01) {
            snowflakes = snowflakes.filter(f => !f.stopped);
        }

        // Desenează zăpada pe obiecte
        drawObjectSnow();

        // Actualizează fulgii background
        updateBackgroundFlakes();

        animationId = requestAnimationFrame(animate);
    }

    // Mesaj de Anul Nou
    function createNewYearMessage() {
        // Verifică dacă butonul a fost deja apăsat
        if (localStorage.getItem('newYearClicked') === 'true') {
            // Afișează butonul direct în footer
            createFooterMessage();
            return;
        }
        
        const message = document.createElement('div');
        message.className = 'new-year-message';
        message.id = 'new-year-btn';
        message.innerHTML = '🎄 Click pentru La mulți ani 2026! 🎆';
        message.title = 'Apasă pentru surpriză!';
        document.body.appendChild(message);
        
        // Adăugare event listener pentru click
        message.addEventListener('click', () => {
            // Salvează în localStorage
            localStorage.setItem('newYearClicked', 'true');
            
            // Animație de mutare în jos
            message.classList.add('hiding');
            
            // După animație, mută butonul în footer
            setTimeout(() => {
                message.remove();
                createFooterMessage();
            }, 1500);
            
            // Lansează spectacolul de artificii
            launchFireworksShow();
        });
    }
    
    // Creează mesajul de footer (pentru vizite ulterioare)
    function createFooterMessage() {
        const message = document.createElement('div');
        message.className = 'new-year-message footer-mode';
        message.innerHTML = '🎆 La mulți ani 2026! Click pentru artificii! 🎄';
        message.title = 'Apasă pentru artificii!';
        document.body.appendChild(message);
        
        // Adăugare event listener pentru click repetat
        message.addEventListener('click', () => {
            launchFireworksShow();
        });
    }
    
    // ============= SISTEM DE ARTIFICII =============
    let fireworksCanvas, fireworksCtx;
    let fireworks = [];
    let particles = [];
    let fireworksAnimationId;
    
    // Culori pentru artificii
    const fireworkColors = [
        '#ff0000', '#ff4400', '#ff8800', // Roșu-portocaliu
        '#ffff00', '#ffcc00', '#ff9900', // Galben-auriu
        '#00ff00', '#44ff00', '#88ff00', // Verde
        '#00ffff', '#00ccff', '#0088ff', // Cyan-albastru
        '#ff00ff', '#ff44ff', '#ff88ff', // Magenta-roz
        '#ffffff', '#ffd700', '#ff69b4', // Alb, auriu, roz
        '#7b68ee', '#9370db', '#ba55d3'  // Violet
    ];
    
    // Clasa pentru racheta de artificii
    class Firework {
        constructor(startX, startY, targetY) {
            this.x = startX;
            this.y = startY;
            this.startY = startY;
            this.targetY = targetY;
            this.speed = Math.random() * 3 + 4;
            this.angle = -Math.PI / 2 + (Math.random() - 0.5) * 0.3;
            this.vx = Math.cos(this.angle) * this.speed;
            this.vy = Math.sin(this.angle) * this.speed;
            this.trail = [];
            this.color = fireworkColors[Math.floor(Math.random() * fireworkColors.length)];
            this.exploded = false;
        }
        
        update() {
            // Adaugă poziția curentă la trail
            this.trail.push({ x: this.x, y: this.y, alpha: 1 });
            if (this.trail.length > 15) this.trail.shift();
            
            // Mișcare
            this.x += this.vx;
            this.y += this.vy;
            this.vy += 0.05; // Gravitație ușoară
            
            // Explodează când ajunge la țintă
            if (this.vy >= 0 || this.y <= this.targetY) {
                this.explode();
                return true;
            }
            return false;
        }
        
        draw() {
            // Desenează trail-ul
            for (let i = 0; i < this.trail.length; i++) {
                const t = this.trail[i];
                const alpha = (i / this.trail.length) * 0.8;
                fireworksCtx.beginPath();
                fireworksCtx.arc(t.x, t.y, 2, 0, Math.PI * 2);
                fireworksCtx.fillStyle = `rgba(255, 200, 100, ${alpha})`;
                fireworksCtx.fill();
            }
            
            // Desenează racheta
            fireworksCtx.beginPath();
            fireworksCtx.arc(this.x, this.y, 3, 0, Math.PI * 2);
            fireworksCtx.fillStyle = '#fff';
            fireworksCtx.fill();
        }
        
        explode() {
            this.exploded = true;
            const patterns = ['circle', 'star', 'double', 'ring', 'burst'];
            const pattern = patterns[Math.floor(Math.random() * patterns.length)];
            
            switch(pattern) {
                case 'circle':
                    this.createCircleExplosion();
                    break;
                case 'star':
                    this.createStarExplosion();
                    break;
                case 'double':
                    this.createDoubleExplosion();
                    break;
                case 'ring':
                    this.createRingExplosion();
                    break;
                case 'burst':
                    this.createBurstExplosion();
                    break;
            }
        }
        
        createCircleExplosion() {
            const particleCount = Math.floor(Math.random() * 50) + 80;
            for (let i = 0; i < particleCount; i++) {
                const angle = (Math.PI * 2 / particleCount) * i;
                const speed = Math.random() * 4 + 3;
                particles.push(new Particle(this.x, this.y, angle, speed, this.color));
            }
        }
        
        createStarExplosion() {
            const points = 5;
            const particleCount = 100;
            for (let i = 0; i < particleCount; i++) {
                const angle = (Math.PI * 2 / particleCount) * i;
                const starFactor = (i % (particleCount / points) < (particleCount / points / 2)) ? 1.5 : 0.7;
                const speed = (Math.random() * 2 + 3) * starFactor;
                particles.push(new Particle(this.x, this.y, angle, speed, this.color));
            }
        }
        
        createDoubleExplosion() {
            // Prima explozie
            for (let i = 0; i < 60; i++) {
                const angle = (Math.PI * 2 / 60) * i;
                particles.push(new Particle(this.x, this.y, angle, Math.random() * 3 + 4, this.color));
            }
            // A doua explozie cu altă culoare
            const color2 = fireworkColors[Math.floor(Math.random() * fireworkColors.length)];
            for (let i = 0; i < 40; i++) {
                const angle = (Math.PI * 2 / 40) * i;
                particles.push(new Particle(this.x, this.y, angle, Math.random() * 2 + 2, color2));
            }
        }
        
        createRingExplosion() {
            for (let ring = 0; ring < 3; ring++) {
                const ringColor = fireworkColors[Math.floor(Math.random() * fireworkColors.length)];
                for (let i = 0; i < 30; i++) {
                    const angle = (Math.PI * 2 / 30) * i;
                    const speed = 3 + ring * 2;
                    particles.push(new Particle(this.x, this.y, angle, speed, ringColor));
                }
            }
        }
        
        createBurstExplosion() {
            for (let i = 0; i < 120; i++) {
                const angle = Math.random() * Math.PI * 2;
                const speed = Math.random() * 6 + 1;
                const color = fireworkColors[Math.floor(Math.random() * fireworkColors.length)];
                particles.push(new Particle(this.x, this.y, angle, speed, color));
            }
        }
    }
    
    // Clasa pentru particule
    class Particle {
        constructor(x, y, angle, speed, color) {
            this.x = x;
            this.y = y;
            this.vx = Math.cos(angle) * speed;
            this.vy = Math.sin(angle) * speed;
            this.color = color;
            this.alpha = 1;
            this.decay = Math.random() * 0.015 + 0.008;
            this.size = Math.random() * 3 + 1;
            this.trail = [];
            this.sparkle = Math.random() > 0.7;
        }
        
        update() {
            this.trail.push({ x: this.x, y: this.y, alpha: this.alpha });
            if (this.trail.length > 5) this.trail.shift();
            
            this.x += this.vx;
            this.y += this.vy;
            this.vy += 0.08; // Gravitație
            this.vx *= 0.98; // Fricțiune
            this.vy *= 0.98;
            this.alpha -= this.decay;
            
            return this.alpha <= 0;
        }
        
        draw() {
            // Trail
            for (let i = 0; i < this.trail.length; i++) {
                const t = this.trail[i];
                const alpha = (i / this.trail.length) * this.alpha * 0.5;
                fireworksCtx.beginPath();
                fireworksCtx.arc(t.x, t.y, this.size * 0.5, 0, Math.PI * 2);
                fireworksCtx.fillStyle = this.hexToRgba(this.color, alpha);
                fireworksCtx.fill();
            }
            
            // Particula principală
            fireworksCtx.beginPath();
            fireworksCtx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            fireworksCtx.fillStyle = this.hexToRgba(this.color, this.alpha);
            fireworksCtx.fill();
            
            // Efect de sclipire
            if (this.sparkle && Math.random() > 0.5) {
                fireworksCtx.beginPath();
                fireworksCtx.arc(this.x, this.y, this.size * 2, 0, Math.PI * 2);
                fireworksCtx.fillStyle = `rgba(255, 255, 255, ${this.alpha * 0.3})`;
                fireworksCtx.fill();
            }
        }
        
        hexToRgba(hex, alpha) {
            const r = parseInt(hex.slice(1, 3), 16);
            const g = parseInt(hex.slice(3, 5), 16);
            const b = parseInt(hex.slice(5, 7), 16);
            return `rgba(${r}, ${g}, ${b}, ${alpha})`;
        }
    }
    
    // Lansează spectacolul de artificii
    function launchFireworksShow() {
        // Creează canvas pentru artificii
        fireworksCanvas = document.createElement('canvas');
        fireworksCanvas.id = 'fireworks-canvas';
        document.body.appendChild(fireworksCanvas);
        fireworksCtx = fireworksCanvas.getContext('2d');
        fireworksCanvas.width = window.innerWidth;
        fireworksCanvas.height = window.innerHeight;
        
        // Faza 1: Artificii normale (primele 15)
        let launchCount = 0;
        const maxLaunches = 15;
        let textShown = false;
        
        function launchRocket() {
            if (launchCount >= maxLaunches) {
                // După rachetele normale, afișează textul
                if (!textShown) {
                    textShown = true;
                    setTimeout(() => launchTextFireworks(), 500);
                }
                return;
            }
            
            const x = Math.random() * (window.innerWidth * 0.6) + window.innerWidth * 0.2;
            const startY = window.innerHeight + 10;
            const targetY = Math.random() * (window.innerHeight * 0.4) + window.innerHeight * 0.1;
            
            fireworks.push(new Firework(x, startY, targetY));
            launchCount++;
            
            // Lansează următoarea rachetă
            if (launchCount < maxLaunches) {
                setTimeout(launchRocket, Math.random() * 300 + 150);
            } else {
                // După ultimele rachete, afișează textul
                setTimeout(() => {
                    if (!textShown) {
                        textShown = true;
                        launchTextFireworks();
                    }
                }, 1000);
            }
        }
        
        // Lansează primele rachete
        for (let i = 0; i < 3; i++) {
            setTimeout(launchRocket, i * 300);
        }
        
        // Animație artificii
        function animateFireworks() {
            fireworksCtx.fillStyle = 'rgba(0, 0, 0, 0.15)';
            fireworksCtx.fillRect(0, 0, fireworksCanvas.width, fireworksCanvas.height);
            
            // Desenează particulele de text (statice)
            drawTextParticles();
            
            // Actualizează și desenează rachetele
            for (let i = fireworks.length - 1; i >= 0; i--) {
                const exploded = fireworks[i].update();
                if (!exploded) {
                    fireworks[i].draw();
                } else {
                    fireworks.splice(i, 1);
                }
            }
            
            // Actualizează și desenează particulele
            for (let i = particles.length - 1; i >= 0; i--) {
                const dead = particles[i].update();
                if (!dead) {
                    particles[i].draw();
                } else {
                    particles.splice(i, 1);
                }
            }
            
            // Continuă animația sau oprește-o
            if (fireworks.length > 0 || particles.length > 0 || textParticles.length > 0 || !textShown) {
                fireworksAnimationId = requestAnimationFrame(animateFireworks);
            } else {
                // Curăță după spectacol
                setTimeout(() => {
                    fireworksCanvas.remove();
                    textParticles = [];
                }, 2000);
            }
        }
        
        animateFireworks();
    }
    
    // ============= SISTEM DE TEXT DIN PARTICULE =============
    let textParticles = [];
    
    // Font bitmap pentru litere (5x7 pixeli)
    const letterPatterns = {
        'H': [
            [1,0,0,0,1],
            [1,0,0,0,1],
            [1,1,1,1,1],
            [1,0,0,0,1],
            [1,0,0,0,1],
            [1,0,0,0,1],
            [1,0,0,0,1]
        ],
        'A': [
            [0,0,1,0,0],
            [0,1,0,1,0],
            [1,0,0,0,1],
            [1,1,1,1,1],
            [1,0,0,0,1],
            [1,0,0,0,1],
            [1,0,0,0,1]
        ],
        'P': [
            [1,1,1,1,0],
            [1,0,0,0,1],
            [1,0,0,0,1],
            [1,1,1,1,0],
            [1,0,0,0,0],
            [1,0,0,0,0],
            [1,0,0,0,0]
        ],
        'Y': [
            [1,0,0,0,1],
            [0,1,0,1,0],
            [0,0,1,0,0],
            [0,0,1,0,0],
            [0,0,1,0,0],
            [0,0,1,0,0],
            [0,0,1,0,0]
        ],
        'N': [
            [1,0,0,0,1],
            [1,1,0,0,1],
            [1,0,1,0,1],
            [1,0,0,1,1],
            [1,0,0,0,1],
            [1,0,0,0,1],
            [1,0,0,0,1]
        ],
        'E': [
            [1,1,1,1,1],
            [1,0,0,0,0],
            [1,0,0,0,0],
            [1,1,1,1,0],
            [1,0,0,0,0],
            [1,0,0,0,0],
            [1,1,1,1,1]
        ],
        'W': [
            [1,0,0,0,1],
            [1,0,0,0,1],
            [1,0,0,0,1],
            [1,0,1,0,1],
            [1,0,1,0,1],
            [1,1,0,1,1],
            [1,0,0,0,1]
        ],
        'R': [
            [1,1,1,1,0],
            [1,0,0,0,1],
            [1,0,0,0,1],
            [1,1,1,1,0],
            [1,0,1,0,0],
            [1,0,0,1,0],
            [1,0,0,0,1]
        ],
        ' ': [
            [0,0,0],
            [0,0,0],
            [0,0,0],
            [0,0,0],
            [0,0,0],
            [0,0,0],
            [0,0,0]
        ],
        '2': [
            [0,1,1,1,0],
            [1,0,0,0,1],
            [0,0,0,0,1],
            [0,0,0,1,0],
            [0,0,1,0,0],
            [0,1,0,0,0],
            [1,1,1,1,1]
        ],
        '0': [
            [0,1,1,1,0],
            [1,0,0,0,1],
            [1,0,0,1,1],
            [1,0,1,0,1],
            [1,1,0,0,1],
            [1,0,0,0,1],
            [0,1,1,1,0]
        ],
        '6': [
            [0,0,1,1,0],
            [0,1,0,0,0],
            [1,0,0,0,0],
            [1,1,1,1,0],
            [1,0,0,0,1],
            [1,0,0,0,1],
            [0,1,1,1,0]
        ]
    };
    
    // Clasa pentru particule de text
    class TextParticle {
        constructor(targetX, targetY, color, delay) {
            this.targetX = targetX;
            this.targetY = targetY;
            // Începe de jos
            this.x = targetX + (Math.random() - 0.5) * 100;
            this.y = window.innerHeight + 50;
            this.color = color;
            this.delay = delay;
            this.arrived = false;
            this.alpha = 0;
            this.size = Math.random() * 2 + 2;
            this.twinkle = Math.random();
            this.lifespan = 300 + Math.random() * 100; // Durata de viață
            this.age = 0;
        }
        
        update() {
            if (this.delay > 0) {
                this.delay--;
                return false;
            }
            
            this.age++;
            
            if (!this.arrived) {
                // Mișcare către țintă
                const dx = this.targetX - this.x;
                const dy = this.targetY - this.y;
                this.x += dx * 0.08;
                this.y += dy * 0.08;
                this.alpha = Math.min(1, this.alpha + 0.05);
                
                if (Math.abs(dx) < 1 && Math.abs(dy) < 1) {
                    this.arrived = true;
                }
            } else {
                // Efect de sclipire
                this.twinkle += 0.1;
                
                // Fade out după ce ajunge la limita de viață
                if (this.age > this.lifespan) {
                    this.alpha -= 0.02;
                }
            }
            
            return this.alpha <= 0;
        }
        
        draw() {
            if (this.delay > 0) return;
            
            const twinkleAlpha = this.alpha * (0.7 + Math.sin(this.twinkle) * 0.3);
            
            // Strălucire
            fireworksCtx.beginPath();
            fireworksCtx.arc(this.x, this.y, this.size * 2, 0, Math.PI * 2);
            fireworksCtx.fillStyle = this.hexToRgba(this.color, twinkleAlpha * 0.3);
            fireworksCtx.fill();
            
            // Particulă principală
            fireworksCtx.beginPath();
            fireworksCtx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            fireworksCtx.fillStyle = this.hexToRgba(this.color, twinkleAlpha);
            fireworksCtx.fill();
        }
        
        hexToRgba(hex, alpha) {
            const r = parseInt(hex.slice(1, 3), 16);
            const g = parseInt(hex.slice(3, 5), 16);
            const b = parseInt(hex.slice(5, 7), 16);
            return `rgba(${r}, ${g}, ${b}, ${alpha})`;
        }
    }
    
    // Lansează textul din particule
    function launchTextFireworks() {
        textParticles = [];
        
        const screenWidth = window.innerWidth;
        const screenHeight = window.innerHeight;
        const isMobile = screenWidth < 600;
        const isSmallMobile = screenWidth < 400;
        
        // Dimensiuni responsive
        let pixelSize, letterSpacing;
        
        if (isSmallMobile) {
            pixelSize = Math.max(screenWidth / 100, 3);
            letterSpacing = pixelSize * 3;
        } else if (isMobile) {
            pixelSize = Math.max(screenWidth / 90, 4);
            letterSpacing = pixelSize * 4;
        } else {
            pixelSize = Math.min(screenWidth / 80, 8);
            letterSpacing = pixelSize * 6;
        }
        
        // Text adaptat pentru mobile - pe 4 rânduri
        let textLines;
        if (isMobile) {
            textLines = ["HAPPY", "NEW", "YEAR", "2026"];
        } else {
            textLines = ["HAPPY", "NEW YEAR", "2026"];
        }
        
        const colors = [
            ['#ffd700', '#ffcc00', '#ffaa00'], // Auriu
            ['#ff4444', '#ff6666', '#ff8888'], // Roșu
            ['#44ff44', '#66ff66', '#88ff88'], // Verde
            ['#00bfff', '#87ceeb', '#add8e6']  // Albastru
        ];
        
        // Calculează lățimea totală pentru centrare
        function getTextWidth(text) {
            let width = 0;
            for (let char of text) {
                const pattern = letterPatterns[char];
                if (pattern) {
                    width += pattern[0].length * pixelSize + letterSpacing;
                }
            }
            return width - letterSpacing;
        }
        
        // Creează particule pentru un text
        function createTextParticles(text, startY, lineColors, baseDelay) {
            const totalWidth = getTextWidth(text);
            let currentX = (screenWidth - totalWidth) / 2;
            let charIndex = 0;
            
            for (let char of text) {
                const pattern = letterPatterns[char];
                if (!pattern) continue;
                
                const charDelay = baseDelay + charIndex * 5;
                
                for (let row = 0; row < pattern.length; row++) {
                    for (let col = 0; col < pattern[row].length; col++) {
                        if (pattern[row][col] === 1) {
                            const x = currentX + col * pixelSize;
                            const y = startY + row * pixelSize;
                            const color = lineColors[Math.floor(Math.random() * lineColors.length)];
                            const delay = charDelay + row * 2 + Math.random() * 10;
                            
                            textParticles.push(new TextParticle(x, y, color, delay));
                        }
                    }
                }
                
                currentX += pattern[0].length * pixelSize + letterSpacing;
                charIndex++;
            }
        }
        
        // Calculează poziția Y pentru centrare verticală
        const lineHeight = isMobile ? pixelSize * 9 : pixelSize * 10;
        const totalTextHeight = textLines.length * lineHeight;
        const startY = (screenHeight - totalTextHeight) / 2 - (isMobile ? 20 : 0);
        
        // Creează toate rândurile de text
        textLines.forEach((text, index) => {
            const colorIndex = index % colors.length;
            createTextParticles(text, startY + index * lineHeight, colors[colorIndex], index * 25);
        });
        
        // Lansează și câteva artificii în jurul textului
        setTimeout(() => {
            for (let i = 0; i < 8; i++) {
                setTimeout(() => {
                    const x = Math.random() * window.innerWidth;
                    const startY = window.innerHeight + 10;
                    const targetY = Math.random() * (window.innerHeight * 0.3) + window.innerHeight * 0.1;
                    fireworks.push(new Firework(x, startY, targetY));
                }, i * 200);
            }
        }, 1500);
    }
    
    // Desenează particulele de text
    function drawTextParticles() {
        for (let i = textParticles.length - 1; i >= 0; i--) {
            const dead = textParticles[i].update();
            if (!dead) {
                textParticles[i].draw();
            } else {
                textParticles.splice(i, 1);
            }
        }
    }

    // Pornire
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // Control extern
    window.SnowEffect = {
        pause: () => cancelAnimationFrame(animationId),
        resume: () => animate(),
        setIntensity: (value) => { CONFIG.spawnRate = value; },
        clearSnow: () => {
            objects.forEach(o => {
                for (let i = 0; i < o.snow.length; i++) o.snow[i] = 0;
            });
        },
        setWind: (value) => { wind = value; }
    };

})();
