const formatTime = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()

  return [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}

const formatNumber = n => {
  n = n.toString()
  return n[1] ? n : '0' + n
}

//转换单位：时间
const convertDuration = (dura) => {
  let seconds = parseInt(dura),// 秒
      minutes = 0,// 分
      hours = 0,// 小时
      duration = ""
  if (seconds == 0) {
    duration = 0
  }
  //时间格式
  if (seconds > 60) {
    minutes = parseInt(seconds / 60)
    seconds = parseInt(seconds % 60)
    if (minutes > 60) {
      hours = parseInt(minutes / 60)
      minutes = parseInt(minutes % 60)
    }
  }
  duration = "" + parseInt(seconds) + "秒"
  if (minutes > 0) {
    duration = "" + parseInt(minutes) + "分" + duration
  }
  if (hours > 0) {
    duration = "" + parseInt(hours) + "小时" + duration
  }
  return duration
}

// 计算距离函数
const Rad = (d) => {
  return d * Math.PI / 180.0;
}

/**
 * 经纬度计算两点的距离
 * @param {当前纬度} lat1 
 * @param {当前经度} lng1 
 * @param {商家纬度} lat2 
 * @param {商家经度} lng2 
 */
const getDistance = (lat1, lng1, lat2, lng2) => {
  // console.log(lat1, lng1, lat2, lng2)
  var radLat1 = Rad(lat1);
  var radLat2 = Rad(lat2);
  var a = radLat1 - radLat2;
  var b = Rad(lng1) - Rad(lng2);
  var s = 2 * Math.asin(Math.sqrt(Math.pow(Math.sin(a / 2), 2) + Math.cos(radLat1) * Math.cos(radLat2) * Math.pow(Math.sin(b / 2), 2)));
  s = s * 6378.137;
  s = Math.round(s * 10000) / 10000;
  if (s < 1) {
    // console.log('经纬度计算的距离:' + s)
    s = s.toFixed(3) * 1000 + 'm' //保留小数
    return s
  } else {
    // console.log('经纬度计算的距离:' + s)
    s = s.toFixed(1) + 'km' //保留小数
    return s
  }
}

module.exports = {
  formatTime: formatTime,
  convertDuration: convertDuration,
  getDistance: getDistance
}
