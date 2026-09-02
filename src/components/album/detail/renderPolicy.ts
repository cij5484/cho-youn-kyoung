import type { ExperienceMode } from './AlbumDetailExperience3D';

export type AlbumFrameState = {
  mode: ExperienceMode;
  playing: boolean;
  reduced: boolean;
  sceneTransitioning: boolean;
  pageTurning: boolean;
  sceneMotion: boolean;
};

export function needsContinuousAlbumFrames(state: AlbumFrameState) {
  return state.sceneTransitioning
    || state.pageTurning
    || state.sceneMotion
    // Closed packages and the player disc rotate continuously unless the
    // visitor has asked for reduced motion. `playing` only changes disc speed.
    || (!state.reduced && (state.mode === 'CLOSED' || state.mode === 'PLAYER_FOCUS'));
}
