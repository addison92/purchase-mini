var util = require('../../utils/util.js');
var api = require('../../config/api.js');
var user = require('../../services/user.js');

//index.js
//获取应用实例
const app = getApp()

Page({
  data: {
    icoColor: '#AFAFAF',
    indicatorDots: true,
    autoplay: true,
    interval: 5000,
    duration: 1000,
    typeList: [],
    slideshow: [
      "../../static/images/1.jpg",
      "../../static/images/2.jpg",
      "../../static/images/3.jpg",
      "../../static/images/4.jpg"
    ],
    list: [{
      id: 1,
      url: '../../static/images/item.jpg',
      name: 'APPLE/苹果 iPhone XS MAX',
      price: '9800',
      visitors: '1350',
      seconds: 120
    }, {
      id: 2,
      url: '../../static/images/item.jpg',
      name: 'APPLE/苹果 iPhone XS',
      price: '7800',
      visitors: '5350',
      seconds: 100
    }, {
      id: 3,
      url: '../../static/images/item.jpg',
      name: 'VIVO NEX 前后双屏',
      price: '4900',
      visitors: '8350',
      seconds: 220
    }, {
      id: 4,
      url: '../../static/images/item.jpg',
      name: 'HUAWEI MATE 20 PRO',
      price: '5500',
      visitors: '9340',
      seconds: 120
    }, {
      id: 5,
      url: '../../static/images/item.jpg',
      name: 'OPPO FIND X',
      price: '4500',
      visitors: '1350',
      seconds: 20
    }, {
      id: 6,
      url: '../../static/images/item.jpg',
      name: '荣耀 MAGIC 2',
      price: '3500',
      visitors: '3350',
      seconds: 420
    }],
    currentSelected:""
  },
  onShow() {
    this.refreshList();
  },

  onExtraClick(e){
    let id = e.currentTarget.dataset.id;
    this.setData({
      currentSelected: id
    });
  },

  refreshList() {
    if (this.data.list.length > 0) {
      let that = this;
      let new_list = Object.assign([], that.data.list);
      new_list.map(function (e) {
        if (e.seconds > 0) {
          e.seconds = e.seconds - 1;
        }
        return e
      });
      that.setData({
        list: new_list
      });
    }
    setTimeout(this.refreshList, 1000);
  },

  getCourseTypesForList() {
    let that = this
    return util.request(api.GetCourseTypesForList, {}, "POST", true).then(res => {
      that.setData({
        typeList: res.data
      });
    })
  },

  getCourseCarousels() {
    let that = this
    return util.request(api.GetCourseCarousels, {}, "GET", true).then(res => {
      that.setData({
        slideshow: res.data
      });
    })
  },

  getCourseCoversForPage(path = {}, isFirst = false) {
    let that = this
    let condition = this.data.keyword;
    let courseType = this.data.currentType;

    //有查询条件时重置为第一页
    if (courseType || condition) {
      this.setData({
        page: 1
      });
    }

    return util.request(api.GetCourseCoversForPage, {
      condition: condition,
      courseType: courseType
    }, "POST", true, path).then(res => {
      that.setData({
        courseList: res.data.rows
      });
      if (isFirst) {
        that.getCourseTypesForList();
        that.getCourseCarousels();
        that.getWxuserById();
      }
    })
  },

  onCourseClick(event) {
    var id = event.currentTarget.id;
    wx.navigateTo({
      url: '../course/detail/index?id=' + id
    })
  },

  onTypeChange(event) {
    var id = event.currentTarget.id;
    this.setData({
      currentType: id
    });
    this.getCourseCoversForPage();
  },

  bindKeyInput(e) {
    this.setData({
      keyword: e.detail.value
    });
  },

  doSearch() {
    this.getCourseCoversForPage();
  },

  onZanClick(event) {
    //UpdateWxCourseFollow
    var typeId = event.currentTarget.id;
    let that = this
    return util.request(api.UpdateWxCourseFollow, {
      typeId: typeId,
      type: "1"
    }, "POST", true).then(res => {
      that.getCourseCoversForPage();
    })
  },

  getWxuserById() {
    let that = this;
    return util.request(api.GetWxuserById, {}, "GET", true).then(res => {
      that.setData({
        userInfo: res.data
      });
    })
  },

  onShareAppMessage(res) {
    let data = res.target.dataset
    if (res.from === 'button') {
      // 来自页面内转发按钮
      let sharednumber = "";
      if (this.data.userInfo.shareNumber) {
        sharednumber = "&sharednumber=" + this.data.userInfo.shareNumber
      }
      console.log("sharednumber:", sharednumber);
      return {
        title: data.title,
        path: '/pages/course/detail/index?id=' + data.id + sharednumber,
        imageUrl: data.img
      }
    }
  },

  onReachBottom: function () {
    if (this.data.isRefreshing || this.data.isLoadingMoreData || !this.data.hasMoreData) {
      return
    }

    this.setData({
      isLoadingMoreData: true
    })
    this.requestMoreData() //数据请求
  },

  requestMoreData() {
    let that = this
    let condition = this.data.keyword;
    let courseType = this.data.currentType;

    //计算页码
    let page = this.data.page + 1;
    this.setData({
      page: page
    });

    return util.request(api.GetCourseCoversForPage, {
      condition: condition,
      courseType: courseType,
      page: page,
      pageSize: this.data.pageSize
    }, "POST", true).then(res => {
      if (res.data.rows.length > 0) {
        let list = res.data.rows;
        let origin_list = Object.assign([], that.data.courseList);
        list.forEach(function (item) {
          origin_list.push(item)
        });
        that.setData({
          courseList: origin_list
        });
      } else {
        wx.showToast({
          title: '暂无更多数据',
          icon: 'none'
        })
      }

      that.setData({
        isLoadingMoreData: false
      })
    })
  }
})