// pages/map/map.js
// 引入SDK核心类
var QQMapWX = require('../../libs/qqmap-wx-jssdk.js');
var qqmapsdk;
var utils = require("../../utils/util.js")
var domain = "https://mini.rcer666.cn/api"
// var domain = "http://192.168.199.144:8000/api"

Page({
  data: {
    mapKey: "HW6BZ-BCUWF-IRXJS-NHYVF-JDX3J-NGF2F",
    scale: 10,
    markers: [],  //标记点集合
    circles: [],  //区域
    latitude: "", //纬度 
    longitude: "", //经度
    maxAnchorX: 100000, //anchorX最大值
    calloutDisplay: false //callout显示状态，默认不显示
  },

  //点击标记点时触发
  //点击改变callout显示/隐藏
  markertap(e) {
    console.log('@@@ markertap', e)
    let that = this, index = -1
    that.data.markers.forEach(function(obj, idx) {
      if (obj.id == e.detail.markerId) {
        index = idx
        return
      }
    })
    let key = 'markers[' + index + '].customCallout.anchorX'
    if (that.data.markers[index].customCallout.anchorX == 0) {
      that.setData({[key]: that.data.maxAnchorX})
    } else {
      that.setData({[key]: 0})
    }
  },

  // 点击callout触发
  callouttap(e) {
    console.log('@@@ callouttap', e)
    let that = this
    let marker = that.data.markers.find(function(obj) {
      return obj.id == e.detail.markerId
    })
    wx.openLocation({
      name: marker.name,
      latitude: marker.latitude,
      longitude: marker.longitude,
      address: "距离您约" + marker.distance,
      scale: that.data.scale,
    })
  },

  //初始化所有markers
  initMarkers() {
    console.log("initMarkers start")
    let that = this
    return new Promise(function(resolve, reject) {
      wx.request({
        url: domain + '/markers',
        header: { Authorization: wx.getStorageSync('token') },
        success (res) {
          console.log("请求markers接口成功:", res)
          if(res.statusCode != 200) {
            resolve(res)
          }
          let markers = res.data.data.map(function(obj) {
            return {
              id: obj.id,
              name: obj.name,
              longitude: parseFloat(obj.longitude),
              latitude: parseFloat(obj.latitude),
              iconPath: "../images/marker.png",
              width: 40,
              height: 40,
              customCallout: {
                anchorY: 0,
                anchorX: that.data.maxAnchorX,
                // display: 'BYCLICK',
                display: 'ALWAYS',
              },
            }
          })
          that.setMarkersWithDistance(markers)
          resolve(res)
        },
        fail(error) {
          console.log("请求markers接口失败:", error)
          reject(error)
        }
      })
    })
  },

  //获得地图
  initMap() {
    let that = this
    //自行查询经纬度 http://www.gpsspg.com/maps.htm
    wx.getLocation({
      type: 'gcj02',  //wgs84 返回 gps 坐标，gcj02 返回可用于 wx.openLocation 的坐标
      success(res) {
        that.setData({
          latitude: res.latitude,
          longitude: res.longitude,
          circles: [{
            latitude: res.latitude,
            longitude: res.longitude,
            fillColor: '#7cb5ec88',
            color: 'transparent',
            radius: 0,
            strokeWidth: 1
          }],
        })
      }
    })
  },

  //wx.login封装
  wxLogin() {
    return new Promise(function(resolve, reject) {
      wx.login({
        success (res) {
          console.log("wx.login success:", res.code)
          resolve(res.code)
        },
        fail (error) {
          console.log("wx.login failed:", error)
          reject(error)
        }
      })
    })
  },

  //获取后端token并保存storage
  fetchToken(code) {
    return new Promise(function(resolve, reject) {
      wx.request({
        url: domain + '/login',
        data: { code: code },
        success(res) {
          console.log("fetchToken success", res)
          wx.setStorageSync('token', res.data.data.token)
          resolve(res)
        },
        fail(error) {
          console.log("fetchToken failed:", error)
          reject(error)
        }
      })
    })
  },

  //同时markers和距离
  setMarkersWithDistance(markers) {
    let that = this
    markers.forEach(function(obj) {
      obj.distance = utils.getDistance(that.data.latitude, that.data.longitude, obj.latitude, obj.longitude)
    })
    that.setData({markers: markers})
  },

  //
  // setCalloutDisplay() {
  //   let that = this
  //   let isHideCallout = wx.getStorageSync('isHideCallout')
  // },

  //显示/隐藏callout
  toggleCallout() {
    console.log('@@@ toggleCallout()')
    let that = this
    let markers = that.data.markers
    if(that.data.calloutDisplay) {
      markers.forEach(function(obj) {
        obj.customCallout.anchorX = that.data.maxAnchorX
      })
    } else {
      markers.forEach(function(obj) {
        obj.customCallout.anchorX = 0
      })
    }
    that.setData({markers: markers, calloutDisplay: !that.data.calloutDisplay})
  },

  labeltap(e) {
    console.log('@@@ labeltap', e)
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function () {
    console.log("onLoad()")
    let that = this;

    // 实例化API核心类
    qqmapsdk = new QQMapWX({
      key: that.data.mapKey
    });
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    console.log("onReady()")
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: async function () {
    console.log("onShow()")

    let that = this;
    that.initMap()

    let token = wx.getStorageSync('token'), code = ""
    if (!token) {
      code = await that.wxLogin()
      await that.fetchToken(code)
    }
    that.initMarkers()
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    console.log("onPullDownRefresh()")
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})