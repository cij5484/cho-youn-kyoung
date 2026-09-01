import { Group, Quaternion, Scene, Vector3 } from 'three';

/**
 * Keeps a seated disc parented to its tray so package motion is inherited
 * exactly. The disc only becomes scene-owned while travelling to/from the
 * player, preserving its world transform at each ownership handoff.
 */
export class DiscMotion {
  private mount = new Vector3();
  private targetPosition = new Vector3();
  private targetQuaternion = new Quaternion();
  private targetScale = new Vector3(1, 1, 1);
  private detached = false;

  step(rig: Group, tray: Group, scene: Scene, mountZ: number, player: boolean,
    playerX: number, playerY: number, playerScale: number, ease: number) {
    this.mount.set(0, 0, mountZ);
    tray.updateWorldMatrix(true, false);
    if (player) {
      if (!this.detached) {
        scene.attach(rig);
        this.detached = true;
      }
      this.targetPosition.set(playerX, playerY, 0.34);
      this.targetQuaternion.identity();
      this.targetScale.setScalar(playerScale);
    } else {
      if (!this.detached) {
        if (rig.parent !== tray) tray.attach(rig);
        rig.position.copy(this.mount);
        rig.quaternion.identity();
        rig.scale.setScalar(1);
        return 0;
      }
      this.targetPosition.copy(this.mount).applyMatrix4(tray.matrixWorld);
      tray.getWorldQuaternion(this.targetQuaternion);
      tray.getWorldScale(this.targetScale);
    }
    scene.worldToLocal(this.targetPosition);
    rig.position.lerp(this.targetPosition, ease);
    rig.quaternion.slerp(this.targetQuaternion, ease);
    rig.scale.lerp(this.targetScale, ease);
    const error = rig.position.distanceTo(this.targetPosition)
      + rig.quaternion.angleTo(this.targetQuaternion)
      + rig.scale.distanceTo(this.targetScale);
    if (!player && error < 0.001) {
      tray.attach(rig);
      rig.position.copy(this.mount);
      rig.quaternion.identity();
      rig.scale.setScalar(1);
      this.detached = false;
      return 0;
    }
    return error;
  }
}
