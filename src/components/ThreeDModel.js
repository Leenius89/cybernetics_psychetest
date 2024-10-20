import React, { useRef, useMemo, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass';

const ThreeDModel = ({ interaction }) => {
  const meshRef = useRef();
  const linesRef = useRef();
  const facesRef = useRef();
  const composerRef = useRef();
  const interactionRef = useRef(0);
  const pulseRef = useRef(0);
  const mouseRef = useRef(new THREE.Vector2());

  const { gl, scene, camera, size } = useThree();

  const pointCount = 1000;
  const maxConnections = 3;


  const noiseTexture = useMemo(() => {
    const size = 256;
    const data = new Uint8Array(size * size * size);
    for (let i = 0; i < size * size * size; i++) {
      data[i] = Math.random() * 255;
    }
    const texture = new THREE.Data3DTexture(data, size, size, size);
    texture.format = THREE.RedFormat;
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;
    texture.unpackAlignment = 1;
    texture.needsUpdate = true;
    return texture;
  }, []);

  const generatePoints = () => {
    const positions = [];
    const sizes = [];
    const lifetimes = [];

    for (let i = 0; i < pointCount; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);
      const r = 0.8 + (Math.random() - 0.5) * 0.2; // Reduced radius

      const x = r * Math.sin(phi) * Math.cos(theta);
      const y = r * Math.sin(phi) * Math.sin(theta);
      const z = r * Math.cos(phi);

      positions.push(x, y, z);
      sizes.push(Math.random() * 0.02 + 0.005); // Reduced sizes
      lifetimes.push(Math.random() * 5);
    }

    return { positions, sizes, lifetimes };
  };

  const [positions, sizes, lifetimes] = useMemo(() => {
    const { positions, sizes, lifetimes } = generatePoints();
    return [
      new Float32Array(positions),
      new Float32Array(sizes),
      new Float32Array(lifetimes)
    ];
  }, []);

  const updatePoints = (state) => {
    const positionAttr = meshRef.current.geometry.attributes.position;
    const sizeAttr = meshRef.current.geometry.attributes.size;
    const lifetimeAttr = meshRef.current.geometry.attributes.lifetime;

    const time = state.clock.getElapsedTime();
    const interactionStrength = interactionRef.current;
    const pulseStrength = pulseRef.current;

    for (let i = 0; i < pointCount; i++) {
      lifetimeAttr.array[i] -= 0.016;

      if (lifetimeAttr.array[i] <= 0) {
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(Math.random() * 2 - 1);
        const r = 1 + (Math.random() - 0.5) * 0.3;

        positionAttr.array[i * 3] = r * Math.sin(phi) * Math.cos(theta);
        positionAttr.array[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
        positionAttr.array[i * 3 + 2] = r * Math.cos(phi);

        sizeAttr.array[i] = Math.random() * 0.05 + 0.02;
        lifetimeAttr.array[i] = Math.random() * 5;
      }

      const index = i * 3;
      const noiseScale = 0.5;
      const noise = (
        Math.sin(positionAttr.array[index] * noiseScale + time) *
        Math.cos(positionAttr.array[index + 1] * noiseScale + time) *
        Math.sin(positionAttr.array[index + 2] * noiseScale + time)
      ) * 0.1;
      
      const direction = new THREE.Vector3(
        positionAttr.array[index],
        positionAttr.array[index + 1],
        positionAttr.array[index + 2]
      ).normalize();

      const pulse = Math.sin(time * 5) * pulseStrength * 0.1;

      positionAttr.array[index] += direction.x * (noise + pulse) * interactionStrength;
      positionAttr.array[index + 1] += direction.y * (noise + pulse) * interactionStrength;
      positionAttr.array[index + 2] += direction.z * (noise + pulse) * interactionStrength;

      sizeAttr.array[i] *= 1 + pulse * 0.3;
    }

    positionAttr.needsUpdate = true;
    sizeAttr.needsUpdate = true;
    lifetimeAttr.needsUpdate = true;

    const linePositions = [];
    const lineIndices = [];
    const facePositions = [];
    const faceIndices = [];

    for (let i = 0; i < pointCount; i++) {
      const connections = [];
      for (let j = i + 1; j < pointCount; j++) {
        const dx = positionAttr.array[i * 3] - positionAttr.array[j * 3];
        const dy = positionAttr.array[i * 3 + 1] - positionAttr.array[j * 3 + 1];
        const dz = positionAttr.array[i * 3 + 2] - positionAttr.array[j * 3 + 2];
        const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);

        if (distance < 0.5) {
          connections.push(j);
          if (connections.length >= maxConnections) break;
        }
      }

      for (const j of connections) {
        linePositions.push(
          positionAttr.array[i * 3], positionAttr.array[i * 3 + 1], positionAttr.array[i * 3 + 2],
          positionAttr.array[j * 3], positionAttr.array[j * 3 + 1], positionAttr.array[j * 3 + 2]
        );
        lineIndices.push(linePositions.length / 3 - 2, linePositions.length / 3 - 1);

        if (connections.length > 1) {
          const k = connections[1];
          facePositions.push(
            positionAttr.array[i * 3], positionAttr.array[i * 3 + 1], positionAttr.array[i * 3 + 2],
            positionAttr.array[j * 3], positionAttr.array[j * 3 + 1], positionAttr.array[j * 3 + 2],
            positionAttr.array[k * 3], positionAttr.array[k * 3 + 1], positionAttr.array[k * 3 + 2]
          );
          faceIndices.push(facePositions.length / 3 - 3, facePositions.length / 3 - 2, facePositions.length / 3 - 1);
        }
      }
    }

    linesRef.current.geometry.setAttribute('position', new THREE.Float32BufferAttribute(linePositions, 3));
    linesRef.current.geometry.setIndex(lineIndices);

    facesRef.current.geometry.setAttribute('position', new THREE.Float32BufferAttribute(facePositions, 3));
    facesRef.current.geometry.setIndex(faceIndices);
  };

  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geo.setAttribute('size', new THREE.Float32BufferAttribute(sizes, 1));
    geo.setAttribute('lifetime', new THREE.Float32BufferAttribute(lifetimes, 1));
    return geo;
  }, [positions, sizes, lifetimes]);

  const pointMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        interaction: { value: 0 },
        colorPhase: { value: 0 },
        noiseTexture: { value: noiseTexture },
      },
      vertexShader: `
        attribute float size;
        attribute float lifetime;
        varying vec3 vColor;
        varying vec3 vPosition;
        varying float vLifetime;
        uniform float time;
        uniform float interaction;
        uniform float colorPhase;
        uniform sampler3D noiseTexture;
        
        vec3 getColor(float t) {
          vec3 colors[5] = vec3[5](
            vec3(0.0, 0.1, 0.5),  // Deep Blue
            vec3(0.0, 0.5, 1.0),  // Bright Blue
            vec3(0.0, 1.0, 1.0),  // Cyan
            vec3(0.5, 1.0, 0.5),  // Bright Green
            vec3(1.0, 1.0, 0.0)   // Yellow
          );
          
          float index = t * 4.0;
          int i = int(floor(index));
          float f = fract(index);
          
          if (i >= 4) return colors[4];
          return mix(colors[i], colors[i + 1], f);
        }

        void main() {
          vPosition = position;
          vLifetime = lifetime;
          
          vec3 samplePos = position * 0.5 + 0.5;
          float noise = texture(noiseTexture, samplePos + vec3(time * 0.1)).r;
          
          float t = fract(colorPhase + length(position) * 0.5 + noise * 0.2);
          vColor = getColor(t);
          
          vec3 pos = position;
          pos += normalize(pos) * (noise * 0.1 + sin(time * 2.0) * 0.05) * (1.0 + interaction);
          
          vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
          gl_Position = projectionMatrix * mvPosition;
          
          float distanceScale = 1.0 / length(mvPosition.xyz) * 2.0;
          gl_PointSize = size * (300.0 * distanceScale);
        }
      `,
      fragmentShader: `
        varying vec3 vPosition;
        varying float vLifetime;
        varying vec3 vColor;
        
        void main() {
          float dist = length(gl_PointCoord - vec2(0.3));
          if (dist > 0.1) discard;
          
          float opacity = smoothstep(0.5, 0.0, dist) * (vLifetime / 5.0);
          vec3 glowColor = mix(vColor, vec3(1.0), 1.0 - opacity);
          
          gl_FragColor = vec4(glowColor, opacity);
        }
      `,
      transparent: true,
      blending: THREE.AdditiveBlending,
    });
  }, [noiseTexture]);

  // ... (lineMaterial and faceMaterial remain similar)

  useEffect(() => {
    const composer = new EffectComposer(gl);
    const renderPass = new RenderPass(scene, camera);
    composer.addPass(renderPass);

    const bloomPass = new UnrealBloomPass(new THREE.Vector2(size.width, size.height), 1.5, 0.4, 0.85);
    composer.addPass(bloomPass);

    composerRef.current = composer;

    return () => {
      composer.dispose();
    };
  }, [gl, scene, camera, size]);


  useEffect(() => {
    const updateMousePosition = (event) => {
      mouseRef.current.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouseRef.current.y = -(event.clientY / window.innerHeight) * 2 + 1;
    };

    window.addEventListener('mousemove', updateMousePosition);

    return () => {
      window.removeEventListener('mousemove', updateMousePosition);
    };
  }, []);

  useFrame((state) => {
    if (meshRef.current && linesRef.current && facesRef.current) {
      const targetRotationY = mouseRef.current.x * Math.PI * 0.5;
      const targetRotationX = -mouseRef.current.y * Math.PI * 0.5;

      meshRef.current.rotation.y += (targetRotationY - meshRef.current.rotation.y) * 0.1;
      meshRef.current.rotation.x += (targetRotationX - meshRef.current.rotation.x) * 0.1;
      linesRef.current.rotation.copy(meshRef.current.rotation);
      facesRef.current.rotation.copy(meshRef.current.rotation);

      const time = state.clock.getElapsedTime();
      meshRef.current.material.uniforms.time.value = time;
      meshRef.current.material.uniforms.colorPhase.value = (Math.sin(time * 0.05) + 1) * 0.5;
      facesRef.current.material.uniforms.time.value = time;
      facesRef.current.material.uniforms.colorPhase.value = (Math.sin(time * 0.05) + 1) * 0.5;
      
      interactionRef.current = THREE.MathUtils.lerp(
        interactionRef.current,
        interaction ? 1 : 0,
        0.1
      );
      pulseRef.current = THREE.MathUtils.lerp(
        pulseRef.current,
        interaction ? 1 : 0,
        0.2
      );
      meshRef.current.material.uniforms.interaction.value = interactionRef.current;

      updatePoints(state);

      composerRef.current.render();
    }
  });

  return (
    <>
      <points ref={meshRef} geometry={geometry} material={pointMaterial} />
      <lineSegments ref={linesRef}>
        <bufferGeometry />
        <lineBasicMaterial attach="material" color="#ffffff" transparent opacity={0.2} blending={THREE.AdditiveBlending} />
      </lineSegments>
      <mesh ref={facesRef}>
        <bufferGeometry />
        <shaderMaterial
          attach="material"
          args={[{
            uniforms: {
              time: { value: 0 },
              colorPhase: { value: 0 },
            },
            vertexShader: `
              varying vec3 vPosition;
              uniform float time;
              
              void main() {
                vPosition = position;
                vec3 pos = position;
                pos += normal * sin(time * 2.0 + length(position) * 5.0) * 0.02;
                gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
              }
            `,
            fragmentShader: `
              varying vec3 vPosition;
              uniform float colorPhase;
              
              vec3 getColor(float t) {
                vec3 colors[5] = vec3[5](
                  vec3(0.0, 0.1, 0.5),
                  vec3(0.0, 0.5, 1.0),
                  vec3(0.0, 1.0, 1.0),
                  vec3(0.5, 1.0, 0.5),
                  vec3(1.0, 1.0, 0.0)
                );
                
                float index = t * 4.0;
                int i = int(floor(index));
                float f = fract(index);
                
                if (i >= 4) return colors[4];
                return mix(colors[i], colors[i + 1], f);
              }
              
              void main() {
                float t = fract(colorPhase + length(vPosition) * 0.5);
                vec3 color = getColor(t);
                gl_FragColor = vec4(color, 0.1);
              }
            `,
            transparent: true,
            blending: THREE.AdditiveBlending,
            side: THREE.DoubleSide,
          }]}
        />
      </mesh>
    </>
  );
};

export default ThreeDModel;