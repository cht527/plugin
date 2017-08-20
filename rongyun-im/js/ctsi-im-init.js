/*im变量配置*/
/*
var thisUserHeadUrl = 'http://ctsi-test.oss-cn-beijing.aliyuncs.com/customized/4089e4cc5210fc62015214b61f6c036c.jpg?Expires=1639813026&OSSAccessKeyId=IMXA6qBQjXJmwLlc&Signature=pajfscem8DRPQBspUI5vDi/QwTM%3D';
*/
var thisUserHeadUrl='';
var conversationType ="";
// RongIMLib.ConversationType.PRIVATE  私聊    RongIMLib.ConversationType.DISCUSSION; // 讨论组
var global_targetId ="";     // 目标 Id
var global_targetName ="";
var global_headPortrait ="";
var thisToken="";
var offLineList=[];
/*zTree配置*/
var curMenu = null, zTree_Menu = null;
var setting = {
    view: {
        showLine: false,
        showIcon: true,
        selectedMulti: false,
        dblClickExpand: false,
        addDiyDom: addDiyDom
    },
    data: {
        simpleData: {
            enable: true
        }
    },
    callback: {
        beforeClick: beforeClick,
        onDblClick: zTreeOnClick
    }
};
var zNodes = [];
function addDiyDom(treeId, treeNode) {
    var spaceWidth = 5;
    var switchObj = $("#" + treeNode.tId + "_switch"),
        icoObj = $("#" + treeNode.tId + "_ico");
    switchObj.remove();
    icoObj.before(switchObj);

    if (treeNode.level > 1) {
        var spaceStr = "<span style='display: inline-block;width:" + (spaceWidth * treeNode.level)+ "px'></span>";
        switchObj.before(spaceStr);
    }
}

function beforeClick(treeId, treeNode) {
    if (treeNode.level == 0 ) {
        var zTree = $.fn.zTree.getZTreeObj("treeDemo");
        zTree.expandNode(treeNode);
        return false;
    }
    return true;
}

function zTreeOnClick(event, treeId, treeNode) {
    var thisNodeId=treeNode.id;
    var thisNodeName=treeNode.name;
    var thisNodeIcon=treeNode.icon;

    var userList = [];
    var user = {};
    user.userId = thisNodeId;
    user.type = treeNode.type;
    userList.push(user);

    var targetId=thisNodeId; //targetId
    /*$.ajax({
        url: '/im/registerContacts.mvc',
        type:'POST',
        dataType: 'json',
        data: {
            registerList: userList
        },
        success: function(data) {
            console.log(data);
            if(data){*/

                global_targetId =targetId;
                global_targetName = thisNodeName; //name
                global_headPortrait = thisNodeIcon;//头像
                conversationType =RongIMLib.ConversationType.PRIVATE;
                var timeStrap= Date.parse(new Date());//首次获取历史记录

                setConversation(conversationType,global_targetId,global_targetName,global_headPortrait,timeStrap);
                console.log("sss");

            /*}else{

            }
        },
        error: function() {
            alert("连接失败");
        }
    });*/
}


//var thisToken = "alD0gRU3xMGAzlZRAxwLI+odDLio9ARB9Pi2XctkK57gVS7dUj3c69l53mxSBUtZ/ERVOfwfnuQAzKbDytj/iw==";
/*--getToken.mvc--根据管理员id 查询token*/
$.ajax({
    url: '/mts/im/getImUserInfo.mvc',
    type: 'post',
    dataType: 'json',
    async: false,
    success: function(data) {
        console.log(data);
        thisToken = data.body.token;
        thisUserHeadUrl=data.body.portraitUri;
        console.log("thisToken"+thisToken);
    },
    error: function() {
        alert('连接失败');
    }
});



/*function im_init(tokenParam) {*/
    /*初始化 SDK 。在整个应用程序全局，只需要调用一次 init 方法*/
    RongIMClient.init(ctsi_im_appkey);
    var token = thisToken;
    
    console.log("初始化 应用");

    RongIMLib.RongIMEmoji.init();
    console.log("初始化 表情库");

  /*  RongIMLib.RongIMVoice.init();
    console.log("初始化 声音库");*/

    // 设置连接监听状态 （ status 标识当前连接状态）
    // 连接状态监听器
    RongIMClient.setConnectionStatusListener({
        onChanged: function (status) {
            switch (status) {
                //链接成功
                case RongIMLib.ConnectionStatus.CONNECTED:
                    console.log('链接成功');
                    break;
                //正在链接
                case RongIMLib.ConnectionStatus.CONNECTING:
                    console.log('正在链接');
                    break;
                //重新链接
                case RongIMLib.ConnectionStatus.DISCONNECTED:
                    console.log('断开连接');
                    break;
                //其他设备登录
                case RongIMLib.ConnectionStatus.KICKED_OFFLINE_BY_OTHER_CLIENT:
                    alert('其他设备登录');
                    break;
                //网络不可用
                case RongIMLib.ConnectionStatus.NETWORK_UNAVAILABLE:
                    console.log('网络不可用');
                    break;
            }
        }});

    // 消息监听器
    RongIMClient.setOnReceiveMessageListener({
        // 接收到的消息
        onReceived: function (message) {
            // 判断消息类型
            switch(message.messageType){
                case RongIMClient.MessageType.TextMessage:
                    // 接收的消息内容将会被打印
                    console.log("message");
                    console.log(JSON.stringify(message,null,"\t"));
                    var currrentId=message.targetId;
                    var currentName=$("#"+currrentId).parent().children(".itemInfo").children(".peopelName").text();
                    var currentHeadUrl=$("#"+currrentId).parent().children(".headPortrait").children('img').attr("src");
                    if (!message.offLineMessage) { //实时会话
                      
                         /*判断 当前人是否正在聊天--会话的唯一性*/
                        //console.log("converation"+global_targetId);
                        if(currrentId==global_targetId){ //与当前人聊天
                            // 在会话窗口实时插入 dom 模板
                            console.log("getUnreadCount  in recentList");
                            var textEmojiStr = RongIMLib.RongIMEmoji.symbolToHTML(message.content.content);
                            var thisSenTTime=new Date(message.sentTime);
                            var senTTimeFormat=im_sendFormatDate(thisSenTTime);//sentTime时间戳 格式化
                            var receiveContentTemplate='<div class="im-content-container">'+
                                '<img class="im-headpic" src="'+currentHeadUrl+'" />'+
                                '<div class="im-content-container-inner">'+
                                '<div class="im-content-container-name">'+currentName+'</div>'+
                                '<div class="im-content-container-sendTime">'+senTTimeFormat+'</div>'+
                                '<div class="im-content-container-message">'+textEmojiStr+'</div>'+
                                '</div>'+
                                '</div>';

                            $('#im-MessagesContainer').append(receiveContentTemplate);
                            $('#Messages').scrollTop($('#im-MessagesContainer').height());
                        }else{   /*不与当前人聊天,在最近联系人中进行更新*/
                            /*如果已经存在在会话联系人中，更新最后一条信息lastMessage,显示小红点、未读会话数*/
                            //--实时会话 不与当前人聊天时 记录未读数
                            console.log("getUnreadCount not in recentList");
                            function getUnreadCount(){
                                /*
                                 注意事项：
                                 获取未读消息数必须在获取会话列表和收到实时消息之后
                                 未读消息数存在 localStorage 中
                                 */
                                RongIMClient.getInstance().getUnreadCount(RongIMLib.ConversationType.PRIVATE,currrentId,{
                                    onSuccess:function(count){
                                        console.log("获取会话未读数成功"+count);
                                        var onlineUnReadCount=count;
                                        if(onlineUnReadCount>99){
                                            onlineUnReadCount='99+';
                                        }
                                        //console.log("onlineUnReadCount"+onlineUnReadCount);
                                        //-----更新右侧会话列表内容
                                        if($("#"+currrentId+"recent")){
                                            console.log("online 列表中有该人"+onlineUnReadCount);
                                            $("#"+currrentId+"recent").parent().children(".headPortrait").children('.redPoint').show().text(onlineUnReadCount);
                                        }else{
                                            console.log("online 列表中无该人");
                                            var recentHeadPortraitDiv = '<div class="headPortrait" style="position: relative;">'+'<img src="'+ currentHeadUrl+ '">'+
                                                '<span class="redPoint" style="display: inline">'+'</span>'+
                                                '</div>';
                                            var recentPeopleInfoDiv = '<div class="itemInfo"><span class="peopelName">' + currentName + '</span><br><span class="peopleOrg">'+message.content.content+ '</span></div>';
                                            var recentTokenInput = '<input type="hidden"  id="'+currrentId+'recent'+'"  class="userId" value="'+currrentId+'"/>';
                                            var recentLiItem = recentHeadPortraitDiv + recentPeopleInfoDiv + recentTokenInput;
                                            $('#recentListItems ul').append('<li>' + recentLiItem + '</li>');
                                        }
                                    },
                                    onError:function(error){
                                        alert("获取会话未读数失败");
                                    }
                                });
                            }
                            getUnreadCount();
                            
                        }

                    } else {
                        //非实时接收消息：1、在“企业通”按钮上显示小红点 2、在最近联系人会话列表中显示小红点
                        //将离线消息push到全局offLineList
                        offLineList.push(message);
                        console.log("offLineList has pushed");
                        console.log("offLineList.length"+offLineList.length);
                        console.log(JSON.stringify(offLineList,null,'\t'));
                        //“企业通”按钮上显示小红点
                        var enterpriseChatRedPointDOM= window.parent.document.getElementById('enterpriseChatRedPoint');
                        enterpriseChatRedPointDOM.style.display="block";
                        console.log("offline message content");
                        console.log("offline message content"+message.content.content);
                        console.log("offline message ");
                        console.log("offline message"+message);

                    }

                    break;
                case RongIMClient.MessageType.VoiceMessage:
                    // 对声音进行预加载
                    // message.content.content 格式为 AMR 格式的 base64 码
                    RongIMLib.RongIMVoice.preLoaded(message.content.content);
                    console.log("语音");
                    break;
                case RongIMClient.MessageType.ImageMessage:
                    // do something...
                    console.log("图片");
                    break;
                case RongIMClient.MessageType.DiscussionNotificationMessage:
                    // do something...
                    console.log("讨论组消息");
                    break;
                case RongIMClient.MessageType.LocationMessage:
                    // do something...
                    console.log("位置消息");
                    break;
                case RongIMClient.MessageType.RichContentMessage:
                    // do something...
                    console.log("富媒体信息");
                    break;
                case RongIMClient.MessageType.DiscussionNotificationMessage:
                    // do something...

                    break;
                case RongIMClient.MessageType.InformationNotificationMessage:
                    // do something...
                    console.log("信息提示");
                    break;
                case RongIMClient.MessageType.ContactNotificationMessage:
                    // do something...
                    console.log("contact");
                    break;
                case RongIMClient.MessageType.ProfileNotificationMessage:
                    // do something...
                    break;
                case RongIMClient.MessageType.CommandNotificationMessage:
                    // do something...
                    break;
                case RongIMClient.MessageType.CommandMessage:
                    // do something...
                    break;
                case RongIMClient.MessageType.UnknownMessage:
                    // do something...
                    break;
                default:
                // 自定义消息
                // do something...
            }
        }
    });



    // 连接融云服务器。
    RongIMClient.connect(token, {
        onSuccess: function(userId) {
            console.log("Login successfully." + userId);
            //--------加载 通讯录、部门树列表、最近联系人列表-----------

            /* 查询 通讯录列表 ajax*/
           /*$.ajax({
                url:'/mts/im/getContactList.mvc',
                type: 'post',
                dataType: 'json',
                success: function(data) {
                    console.log('人员列表');
                    console.log(data);
                    var $addressBookListItemsUl = $('#addressBookListItems ul');
                    loadItemList($addressBookListItemsUl, data.body.users);
                },
                error: function() {
                    alert('连接失败');
                }
            });*/

            /* 查询 组织部门树 ajax*/
            /*$.ajax({
                url: '/mts/im/getContactListForZtree.mvc',
                type: 'post',
                dataType: 'json',
                success: function(data) {
                    console.log(data);
                    zNodes = data.body.nodes;
                    var treeObj = $("#treeDemo");
                    $.fn.zTree.init(treeObj, setting, zNodes);
                    zTree_Menu = $.fn.zTree.getZTreeObj("treeDemo");
                    console.log(zTree_Menu.getNodes());
                    curMenu = zTree_Menu.getNodes()[0].children[0].children[0];
                    zTree_Menu.selectNode(curMenu);
                },
                error: function() {
                    alert('连接失败');
                }
            });*/

            //部门树测试使用
           zNodes =[
                { id:1, pid:0, name:"中国电信系统集成公司", open:true},
                { id:11, pid:1, name:"移动互联网事业部", open:true},
                { id:111, pid:11, name:"应用研发中心"},
                { id:112, pid:111, name:"前端团队"},
                { id:113, pid:112, name:"前端1组"},
                { id:'zgp', pid:113, name:"张冠鹏", tokenId:"zgp",icon:"http://ctsi-test.oss-cn-beijing.aliyuncs.com/customized/4089e4cc5210fc62015214a8d6200255.jpg?Expires=1638601014&OSSAccessKeyId=IMXA6qBQjXJmwLlc&Signature=%2BY7ZlvCobufYIIq7fXdBkIp2FuY%3D"},
                { id:12, pid:1, name:"垃圾邮件",icon:"http://ctsi-test.oss-cn-beijing.aliyuncs.com/customized/4089e4cc5210fc62015214a8d6200255.jpg?Expires=1638601014&OSSAccessKeyId=IMXA6qBQjXJmwLlc&Signature=%2BY7ZlvCobufYIIq7fXdBkIp2FuY%3D"},
                { id:13, pid:1, name:"草稿",icon:"http://ctsi-test.oss-cn-beijing.aliyuncs.com/customized/4089e4cc5210fc62015214a8d6200255.jpg?Expires=1638601014&OSSAccessKeyId=IMXA6qBQjXJmwLlc&Signature=%2BY7ZlvCobufYIIq7fXdBkIp2FuY%3D"},
                { id:14, pid:1, name:"已发送邮件",icon:"http://ctsi-test.oss-cn-beijing.aliyuncs.com/customized/4089e4cc5210fc62015214a8d6200255.jpg?Expires=1638601014&OSSAccessKeyId=IMXA6qBQjXJmwLlc&Signature=%2BY7ZlvCobufYIIq7fXdBkIp2FuY%3D"},
                { id:15, pid:1, name:"已删除邮件",icon:"http://ctsi-test.oss-cn-beijing.aliyuncs.com/customized/4089e4cc5210fc62015214a8d6200255.jpg?Expires=1638601014&OSSAccessKeyId=IMXA6qBQjXJmwLlc&Signature=%2BY7ZlvCobufYIIq7fXdBkIp2FuY%3D"},
                { id:3, pid:0, name:"快速视图"},
                { id:31, pid:3, name:"文档",icon:"http://ctsi-test.oss-cn-beijing.aliyuncs.com/customized/4089e4cc5210fc62015214a8d6200255.jpg?Expires=1638601014&OSSAccessKeyId=IMXA6qBQjXJmwLlc&Signature=%2BY7ZlvCobufYIIq7fXdBkIp2FuY%3D"},
                { id:32, pid:3, name:"照片",icon:"http://ctsi-test.oss-cn-beijing.aliyuncs.com/customized/4089e4cc5210fc62015214a8d6200255.jpg?Expires=1638601014&OSSAccessKeyId=IMXA6qBQjXJmwLlc&Signature=%2BY7ZlvCobufYIIq7fXdBkIp2FuY%3D"}
            ];
            var treeObj = $("#treeDemo");
            $.fn.zTree.init(treeObj, setting, zNodes);
            zTree_Menu = $.fn.zTree.getZTreeObj("treeDemo");
            console.log(zTree_Menu.getNodes());
            curMenu = zTree_Menu.getNodes()[0].children[0].children[0];
            zTree_Menu.selectNode(curMenu);

            var peopleList = [
                {
                    portraitUri:'http://ctsi-test.oss-cn-beijing.aliyuncs.com/customized/4089e4cc5210fc62015214b61f6c036c.jpg?Expires=1639813026&OSSAccessKeyId=IMXA6qBQjXJmwLlc&Signature=pajfscem8DRPQBspUI5vDi/QwTM%3D',
                    name:'张冠鹏[超级超级管理员]',
                    userId: 'zgp',
                    departmentName: '移动互联网事业部',
                    type:'1'
                },{
                    portraitUri:'http://ctsi-test.oss-cn-beijing.aliyuncs.com/customized/4089e4cc5210fc62015214b61f6c036c.jpg?Expires=1639813026&OSSAccessKeyId=IMXA6qBQjXJmwLlc&Signature=pajfscem8DRPQBspUI5vDi/QwTM%3D',
                    name:'崔卉[]',
                    userId: 'cuihui',
                    departmentName: '移动互联网事业部',
                    type:'1'
                },{
                    portraitUri: 'http://ctsi-test.oss-cn-beijing.aliyuncs.com/customized/4089e4cc5210fc62015214b61f4f036a.jpg?Expires=1639703923&OSSAccessKeyId=IMXA6qBQjXJmwLlc&Signature=h0BarralZeGy24IAlBoN6AWZ1Jw%3D',
                    name:'曹海涛',
                    userId: 'cht527',
                    departmentName: '移动互联网事业部',
                    type:'2'
                }

            ];

            function loadItemList(selector, dataList) {

                for(var i=0;i<dataList.length;i++) {
                    var headPortraitDiv = '<div class="headPortrait"><img src="' + dataList[i].portraitUri + '"></div>';
                    var peopleInfoDiv = '<div class="itemInfo"><span class="peopelName">' + dataList[i].name + '</span><br><span class="peopleOrg">'+ dataList[i].departmentName + '</span></div>';
                    var typeInput = '<input type="hidden" class="userType" value="'+ dataList[i].type +'"/>';
                    var tokenInput = '<input type="hidden" class="userId" id="'+ dataList[i].userId +'" value="'+ dataList[i].userId +'"/>';
                    var liItem = headPortraitDiv + peopleInfoDiv + tokenInput + typeInput;
                    selector.append('<li>' + liItem + '</li>');
                }

            }
            var $addressBookListItemsUl = $('#addressBookListItems ul');
            loadItemList($addressBookListItemsUl, peopleList);

            // ---------------------------最近联系人 初始化--------------------------------------
            function initLoadRecentItemList(dataList) {

                var initRecentListLen=dataList.length;

                for(var i=0;i<initRecentListLen;i++) {
                    var thisLastMessage= dataList[i].latestMessage.content.content;//最后一条消息
                    var thisTargetId= dataList[i].targetId;
                    if(thisTargetId){
                        //--从已加载的通讯录列表中获取 名字、头像url
                        var thisTargetName=$("#"+thisTargetId).parent().children(".itemInfo").children(".peopelName").text();
                        var thisTargetHeadUrl=$("#"+thisTargetId).parent().children(".headPortrait").children('img').attr("src");

                        var headPortraitDiv = '<div class="headPortrait" style="position: relative;">'+'<img src="'+ thisTargetHeadUrl+ '">' +
                            '<span class="redPoint" style="">'+'</span>'+
                            '</div>';
                        var peopleInfoDiv = '<div class="itemInfo"><span class="peopelName">' + thisTargetName + '</span><br><span class="peopleOrg">'+thisLastMessage+ '</span></div>';
                        var tokenInput = '<input type="hidden"  id="'+thisTargetId+'recent'+'"  class="userId" value="'+thisTargetId+'"/>';
                        var liItem = headPortraitDiv + peopleInfoDiv + tokenInput;
                        $('#recentListItems ul').append('<li>' + liItem + '</li>');
                    }else{
                        alert("初始化最近联系人列表中存在无效targetId")
                    }

                }
                //----将离线消息小红点及未读数显示在最近联系人列表----------------
                if(offLineList.length>0){ //--有离线消息--
                    var offLineListLen=offLineList.length;
                    for(var k=0;k<offLineListLen;k++){
                        var thisOfflineTargetId=offLineList[i].targetId;
                        RongIMClient.getInstance().getUnreadCount(RongIMLib.ConversationType.PRIVATE,thisOfflineTargetId,{
                            onSuccess:function(count){
                                console.log("获取会话未读数成功"+count);
                                var offLineUnReadCount=count;
                                if(offLineUnReadCount>99){
                                    offLineUnReadCount='99+';
                                }
                                //console.log("onlineUnReadCount"+onlineUnReadCount);
                                //首先判断是否在最近联系人中 是否有该人员
                                if($("#"+thisOfflineTargetId+"recent")){
                                    $("#"+thisOfflineTargetId+"recent").parent().children(".headPortrait").children('.redPoint').show().text(offLineUnReadCount);

                                }else{
                                    var thisOfflineItemUrl=$("#"+thisOfflineTargetId).parent().children(".headPortrait").children('img').attr("src");
                                    var thisOfflineItemName=$("#"+thisOfflineTargetId).parent().children(".itemInfo").children(".peopelName").text();
                                    var recentHeadPortraitDiv = '<div class="headPortrait" style="position: relative;">'+'<img src="'+ thisOfflineItemUrl+ '">'+
                                        '<span class="redPoint" style="display: inline">'+
                                        '</div>';
                                    var recentPeopleInfoDiv = '<div class="itemInfo"><span class="peopelName">' + thisOfflineItemName + '</span><br><span class="peopleOrg">'+offLineList[i].content.content+ '</span></div>';
                                    var recentTokenInput = '<input type="hidden"  id="'+thisOfflineTargetId+'recent'+'"  class="userId" value="'+thisOfflineTargetId+'"/>';
                                    var recentLiItem = recentHeadPortraitDiv + recentPeopleInfoDiv + recentTokenInput;
                                    $('#recentListItems ul').append('<li>' + recentLiItem + '</li>');
                                }

                            },
                            onError:function(error){
                                alert("获取会话未读数失败");
                            }
                        });

                    }
                    //
                    //首先判断是否在最近联系人中 是否有该人员
                   /* if($("#"+currrentId+"recent")){ // 有该人员则展示小红点和数字
                        console.log("offline 列表有该人   redPoint show");
                        $("#"+currrentId+"recent").parent().children(".headPortrait").children('.redPoint').show();

                    }else{ //如果最近联系人中 不存在 该聊天对象 则插入模板，展示小红点和数字
                        console.log("offline 列表无该人   redPoint show");
                        var recentHeadPortraitDiv = '<div class="headPortrait" style="position: relative;">'+'<img src="'+ currentHeadUrl+ '">'+
                            '<span class="redPoint" style="display: inline">'+'</span>'+
                            '</div>';
                        var recentPeopleInfoDiv = '<div class="itemInfo"><span class="peopelName">' + currentName + '</span><br><span class="peopleOrg">'+message.content.content+ '</span></div>';
                        var recentTokenInput = '<input type="hidden"  id="'+currrentId+'recent'+'"  class="userId" value="'+currrentId+'"/>';
                        var recentLiItem = recentHeadPortraitDiv + recentPeopleInfoDiv + recentTokenInput;
                        $('#recentListItems ul').append('<li>' + recentLiItem + '</li>');
                    }*/
                }

            }
            //加载 最近联系人列表
            function initGetRecentList() {
                RongIMClient.getInstance().getConversationList({
                    onSuccess: function(list) {
                        list.sort(function(a,b){
                            return a.sentTime < b.sentTime;
                        });
                        /* var list = merge(list,userInfoList);*/
                        //配置模板继续做dom呈现即可
                        console.log("初始化最近联系人，共"+list.length+"人");
                        // console.log(JSON.stringify(list,null,"\t"));
                        if(list.length>0){ // 如果 存在最近联系人 则加载dom
                            initLoadRecentItemList(list);
                        }
                    },
                    onError: function(error) {
                        console.log("获取会话失败");

                    }
                },null);
            }
            initGetRecentList();




            /*-------------------初始化加载-emoji--------------------------------*/
            var emojis = RongIMLib.RongIMEmoji.emojis;
            //console.log(emojis);
            //console.log(emojis[0].innerHTML);
            //----将emoji循环插入Dom 容器中
            var emojiLen=emojis.length;
            for (var i=0;i<emojiLen;i++){
                $("#showemoji-container").append(emojis[i].innerHTML)
            }

        },
        onTokenIncorrect: function() {
            console.log('token无效');
        },
        onError:function(errorCode){
            var info = '';
            switch (errorCode) {
                case RongIMLib.ErrorCode.TIMEOUT:
                    info = '超时';
                    break;
                case RongIMLib.ErrorCode.UNKNOWN_ERROR:
                    info = '未知错误';
                    break;
                case RongIMLib.ErrorCode.UNACCEPTABLE_PaROTOCOL_VERSION:
                    info = '不可接受的协议版本';
                    break;
                case RongIMLib.ErrorCode.IDENTIFIER_REJECTED:
                    info = 'appkey不正确';
                    break;
                case RongIMLib.ErrorCode.SERVER_UNAVAILABLE:
                    info = '服务器不可用';
                    break;
            }
            console.log(errorCode);
        }
    });

/*}*/
//---im_init()    end

