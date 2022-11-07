import { useEffect, useRef } from 'react';
import Mesh from '../utils/Mesh';
import Scene from '../utils/Scene';

export default function WebGLCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    (async () => {
      if (canvasRef.current === null) throw new Error('Canvas ref is unexpectedly null!');

      const gl = canvasRef.current.getContext('webgl2');
      if (gl === null) throw new Error('Failed to create a webgl2 context.');

      const [vertexShaderSource, fragmentShaderSource] = await Promise.all([
        fetch(`${process.env.PUBLIC_URL}/shaders/vertex.vs`).then(response => response.text()),
        fetch(`${process.env.PUBLIC_URL}/shaders/fragment.fs`).then(response => response.text())
      ]);

      const scene = new Scene(gl, [vertexShaderSource, fragmentShaderSource]);

      const vertexData = new Float32Array([
        // Front face
        -1.0, -1.0, 1.0, 0.0, 0.0, 1.0,
        1.0, 1.0, 1.0, 0.0, 0.0, 1.0,
        -1.0, 1.0, 1.0, 0.0, 0.0, 1.0,
        -1.0, -1.0, 1.0, 0.0, 0.0, 1.0,
        1.0, -1.0, 1.0, 0.0, 0.0, 1.0,
        1.0, 1.0, 1.0, 0.0, 0.0, 1.0,

        // Back face
        1.0, -1.0, -1.0, 0.0, 0.0, -1.0,
        -1.0, 1.0, -1.0, 0.0, 0.0, -1.0,
        1.0, 1.0, -1.0, 0.0, 0.0, -1.0,
        1.0, -1.0, -1.0, 0.0, 0.0, -1.0,
        -1.0, -1.0, -1.0, 0.0, 0.0, -1.0,
        -1.0, 1.0, -1.0, 0.0, 0.0, -1.0,

        // Right face
        1.0, -1.0, 1.0, 1.0, 0.0, 0.0,
        1.0, 1.0, -1.0, 1.0, 0.0, 0.0,
        1.0, 1.0, 1.0, 1.0, 0.0, 0.0,
        1.0, -1.0, 1.0, 1.0, 0.0, 0.0,
        1.0, -1.0, -1.0, 1.0, 0.0, 0.0,
        1.0, 1.0, -1.0, 1.0, 0.0, 0.0,

        // Left face
        -1.0, 1.0, 1.0, -1.0, 0.0, 0.0,
        -1.0, -1.0, -1.0, -1.0, 0.0, 0.0,
        -1.0, -1.0, 1.0, -1.0, 0.0, 0.0,
        -1.0, 1.0, 1.0, -1.0, 0.0, 0.0,
        -1.0, 1.0, -1.0, -1.0, 0.0, 0.0,
        -1.0, -1.0, -1.0, -1.0, 0.0, 0.0,

        // Top face
        -1.0, 1.0, 1.0, 0.0, 1.0, 0.0,
        1.0, 1.0, -1.0, 0.0, 1.0, 0.0,
        -1.0, 1.0, -1.0, 0.0, 1.0, 0.0,
        -1.0, 1.0, 1.0, 0.0, 1.0, 0.0,
        1.0, 1.0, 1.0, 0.0, 1.0, 0.0,
        1.0, 1.0, -1.0, 0.0, 1.0, 0.0,

        // Bottom face
        -1.0, -1.0, -1.0, 0.0, -1.0, 0.0,
        1.0, -1.0, 1.0, 0.0, -1.0, 0.0,
        -1.0, -1.0, 1.0, 0.0, -1.0, 0.0,
        -1.0, -1.0, -1.0, 0.0, -1.0, 0.0,
        1.0, -1.0, -1.0, 0.0, -1.0, 0.0,
        1.0, -1.0, 1.0, 0.0, -1.0, 0.0,
      ]);
      const mesh = new Mesh(vertexData, 36);
      scene.setMesh(mesh);

      scene.setRunning(true);
    })();
  }, []);

  return <canvas ref={canvasRef} style={{ width: '100%', height: '100%' }} />;
}
