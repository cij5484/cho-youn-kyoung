import type { ExperienceMode } from './AlbumDetailExperience3D';

export type AlbumFrameState = {
  mode: ExperienceMode;
  playing: boolean;
  sceneTransitioning: boolean;
  pageTurning: boolean;
  sceneMotion: boolean;
};

export function needsContinuousAlbumFrames(state: AlbumFrameState) {
  return state.sceneTransitioning
    || state.pageTurning
    || state.sceneMotion
    || (state.mode === 'PLAYER_FOCUS' && state.playing);
}
