import * as THREE from 'three'
import TextSprite from '@seregpie/three.text-sprite'

export class Measure extends THREE.Object3D {
  constructor () {
    super()
    this.value = 0
    this.isEnd = false
    this.unitlabel = ' mm'
    this.showtext = new TextSprite({
      alignment: 'right',
      color: '#24ff00',
      fontFamily: '"Times New Roman", Times, serif',
      fontSize: 8,
      fontStyle: 'normal',
      text: this.value + this.unitlabel
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
