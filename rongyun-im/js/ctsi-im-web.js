


var targetId2 = "cuihui";     // 目标 Id2


/* 设置监听 主面板 显示与隐藏 & 通讯录，最近联系人切换*/

$('#message').click(function() {
    $('#addressBookList').hide();
    $('#searchInput').hide();
    $('#recentContacts').show();
    $('#searchRecentInput').show();
    if($('#people').hasClass('people1')) {
        $('#people').removeClass('people1');
    }
    $('#people').addClass('people2');
    if($('#message').hasClass('message2')) {
        $('#message').removeClass('message2');
    }
    $('#message').addClass('message1');
});

$('#people').click(function() {
    $('#recentContacts').hide();
    $('#searchRecentInput').hide();
    $('#addressBookList').show();
    $('#searchInput').show();
    if($('#people').hasClass('people2')) {
        $('#people').removeClass('people2');
    }
    $('#people').addClass('people1');
    if($('#message').hasClass('message1')) {
        $('#message').removeClass('message1');
    }
    $('#message').addClass('message2');
});

$('#orgTab').click(function() {
    $('#addressBookListItems').hide();
    $('#addressBookListOrgs').show();
    if($('#peopleTab').hasClass('activeTab')) {
        $('#peopleTab').removeClass('activeTab');
    }
    if(!$('#orgTab').hasClass('activeTab')) {
        $('#orgTab').addClass('activeTab');
    }
});

$('#peopleTab').click(function() {
    $('#addressBookListOrgs').hide();
    $('#addressBookListItems').show();
    if($('#orgTab').hasClass('activeTab')) {
        $('#orgTab').removeClass('activeTab');
    }
    if(!$('#peopleTab').hasClass('activeTab')) {
        $('#peopleTab').addClass('activeTab');
    }
});

$('#closeSearch').click(function() {
    $('#searchArea input').val('');
    var e = jQuery.Event("keyup");
    e.keyCode = 8;
    $('#searchArea input').trigger(e);
});

/*$('#searchIcon').click(function() {
    $('#colleagueResult ul').empty();
    var $colleagueResultUl = $('#colleagueResult ul');
    $('#searchResultArea').show();
    if(peopleList == "") {
        $('#colleague').hide();
        $('#disscussionGroup').hide();
        $('#voidResult').show();
    }
    loadItemList($colleagueResultUl, peopleList);
});*/

/*-------设置 创建讨论组 会话窗口 监听 点击“同事”、“部门”tab--------------*/
$('#conversation_orgTab').click(function() {
    
    $('#conversation_addressBookListItems').hide();
    $('#conversation_addressBookListOrgs').show();

    $('#conversation_peopleTab').removeClass('conversation-activeTab');
    $('#conversation_orgTab').addClass('conversation-activeTab');
 
});

$('#conversation_peopleTab').click(function() {
    $('#conversation_addressBookListOrgs').hide();
    $('#conversation_addressBookListItems').show();

    $('#conversation_orgTab').removeClass('conversation-activeTab');
    $('#conversation_peopleTab').addClass('conversation-activeTab');

});



/*--监听  双击通讯录人员条目的操作 --单聊模式--*/
$('#addressBookListItems ul').on("dblclick","li",function() {
    /*---ajax 查询  发送该人员的 userId , type到后台, 查询该目标人员是否有有效token，返回 true or false--*/

   /* var userList = [];
    var user = {};
    user.userId = $(this).children('.userId').val();
    user.type = $(this).children('.userType').val();
    userList.push(user);*/

    var targetId=$(this).children('.userId').val(); //targetId
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
                    global_targetName = $(this).children('.itemInfo').children('.peopelName').text(); //name
                    global_headPortrait = $(this).children('.headPortrait').children('img').attr("src");//头像
                    conversationType =RongIMLib.ConversationType.PRIVATE;
                    var timeStrap= Date.parse(new Date());//首次获取历史记录
                    //----清空未读消息 
                    RongIMClient.getInstance().clearUnreadCount(conversationType,global_targetId,{
                        onSuccess:function(){
                            console.log("清除未读数成功");
                        },
                        onError:function(error){
                            console.log("清除未读数失败");
                
                        }
                    });

                setConversation(conversationType,global_targetId,global_targetName,global_headPortrait,timeStrap)

            /*}else{

            }

        },
        error: function() {
            alert("连接失败");
        }
    });*/


});



//-----------监听 点击 ”获取更多历史消息“----------
$('#conv_moreHistoryText').on("click",function () {
    console.log("conv_moreHistoryText");
    var notFirstHistoryMessage=false;
    getHistoryMessageList(conversationType,global_targetId,20,global_headPortrait,global_targetName,null,notFirstHistoryMessage);
})


//显示会话窗口，
function showConversation() {
    //--会话窗口显示
    $("#im_conversation").fadeIn();
}

//关闭单聊会话窗口
function closeConversation() {
    gloabl_targetId ='';
    $("#im_conversation").fadeOut();
}

/*----------发送信息 加时间sentTime- 格式化---------*/
function im_sendFormatDate(now) {
    var year=now.getFullYear();
    var month=now.getMonth()+1;
    month=month<10?"0"+month:month;
    var date=now.getDate();
    date=date<10?"0"+date:date;
    var hour=now.getHours();
    hour=hour<10?"0"+hour:hour;
    var minute=now.getMinutes();
    minute=minute<10?"0"+minute:minute;
    var second=now.getSeconds();
    second=second<10?"0"+second:second;
    return year+"-"+month+"-"+date+" "+hour+":"+minute+":"+second;
}

/*----调用 发送文本信息接口-------*/
function sendTextMessage(val,conversationType,targetId,targetName,targetHeadUrl) {
    // 定义消息类型,文字消息使用 RongIMLib.TextMessage
    /*
     var msg = new RongIMLib.TextMessage({content:"hello",extra:"附加信息"});
     */
    var content = {
        content: val
    };
    var msg = new RongIMLib.TextMessage(content);
    //或者使用RongIMLib.TextMessage.obtain 方法.具体使用请参见文档
    //var msg = RongIMLib.TextMessage.obtain("hello");

    RongIMClient.getInstance().sendMessage(conversationType, targetId, msg, {
            // 发送消息成功
            onSuccess: function (message) {
                //message 为发送的消息对象并且包含服务器返回的消息唯一Id和发送消息时间戳
                var textEmojiStr = RongIMLib.RongIMEmoji.symbolToHTML(message.content.content);;
                var thisSenTTime=new Date(message.sentTime);
                var senTTimeFormat=im_sendFormatDate(thisSenTTime);//sentTime时间戳 格式化
                //console.log(textEmojiStr);
                var thisMessageContent=message.content.content;
                //console.log(JSON.stringify(message,null,"\t"));
                console.log("Send successfully");
                var sendContentTemplate='<div class="im-content-container">'+
                    '<img class="im-headpic" src="'+thisUserHeadUrl+'" />'+
                    '<div class="im-content-container-inner">'+
                    '<div class="im-content-container-name">'+'我'+'</div>'+
                    '<div class="im-content-container-sendTime">'+senTTimeFormat+'</div>'+
                    '<div class="im-content-container-message">'+textEmojiStr+'</div>'+
                    '</div>'+
                    '</div>';

                $('#im-MessagesContainer').append(sendContentTemplate);
                $('#Messages').scrollTop($('#im-MessagesContainer').height());

                $("#im-inputMsg").empty();

                /*添加到最近联系人*/
                showRecentContact(targetId,targetName,targetHeadUrl,thisMessageContent);// 将会话联系人信息 merge
            },
            onError: function (errorCode, message) {
                var info = '';
                switch (errorCode) {
                    case RongIMLib.ErrorCode.TIMEOUT:
                        info = '超时';
                        break;
                    case RongIMLib.ErrorCode.UNKNOWN_ERROR:
                        info = '未知错误';
                        break;
                    case RongIMLib.ErrorCode.REJECTED_BY_BLACKLIST:
                        info = '在黑名单中，无法向对方发送消息';
                        break;
                    case RongIMLib.ErrorCode.NOT_IN_DISCUSSION:
                        info = '不在讨论组中';
                        break;

                    default :
                        info = "x";
                        break;
                }
                console.log('发送失败:' + info);
            }
        }
    );
}
//----sendTextMessage()    end

/*-------回车发送---------*/
$("#im-inputMsg").on("keydown",function (event) {
    var e = event || window.event || arguments.callee.caller.arguments[0];
    if(e.keyCode=="13"){
        send(); 
    }
})
/*-------回车发送 end---------*/

/*-------设置会话title、清空聊天窗口、获取历史记录------*/
function setConversation(targetType, targetId, targetName,headPortrait,timeStrap) {
    if(targetType==1){   //单聊
        //--显示会话目标名字\头像
        $("#im_conversation_name").text(targetName);
        $("#im_conversation_iconUrl").attr("src",headPortrait);

        //--清空会话
        $("#im-MessagesContainer").empty();

        //--获取该目标人员（targetId）对应的历史信息，
        var firstHistoryMessage=true; //判断是否是首次获取
        getHistoryMessageList(1,targetId,20,headPortrait,targetName,timeStrap,firstHistoryMessage);


    }
    if(targetType==2){   //讨论组
        //--显示会话目标名字
        $("#im_conversation_name").text(targetName);
        
    }
    // 显示 聊天窗口
    showConversation();
}


//点击 显示、隐藏emoji表情库
function showemoji() {
    $("#showemoji-container").toggle(200);
}
//监听 点击 emoji 将表情对应字符串 插入到输入区域
$("#showemoji-container").on('click','span',function () {
    var thisEmojiStr=$(this).attr('name');
    var InputStr= $("#im-inputMsg").text();
    $("#im-inputMsg").text(InputStr+thisEmojiStr);
    $("#showemoji-container").toggle(200);
   
})

//点击发送 按钮 发送content
function send() {
    if (!conversationType) {
        alert("请先选择一个会话目标。");
        return;
    }
    //--发送文本信息
    var text_content=$("#im-inputMsg").text();
    if(text_content){
        sendTextMessage(text_content,conversationType,global_targetId,global_targetName,global_headPortrait);
    }else{
        alert("发送消息不能为空")
    }
    
    //getHistoryMessageList(1,'cuihui',20);

}

/*------获取历史记录--------*/
function getHistoryMessageList(type,targetId,num,headPortrait,targetName,timeStrap,firstHistoryMessage) {
    //getHistoryMessages
   

    RongIMClient.getInstance().getHistoryMessages(type, targetId, timeStrap, num, {
        onSuccess: function(list, hasMsg) {
            // hasMsg为boolean值，如果为true则表示还有剩余历史消息可拉取，为false的话表示没有剩余历史消息可供拉取。
            // list 为拉取到的历史消息列表

            if(firstHistoryMessage){  //首次获取 动态插入dom信息 
                list.sort(function(a,b){
                    return a.sentTime - b.sentTime;
                });
                console.log("首次获取历史记录"+hasMsg);

                //console.log(JSON.stringify(list,null,"\t"));
                // -------配置DOM 显示 历史聊天内容
                var historyDomTemplate; //模板
                $.each(list, function(index,value) {
                    var thisSenTTime=new Date(this.sentTime);
                    var senTTimeFormat=im_sendFormatDate(thisSenTTime);//sentTime时间戳 格式化*/
                    var thisTextEmojiStr=RongIMLib.RongIMEmoji.symbolToHTML(this.content.content);
                    if(this.senderUserId==targetId){ // dom 应显示 目标聊天人员的信息

                        historyDomTemplate='<div class="im-content-container">'+
                            '<img class="im-headpic" src="'+headPortrait+'" />'+
                            '<div class="im-content-container-inner">'+
                            '<div class="im-content-container-name">'+targetName+'</div>'+
                            '<div class="im-content-container-sendTime">'+senTTimeFormat+'</div>'+
                            '<div class="im-content-container-message">'+thisTextEmojiStr+'</div>'+
                            '</div>'+
                            '</div>';
                    }else{                           // 显示 “我” 的信息
                        historyDomTemplate='<div class="im-content-container">'+
                            '<img class="im-headpic" src="'+thisUserHeadUrl+'" />'+
                            '<div class="im-content-container-inner">'+
                            '<div class="im-content-container-name">'+'我'+'</div>'+
                            '<div class="im-content-container-sendTime">'+senTTimeFormat+'</div>'+
                            '<div class="im-content-container-message">'+thisTextEmojiStr+'</div>'+
                            '</div>'+
                            '</div>';
                    }

                    $('#im-MessagesContainer').append(historyDomTemplate);

                });
            }else{  // 点击“获取更多历史信息后" 反向插入DOM
                list.sort(function(a,b){
                    return parseInt(b.sentTime) - parseInt(a.sentTime);
                });
                console.log("点击获取更多历史记录"+hasMsg);

                console.log(JSON.stringify(list,null,"\t"));
                // -------配置DOM 显示 历史聊天内容
                var historyDomTemplate; //模板
                //var moreHistoryText='<span  id="conv_moreHistoryText" class="conversation-moreHistoryText">'+'查看更多消息'+'</span>';
                $.each(list, function(index,value) {
                    var thisSenTTime=new Date(this.sentTime);
                    var senTTimeFormat=im_sendFormatDate(thisSenTTime);//sentTime时间戳 格式化*/
                    var thisTextEmojiStr=RongIMLib.RongIMEmoji.symbolToHTML(this.content.content);
                    if(this.senderUserId==targetId){ // dom 应显示 目标聊天人员的信息
                        historyDomTemplate='<div class="im-content-container">'+
                            '<img class="im-headpic" src="'+headPortrait+'" />'+
                            '<div class="im-content-container-inner">'+
                            '<div class="im-content-container-name">'+targetName+'</div>'+
                            '<div class="im-content-container-sendTime">'+senTTimeFormat+'</div>'+
                            '<div class="im-content-container-message">'+thisTextEmojiStr+'</div>'+
                            '</div>'+
                            '</div>';
                    }else{                           // 显示 “我” 的信息
                        historyDomTemplate='<div class="im-content-container">'+
                            '<img class="im-headpic" src="'+thisUserHeadUrl+'" />'+
                            '<div class="im-content-container-inner">'+
                            '<div class="im-content-container-name">'+'我'+'</div>'+
                            '<div class="im-content-container-sendTime">'+senTTimeFormat+'</div>'+
                            '<div class="im-content-container-message">'+thisTextEmojiStr+'</div>'+
                            '</div>'+
                            '</div>';
                    }

                    $('#im-MessagesContainer').prepend(historyDomTemplate);

                });
            }
            
            
            // 判断是否有更多历史消息
            if(hasMsg){
                $('#conv_moreHistoryText').css("display","block");
            }else{
                $('#conv_moreHistoryText').text("没有更多历史信息了");
            }
            $('#Messages').scrollTop($('#im-MessagesContainer').height());

        },
        onError: function(error) {
            // APP未开启消息漫游或处理异常
            // throw new ERROR ......
            console.log(error)
        }
    });
}

/*----获取最近联系人列表----*/
//var userInfoList=[];
function showRecentContact(targetId,targetName,targetHeadUrl,MessageContent){
    //获取最近会话，获得会话对象内容
    var currentMessageContent=MessageContent;
    var userInfo = {
        "userId": targetId,
        "name": targetName,
        "portraitUri": targetHeadUrl,
        "content":currentMessageContent
    };

    console.log(JSON.stringify(userInfo,null,"\t"));
    if($("#"+targetId+"recent")){//若最近联系人列表中已经存在该会话对象，则将最新发送的内容更新到lastMessage
        $("#"+targetId+"recent").prev().children('.peopleOrg').text(currentMessageContent);
        console.log("recent---最近联系人中已存在-----")
    }else{//如果最近联系人中 不存在 该聊天对象 则插入模板
        var recentHeadPortraitDiv = '<div class="headPortrait" style="position: relative;">'+'<img src="'+ targetHeadUrl+ '">'+
            '<span class="redPoint" style="">'+'</span>' +
            '</div>';
        var recentPeopleInfoDiv = '<div class="itemInfo"><span class="peopelName">' + targetName + '</span><br><span class="peopleOrg">'+currentMessageContent+ '</span></div>';
        var recentTokenInput = '<input type="hidden"  id="'+targetId+'recent'+'"  class="userId" value="'+targetId+'"/>';
        var recentLiItem = recentHeadPortraitDiv + recentPeopleInfoDiv + recentTokenInput;
        $('#recentListItems ul').append('<li>' + recentLiItem + '</li>');
        console.log("not--recent---最近联系人中不存在-----")
        
    }
   /* var userInfoList_len= userInfoList.length;
    if(userInfoList_len>0){
        for(var j=0;j<userInfoList_len;j++){
            if(userInfoList[j].userId==userInfo.userId){
                userInfoList[j]=userInfo;
                return;
            }else{
                if(j>=userInfoList_len-1){
                    userInfoList.push(userInfo);
                }else{
                    continue;
                }
            }
        }
    }else {
        userInfoList.push(userInfo);
    }
    console.log("userInfoLIst")
    console.log(JSON.stringify(userInfoList,null,"\t"));
    */

  /*  RongIMClient.getInstance().getConversationList({
        onSuccess: function(list) {
            list.sort(function(a,b){
                return a.sentTime > b.sentTime;
            });
            console.log(JSON.stringify(list,null,"\t"));
            var list = merge(list,userInfoList);
            //配置模板继续做dom呈现即可

            console.log("获取会话merge用户数据成功");
            console.log(JSON.stringify(list,null,"\t"));

            loadRecentItemList(list);
        },
        onError: function(error) {
            console.log("获取会话失败");

        }
    },null);

    function merge(conversationList,userInfoList){
        var len= conversationList.length;
        for(var i = 0; i < len; i++){
            var userId = conversationList[i].targetId;
            conversationList[i].userInfo = userInfoList[i];
        }
        return conversationList;
    }*/

    /*function loadRecentItemList(dataList) {
        console.log("recentdataList len"+dataList.length);
        $('#recentListItems ul').empty();
        var recentListLen=dataList.length;
        for(var i=0;i<recentListLen;i++) {
            var headPortraitDiv = '<div class="headPortrait" style="position: relative">' +
                '<img src="'+ dataList[i].userInfo.portraitUri+ '">' +
                '<span class="redPoint" style="position: absolute;display:none;border: 1px solid red; width:0px;height: 0px; top: -2px;right: -2px;border-radius: 50%">'+'</span>' +
                '</div>';
            var peopleInfoDiv = '<div class="itemInfo">'+'<span class="peopelName">' + dataList[i].userInfo.name + '</span><br><span class="peopleOrg">'+dataList[i].latestMessage.content.content+ '</span></div>';
            var tokenInput = '<input type="hidden" id="'+dataList[i].userInfo.userId+'recent'+'" class="userId" value="'+ dataList[i].userInfo.userId +'"/>';
            var liItem = headPortraitDiv + peopleInfoDiv + tokenInput;
            $('#recentListItems ul').append('<li>' + liItem + '</li>');
        }
    }*/
}


/*--------监听 双击 最近联系人-发起会话-------*/
$('#recentListItems ul').on("dblclick","li",function() {
    $(this).children('.headPortrait').children('.redPoint').hide().text(0); // 隐藏小红点
    
    
    var targetId=$(this).children('.userId').val(); //targetId

    global_targetId =targetId;
    global_targetName = $(this).children('.itemInfo').children('.peopelName').text(); //name
    global_headPortrait = $(this).children('.headPortrait').children('img').attr("src");//头像
    conversationType =RongIMLib.ConversationType.PRIVATE;
    var timeStrap= Date.parse(new Date());//首次获取历史记录
    setConversation(conversationType,global_targetId,global_targetName,global_headPortrait,timeStrap);
    //----清空未读消息 
    RongIMClient.getInstance().clearUnreadCount(conversationType,global_targetId,{
        onSuccess:function(){
            console.log("清除未读数成功");
        },
        onError:function(error){
            console.log("清除未读数失败");
           
        }
    });
    
});

/*-------------------------------------讨论组----------------------------------------------*/
/*--------创建同事会话的通讯人员数据加载、显示、关闭------*/
var firstLoadSign=true; //第一次点击请求数据、之后只进行显示窗口
$("#createDiscussion").on("click",function () {
    
    if(firstLoadSign){
        /*-----ajax-请求 获取人员列表 、部门树----*/
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

        function loadDiscussionItemList(selector, dataList) {
            for(var i=0;i<dataList.length;i++) {
                var headPortraitDiv = '<div class="headPortrait"><img src="' + dataList[i].portraitUri + '"></div>';
                var peopleInfoDiv = '<div class="itemInfo" style="width: 75%"><span class="peopleName">' + dataList[i].name + '</span><br><span class="peopleOrg">'+ dataList[i].departmentName + '</span></div>';
                var tokenInput = '<input type="hidden" class="userId" value="'+ dataList[i].userId +'"/>';
                var conversationCheckbox= '<input type="checkbox" class="conversationCheckbox" id="'+dataList[i].userId+'conversationCheckbox"/>';
                var typeInput = '<input type="hidden" class="userType" value="'+ dataList[i].type +'"/>';
                var liItem =conversationCheckbox+'<label for="'+dataList[i].userId+'conversationCheckbox">'+ headPortraitDiv + peopleInfoDiv + tokenInput+ typeInput +'</label>';
                selector.append('<li>' + liItem + '</li>');
            }
        }
        
        var $conversation_addressBookListItemsUl = $('#conversation_addressBookListItems ul');
        loadDiscussionItemList($conversation_addressBookListItemsUl, peopleList);
        
        $("#conversationModal").show(1000);
        firstLoadSign=false;
    }else{
        $("#conversationModal").show(1000)
    }
    
})

$("#close-reveal-modal").on("click",function () {
    $("#conversationModal").fadeOut(1000)
})

/*-----------创建同事会话 “添加人员”事件监听--将选中的人员 添加到下方的“已选人员区域”-------- */

$('#conversation_addressBookListItems ul').on("click","li label",function () {
    var selectedTargetId_conversation=$(this).attr("for");
    var selectedTargetId=selectedTargetId_conversation.split('conversationCheckbox')[0];
    var selectedHeadPortrait=$(this).children('.headPortrait img').attr('src');
    var selectedName=$(this).children('.itemInfo').children('.peopleName').text();
    if($(this).prev().is(':checked')){ //如果已选中 则该点击是执行取消操作，需要将下面已选中区域对应的条目删掉
       $("#"+selectedTargetId+"selectedTag").remove();
    }else{
        var selectedTag='<span class="selectedTag" id="'+selectedTargetId+'selectedTag">'+
            '<span class="selectedTag-name">'+selectedName+'</span>'+
            '<label for="'+selectedTargetId_conversation+'" class="selectedTag-close">&#215;</label>'+
            '<input type="hidden" class="selectedTag-id" value="'+selectedTargetId+'" />'+
            '<input type="hidden" class="selectedTag-headPortrait" value="'+selectedHeadPortrait+'" />'+
            '</span>'
        $("#conversation_selected_edit").append(selectedTag);
    }

    
})
/*----------“已选人员区域”--删除已选人员监听-----------*/
$("#conversation_selected_edit").on("click",".selectedTag-close",function () {
    /*---同时将上面选择区域的checkbox 状态恢复---*/
    var selectedTag_id=$(this).next().val();
    console.log(selectedTag_id);
   
    
    $(this).parent().remove();
})


