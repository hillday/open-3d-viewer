import _ from 'lodash'
import Events from './utils/Events'
import { ObjLoader } from './loaders/ObjLoader'
import 'three/examples/js/controls/OrbitControls'
import TWEEN from 'tween'
import { MeasurementControls } from './modules/MeasurementControls'
import { Measure } from './modules/Measure'
import { MeasureDistance } from './modules/MeasureDistance'

/**
 * options is view configure, look like
 * {
 *    "model": {
 *      "path": "",
 *      "resourcePath": "",
 *      "name": "",
 *      "type": "obj|stl",
 *      "mtlName": "",
 *      "maps": {
 *        "diffuse": "",
 *        "light": "",
 *        "normal": ""
 *      },
 *      "object": {
 *        "translation": [0,0,0],
 *        "scale": [1,1,1],
 *        "rotation": [0,0,0]
 *      }
 *    }
 * }
 */
export class Viewer {
  constructor (options) {
    this._options = options || null
    this._container = document.getElementById('3d-container')
    if (!this._container) {
      this._container = document.body
    }
    this._container._width = this._container.clientWidth
    this._container._height = this._container.clientHeight

    this._clock = new THREE.Clock()
    this._scaleRadio = 5
    this._currentViewCubeFace = 'FRONT'
    this._sourceMatertail = null
    this._initWebGL()
    this._initEvent()

    this._loadScene()
    this._animate()
  }

  _initWebGL () {
    this._camera = new THREE.PerspectiveCamera(60, this._container.clientWidth / this._container.clientHeight, 0.1, 1000)
    this._camera.position.z = 50

    this._scene = new THREE.Scene()
    this._renderer = new THREE.WebGLRenderer({
      antialias: true,
      preserveDrawingBuffer: false
    })

    this._renderer.setClearColor(0x444444)
    this._renderer.sortObjects = false
    this._renderer.autoClear = true
    this._renderer.toneMapping = THREE.LinearToneMapping
    this._renderer.toneMappingExposure = 1.2
    // this._renderer.gammaOutput = true
    // this._renderer.gammaFactor = 1.6
    this._renderer.setSize(this._container.clientWidth, this._container.clientHeight)

    this._element = this._renderer.domElement
    this._container.appendChild(this._element)

    this._controls = new THREE.OrbitControls(this._camera, this._element)
    this._controls.enableZoom = true
    this._controls.enablePan = true
    this._controls.enableDamping = true
    this._controls.dampingFactor = 0.25
    this._controls.rotateSpeed = -0.05
    let scope = this
    this._controls.addEventListener('change', function () {
      scope.measurementControls.update()
    })

    let hemiLight = new THREE.HemisphereLight(0xffffff, 0x000000, 0.8)

    hemiLight.position.set(0, 50, 0)
    let ambLight = new THREE.AmbientLight(0xffffff)
    this._scene.add(ambLight)
    this._scene.add(hemiLight)
    this._scene.add(this._camera)

    this.measurementControls = new MeasurementControls({ targets: this._scene.children, camera: this._camera, domElement: this._container })
    this.measurementControls.enabled = false

    this._scene.add(this.measurementControls)
  }

  addMeasurement (measurement) {
    this.measurementControls.add(measurement)
    this.measurementControls.enabled = true
  }

  removeMeasurement (measurement) {
    this.measurementControls.remove(measurement)
    if (measurement.parent) { measurement.parent.remove(measurement) }
  }

  clearMeasurements () {
    let measurements = []
    for (let key in this._scene.children) {
      this._scene.children[key].traverse(function (child) {
        if (child instanceof Measure) { measurements.push(child) }
      })
    }

    for (let key in measurements) {
      this.removeMeasurement(measurements[key])
    }
  }

  addMeasure (type) {
    switch (type) {
      case 'distance':
        this.addMeasurement(new MeasureDistance())
        break
    }
  }

  _initEvent () {
    window.addEventListener('resize', this._resize.bind(this), false)
    let self = this
    Events.addEventListener('loaded-model', function (data) {
      if (data.message === 'success') {
        let mesh = data.data.loadedObj
        let geometry = mesh.geometry
        geometry.computeBoundingSphere()
        let boundingSphere = geometry.boundingSphere.clone()
        mesh.updateMatrixWorld()

        mesh.translateX(-1 * boundingSphere.center.x)
        mesh.translateY(-1 * boundingSphere.center.y)
        mesh.translateZ(-1 * boundingSphere.center.z)
        geometry.computeBoundingSphere()
        boundingSphere = geometry.boundingSphere.clone()
        mesh.updateMatrixWorld()

        let center = mesh.localToWorld(boundingSphere.center)
        self._center = center
        self._boundingSphereRadius = boundingSphere.radius
        self._controls.target.copy(center)
        self._controls.minDistance = boundingSphere.radius * 0.5
        self._controls.maxDistance = boundingSphere.radius * 3

        self._camera.position.set(0, 0, boundingSphere.radius * self._scaleRadio).add(center)
        self._camera.lookAt(center)

        self._scene.add(mesh)
        self._controls.saveState()
        self._sourceMatertail = mesh.material
      }
    })
  }

  _resize () {
    let w = this._container.clientWidth
    let h = this._container.clientHeight
    this._camera.aspect = w / h
    this._camera.updateProjectionMatrix()
    this._renderer.setSize(w, h)
    this._element.removeEventListener('resize', this._resize.bind(this), true)
    clearTimeout(this._tmr)
    let self = this
    this._tmr = setTimeout(function () {
      self._element.addEventListener('resize', self._resize.bind(self), false)
    }, 1000)
  }

  _loadScene () {
    switch (this._options.model.type) {
      case 'obj':
        // eslint-disable-next-line no-new
        new ObjLoader(this._options.model)
        break
    }
  }

  _animate (t) {
    requestAnimationFrame(this._animate.bind(this))

    this._update(this._clock.getDelta())
    this._render(this._clock.getDelta())
  }

  _render (dt) {
    this._renderer.render(this._scene, this._camera)
    // this._composer.render()
  }

  _update (dt) {
    this._camera.updateProjectionMatrix()
    TWEEN.update()
    this._controls.update(dt)
  }

  wireframeMaterail (val) {
    let self = this
    let tmat = null
    if (val) {
      tmat = new THREE.MeshBasicMaterial({
        color: 0x2194ce,
        wireframe: true,
        wireframeLinewidth: 1
      })
    } else {
      tmat = self._sourceMatertail
    }

    _.forEach(self._scene.children, function (obj) {
      if (obj instanceof THREE.Mesh) {
        obj.material = tmat
      }
    })
  }

  _getOrientation (face) {
    let orientation = null
    let self = this
    switch (face) {
      case 'TOP':
        orientation = new THREE.Vector3().set(0, self._boundingSphereRadius * self._scaleRadio, 0)
        break
      case 'BOTTOM':
        orientation = new THREE.Vector3().set(0, -1 * self._boundingSphereRadius * self._scaleRadio, 0)
        break
      case 'FRONT':
        orientation = new THREE.Vector3().set(0, 0, self._boundingSphereRadius * self._scaleRadio)
        break
      case 'BACK':
        orientation = new THREE.Vector3().set(0, 0, -1 * self._boundingSphereRadius * self._scaleRadio)
        break
      case 'LEFT':
        orientation = new THREE.Vector3().set(self._boundingSphereRadius * self._scaleRadio, 0, 0)
        break
      case 'RIGHT':
        orientation = new THREE.Vector3().set(-1 * self._boundingSphereRadius * self._scaleRadio, 0, 0)
        break
    }
    return orientation
  }

  viewCube (face) {
    if (face === this._currentViewCubeFace) { return false }
    this._currentViewCubeFace = face
    let orientation = this._getOrientation(face)
    if (orientation && this._camera) {
      let self = this
      this._controls.reset()
      const finishPosition = orientation.add(this._center)
      let option = {
        py: this._camera.position.y,
        pz: this._camera.position.z,
        px: this._camera.position.x
      }
      // self._camera.position.copy(finishPosition)
      let dtsOptions = {
        px: finishPosition.x,
        py: finishPosition.y,
        pz: finishPosition.z
      }
      if (face === 'BACK') {
        let orientationL = this._getOrientation('LEFT')
        let leftPosition = orientationL.add(this._center)
        dtsOptions = {
          px: [leftPosition.x, finishPosition.x],
          py: [leftPosition.y, finishPosition.y],
          pz: [leftPosition.z, finishPosition.z]
        }
      }
      // eslint-disable-next-line no-unused-vars
      const positionTween = new TWEEN.Tween(option)
        .to(dtsOptions, 300)
        .easing(TWEEN.Easing.Linear.None)
        .onUpdate(function () {
          let vector = new THREE.Vector3()
          vector.set(this.px, this.py, this.pz)
          self._camera.position.copy(vector)
          self._camera.updateProjectionMatrix()
        })
        .onComplete(function () {

        })
        .start()
    }
  }
  _addPlaneHelper (orientation, distance) {
    let self = this
    let geometry = new THREE.PlaneGeometry(self._boundingSphereRadius * 1.8, self._boundingSphereRadius * 1.8)
    let material = new THREE.MeshBasicMaterial({ color: 0x0c4c8e,
      opacity: 0.2,
      transparent: true,
      depthWrite: false,
      side: THREE.DoubleSide })
    let helper = new THREE.Mesh(geometry, material)
    switch (orientation) {
      case 'X' :
        helper.rotateY(-280 * Math.PI / 180)
        helper.translateZ(distance)
        break
      case 'Y' :
        helper.rotateX(95 * Math.PI / 180)
        helper.translateZ(-1 * distance)
        break
      case 'Z' :
        helper.translateZ(distance * 0.9)
        break
    }
    helper.name = 'clippingHelper'
    this._scene.add(helper)
  }
  getSphereRadius () {
    return this._boundingSphereRadius
  }
  clippingPlaneChange (orientation, distance) {
    let planeArr = []
    let self = this
    switch (orientation) {
      case 'X' :
        planeArr.push(new THREE.Plane(new THREE.Vector3(-1, 0, 0), distance))
        break
      case 'Y' :
        planeArr.push(new THREE.Plane(new THREE.Vector3(0, -1, 0), distance))
        break
      case 'Z' :
        planeArr.push(new THREE.Plane(new THREE.Vector3(0, 0, -1), distance))
        break
    }

    self._renderer.clippingPlanes = planeArr
    self._renderer.localClippingEnabled = true

    _.forEach(self._scene.children, function (obj) {
      if (obj instanceof THREE.Mesh && obj.name === 'clippingHelper') {
        self._scene.remove(obj)
      }
    })

    self._addPlaneHelper(orientation, distance)
  }
}
export default Viewer
