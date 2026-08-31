import { Group, Quaternion, Scene, Vector3 } from 'three';

/** A stable scene-space owner avoids React reparenting and local/world jumps. */
export class DiscMotion {
  private mount = new Vector3();
  private targetPosition = new Vector3();
  private targetQuaternion = new Quaternion();
  private targetScale = new Vector3(1, 1, 1);

  step(rig: Group, tray: Group, scene: Scene, mountZ: number, player: boolean,
    playerX: number, playerY: number, playerScale: number, ease: number) {
    this.mount.set(0, 0, mountZ);
    tray.updateWorldMatrix(true, false);
    if (player) {
      this.targetPosition.set(playerX, playerY, 0.34);
      this.targetQuaternion.identity();
      this.targetScale.setScalar(playerScale);
    } else {
      this.targetPosition.copy(this.mount).applyMatrix4(tray.matrixWorld);
      tray.getWorldQuaternion(this.targetQuaternion);
      tray.getWorldScale(this.targetScale);
    }
    // The rig is always rendered by a portal into scene; it never changes parent.
    scene.worldToLocal(this.targetPosition);
    rig.position.lerp(this.targetPosition, ease);
    rig.quaternion.slerp(this.targetQuaternion, ease);
    rig.scale.lerp(this.targetScale, ease);
    return rig.position.distanceTo(this.targetPosition)
      + rig.quaternion.angleTo(this.targetQuaternion)
      + rig.scale.distanceTo(this.targetScale);
  }
}
