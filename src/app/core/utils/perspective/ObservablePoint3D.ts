import type { PointData } from "pixi.js";

export type PointData3D = PointData & { z: number };

export class ObservablePoint3D implements PointData3D {
    private _x: number;
    private _y: number;
    private _z: number;

    private _cb: () => void;

    constructor(cb: () => void, x = 0, y = 0, z = 0) {
        this._cb = cb;

        this._x = x;
        this._y = y;
        this._z = z;
    }

    // ---- GETTERS / SETTERS ----

    get x(): number {
        return this._x;
    }

    set x(value: number) {
        if (this._x !== value) {
            this._x = value;
            this._cb();
        }
    }

    get y(): number {
        return this._y;
    }

    set y(value: number) {
        if (this._y !== value) {
            this._y = value;
            this._cb();
        }
    }

    get z(): number {
        return this._z;
    }

    set z(value: number) {
        if (this._z !== value) {
            this._z = value;
            this._cb();
        }
    }

    // ---- METHODS ----

    set(x = 0, y = 0, z = 0): this {
        let updated = false;

        if (this._x !== x) { this._x = x; updated = true; }
        if (this._y !== y) { this._y = y; updated = true; }
        if (this._z !== z) { this._z = z; updated = true; }

        if (updated) {
            this._cb();
        }

        return this;
    }

    copyFrom(p: PointData3D): this {
        return this.set(p.x, p.y, p.z);
    }

    copyTo<T extends PointData3D>(p: T): T {
        p.x = this._x;
        p.y = this._y;
        p.z = this._z;
        return p;
    }

    clone(): ObservablePoint3D {
        return new ObservablePoint3D(
            this._cb,
            this._x,
            this._y,
            this._z
        );
    }
}
