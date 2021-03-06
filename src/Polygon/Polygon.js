import Cesium from 'cesium/Source/Cesium.js'
import Graph from '../Graph.js'
import * as mu from '../mapUtil.js'

export default class Polygon extends Graph {

  minPointNum = 2
  
  constructor (prop, viewer, layer) {
    super({
      type: '多边形',
      color: '#00FF00',
      alpha: 0.8,
      fill: true,
      outline: true,
      outlineColor: '#000',
      outlineWidth: 2,
      ...prop
    }, viewer, layer)
  }

  initProps (defs) {
    super.initProps([
      {name: 'color', title: '颜色', type: 'color'},
      {name: 'alpha', title: '透明度', type: 'number', step: 0.05, max: 1, min: 0},
      {name: 'fill', title: '填充', type: 'boolean'},
      {name: 'outline', title: '边框', type: 'boolean'},
      {name: 'outlineColor', title: '边框颜色', type: 'color'},
      {name: 'outlineWidth', title: '边框宽度', type: 'number', step: 1, min: 1, max: 100},
      ...defs
    ])
  }

  initShape() {
    this.ent = this.entities.add(new Cesium.Entity({polygon: {}}))
    this.fillShape(this.ent)
    Object.assign(this.ent.polygon, {
      fill: new Cesium.CallbackProperty((time, result) => this.ent.propx.fill.value, false),
      material: new Cesium.ColorMaterialProperty(
        new Cesium.CallbackProperty( () => {
          let c = Cesium.Color.fromCssColorString(this.ent.propx.color.value).withAlpha(this.ent.propx.alpha.value)
          return this.ent.highLighted ? c.brighten(0.6, new Cesium.Color()) : c
        }, false)),
      outline: new Cesium.CallbackProperty((time, result) => this.ent.propx.outline.value, false),
      outlineColor: new Cesium.CallbackProperty(() => {
        let c = Cesium.Color.fromCssColorString(this.ent.propx.outlineColor.value).withAlpha(this.ent.propx.alpha.value)
        return this.ent.highLighted ? c.brighten(0.6, new Cesium.Color()) : c
      }, false),
      height: 0,
      outlineWidth: new Cesium.CallbackProperty((time, result) => this.ent.propx.outlineWidth.value, true),
      hierarchy: new Cesium.CallbackProperty((time, result) => {
        return this.calcuteShape(this.graph.ctl._children.concat(window.cursor), time)
      }, false)
    })
  }

  calcuteShape (points, time) {
    if (points.length < this.minPointNum) {
      return []
    }
    return points.map(ent => ent.position.getValue(time))
  }

  toEdit () {
    super.toEdit()
    this.ent.polygon.hierarchy = new Cesium.CallbackProperty((time, result) => {
      return this.calcuteShape(this.graph.ctl._children, time)
    }, false)
  }

  finish () {
    if (this.ent) {
      super.finish()
      this.ent.polygon.hierarchy = this.calcuteShape(this.graph.ctl._children, mu.julianDate())
    }
  }
}
