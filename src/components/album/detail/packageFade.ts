import { Group, Material, Mesh } from 'three';

export const PACKAGE_FADE_EPSILON = 0.01;

/** One fade owner for shell + booklet; the detached player disc is excluded. */
export class PackageFade {
  private root: Group | null = null;
  private entries: Array<{ material: Material; opacity: number; depthWrite: boolean }> = [];
  private originals = new WeakMap<Material, { opacity: number; depthWrite: boolean }>();
  private lastOpacity = Number.NaN;

  capture(root: Group | null) {
    this.root = root;
    this.entries = [];
    this.lastOpacity = Number.NaN;
    root?.traverse((object) => {
      if (!(object instanceof Mesh) || !object.userData.packageSurface) return;
      for (const material of Array.isArray(object.material) ? object.material : [object.material]) {
        const original = this.originals.get(material) ?? { opacity: material.opacity, depthWrite: material.depthWrite };
        this.originals.set(material, original);
        this.entries.push({ material, ...original });
        material.transparent = true;
        material.needsUpdate = true;
      }
    });
  }

  update(opacity: number) {
    const applied = opacity <= PACKAGE_FADE_EPSILON ? 0 : opacity >= 1 - PACKAGE_FADE_EPSILON ? 1 : opacity;
    // Transparent materials (including transmission/shadows) are not a
    // substitute for removing the whole package from the render tree.
    if (this.root) this.root.visible = applied > 0;
    if (applied === this.lastOpacity) return;
    for (const entry of this.entries) {
      entry.material.opacity = entry.opacity * applied;
      entry.material.depthWrite = entry.depthWrite && applied > 0.99;
    }
    this.lastOpacity = applied;
  }
}
