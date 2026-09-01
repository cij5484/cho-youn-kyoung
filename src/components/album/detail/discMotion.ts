import { Group, Quaternion, Scene, Vector3 } from 'three';

/** A stable scene-space owner avoids React reparenting and local/world jumps. */
export class DiscMotion {
  private mount = new Vector3();
  private targetPosition = new Vector3();
  private targetQuaternion = new Quaternion();
  private targetScale = new Vector3(1, 1, 1);
  private seated = true;

  step(rig: Group, tray: Group, scene: Scene, mountZ: number, player: boolean,
    playerX: number, playerY: number, playerScale: number, ease: number) {
    this.mount.set(0, 0, mountZ);
    tray.updateWorldMatrix(true, false);
    if (player) {
      this.seated = false;
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
    const movementEase = !player && this.seated ? 1 : ease;
    rig.position.lerp(this.targetPosition, movementEase);
    rig.quaternion.slerp(this.targetQuaternion, movementEase);
    rig.scale.lerp(this.targetScale, movementEase);
    const error = rig.position.distanceTo(this.targetPosition)
      + rig.quaternion.angleTo(this.targetQuaternion)
      + rig.scale.distanceTo(this.targetScale);
    if (!player && error < 0.001) {
      rig.position.copy(this.targetPosition);
      rig.quaternion.copy(this.targetQuaternion);
      rig.scale.copy(this.targetScale);
      this.seated = true;
      return 0;
    }
    return error;
  }
}
