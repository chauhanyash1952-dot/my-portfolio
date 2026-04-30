import * as THREE from 'three';

// --- CUSTOM CURSOR LOGIC ---
const cursor = document.getElementById('cursor');
const cursorGlow = document.getElementById('cursor-glow');

let mouseX = 0;
let mouseY = 0;
let cursorX = 0;
let cursorY = 0;
let glowX = 0;
let glowY = 0;

document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
});

function animateCursor() {
    // Smooth easing for trailing cursor
    cursorX += (mouseX - cursorX) * 0.2;
    cursorY += (mouseY - cursorY) * 0.2;
    
    // Slower easing for the glow
    glowX += (mouseX - glowX) * 0.05;
    glowY += (mouseY - glowY) * 0.05;

    if (cursor && cursorGlow) {
        cursor.style.transform = `translate3d(${cursorX - 12}px, ${cursorY - 12}px, 0)`;
        cursorGlow.style.transform = `translate3d(${glowX - 64}px, ${glowY - 64}px, 0)`;
    }
    
    requestAnimationFrame(animateCursor);
}
// Start cursor animation if on desktop
if (window.innerWidth >= 768) {
    animateCursor();
}

// Hover states for interactive elements
const hoverElements = document.querySelectorAll('a, button, .portfolio-card, .service-card, input, textarea');
hoverElements.forEach(el => {
    el.addEventListener('mouseenter', () => {
        if (cursor) {
            cursor.style.transform = `translate3d(${cursorX - 12}px, ${cursorY - 12}px, 0) scale(1.5)`;
            cursor.style.backgroundColor = 'rgba(0, 240, 255, 0.2)';
            cursor.style.borderColor = 'rgba(0, 240, 255, 0.5)';
        }
    });
    el.addEventListener('mouseleave', () => {
        if (cursor) {
            cursor.style.transform = `translate3d(${cursorX - 12}px, ${cursorY - 12}px, 0) scale(1)`;
            cursor.style.backgroundColor = 'transparent';
            cursor.style.borderColor = '#00f0ff';
        }
    });
});

// --- GSAP SCROLL ANIMATIONS ---
gsap.registerPlugin(ScrollTrigger);

// Initial Hero Entrance Animation
gsap.to('.hero-anim', {
    y: 0,
    opacity: 1,
    duration: 1.2,
    stagger: 0.2,
    ease: 'power3.out',
    delay: 0.5
});

// Animate Sections on Scroll
const sections = document.querySelectorAll('section');
sections.forEach((sec) => {
    if(sec.id !== 'home') {
        gsap.fromTo(sec, 
            { opacity: 0, y: 50 },
            {
                opacity: 1, 
                y: 0,
                duration: 1,
                ease: 'power2.out',
                scrollTrigger: {
                    trigger: sec,
                    start: 'top 80%', // trigger when top of section hits 80% of viewport
                    end: 'top 50%',
                    toggleActions: 'play none none reverse'
                }
            }
        );
    }
});

// --- THREE.JS 3D BACKGROUND / AVATAR ---
const canvas = document.querySelector('#webgl-canvas');
const scene = new THREE.Scene();
scene.background = null; // Transparent background to show Tailwind dark theme

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 12; // Adjust distance

const renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

// Create a premium abstract 3D object to act as the "Avatar" placeholder
const group = new THREE.Group();
scene.add(group);

// 1. Outer Wireframe Icosahedron
const outerGeo = new THREE.IcosahedronGeometry(4, 1);
const outerMat = new THREE.MeshPhysicalMaterial({
    color: 0x00f0ff,
    metalness: 0.9,
    roughness: 0.1,
    wireframe: true,
    transparent: true,
    opacity: 0.4,
});
const outerMesh = new THREE.Mesh(outerGeo, outerMat);
group.add(outerMesh);

// 2. Inner Solid Octahedron
const innerGeo = new THREE.OctahedronGeometry(2.5, 0);
const innerMat = new THREE.MeshStandardMaterial({
    color: 0x8a2be2, // Purple
    metalness: 0.8,
    roughness: 0.2,
});
const innerMesh = new THREE.Mesh(innerGeo, innerMat);
group.add(innerMesh);

// 3. Floating Particles Field
const particlesGeo = new THREE.BufferGeometry();
const particlesCount = 800;
const posArray = new Float32Array(particlesCount * 3);

for(let i = 0; i < particlesCount * 3; i++) {
    // Spread particles across a wide area
    posArray[i] = (Math.random() - 0.5) * 40;
}

particlesGeo.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
const particlesMat = new THREE.PointsMaterial({
    size: 0.05,
    color: 0x00f0ff,
    transparent: true,
    opacity: 0.6,
    blending: THREE.AdditiveBlending
});
const particlesMesh = new THREE.Points(particlesGeo, particlesMat);
scene.add(particlesMesh);

// Lighting
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

const pointLight1 = new THREE.PointLight(0x00f0ff, 100, 100);
pointLight1.position.set(5, 5, 5);
scene.add(pointLight1);

const pointLight2 = new THREE.PointLight(0x8a2be2, 100, 100);
pointLight2.position.set(-5, -5, 5);
scene.add(pointLight2);

// Interactivity Variables
let targetRotationX = 0;
let targetRotationY = 0;
let scrollY = window.scrollY;

// Mouse tracking for 3D model
document.addEventListener('mousemove', (e) => {
    // Normalize mouse coordinates from -1 to 1
    const normX = (e.clientX / window.innerWidth) * 2 - 1;
    const normY = -(e.clientY / window.innerHeight) * 2 + 1;
    
    // Set target rotation (limit the maximum rotation amount)
    targetRotationY = normX * 0.8;
    targetRotationX = -normY * 0.8;
});

// Scroll tracking for Parallax
window.addEventListener('scroll', () => {
    scrollY = window.scrollY;
});

// Animation Loop
const clock = new THREE.Clock();

function animate3D() {
    requestAnimationFrame(animate3D);
    const elapsedTime = clock.getElapsedTime();

    // Constant slow rotation
    outerMesh.rotation.y += 0.002;
    outerMesh.rotation.x += 0.001;
    
    innerMesh.rotation.y -= 0.005;
    innerMesh.rotation.x += 0.003;
    
    // Floating effect (up and down)
    group.position.y = Math.sin(elapsedTime * 0.5) * 0.4;

    // Smooth interactive rotation based on mouse position
    group.rotation.y += 0.05 * (targetRotationY - group.rotation.y);
    group.rotation.x += 0.05 * (targetRotationX - group.rotation.x);

    // Particles subtle rotation
    particlesMesh.rotation.y = -elapsedTime * 0.02;
    particlesMesh.rotation.x = elapsedTime * 0.01;

    // Parallax effect on scroll - move camera down as we scroll down
    // This moves the scene up relative to the viewport
    camera.position.y = -scrollY * 0.005;

    // Fade out or move the central object slightly to the right on scroll
    group.position.x = scrollY * 0.002;

    renderer.render(scene, camera);
}

animate3D();

// Handle Window Resize
window.addEventListener('resize', () => {
    // Update camera
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    
    // Update renderer
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    
    // Disable custom cursor on mobile
    if (window.innerWidth < 768) {
        if (cursor) cursor.style.display = 'none';
        if (cursorGlow) cursorGlow.style.display = 'none';
    } else {
        if (cursor) cursor.style.display = 'block';
        if (cursorGlow) cursorGlow.style.display = 'block';
    }
});
