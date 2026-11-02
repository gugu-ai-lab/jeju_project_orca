import test from 'node:test'
import assert from 'node:assert/strict'
import { readVerifiedCoordinates } from '../src/lib/coordinates.js'

test('only finite non-empty coordinates in geographic ranges are mappable', () => {
  assert.deepEqual(readVerifiedCoordinates('33.4466', '126.664'), { lat: 33.4466, lng: 126.664 })
  for (const values of [[undefined, undefined], ['', ''], ['x', '126'], [91, 126], [33, 181], [0, 0]]) {
    assert.equal(readVerifiedCoordinates(...values), null)
  }
})
