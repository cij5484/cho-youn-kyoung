import test from 'node:test';
import assert from 'node:assert/strict';
import { Group, Mesh, MeshBasicMaterial, BoxGeometry, Quaternion, Scene, Vector3 } from 'three';
import { DiscMotion } from '../src/components/album/detail/discMotion.ts';
import { PackageFade, PACKAGE_FADE_EPSILON } from '../src/components/album/detail/packageFade.ts';
import { packageAlignmentError, prepareFrontFacingPackage } from '../src/components/album/detail/packageAlignment.ts';

function fixture() {
  const scene = new Scene();
  const pack = new Group();
  const tray = new Group();
  const disc = new Group();
  scene.add(pack, disc);
  pack.add(tray);
  pack.position.set(1.2, -0.2, -0.8);
  pack.rotation.set(-0.12, 0.35, 0);
  pack.scale.setScalar(0.82);
  tray.position.set(0.7, 0, 0);
  return { scene, pack, tray, disc, motion: new DiscMotion() };
}

test('opening from any HOME rotation targets the nearest front and clears tilt/inertia', () => {
  for (const yaw of [-19, -Math.PI, -1.4, 0.12, 1.8, Math.PI, 7.8, 22]) {
    const rotation = { x: 0.42, y: yaw };
    const inertia = { x: 1.2, y: -2.1 };
    const target = prepareFrontFacingPackage(rotation, inertia);
    assert.equal(rotation.x, 0);
    assert.equal(rotation.y, target);
    assert.deepEqual(inertia, { x: 0, y: 0 });
    assert.ok(Math.abs(target - yaw) <= Math.PI + 1e-10);
    assert.ok(Math.abs(Math.sin(target)) < 1e-10);
    assert.ok(Math.cos(target) > 0.99999);
  }
});

test('responsive re-entry cannot finish alignment using only the reset target', () => {
  const rendered = { x: 0.3, y: 1.6 };
  const control = { ...rendered };
  const inertia = { x: 0.4, y: 0.8 };
  let target = prepareFrontFacingPackage(control, inertia);
  for (let frame = 0; frame < 180; frame++) {
    // Simulate mobile detection / repeated effect setup during entry.
    if (frame < 12) target = prepareFrontFacingPackage(control, inertia);
    if (frame === 0) assert.ok(packageAlignmentError(rendered, target) > 1);
    rendered.x += (0 - rendered.x) * 0.1;
    rendered.y += (target - rendered.y) * 0.1;
  }
  assert.ok(packageAlignmentError(rendered, target) < 0.0001);
});

test('reduced-motion entry settles to the front in one frame', () => {
  const rendered = { x: -0.4, y: 5.2 };
  const control = { ...rendered };
  const target = prepareFrontFacingPackage(control, { x: 0, y: 1 });
  Object.assign(rendered, control);
  assert.equal(packageAlignmentError(rendered, target), 0);
});

test('seated disc is mounted to the translated, rotated and scaled tray', () => {
  const { scene, tray, disc, motion } = fixture();
  assert.ok(motion.step(disc, tray, scene, 0.06, false, -1.55, 0.08, 1.72, 1) < 1e-6);
  const expected = tray.localToWorld(new Vector3(0, 0, 0.06));
  assert.ok(disc.getWorldPosition(new Vector3()).distanceTo(expected) < 1e-6);
  assert.ok(disc.getWorldQuaternion(new Quaternion()).angleTo(tray.getWorldQuaternion(new Quaternion())) < 1e-6);
  assert.equal(disc.parent, tray);
  assert.ok(disc.position.distanceTo(new Vector3(0, 0, 0.06)) < 1e-6);
});

test('return includes quaternion and scale error, not only position', () => {
  const { scene, tray, disc, motion } = fixture();
  motion.step(disc, tray, scene, 0.06, true, -1.55, 0.08, 1.72, 1);
  disc.scale.setScalar(2);
  disc.rotation.y += 0.5;
  assert.ok(motion.step(disc, tray, scene, 0.06, false, -1.55, 0.08, 1.72, 0) > 1);
});

test('reversing mid-flight preserves continuous transforms and converges', () => {
  const { scene, pack, tray, disc, motion } = fixture();
  motion.step(disc, tray, scene, 0.06, false, -1.55, 0.08, 1.72, 1);
  for (let frame = 0; frame < 18; frame++) motion.step(disc, tray, scene, 0.06, true, -1.55, 0.08, 1.72, 0.1);
  const before = disc.position.clone();
  pack.position.x += 0.3;
  const target = tray.localToWorld(new Vector3(0, 0, 0.06));
  motion.step(disc, tray, scene, 0.06, false, -1.55, 0.08, 1.72, 0.1);
  assert.ok(Math.abs(disc.position.distanceTo(before) - before.distanceTo(target) * 0.1) < 1e-6);
  assert.equal(disc.parent, scene);
  let settled = false;
  for (let frame = 0; frame < 240; frame++) {
    if (motion.step(disc, tray, scene, 0.06, false, -1.55, 0.08, 1.72, 0.1) === 0) {
      settled = true;
      break;
    }
  }
  assert.equal(settled, true);
  assert.equal(disc.parent, tray);
  assert.ok(disc.position.distanceTo(new Vector3(0, 0, 0.06)) < 1e-6);
});

test('a seated disc follows abrupt tray movement exactly without interpolation lag', () => {
  const { scene, pack, tray, disc, motion } = fixture();
  motion.step(disc, tray, scene, 0.06, false, -1.55, 0.08, 1.72, 1);
  pack.position.set(-1.4, 0.8, -0.2);
  pack.rotation.set(0.28, -1.15, 0.14);
  pack.scale.setScalar(1.24);
  const expected = tray.localToWorld(new Vector3(0, 0, 0.06));
  const error = motion.step(disc, tray, scene, 0.06, false, -1.55, 0.08, 1.72, 0.03);
  assert.equal(error, 0);
  assert.equal(disc.parent, tray);
  assert.ok(disc.getWorldPosition(new Vector3()).distanceTo(expected) < 1e-6);
  assert.ok(disc.getWorldQuaternion(new Quaternion()).angleTo(tray.getWorldQuaternion(new Quaternion())) < 1e-6);
  assert.ok(disc.getWorldScale(new Vector3()).distanceTo(tray.getWorldScale(new Vector3())) < 1e-6);
});

test('reduced motion settles in one step for both directions', () => {
  const { scene, tray, disc, motion } = fixture();
  assert.ok(motion.step(disc, tray, scene, 0.06, true, 0, 0.7, 0.6, 1) < 1e-6);
  assert.ok(motion.step(disc, tray, scene, 0.06, false, 0, 0.7, 0.6, 1) < 1e-6);
});

test('shell fade preserves base opacity, excludes disc and survives recapture', () => {
  const root = new Group();
  const paper = new MeshBasicMaterial();
  const plastic = new MeshBasicMaterial({ opacity: 0.24, transparent: true, depthWrite: false });
  const shell = new Mesh(new BoxGeometry(), [paper, plastic]);
  shell.userData.packageSurface = true;
  const disc = new Mesh(new BoxGeometry(), new MeshBasicMaterial());
  root.add(shell, disc);
  const fade = new PackageFade();
  fade.capture(root);
  fade.update(0.5);
  assert.equal(paper.opacity, 0.5);
  assert.equal(plastic.opacity, 0.12);
  assert.equal(disc.material.opacity, 1);
  assert.equal(root.visible, true);
  fade.capture(root);
  fade.update(1);
  assert.equal(paper.opacity, 1);
  assert.equal(paper.depthWrite, true);
  assert.equal(plastic.opacity, 0.24);
  assert.equal(plastic.depthWrite, false);
  shell.geometry.dispose(); disc.geometry.dispose(); paper.dispose(); plastic.dispose(); disc.material.dispose();
});

test('booklet focus hides the package but preserves both detached paper faces and their return', () => {
  const scene = new Scene();
  const pack = new Group();
  const booklet = new Group();
  const front = new MeshBasicMaterial();
  const back = new MeshBasicMaterial();
  const paper = new Mesh(new BoxGeometry(), [front, back]);
  paper.userData = { packageSurface: true, bookletSurface: true };
  const shell = new Mesh(new BoxGeometry(), new MeshBasicMaterial());
  shell.userData.packageSurface = true;
  const tray = new Mesh(new BoxGeometry(), new MeshBasicMaterial());
  scene.add(pack);
  pack.add(shell, tray, booklet);
  booklet.add(paper);
  const fade = new PackageFade();
  fade.capture(pack);
  // Parent fade runs before the booklet detaches, including reduced motion.
  fade.update(0, true);
  scene.attach(booklet);
  const visible = [];
  scene.traverseVisible((node) => { if (node instanceof Mesh) visible.push(node); });
  assert.deepEqual(visible, [paper]);
  for (const material of [front, back]) {
    assert.equal(material.opacity, 1);
    assert.equal(material.depthWrite, true);
  }
  fade.update(0.25, true);
  assert.equal(front.opacity, 1); // Returning paper must not blink with the shell.
  fade.update(1, true);
  pack.attach(booklet);
  assert.equal(pack.visible, true);
  assert.equal(shell.material.opacity, 1);
  fade.update(0, false);
  assert.equal(front.opacity, 0);
  fade.update(0, true); // Same shell opacity, different focus owner.
  assert.equal(front.opacity, 1);
  paper.geometry.dispose(); shell.geometry.dispose(); tray.geometry.dispose();
  front.dispose(); back.dispose(); shell.material.dispose(); tray.material.dispose();
});

test('player hides the entire digipack, including both booklet faces and untagged tray parts', () => {
  const { scene, pack, tray, disc, motion } = fixture();
  const front = new MeshBasicMaterial();
  const back = new MeshBasicMaterial();
  const leaf = new Mesh(new BoxGeometry(), [front, back]);
  leaf.userData.packageSurface = true;
  const accent = new Mesh(new BoxGeometry(), new MeshBasicMaterial({ transparent: true, opacity: 0.5 }));
  const discSurface = new Mesh(new BoxGeometry(), new MeshBasicMaterial());
  pack.add(leaf);
  tray.add(accent);
  disc.add(discSurface);
  motion.step(disc, tray, scene, 0.06, false, 0, 0.7, 1.72, 1);
  const fade = new PackageFade();
  fade.capture(pack);
  fade.update(0.5);
  assert.equal(front.opacity, 0.5);
  assert.equal(back.opacity, 0.5);
  assert.equal(discSurface.material.opacity, 1);
  // Match the frame order: parent fade runs before the disc detaches.
  fade.update(PACKAGE_FADE_EPSILON / 2);
  motion.step(disc, tray, scene, 0.06, true, 0, 0.7, 1.72, 1);
  assert.equal(pack.visible, false);
  assert.equal(front.opacity, 0);
  assert.equal(back.opacity, 0);
  assert.equal(front.depthWrite, false);
  const visible = [];
  scene.traverseVisible((object) => { if (object instanceof Mesh) visible.push(object); });
  assert.deepEqual(visible, [discSurface], 'only the CD remains behind its transparent hub / hole');
  fade.update(1);
  motion.step(disc, tray, scene, 0.06, false, 0, 0.7, 1.72, 1);
  assert.equal(pack.visible, true);
  assert.equal(front.opacity, 1);
  assert.equal(back.opacity, 1);
  assert.equal(front.depthWrite, true);
  assert.equal(disc.parent, tray);
  leaf.geometry.dispose(); accent.geometry.dispose(); discSurface.geometry.dispose();
  front.dispose(); back.dispose(); accent.material.dispose(); discSurface.material.dispose();
});

test('zero-opacity capture and repeated player cycles never resurrect a hidden package', () => {
  const root = new Group();
  const material = new MeshBasicMaterial();
  const shell = new Mesh(new BoxGeometry(), material);
  shell.userData.packageSurface = true;
  root.add(shell);
  const fade = new PackageFade();
  fade.capture(root);
  for (let cycle = 0; cycle < 4; cycle++) {
    fade.update(0);
    fade.capture(root);
    fade.update(0);
    assert.equal(root.visible, false);
    assert.equal(material.opacity, 0);
    fade.update(1);
    assert.equal(root.visible, true);
    assert.equal(material.opacity, 1);
  }
  shell.geometry.dispose(); material.dispose();
});
