import test from 'node:test';
import assert from 'node:assert/strict';
import { getNextTrackIndex } from '../src/components/album/detail/useAlbumAudio.ts';

test('audio sequence advances to the next track', () => {
  assert.equal(getNextTrackIndex(0, 3), 1);
  assert.equal(getNextTrackIndex(1, 3), 2);
});

test('audio sequence stops after the final track without wrapping', () => {
  assert.equal(getNextTrackIndex(2, 3), null);
  assert.equal(getNextTrackIndex(0, 1), null);
  assert.equal(getNextTrackIndex(0, 0), null);
});
