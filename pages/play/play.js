var util = require("../../utils/util")
Page({

  /**
   * 页面的初始数据
   */
  data: {
    songName:"",
    imgUrl:"",
    lyric:[],
    id:"",
    musicUrl:"",
    isPlay:true,
    current_item: 0, //当前播放项
    lrc_index:0,   //歌词数组下标
    scroll_top:0,  //滚动条位置
    listId:"",
    index:0,
    pirUrl:"",
    title:"",
    playCount:"",
    dirction:"",
    listCount:"",
    //歌曲的id
    privileges:"",
    //歌曲详情
    playList:[],
    //评论
    contents:[],
    clength:""
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let idd = options.id
    let ids = []
    var that = this
    this.data.listId = options.listId;
    wx.showLoading({
      title: '加载中',
    })
    wx.request({
      url: 'https://autumnfish.cn/playlist/detail?id='+that.data.listId,
      success(data){
        // console.log(data.data.privileges)
        //变量里面的id利用,连接
        data.data.privileges.map((item)=>{
          ids.push(item.id)
        })
        //获取对应的数据进行赋值
        that.setData({
          pirUrl:data.data.playlist.coverImgUrl,
          title:data.data.playlist.name,
          playCount:util.formatCount(data.data.playlist.playCount),
          dirction:data.data.playlist.description,
          listCount:data.data.privileges.length,
          privileges:ids.join(",")
        })
        //歌曲详情的请求
        //https://autumnfish.cn/song/detail?ids=1869728598
        wx.request({
          url: 'https://autumnfish.cn/song/detail?ids='+ids.join(','),
          success(data){
            // console.log(data)
            that.setData({
              playList:data.data.songs
            },function(){
              wx.hideLoading({
                success: (res) => {},
              })
            })
          }
        })
        wx.request({
          url: 'https://autumnfish.cn/comment/music?id='+idd,
          success(data){
            console.log(data)
                that.setData({
                  contents:data.data.hotComments,
                  clength:data.data.hotComments.length,
                  // title:data.data.name
                },
                function(){
                  wx.hideLoading({
                    success: (res) => {},
                  })
              }) 
             }
            })
      }
    })

    wx.showLoading({
      title: '加载中',
    })
    // 使用 wx.createAudioContext 获取 audio 上下文 context
    this.audioCtx = wx.createAudioContext('myAudio')
    // console.log(this.audioCtx)
    var that = this
    let id = options.id;
    this.data.listId = options.listId;
    // 查询出对应的歌曲
     //歌曲详情的请求
        //https://autumnfish.cn/song/detail?ids=1869728598
        wx.request({
          url: 'https://autumnfish.cn/song/detail?ids='+id,
          success(data){
            // console.log(data)
            that.setData({
             id:id,
             imgUrl:data.data.songs[0].al.picUrl,
             songName:data.data.songs[0].name,
            },async()=>{
               //给头部赋值
              wx.setNavigationBarTitle({
                title:that.data.songName
              })
                //歌词
                let lrcTime = []
                wx.request({
                  url: 'https://autumnfish.cn/lyric?id='+that.data.id,
                  success(res){
                    let result = res.data.lrc.lyric
                    //分隔后的数组 
                    //[00:12.570]难以忘记初次见你
                    //正则来匹配
                    let resultArray = result.split("\n")
                    //声明正则对象来区分时间和歌词
                    let regx = /\[\d{2}:\d{2}\.\d{2,3}\]/
                    //利用正则来匹配每一句歌词
                    for(let i=0;i<resultArray.length;i++){
                      //进行歌词和时间的拆分
                      //获取匹配的结果
                      let date = resultArray[i].match(regx)
                      // console.log(date)
                      if(date!=null){
                        //将时间替换为空
                        var lrc = resultArray[i].replace(regx,"")
                        //获取时间字符串
                        var timeStr = date[0]
                        //将前后的中括号和后面的去除
                        var timeSlice = timeStr.slice(1,-1)
                        //将时分秒全部换成秒
                        var splitTimes = timeSlice.split(":")
                        var m = splitTimes[0]
                        var s = splitTimes[1]
                        //将时间组成秒
                        var time = Number(m)*60+Number(s)
                        // console.log(time)
                        // console.log(lrc)
                        //将对应的秒钟和歌词组成数组
                        lrcTime.push([time,lrc])
                      }
                    }
                    // console.log(lrcTime)
                    that.setData({
                      lyric:lrcTime
                    },function(){
                      wx.hideLoading({
                        success: (res) => {},
                      })
                    })
                  }
                })
                //播放url地址
                wx.request({
                  url: 'https://autumnfish.cn/song/url?id='+that.data.id,
                  success(res){
                    that.setData({
                      musicUrl:res.data.data[0].url
                    },function(){
                      this.audioCtx.play()
                    })
                  }
                })
                // 获取歌曲热评
                wx.request({
                  url: 'https://autumnfish.cn/comment/music?id='+that.data.id,
                  success(data){
                    console.log(data)
                        that.setData({
                          contents:data.data.hotComments,
                          clength:data.data.hotComments.length,
                          title:data.data.name
                        },
                        function(){
                          wx.hideLoading({
                            success: (res) => {},
                          })
                      }) 
                     }
                    })
            })
          }
        })
  
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    
  },
  playOrPause:function(){
    if(this.data.isPlay){
      this.audioCtx.pause()
    }else{
      this.audioCtx.play()
    }
    this.setData({
      isPlay:!this.data.isPlay
    })
  },
  // 单击播放到对应的位置
  lrcTap:function(e){ 
    this.audioCtx.seek(e.target.dataset.text)
    this.setData({
      current_item: e.target.dataset.key,
      Irc_index:e.target.dataset.key,
      scroll_top: this.data.current_item>=2?this.data.current_item*20 : 0
    })
  },
  // 播放时间改变时歌词变化
  timeUpdate:function(e){
    let currentTime1 = Number(e.detail.currentTime)
    if(currentTime1>=this.data.lyric[this.data.lrc_index][0]){
      this.setData({
        current_item: this.data.lrc_index,
        scroll_top: this.data.current_item>=2?this.data.current_item*20 : 0
      })
      this.data.lrc_index++
      // console.log("定时top位置在"+this.data.scroll_top)
    }
  },
  // 切换上一曲或下一曲
  togglePlay:function(e){
    let that = this
    if(e.target.dataset.text === 'left'){
      if(that.data.index==0){
        that.data.index=that.data.playList.length-1
      }else{
        that.data.index--
      }
    }else{
      if(that.data.index==that.data.playList.length-1){
        that.data.index=0
      }else{
        that.data.index++
      }    
    }
    let id = that.data.playList[that.data.index].id
    that.data.id =id
    let plist = JSON.stringify(that.data.playList)
    /*  wx.navigateTo({
      url: './play' + id + '&listId=' + that.data.listId,
    }) */
    wx.showLoading({
      title: '加载中',
    })
    // 使用 wx.createAudioContext 获取 audio 上下文 context
    that.audioCtx = wx.createAudioContext('myAudio')
    // console.log(this.audioCtx)
    // let id = options.id;
    // that.data.listId = options.listId;
    // 查询出对应的歌曲
      //歌曲详情的请求
        //https://autumnfish.cn/song/detail?ids=1869728598
        wx.request({
          url: 'https://autumnfish.cn/song/detail?ids='+id,
          success(data){
            that.audioCtx.seek(0)
            // console.log(data)
            that.setData({
              id:id,
              imgUrl:data.data.songs[0].al.picUrl,
              songName:data.data.songs[0].name,
              current_item: 0,
              scroll_top: 0
            },async()=>{
                //给头部赋值
              wx.setNavigationBarTitle({
                title:that.data.songName
              })
                //歌词
                let lrcTime = []
                wx.request({
                  url: 'https://autumnfish.cn/lyric?id='+that.data.id,
                  success(res){
                    let result = res.data.lrc.lyric
                    //分隔后的数组 
                    //[00:12.570]难以忘记初次见你
                    //正则来匹配
                    let resultArray = result.split("\n")
                    //声明正则对象来区分时间和歌词
                    let regx = /\[\d{2}:\d{2}\.\d{2,3}\]/
                    //利用正则来匹配每一句歌词
                    for(let i=0;i<resultArray.length;i++){
                      //进行歌词和时间的拆分
                      //获取匹配的结果
                      let date = resultArray[i].match(regx)
                      // console.log(date)
                      if(date!=null){
                        //将时间替换为空
                        var lrc = resultArray[i].replace(regx,"")
                        //获取时间字符串
                        var timeStr = date[0]
                        //将前后的中括号和后面的去除
                        var timeSlice = timeStr.slice(1,-1)
                        //将时分秒全部换成秒
                        var splitTimes = timeSlice.split(":")
                        var m = splitTimes[0]
                        var s = splitTimes[1]
                        //将时间组成秒
                        var time = Number(m)*60+Number(s)
                        // console.log(time)
                        // console.log(lrc)
                        //将对应的秒钟和歌词组成数组
                        lrcTime.push([time,lrc])
                      }
                    }
                    // console.log(lrcTime)
                    that.setData({
                      lyric:lrcTime
                    },function(){
                      wx.hideLoading({
                        success: (res) => {},
                      })
                    })
                  }
                })
                //播放url地址
                wx.request({
                  url: 'https://autumnfish.cn/song/url?id='+that.data.id,
                  success(res){
                    that.setData({
                      musicUrl:res.data.data[0].url
                    },function(){
                      this.audioCtx.play()
                    })
                  }
                })
                // 显示热评
                wx.request({
                  url: 'https://autumnfish.cn/comment/music?id='+that.data.id,
                  success(data){
                    console.log(data)
                        that.setData({
                          contents:data.data.hotComments,
                          clength:data.data.hotComments.length,
                          title:data.data.name
                        },
                        function(){
                          wx.hideLoading({
                            success: (res) => {},
                          })
                      }) 
                     }
                    })
            })
          }
        })
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