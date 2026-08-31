import type { Album } from '../../../data/albums';
import { COVER_DEPTH, getPackageDimensions, JI_SPINE_RATIO } from '../packageGeometry';

// Physical construction differs; camera, motion and interaction do not.
export function getPackageProfile(album: Album) {
  const scanned = album.detailExperience?.theme === 'han-beom-su-paper';
  const dimensions = getPackageDimensions(album.albumHero?.packageGeometry ?? {
    front: { width: 3000, height: 2686 },
    back: { width: 3000, height: 2686 },
    spine: { width: JI_SPINE_RATIO * 2686, height: 2686 },
  });
  const paperThickness = scanned ? COVER_DEPTH : 0.028;
  const halfDepth = dimensions.printedSpineDepth / 2;
  const frontCenterZ = halfDepth - paperThickness / 2;
  const backCenterZ = -frontCenterZ;
  const backInnerZ = backCenterZ + paperThickness / 2 + 0.001;
  const trayPlateZ = backInnerZ + 0.018 / 2 + 0.001;
  const recessZ = trayPlateZ + 0.018 / 2 + 0.001;
  return {
    scanned, dimensions, paperThickness, halfDepth, frontCenterZ, backCenterZ,
    backInnerZ, trayPlateZ, recessZ, hubZ: recessZ + 0.009, cdMountZ: recessZ + 0.046,
  };
}

export type PackageProfile = ReturnType<typeof getPackageProfile>;
