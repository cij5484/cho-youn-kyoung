import type { ExperienceMode } from './AlbumDetailExperience3D';

export type AlbumFrameState = {
  mode: ExperienceMode;
  playing: boolean;
  sceneTransitioning: boolean;
  pageTurning: boolean;
  sceneMotion: boolean;
};

export function needsContinuousAlbumFrames(state: AlbumFrameState) {
  return state.mode === 'CLOSED'
    || state.sceneTransitioning
    || state.pageTurning
    || state.sceneMotion
    // The player presentation always keeps the disc turning slowly. `playing`
    // only changes its speed; albums whose audio is not published still need
    // continuous frames for the rotation preview.
    || state.mode === 'PLAYER_FOCUS';
}
