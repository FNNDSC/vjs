import WidgetsBase from './widgets.base';
import WidgetsHandle from './widgets.handle';
import GeometriesSlice from '../geometries/geometries.slice';
import CoreUtils from '../core/core.utils';

import {Vector3} from 'three';

/**
 * @module widgets/polygon
 */
export default class WidgetsPolygon extends WidgetsBase {
    constructor(targetMesh, controls, stack) {
        super(targetMesh, controls);

        this._stack = stack;

        this._initialized = false; // set to true onDblClick if number of handles > 2
        this._newHandleRequired = true; // should handle be created onMove?
        this._moving = false;
        this._domHovered = false;

        // mesh stuff
        this._material = null;
        this._geometry = null;
        this._mesh = null;

        // dom stuff
        this._lines = [];
        this._label = null;

        // add handles
        this._handles = [];
        this._moveHandles = [];

        let handle = new WidgetsHandle(targetMesh, controls);
        handle.worldPosition.copy(this._worldPosition);
        handle.hovered = true;
        this.add(handle);
        this._handles.push(handle);

        // handles to move widget
        for (let i = 0; i < 2; i++) {
            handle = new WidgetsHandle(targetMesh, controls);
            handle.worldPosition.copy(this._worldPosition);
            handle.hovered = true;
            this.add(handle);
            this._moveHandles.push(handle);
            handle.hide();
        }

        this.create();

        this.onDoubleClick = this.onDoubleClick.bind(this);
        this.onMove = this.onMove.bind(this);
        this.onHover = this.onHover.bind(this);
        this.addEventListeners();
    }

    addEventListeners() {
        this._container.addEventListener('dblclick', this.onDoubleClick);
        this._container.addEventListener('wheel', this.onMove);

        this._label.addEventListener('mouseenter', this.onHover);
        this._label.addEventListener('mouseleave', this.onHover);
    }

    removeEventListeners() {
        this._container.removeEventListener('dblclick', this.onDoubleClick);
        this._container.removeEventListener('wheel', this.onMove);

        this._label.removeEventListener('mouseenter', this.onHover);
        this._label.removeEventListener('mouseleave', this.onHover);
    }

    onHover(evt) {
        if (evt) {
            this.hoverDom(evt);
        }

        this.hoverMesh();

        let hovered = false;

        this._handles.forEach(function(elem) {
            hovered = hovered || elem.hovered;
        });

        this._hovered = hovered || this._domHovered;
        this._container.style.cursor = this._hovered ? 'pointer' : 'default';
    }

    hoverMesh() {
        // check raycast intersection, if we want to hover on mesh instead of just css
    }

    hoverDom(evt) {
        this._domHovered = (evt.type === 'mouseenter');
    }

    onStart(evt) {
        let active = false;

        this._moveHandles[0].onMove(evt, true);
        this._handles.forEach(function(elem) {
            elem.onStart(evt);
            active = active || elem.active;
        });

        if (!this._initialized) {
            this._newHandleRequired = true;

            return;
        }

        this._active = active || this._domHovered;

        if (this._domHovered) {
            this._moving = true;
            this._controls.enabled = false;
        }

        this.update();
    }

    onMove(evt) {
        let numHandles = this._handles.length,
            hovered = false;

        if (this.active) {
            this._dragged = true;

            if (this._newHandleRequired && !this._initialized) {
                this._handles[numHandles-1].hovered = false;
                this._handles[numHandles-1].active = false;
                this._handles[numHandles-1].tracking = false;

                let handle = new WidgetsHandle(this._targetMesh, this._controls);
                handle.worldPosition.copy(this._worldPosition);
                handle.hovered = true;
                handle.active = true;
                handle.tracking = true;
                this.add(handle);
                this._handles.push(handle);

                this.createLine();
                this._newHandleRequired = false;
            } else {
                if (this._mesh) {
                    this.remove(this._mesh);
                }
                this.updateDOMContent(true);

                this._moveHandles[1].onMove(evt, true);

                if (this._moving) {
                    this._handles.forEach(function(elem, ind) {
                        this._handles[ind].worldPosition.x = elem.worldPosition.x
                            + (this._moveHandles[1].worldPosition.x - this._moveHandles[0].worldPosition.x);
                        this._handles[ind].worldPosition.y = elem.worldPosition.y
                            + (this._moveHandles[1].worldPosition.y - this._moveHandles[0].worldPosition.y);
                        this._handles[ind].worldPosition.z = elem.worldPosition.z
                            + (this._moveHandles[1].worldPosition.z - this._moveHandles[0].worldPosition.z);
                    }, this);
                }

                this._moveHandles[0].onMove(evt, true);
            }
        }

        this._handles.forEach(function(elem) {
            elem.onMove(evt);
            hovered = hovered || elem.hovered;
        });

        this._hovered = hovered || this._domHovered;

        this.update();
    }

    onEnd() {
        let numHandles = this._handles.length,
            active = false;

        this._handles.forEach(function(elem) {
            elem.onEnd();
            active = active || elem.active;
        });

        if (!this._initialized) {
            this._newHandleRequired = true;

            return;
        }

        if (!this._dragged && this._active) {
            this._selected = !this._selected; // change state if there was no dragging
            this._handles.forEach(function(elem) {
                elem.selected = this._selected;
            }, this);
        }
        this._active = active || this._handles[numHandles-1].active;
        this._dragged = false;
        this._moving = false;

        this.updateMesh();
        this.updateDOMContent();
        this.update();
    }

    onDoubleClick() {
        let numHandles = this._handles.length;

        if (numHandles < 3 || this._initialized) {
            return;
        }

        this._handles[numHandles-1].tracking = false;
        this._handles.forEach(function(elem) {
            elem.onEnd();
        });

        this._active = false;
        this._dragged = false;
        this._moving = false;
        this._initialized = true;

        this.updateMesh();
        this.updateDOMContent();
        this.update();
    }

    create() {
        this.createMaterial();
        this.createDOM();
    }

    createMaterial() {
        this._material = new THREE.MeshBasicMaterial({side: THREE.DoubleSide});
        this._material.transparent = true;
        this._material.opacity = 0.2;
    }

    createDOM() {
        this.createLine();

        this._label = document.createElement('div');
        this._label.setAttribute('class', 'widgets-label');

        // measurenents
        const measurementsContainer = document.createElement('div');
        // Mean / SD
        let meanSDContainer = document.createElement('div');
        meanSDContainer.setAttribute('class', 'mean-sd');
        measurementsContainer.appendChild(meanSDContainer);
        // Max / Min
        let maxMinContainer = document.createElement('div');
        maxMinContainer.setAttribute('class', 'max-min');
        measurementsContainer.appendChild(maxMinContainer);
        // Area
        let areaContainer = document.createElement('div');
        areaContainer.setAttribute('class', 'area');
        measurementsContainer.appendChild(areaContainer);

        this._label.appendChild(measurementsContainer);

        this._container.appendChild(this._label);

        this.updateDOMColor();
    }

    createLine() {
        const line = document.createElement('div');
        line.setAttribute('class', 'widgets-line');
        this._lines.push(line);
        this._container.appendChild(line);
    }

    hideDOM() {
        this._handles.forEach(function(elem) {
            elem.hideDOM();
        });

        this._lines.forEach(function(elem) {
            elem.style.display = 'none';
        });
        this._label.style.display = 'none';
    }

    showDOM() {
        this._handles.forEach(function(elem) {
            elem.showDOM();
        });

        this._lines.forEach(function(elem) {
            elem.style.display = '';
        });
        this._label.style.display = '';
    }

    update() {
        this.updateColor();

        // update handles
        this._handles.forEach(function(elem) {
            elem.update();
        });

        // mesh stuff
        this.updateMeshColor();
        this.updateMeshPosition();

        // DOM stuff
        this.updateDOMColor();
        this.updateDOMPosition();
    }

    updateMesh() { // geometry
        if (this._mesh) {
            this.remove(this._mesh);
        }

        let points = [];
        this._handles.forEach(function(elem) {
            points.push(elem.worldPosition);
        });

        let center = GeometriesSlice.centerOfMass(points),
            // direction from first point to center
            referenceDirection = new Vector3().subVectors(points[0], center).normalize(),
            direction = new Vector3().crossVectors(
                new Vector3().subVectors(points[0], center), // side 1
                new Vector3().subVectors(points[1], center) // side 2
            ),
            base = new Vector3().crossVectors(referenceDirection, direction).normalize(),
            orderedpoints = [];

        // other lines // if inter, return location + angle
        for (let j = 0; j < points.length; j++) {
            let point = new Vector3(points[j].x, points[j].y, points[j].z);

            point.direction = new Vector3().subVectors(points[j], center).normalize();

            let x = referenceDirection.dot(point.direction),
                y = base.dot(point.direction);

            point.xy = {x, y};
            point.angle = Math.atan2(y, x) * (180 / Math.PI);

            orderedpoints.push(point);
        }

        // override to catch console.warn "THREE.ShapeUtils: Unable to triangulate polygon! in triangulate()"
        this._shapeWarn = false;
        const oldWarn = console.warn;
        console.warn = function(...rest) {
            if (rest[0] === 'THREE.ShapeUtils: Unable to triangulate polygon! in triangulate()') {
                this._shapeWarn = true;
            }
            return oldWarn.apply(console, rest);
        }.bind(this);

        this._geometry = new THREE.ShapeGeometry(GeometriesSlice.shape(orderedpoints));

        console.warn = oldWarn;

        this._geometry.vertices = orderedpoints;
        this._geometry.verticesNeedUpdate = true;
        this._geometry.elementsNeedUpdate = true;

        this.updateMeshColor();

        this._mesh = new THREE.Mesh(this._geometry, this._material);
        this._mesh.visible = true;
        this.add(this._mesh);
    }

    updateMeshColor() {
        if (this._material) {
            this._material.color.set(this._color);
        }
    }

    updateMeshPosition() {
        if (this._geometry) {
            this._geometry.verticesNeedUpdate = true;
        }
    }

    updateDOMColor() {
        this._lines.forEach(function(elem) {
            elem.style.backgroundColor = this._color;
        }, this);
        this._label.style.borderColor = this._color;
    }

    updateDOMContent(clear) {
        const meanSDContainer = this._label.querySelector('.mean-sd'),
            maxMinContainer = this._label.querySelector('.max-min'),
            areaContainer = this._label.querySelector('.area');

        if (clear) {
            meanSDContainer.innerHTML = '';
            maxMinContainer.innerHTML = '';
            areaContainer.innerHTML = '';

            return;
        }

        let units = this._stack.frame[0].pixelSpacing === null ? 'units' : 'cm²',
            title = units === 'units' ? 'Calibration is required to display the area in cm². ' : '';

        if (this._shapeWarn) {
            title += 'Values may be incorrect due to triangulation error.';
        }
        if (title !== '') {
            this._label.setAttribute('title', title);
            this._label.style.color = this._colors.error;
        } else {
            this._label.removeAttribute('title');
            this._label.style.color = this._colors.text;
        }

        const roi = CoreUtils.getRoI(this._mesh, this._camera, this._stack);

        if (roi !== null) {
            meanSDContainer.innerHTML = `Mean: ${roi.mean.toFixed(1)} / SD: ${roi.sd.toFixed(1)}`;
            maxMinContainer.innerHTML = `Max: ${roi.max.toFixed()} / Min: ${roi.min.toFixed()}`;
        } else {
            meanSDContainer.innerHTML = '';
            maxMinContainer.innerHTML = '';
        }
        areaContainer.innerHTML = `Area: ${(GeometriesSlice.getGeometryArea(this._geometry)/100).toFixed(2)} ${units}`;
    }

    updateDOMPosition() {
        // update lines and get coordinates of lowest handle
        let labelPosition = null;

        this._lines.forEach(function(elem, ind) {
            const lineData = this.getLineData(this._handles[ind].screenPosition,
                this._handles[ind + 1 === this._handles.length ? 0 : ind + 1].screenPosition);

            elem.style.transform =`translate3D(${lineData.transformX}px, ${lineData.transformY}px, 0)
                    rotate(${lineData.transformAngle}rad)`;
            elem.style.width = lineData.length + 'px';

            if (labelPosition === null || labelPosition.y < this._handles[ind].screenPosition.y) {
                labelPosition = this._handles[ind].screenPosition.clone();
            }
        }, this);

        if (!this._initialized) {
            return;
        }

        // update label
        let offset = 30;

        if (this._label.querySelector('.mean-sd').innerHTML !== '') {
            offset += 9;
        }
        if (this._label.querySelector('.max-min').innerHTML !== '') {
            offset += 9;
        }
        labelPosition.y += offset;
        labelPosition = this.adjustLabelTransform(this._label, labelPosition);

        this._label.style.transform = `translate3D(${labelPosition.x}px, ${labelPosition.y}px, 0)`;
    }

    free() {
        this.removeEventListeners();

        this._handles.forEach((h) => {
            this.remove(h);
            h.free();
        });
        this._handles = [];
        this._moveHandles.forEach((h) => {
            this.remove(h);
            h.free();
        });
        this._moveHandles = [];

        this._lines.forEach(function(elem) {
            this._container.removeChild(elem);
        }, this);
        this._lines = [];
        this._container.removeChild(this._label);

        // mesh, geometry, material
        if (this._mesh) {
            this.remove(this._mesh);
            this._mesh.geometry.dispose();
            this._mesh.geometry = null;
            this._mesh.material.dispose();
            this._mesh.material = null;
            this._mesh = null;
        }
        if (this._geometry) {
            this._geometry.dispose();
            this._geometry = null;
        }
        this._material.vertexShader = null;
        this._material.fragmentShader = null;
        this._material.uniforms = null;
        this._material.dispose();
        this._material = null;

        super.free();
    }


    get targetMesh() {
        return this._targetMesh;
    }

    set targetMesh(targetMesh) {
        this._targetMesh = targetMesh;
        this._handles.forEach(function(elem) {
            elem.targetMesh = targetMesh;
        });
        this._moveHandles.forEach(function(elem) {
            elem.targetMesh = targetMesh;
        });
        this.update();
    }

    get worldPosition() {
        return this._worldPosition;
    }

    set worldPosition(worldPosition) {
        this._handles.forEach(function(elem) {
            elem._worldPosition.copy(worldPosition);
        }, this);
        this._worldPosition.copy(worldPosition);
        this.update();
    }
}
