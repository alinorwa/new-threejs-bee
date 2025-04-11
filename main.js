import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

// إعداد الكاميرا
const camera = new THREE.PerspectiveCamera(
    10,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
);
camera.position.z = 13;

// إعداد المشهد
const scene = new THREE.Scene();
let bee;
let mixer;

// تحميل النموذج
const loader = new GLTFLoader();
loader.load('/demon_bee_full_texture.glb',
    function (gltf) {
        bee = gltf.scene;
        scene.add(bee);
        // تدوير النحلة لتظهر من الجانب عند بداية الصفحة
        bee.rotation.y = Math.PI / 2;

        mixer = new THREE.AnimationMixer(bee);
        mixer.clipAction(gltf.animations[0]).play();

        // تعيين الحجم حسب الجهاز
        const device = getDeviceType();
        if (device === 'mobile') {
            bee.scale.set(0.3, 0.3, 0.3);
        } else if (device === 'tablet') {
            bee.scale.set(0.45, 0.45, 0.45);
        } else {
            bee.scale.set(0.6, 0.6, 0.6);
        }

        // تحديث إحداثيات المواضع حسب الجهاز
        updatePositionsForDevice(device);

        modelMove(); // أول تحريك بعد التحميل
    },
    function (xhr) {},
    function (error) {
        console.error('فشل تحميل النموذج', error);
    }
);

// إعداد الـ Renderer
const renderer = new THREE.WebGLRenderer({ alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.getElementById('container3D').appendChild(renderer.domElement);

// إضاءة
scene.add(new THREE.AmbientLight(0xffffff, 1.3));
const topLight = new THREE.DirectionalLight(0xffffff, 1);
topLight.position.set(500, 500, 500);
scene.add(topLight);

// دالة إعادة الرسم
const reRender3D = () => {
    requestAnimationFrame(reRender3D);
    renderer.render(scene, camera);
    if (mixer) mixer.update(0.02);
};
reRender3D();

// مواضع النموذج حسب الأقسام
let arrPositionModel = [
    {
        id: 'banner',
        position: { x: 0, y: -1, z: 0 },
        rotation: { x: 0, y: 1.57, z: 0 } // جانبياً
    },
    {
        id: "intro",
        position: { x: 1, y: -1, z: -5 },
        rotation: { x: 0.5, y: -0.5, z: 0 }
    },
    {
        id: "description",
        position: { x: -1, y: -1, z: -5 },
        rotation: { x: 0, y: 0.5, z: 0 }
    },
    {
        id: "contact",
        position: { x: 0.8, y: -1, z: 0 },
        rotation: { x: 0.3, y: -0.5, z: 0 }
    }
];

// تعديل المواضع حسب الجهاز
function updatePositionsForDevice(device) {
    arrPositionModel = arrPositionModel.map(pos => {
         let newPos = { ...pos };
        if (device === 'mobile') {
            newPos.position.y += 0.5;
            newPos.position.x *= 0.5; // تقليل التحرك الجانبي
            newPos.position.z *= 0.8; // تقليل العمق
        } else if (device === 'tablet') {
            newPos.position.y += 0.3;
            newPos.position.x *= 0.7;
            newPos.position.z *= 0.9;
        }
        return newPos;
    });
    //     let newPos = { ...pos };
    //     if (device === 'mobile') {
    //         newPos.position.y += 0.1;
    //     } else if (device === 'tablet') {
    //         newPos.position.y += 0.3;
    //     }
    //     return newPos;
    // });
}

// حركة النموذج حسب التمرير
const modelMove = () => {
    const sections = document.querySelectorAll('.section');
    let currentSection;
    sections.forEach((section) => {
        const rect = section.getBoundingClientRect();
        if (rect.top <= window.innerHeight / 3) {
            currentSection = section.id;
        }
    });

    const target = arrPositionModel.find(val => val.id === currentSection);
    if (target && bee) {
        // حركة سلسة بدون GSAP
        bee.position.lerp(new THREE.Vector3(
            target.position.x,
            target.position.y,
            target.position.z
        ), 0.05);

        bee.rotation.x += (target.rotation.x - bee.rotation.x) * 0.05;
        bee.rotation.y += (target.rotation.y - bee.rotation.y) * 0.05;
        bee.rotation.z += (target.rotation.z - bee.rotation.z) * 0.05;
    }
};

// كشف نوع الجهاز
function getDeviceType() {
    const width = window.innerWidth;
    if (width < 600) return 'mobile';
    if (width < 1024) return 'tablet';
    return 'desktop';
}

// أحداث التمرير وتغيير الحجم
window.addEventListener('scroll', () => {
    if (bee) modelMove();
});
window.addEventListener('resize', () => {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
});
