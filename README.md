# ocean-weather

> A Vue.js project

## Build Setup

``` bash
# install dependencies
npm install

# serve with hot reload at localhost:8080
npm run dev

# build for production with minification
npm run build

# build for production and view the bundle analyzer report
npm run build --report
```

For detailed explanation on how things work, checkout the [guide](http://vuejs-templates.github.io/webpack/) and [docs for vue-loader](http://vuejs.github.io/vue-loader).


## Example

在线访问地址：https://linghuam.github.io/ocean-weather/dist/

leaflet-velocity demo：https://danwild.github.io/leaflet-velocity/


## 理论依据

* [数据来源](http://nomads.ncep.noaa.gov/)

* [grib数据格式](http://www.cpc.ncep.noaa.gov/products/wesley/reading_grib.html)

* [数据转换](https://github.com/cambecc/grib2json)

* [双线性插值算法](https://github.com/cambecc/earth)

* [热力图](https://www.patrick-wied.at/static/heatmapjs/)

* [在leaflet上绘制canvas图](https://github.com/Sumbera/gLayers.Leaflet)

* [leaflet-velocity](https://github.com/danwild/leaflet-velocity)


## 问题

* 全球跨180度展示

  worldCopyJump:true

  https://github.com/Leaflet/Leaflet/pull/1293

  https://github.com/Leaflet/Leaflet/pull/1293/commits/66b5054b21646fa835b99d47c94bfbb0e8b42062

* 线光滑

  http://turfjs.org/docs/#bezier

* 海陆裁剪

  canvas剪辑区域


## 其它

https://www.windy.com

https://github.com/windyty/API

https://github.com/Leaflet/Leaflet.heat

https://github.com/ursudio/leaflet-webgl-heatmap

http://gallery.echartsjs.com/editor.html?c=xHJD3BZY5-

https://www.patrick-wied.at/static/heatmapjs/?utm_source=npm_leaflet&utm_medium=webpack

风力等级划分表：http://www.cma.gov.cn/2011xzt/20120816/2012081601/201208160101/201407/t20140717_252607.html

**单位转化：**

1海里(nmi)=1852米(m)

1kt = 0.5144444m/s

mb=mbar 毫巴(=百帕)

1Bar=0.1MPa=1000mba=1000hpa=100*7.5mmhg=75mmhg=1个大气压

地球周长： 40042.739962655505 （公里）
