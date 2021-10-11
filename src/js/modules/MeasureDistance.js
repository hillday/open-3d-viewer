import * as THREE from 'three'
import { Measure } from './Measure'

export class MeasureDistance extends Measure {
  constructor () {
    super()
    this.startPoint = null
    this.endPoint = null
    this.pointMaterial = new THREE.PointsMaterial({
      color: 0xE31C1C,
      vertexColors: false,
      size: 2
    })
    this.connectLine = null
    this.unitlabel = ' mm'
    this.add(this.showtext)
  }

  getValue () {
    return this.value
  }

  getLengthBetweenPoint (pointA, pointB) {
    let dir = pointB.clone().sub(pointA)
    return (dir.length() * 1000).toFixed(0)
  }

  movePoint (point) {
    if (this.isEnd) return
    if (this.startPoint === null) {
      let geometry = new THREE.Geometry()
      let p0 = new THREE.Vector3(0, 0, 0)
      p0.copy(point)
      geometry.vertices.push(p0)
      this.startPoint = new THREE.Points(geometry, this.pointMaterial)

      let lineMaterial = new THREE.LineBasicMaterial({
        vertexColors: true
      })

      let color1 = new THREE.Color(0xE31C1C)
      let color2 = new THREE.Color(0xDBB721)
      // 线的材质可以由两点的颜色决定
      let p1 = new THREE.Vector3()
      let p2 = new THREE.Vector3()
      p1.copy(point)
      p2.copy(point)
      let linegeometry = new THREE.Geometry()
      linegeometry.vertices.push(p1, p2)
      linegeometry.colors.push(color1, color2)
      this.connectLine = new THREE.Line(linegeometry, lineMaterial)
      this.add(this.startPoint)
      this.add(this.connectLine)
    } else if (this.startPoint && this.endPoint === null && this.connectLine != null) {
      this.connectLine.geometry.vertices[1].copy(point)
      this.connectLine.geometry.verticesNeedUpdate = true
      this.value = this.getLengthBetweenPoint(this.connectLine.geometry.vertices[0], this.connectLine.geometry.vertices[1])
      this.showtext.text = this.value + this.unitlabel
      this.showtext.position.copy(point)
    }
  }
}

export default MeasureDistance
