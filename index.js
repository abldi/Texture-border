import * as THREE from "three";
import { simplifyMesh } from "./simplifyModifier.js";
import ColladaLoader from "./components/colladaLoader.js";
import * as dat from "dat.gui";

function init() {
  // call the render function
  var controls = new function() {
    this.rotationSpeed = 0.01;
    this.optimizationLevel = 0.6;
    this.optimizeModel = () => optimizeModel();
    this.preserveTexture = true;
  }();
  var gui = new dat.GUI();
  gui.add(controls, "rotationSpeed", 0, 0.06);
  gui.add(controls, "optimizationLevel", 0, 1);
  gui.add(controls, "preserveTexture");
  gui.add(controls, "optimizeModel");
  requestAnimationFrame(render);
  document.body.insertBefore(
    gui.domElement,
    document.getElementById("WebGL-output")
  );

  var scene = new THREE.Scene();
  var camera = new THREE.PerspectiveCamera(
    45,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  scene.add(camera);
  var renderer = new THREE.WebGLRenderer();
  renderer.setClearColor(new THREE.Color(0.7, 0.8, 0.8));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.shadowMap.enabled = false;

  camera.position.x = 0;
  camera.position.y = 10;
  camera.position.z = 10;
  camera.lookAt(0, 3.5, 0);
  // add subtle ambient lighting
  var ambientLight = new THREE.AmbientLight(0x444444);
  scene.add(ambientLight);
  // add spotlight for the shadows
  var spotLight = new THREE.SpotLight(0xffffff);
  spotLight.position.set(-40, 60, -10);
  spotLight.castShadow = true;
  scene.add(spotLight);
  // add the output of the renderer to the html element
  document.getElementById("WebGL-output").appendChild(renderer.domElement);

  function optimizeModel() {
    scene.remove(elfOptimized);
    elfOptimized = elf.clone();
    elfOptimized.children[0].geometry = simplifyMesh(
      elfOptimized.children[0].geometry,
      controls.optimizationLevel,
      controls.preserveTexture
    );
    elfOptimized.position.x = 2.5;
    scene.add(elfOptimized);
  }

  var elf, elfOptimized;
  var loadingManager = new THREE.LoadingManager(function() {
    scene.add(elf);
    optimizeModel();

    elf.position.x = -2.5;
  });

  var loader = new ColladaLoader(loadingManager);
  loader.load(
    "https://rawgit.com/mrdoob/three.js/master/examples/models/collada/elf/elf.dae",
    function(collada) {
      elf = collada.scene;
    }
  );

  function render() {
    if (elf) elf.children[0].rotation.y += controls.rotationSpeed;
    if (elfOptimized)
      elfOptimized.children[0].rotation.copy(elf.children[0].rotation);

    requestAnimationFrame(render);
    renderer.render(scene, camera);
  }
}

init();
