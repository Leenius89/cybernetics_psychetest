import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const TextMotion = ({ message }) => {
  const meshRef = useRef();
  const linesRef = useRef();

  const pointCount = 2000; // 점의 수를 늘립니다
  const maxConnections = 3;

  const generateTextPoints = (text) => {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    canvas.width = 512; // 캔버스 크기를 늘립니다
    canvas.height = 512;
    context.fillStyle = 'black';
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.font = 'Bold 48px Arial'; // 폰트 크기를 키웁니다
    context.fillStyle = 'white';
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillText(text, 256, 256);

    const imageData = context.getImageData(0, 0, 512, 512);
    const pixels = imageData.data;

    const positions = [];
    const sizes = [];
    const colors = [];

    for (let i = 0; i < pointCount; i++) {
      let x, y;
      do {
        x = Math.floor(Math.random() * 512);
        y = Math.floor(Math.random() * 512);
      } while (pixels[(y * 512 + x) * 4] < 128); // 밝은 픽셀만 선택합니다

      positions.push((x - 256) / 128, -(y - 256) / 128, 0);
      sizes.push(Math.random() * 0.05 + 0.02); // 점 크기를 키웁니다
      colors.push(1, 1, 1); // 흰색으로 통일합니다
    }

    return { positions, sizes, colors };
  };

  const [positions, sizes, colors] = useMemo(() => {
    const { positions, sizes, colors } = generateTextPoints(message);
    return [
      new Float32Array(positions),
      new Float32Array(sizes),
      new Float32Array(colors)
    ];
  }, [message]);

  const updatePoints = (time) => {
    const positionAttr = meshRef.current.geometry.attributes.position;

    for (let i = 0; i < pointCount; i++) {
      const index = i * 3;
      const noise = Math.sin(positionAttr.array[index] * 5 + time) *
                    Math.cos(positionAttr.array[index + 1] * 5 + time) * 0.005; // 움직임을 줄입니다

      positionAttr.array[index + 2] = noise;
    }

    positionAttr.needsUpdate = true;

    const linePositions = [];
    const lineIndices = [];

    for (let i = 0; i < pointCount; i++) {
      const connections = [];
      for (let j = 0; j < pointCount; j++) {
        if (i !== j) {
          const dx = positionAttr.array[i * 3] - positionAttr.array[j * 3];
          const dy = positionAttr.array[i * 3 + 1] - positionAttr.array[j * 3 + 1];
          const dz = positionAttr.array[i * 3 + 2] - positionAttr.array[j * 3 + 2];
          const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);

          if (distance < 0.1) {
            connections.push(j);
            if (connections.length >= maxConnections) break;
          }
        }
      }

      for (const j of connections) {
        linePositions.push(
          positionAttr.array[i * 3], positionAttr.array[i * 3 + 1], positionAttr.array[i * 3 + 2],
          positionAttr.array[j * 3], positionAttr.array[j * 3 + 1], positionAttr.array[j * 3 + 2]
        );
        lineIndices.push(linePositions.length / 3 - 2, linePositions.length / 3 - 1);
      }
    }

    linesRef.current.geometry.setAttribute('position', new THREE.Float32BufferAttribute(linePositions, 3));
    linesRef.current.geometry.setIndex(lineIndices);
  };

  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geo.setAttribute('size', new THREE.Float32BufferAttribute(sizes, 1));
    geo.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    return geo;
  }, [positions, sizes, colors]);

  const material = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
      },
      vertexShader: `
        attribute float size;
        varying vec3 vColor;
        uniform float time;
        
        void main() {
          vColor = color;
          vec3 pos = position;
          pos.z += sin(pos.x * 5.0 + time) * cos(pos.y * 5.0 + time) * 0.005;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
          gl_PointSize = size * 1000.0 * (1.0 / -viewMatrix[2].z); // 점 크기를 화면 크기에 맞게 조정
        }
      `,
      fragmentShader: `
        varying vec3 vColor;
        
        void main() {
          if (length(gl_PointCoord - vec2(0.5)) > 0.5) discard;
          gl_FragColor = vec4(vColor, 1.0);
        }
      `,
      transparent: true,
      blending: THREE.AdditiveBlending,
    });
  }, []);

  const lineMaterial = useMemo(() => {
    return new THREE.LineBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.2,
      blending: THREE.AdditiveBlending,
    });
  }, []);

  useFrame((state) => {
    if (meshRef.current && linesRef.current) {
      const time = state.clock.getElapsedTime();
      meshRef.current.material.uniforms.time.value = time;
      updatePoints(time);
    }
  });
  return (
    <group position={[0, 0, -1]}> {/* 텍스트를 앞으로 이동 */}
      <points ref={meshRef} geometry={geometry} material={material} />
      <lineSegments ref={linesRef}>
        <bufferGeometry />
        <lineBasicMaterial attach="material" {...lineMaterial} />
      </lineSegments>
    </group>
  );
};

export default TextMotion;