// @ts-check
// <reference path="./node_modules/@tweenjs/tween.js/dist/tween.d.ts"
// <reference path="./node_modules/@types/three/index.d.ts"

// @ts-ignore
const loader = new THREE.GLTFLoader();

const SHAPES = [
  {
    name: "brackets",
    color: 0x0eb1d2,
    delay: 100,
    position: new THREE.Vector3(0.3, 0.1, 4.2),
    rotation: {
      start: {
        x: -0.1,
        y: 0.1,
        z: 0.1,
      },
      end: {
        x: 0.1,
        y: -0.1,
        z: -0.1,
      },
    },
  },
  {
    name: "git",
    color: 0xf96e46,
    delay: 300,
    position: new THREE.Vector3(-0.6, -0.2, 4),
    rotation: {
      start: {
        x: 0.1,
        y: 0.1,
        z: -0.1,
      },
      end: {
        x: -0.1,
        y: -0.1,
        z: 0.1,
      },
    },
  },
  {
    name: "database",
    color: 0xfcca46,
    delay: 500,
    position: new THREE.Vector3(-0.8, 0.6, 3),
    rotation: {
      start: {
        x: -0.1,
        y: -0.1,
        z: 0.1,
      },
      end: {
        x: 0.1,
        y: 0.1,
        z: -0.1,
      },
    },
  },
  {
    name: "stack",
    color: 0x399e5a,
    delay: 500,
    position: new THREE.Vector3(1.4, -0.8, 3),
    rotation: {
      start: {
        x: -0.1,
        y: 0.1,
        z: -0.1,
      },
      end: {
        x: 0.1,
        y: -0.1,
        z: 0.1,
      },
    },
  },
  {
    name: "terminal",
    color: 0xa964ce,
    delay: 600,
    position: new THREE.Vector3(0.1, -1.5, 2),
    rotation: {
      start: {
        x: -0.1,
        y: -0.1,
        z: -0.1,
      },
      end: {
        x: 0.1,
        y: 0.1,
        z: 0.1,
      },
    },
  },
  {
    name: "cloud",
    color: 0x345995,
    delay: 800,
    position: new THREE.Vector3(-3, 1.5, 2),
    rotation: {
      start: {
        x: 0.1,
        y: 0.1,
        z: 0.1,
      },
      end: {
        x: -0.1,
        y: -0.1,
        z: -0.1,
      },
    },
  },
  {
    name: "window",
    color: 0x394648,
    delay: 100,
    position: new THREE.Vector3(3.5, 2.5, 1),
    rotation: {
      start: {
        x: 0.1,
        y: -0.1,
        z: 0.1,
      },
      end: {
        x: -0.1,
        y: 0.1,
        z: -0.1,
      },
    },
  },
];

const randomNumberFromInterval = (min, max) =>
  Math.random() * (max - min) + min;

const wait = (ms = 0) => new Promise((resolve) => setTimeout(resolve, ms));

const initScene = () => {
  const width = window.innerWidth - 300;
  const height = window.innerHeight;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);

  const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });

  renderer.setSize(width, height);
  renderer.setPixelRatio(2);
  document.body.appendChild(renderer.domElement);
  renderer.domElement.className = "float-right";

  camera.position.z = 5;

  return { scene, renderer, camera };
};

/**
 * @param {THREE.Scene} scene
 */
const initLights = (scene) => {
  const light = new THREE.AmbientLight(0xaaaaaa); // soft white light
  scene.add(light);

  const dl = new THREE.DirectionalLight(0xffffff, 1);
  dl.position.set(1, 10, 5);
  scene.add(dl);

  const dl2 = new THREE.DirectionalLight(0xffffff, 0.3);
  dl.position.set(10, 15, 10);
  scene.add(dl2);
};

/**
 * @param {THREE.Scene} scene
 * @return {Promise<THREE.Group>}
 */
const initShape = async (scene, shapeSettings) => {
  const { name, position, delay, color, rotation } = shapeSettings;

  await wait(delay);

  return new Promise((resolve, reject) => {
    loader.load(
      `/assets/icons/${name}.glb`,
      (shape) => {
        const mesh = shape.scene;

        // Set mesh color (probably better way to do this)
        mesh.traverse((obj) => {
          if (obj.isMesh) {
            obj.material.color.set(color);
          }
        });

        new TWEEN.Tween({ opacity: 0 })
          .to({ opacity: 1 }, 1000)
          .easing(TWEEN.Easing.Quartic.In)
          .onUpdate(({ opacity }) => {
            mesh.traverse((obj) => {
              if (obj.isMesh) {
                obj.transparent = true;
                obj.material.transparent = true;
                obj.material.opacity = opacity;
              }
            });
          })
          .start();

        const group = new THREE.Group();

        // Start position
        Object.assign(group.position, { ...position, z: position.z - 0.4 });

        console.log(group.position)

        // Animate position
        new TWEEN.Tween(group.position)
          .to(position, 1000)
          .easing(TWEEN.Easing.Cubic.Out)
          .start();

        // Start rotation
        Object.assign(group.rotation, rotation.start);

        // Animate rotation
        new TWEEN.Tween(group.rotation)
          .to(rotation.end, randomNumberFromInterval(4000, 8000))
          .yoyo(true)
          .repeat(Infinity)
          .easing(TWEEN.Easing.Sinusoidal.InOut)
          .start();

        group.add(mesh);

        // Centers loaded shape
        new THREE.Box3()
          .setFromObject(mesh)
          .getCenter(mesh.position)
          .multiplyScalar(-1);

        scene.add(group);

        resolve(group);
      },
      undefined,
      reject
    );
  });
};

const bootstrap = async () => {
  const { scene, renderer, camera } = initScene();

  initLights(scene);

  await Promise.all(SHAPES.map((shape) => initShape(scene, shape)));

  const animate = () => {
    requestAnimationFrame(animate);

    TWEEN.update();

    renderer.render(scene, camera);
  };

  animate();
};

bootstrap();
