// pages/map/map.js
// 引入SDK核心类
var QQMapWX = require('../../libs/qqmap-wx-jssdk.js');
var qqmapsdk;

Page({

  /**
   * 页面的初始数据
   */
  data: {
    mapKey: "MKWBZ-IH53W-NGSRB-OTOS7-2SW52-AHBOI",  //地图的key
    markers: [],  //地图参数
    circles: [],  //区域
    keysValue:"", //关键字
    latitude: "", //纬度 
    longitude: "",  //经度
    polyline: [],   //路线
    tolatitude: "", //目的地纬度
    tolongitude: "", //目的地经度
    trafficWay: "driving", //出行方式，用于接口切换 driving walking bicycling transit
    //交通方式
    goWayIndex: 0,
    goWayArr: [
      {
        id: 0,
        title: "驾车",
        name: "driving"
      },
      {
        id: 1,
        title: "步行",
        name: "walking"
      },
      {
        id: 2,
        title: "骑行",
        name: "bicycling"
      },
      {
        id: 3,
        title: "公交",
        name: "transit"
      }
    ], 

    addressArr: [], //地址列表

    addressTitle: '',//地址标题
    addressDes: '', //地址详细 
    distance: '',  //距离: 起点到终点的距离，单位：米，
    duration: '', //时间: 表示从起点到终点的结合路况的时间，秒为单位 注：步行方式不计算耗时，该值始终为0 

  },

  //获得地图
  getMyMapLocation(e) {
    let that = this;
    //自行查询经纬度 http://www.gpsspg.com/maps.htm
    wx.getLocation({
      type: 'gcj02',  //wgs84 返回 gps 坐标，gcj02 返回可用于 wx.openLocation 的坐标
      success(res) {
        // 当前自己的经纬度 res.latitude，res.longitude
        that.setData({
          latitude: res.latitude,
          longitude: res.longitude,
          originMarkers: [{
            id: "0",
            latitude: res.latitude,
            longitude: res.longitude,
            iconPath: "https://xcx.quan5fen.com/Public/xcx-hitui/image/imgs-jyh/map-ico.png",
            width: 40,
            height: 40,
            callout: {
              'display': 'ALWAYS', 'fontSize': '24rpx', 'content': '我的位置',
              'padding': '4rpx', 'boxShadow': '0 0 5rpx #333', 'borderRadius': '2rpx'
            }
          }],
          markers: [{
            id: "0",
            latitude: res.latitude,
            longitude: res.longitude,
            iconPath: "https://xcx.quan5fen.com/Public/xcx-hitui/image/imgs-jyh/map-ico.png",
            width: 40,
            height: 40,
            callout: {
              'display': 'ALWAYS', 'fontSize': '30rpx', 'content': '我的位置',
              'padding': '8rpx', 'boxShadow': '0 0 5rpx #333', 'borderRadius': '4rpx'
            }
          }],
          circles: [{
            latitude: res.latitude,
            longitude: res.longitude,
            fillColor: '#7cb5ec88',
            color: '#7cb5ec88',
            radius: 500,
            strokeWidth: 1
          }],
        })
      }
    })
  },


  //搜索周边
  searchNearby(e) {
    let that = this,
        keysValue = e.detail.value.keysValue;
    if (keysValue == undefined || keysValue==""){
      wx.showToast({
        title: '请输入搜索地点',
        icon:'none'
      })
      return
    }
    that.setData({
      keysValue: keysValue
    });
    // 调用接口
    qqmapsdk.search({
      keyword: keysValue,
      location: that.data.latitude + ',' + that.data.longitude, //以我的位置作为周边搜索中心点
      success(res) {
        // console.log(res);
        var mks = [], //存makers地标显示
            adr = [];  //存地址信息
        for (var i = 0; i < res.data.length; i++) {
          mks.push({ 
            id: res.data[i].id,
            title: res.data[i].title,
            latitude: res.data[i].location.lat,
            longitude: res.data[i].location.lng,
            iconPath: "https://xcx.quan5fen.com/Public/xcx-hitui/image/imgs-jyh/map-ico2.png", //图标路径
            width: 30,
            height: 30
          })
          adr.push({
            id: res.data[i].id,
            title: res.data[i].title,
            address: res.data[i].address,
            latitude: res.data[i].location.lat,
            longitude: res.data[i].location.lng,
            distance:"",
            duration:""
          })

        }
        //渲染markers
        that.setData({
          markers: that.data.originMarkers.concat(mks),
          polyline: [], //清空路线
          addressArr:adr
        })

      },
      fail(res) {
        console.log(res);
      },
      complete(res) {
        // console.log(res);
      }
    });

    that.getDistanceDuration22();//

  },


  //点击标记点时触发
  bindmarkertap(e) {
    var that = this,
      markerId = e.markerId,
      markersArr = [],
      markersArr = that.data.markers;
    markersArr.forEach(function (v, i, array) {
      let id = v.id
      if (id == markerId) {
        that.setData({
          tolatitude: v.latitude,
          tolongitude: v.longitude,
          polyline: []    //清空路线
        })
      }
    })

    that.getAddreeInfo(); //目的地地址信息
  },

  //点击地图poi点时触发 poi:位置标记 如：广州塔 
  bindpoitap(e) {
    var that = this,
      poiMks = [];
    poiMks = [{
      id: "11111",
      latitude: e.detail.latitude,
      longitude: e.detail.longitude,
      iconPath: "https://xcx.quan5fen.com/Public/xcx-hitui/image/imgs-jyh/map-ico3.png",
      width: 30,
      height: 30,
      callout: {
        'display': 'ALWAYS', 'fontSize': '20rpx', 'content': e.detail.name,
        'padding': '6rpx', 'boxShadow': '0 0 5rpx #333', 'borderRadius': '2rpx'
      }
    }],
      that.setData({
        tolatitude: e.detail.latitude,
        tolongitude: e.detail.longitude
      })

    //渲染markers
    that.setData({
      markers: that.data.originMarkers.concat(poiMks),
      polyline: []    //清空路线
    })


    that.getAddreeInfo(); //目的地地址信息

  },

  //目的地地址信息
  getAddreeInfo(e){
    var that = this;
    // 实例化API核心类
    var demo = new QQMapWX({
      key: that.data.mapKey // 必填
    });
    // 调用接口
    demo.reverseGeocoder({
      location: {
        latitude: that.data.tolatitude,
        longitude: that.data.tolongitude,
      },
      success(res) {
        //console.log(res);
        that.setData({
          addressTitle: res.result.address,
          addressDes: res.result.formatted_addresses.recommend
        })

      },
      fail(res) {
        //console.log(res);
      },
      complete(res) {
        //console.log(res);
      }
    });

    that.getDistanceDuration(); //两地距离，时间
  },

  //出行方式
  selGoWay(e) {
    var that = this,
      goWayArr = [],
      goWayArr = that.data.goWayArr;
    that.setData({
      goWayIndex: e.detail.value,
    })
    goWayArr.forEach(function (v, i, array) {
      let id = v.id
      if (id == that.data.goWayIndex) {
        that.setData({
          trafficWay: v.name
        })
      }
    })

    that.linePlanning();  //路线
  
  },

  //路线规划 
  linePlanning(e) {
    let that = this,
      mapKey = that.data.mapKey,
      trafficWay = that.data.trafficWay, //出行方式
      fromMap = that.data.latitude + ',' + that.data.longitude, //始点
      toMap = that.data.tolatitude + ',' + that.data.tolongitude; //终点

    // transit公车接口参数不一样
    var _url = "";
    if (trafficWay == "transit") {
      _url = "https://apis.map.qq.com/ws/direction/v1/transit/?&from=" + fromMap + "&to=" + toMap + "&policy=LEAST_TIME&output=jsonp&callback=callback_function&key=" + mapKey + "";
    } else {
      _url = "https://apis.map.qq.com/ws/direction/v1/"+trafficWay+"/?&from=" + fromMap + "&to=" + toMap + "&key=" + mapKey + "";
    }

    //网络请求设置
    var opt = {
      //WebService请求地址，from为起点坐标，to为终点坐标，开发key为必填
      url: _url,
      method: 'GET',
      dataType: 'json',
      //请求成功回调
      success(res) {
        console.log(res);
        var ret = res.data
        if (ret.status != 0) return; //服务异常处理

        var coors = ret.result.routes[0].polyline, pl = [];
        //坐标解压（返回的点串坐标，通过前向差分进行压缩）
        var kr = 1000000;
        for (var i = 2; i < coors.length; i++) {
          coors[i] = Number(coors[i - 2]) + Number(coors[i]) / kr;
        }
        //将解压后的坐标放入点串数组pl中
        for (var i = 0; i < coors.length; i += 2) {
          pl.push({ latitude: coors[i], longitude: coors[i + 1] })
        }

        //设置polyline属性，将路线显示出来
        that.setData({
          polyline: [{
            points: pl,
            color: '#FF0000DD',
            width: 2,
            arrowLine: true
          }]
        })
      }
    };
    wx.request(opt);

    // that.getDistanceDuration(); //两地距离，时间
  },

  //两地之间的距离,时间 poi
  getDistanceDuration(e) {
    let that = this,
      mapKey = that.data.mapKey,
      trafficWay = that.data.trafficWay, //出行方式
      fromMap = "", //始点
      toMap = ""; //终点
    wx.getLocation({
      type: 'gcj02',
      success(res) {
        that.setData({
          latitude: res.latitude,
          longitude: res.longitude,
        })
        fromMap = that.data.latitude + ',' + that.data.longitude, //始点
        toMap = that.data.tolatitude + ',' + that.data.tolongitude; //终点

        //console.log(toMap)
        let _url = "";
        //距离接口目前 mode仅支持 驾车和步行
        if (trafficWay == "bicycling" || trafficWay == "transit"){
            that.setData({
              duration:"未知时间",
              distance:"未知距离"
            })
            return
        }else{
          _url = "https://apis.map.qq.com/ws/distance/v1/?mode=" + trafficWay + "&from=" + fromMap + "&to=" + toMap + "&key=" + mapKey + "";
        }
        var opt2 = {
          url: _url,
          method: 'GET',
          dataType: 'json',
          success(res) {
            console.log(res);
            var distance, duration;
              distance = res.data.result.elements["0"].distance;  //距离
              duration = res.data.result.elements["0"].duration;  //时间
            that.transformUnit(duration, distance); //转换单位
          }
        };
        wx.request(opt2);
      }

    })
  },

  //两地之间的距离,时间22
  getDistanceDuration22(e) {
    let that = this,
      mapKey = that.data.mapKey,
      trafficWay = that.data.trafficWay, //出行方式
      fromMap = "", //始点
      toMap = ""; //终点
    wx.getLocation({
      type: 'gcj02',
      success(res) {
        that.setData({
          latitude: res.latitude,
          longitude: res.longitude,
        })
        fromMap = that.data.latitude + ',' + that.data.longitude, //始点
        toMap = that.data.tolatitude + ',' + that.data.tolongitude; //终点

        var toMap2 = "";
        toMap2 = "23.03044,113.1416;23.032623,113.140488;23.03292,113.15466"

        //console.log(toMap)
        let _url = "";
        //距离接口目前 mode仅支持 驾车driving和步行waliking
        if (trafficWay == "bicycling" || trafficWay == "transit") {
          console.log("该接口占不支持骑行bicycling与公交transit");
          return
        } else {
          _url = "https://apis.map.qq.com/ws/distance/v1/?mode=" + trafficWay + "&from=" + fromMap + "&to=" + toMap2 + "&key=" + mapKey + "";
        }
        var opt3 = {
          url: _url,
          method: 'GET',
          dataType: 'json',
          success(res) {
            var elements = [];
            elements = res.data.result.elements;
            elements.map(function (v, i, array) {
              //----单位换算------：
              // //时间格式
              var theTime = parseInt(v.duration),// 秒
                  middle = 0,
                  hour = 0;
              if (theTime > 60) {
                middle = parseInt(theTime / 60);
                theTime = parseInt(theTime % 60);
                if (middle > 60) {
                  hour = parseInt(middle / 60);
                  middle = parseInt(middle % 60);
                }
              }
              v.duration = "" + parseInt(theTime) + "秒";
              if (middle > 0) {
                v.duration = "" + parseInt(middle) + "分" + v.duration;
              }
              if (hour > 0) {
                v.duration = "" + parseInt(hour) + "小时" + v.duration;
              } 
              //距离格式
              if (v.distance < 1000) {
                v.distance = v.distance + "米"
              } else if (v.distance> 1000) {
                v.distance = (Math.round(v.distance / 100) / 10).toFixed(1) + "公里"
              }


              //匹配对应
              var addr = that.data.addressArr;
              addr[i].duration = v.duration;
              addr[i].distance = v.distance;

              //设置地址列表
              that.setData({
                addressArr:addr
              })
            });
          }
        };
        wx.request(opt3);
      }
    })
  },


  //转换单位：距离,时间
  transformUnit(t, d) {
    var that = this,
      theTime = parseInt(t),// 秒
      middle = 0,// 分
      hour = 0,// 小时
      duration = "",
      distance = "";

    //时间格式
    if (theTime > 60) {
      middle = parseInt(theTime / 60);
      theTime = parseInt(theTime % 60);
      if (middle > 60) {
        hour = parseInt(middle / 60);
        middle = parseInt(middle % 60);
      }
    }
    var duration = "" + parseInt(theTime) + "秒";
    if (middle > 0) {
      duration = "" + parseInt(middle) + "分" + duration;
    }
    if (hour > 0) {
      duration = "" + parseInt(hour) + "小时" + duration;
    }

    //距离格式
    if (d < 1000) {
      distance = d + "米"
    } else if (d > 1000) {
      distance = (Math.round(d / 100) / 10).toFixed(1) + "公里"
    }

    that.setData({
      duration: duration,
      distance: distance
    })

    return duration, distance;
  },


  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let that = this;
    that.getMyMapLocation();  //地图

    // 实例化API核心类
    qqmapsdk = new QQMapWX({
      key: that.data.mapKey
    });
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

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