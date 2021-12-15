import './styles.css';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import * as POSTPROCESSING from 'postprocessing';

let scene,
  camera,
  renderer,
  composer,
  cloudParticles = [];

function init() {
  scene = new THREE.Scene();

  camera = new THREE.PerspectiveCamera(
    60,
    window.innerWidth / window.innerHeight,
    1,
    1000
  );
  camera.rotation.x = 1.16;
  camera.rotation.y = -0.12;
  camera.rotation.z = 0.27;

  let ambient = new THREE.AmbientLight(0x555555);
  scene.add(ambient);

  // renderer = new THREE.WebGLRenderer();
  renderer = new THREE.WebGLRenderer({ canvas: document.querySelector('#bg') });
  renderer.setSize(window.innerWidth, window.innerHeight);
  scene.fog = new THREE.FogExp2(0x04000a, 0.001); // Color of fog
  renderer.setClearColor(scene.fog.color);
  // FIXME: Different way to do this? This doesn't render properly because it posts AFTER body
  // document.body.appendChild(renderer.domElement);

  let loader = new THREE.TextureLoader();
  loader.load('./img/smoke-1.png', function (texture) {
    let cloudGeo = new THREE.PlaneBufferGeometry(500, 500);
    let cloudMaterial = new THREE.MeshLambertMaterial({
      map: texture,
      transparent: true,
    });

    for (let p = 0; p < 50; p++) {
      let cloud = new THREE.Mesh(cloudGeo, cloudMaterial);
      cloud.position.set(
        Math.random() * 800 - 400,
        500,
        Math.random() * 500 - 500
      );
      cloud.rotation.x = 1.16;
      cloud.rotation.y = -0.12;
      cloud.rotation.z = Math.random() * 2 * Math.PI;
      cloud.material.opacity = 0.55;
      cloudParticles.push(cloud);
      scene.add(cloud);
    }
  });

  // Add scene lighting & three colored lights
  // let directionalLight = new THREE.DirectionalLight(0xff8c19);
  let directionalLight = new THREE.DirectionalLight(0xfffbad);
  directionalLight.position.set(0, 0, 1);
  scene.add(directionalLight);
  let light1 = new THREE.PointLight(0xfee825, 50, 450, 1.7);
  light1.position.set(200, 300, 100);
  scene.add(light1);
  let light2 = new THREE.PointLight(0x1506bc, 50, 450, 1.7);
  light2.position.set(100, 300, 100);
  scene.add(light2);
  let light3 = new THREE.PointLight(0xa202f7, 50, 450, 1.7);
  light3.position.set(300, 300, 200);
  scene.add(light3);

  // FIXME: Might want a higher-res image.
  loader.load('./img/milky-way-2.jpg', function (texture) {
    const textureEffect = new POSTPROCESSING.TextureEffect({
      blendFunction: POSTPROCESSING.BlendFunction.COLOR_DODGE,
      texture: texture,
    });
    textureEffect.blendMode.opacity.value = 0.2;
    const bloomEffect = new POSTPROCESSING.BloomEffect({
      blendFunction: POSTPROCESSING.BlendFunction.COLOR_DODGE,
      kernelSize: POSTPROCESSING.KernelSize.SMALL,
      useLuminanceFilter: true,
      luminanceThreshold: 0.3,
      luminanceSmoothing: 0.75,
    });
    bloomEffect.blendMode.opacity.value = 1.5;

    let effectPass = new POSTPROCESSING.EffectPass(
      camera,
      bloomEffect,
      textureEffect
    );
    effectPass.renderToScreen = true;

    composer = new POSTPROCESSING.EffectComposer(renderer);
    composer.addPass(new POSTPROCESSING.RenderPass(scene, camera));
    composer.addPass(effectPass);

    render();
  });
}

// function onWindowResize() {
//   camera.aspect = window.innerWidth / window.innerHeight;
//   camera.updateProjectionMatrix();

//   renderer.setSize(window.innerWidth, window.innerHeight);
// }

function resizeCanvasToDisplaySize() {
  const canvas = renderer.domElement;
  // look up the size the canvas is being displayed
  const width = canvas.clientWidth;
  const height = canvas.clientHeight;

  // adjust displayBuffer size to match
  if (canvas.width !== width || canvas.height !== height) {
    // you must pass false here or three.js sadly fights the browser
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();

    // update any render target sizes here
  }
}

function render() {
  // window.addEventListener('resize', onWindowResize, false);

  // renderer.render(scene,camera);
  resizeCanvasToDisplaySize();
  composer.render(0.1);
  requestAnimationFrame(render);

  cloudParticles.forEach((p) => {
    p.rotation.z -= 0.001;
  });
}

init();
