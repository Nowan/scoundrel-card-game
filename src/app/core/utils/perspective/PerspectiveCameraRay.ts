import { vec3 } from "gl-matrix";

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

    /**
     * Computes intersection of this ray with a 3D plane.
     * @param planePoint A point on the plane (in world space)
     * @param planeNormal Normal vector of the plane (in world space)
     * @returns The intersection point (vec3) or null if no intersection.
     */
    intersectPlane(planePoint: vec3, planeNormal: vec3): vec3 | null {
        const denom = vec3.dot(this.direction, planeNormal);
        if (Math.abs(denom) < 1e-6) return null; // Parallel to plane

        const diff = vec3.sub(vec3.create(), planePoint, this.origin);
        const t = vec3.dot(diff, planeNormal) / denom;
        if (t < 0) return null; // Behind the ray origin

        return vec3.scaleAndAdd(vec3.create(), this.origin, this.direction, t);
    }

    /**
     * Returns a point along the ray at distance `t`.
     */
    at(t: number): vec3 {
        return vec3.scaleAndAdd(vec3.create(), this.origin, this.direction, t);
    }
}