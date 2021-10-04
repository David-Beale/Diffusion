import { Vector3 } from "three";
class Walker {
  constructor({ start, boundingDist, pos }) {
    if (start) {
      this.pos = new Vector3(0, 0, 0);
    } else if (pos) {
      this.pos = pos.clone();
    } else {
      this.boundingDist = boundingDist;
      this.pos = new Vector3();
      this.pos.randomDirection();
      this.pos.multiplyScalar(boundingDist);
      this.vel = new Vector3();
    }
  }

  walk() {
    this.vel.randomDirection();

    this.pos.add(this.vel);
    if (this.pos.length() > this.boundingDist) {
      this.pos.setLength(this.boundingDist);
    }
  }

  clone() {
    return new Walker({ pos: this.pos });
  }
}
export default Walker;
