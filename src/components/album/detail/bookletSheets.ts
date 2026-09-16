import * as THREE from 'three';

const PAGE_TURN_SEGMENTS = 48;

// Image indices are zero-based; each leaf owns P(2n+1) / P(2n+2).
export function bookletLeaves(pageCount: number) {
  return Array.from({ length: Math.ceil(pageCount / 2) }, (_, index) => ({
    front: index * 2,
    back: index * 2 + 1 < pageCount ? index * 2 + 1 : null,
  }));
}

export function bookletReadingPose(page: number, mobile: boolean) {
  return {
    turnedLeaves: mobile ? Math.floor(page / 2) + 1 : page + 1,
    center: mobile ? (page % 2 === 0 ? -0.5 : 0.5) : 0,
  };
}

export function bookletTextureWindow(pageCount: number, ...turnedCounts: number[]) {
  const wanted = new Set<number>([0, 1]);
  const leaves = bookletLeaves(pageCount);
  for (const count of turnedCounts) {
    // Both faces of the current and neighboring leaves must be available
    // before a turn. Keep the cover pair for closing from any spread.
    for (let index = Math.max(0, count - 2); index <= count + 1; index++) {
      const leaf = leaves[index];
      if (!leaf) continue;
      wanted.add(leaf.front);
      if (leaf.back !== null) wanted.add(leaf.back);
    }
  }
  return [...wanted].filter((index) => index < pageCount).sort((a, b) => a - b);
}

export function createBookletLeafGeometry(width: number, height: number) {
  const plane = new THREE.PlaneGeometry(width, height, PAGE_TURN_SEGMENTS, 2);
  const count = plane.attributes.position.count;
  const positions = new Float32Array(count * 2 * 3);
  const normals = new Float32Array(count * 2 * 3);
  const uvs = new Float32Array(count * 2 * 2);
  for (let index = 0; index < count; index++) {
    for (let face = 0; face < 2; face++) {
      const vertex = face * count + index;
      positions[vertex * 3] = plane.attributes.position.getX(index) + width / 2;
      positions[vertex * 3 + 1] = plane.attributes.position.getY(index);
      normals[vertex * 3 + 2] = face === 0 ? 1 : -1;
      // The reverse face reads normally after the leaf turns to the left.
      uvs[vertex * 2] = face === 0 ? plane.attributes.uv.getX(index) : 1 - plane.attributes.uv.getX(index);
      uvs[vertex * 2 + 1] = plane.attributes.uv.getY(index);
    }
  }
  const front = Array.from(plane.index!.array);
  const back = front.map((_, index) => front[index - index % 3 + (2 - index % 3)] + count);
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('normal', new THREE.BufferAttribute(normals, 3));
  geometry.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));
  geometry.setIndex([...front, ...back]);
  geometry.addGroup(0, front.length, 0);
  geometry.addGroup(front.length, back.length, 1);
  geometry.userData.arc = {
    x: new Float32Array(PAGE_TURN_SEGMENTS + 1),
    z: new Float32Array(PAGE_TURN_SEGMENTS + 1),
  };
  plane.dispose();
  return geometry;
}

export function bendBookletLeaf(geometry: THREE.BufferGeometry, width: number, openness: number, direction = 1) {
  const positions = geometry.attributes.position as THREE.BufferAttribute;
  const arc = geometry.userData.arc as { x: Float32Array; z: Float32Array };
  const progress = direction > 0 ? openness : 1 - openness;
  const segmentLength = width / PAGE_TURN_SEGMENTS;
  // Preserve 239d180's soft turn: the gutter leads the outer edge by 28%.
  // Both printed faces use this one curve; closing mirrors the same motion.
  for (let column = 1; column <= PAGE_TURN_SEGMENTS; column++) {
    const previous = THREE.MathUtils.clamp((progress - (column - 1) / PAGE_TURN_SEGMENTS * 0.28) / 0.72, 0, 1);
    const current = THREE.MathUtils.clamp((progress - column / PAGE_TURN_SEGMENTS * 0.28) / 0.72, 0, 1);
    const previousEase = previous * previous * (3 - 2 * previous);
    const currentEase = current * current * (3 - 2 * current);
    const angle = Math.PI * (previousEase + currentEase) / 2;
    arc.x[column] = arc.x[column - 1] + Math.cos(angle) * segmentLength;
    arc.z[column] = arc.z[column - 1] + Math.sin(angle) * segmentLength * 0.34;
  }
  const angle = -Math.PI * openness;
  const cos = Math.cos(angle), sin = Math.sin(angle);
  for (let index = 0; index < positions.count; index++) {
    const column = index % (PAGE_TURN_SEGMENTS + 1);
    const x = direction * arc.x[column], z = arc.z[column];
    // Undo the leaf's rigid rotation so its world surface follows the curve,
    // while poseBookletLeaf keeps the physical stack's thickness/order.
    positions.setX(index, cos * x - sin * z);
    positions.setZ(index, sin * x + cos * z);
  }
  positions.needsUpdate = true;
}

export function poseBookletLeaf(mesh: THREE.Mesh, index: number, leafCount: number, openness: number) {
  const angle = -Math.PI * openness;
  const thickness = (leafCount - 1 - index) * 0.003;
  mesh.rotation.y = angle;
  // Stack thickness follows the leaf normal, so closing a bundle never
  // swaps its front/back order halfway through the rotation.
  mesh.position.set(Math.sin(angle) * thickness, 0, Math.cos(angle) * thickness);
}
