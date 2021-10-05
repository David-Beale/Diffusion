/* eslint-disable no-undef */
/* eslint-disable no-restricted-globals */
importScripts("libs/three.min.js");
importScripts("Octree/Octree.js");
importScripts("Octree/Box.js");
importScripts("Octree/Sphere.js");
importScripts("Walker.js");

const w = new Walker({ start: false, boundingDist: 4 });
let maxDist = 4;
let tree;
const range = new Sphere();
let finished = false;

let results = [];
const walk = () => {
  if (finished) return;
  while (true) {
    w.walk();
    range.set(w);
    if (tree.query(range)) break;
  }
  const wDistFromOrigin = w.pos.length();
  if (wDistFromOrigin > maxDist) {
    maxDist = wDistFromOrigin + 4;
  }
  const { x, y, z } = w.pos;
  const result = { pos: { x, y, z }, dist: wDistFromOrigin, maxDist };
  results.push(result);
  tree.insert(w.clone());
  w.reset(maxDist);
  setTimeout(
    () => {
      walk();
    },
    results.length < 10 ? 0 : 16
  );
};
const beginWalker = (maxRange) => {
  const boundary = new Box(0, 0, 0, maxRange, maxRange, maxRange);
  tree = new Octree(boundary);
  tree.insert(new Walker({ start: true }));
  walk();
};
self.onmessage = (e) => {
  const { message, maxRange } = e.data;
  if (message === "start") beginWalker(maxRange);
  else if (message === "finished") finished = true;
  else {
    self.postMessage(results);
    results = [];
  }
};
