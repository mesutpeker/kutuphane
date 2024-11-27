class Library3D {
    constructor() {
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        this.books = [];
        this.init();
    }

    init() {
        // Renderer ayarları
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setClearColor(0x000000, 0);
        document.getElementById('canvas-container').appendChild(this.renderer.domElement);

        // Kamera pozisyonu
        this.camera.position.z = 5;

        // Işıklandırma
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        this.scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
        directionalLight.position.set(0, 1, 1);
        this.scene.add(directionalLight);

        // Kitap rafı oluştur
        this.createBookshelf();

        // Animasyon döngüsü
        this.animate();

        // Pencere boyutu değişikliğini dinle
        window.addEventListener('resize', () => this.onWindowResize(), false);
    }

    createBookshelf() {
        // Raf geometrisi
        const shelfGeometry = new THREE.BoxGeometry(4, 0.1, 1);
        const shelfMaterial = new THREE.MeshPhongMaterial({ color: 0x8b4513 });
        const shelf = new THREE.Mesh(shelfGeometry, shelfMaterial);
        this.scene.add(shelf);

        // Örnek kitaplar
        for (let i = 0; i < 5; i++) {
            const bookGeometry = new THREE.BoxGeometry(0.5, 0.8, 0.3);
            const bookMaterial = new THREE.MeshPhongMaterial({ 
                color: new THREE.Color().setHSL(Math.random(), 0.7, 0.5) 
            });
            const book = new THREE.Mesh(bookGeometry, bookMaterial);
            book.position.x = -2 + i;
            book.position.y = 0.45;
            this.books.push(book);
            this.scene.add(book);
        }
    }

    animate() {
        requestAnimationFrame(() => this.animate());

        // Kitapları hafifçe döndür
        this.books.forEach(book => {
            book.rotation.y += 0.01;
        });

        this.renderer.render(this.scene, this.camera);
    }

    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }
}

// 3D kütüphaneyi başlat
const library3D = new Library3D();