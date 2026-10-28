import * as THREE from 'three';

/**
 * Controlador de Vehículo y Cámara en 3ª Persona (Drive Mode)
 * - Modelo procedural de Camioneta Patagónica 4x4 (estilo Hilux doble cabina)
 * - Físicas arcade de aceleración, frenado, reversa y derrape suave
 * - Ruedas direccionables con giro y rotación de rodadura
 * - Faros delanteros proyectados sobre el asfalto y luces traseras de freno reactivas
 * - Cámara de persecución (Chase Camera) suave e inmersiva
 */
export function createVehicleController(scene, camera) {
  const vehicleGroup = new THREE.Group();
  vehicleGroup.name = 'PlayerVehicle';
  scene.add(vehicleGroup);

  // Materiales de la Camioneta
  const bodyPaintMat = new THREE.MeshStandardMaterial({
    color: 0xd97706, // Ocre / Amarillo austral distintivo
    roughness: 0.35,
    metalness: 0.6
  });

  const blackTrimMat = new THREE.MeshStandardMaterial({
    color: 0x18181b,
    roughness: 0.8,
    metalness: 0.2
  });

  const glassMat = new THREE.MeshStandardMaterial({
    color: 0x1e293b,
    roughness: 0.1,
    metalness: 0.9,
    transparent: true,
    opacity: 0.85
  });

  const tireMat = new THREE.MeshStandardMaterial({
    color: 0x18181b,
    roughness: 0.9,
    metalness: 0.1
  });

  const rimMat = new THREE.MeshStandardMaterial({
    color: 0xd4d4d8,
    roughness: 0.3,
    metalness: 0.85
  });

  const headlightMat = new THREE.MeshStandardMaterial({
    color: 0xffedd5,
    emissive: 0xffedd5,
    emissiveIntensity: 2.5
  });

  const taillightMat = new THREE.MeshStandardMaterial({
    color: 0xef4444,
    emissive: 0xef4444,
    emissiveIntensity: 0.8 // Se intensifica a 3.0 al frenar
  });

  // Chasis y Carrocería
  const carWidth = 2.0;
  const carLength = 4.8;
  const carHeight = 1.6;

  // 1. Cabina principal
  const cabinGeo = new THREE.BoxGeometry(carWidth, 0.8, 2.4);
  const cabinMesh = new THREE.Mesh(cabinGeo, bodyPaintMat);
  cabinMesh.position.set(0, 0.95, -0.2);
  cabinMesh.castShadow = true;
  vehicleGroup.add(cabinMesh);

  // Techo / Habitáculo
  const roofGeo = new THREE.BoxGeometry(carWidth * 0.9, 0.7, 1.6);
  const roofMesh = new THREE.Mesh(roofGeo, bodyPaintMat);
  roofMesh.position.set(0, 1.5, -0.4);
  roofMesh.castShadow = true;
  vehicleGroup.add(roofMesh);

  // Parabrisas y ventanas
  const windshieldGeo = new THREE.BoxGeometry(carWidth * 0.92, 0.55, 1.4);
  const windshieldMesh = new THREE.Mesh(windshieldGeo, glassMat);
  windshieldMesh.position.set(0, 1.45, -0.4);
  vehicleGroup.add(windshieldMesh);

  // 2. Capó delantero
  const hoodGeo = new THREE.BoxGeometry(carWidth * 0.96, 0.65, 1.4);
  const hoodMesh = new THREE.Mesh(hoodGeo, bodyPaintMat);
  hoodMesh.position.set(0, 0.85, 1.5);
  hoodMesh.castShadow = true;
  vehicleGroup.add(hoodMesh);

  // Parachoques delantero negro
  const frontBumperGeo = new THREE.BoxGeometry(carWidth + 0.1, 0.4, 0.4);
  const frontBumper = new THREE.Mesh(frontBumperGeo, blackTrimMat);
  frontBumper.position.set(0, 0.55, 2.3);
  vehicleGroup.add(frontBumper);

  // 3. Pick-up / Pick-up trasera (Caja de carga)
  const bedFloorGeo = new THREE.BoxGeometry(carWidth * 0.92, 0.15, 1.5);
  const bedFloor = new THREE.Mesh(bedFloorGeo, blackTrimMat);
  bedFloor.position.set(0, 0.65, -1.5);
  vehicleGroup.add(bedFloor);

  // Laterales de la caja
  [-carWidth * 0.46, carWidth * 0.46].forEach((bx) => {
    const wallGeo = new THREE.BoxGeometry(0.1, 0.6, 1.5);
    const wall = new THREE.Mesh(wallGeo, bodyPaintMat);
    wall.position.set(bx, 0.85, -1.5);
    vehicleGroup.add(wall);
  });

  // Compuerta trasera
  const tailgateGeo = new THREE.BoxGeometry(carWidth * 0.92, 0.6, 0.1);
  const tailgate = new THREE.Mesh(tailgateGeo, bodyPaintMat);
  tailgate.position.set(0, 0.85, -2.25);
  vehicleGroup.add(tailgate);

  // Barra antivuelco cromada en la caja
  const rollbarGeo = new THREE.CylinderGeometry(0.05, 0.05, carWidth * 0.9, 8);
  rollbarGeo.rotateZ(Math.PI / 2);
  const rollbar = new THREE.Mesh(rollbarGeo, rimMat);
  rollbar.position.set(0, 1.6, -1.05);
  vehicleGroup.add(rollbar);

  // 4. Faros Delanteros y Luces de Freno
  [-0.72, 0.72].forEach((hx) => {
    // Faro delantero
    const hGeo = new THREE.BoxGeometry(0.32, 0.22, 0.1);
    const hMesh = new THREE.Mesh(hGeo, headlightMat);
    hMesh.position.set(hx, 0.85, 2.22);
    vehicleGroup.add(hMesh);

    // Foco de luz proyectada sobre el pavimento
    const headSpot = new THREE.SpotLight(0xffedd5, 1.8, 45, Math.PI / 6, 0.4, 1.2);
    headSpot.position.set(hx, 0.85, 2.25);
    const targetObj = new THREE.Object3D();
    targetObj.position.set(hx, 0, 15);
    vehicleGroup.add(targetObj);
    headSpot.target = targetObj;
    vehicleGroup.add(headSpot);

    // Faro trasero / freno
    const tGeo = new THREE.BoxGeometry(0.25, 0.35, 0.08);
    const tMesh = new THREE.Mesh(tGeo, taillightMat);
    tMesh.position.set(hx, 0.85, -2.31);
    vehicleGroup.add(tMesh);
  });

  // 5. Ruedas 4x4 (con giro y rodadura)
  const wheelRadius = 0.45;
  const wheelWidth = 0.35;
  const wheelGeo = new THREE.CylinderGeometry(wheelRadius, wheelRadius, wheelWidth, 16);
  wheelGeo.rotateZ(Math.PI / 2);

  const rimGeo = new THREE.CylinderGeometry(wheelRadius * 0.6, wheelRadius * 0.6, wheelWidth + 0.02, 12);
  rimGeo.rotateZ(Math.PI / 2);

  function createWheel() {
    const wheelGroup = new THREE.Group();
    const tire = new THREE.Mesh(wheelGeo, tireMat);
    tire.castShadow = true;
    const rim = new THREE.Mesh(rimGeo, rimMat);
    wheelGroup.add(tire, rim);
    return wheelGroup;
  }

  const frontLeftWheel = createWheel();
  const frontRightWheel = createWheel();
  const rearLeftWheel = createWheel();
  const rearRightWheel = createWheel();

  const wheelBaseZ = 1.45;
  const trackWidthX = 1.05;
  const wheelY = wheelRadius;

  frontLeftWheel.position.set(trackWidthX, wheelY, wheelBaseZ);
  frontRightWheel.position.set(-trackWidthX, wheelY, wheelBaseZ);
  rearLeftWheel.position.set(trackWidthX, wheelY, -wheelBaseZ);
  rearRightWheel.position.set(-trackWidthX, wheelY, -wheelBaseZ);

  vehicleGroup.add(frontLeftWheel, frontRightWheel, rearLeftWheel, rearRightWheel);

  // Estado del Vehículo y Físicas
  let speed = 0; // m/s
  const maxSpeed = 22.0; // ~80 km/h
  const maxReverseSpeed = -7.0; // ~25 km/h
  const acceleration = 18.0; // m/s^2
  const brakingPower = 28.0;
  const naturalFriction = 7.5;
  let steerAngle = 0;
  const maxSteerAngle = 0.55; // radianes (~32°)
  const steerSpeed = 3.5;
  let yaw = 0; // Ángulo de rotación del auto
  let wheelRoll = 0;

  // Posición inicial: Sobre el Puente Ibáñez, carril sur
  vehicleGroup.position.set(0, 7.8, 35);
  yaw = Math.PI; // Mirando hacia el sur (Plaza de Armas)

  let isBraking = false;
  let isActive = false;

  // Cámara suave
  const camOffset = new THREE.Vector3(0, 2.8, -6.8);
  const currentCamPos = new THREE.Vector3();

  return {
    group: vehicleGroup,
    setActive: (active) => {
      isActive = active;
      vehicleGroup.visible = active;
      if (active) {
        // Alinear cámara al auto inmediatamente al activar
        currentCamPos.copy(vehicleGroup.position).add(
          new THREE.Vector3(
            -Math.sin(yaw) * camOffset.z,
            camOffset.y,
            -Math.cos(yaw) * camOffset.z
          )
        );
      }
    },
    isActive: () => isActive,
    teleport: (x, z, targetYaw = yaw) => {
      vehicleGroup.position.x = x;
      vehicleGroup.position.z = z;
      // Detección de cota del puente vs terreno
      const onBridge = Math.abs(x) < 6.0 && Math.abs(z) < 115;
      vehicleGroup.position.y = onBridge ? 7.6 : 0.45;
      yaw = targetYaw;
      speed = 0;
      vehicleGroup.rotation.y = yaw;

      // Reubicar cámara de persecución inmediatamente sin arrastre lejano
      const forwardX = Math.sin(yaw);
      const forwardZ = Math.cos(yaw);
      currentCamPos.set(
        x - forwardX * 7.2,
        vehicleGroup.position.y + 2.8,
        z - forwardZ * 7.2
      );
      camera.position.copy(currentCamPos);
      camera.lookAt(x + forwardX * 3.5, vehicleGroup.position.y + 1.2, z + forwardZ * 3.5);
    },
    getSpeedKmh: () => Math.round(Math.abs(speed) * 3.6),
    getSpeedFraction: () => Math.min(1.0, Math.abs(speed) / maxSpeed),
    getPosition: () => vehicleGroup.position,
    getYaw: () => yaw,
    update: (delta, keys) => {
      if (!isActive) return;

      // 1. Controles de aceleración / freno
      const moveForward = keys['KeyW'] || keys['ArrowUp'];
      const moveBackward = keys['KeyS'] || keys['ArrowDown'];
      const handbrake = keys['Space'];

      isBraking = false;

      if (moveForward) {
        if (speed < 0) {
          // Frenar marcha atrás
          speed += brakingPower * delta;
          isBraking = true;
        } else {
          speed = Math.min(maxSpeed, speed + acceleration * delta);
        }
      } else if (moveBackward) {
        if (speed > 0.5) {
          // Frenar avance
          speed = Math.max(0, speed - brakingPower * delta);
          isBraking = true;
        } else {
          // Reversa
          speed = Math.max(maxReverseSpeed, speed - acceleration * 0.7 * delta);
        }
      } else {
        // Fricción natural por inercia
        if (speed > 0) {
          speed = Math.max(0, speed - naturalFriction * delta);
        } else if (speed < 0) {
          speed = Math.min(0, speed + naturalFriction * delta);
        }
      }

      if (handbrake) {
        speed *= Math.max(0, 1.0 - 5.0 * delta);
        isBraking = true;
      }

      // Intensidad de luces de freno traseras
      taillightMat.emissiveIntensity = isBraking ? 3.5 : 0.8;

      // 2. Dirección de ruedas (Steering)
      let targetSteer = 0;
      if (keys['KeyA'] || keys['ArrowLeft']) targetSteer += maxSteerAngle;
      if (keys['KeyD'] || keys['ArrowRight']) targetSteer -= maxSteerAngle;

      steerAngle += (targetSteer - steerAngle) * steerSpeed * delta;

      // Girar las ruedas delanteras visualmente
      frontLeftWheel.rotation.y = steerAngle;
      frontRightWheel.rotation.y = steerAngle;

      // Rotación de rodadura en las 4 ruedas
      wheelRoll += (speed / wheelRadius) * delta;
      frontLeftWheel.children[0].rotation.x = wheelRoll;
      frontRightWheel.children[0].rotation.x = wheelRoll;
      rearLeftWheel.children[0].rotation.x = wheelRoll;
      rearRightWheel.children[0].rotation.x = wheelRoll;

      // 3. Rotación del chasis (Yaw) según velocidad y giro
      if (Math.abs(speed) > 0.1) {
        const turnDirection = speed > 0 ? 1 : -1;
        yaw += steerAngle * (speed / maxSpeed) * 1.8 * turnDirection * delta;
      }

      vehicleGroup.rotation.y = yaw;

      // 4. Traslación del auto
      const forwardX = Math.sin(yaw);
      const forwardZ = Math.cos(yaw);

      vehicleGroup.position.x += forwardX * speed * delta;
      vehicleGroup.position.z += forwardZ * speed * delta;

      // Cota de altura (Puente vs Calle)
      const onBridge = Math.abs(vehicleGroup.position.x) < 5.5 && Math.abs(vehicleGroup.position.z) < 115;
      const targetY = onBridge ? 7.6 : 0.45;
      vehicleGroup.position.y += (targetY - vehicleGroup.position.y) * 8.0 * delta;

      // Inclinación sutil de carrocería en curvas (Body Roll)
      vehicleGroup.rotation.z = -steerAngle * (speed / maxSpeed) * 0.12;
      vehicleGroup.rotation.x = (speed / maxSpeed) * 0.04;

      // 5. Cámara de Persecución (Chase Camera) en 3ª Persona
      const idealCamX = vehicleGroup.position.x - forwardX * 7.2;
      const idealCamY = vehicleGroup.position.y + 2.8 + Math.abs(speed) * 0.03;
      const idealCamZ = vehicleGroup.position.z - forwardZ * 7.2;

      // Interpolación suave (Lerp)
      currentCamPos.lerp(new THREE.Vector3(idealCamX, idealCamY, idealCamZ), 0.12);
      camera.position.copy(currentCamPos);

      // Mirar ligeramente por delante de la trompa del auto
      const lookTarget = new THREE.Vector3(
        vehicleGroup.position.x + forwardX * 3.5,
        vehicleGroup.position.y + 1.2,
        vehicleGroup.position.z + forwardZ * 3.5
      );
      camera.lookAt(lookTarget);
    }
  };
}
