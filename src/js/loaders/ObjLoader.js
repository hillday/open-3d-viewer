import * as THREE from 'three'
import 'three/examples/js/loaders/MTLLoader'
import 'three/examples/js/loaders/OBJLoader'
import Events from '../utils/Events'

export class ObjLoader {
  constructor (options) {
    this._options = options || null

    if (this._options) {
      let mtlLoader = new THREE.MTLLoader()
      mtlLoader.setResourcePath(this._options.resourcePath)
      mtlLoader.setPath(this._options.path)
      let self = this
      mtlLoader.load(this._options.mtlName, function (materials) {
        materials.preload()
        let objLoader = new THREE.OBJLoader()
        objLoader.setMaterials(materials)
        objLoader.setPath(self._options.path)
        objLoader.load(self._options.name, function (object) {
          object.position.x = self._options.object.translation[0]
          object.position.y = self._options.object.translation[1]
          object.position.z = self._options.object.translation[2]
          object.scale.x = self._options.object.scale[0]
          object.scale.y = self._options.object.scale[1]
          object.scale.z = self._options.object.scale[2]
          object.rotation.set(Math.PI / 180 * self._options.object.rotation[0],
            Math.PI / 180 * self._options.object.rotation[1],
            Math.PI / 180 * self._options.object.rotation[2])
          object.visible = true
          Events.dispatchEvent({ type: 'loaded-model', message: 'success', data: { loadedObj: object.children[0] } })
        }, self.onProgress.bind(self), self.onError.bind(self))
      })
    } else {
      console.error('param is null')
      Events.dispatchEvent({ type: 'loaded-model', message: 'error', data: {} })
    }
  }

  onProgress () {

  }

  onError () {

  }
}

export default ObjLoader
