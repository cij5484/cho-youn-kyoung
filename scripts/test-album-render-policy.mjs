import test from 'node:test';
import assert from 'node:assert/strict';
import { needsContinuousAlbumFrames } from '../src/components/album/detail/renderPolicy.ts';

const idle = {
  mode: 'ALBUM_OPEN',
  playing: false,
  sceneTransitioning: false,
  pageTurning: false,
  sceneMotion: false,
};

test('static open and booklet scenes render on demand', () => {
  assert.equal(needsContinuousAlbumFrames(idle), false);
  assert.equal(needsContinuousAlbumFrames({ ...idle, mode: 'BOOKLET_FOCUS' }), false);
  assert.equal(needsContinuousAlbumFrames({ ...idle, mode: 'PLAYER_FOCUS' }), false);
});

test('transitions, page turns, direct motion and playback keep frames running', () => {
  assert.equal(needsContinuousAlbumFrames({ ...idle, sceneTransitioning: true }), true);
  assert.equal(needsContinuousAlbumFrames({ ...idle, pageTurning: true }), true);
  assert.equal(needsContinuousAlbumFrames({ ...idle, sceneMotion: true }), true);
  assert.equal(needsContinuousAlbumFrames({ ...idle, mode: 'PLAYER_FOCUS', playing: true }), true);
});
