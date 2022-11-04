import Mesh from './Mesh';
import { initShaderProgram, ProgramInfo } from './shaders';
import { mat4 } from 'gl-matrix';

export default class Scene {
  gl: WebGL2RenderingContext;
  meshes: Array<Mesh> = [];
  program: WebGLProgram;
  programInfo: ProgramInfo;

  constructor(gl: WebGL2RenderingContext, shaderSources: [string, string]) {
    this.gl = gl;

    const [shaderProgram, programInfo] = initShaderProgram(gl, shaderSources[0], shaderSources[1]);
    this.program = shaderProgram;
    this.programInfo = programInfo;
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

    // FIXME: Make it so the program is verified ahead of time so we don't need to null check this stuff!
    const positionAttributeInfo = this.programInfo.attributes.get('aVertexPosition');
    if (!positionAttributeInfo) throw new Error('The shader does not have a aVertexPosition attribute!');
    gl.vertexAttribPointer(positionAttributeInfo.location, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(positionAttributeInfo.location);

    // Set the shader uniforms
    // FIXME: Bad! See above.
    const projectionMatrixUniformInfo = this.programInfo.uniforms.get('uProjectionMatrix');
    if (!projectionMatrixUniformInfo) throw new Error('The shader does not have a uProjectionMatrix uniform!');
    const modelViewMatrixUniformInfo = this.programInfo.uniforms.get('uModelViewMatrix');
    if (!modelViewMatrixUniformInfo) throw new Error('The shader does not have a uModelViewMatrix uniform!');

    // Tell WebGL to use our program when drawing
    gl.useProgram(this.program);

    gl.uniformMatrix4fv(projectionMatrixUniformInfo.location, false, projectionMatrix);
    gl.uniformMatrix4fv(modelViewMatrixUniformInfo.location, false, modelViewMatrix);

    for (const mesh of this.meshes) {
      gl.bufferData(gl.ARRAY_BUFFER, mesh.vertexData, gl.STATIC_DRAW, 0);
      gl.drawArrays(gl.TRIANGLES, 0, mesh.vertexCount);
    }
  }
}
