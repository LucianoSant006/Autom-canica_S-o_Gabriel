import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

let scene, camera, renderer, controls, model;

// Configuração do caminho do arquivo
const ASSET_PATH = 'assets/models/volkswagen_voyage.glb'; 

// Inicia o script
init();
animate();

function init() {
    const container = document.getElementById('canvas-container');
    
    // --- 1. CENA E ILUMINAÇÃO ---
    scene = new THREE.Scene();
    scene.background = null; // Fundo transparente (usa o gradiente do CSS)

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 2);
    dirLight.position.set(5, 10, 7);
    dirLight.castShadow = true;
    scene.add(dirLight);

    // Luz de recorte para dar brilho na lataria e vidros
    const rimLight = new THREE.DirectionalLight(0x4455ff, 1);
    rimLight.position.set(-5, 0, -5);
    scene.add(rimLight);

    // --- 2. CÂMERA ---
    camera = new THREE.PerspectiveCamera(40, container.clientWidth / container.clientHeight, 0.1, 1000);
    camera.position.set(4, 1.5, 6); // Posição inicial

    // --- 3. RENDERIZADOR ---
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    container.appendChild(renderer.domElement);

    // --- 4. CONTROLES ---
    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxPolarAngle = Math.PI / 2 - 0.05; // Evita câmera abaixo do chão
    controls.minDistance = 2;
    controls.maxDistance = 10;

    // --- 5. CARREGAR MODELO ---
    const loader = new GLTFLoader();
    
    loader.load(ASSET_PATH, (gltf) => {
        model = gltf.scene;
        
        // --- AUTO-CORREÇÃO DE ESCALA E POSIÇÃO ---
        const box = new THREE.Box3().setFromObject(model);
        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());

        // Centraliza
        model.position.x += (model.position.x - center.x);
        model.position.y += (model.position.y - center.y);
        model.position.z += (model.position.z - center.z);

        // Ajusta escala se for gigante
        const maxDim = Math.max(size.x, size.y, size.z);
        let scaleFactor = 1;
        if (maxDim > 10) {
            scaleFactor = 4.5 / maxDim; 
        }
        model.scale.set(scaleFactor, scaleFactor, scaleFactor);
        model.position.y = 0; // Coloca no chão
        
        // --- CONFIGURAÇÃO DE MATERIAIS (Pintura + Vidros Escuros + Ocultar Interior) ---
        model.traverse((o) => {
            if (o.isMesh) {
                o.castShadow = true;
                o.receiveShadow = true;

                const matName = o.material.name.toLowerCase();

                // A. PINTURA DO CARRO (Carpaint)
                if (matName.includes('carpaint')) {
                    o.material.roughness = 0.2;
                    o.material.metalness = 0.8;
                    o.material.clearcoat = 1.0; 
                    o.material.envMapIntensity = 1.5;
                }

                // B. VIDROS "INSULFILM" (Preto total e espelhado)
                if (matName.includes('glass') || matName.includes('window')) {
                    o.material.color.set(0x000000); // Preto
                    o.material.transparent = false; // Tira transparência
                    o.material.opacity = 1.0;
                    o.material.roughness = 0.05; // Muito liso
                    o.material.metalness = 0.9;  // Muito reflexivo
                }

                // C. OCULTAR INTERIOR (Para não ver bancos/painel e melhorar performance)
                if (matName.includes('interior')) {
                    o.visible = false; 
                }
            }
        });

        scene.add(model);
        
        // Esconde o loader HTML
        const loaderEl = document.querySelector('.loader');
        if (loaderEl) loaderEl.style.display = 'none';

    }, undefined, (error) => {
        console.error('Erro ao carregar modelo:', error);
        const loaderText = document.querySelector('.loader p');
        if (loaderText) loaderText.innerText = "Erro ao carregar 3D";
    });

    // --- 6. CHÃO (Shadow Catcher) ---
    const planeGeo = new THREE.PlaneGeometry(20, 20);
    const planeMat = new THREE.ShadowMaterial({ opacity: 0.4 });
    const plane = new THREE.Mesh(planeGeo, planeMat);
    plane.rotation.x = -Math.PI / 2;
    plane.position.y = -0.01;
    plane.receiveShadow = true;
    scene.add(plane);

    // Inicializa os eventos dos botões de cor
    setupColorPicker();

    window.addEventListener('resize', onWindowResize);
}

function onWindowResize() {
    const container = document.getElementById('canvas-container');
    if (!container || !camera || !renderer) return;
    
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.clientWidth, container.clientHeight);
}

function animate() {
    requestAnimationFrame(animate);
    if (controls) controls.update();
    if (renderer && scene && camera) renderer.render(scene, camera);
}

// --- FUNÇÕES DE MUDANÇA DE COR ---

function setupColorPicker() {
    // Seleciona todos os botões com a classe .color-btn
    const buttons = document.querySelectorAll('.color-btn');
    
    buttons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            // Pega a cor do atributo data-color (ex: #ff0000)
            const newColor = e.target.getAttribute('data-color');
            if (newColor) {
                changeCarColor(newColor);
            }
        });
    });
}

function changeCarColor(colorHex) {
    if (!model) return; 

    model.traverse((o) => {
        if (o.isMesh && o.material) {
            // Só muda a cor se for material da lataria (carpaint)
            if (o.material.name.toLowerCase().includes('carpaint')) {
                o.material.color.set(colorHex);
            }
        }
    });
}