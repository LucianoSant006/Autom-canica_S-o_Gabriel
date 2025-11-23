// js/workshop.js - VERSÃO SEM ANIMAÇÃO (ESTÁTICO NO ALTO) + AVENTADOR

import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

// Variáveis de configuração
const elevatorBaseY = 0.02;
const carBaseY = 1.65; // Distância do pneu até o chão do elevador

// --- CONFIGURAÇÃO DE ALTURA FIXA ---
// Como paramos a animação, definimos aqui a altura que o elevador vai ficar parado.
// 0 = no chão, 1.5 = alto (altura de trabalho)
const fixedLiftHeight = 1.5; 

document.addEventListener('DOMContentLoaded', () => {
    initRealWorkshopScene();
});

function initRealWorkshopScene() {
    const container = document.getElementById('canvas-container');
    
    if (!container) {
        console.error("Container #canvas-container não encontrado!");
        return;
    }

    let width = container.clientWidth;
    let height = container.clientHeight;

    // --- CENA ---
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x333333);
    scene.fog = new THREE.Fog(0x333333, 10, 50);

    // --- CÂMERA ---
    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    camera.position.set(10, 5, 12); // Ajustei levemente para pegar o carro melhor
    camera.lookAt(0, 2, 0);

    // --- RENDERIZADOR ---
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2; // Um pouco mais claro para destacar o carro
    
    container.innerHTML = ''; 
    container.appendChild(renderer.domElement);

    // --- CONTROLES ---
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.minDistance = 4;
    controls.maxDistance = 20;
    controls.maxPolarAngle = Math.PI / 2 - 0.05;

    // --- ILUMINAÇÃO ---
    // Luz ambiente
    const hemiLight = new THREE.HemisphereLight(0xffffff, 0x222222, 0.6);
    hemiLight.position.set(0, 20, 0);
    scene.add(hemiLight);

    // Luz principal (Sol/Holofote)
    const dirLight = new THREE.DirectionalLight(0xffffff, 2.5); // Mais forte para brilhar a lataria
    dirLight.position.set(5, 10, 8);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 2048; // Sombra mais nítida
    dirLight.shadow.mapSize.height = 2048;
    scene.add(dirLight);

    // Luz de preenchimento (para iluminar a lateral escura da Aventador)
    const fillLight = new THREE.DirectionalLight(0xffffff, 1);
    fillLight.position.set(-5, 5, -5);
    scene.add(fillLight);

    // --- CHÃO ---
    const floorGeo = new THREE.PlaneGeometry(60, 60);
    const floorMat = new THREE.MeshStandardMaterial({ 
        color: 0x1a1a1a, // Chão mais escuro fica mais chique
        roughness: 0.7, 
        metalness: 0.2 
    });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    scene.add(floor);

    // --- CARREGAMENTO DOS MODELOS ---
    const loader = new GLTFLoader();

    // 1. Carregar Elevador (Parado no alto)
    loader.load('assets/models/elevador.glb', (gltf) => {
        const model = gltf.scene;
        model.scale.set(1.2, 1.2, 1.2);
        
        // POSIÇÃO FIXA: Base + Altura definida no topo do código
        model.position.set(0, elevatorBaseY + fixedLiftHeight, 0);
        
        model.traverse((o) => {
            if (o.isMesh) {
                o.castShadow = true;
                o.receiveShadow = true;
                if (o.geometry.attributes.uv && !o.geometry.attributes.uv2) {
                    o.geometry.attributes.uv2 = o.geometry.attributes.uv;
                }
            }
        });
        scene.add(model);
    }, undefined, (error) => console.error('Erro no Elevador:', error));

    // 2. Carregar AVENTADOR (Parado no alto)
    // ATENÇÃO: Certifique-se de que o arquivo se chama 'aventador.glb' na pasta assets/models/
    loader.load('assets/models/aventador.glb', (gltf) => {
        const model = gltf.scene;
        
        // Ajuste de escala (Lamborghinis as vezes vem muito grandes ou pequenas, ajuste aqui se precisar)
        model.scale.set(1, 1, 1); 
        
        // POSIÇÃO FIXA: Base do carro + Altura definida
        model.position.set(0, carBaseY + fixedLiftHeight, 0);
        
        // Rotação para ficar bonita na "foto"
        model.rotation.y = Math.PI / 5;
        
        model.traverse((o) => {
            if (o.isMesh) {
                o.castShadow = true;
                o.receiveShadow = true;
                
                // Aumenta o reflexo para parecer pintura automotiva cara
                if (o.material) {
                    o.material.envMapIntensity = 2.0; 
                    o.material.roughness = 0.2; // Deixa mais liso/polido
                    o.material.metalness = 0.8; // Deixa mais metálico
                }

                if (o.geometry.attributes.uv && !o.geometry.attributes.uv2) {
                    o.geometry.attributes.uv2 = o.geometry.attributes.uv;
                }
            }
        });
        scene.add(model);
    }, undefined, (error) => {
        console.error('Erro ao carregar Aventador:', error);
        // Se der erro, avisa no console
        console.warn('Verifique se o arquivo aventador.glb está na pasta assets/models/');
    });

    // --- REDIMENSIONAMENTO ---
    window.addEventListener('resize', () => {
        width = container.clientWidth;
        height = container.clientHeight;
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        renderer.setSize(width, height);
    });

    // --- LOOP DE RENDERIZAÇÃO (SEM CÁLCULOS DE MOVIMENTO) ---
    function animate() {
        requestAnimationFrame(animate);
        // Removemos a lógica de if(model) ... position.y = Math.sin ...
        // Agora é só renderizar, pois eles estão parados.
        controls.update();
        renderer.render(scene, camera);
    }
    
    animate();
}