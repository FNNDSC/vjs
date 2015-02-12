// XTK includes for now...
goog.require('X.renderer3D');
goog.require('X.renderer2D');
goog.require('X.parserNII');

// standard global variables
var scene, camera, renderer;

// FUNCTIONS
function init(slice) {
  function onDocumentMouseMove( event ) {

  // calculate mouse position in normalized device coordinates
  // (-1 to +1) for both components

  mouse.x = ( event.clientX / threeD.offsetWidth ) * 2 - 1;
  mouse.y = - ( event.clientY / threeD.offsetHeight ) * 2 + 1;

  // if ( SELECTED ) {

  //         var intersects = raycaster.intersectObject( plane );
  //         SELECTED.position.copy( intersects[ 0 ].point.sub( offset ) );
  //         return;

  //       }

  if(typeof SELECTED === 'undefined' || !SELECTED){
    return;
  }

        var intersects = raycaster.intersectObjects( scene.children );

        for ( var intersect in intersects ) {
          var ras = new THREE.Vector3().copy(intersects[intersect].point);
          // hit plane !
          if(plane.uuid == intersects[intersect].object.uuid){
            // change selected object position..!
            window.console.log(SELECTED);
            SELECTED.position.x = ras.x;
            SELECTED.position.y = ras.y;
            SELECTED.position.z = ras.z;

            // draw ellipse if 2 handles!
            if(HANDLES.length == 2){

              // need to compute it properly
              geometry = new THREE.Geometry();
              geometry.vertices.push(new THREE.Vector3(HANDLES[0].position.x, HANDLES[0].position.y, HANDLES[0].position.z));
              geometry.vertices.push(new THREE.Vector3(HANDLES[0].position.x, HANDLES[1].position.y, HANDLES[0].position.z));
              geometry.vertices.push(new THREE.Vector3(HANDLES[0].position.x, HANDLES[1].position.y, HANDLES[1].position.z));
              geometry.vertices.push(new THREE.Vector3(HANDLES[0].position.x, HANDLES[0].position.y, HANDLES[1].position.z));
              geometry.vertices.push(new THREE.Vector3(HANDLES[0].position.x, HANDLES[0].position.y, HANDLES[0].position.z));

            if(typeof line == "undefined" || !line){

              material = new THREE.LineBasicMaterial(
                { color: 0xff00f0,
                  linewidth: 2} );
              material.polygonOffset = true;
        material.polygonOffsetFactor = 1;
        material.polygonOffsetUnits = 1;
              line = new THREE.Line(geometry, material);
              line.geometry.verticesNeedUpdate = true;
              scene.add(line);
              }

              else{
line.geometry = geometry;
line.geometry.verticesNeedUpdate = true;

// compute stats

// need to compute 4 points of the box from 2 points in diagonal!
var h1 = HANDLES[0].position;
var h2 = HANDLES[1].position;

// computer center (might be used to drag it later)
var center = new THREE.Vector3(h1.x + (h2.x - h1.x)/2,
                                  h1.y + (h2.y - h1.y)/2,
                                  h1.z + (h2.z - h1.z)/2);
// draw center for fun
// var sphereGeometry = new THREE.SphereGeometry(1);
// var material3 = new THREE.MeshBasicMaterial( {color: 0x00fff0} );
// material3.transparent= true;
// material3.opacity = .5;
// var sphere = new THREE.Mesh( sphereGeometry, material3 );
// sphere.applyMatrix( new THREE.Matrix4().makeTranslation(center.x, center.y, center.z) );
// sphere.name = 'center';
// scene.add( sphere );

// box's sides length
var dx = Math.sqrt((h2.x - h1.x)*(h2.x - h1.x))/2;
var dy = Math.sqrt((h2.y - h1.y)*(h2.y - h1.y))/2;
var dz = Math.sqrt((h2.z - h1.z)*(h2.z - h1.z))/2;

// 8 RAS corners
var c0 = new THREE.Vector3(center.x - dx, center.y - dy, center.z - dz);
var c1 = new THREE.Vector3(center.x - dx, center.y - dy, center.z + dz);
var c2 = new THREE.Vector3(center.x - dx, center.y + dy, center.z - dz);
var c3 = new THREE.Vector3(center.x - dx, center.y + dy, center.z + dz);
var c4 = new THREE.Vector3(center.x + dx, center.y - dy, center.z - dz);
var c5 = new THREE.Vector3(center.x + dx, center.y - dy, center.z + dz);
var c6 = new THREE.Vector3(center.x + dx, center.y + dy, center.z - dz);
var c7 = new THREE.Vector3(center.x + dx, center.y + dy, center.z + dz);

// 8 IJK corners
var ijk0 = new THREE.Vector3(c0.x, c0.y, c0.z).applyMatrix4(tRASToIJK);
ijk0.x = Math.floor(ijk0.x + .5); 
ijk0.y = Math.floor(ijk0.y + .5); 
ijk0.z = Math.floor(ijk0.z + .5);

var ijk1 = new THREE.Vector3(c1.x, c1.y, c1.z).applyMatrix4(tRASToIJK);
ijk1.x = Math.floor(ijk1.x + .5); 
ijk1.y = Math.floor(ijk1.y + .5); 
ijk1.z = Math.floor(ijk1.z + .5);

var ijk2 = new THREE.Vector3(c2.x, c2.y, c2.z).applyMatrix4(tRASToIJK);
ijk2.x = Math.floor(ijk2.x + .5); 
ijk2.y = Math.floor(ijk2.y + .5); 
ijk2.z = Math.floor(ijk2.z + .5);

var ijk3 = new THREE.Vector3(c3.x, c3.y, c3.z).applyMatrix4(tRASToIJK);
ijk3.x = Math.floor(ijk3.x + .5); 
ijk3.y = Math.floor(ijk3.y + .5); 
ijk3.z = Math.floor(ijk3.z + .5);

var ijk4 = new THREE.Vector3(c4.x, c4.y, c4.z).applyMatrix4(tRASToIJK);
ijk4.x = Math.floor(ijk4.x + .5); 
ijk4.y = Math.floor(ijk4.y + .5); 
ijk4.z = Math.floor(ijk4.z + .5);

var ijk5 = new THREE.Vector3(c5.x, c5.y, c5.z).applyMatrix4(tRASToIJK);
ijk5.x = Math.floor(ijk5.x + .5); 
ijk5.y = Math.floor(ijk5.y + .5); 
ijk5.z = Math.floor(ijk5.z + .5);

var ijk6 = new THREE.Vector3(c6.x, c6.y, c6.z).applyMatrix4(tRASToIJK);
ijk6.x = Math.floor(ijk6.x + .5); 
ijk6.y = Math.floor(ijk6.y + .5); 
ijk6.z = Math.floor(ijk6.z + .5);

var ijk7 = new THREE.Vector3(c7.x, c7.y, c7.z).applyMatrix4(tRASToIJK);
ijk7.x = Math.floor(ijk7.x + .5); 
ijk7.y = Math.floor(ijk7.y + .5); 
ijk7.z = Math.floor(ijk7.z + .5);

// get IJK BBox and look + test each
var ijkMin = new THREE.Vector3(Math.min(ijk0.x, ijk1.x, ijk2.x, ijk3.x, ijk4.x, ijk5.x, ijk5.x, ijk7.x),
                               Math.min(ijk0.y, ijk1.y, ijk2.y, ijk3.y, ijk4.y, ijk5.y, ijk5.y, ijk7.y),
                               Math.min(ijk0.z, ijk1.z, ijk2.z, ijk3.z, ijk4.z, ijk5.z, ijk5.z, ijk7.z));

var ijkMax = new THREE.Vector3(Math.max(ijk0.x, ijk1.x, ijk2.x, ijk3.x, ijk4.x, ijk5.x, ijk5.x, ijk7.x),
                               Math.max(ijk0.y, ijk1.y, ijk2.y, ijk3.y, ijk4.y, ijk5.y, ijk5.y, ijk7.y),
                               Math.max(ijk0.z, ijk1.z, ijk2.z, ijk3.z, ijk4.z, ijk5.z, ijk5.z, ijk7.z));

var  iLog = {};
var  jLog = {};
var  kLog = {};

// window.console.log(bbox);
var points = {
  points: [],
  max:  -Number.MAX_VALUE,
  min:  Number.MAX_VALUE
};
var nbVoxels = 0;
var sum = 0;

for(var i = ijkMin.x; i <= ijkMax.x; i++){
  for(var j = ijkMin.y; j <= ijkMax.y; j++){
      for(var k = ijkMin.z; k <= ijkMax.z; k++){
        var ras = new THREE.Vector3(i, j, k).applyMatrix4(tIJKToRAS);

         if(ras.x >= c0.x - volume._RASSpacing[0]/2 &&
            ras.y >= c0.y - volume._RASSpacing[1]/2 &&
            ras.z >= c0.z - volume._RASSpacing[2]/2&&
            ras.x <= c7.x + volume._RASSpacing[0]/2 &&
            ras.y <= c7.y + volume._RASSpacing[1]/2 &&
            ras.z <= c7.z + volume._RASSpacing[2]/2)
          {
        
        if(i >= 0 && j >= 0 && k >= 0 &&
          i < tDimensions.x &&
          j < tDimensions.y &&
          k < tDimensions.z )
        {
          var point = {
            "ijk": [i, j, k],
            "value": volume._IJKVolume[k][j][i]
          };
          points.points.push(point);
          // compute as much as possible here to avoid having to loop through points again alter...
          // sum += value;
          // nbVoxels += 1;
          points.min = (point.value < points.min )? point.value : points.min;
          points.max = (point.value > points.max )? point.value : points.max;
        }
        }

        
}
}
}

// probeROI.update(nbVoxels, sum/nbVoxels, max, min, 0);
probeROI.update(points);
//(get IJK then?)

              }

              window.console.log(XYRASTransform);
             



// line.applyMatrix( new THREE.Matrix4().makeTranslation(ras.x, ras.y, ras.z) );
            scene.add( line );

            }


          }

        }

}

function onDocumentMouseDown( event ) {


        event.preventDefault();

        raycaster.setFromCamera( mouse, camera ); 

        var intersects = raycaster.intersectObjects( scene.children );

        for ( var intersect in intersects ) {
          var ras = new THREE.Vector3().copy(intersects[intersect].point);
          // hit handler!
          window.console.log(intersects[intersect].object);
          if('handle'== intersects[intersect].object.name){
            // select it, disable controls!
            SELECTED = intersects[intersect].object;
            controls.enabled = false;
            // container.style.cursor = 'move';

            window.console.log('clicked on EllipsePicker');
            

            break;
          }
          // hit plane !
          if(plane.uuid == intersects[intersect].object.uuid && HANDLES.length < 2){
            // create a sphere...
            // var sphereGeometry = new THREE.SphereGeometry(1);
            // var material = new THREE.MeshBasicMaterial( {color: 0x2196F3} );
            // var handle1 = new THREE.Mesh( sphereGeometry, material );
            // handle1.name = 'handle';
            // scene.add( handle1 );

            var sphereGeometry = new THREE.SphereGeometry(1);
            var material3 = new THREE.MeshBasicMaterial( {color: 0xff00f0} );
            material3.transparent= true;
            material3.opacity = .5;
            var sphere = new THREE.Mesh( sphereGeometry, material3 );
            sphere.applyMatrix( new THREE.Matrix4().makeTranslation(ras.x, ras.y, ras.z) );
            sphere.name = 'handle';
            scene.add( sphere );

            HANDLES.push(sphere);
            // create ellipse picker
            // var ellipsePicker = new VJS.EllipsePicker();
            // ellipsePicker.update(ras, ras);
            // scene.add( ellipsePicker.widget );
            // break;
          }
      }

        // if ( intersects.length > 0 ) {

        //   controls.enabled = false;

        //   SELECTED = intersects[ 0 ].object;

        //   var intersects = raycaster.intersectObject( plane );
        //   offset.copy( intersects[ 0 ].point ).sub( plane.position );

        //   container.style.cursor = 'move';

        // }

}

function onDocumentMouseUp( event ) {

        event.preventDefault();

        controls.enabled = true;

        // if ( INTERSECTED ) {

        //   plane.position.copy( INTERSECTED.position );

          SELECTED = null;

        // }

        // container.style.cursor = 'auto';

}

  // this function is executed on each animation frame
  function animate(){
    //
    // update the picking ray with the camera and mouse position  
    raycaster.setFromCamera( mouse, camera ); 

    // calculate objects intersecting the picking ray
    var intersects = raycaster.intersectObjects( scene.children );

    //window.console.log(intersects);

    for ( var intersect in intersects ) {
      var ras = new THREE.Vector3().copy(intersects[intersect].point);
      if(plane.uuid == intersects[intersect].object.uuid){
        // convert point to IJK
        var ijk = intersects[intersect].point.applyMatrix4(tRASToIJK);
        ijk.x += .5;
        ijk.y += .5;
        ijk.z += .5;
        // get value!
        if(ijk.x >= 0 && ijk.y >= 0 && ijk.z >= 0 &&
          ijk.x <= tDimensions.x &&
          ijk.y <= tDimensions.y &&
          ijk.z <= tDimensions.z ){
        
          var value = volume._IJKVolume[Math.floor(ijk.z)][Math.floor(ijk.y)][Math.floor(ijk.x)];
          probe.update(ras, ijk, value);
        }

        break;
      }
    }
    // render
    renderer.render(scene, camera);
    stats.update();
    controls.update(); 

    // connect zoom for orthographic...
    // window.console.log(controls);
    // request new frame
    requestAnimationFrame(function(){
    animate();
    });
  }

  // renderer
  threeD = document.getElementById('3d');
  var renderer = new THREE.WebGLRenderer({antialias: true});
  renderer.setSize(threeD.offsetWidth, threeD.offsetHeight);
  renderer.setClearColor( 0xB0BEC5, 1);
  threeD.appendChild(renderer.domElement);

    // stats
  stats = new Stats();
  threeD.appendChild( stats.domElement );

  probe = new VJS.Probe();
  threeD.appendChild( probe.domElement );

  probeROI = new VJS.ProbeROI();
  threeD.appendChild( probeROI.domElement );

  // scene
  var scene = new THREE.Scene();
  // camera
  var camera = new THREE.PerspectiveCamera(45, threeD.offsetWidth / threeD.offsetHeight, .1, 10000000);
  // camera = new THREE.OrthographicCamera(threeD.offsetWidth/-2, threeD.offsetWidth/2, threeD.offsetHeight/-2, threeD.offsetHeight/2, .1, 10000000);
  // camera.position.y = 10;
  camera.position.x = 400;
  // camera.position.y = 200;
  // camera.position.z = 800;
  camera.lookAt(scene.position);

  controls = new THREE.OrbitControls( camera, renderer.domElement );
  // camera.rotation.y = -20 * (Math.PI / 180);

  // draw RAS bbox
  var dimensions = volume._RASDimensions;
  var spacing = volume._RASSpacing;
  var ijkDims = volume._dimensions;
  var ijkSpac = volume._spacing;
  var center = volume._RASCenter;
  var sliceWidth = slice._iWidth;
  var rasijk = volume._RASToIJK;
  var rasBBox = volume._BBox;
  tDimensions = new THREE.Vector3( ijkDims[0], ijkDims[1], ijkDims[2] );

  tRASToIJK = new THREE.Matrix4().set(
                  rasijk[0], rasijk[4], rasijk[8], rasijk[12],
                  rasijk[1], rasijk[5], rasijk[9], rasijk[13],
                  rasijk[2], rasijk[6], rasijk[10], rasijk[14],
                  rasijk[3], rasijk[7], rasijk[11], rasijk[15]);

  tIJKToRAS = new THREE.Matrix4().getInverse(tRASToIJK);

  //
  //
  // RAS volume
  //
  //

  // DRAW TRANSFORMED RAS CUBE
  var cubeGeometry = new THREE.BoxGeometry(ijkDims[0], ijkDims[1], ijkDims[2]);
  //cubeGeometry.applyMatrix( new THREE.Matrix4().makeTranslation(center[0], center[1], center[2]) );
  var cube = new THREE.Mesh(cubeGeometry, new THREE.MeshBasicMaterial({
    wireframe: true,
    color: 0x61F2F3
  }));
  // center IJK cube
  cube.applyMatrix( new THREE.Matrix4().makeTranslation(ijkDims[0]/2 , ijkDims[1]/2, ijkDims[2]/2) );
  // move to RAS
  cube.applyMatrix( tIJKToRAS );
  scene.add(cube);

  // draw RAS BBox
  var cubeGeometry = new THREE.BoxGeometry(rasBBox[1] - rasBBox[0], rasBBox[3] - rasBBox[2], rasBBox[5] - rasBBox[4]);
  //cubeGeometry.applyMatrix( new THREE.Matrix4().makeTranslation(center[0], center[1], center[2]) );
  var cube = new THREE.Mesh(cubeGeometry, new THREE.MeshBasicMaterial({
    wireframe: true,
    color: 0x2196F3
  }));
  cube.applyMatrix( new THREE.Matrix4().makeTranslation(rasBBox[0] + (rasBBox[1] - rasBBox[0])/2, rasBBox[2] + (rasBBox[3] - rasBBox[2])/2, rasBBox[4] + (rasBBox[5] - rasBBox[4])/2) );
  scene.add(cube);

  // draw intersections
  var solutions = slice._solutionsIn;
  for(var i=0; i<solutions.length; i++){
    var sphereGeometry = new THREE.SphereGeometry(1);
    var material = new THREE.MeshBasicMaterial( {color: 0x2196F3} );
    var sphere = new THREE.Mesh( sphereGeometry, material );
    sphere.applyMatrix( new THREE.Matrix4().makeTranslation(solutions[i][0], solutions[i][1], solutions[i][2]) );
    scene.add( sphere );
  }

  // draw plane
  var sliceWidth = slice._width;
  var sliceHeight = slice._height;

  window.console.log('SLICE ' + sliceWidth + 'x' + sliceHeight);

  var geometry = new THREE.PlaneGeometry( sliceWidth, sliceHeight );
  // move back to RAS...
  // _XYToRAS
  var material = new THREE.MeshBasicMaterial( {color: 0xE91E63, side: THREE.DoubleSide} );
  // https://github.com/mrdoob/three.js/wiki/Uniforms-types
  // might consider texture compression...
  // http://blog.tojicode.com/2011/12/compressed-textures-in-webgl.html
  // convert texture to float somehow to handle more range


  // create a big texture....
  // ijkRGBADataTex = new THREE.DataTexture( volume._IJKVolumeRGBA, volume._IJKVolume[0][0].length, volume._IJKVolume.length * volume._IJKVolume[0].length, THREE.RGBAFormat );
  // ijkRGBADataTex.needsUpdate = true;

  //ijkRGBATex = new THREE.Texture(ijkRGBADataTex);
  // create 4RGBA textures to split the data

  // configuration: size of side of a texture (square tSize*tSize)
  var tSize = 4096.0;
  var tNumber = 4;

  //
  // 1) check if we have enough room in textures!!
  // 
  var requiredPixels = tDimensions.x * tDimensions.y * tDimensions.z * 4;
  window.console.log("requiredPixels");
  window.console.log(volume._dimensions);
  window.console.log(tDimensions);
  window.console.log(requiredPixels);
  window.console.log("available");
  window.console.log( tSize*tSize*4*4);
  if(requiredPixels > tSize*tSize*4*4){
    window.console.log("Too many pixels to fit in shader, go for canvas 2D...");
    return;
  }

  //
  // 2) pack pixels into texture
  //
  
  // prepare raw data containers
  var rawData = [];
  for(var i=0; i<tNumber; i++){
    rawData.push(new Uint8Array(tSize * tSize * 4));
  }

  // fill texture containers
  var dummyRGBA = new Uint8Array(tSize * tSize * 4);
  for(var i=0; i < tSize * tSize * 4; i+=4){
    for(var j=0; j < tNumber; j++){
      // RGB
      rawData[j][i] = volume._IJKVolumeRGBA[i + j*tSize * tSize * 4];
      rawData[j][i + 1] = volume._IJKVolumeRGBA[i + 1 + j*tSize * tSize * 4];
      rawData[j][i + 2] = volume._IJKVolumeRGBA[i + 2 + j*tSize * tSize * 4];
      // OPACITY
      rawData[j][i + 3] = 255;
    }
  }

  // create threeJS textures
  var textures = [];
  for(var i=0; i<tNumber; i++){
    var tex = new THREE.DataTexture( rawData[i], tSize, tSize, THREE.RGBAFormat, THREE.UnsignedByteType, THREE.UVMapping, THREE.ClampToEdgeWrapping, THREE.ClampToEdgeWrapping, THREE.NearestFilter, THREE.NearestFilter );
    tex.needsUpdate = true;
    textures.push(tex);
  }

  // setup uniforms
  var shaderSlice = VJS.ShaderSlice;
  var uniforms = shaderSlice.slice.uniforms;
  uniforms.uTextureSize.value = tSize;
  uniforms.t00.value = textures[0];
  uniforms.t01.value = textures[1];
  uniforms.t02.value = textures[2];
  uniforms.t03.value = textures[3];
  uniforms.uIJKDims.value = tDimensions;
  uniforms.uRASToIJK.value = tRASToIJK;

  var mat = new THREE.ShaderMaterial({
          "side": THREE.DoubleSide,
          "transparency":true,
          "uniforms": uniforms,
          "vertexShader": shaderSlice.slice.vertexShader,
          "fragmentShader": shaderSlice.slice.fragmentShader,
  });

  plane = new THREE.Mesh( geometry, mat );
  var xyras = slice._XYToRAS;
  XYRASTransform = new THREE.Matrix4().set(xyras[0], xyras[4], xyras[8], xyras[12],
                                             xyras[1], xyras[5], xyras[9], xyras[13],
                                             xyras[2], xyras[6], xyras[10], xyras[14],
                                             xyras[3], xyras[7], xyras[11], xyras[15])
  var normalOrigin = slice._center;
  plane.applyMatrix( XYRASTransform );
  plane.applyMatrix( new THREE.Matrix4().makeTranslation(normalOrigin[0], normalOrigin[1], normalOrigin[2]));

  window.console.log(normalOrigin);
  scene.add(plane);

  // mouse callbacks
  raycaster = new THREE.Raycaster();
  mouse = new THREE.Vector2();
  renderer.domElement.addEventListener( 'mousemove', onDocumentMouseMove, false );
  renderer.domElement.addEventListener( 'mousedown', onDocumentMouseDown, false );
  renderer.domElement.addEventListener( 'mouseup', onDocumentMouseUp, false );
  // start animation
  window.console.log('start animate...');
  HANDLES = [];
  animate();
}



window.onload = function() {
  // create the 2D renderers (just load tand parse the file...)
  sliceX = new X.renderer2D();
  sliceX.container = 'sliceX';
  sliceX.orientation = 'X';
  sliceX.init();

  //
  // THE VOLUME DATA
  //
  // create a X.volumehttps://www.google.es/url?sa=t&rct=j&q=&esrc=s&source=web&cd=12&ved=0CCcQFjABOAo&url=http%3A%2F%2Fcharmianswers.org%2Fwordpress%2Fyeakel%2F2014%2F12%2F16%2Fwhy-orthographic-projection-not-working-exactly-while-using-combinedcamera-js-using-three-js%2F&ei=acPYVJzqH47KaMP4ghg&usg=AFQjCNF1rWDi5zBe5-Abh0qBSkifTtDSew&sig2=gLgGnS6sOjhjRBdxmATsgg
  volume = new X.volume();
  volume.file = 'data/lesson17_cropped.nii.gz';
    // volume.file = 'data/CT.nii.gz';
  // get accurate IJK to RAS transform...
  volume.reslicing = true;

  // we also attach a label map to show segmentations on a slice-by-slice base
  //volume.labelmap.file = 'http://x.babymri.org/?seg.nrrd';
  // .. and use a color table to map the label map values to colors
  //volume.labelmap.colortable.file = 'http://x.babymri.org/?genericanatomy.txt';

  sliceX.add(volume);
  
  // start the loading/rendering
  sliceX.render();
    //
  // THE GUI
  //
  // the onShowtime method gets executed after all files were fully loaded and
  // just before the first rendering attempt
  sliceX.onShowtime = function() {
    // Thanks XTK for loading the files, let threeJS render it now...
    // now the real GUI
    // var gui = new dat.GUI();
    
    // // the following configures the gui for interacting with the X.volume
    // var volumegui = gui.addFolder('Volume');
    // // now we can configure controllers which..
    // // .. switch between slicing and volume rendering
    // var vrController = volumegui.add(volume, 'volumeRendering');
    // // .. configure the volume rendering opacity
    // var opacityController = volumegui.add(volume, 'opacity', 0, 1);
    // // .. and the threshold in the min..max range
    // var lowerThresholdController = volumegui.add(volume, 'lowerThreshold',
    //     volume.min, volume.max);
    // var upperThresholdController = volumegui.add(volume, 'upperThreshold',
    //     volume.min, volume.max);
    // var lowerWindowController = volumegui.add(volume, 'windowLow', volume.min,
    //     volume.max);
    // var upperWindowController = volumegui.add(volume, 'windowHigh', volume.min,
    //     volume.max);
    // // the indexX,Y,Z are the currently displayed slice indices in the range
    // // 0..dimensions-1
    // var sliceXController = volumegui.add(volume, 'indexX', 0,
    //     volume.range[0] - 1);
    // var sliceYController = volumegui.add(volume, 'indexY', 0,
    //     volume.range[1] - 1);
    // var sliceZController = volumegui.add(volume, 'indexZ', 0,
    //     volume.range[2] - 1);
    // volumegui.open();

    // go threeJS
    window.console.log(sliceX._slices);
    init(sliceX._slices[63]);
  };
};