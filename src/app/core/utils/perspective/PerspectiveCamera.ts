import { mat4, vec4 } from "gl-matrix";
import { PointData } from "pixi.js";
import { PointData3D } from "./PointData3D";

export class PerspectiveCamera {
    position: PointData3D = { x: 0, y: 0, z: 0 };
    target: PointData3D = { x: 0, y: 0, z: 0 };
    fieldOfView: number = 45;
    viewport: { width: number, height: number } = { width: 1, height: 1 };

    constructor(props: PerspectiveCameraProps = {}) {
        this.position = props.position ?? this.position;
        this.target = props.lookAt ?? this.target;
        this.fieldOfView = props.fieldOfView ?? this.fieldOfView;
        this.viewport = props.viewport ?? this.viewport;
    }

    transform<VERTICES extends PointData3D[] = PointData3D[]>(vertices: VERTICES, offset: PointData3D, rotation: PointData3D): VERTICES {
        const ndcs = this._calculateNormalizedDeviceCoordinates(vertices, offset, rotation);

        return ndcs.map(ndc => {
            const x = (-ndc.x * 0.5 + 0.5) * this.viewport.width;
            const y = (-ndc.y * 0.5 + 0.5) * this.viewport.height;

            return { x, y };
        }) as VERTICES;
    }

    private _calculateNormalizedDeviceCoordinates(vertices: PointData3D[], offset: PointData3D, rotation: PointData3D): PointData[] {
        const mvpMatrix = this._calculateModelViewProjectionMatrix(vertices, offset, rotation);

        return vertices.map((vertex) => {
            const v = vec4.transformMat4(vec4.create(), [vertex.x, vertex.y, vertex.z, 1], mvpMatrix);
            const w = v[3] || 1;

            return { x: v[0] / w, y: v[1] / w };
        });
    }

    private _calculateModelViewProjectionMatrix(vertices: PointData3D[], offset: PointData3D, rotation: PointData3D): mat4 {
        const mvpMatrix = mat4.create();
        const modelMatrix = this._calculateModelMatrix(vertices, offset, rotation);
        const viewMatrix = this._calculateViewMatrix();
        const projectionMatrix = this._calculateProjectionMatrix();

        mat4.multiply(mvpMatrix, viewMatrix, modelMatrix);
        mat4.multiply(mvpMatrix, projectionMatrix, mvpMatrix);

        return mvpMatrix;
    }

    _calculateModelMatrix(vertices: PointData3D[], offset: PointData3D, rotation: PointData3D): mat4 {
        const modelMatrix = mat4.create();
        const rotationPivot = this._calculateCentroid(vertices);

        // Move model to world origin
        mat4.translate(modelMatrix, modelMatrix, [
            offset.x,
            offset.y,
            offset.z,
        ]);

        // Apply rotation around rotationPivot (in radians)
        mat4.translate(modelMatrix, modelMatrix, [rotationPivot.x, rotationPivot.y, rotationPivot.z]);
        mat4.rotateX(modelMatrix, modelMatrix, (rotation.x * Math.PI) / 180);
        mat4.rotateY(modelMatrix, modelMatrix, (rotation.y * Math.PI) / 180);
        mat4.rotateZ(modelMatrix, modelMatrix, (rotation.z * Math.PI) / 180);
        mat4.translate(modelMatrix, modelMatrix, [-rotationPivot.x, -rotationPivot.y, -rotationPivot.z]);

        return modelMatrix;
    }

    _calculateViewMatrix(): mat4 {
        return mat4.lookAt(
            mat4.create(),
            [this.position.x, this.position.y, this.position.z],
            [this.target.x, this.target.y, this.target.z],
            [0, -1, 0]
        );
    }

    _calculateProjectionMatrix(): mat4 {
        const aspectRatio = this.viewport.width / this.viewport.height;
        return mat4.perspective(mat4.create(), (this.fieldOfView * Math.PI) / 180, aspectRatio, 0.1, 2000);
    }

    _calculateCentroid(vertices: PointData3D[]) {
        return {
            x: (Math.max(...vertices.map(v => v.x)) + Math.min(...vertices.map(v => v.x))) * 0.5,
            y: (Math.max(...vertices.map(v => v.y)) + Math.min(...vertices.map(v => v.y))) * 0.5,
            z: (Math.max(...vertices.map(v => v.z)) + Math.min(...vertices.map(v => v.z))) * 0.5,
        };
    }
}

export type PerspectiveCameraProps = {
    position?: PointData3D,
    lookAt?: PointData3D,
    fieldOfView?: number,
    viewport?: { width: number, height: number }
}