import { Vector3 } from "three";
const rand = (num) => {
  return Math.random() * num * 2 - num;
};
class Walker {
  constructor({ start, radius = 1, boundingDist, pos }) {
    if (start) {
      this.pos = new Vector3(0, 0, 0);
      this.stuck = true;
    } else if (pos) {
      this.stuck = true;
      this.pos = pos.clone();
    } else {
      this.boundingDist = boundingDist;
      this.pos = new Vector3();
      this.pos.randomDirection();
      this.pos.multiplyScalar(boundingDist);
      this.stuck = false;
      this.vel = new Vector3();
    }
    this.r = radius;
    this.r2 = radius * radius;
  }

  walk() {
    this.vel.randomDirection();

    this.pos.add(this.vel);
    if (this.pos.length() > this.boundingDist) {
      this.pos.setLength(this.boundingDist);
    }
  }

  checkStuck(others) {
    for (let i = 0; i < others.length; i++) {
      const other = others[i];
      const d = this.pos.distanceToSquared(other.pos);
      if (d < this.r2 + other.r2 + 2 * other.r * this.r) {
        this.stuck = true;
        return true;
      }
    }
    return false;
  }
  clone() {
    return new Walker({ radius: this.r, pos: this.pos });
  }
}
export default Walker;
