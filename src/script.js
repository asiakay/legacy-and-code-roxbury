document.addEventListener("DOMContentLoaded", () => {

    /* ============================
       CUSTOM CURSOR
    ============================ */

    const cursor = document.querySelector('.cursor');
    const cursorFollower = document.querySelector('.cursor-follower');

    document.addEventListener('mousemove', (e) => {
        cursor.style.left = e.clientX + 'px';
        cursor.style.top = e.clientY + 'px';

        setTimeout(() => {
            cursorFollower.style.left = e.clientX + 'px';
            cursorFollower.style.top = e.clientY + 'px';
        }, 100);
    });

    document.addEventListener('mousedown', () => {
        cursor.style.transform = 'scale(0.7)';
        cursorFollower.style.transform = 'scale(1.3)';
    });

    document.addEventListener('mouseup', () => {
        cursor.style.transform = 'scale(1)';
        cursorFollower.style.transform = 'scale(1)';
    });

    /* ============================
       MOUSE TRAIL EFFECT
    ============================ */

    const trailCanvas = document.getElementById('mouse-trail');
    const ctx = trailCanvas.getContext('2d');

    trailCanvas.width = window.innerWidth;
    trailCanvas.height = window.innerHeight;

    let mouseX = 0;
    let mouseY = 0;
    const particles = [];
    const colors = ['#6E3BEC', '#FF9500', '#00D4FF'];

    class Particle {
        constructor(x, y) {
            this.x = x;
            this.y = y;
            this.size = Math.random() * 5 + 2;
            this.speedX = Math.random() * 3 - 1.5;
            this.speedY = Math.random() * 3 - 1.5;
            this.color = colors[Math.floor(Math.random() * colors.length)];
            this.alpha = 1;
            this.decay = Math.random() * 0.05 + 0.02;
        }

        update() {
            this.x += this.speedX;
            this.y += this.speedY;
            this.alpha -= this.decay;
            this.size *= 0.97;
        }

        draw() {
            ctx.save();
            ctx.globalAlpha = this.alpha;
            ctx.fillStyle = this.color;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }
    }

    function handleParticles() {
        for (let i = 0; i < particles.length; i++) {
            particles[i].update();
            particles[i].draw();

            if (particles[i].alpha <= 0 || particles[i].size <= 0.5) {
                particles.splice(i, 1);
                i--;
            }
        }
    }

    function animate() {
        ctx.clearRect(0, 0, trailCanvas.width, trailCanvas.height);
        handleParticles();
        requestAnimationFrame(animate);
    }

    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;

        for (let i = 0; i < 3; i++) {
            particles.push(new Particle(mouseX, mouseY));
        }
    });

    window.addEventListener('resize', () => {
        trailCanvas.width = window.innerWidth;
        trailCanvas.height = window.innerHeight;
    });

    animate();


    /* ============================
       P5.JS BACKGROUND
    ============================ */

    window.setup = function () {
        const canvas = createCanvas(windowWidth, windowHeight);
        canvas.parent('p5-bg');

        colorMode(HSB, 360, 100, 100, 1);
        noStroke();
    }

    window.draw = function () {

        // Dark gradient background
        for (let y = 0; y < height; y++) {
            let inter = map(y, 0, height, 0, 1);
            let c = lerpColor(color(250, 80, 10), color(270, 90, 5), inter);
            stroke(c);
            line(0, y, width, y);
        }

        // Floating particles
        for (let i = 0; i < 40; i++) {
            let x = (frameCount * 0.5 + i * 50) % (width + 100) - 50;
            let y = (sin(frameCount * 0.01 + i) * height / 4) + height / 2;
            let size = sin(frameCount * 0.02 + i) * 4 + 6;

            let hue = (i % 3 === 0) ? 270 : (i % 3 === 1) ? 30 : 200;
            fill(hue, 80, 90, 0.5);

            if (i % 3 === 0) {
                triangle(
                    x, y - size / 2,
                    x - size / 2, y + size / 2,
                    x + size / 2, y + size / 2
                );
            } else if (i % 3 === 1) {
                rect(x - size / 2, y - size / 2, size, size);
            } else {
                drawHexagon(x, y, size);
            }
        }

        // Connecting lines
        stroke(200, 60, 80, 0.15);
        for (let i = 0; i < 40; i += 5) {
            for (let j = i + 5; j < 40; j += 5) {
                let x1 = (frameCount * 0.5 + i * 50) % (width + 100) - 50;
                let y1 = (sin(frameCount * 0.01 + i) * height / 4) + height / 2;

                let x2 = (frameCount * 0.5 + j * 50) % (width + 100) - 50;
                let y2 = (sin(frameCount * 0.01 + j) * height / 4) + height / 2;

                let d = dist(x1, y1, x2, y2);
                if (d < 150) {
                    strokeWeight(map(d, 0, 150, 1.5, 0.1));
                    line(x1, y1, x2, y2);
                }
            }
        }
    }

    function drawHexagon(x, y, size) {
        beginShape();
        for (let i = 0; i < 6; i++) {
            let angle = i * PI / 3;
            let px = x + cos(angle) * size;
            let py = y + sin(angle) * size;
            vertex(px, py);
        }
        endShape(CLOSE);
    }

    window.windowResized = function () {
        resizeCanvas(windowWidth, windowHeight);
    }


    /* ============================
       THREE.JS BACKGROUND
    ============================ */

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
        75,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
    );

    const renderer = new THREE.WebGLRenderer({ alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.getElementById('webgl-container').appendChild(renderer.domElement);

    const geometry = new THREE.IcosahedronGeometry(1, 0);
    const material = new THREE.MeshBasicMaterial({
        color: 0x6E3BEC,
        wireframe: true,
        transparent: true,
        opacity: 0.2
    });

    const icosahedrons = [];
    for (let i = 0; i < 15; i++) {
        const ico = new THREE.Mesh(geometry, material);
        ico.position.x = Math.random() * 50 - 25;
        ico.position.y = Math.random() * 50 - 25;
        ico.position.z = Math.random() * 50 - 25;
        ico.scale.setScalar(Math.random() * 1.5 + 0.5);
        scene.add(ico);
        icosahedrons.push(ico);
    }

    const orangeGeometry = new THREE.TorusGeometry(1, 0.4, 8, 20);
    const orangeMaterial = new THREE.MeshBasicMaterial({
        color: 0xFF9500,
        wireframe: true,
        transparent: true,
        opacity: 0.15
    });

    const toruses = [];
    for (let i = 0; i < 10; i++) {
        const tor = new THREE.Mesh(orangeGeometry, orangeMaterial);
        tor.position.x = Math.random() * 60 - 30;
        tor.position.y = Math.random() * 60 - 30;
        tor.position.z = Math.random() * 60 - 30;
        tor.scale.setScalar(Math.random() * 2 + 1);
        scene.add(tor);
        toruses.push(tor);
    }

    camera.position.z = 30;

    function animateWebGL() {
        requestAnimationFrame(animateWebGL);

        icosahedrons.forEach((obj, i) => {
            obj.rotation.x += 0.004;
            obj.rotation.y += 0.005;
            obj.position.y = Math.sin(Date.now() * 0.001 + i) * 3;
        });

        toruses.forEach((obj, i) => {
            obj.rotation.x += 0.006;
            obj.rotation.y += 0.004;
            obj.position.x = Math.cos(Date.now() * 0.001 + i) * 2;
        });

        renderer.render(scene, camera);
    }

    animateWebGL();

    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });

});
