/*** Imports ***/
import HelpersBorder      from '../../src/helpers/helpers.border';
import HelpersBoundingBox from '../../src/helpers/helpers.boundingbox';
import HelpersSlice       from '../../src/helpers/helpers.slice';

/**
 * Helper to easily display and interact with a stack.<br>
 *<br>
 * Defaults:<br>
 *   - orientation: 0 (acquisition direction)<br>
 *   - index: middle slice in acquisition direction<br>
 *<br>
 * Features:<br>
 *   - slice from the stack (in any direction)<br>
 *   - slice border<br>
 *   - stack bounding box<br>
 *<br>
 * Live demo at: {@link http://jsfiddle.net/gh/get/library/pure/fnndsc/ami/tree/master/lessons/01#run|Lesson 01}
 *
 * @example
 * let stack = new VJS.Models.Stack();
 * ... // prepare the stack
 * 
 * let stackHelper = new VJS.Helpers.Stack(stack);
 * stackHelper.bbox.color = 0xF9F9F9;
 * stackHelper.border.color = 0xF9F9F9;
 *
 * let scene = new THREE.Scene();
 * scene.add(stackHelper);
 *
 * @extends THREE.Object3D
 *
 * @see module:helpers/border
 * @see module:helpers/boundingbox
 * @see module:helpers/slice
 *
 * @module helpers/stack
 */
export default class HelpersStack extends THREE.Object3D{
  constructor(stack){
    //
    super();

    this._stack = stack;
    this._bBox = null;
    this._slice = null;
    this._border = null;
    this._dummy = null;

    this._orientation = 0;
    this._index = 0;

    this._uniforms = null;
    this._autoWindowLevel = false;
    this._outOfBounds = false;

    // this._arrow = {
    //   visible: true,
    //   color: 0xFFF336,
    //   length: 20,
    //   material: null,
    //   geometry: null,
    //   mesh: null
    // };
    this._create();
  }

  //
  // PUBLIC METHODS
  //

  //
  // SETTERS/GETTERS
  //

  /**
   * Get stack.
   *
   * @type {ModelsStack}
   */
  get stack(){
    return this._stack;
  }

  /**
   * Get bounding box helper.
   *
   * @type {HelpersBoundingBox}
   */
  get bbox(){
    return this._bBox;
  }

  /**
   * Get slice helper.
   *
   * @type {HelpersSlice}
   */
  get slice(){
    return this._slice;
  }

  /**
   * Get border helper.
   *
   * @type {HelpersSlice}
   */
  get border(){
    return this._border;
  }

  /**
   * Set/get current slice index.<br>
   * Sets outOfBounds flag to know if target index is in/out stack bounding box.<br>
   * <br>
   * Internally updates the sliceHelper index and position. Also updates the
   * borderHelper with the updated sliceHelper.
   *
   * @type {number}
   */
  get index(){
    return this._index;
  }

  set index(index){

    this._index = index;

    // update the slice
    this._slice.index = index;
    let halfDimensions = this._stack.halfDimensionsIJK;
    this._slice.planePosition = this._prepareSlicePosition(halfDimensions, this._index);

    // also update the border
    this._border.helpersSlice = this._slice;

    // update ourOfBounds flag
    this._isIndexOutOfBounds();
  }

  /**
   * Set/get current slice orientation.<br>
   * Values: <br>
   *   - 0: acquisition direction (slice normal is z_cosine)<br>
   *   - 1: next direction (slice normal is x_cosine)<br>
   *   - 2: next direction (slice normal is y_cosine)<br>
   *   - n: set orientation to 0<br>
   * <br>
   * Internally updates the sliceHelper direction. Also updates the
   * borderHelper with the updated sliceHelper.
   *
   * @type {number}
   */
  set orientation(orientation){
    this._orientation = orientation;
    this._slice.planeDirection = this._prepareDirection(this._orientation);

    // also update the border
    this._border.helpersSlice = this._slice;
  }

  get orientation(){
    return this._orientation;
  }

  /**
   * Set/get the outOfBound flag.
   *
   * @type {boolean}
   */
  set outOfBounds(outOfBounds){
    this._outOfBounds = outOfBounds;
  }

  get outOfBounds(){
    return this._outOfBounds;
  }

  //
  // PRIVATE METHODS
  //

  /**
   * Initial setup, including stack prepare, bbox prepare, slice prepare and
   * border prepare.
   *
   * @private
   */
  _create(){
    if (this._stack) {

      // prepare sthe stack internals
      this._prepareStack();

      // prepare visual objects
      this._prepareBBox();
      this._prepareSlice();
      this._prepareBorder();
      // todo: Arrow

    } else {
      window.console.log('no stack to be prepared...');
    }
  }

  /**
   * Given orientation, check if index is in/out of bounds.
   *
   * @private
   */
  _isIndexOutOfBounds(){

    let dimensionsIJK = this._stack.dimensionsIJK;
    let dimensions = 0;
    switch(this._orientation){
      case 0:
        dimensions = dimensionsIJK.z;
        break;
      case 1:
        dimensions = dimensionsIJK.x;
        break;
      case 2:
        dimensions = dimensionsIJK.y;
        break;
      default:
        // do nothing!
        break;
    }

    if(this._index >= dimensions || this._index < 0){
      this._outOfBounds = true;
    }
    else{
      this._outOfBounds = false;
    }
  }

  /**
   * Prepare a stack for visualization. (image to world transform, frames order,
   * pack data into 8 bits textures, etc.)
   *
   * @private
   */
  _prepareStack(){
    // make sure there is something, if not throw an error
    // compute image to workd transform, order frames, etc.
    if(!this._stack.prepared){
      this._stack.prepare();
    }
    
    // pack data into 8 bits rgba texture for the shader
    // this one can be slow...
    if(!this._stack.packed){
      this._stack.pack();
    }
  }

  /**
   * Setup bounding box helper given prepared stack and add bounding box helper
   * to stack helper.
   *
   * @private
   */
  _prepareBBox(){
    this._bBox = new HelpersBoundingBox(this._stack);
    this.add(this._bBox);
  }

  /**
   * Setup border helper given slice helper and add border helper
   * to stack helper.
   *
   * @private
   */
  _prepareBorder(){
    this._border = new HelpersBorder(this._slice);
    this.add(this._border);
  }

  /**
   * Setup slice helper given prepared stack helper and add slice helper
   * to stack helper.
   *
   * @private
   */
  _prepareSlice(){
    let halfDimensionsIJK = this._stack.halfDimensionsIJK;
    // compute initial index given orientation
    this._index = this._prepareSliceIndex(halfDimensionsIJK);
    // compute initial position given orientation and index
    let position = this._prepareSlicePosition(halfDimensionsIJK, this._index);
    // compute initial direction orientation
    let direction = this._prepareDirection(this._orientation);

    this._slice = new HelpersSlice(this._stack, this._index, position, direction);
    this.add(this._slice);
  }

  /**
   * Compute slice index depending on orientation.
   *
   * @param {THREE.Vector3} indices - Indices in each direction.
   *
   * @returns {number} Slice index according to current orientation.
   *
   * @private
   */
  _prepareSliceIndex(indices){
    let index = 0;
    switch(this._orientation){
      case 0:
        index = Math.floor(indices.z);
        break;
      case 1:
        index = Math.floor(indices.x);
        break;
      case 2:
        index = Math.floor(indices.y);
        break;
      default:
        // do nothing!
        break;
    }
    return index;
  }

  /**
   * Compute slice position depending on orientation.
   * Sets index in proper location of reference position.
   *
   * @param {THREE.Vector3} rPosition - Reference position.
   * @param {number} index - Current index.
   *
   * @returns {number} Slice index according to current orientation.
   *
   * @private
   */
  _prepareSlicePosition(rPosition, index){
    let position = new THREE.Vector3(0, 0, 0);
    switch(this._orientation){
      case 0:
        position = new THREE.Vector3(
          Math.floor(rPosition.x),
          Math.floor(rPosition.y),
          index);
        break;
      case 1:
        position = new THREE.Vector3(
          index,
          Math.floor(rPosition.y),
          Math.floor(rPosition.z));
        break;
      case 2:
        position = new THREE.Vector3(
          Math.floor(rPosition.x),
          index,
          Math.floor(rPosition.z));
        break;
      default:
        // do nothing!
        break;
    }
    return position;
  }

  /**
   * Compute slice direction depending on orientation.
   *
   * @param {number} orientation - Slice orientation.
   *
   * @returns {THREE.Vector3} Slice direction
   *
   * @private
   */
  _prepareDirection(orientation){
    let direction = new THREE.Vector3(0, 0, 1);
    switch(orientation){
      case 0:
        direction = new THREE.Vector3(0, 0, 1);
        break;
      case 1:
        direction = new THREE.Vector3(1, 0, 0);
        break;
      case 2:
        direction = new THREE.Vector3(0, 1, 0);
        break;
      default:
        // do nothing!
        break;
    }

    return direction;
  }

}