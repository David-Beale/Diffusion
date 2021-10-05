/* eslint-disable no-undef */
/* eslint-disable no-restricted-globals */
class Octree {
  constructor(boundary) {
    this.sectionsLength = 8;
    this.subSections = [];
    this.boundary = boundary;
    this.capacity = 8;
    this.points = [];
  }
  clear() {
    this.subSections = [];
    this.points = [];
  }
  insert(walker) {
    if (!this.boundary.contains(walker)) return false;
    if (this.points.length < this.capacity) {
      this.points.push(walker);
      return true;
    }
    if (!this.subSections.length) {
      this.subdivide();
    }

    for (let section of this.subSections) {
      const success = section.insert(walker);
      if (success) return true;
    }
  }

  subdivide() {
    let { x, y, z, w, h, d } = this.boundary;
    x -= w / 2;
    y -= h / 2;
    z -= d / 2;
    for (let i = 0; i < this.sectionsLength; i++) {
      const newBox = new Box(
        x + (i % 2) * w,
        y + Math.floor((i % 4) / 2) * h,
        z + Math.floor(i / 4) * d,
        w / 2,
        h / 2,
        d / 2
      );
      const newTree = new Octree(newBox);
      this.subSections.push(newTree);
    }
  }

  query(range) {
    if (!this.boundary.intersects(range)) return false;
    for (const point of this.points) {
      if (range.contains(point)) return point;
    }

    for (const section of this.subSections) {
      const found = section.query(range);
      if (found) return found;
    }

    return false;
  }
}
