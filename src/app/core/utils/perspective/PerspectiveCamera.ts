import { mat4, vec4 } from "gl-matrix";
import { PointData } from "pixi.js";
import { PointData3D } from "./PointData3D";

export class PerspectiveCamera {
    position: PointData3D = { x: 0, y: 0, z: 0 };
    target: PointData3D = { x: 0, y: 0, z: 0 };
    fieldOfVision: number = 45;

    constructor(position?: PointData3D, target?: PointData3D, fieldOfVision?: number) {
        this.position = position ?? this.position;
        this.target = target ?? this.target;
        this.fieldOfVision = fieldOfVision ?? this.fieldOfVision;
    }

    transformToViewport(vertices: PointData3D[], offset: PointData3D, rotation: PointData3D, viewportWidth: number = 800, viewportHeight: number = 600): PointData[] {
        const ndcs = this._calculateNormalizedDeviceCoordinates(vertices, offset, rotation);

        return ndcs.map(ndc => {
            const x = (-ndc.x * 0.5 + 0.5) * viewportWidth;
            const y = (-ndc.y * 0.5 + 0.5) * viewportHeight;

            return { x, y };
        });
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
        const modelMatrix = mat4.create();
        const viewMatrix = mat4.create();
        const projectionMatrix = mat4.create();
        const mvpMatrix = mat4.create();
        const rotationPivot = {
            x: (Math.max(...vertices.map(v => v.x)) + Math.min(...vertices.map(v => v.x))) * 0.5,
            y: (Math.max(...vertices.map(v => v.y)) + Math.min(...vertices.map(v => v.y))) * 0.5,
            z: (Math.max(...vertices.map(v => v.z)) + Math.min(...vertices.map(v => v.z))) * 0.5,
        };

        // 1) Move model to world origin
        mat4.translate(modelMatrix, modelMatrix, [
            offset.x,
            offset.y,
            offset.z,
        ]);

        // 2) Apply rotation (in radians)
        mat4.translate(modelMatrix, modelMatrix, [rotationPivot.x, rotationPivot.y, rotationPivot.z]);
        mat4.rotateX(modelMatrix, modelMatrix, (rotation.x * Math.PI) / 180);
        mat4.rotateY(modelMatrix, modelMatrix, (rotation.y * Math.PI) / 180);
        mat4.rotateZ(modelMatrix, modelMatrix, (rotation.z * Math.PI) / 180);
        mat4.translate(modelMatrix, modelMatrix, [-rotationPivot.x, -rotationPivot.y, -rotationPivot.z]);

        // 3) View matrix
        mat4.lookAt(
            viewMatrix,
            [this.position.x, this.position.y, this.position.z],
            [this.target.x, this.target.y, this.target.z],
            [0, -1, 0]
        );

        // 4) Projection matrix (perspective)
        mat4.perspective(projectionMatrix, (this.fieldOfVision * Math.PI) / 180, 1, 0.1, 2000);

        // 5) Final MVP = projection * view * model
        mat4.multiply(mvpMatrix, viewMatrix, modelMatrix);
        mat4.multiply(mvpMatrix, projectionMatrix, mvpMatrix);

        return mvpMatrix;
    }
}