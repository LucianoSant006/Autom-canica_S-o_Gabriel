// js/js.js - VERSÃO FINAL E CORRIGIDA

document.addEventListener('DOMContentLoaded', () => {
    // Verificar se as dependências do Three.js foram carregadas
    if (typeof THREE === 'undefined' || typeof THREE.GLTFLoader === 'undefined') {
        console.error('Three.js ou GLTFLoader não foram carregados corretamente.');
        const container = document.getElementById('canvas-container');
        if(container) container.innerHTML = '<p style="text-align:center; padding-top: 50px;">Erro: Bibliotecas 3D não encontradas.</p>';
        return;
    }
    
    // Inicia a cena realista
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

    // --- 1. Cena e Câmera ---
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xa0a0a0); // Fundo cinza industrial
    scene.fog = new THREE.Fog(0xa0a0a0, 10, 50); // Névoa para profundidade

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(8, 5, 10); // Posição da câmera

    // --- 2. Renderizador (Alta Qualidade) ---
    const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: "high-performance" });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap; // Sombras suaves
    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.toneMapping = THREE.ACESFilmicToneMapping; // Tom de filme (mais realista)
    renderer.toneMappingExposure = 1.2;
    
    // Limpa qualquer coisa que já esteja no container antes de adicionar o novo canvas
    container.innerHTML = ''; 
    container.appendChild(renderer.domElement);

    // --- 3. Controles (OrbitControls) ---
    const controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true; // Movimento com inércia
    controls.dampingFactor = 0.05;
    controls.minDistance = 5;
    controls.maxDistance = 20;
    controls.maxPolarAngle = Math.PI / 2 - 0.05; // Não deixa a câmera entrar no chão

    // --- 4. Iluminação ---
    const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444, 0.6);
    hemiLight.position.set(0, 20, 0);
    scene.add(hemiLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 1.5);
    dirLight.position.set(10, 20, 10);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 2048;
    dirLight.shadow.mapSize.height = 2048;
    scene.add(dirLight);

    // --- 5. Ambiente (Chão e Parede) ---
    // Chão de concreto
    const floorGeo = new THREE.PlaneGeometry(50, 50);
    const floorMat = new THREE.MeshStandardMaterial({ 
        color: 0x666666, 
        roughness: 0.4, 
        metalness: 0.1 
    });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    scene.add(floor);

    // Parede de fundo
    const wallGeo = new THREE.BoxGeometry(50, 40, 1);
    const wallMat = new THREE.MeshStandardMaterial({ color: 0x888888 });
    const wall = new THREE.Mesh(wallGeo, wallMat);
    wall.position.set(0, 20, -15);
    wall.receiveShadow = true;
    scene.add(wall);

    // --- 6. Carregamento dos Modelos 3D (.glb) ---
    const loader = new THREE.GLTFLoader();
    
    // Gerenciador de carregamento para iniciar animação apenas no final
    const manager = new THREE.LoadingManager();
    manager.onLoad = function ( ) {
        console.log( 'Todos os modelos carregados!' );
        animate(); // Inicia o loop apenas quando tudo estiver pronto
    };

    const gltfLoader = new THREE.GLTFLoader(manager);

    // Carregar Elevador
    gltfLoader.load('assets/models/elevador.glb', (gltf) => {
        const model = gltf.scene;
        model.scale.set(1.2, 1.2, 1.2); // Ajuste de escala
        model.position.set(0, 0.02, 0);
        
        model.traverse((o) => {
            if (o.isMesh) {
                o.castShadow = true;
                o.receiveShadow = true;
            }
        });
        scene.add(model);
    }, undefined, (error) => {
        console.error('Erro ao carregar elevador:', error);
    });

    // Carregar Carro
    gltfLoader.load('assets/models/porche.glb', (gltf) => {
        const model = gltf.scene;
        model.scale.set(1, 1, 1); // Ajuste de escala
        
        // POSIÇÃO IMPORTANTE: Coloca o carro em cima do elevador
        model.position.set(0, 1.65, 0); 
        model.rotation.y = Math.PI / 5; // Levemente girado
        
        model.traverse((o) => {
            if (o.isMesh) {
                o.castShadow = true;
                o.receiveShadow = true;
                // Tenta deixar a pintura do carro mais bonita/reflexiva
                if (o.material) {
                    o.material.envMapIntensity = 1;
                }
            }
        });
        scene.add(model);
    }, undefined, (error) => {
        console.error('Erro ao carregar carro:', error);
    });

    // --- 7. Redimensionamento e Animação ---
    window.addEventListener('resize', onWindowResize);

    function onWindowResize() {
        width = container.clientWidth;
        height = container.clientHeight;
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        renderer.setSize(width, height);
    }

    function animate() {
        requestAnimationFrame(animate);
        controls.update();
        renderer.render(scene, camera);
    }
}