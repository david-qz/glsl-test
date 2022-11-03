import { useEffect, useRef } from 'react';
import Mesh from '../utils/Mesh';
import Scene from '../utils/Scene';

export default function WebGLCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    (async () => {
      if (canvasRef.current === null) throw new Error('Canvas ref is unexpectedly null!');
      const canvas = canvasRef.current;
      canvas.width = canvas.clientWidth;
      canvas.height = canvas.clientHeight;

      const gl = canvasRef.current.getContext('webgl2');
      if (gl === null) throw new Error('Failed to create a webgl2 context.');

      const vertexShaderSource: string = await fetch(`${process.env.PUBLIC_URL}/shaders/vertex.vs`).then(response => response.text());
      const fragmentShaderSource: string = await fetch(`${process.env.PUBLIC_URL}/shaders/fragment.fs`).then(response => response.text());

      const scene = new Scene(gl, [vertexShaderSource, fragmentShaderSource]);

      const vertexData = new Float32Array([
        -1.0, -1.0, 0.0,
        1.0, 1.0, 0.0,
        -1.0, 1.0, 0.0,
        -1.0, -1.0, 0.0,
        1.0, -1.0, 0.0,
        1.0, 1.0, 0.0,
      ]);
      const mesh = new Mesh(vertexData, 6);
      scene.addMesh(mesh);

      scene.render();
    })();
  }, []);

  return <canvas ref={canvasRef} style={{ width: '100%', height: '100%' }} />;
}
