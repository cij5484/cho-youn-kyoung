type Rotation = { x: number; y: number };

/** Keep the shortest route to the front, even after several HOME rotations. */
export function prepareFrontFacingPackage(rotation: Rotation, inertia: Rotation) {
  const yaw = Math.round(rotation.y / (Math.PI * 2)) * Math.PI * 2;
  rotation.x = 0;
  rotation.y = yaw;
  inertia.x = 0;
  inertia.y = 0;
  return yaw;
}

/** Read the rendered pose, not the already-reset drag target. */
export function packageAlignmentError(rendered: Rotation, targetYaw: number) {
  return Math.abs(rendered.x) + Math.abs(rendered.y - targetYaw);
}
