export default class Box {
  constructor(x, y, z, w, h, d) {
    this.x = x;
    this.y = y;
    this.z = z;
    this.w = w;
    this.h = h;
    this.d = d;
    this.left = x - w;
    this.right = x + w;
    this.top = y + h;
    this.bottom = y - h;
    this.front = z + d;
    this.back = z - d;
  }
  contains(walker) {
    return (
      walker.pos.x >= this.left &&
      walker.pos.x < this.right &&
      walker.pos.y >= this.bottom &&
      walker.pos.y < this.top &&
      walker.pos.z >= this.back &&
      walker.pos.z < this.front
    );
  }

  xIntersects(range) {
    return !(range.right < this.left || range.left > this.right);
  }
  yIntersects(range) {
    return !(range.top < this.bottom || range.bottom > this.top);
  }
  zIntersects(range) {
    return !(range.front < this.back || range.back > this.front);
  }
  intersects(range) {
    return (
      this.xIntersects(range) &&
      this.yIntersects(range) &&
      this.zIntersects(range)
    );
  }
}
