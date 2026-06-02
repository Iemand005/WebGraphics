/**
 * @param {HTMLCanvasElement} canvas
 */
function Graphics3D(canvas) {
  /* @type {HTMLCanvasElement} */
  this.canvas = canvas;
  this.gl = canvas.getContext("webgl");
  this.ie11 = false;
  if (!this.gl) {
    this.gl = canvas.getContext("experimental-webgl");
    if (this.gl) this.ie11 = true;
  }

  this.gl.clearColor(0, 0, 0, 0);

  this.buffers = {
    position: [],
    indices: [],
    color: []
  };

  this.renderTarget = null;
  this.blitProgram = null;
  this.blitBuffer = null;
  this.blitAttribLocation = -1;
  this.blitTextureLocation = null;

  this.onrender = function () {};
}


var mat4 = {
  create: function () {
    return [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
  },

  multiply: function (out, a, b) {
    var a00 = a[0],
      a01 = a[1],
      a02 = a[2],
      a03 = a[3];
    var a10 = a[4],
      a11 = a[5],
      a12 = a[6],
      a13 = a[7];
    var a20 = a[8],
      a21 = a[9],
      a22 = a[10],
      a23 = a[11];
    var a30 = a[12],
      a31 = a[13],
      a32 = a[14],
      a33 = a[15];

    var b00 = b[0],
      b01 = b[1],
      b02 = b[2],
      b03 = b[3];
    var b10 = b[4],
      b11 = b[5],
      b12 = b[6],
      b13 = b[7];
    var b20 = b[8],
      b21 = b[9],
      b22 = b[10],
      b23 = b[11];
    var b30 = b[12],
      b31 = b[13],
      b32 = b[14],
      b33 = b[15];

    out[0] = a00 * b00 + a10 * b01 + a20 * b02 + a30 * b03;
    out[1] = a01 * b00 + a11 * b01 + a21 * b02 + a31 * b03;
    out[2] = a02 * b00 + a12 * b01 + a22 * b02 + a32 * b03;
    out[3] = a03 * b00 + a13 * b01 + a23 * b02 + a33 * b03;
    out[4] = a00 * b10 + a10 * b11 + a20 * b12 + a30 * b13;
    out[5] = a01 * b10 + a11 * b11 + a21 * b12 + a31 * b13;
    out[6] = a02 * b10 + a12 * b11 + a22 * b12 + a32 * b13;
    out[7] = a03 * b10 + a13 * b11 + a23 * b12 + a33 * b13;
    out[8] = a00 * b20 + a10 * b21 + a20 * b22 + a30 * b23;
    out[9] = a01 * b20 + a11 * b21 + a21 * b22 + a31 * b23;
    out[10] = a02 * b20 + a12 * b21 + a22 * b22 + a32 * b23;
    out[11] = a03 * b20 + a13 * b21 + a23 * b22 + a33 * b23;
    out[12] = a00 * b30 + a10 * b31 + a20 * b32 + a30 * b33;
    out[13] = a01 * b30 + a11 * b31 + a21 * b32 + a31 * b33;
    out[14] = a02 * b30 + a12 * b31 + a22 * b32 + a32 * b33;
    out[15] = a03 * b30 + a13 * b31 + a23 * b32 + a33 * b33;
    return out;
  },

  perspective: function (out, fovy, aspect, near, far) {
    var f = 1 / Math.tan(fovy / 2);
    out[0] = f / aspect;
    out[1] = 0;
    out[2] = 0;
    out[3] = 0;
    out[4] = 0;
    out[5] = f;
    out[6] = 0;
    out[7] = 0;
    out[8] = 0;
    out[9] = 0;
    out[11] = -1;
    out[12] = 0;
    out[13] = 0;
    out[15] = 0;

    if (far == null || far === Infinity) {
      out[10] = -1;
      out[14] = -2 * near;
    } else {
      var nf = 1 / (near - far);
      out[10] = (far + near) * nf;
      out[14] = 2 * far * near * nf;
    }

    return out;
  },

  translate: function (out, a, v) {
    var x = v[0],
      y = v[1],
      z = v[2];
    if (a === out) {
      out[12] = a[0] * x + a[4] * y + a[8] * z + a[12];
      out[13] = a[1] * x + a[5] * y + a[9] * z + a[13];
      out[14] = a[2] * x + a[6] * y + a[10] * z + a[14];
      out[15] = a[3] * x + a[7] * y + a[11] * z + a[15];
      return out;
    }

    out[0] = a[0];
    out[1] = a[1];
    out[2] = a[2];
    out[3] = a[3];
    out[4] = a[4];
    out[5] = a[5];
    out[6] = a[6];
    out[7] = a[7];
    out[8] = a[8];
    out[9] = a[9];
    out[10] = a[10];
    out[11] = a[11];
    out[12] = a[0] * x + a[4] * y + a[8] * z + a[12];
    out[13] = a[1] * x + a[5] * y + a[9] * z + a[13];
    out[14] = a[2] * x + a[6] * y + a[10] * z + a[14];
    out[15] = a[3] * x + a[7] * y + a[11] * z + a[15];
    return out;
  },

  rotate: function (out, a, rad, axis) {
    var x = axis[0],
      y = axis[1],
      z = axis[2];
    var len = Math.sqrt(x * x + y * y + z * z);
    if (!len) return null;

    x /= len;
    y /= len;
    z /= len;

    var s = Math.sin(rad);
    var c = Math.cos(rad);
    var t = 1 - c;

    var a00 = a[0],
      a01 = a[1],
      a02 = a[2],
      a03 = a[3];
    var a10 = a[4],
      a11 = a[5],
      a12 = a[6],
      a13 = a[7];
    var a20 = a[8],
      a21 = a[9],
      a22 = a[10],
      a23 = a[11];
    var a30 = a[12],
      a31 = a[13],
      a32 = a[14],
      a33 = a[15];

    var b00 = x * x * t + c;
    var b01 = y * x * t + z * s;
    var b02 = z * x * t - y * s;
    var b10 = x * y * t - z * s;
    var b11 = y * y * t + c;
    var b12 = z * y * t + x * s;
    var b20 = x * z * t + y * s;
    var b21 = y * z * t - x * s;
    var b22 = z * z * t + c;

    out[0] = a00 * b00 + a10 * b01 + a20 * b02;
    out[1] = a01 * b00 + a11 * b01 + a21 * b02;
    out[2] = a02 * b00 + a12 * b01 + a22 * b02;
    out[3] = a03 * b00 + a13 * b01 + a23 * b02;
    out[4] = a00 * b10 + a10 * b11 + a20 * b12;
    out[5] = a01 * b10 + a11 * b11 + a21 * b12;
    out[6] = a02 * b10 + a12 * b11 + a22 * b12;
    out[7] = a03 * b10 + a13 * b11 + a23 * b12;
    out[8] = a00 * b20 + a10 * b21 + a20 * b22;
    out[9] = a01 * b20 + a11 * b21 + a21 * b22;
    out[10] = a02 * b20 + a12 * b21 + a22 * b22;
    out[11] = a03 * b20 + a13 * b21 + a23 * b22;
    out[12] = a30;
    out[13] = a31;
    out[14] = a32;
    out[15] = a33;
    return out;
  }
};

/**
 * 
 * @param {number | {x:number,y:number,z:number}} x 
 * @param {number} y 
 * @param {number} z 
 */
function Vector3D(x, y, z) {
    this.x = 0;
    this.y = 0;
    this.z = 0;
    if (typeof x === "number") {
        this.x = x;
        if (y == null && z == null) 
            this.y = x, this.z = x;
        else this.y = y, this.z = z;
    } else if (typeof x === "object" && x.x && x.y && x.z) {
        this.x = x.x, this.y = x.y, this.z = x.z;
    }
}

/** @param {number} amount */
Vector3D.prototype.div = function (amount) {
    this.x /= amount, this.y /= amount, this.z /= amount;
    return this;
}

Vector3D.prototype.normalize = function () {
    return this.div(this.x + this.y + this.z);
}

Graphics3D.prototype.clear = function () {
  this.gl.clear(this.gl.COLOR_BUFFER_BIT);
};

Graphics3D.prototype.setClearColor = function (r, g, b, a) {
  this.gl.clearColor(r, g, b, a);
};

Graphics3D.prototype.setRenderTarget = function (renderTarget) {
  this.renderTarget = renderTarget;
};

Graphics3D.prototype.initBlitResources = function () {
  if (this.blitProgram) return;

  const gl = this.gl;
  const vsSource =
    "attribute vec2 aPosition; varying vec2 vUv; void main() { vUv = aPosition * 0.5 + 0.5; gl_Position = vec4(aPosition, 0.0, 1.0); }";
  const fsSource =
    "precision mediump float; uniform sampler2D uTexture; varying vec2 vUv; void main() { gl_FragColor = texture2D(uTexture, vUv); }";

  const vertexShader = this.loadShader(gl.VERTEX_SHADER, vsSource);
  const fragmentShader = this.loadShader(gl.FRAGMENT_SHADER, fsSource);
  const program = gl.createProgram();
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    alert(
      "Unable to initialize the blit shader program: " +
        gl.getProgramInfoLog(program)
    );
    return;
  }

  this.blitProgram = program;
  this.blitAttribLocation = gl.getAttribLocation(program, "aPosition");
  this.blitTextureLocation = gl.getUniformLocation(program, "uTexture");

  this.blitBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, this.blitBuffer);
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
    gl.STATIC_DRAW
  );
};

Graphics3D.prototype.presentRenderTarget = function () {
  const gl = this.gl;
  if (!this.renderTarget) return;
  if (!this.blitProgram) this.initBlitResources();
  if (!this.blitProgram || this.blitAttribLocation === -1) return;

  gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
  gl.disable(gl.DEPTH_TEST);
  gl.useProgram(this.blitProgram);

  gl.bindBuffer(gl.ARRAY_BUFFER, this.blitBuffer);
  gl.vertexAttribPointer(this.blitAttribLocation, 2, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(this.blitAttribLocation);

  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, this.renderTarget.colorTexture);
  gl.uniform1i(this.blitTextureLocation, 0);

  gl.drawArrays(gl.TRIANGLES, 0, 6);
};

Graphics3D.prototype.loadShader = function (type, source) {
  const shader = this.gl.createShader(type);
  this.gl.shaderSource(shader, source);
  this.gl.compileShader(shader);

  // See if it compiled successfully

  if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
    alert(
      "An error occurred compiling the shaders: " +
        this.gl.getShaderInfoLog(shader)
    );
    this.gl.deleteShader(shader);
    return null;
  }

  return shader;
};

Graphics3D.prototype.initShaderProgram = function (vsSource, fsSource) {
  const vertexShader = this.loadShader(this.gl.VERTEX_SHADER, vsSource);
  const fragmentShader = this.loadShader(this.gl.FRAGMENT_SHADER, fsSource);

  // Create the shader program

  const shaderProgram = this.gl.createProgram();
  this.gl.attachShader(shaderProgram, vertexShader);
  this.gl.attachShader(shaderProgram, fragmentShader);
  this.gl.linkProgram(shaderProgram);

  // If creating the shader program failed, alert

  if (!this.gl.getProgramParameter(shaderProgram, this.gl.LINK_STATUS)) {
    alert(
      "Unable to initialize the shader program: " +
        this.gl.getProgramInfoLog(shaderProgram)
    );
    return null;
  }

  return shaderProgram;
};

Graphics3D.prototype.loadShaders = function (vsSource, fsSource) {
  const gl = this.gl;
  this.shaderProgram = this.initShaderProgram(vsSource, fsSource);

  const positionBuffer = gl.createBuffer();

  // Select the positionBuffer as the one to apply buffer
  // operations to from here out.
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

  // Now create an array of positions for the square.
  const positions = [1.0, 1.0, -1.0, 1.0, 1.0, -1.0, -1.0, -1.0];

  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

  this.programInfo = {
    program: this.shaderProgram,
    attribLocations: {
      vertexPosition: this.gl.getAttribLocation(
        this.shaderProgram,
        "aVertexPosition"
      ),
      vertexColor: this.gl.getAttribLocation(this.shaderProgram, "aVertexColor")
    },
    uniformLocations: {
      projectionMatrix: this.gl.getUniformLocation(
        this.shaderProgram,
        "uProjectionMatrix"
      ),
      modelViewMatrix: this.gl.getUniformLocation(
        this.shaderProgram,
        "uModelViewMatrix"
      )
    }
  };
};

let deltaTime = 0;
// let now = 0;
let then = 0;

function Camera() {
  /** @type {Vector3D} */
  this.rotation = new Vector3D();
}

Graphics3D.prototype.drawScene = function (programInfo, deltaTime) {
  const gl = this.gl;
  if (!gl) return;

  if (this.renderTarget) {
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.renderTarget.framebuffer);
    gl.viewport(0, 0, this.renderTarget.width, this.renderTarget.height);
  } else {
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
  }

  gl.clearDepth(1.0); // Clear everything
  gl.enable(gl.DEPTH_TEST); // Enable depth testing
  gl.depthFunc(gl.LEQUAL); // Near things obscure far things

  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  gl.clearDepth(1.0);

  const fov = 45;

  const fieldOfView = (fov * Math.PI) / 180; // in radians
  const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
  const zNear = 0.1;
  const zFar = 100.0;
  const projectionMatrix = mat4.create();

  // note: glMatrix always has the first argument
  // as the destination to receive the result.
  // gl.gM
  mat4.perspective(projectionMatrix, fieldOfView, aspect, zNear, zFar);

  // Set the drawing position to the "identity" point, which is
  // the center of the scene.
  const modelViewMatrix = mat4.create();

  if (!cubeRotationPaused) {
    squareRotation += deltaTime;
  }
  mat4.translate(
    modelViewMatrix, // destination matrix
    modelViewMatrix, // matrix to translate
    [-0.0, 0.0, -6.0]
  ); // amount to translate

  mat4.rotate(
    modelViewMatrix, // destination matrix
    modelViewMatrix, // matrix to rotate
    squareRotation, // amount to rotate in radians
    [0, 0, 1]
  ); // axis to rotate around (Z)
  mat4.rotate(
    modelViewMatrix, // destination matrix
    modelViewMatrix, // matrix to rotate
    squareRotation * 0.7, // amount to rotate in radians
    [0, 1, 0]
  ); // axis to rotate around (Y)
  mat4.rotate(
    modelViewMatrix, // destination matrix
    modelViewMatrix, // matrix to rotate
    squareRotation * 0.3, // amount to rotate in radians
    [1, 0, 0]
  ); // axis to rotate around (X)

  // Tell WebGL how to pull out the positions from the position
  // buffer into the vertexPosition attribute.
  {
    const numComponents = 3; // pull out 3 values per iteration (x, y, z)
    const type = gl.FLOAT; // the data in the buffer is 32bit floats
    const normalize = false; // don't normalize
    const stride = 0; // how many bytes to get from one set of values to the next
    // 0 = use type and numComponents above
    const offset = 0; // how many bytes inside the buffer to start from
    if (!this.buffers) return;
    gl.bindBuffer(gl.ARRAY_BUFFER, this.buffers.position);
    gl.vertexAttribPointer(
      this.programInfo.attribLocations.vertexPosition,
      numComponents,
      type,
      normalize,
      stride,
      offset
    );
    gl.enableVertexAttribArray(this.programInfo.attribLocations.vertexPosition);
  }

  const numComponents = 4;
  const type = gl.FLOAT;
  const normalize = false;
  const stride = 0;
  const offset = 0;
  if (this.programInfo.attribLocations.vertexColor !== -1) {
    gl.bindBuffer(gl.ARRAY_BUFFER, this.buffers.color);
    gl.vertexAttribPointer(
      this.programInfo.attribLocations.vertexColor,
      numComponents,
      type,
      normalize,
      stride,
      offset
    );
    gl.enableVertexAttribArray(this.programInfo.attribLocations.vertexColor);
  }

  // Tell WebGL to use our program when drawing
  gl.useProgram(this.programInfo.program);

  // Set the shader uniforms
  gl.uniformMatrix4fv(
    this.programInfo.uniformLocations.projectionMatrix,
    false,
    projectionMatrix
  );
  gl.uniformMatrix4fv(
    this.programInfo.uniformLocations.modelViewMatrix,
    false,
    modelViewMatrix
  );

  {
    // const offset = 0;
    // const vertexCount = 4;
    // gl.drawArrays(gl.TRIANGLE_STRIP, offset, vertexCount);

    const vertexCount = 36;
    const type = gl.UNSIGNED_SHORT;
    const offset = 0;
    gl.drawElements(gl.TRIANGLES, vertexCount, type, offset);
  }

  if (
    this.renderTarget &&
    typeof uploadDepthFrame === "function" &&
    typeof stereogramState !== "undefined" &&
    stereogramState.depthSource === "generated"
  ) {
    const pixels = new Uint8Array(
      this.renderTarget.width * this.renderTarget.height * 4
    );
    gl.readPixels(
      0,
      0,
      this.renderTarget.width,
      this.renderTarget.height,
      gl.RGBA,
      gl.UNSIGNED_BYTE,
      pixels
    );
    uploadDepthFrame(pixels, this.renderTarget.width, this.renderTarget.height);
  }

  if (this.renderTarget) {
    this.presentRenderTarget();
  }
};

// Graphics.prototype.render = function () {

// };

Graphics3D.prototype.render = function (now) {
  now *= 0.001; // convert to seconds
  deltaTime = now - then;
  then = now;

  // console.log(this);
  // console.log(deltaTime);
  this.drawScene(this.programInfo, deltaTime);
  // squareRotation += deltaTime;

  requestAnimationFrame(Graphics3D.prototype.render.bind(this));
};

Graphics3D.prototype.startRendering = function () {
  requestAnimationFrame(Graphics3D.prototype.render.bind(this));
};

Graphics3D.prototype.resize = function (width, height) {
  // return;
  const dpr = window.devicePixelRatio || 1;
  this.canvas.width = width * dpr;
  this.canvas.height = height * dpr;
  // TODO: call graphicsbase resize
  this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
  // ctx.scale(dpr, dpr);
  if (this.gl.scale) this.gl.scale(dpr, dpr);
};

// export { drawScene };
