import Mesh from './Mesh';
import { initShaderProgram } from './shaders';
import { mat4 } from 'gl-matrix';

export default class Scene {
  gl: WebGL2RenderingContext;
  meshes: Array<Mesh> = [];
  // FIXME: come up with some way to type this thing (probably by improving shader program loading)
  programInfo: { program: WebGLProgram; attribLocations: { vertexPosition: number; }; uniformLocations: { projectionMatrix: WebGLUniformLocation | null; modelViewMatrix: WebGLUniformLocation | null; }; };

  constructor(gl: WebGL2RenderingContext, shaderSources: [string, string]) {
    this.gl = gl;

    const shaderProgram = initShaderProgram(gl, shaderSources[0], shaderSources[1]);
    this.programInfo = {
      program: shaderProgram,
      attribLocations: {
        vertexPosition: gl.getAttribLocation(shaderProgram, 'aVertexPosition'),
      },
      uniformLocations: {
        projectionMatrix: gl.getUniformLocation(shaderProgram, 'uProjectionMatrix'),
        modelViewMatrix: gl.getUniformLocation(shaderProgram, 'uModelViewMatrix'),
      },
    };
  }

  addMesh(mesh: Mesh) {
    this.meshes.push(mesh);
  }

  render() {
    const gl = this.gl;

    gl.clearColor(0.0, 0.0, 0.0, 1.0);  // Clear to black, fully opaque
    gl.clearDepth(1.0);                 // Clear everything
    gl.enable(gl.DEPTH_TEST);           // Enable depth testing
    gl.depthFunc(gl.LEQUAL);            // Near things obscure far things
    gl.enable(gl.CULL_FACE);

    // Clear the canvas before we start drawing on it.
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // Create a perspective matrix, a special matrix that is
    // used to simulate the distortion of perspective in a camera.
    // Our field of view is 45 degrees, with a width/height
    // ratio that matches the display size of the canvas
    // and we only want to see objects between 0.1 units
    // and 100 units away from the camera.
    const fieldOfView = 45 * Math.PI / 180;   // in radians
    const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
    const zNear = 0.1;
    const zFar = 100.0;

    const projectionMatrix = mat4.create();
    mat4.perspective(projectionMatrix, fieldOfView, aspect, zNear, zFar);

    const modelViewMatrix = mat4.create();
    mat4.translate(modelViewMatrix, modelViewMatrix, [-0.0, 0.0, -6.0]);

    const buffer = gl.createBuffer();
    if (buffer === null) throw new Error('Failed to create gl buffer.');
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);

    // Tell WebGL how to pull out the positions from the position
    // buffer into the vertexPosition attribute.
    const numComponents = 3;  // pull out 2 values per iteration
    const type = gl.FLOAT;    // the data in the buffer is 32bit floats
    const normalize = false;  // don't normalize
    const stride = 0;         // how many bytes to get from one set of values to the next
                                // 0 = use type and numComponents above
    const offset = 0;         // how many bytes inside the buffer to start from
    gl.vertexAttribPointer(
      this.programInfo.attribLocations.vertexPosition,
      numComponents,
      type,
      normalize,
      stride,
      offset);
    gl.enableVertexAttribArray(this.programInfo.attribLocations.vertexPosition);

    // Tell WebGL to use our program when drawing
    gl.useProgram(this.programInfo.program);

    // Set the shader uniforms
    gl.uniformMatrix4fv(this.programInfo.uniformLocations.projectionMatrix, false, projectionMatrix);
    gl.uniformMatrix4fv(this.programInfo.uniformLocations.modelViewMatrix, false, modelViewMatrix);

    for (const mesh of this.meshes) {
      gl.bufferData(gl.ARRAY_BUFFER, mesh.vertexData, gl.STATIC_DRAW, 0);
      gl.drawArrays(gl.TRIANGLES, 0, mesh.vertexCount);
    }
  }
}
