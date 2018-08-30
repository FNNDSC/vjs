import {widgetsBase} from './widgets.base';
import {widgetsHandle as widgetsHandleFactory} from './widgets.handle';
import CoreUtils from '../core/core.utils';

/**
 * @module widgets/peakVelocity (Gradient)
 */
const widgetsPeakVelocity = (three = window.THREE) => {
    if (three === undefined || three.Object3D === undefined) {
        return null;
    }

    const Constructor = widgetsBase(three);

    return class extends Constructor {
        constructor(targetMesh, controls, params) {
            super(targetMesh, controls, params);

            this._widgetType = 'PeakVelocity';

            // incoming parameters (+ initialRegion, lps2IJK)
            this._regions = this._params.ultrasoundRegions || [];

            // outgoing values
            this._velocity = null;
            this._gradient = null;

            this._container.style.cursor = 'pointer';
            this._controls.enabled = false; // controls should be disabled for widgets with a single handle
            this._initialized = false; // set to true onEnd
            this._active = true;
            this._moving = true;
            this._domHovered = true;
            this._initialRegion = this.getRegionByXY(
                this._regions,
                CoreUtils.worldToData(this._params.lps2IJK, this._params.initialPoint)
            );

            // dom stuff
            this._line = null;
            this._label = null;

            // handle (represent line)
            const WidgetsHandle = widgetsHandleFactory(three);
            this._handle = new WidgetsHandle(targetMesh, controls, params);
            this._handle.worldPosition.copy(this._worldPosition);
            this.add(this._handle);

            this._moveHandle = new WidgetsHandle(targetMesh, controls, params);
            this._moveHandle.worldPosition.copy(this._worldPosition);
            this.add(this._moveHandle);
            this._moveHandle.hide();

            this.create();

            // event listeners
            this.onMove = this.onMove.bind(this);
            this.onHover = this.onHover.bind(this);
            this.addEventListeners();
        }

        addEventListeners() {
            this._container.addEventListener('wheel', this.onMove);

            this._line.addEventListener('mouseenter', this.onHover);
            this._line.addEventListener('mouseleave', this.onHover);
            this._label.addEventListener('mouseenter', this.onHover);
            this._label.addEventListener('mouseleave', this.onHover);
        }

        removeEventListeners() {
            this._container.removeEventListener('wheel', this.onMove);

            this._line.removeEventListener('mouseenter', this.onHover);
            this._line.removeEventListener('mouseleave', this.onHover);
            this._label.removeEventListener('mouseenter', this.onHover);
            this._label.removeEventListener('mouseleave', this.onHover);
        }

        onHover(evt) {
            if (evt) {
                this.hoverDom(evt);
            }

            this._hovered = this._handle.hovered || this._domHovered;
            this._container.style.cursor = this._hovered ? 'pointer' : 'default';
        }

        hoverDom(evt) {
            this._domHovered = (evt.type === 'mouseenter');
        }

        onStart(evt) {
            this._moveHandle.onMove(evt, true);
            this._handle.onStart(evt);

            this._active = this._handle.active || this._domHovered;

            if (this._domHovered) {
                this._moving = true;
                this._controls.enabled = false;
            }

            this.update();
        }

        onMove(evt) {
            if (this._active) {
                const prevPosition = this._moveHandle.worldPosition.clone();

                this._dragged = true;
                this._moveHandle.onMove(evt, true);

                if (this._moving) {
                    const shift = this._handle.worldPosition.clone().add(
                            this._moveHandle.worldPosition.clone().sub(prevPosition)
                        );

                    if (this.isCorrectRegion(shift)) {
                        this._handle.worldPosition.copy(shift);
                    }
                }
            } else {
                this.onHover(null);
            }

            this._handle.onMove(evt);

            this.update();
        }

        onEnd() {
            this._handle.onEnd();

            if (!this._dragged && this._active && this._initialized) {
                this._selected = !this._selected; // change state if there was no dragging
                this._handle.selected = this._selected;
            }

            this._initialized = true;
            this._active = this._handle.active;
            this._dragged = false;
            this._moving = false;
            this._container.style.cursor = this._hovered ? 'pointer' : 'default';

            this.update();
        }

        isCorrectRegion(position) {
            if (this._regions.length < 1) {
                return false;
            }

            const region = this.getRegionByXY(this._regions, CoreUtils.worldToData(this._params.lps2IJK, position));

            if (region === null || region !== this._initialRegion || this._regions[region].unitsY !== 'cm/sec') {
                this._container.style.cursor = 'not-allowed';

                return false;
            }

            this._container.style.cursor = this._hovered ? 'pointer' : 'default';

            return true;
        }

        create() {
            this.createDOM();
        }

        createDOM() {
            this._line = document.createElement('div');
            this._line.setAttribute('class', 'widgets-dashline');
            this._container.appendChild(this._line);

            this._label = document.createElement('div');
            this._label.setAttribute('class', 'widgets-label');

            // Measurenents
            let measurementsContainer = document.createElement('div');
            // Peak Velocity
            let pvContainer = document.createElement('div');
            pvContainer.setAttribute('id', 'peakVelocity');
            measurementsContainer.appendChild(pvContainer);
            // Gradient
            let gradientContainer = document.createElement('div');
            gradientContainer.setAttribute('id', 'gradient');
            measurementsContainer.appendChild(gradientContainer);

            this._label.appendChild(measurementsContainer);
            this._container.appendChild(this._label);

            this.updateDOMColor();
        }

        update() {
            this.updateColor();

            this._handle.update();
            this._worldPosition.copy(this._handle.worldPosition);

            this.updateDOM();
        }

        updateDOM() {
            this.updateDOMColor();

            const point = CoreUtils.worldToData(this._params.lps2IJK, this._worldPosition);
            const region = this._regions[this.getRegionByXY(this._regions, point)];
            const usPosition = this.getPointInRegion(region, point);

            // content
            this._velocity = Math.abs(usPosition.y / 100);
            this._gradient = 4 * Math.pow(this._velocity, 2);

            this._label.querySelector('#peakVelocity').innerHTML = `${this._velocity.toFixed(2)} m/s`;
            this._label.querySelector('#gradient').innerHTML = `${this._gradient.toFixed(2)} mmhg`;

            // position
            const transform = this.adjustLabelTransform(this._label, this._handle.screenPosition, true);

            this._line.style.transform =
                `translate3D(${transform.x - point.x - region.axisX - region.x0 * 2}px, ${transform.y}px, 0)`;
            this._line.style.width = (region.x1 - region.x0) + 'px';
            this._label.style.transform = `translate3D(${transform.x + 10}px, ${transform.y + 10}px, 0)`;
        }

        updateDOMColor() {
            this._line.style.backgroundColor = this._color;
            this._label.style.borderColor = this._color;
        }

        hideDOM() {
            this._label.style.display = 'none';
            this._handle.hideDOM();
        }

        showDOM() {
            this._label.style.display = '';
            this._handle.showDOM();
        }

        free() {
            this.removeEventListeners();

            this.remove(this._handle);
            this._handle.free();
            this._handle = null;
            this.remove(this._moveHandle);
            this._moveHandle.free();
            this._moveHandle = null;

            this._container.removeChild(this._line);
            this._container.removeChild(this._label);

            super.free();
        }

        get targetMesh() {
            return this._targetMesh;
        }

        set targetMesh(targetMesh) {
            this._targetMesh = targetMesh;
            this._handle.targetMesh = targetMesh;
            this._moveHandle.targetMesh = targetMesh;
            this.update();
        }

        get worldPosition() {
            return this._worldPosition;
        }

        set worldPosition(worldPosition) {
            this._handle.worldPosition.copy(worldPosition);
            this._moveHandle.worldPosition.copy(worldPosition);
            this._worldPosition.copy(worldPosition);
            this.update();
        }

        get active() {
            return this._active;
        }

        set active(active) {
            this._active = active;
            this._controls.enabled = !this._active;

            this.update();
        }

        get velocity() {
            return this._velocity;
        }

        get gradient() {
            return this._gradient;
        }
    };
};

export {widgetsPeakVelocity};
export default widgetsPeakVelocity();
