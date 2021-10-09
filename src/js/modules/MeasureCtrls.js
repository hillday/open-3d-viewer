/* eslint-disable space-before-function-paren */
import * as THREE from 'three'

export class MeasureCtrls {
  constructor (options) {
    if (!options.camera) {
      throw new Error('[camera] is must need!!')
    }
    options.camera = options.camera
    options.domElement = options.domElement || document
    options.targets = options.targets || []

    this.camera = options.camera
    this.domElement = options.domElement

    this.mouse = new THREE.Vector2()
    this.raycaster = new THREE.Raycaster()
    this.isActive = false
    this.targetObjects =  options.targets
    this.measureInstances = new THREE.Group()
    this.currentMeasure = null

    this.domElement.addEventListener('mousedown', this.onDocumentDown.bind(this), false)
    this.domElement.addEventListener('mousemove', this.onDocumentMove.bind(this), false)
    this.domElement.addEventListener('mouseup', this.onDocumentUp.bind(this), false)
    this.domElement.addEventListener('touchstart', this.onDocumentDown.bind(this), false)
    this.domElement.addEventListener('touchmove', this.onDocumentMove.bind(this), false)
    this.domElement.addEventListener('touchend', this.onDocumentUp.bind(this), false)
  }

  getMeasures () {
    return this.measureInstances
  }

  createMeasure (name) {
    
  }

  isActivity() {
    return this.isActive
  }

  updateMeasureIcon() {
    if (this.isActive) {
      this.domElement.style.cursor = 'crosshair'
    } else {
      this.domElement.style.cursor = 'default'
    }
  }

  toggleMeasure() {
    this.isActive = !this.isActive
    this.updateMeasureIcon()
  }

  disableMeasure() {
    if (this.isActive) {
      this.toggleMeasure()
    }
  }

  getClientX(e) {
    return typeof e.clientX === 'undefined' ? e.touches[0].clientX : e.clientX
  }

  getClientY(e) {
    return typeof e.clientY === 'undefined' ? e.touches[0].clientY : e.clientY
  }
  getMousePos(event) {
    this.mouse.x = (this.getClientX(event) / this.domElement.clientWidth) * 2 - 1
    this.mouse.y = -(this.getClientY(event) / this.domElement.clientHeight) * 2 + 1
  }

  hide() {

  }

  show() {
 
  }

  onDocumentDown(event) {
    let btnNum = event.button
    if (btnNum === 2) return false
    event.preventDefault()
    if (!this.isActive) {
      this.toggleMeasure()
      this.getMousePos(event)
    }
  }

  onDocumentMove(event) {
    let btnNum = event.button
    if (btnNum === 2) return false
    event.preventDefault()
    if (this.isActive) {
      this.getMousePos(event)
    }
  }

  onDocumentUp(event) {
    let btnNum = event.button
    if (btnNum === 2) return false
    event.preventDefault()
    if (this.isActive) {
      this.toggleMeasure()
      this.getMousePos(event)
    }
  }

  processIntersections() {
    if (this.isActive) {
      this.raycaster.setFromCamera(this.mouse, this.camera)
      this.intersects = this.raycaster.intersectObjects(this.targetObjects)
      if (this.intersects.length > 0) {
        
      }
    }
  }
}
export default MeasureCtrls
