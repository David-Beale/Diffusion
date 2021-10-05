/* eslint-disable no-undef */
/* eslint-disable no-restricted-globals */
class Walker {
  constructor({ start, boundingDist, pos }) {
    if (start) {
      this.pos = new THREE.Vector3(0, 0, 0);
    } else if (pos) {
      this.pos = pos.clone();
    } else {
      this.pos = new THREE.Vector3();
      this.vel = new THREE.Vector3();
      this.reset(boundingDist);
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
  reset(boundingDist) {
    this.boundingDist = boundingDist;
    this.pos.randomDirection();
    this.pos.multiplyScalar(boundingDist);
  }
}
