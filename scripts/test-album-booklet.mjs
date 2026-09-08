import test from 'node:test';
import assert from 'node:assert/strict';
import { Mesh, Vector3 } from 'three';
import { albums } from '../src/data/albums.ts';
import {
  bendBookletLeaf, bookletLeaves, bookletReadingPose, bookletTextureWindow,
  createBookletLeafGeometry, poseBookletLeaf,
} from '../src/components/album/detail/bookletSheets.ts';

for (const album of albums.filter((album) => album.booklet && album.detailExperience)) {
  test(`${album.id}: every page belongs to exactly one front/back pair`, () => {
    const count = album.booklet.previewImages.length;
    const leaves = bookletLeaves(count);
    assert.deepEqual(leaves.flatMap(({ front, back }) => back === null ? [front] : [front, back]),
      Array.from({ length: count }, (_, i) => i));
    assert.deepEqual(leaves[0], { front: 0, back: 1 });
    assert.deepEqual(leaves[1], { front: 2, back: 3 });
    if (count % 2) assert.equal(leaves.at(-1).back, null, 'missing reverse is blank, never a duplicated final page');
    for (let spread = 0; spread < Math.ceil((count - 1) / 2); spread++) {
      const opened = bookletReadingPose(spread, false).turnedLeaves;
      assert.equal(leaves[opened - 1].back, spread * 2 + 1);
      assert.equal(leaves[opened].front, spread * 2 + 2);
      const loaded = bookletTextureWindow(count, opened, Math.min(opened + 1, leaves.length - 1));
      assert.ok(loaded.includes(0) && loaded.includes(1), 'cover faces stay available when closing any spread');
      assert.ok(loaded.includes(leaves[opened - 1].back));
      assert.ok(loaded.includes(leaves[opened].front));
      if (leaves[opened].back !== null) assert.ok(loaded.includes(leaves[opened].back));
    }
  });
}

test('mobile P2 → P3 pans within a spread; P3 → P4 turns the same physical leaf', () => {
  assert.deepEqual(bookletReadingPose(0, true), { turnedLeaves: 1, center: -0.5 });
  assert.deepEqual(bookletReadingPose(1, true), { turnedLeaves: 1, center: 0.5 });
  assert.deepEqual(bookletReadingPose(2, true), { turnedLeaves: 2, center: -0.5 });
});

test('front and reverse share the same deformed surface, with opposite winding and mirrored UVs', () => {
  const geometry = createBookletLeafGeometry(2, 3);
  const vertices = geometry.attributes.position.count / 2;
  for (const openness of [0, 0.25, 0.5, 0.75, 1]) {
    bendBookletLeaf(geometry, 2, openness);
    for (let i = 0; i < vertices; i++) {
      const front = new Vector3().fromBufferAttribute(geometry.attributes.position, i);
      const back = new Vector3().fromBufferAttribute(geometry.attributes.position, i + vertices);
      assert.ok(front.distanceTo(back) < 1e-9);
      assert.ok(Math.abs(geometry.attributes.uv.getX(i) + geometry.attributes.uv.getX(i + vertices) - 1) < 1e-6);
    }
  }
  const indices = geometry.index.array;
  const reverseStart = geometry.groups[1].start;
  assert.deepEqual([...indices.slice(reverseStart, reverseStart + 3)], [...indices.slice(0, 3)].reverse().map((i) => i + vertices));
  geometry.dispose();
});

test('a closing stack preserves paper order through the full rotation, including edge-on', () => {
  const first = new Mesh();
  const second = new Mesh();
  for (const openness of [0, 0.25, 0.5, 0.75, 1, 0.75, 0.5, 0.25, 0]) {
    poseBookletLeaf(first, 0, 6, openness);
    poseBookletLeaf(second, 1, 6, openness);
    const normal = new Vector3(0, 0, 1).applyEuler(first.rotation);
    assert.ok(Math.abs(first.position.clone().sub(second.position).dot(normal) - 0.003) < 1e-9);
  }
});
