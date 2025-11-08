import { mat4, vec4 } from "gl-matrix";
import { PerspectiveMesh, PointData } from "pixi.js";

export class PerspectiveCamera {
    position: PointData3D = { x: 0, y: 0, z: 0 };
    target: PointData3D = { x: 0, y: 0, z: 0 };
    fieldOfVision: number = 45;

    constructor(position?: PointData3D, target?: PointData3D, fieldOfVision?: number) {
        this.position = position ?? this.position;
        this.target = target ?? this.target;
        this.fieldOfVision = fieldOfVision ?? this.fieldOfVision;
    }

    applyPerspective(mesh: PerspectiveMesh, meshPosition: PointData3D = { x: 0, y: 0, z: 0 }, meshRotation: PointData3D = { x: 0, y: 0, z: 0 }, viewportWidth: number = 800, viewportHeight: number = 600): void {
        const modelMatrix = mat4.create();
        const viewMatrix = mat4.create();
        const projectionMatrix = mat4.create();
        const corners = [
            { x: 0, y: 0, z: 0 },
            { x: mesh.texture.width, y: 0, z: 0 },
            { x: mesh.texture.width, y: mesh.texture.height, z: 0 },
            { x: 0, y: mesh.texture.height, z: 0 },
        ];

        // 1) Move model to world origin
        mat4.translate(modelMatrix, modelMatrix, [
            meshPosition.x,
            meshPosition.y,
            meshPosition.z,
        ]);

        // 2) Apply rotation (in radians)
        mat4.rotateX(modelMatrix, modelMatrix, (meshRotation.x * Math.PI) / 180);
        mat4.rotateY(modelMatrix, modelMatrix, (meshRotation.y * Math.PI) / 180);
        mat4.rotateZ(modelMatrix, modelMatrix, (meshRotation.z * Math.PI) / 180);

        // 3) Translate the geometry so its center is at the local origin (rotation pivot)
        mat4.translate(modelMatrix, modelMatrix, [-mesh.texture.width / 2, -mesh.texture.height / 2, 0]);

        // 4) View matrix
        mat4.lookAt(
            viewMatrix,
            [this.position.x, this.position.y, this.position.z],
            [this.target.x, this.target.y, this.target.z],
            [0, -1, 0]
        );

        // 5) Projection matrix (perspective)
        mat4.perspective(projectionMatrix, (this.fieldOfVision * Math.PI) / 180, viewportWidth / viewportHeight, 0.1, 2000);

        // 6) Final MVP = projection * view * model
        const mvpMatrix = mat4.create();
        mat4.multiply(mvpMatrix, viewMatrix, modelMatrix);
        mat4.multiply(mvpMatrix, projectionMatrix, mvpMatrix);

        // 7) Transform all corners
        const perspectiveCorners = corners.map((corner) => {
            const v = vec4.fromValues(corner.x, corner.y, corner.z, 1);
            vec4.transformMat4(v, v, mvpMatrix);

            const w = v[3] || 1.0;
            const x_ndc = v[0] / w;
            const y_ndc = v[1] / w;

            // Convert NDC (-1..1) to screen pixels (0..viewportWidth/Height)
            const x = (-x_ndc * 0.5 + 0.5) * viewportWidth;
            const y = (-y_ndc * 0.5 + 0.5) * viewportHeight;

            return { x, y };
        });

        mesh.setCorners(
            perspectiveCorners[0].x, perspectiveCorners[0].y,
            perspectiveCorners[1].x, perspectiveCorners[1].y,
            perspectiveCorners[2].x, perspectiveCorners[2].y,
            perspectiveCorners[3].x, perspectiveCorners[3].y
        );
    }
}

export type PointData3D = PointData & { z: number };