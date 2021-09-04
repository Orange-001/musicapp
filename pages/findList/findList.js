var util = require("../../utils/util")
Page({

  /**
   * 页面的初始数据
   */
  data: {
    pirUrl:"",
    title:"",
    playCount:"",
    dirction:"",
    listCount:"",
    //歌曲的id
    privileges:"",
    //歌曲详情
    playList:[]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

  },

  // 搜索框输入内容时
  search_input(e){
    let songkey = e.detail.value
    let that = this
    wx.showLoading({
      title: '加载中',
    })
    wx.request({
      url:'https://autumnfish.cn/search?keywords='+songkey,
      success(data){
        // console.log(data.data.result.songs)
        that.setData({
          playList:data.data.result.songs
        },function(){
          wx.hideLoading({
            success: (res) => {},
          })
        })


      }  
    })
  },
  toPlay(e){
    let id = e.currentTarget.dataset.id
    wx.navigateTo({
      url: '../play/play?id='+id,
    })
    console.log(id)
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