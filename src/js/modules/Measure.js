import * as THREE from 'three'
import TextSprite from 'three.textsprite'


export class Measure extends THREE.Object3D {
  constructor() {
    super()
    this.value = 0
    this.isEnd = false
    this.unitlabel = ' mm'
    this.showtext = new TextSprite({
      material: {
        color: 0xffffff,
        fog: true
      },
      redrawInterval: 250,
      textSize: 0.36,
      texture: {
        fontFamily: 'Arial, Helvetica, sans-serif',
        text: this.value + this.unitlabel
      }
    })
  }

  getValue () {
    return this.value
  }

  isMeasureEnd () {
    return this.isEnd
  }

  movePoint (point) {

  }

}

export default Measure