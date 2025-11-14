import { vec3 } from "gl-matrix";
import { PointData3D } from "./PointData3D";

/**
 * Represents a 3D ray in world space emitted from a camera through a screen point.
 */
export class PerspectiveCameraRay {
    readonly origin: vec3;
    readonly direction: vec3;

    constructor(origin: vec3, direction: vec3) {
        this.origin = vec3.clone(origin);
        this.direction = vec3.normalize(vec3.create(), direction);
    }

    intersectQuad(corners: [PointData3D, PointData3D, PointData3D, PointData3D]): PerspectiveCameraRayIntersection | null {
        const v0 = vec3.fromValues(corners[0].x, corners[0].y, corners[0].z);
        const v1 = vec3.fromValues(corners[1].x, corners[1].y, corners[1].z);
        const v2 = vec3.fromValues(corners[2].x, corners[2].y, corners[2].z);
        const v3 = vec3.fromValues(corners[3].x, corners[3].y, corners[3].z);

        const edge1 = vec3.sub(vec3.create(), v1, v0);
        const edge2 = vec3.sub(vec3.create(), v2, v0);
        const planeNormal = vec3.cross(vec3.create(), edge1, edge2);
        vec3.normalize(planeNormal, planeNormal);

        const intersection = this.intersectPlane(v0, planeNormal);

        if (intersection && this._isPointInsideQuad(intersection.point, v0, v1, v2, v3)) {
            return intersection;
        }
        else {
            return null;
        }
    }

    /**
     * Computes intersection of this ray with a 3D plane.
     * @param planePoint A point on the plane (in world space)
     * @param planeNormal Normal vector of the plane (in world space)
     * @returns The intersection point (vec3) or null if no intersection.
     */
    intersectPlane(planePoint: vec3, planeNormal: vec3): PerspectiveCameraRayIntersection | null {
        const denom = vec3.dot(this.direction, planeNormal);
        if (Math.abs(denom) < 1e-6) return null; // Parallel to plane

        const diff = vec3.sub(vec3.create(), planePoint, this.origin);
        const t = vec3.dot(diff, planeNormal) / denom;
        if (t < 0) return null; // Behind the ray origin

        return {
            point: vec3.scaleAndAdd(vec3.create(), this.origin, this.direction, t),
            distance: t
        };
    }

    _isPointInsideQuad(p: vec3, a: vec3, b: vec3, c: vec3, d: vec3): boolean {
        return this._isPointInTriangle(p, a, b, c) || this._isPointInTriangle(p, a, c, d);
    }

    _isPointInTriangle(p: vec3, a: vec3, b: vec3, c: vec3): boolean {
        const v0 = vec3.sub(vec3.create(), c, a);
        const v1 = vec3.sub(vec3.create(), b, a);
        const v2 = vec3.sub(vec3.create(), p, a);

        const dot00 = vec3.dot(v0, v0);
        const dot01 = vec3.dot(v0, v1);
        const dot02 = vec3.dot(v0, v2);
        const dot11 = vec3.dot(v1, v1);
        const dot12 = vec3.dot(v1, v2);

        const invDenom = 1 / (dot00 * dot11 - dot01 * dot01);
        const u = (dot11 * dot02 - dot01 * dot12) * invDenom;
        const v = (dot00 * dot12 - dot01 * dot02) * invDenom;

        return u >= 0 && v >= 0 && (u + v <= 1);
    }
}

export type PerspectiveCameraRayIntersection = {
    point: vec3,
    distance: number
};