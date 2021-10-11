var menuData = [
  {
    title: '剖视图',
    name: 'viewClipping',
    items: [{
      name: 'X',
      title: 'X剖视图'
    },
    {
      name: 'Y',
      title: 'Y剖视图'
    },
    {
      name: 'Z',
      title: 'Z剖视图'
    }
    ]
  },
  {
    title: '视角',
    name: 'viewCube',
    items: [{
      name: 'FRONT',
      title: '前视角'
    },
    {
      name: 'BACK',
      title: '后视角'
    },
    {
      name: 'LEFT',
      title: '左视角'
    },
    {
      name: 'RIGHT',
      title: '右视角'
    },
    {
      name: 'TOP',
      title: '上视角'
    },
    {
      name: 'BOTTOM',
      title: '下视角'
    }
    ]
  },
  {
    title: '着色',
    name: 'shader',
    items: [{
      name: 'wireframe',
      title: '线框'
    },
    {
      name: 'source',
      title: '线框着色'
    }
    ]
  },
  {
    title: '测量',
    name: 'measure',
    items: [{
      name: 'distance',
      title: '两点距离'
    },
    {
      name: 'angle',
      title: '平面夹角'
    }
    ]
  }
]

var viewer3d
var currentClipping = 'NO'

window.onload = function () {
  renderMenu()
  initViewer()
}

function renderMenu () {
  let menuHtml = ''
  for (let i = 0; i < menuData.length; i++) {
    let menu = menuData[i]
    let menuItemHtml = `<li class="menu-content"><a href="javascript:void(0);">${menu.title}</a>
    <ul class="menu-item">`
    for (let j = 0; j < menu.items.length; j++) {
      menuItemHtml = menuItemHtml + `<li><a href="javascript:void(0);" onclick="onMenuClicked('${menu.name}','${menu.items[j].name}')">${menu.items[j].title}</a></li>`
    }
    if (menu.name === 'viewClipping') {
      menuItemHtml = menuItemHtml + `<li><input id="sliderClipping" type="range" min="0" max="100" step="2" value="0" onchange="clippingChange(this.value)"/></li>`
    }
    menuItemHtml = menuItemHtml + ` </ul></li>`
    menuHtml = menuHtml + menuItemHtml
  }

  let menuDom = document.getElementsByClassName('sub-menu')[0]
  menuDom.innerHTML = menuHtml
}

// eslint-disable-next-line no-unused-vars
function onMenuClicked (name, subName) {
  switch (name) {
    case 'shader':
      if (subName === 'wireframe') {
        viewer3d.wireframeMaterail(true)
      } else if (subName === 'source') {
        viewer3d.wireframeMaterail(false)
      }
      break
    case 'viewCube':
      viewer3d.viewCube(subName)
      break
    case 'viewClipping':
      let radius = viewer3d.getSphereRadius()
      viewer3d.clippingPlaneChange(subName, radius)
      document.getElementById('sliderClipping').value = 0
      currentClipping = subName
      break
    case 'measure':
      viewer3d.addMeasure(subName)
      break
  }
}

function initViewer () {
  let loadUrls = {
    resources: 'static/assets/data/demo.json'
  }
  Promise.all(
    _.values(loadUrls).map(
      url =>
        new Promise((resolve, reject) =>
          ajax.get(url, {}, function (remoteData) {
            let resourceObj = JSON.parse(remoteData)
            resolve(resourceObj)
          })
        )
    )
  )
    .then(data => {
      let keys = Object.keys(loadUrls)
      for (let i = 0; i < keys.length; i++) {
        let key = keys[i]
        window[key] = data[i]
      }
    })
    .then(() => {
      viewer3d = new app.Viewer(resources)
      let menuTitleDom = document.getElementsByClassName('menu-title')[0]
      menuTitleDom.innerText = resources.projectName
    })
}

// eslint-disable-next-line no-unused-vars
function clippingChange (val) {
  if (currentClipping !== 'NO') {
    let radius = viewer3d.getSphereRadius()
    let td = val / 100.0
    viewer3d.clippingPlaneChange(currentClipping, radius - radius * 2 * td)
  }
}
