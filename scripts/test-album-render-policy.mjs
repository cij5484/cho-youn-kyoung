import test from 'node:test';
import assert from 'node:assert/strict';
import { needsContinuousAlbumFrames } from '../src/components/album/detail/renderPolicy.ts';

const idle = {
  mode: 'ALBUM_OPEN',
  playing: false,
  reduced: false,
  sceneTransitioning: false,
  pageTurning: false,
  sceneMotion: false,
};

test('static open and booklet scenes render on demand while rotating scenes stay active', () => {
  assert.equal(needsContinuousAlbumFrames(idle), false);
  assert.equal(needsContinuousAlbumFrames({ ...idle, mode: 'BOOKLET_FOCUS' }), false);
  assert.equal(needsContinuousAlbumFrames({ ...idle, mode: 'CLOSED' }), true);
  assert.equal(needsContinuousAlbumFrames({ ...idle, mode: 'PLAYER_FOCUS' }), true);
});

test('reduced motion pauses idle closed and player scenes', () => {
  assert.equal(needsContinuousAlbumFrames({ ...idle, mode: 'CLOSED', reduced: true }), false);
  assert.equal(needsContinuousAlbumFrames({ ...idle, mode: 'PLAYER_FOCUS', reduced: true }), false);
});

test('transitions, page turns, direct motion and playback keep frames running', () => {
  assert.equal(needsContinuousAlbumFrames({ ...idle, reduced: true, sceneTransitioning: true }), true);
  assert.equal(needsContinuousAlbumFrames({ ...idle, reduced: true, pageTurning: true }), true);
  assert.equal(needsContinuousAlbumFrames({ ...idle, reduced: true, sceneMotion: true }), true);
  assert.equal(needsContinuousAlbumFrames({ ...idle, mode: 'PLAYER_FOCUS', playing: true }), true);
});
