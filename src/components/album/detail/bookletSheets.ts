import * as THREE from 'three';

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
  const plane = new THREE.PlaneGeometry(width, height, 24, 2);
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
  plane.dispose();
  return geometry;
}

export function bendBookletLeaf(geometry: THREE.BufferGeometry, width: number, openness: number) {
  const positions = geometry.attributes.position as THREE.BufferAttribute;
  const bend = Math.sin(Math.PI * openness) * width * 0.035;
  for (let index = 0; index < positions.count; index++) {
    positions.setZ(index, Math.sin(Math.PI * positions.getX(index) / width) * bend);
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
