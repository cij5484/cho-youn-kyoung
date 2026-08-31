import { Group, Material, Mesh } from 'three';

/** Only shell surfaces fade here; tray, booklet and disc own their materials. */
export class PackageFade {
  private entries: Array<{ material: Material; opacity: number; depthWrite: boolean }> = [];
  private originals = new WeakMap<Material, { opacity: number; depthWrite: boolean }>();

  capture(root: Group | null) {
    this.entries = [];
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
    for (const entry of this.entries) {
      entry.material.opacity = entry.opacity * opacity;
      entry.material.depthWrite = entry.depthWrite && opacity > 0.99;
    }
  }
}
