import type { AlbumHeroPackageGeometry } from '../../data/albums';

// Shared closed-package dimensions. Detail adds hinges and internals, but its
// closed silhouette must remain identical to the HOME package.
// 2.42 preserves the established HOME outer cover (the former 2.35 tray plus
// 0.035 overhang on both sides) while allowing detail to share it exactly.
export const PACKAGE_PANEL = 2.42;
export const COVER_OVERHANG = 0.035;
export const COVER_DEPTH = 0.018;
export const JI_SPINE_RATIO = 171 / 3000;

export function getPackageDimensions(geometry?: AlbumHeroPackageGeometry) {
  const coverHeight = PACKAGE_PANEL;
  const frontWidth = geometry ? coverHeight * geometry.front.width / geometry.front.height : coverHeight;
  const backWidth = geometry ? coverHeight * geometry.back.width / geometry.back.height : coverHeight;
  const printedSpineDepth = geometry
    ? coverHeight * geometry.spine.width / geometry.spine.height
    : coverHeight * JI_SPINE_RATIO;
  return {
    trayWidth: Math.max(frontWidth, backWidth) - COVER_OVERHANG * 2,
    trayHeight: coverHeight - COVER_OVERHANG * 2,
    trayDepth: Math.max(COVER_DEPTH, printedSpineDepth - COVER_DEPTH * 2),
    printedSpineDepth,
    frontWidth,
    frontHeight: coverHeight,
    backWidth,
    backHeight: coverHeight,
  };
}
