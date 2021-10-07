/* eslint-disable no-undef */
/* eslint-disable no-restricted-globals */
class Sphere {
  constructor(x = 0, y = 0, z = 0, r = 2) {
    this.pos = new THREE.Vector3(x, y, z);
    this.r = r;
    this.rSquared = r ** 2;
  }
  set(walker) {
    this.pos = walker.pos;
    const { x, y, z } = this.pos;
    this.left = x - this.r;
    this.right = x + this.r;
    this.top = y + this.r;
    this.bottom = y - this.r;
    this.front = z + this.r;
    this.back = z - this.r;
  }
  contains(walker) {
    const distSquared = this.pos.distanceToSquared(walker.pos);
    return distSquared <= this.rSquared;
  }
}
