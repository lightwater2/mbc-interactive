var ImCommon = {
    NewsPlayArray: {},
    NewsPlayPart1: {},
    NewsPlayPart2: {},
    showOldType: "",
    adRelayshowCount: 0,
    PlayerArticleName: "article_video_newsplayer",

    GetLoginFlag: function () {
        return ImUtil.IsNull(CookieUtil.GetCookie(MN_USR_NO)) ? false : true;
    },

    GetLoginID: function () {
        return ImUtil.IsNull(CookieUtil.GetCookie(MN_USR_NO)) ? "" : CookieUtil.GetCookie(MN_USR_NO);
    },

    GetLoginType: function () {
        return ImUtil.IsNull(CookieUtil.GetCookie(MN_USR_TYPE)) ? "" : CookieUtil.GetCookie(MN_USR_TYPE);
    },

    GetLoginPic: function () {
        return ImUtil.IsNull(CookieUtil.GetCookie(MN_USR_PIC)) ? "" : CookieUtil.GetCookie(MN_USR_PIC);
    },

    GetLoginNickNm: function () {
        if (ImUtil.IsNull(CookieUtil.GetCookie(MN_USR_NICK_NM))) return "";
        var nickNm = escape(CookieUtil.GetCookie(MN_USR_NICK_NM));
		nickNm = decodeURIComponent(nickNm).replace(/\+/g, " ");
		return nickNm.substring(0,1) + nickNm.substring(1,nickNm.length).replace(/./g, '*')
        //return decodeURIComponent(nickNm).replace(/\+/g, " ");
    },

    GetCategory: function () {
        var curUrl = location.href.replace("/article", "");
        var szUrl = curUrl.split('/');
        var sCategory = szUrl[szUrl.length - 2];

        if ($.isNumeric(sCategory) && parseInt(sCategory) > 1900 && sCategory != "2580") sCategory = szUrl[szUrl.length - 3];
        return sCategory;
        //        var calUrl = curUrl.substring(0, curUrl.lastIndexOf('/') + 1) 
    },
    GetCategoryUrl: function (u) {
        var curUrl = u.replace("/article", "");
        var szUrl = curUrl.split('/');
        var sCategory = szUrl[szUrl.length - 2];

        if ($.isNumeric(sCategory) && parseInt(sCategory) > 1900 && sCategory != "2580") sCategory = szUrl[szUrl.length - 3];
        return sCategory;
        //        var calUrl = curUrl.substring(0, curUrl.lastIndexOf('/') + 1) 
    },
    SetLastCategory: function (sType) {
        var curUrl = location.href.replace("/article", "");
        var szUrl = curUrl.split('/');
        if ($.inArray(szUrl[3], szSaveDir) != -1) {
            CookieUtil.SetCookie(MN_USR_LAST, ImCommon.GetCategory(), 30, '/', window.location.hostname);
            if (sType == "L") {
                var n = ((bHybridAndroid || bHybridiOS) ? 1 : '');
                CookieUtil.SetCookie(MN_SWIPE, ImCommon.GetCategory(), n, '/', window.location.hostname);
            }
        }
    },
    GetUserInfo: function (usr_type) {
        var iconNm;
        var altText;
        var iconNmFb = "facebook";
        var iconNmTw = "twitter";
        var iconNmKa = "kakao";
        var iconNmNa = "naver";
        var iconNmGp = "google";
        var iconNmIm = "mbc";
        var iconNmAp = "apple";
        //    var 
        switch (usr_type) {
            case "FB":
                iconNm = iconNmFb;
                altText = "페이스북 계정";
                break;
            case "TW":
                iconNm = iconNmTw;
                altText = "트위터 계정";
                break;
            case "KA":
                iconNm = iconNmKa;
                altText = "카카오 계정";
                break;
            case "NA":
                iconNm = iconNmNa;
                altText = "네이버 계정";
                break;
            case "GO":
                iconNm = iconNmGp;
                altText = "구글 계정";
                break;
            case "IM":
                iconNm = iconNmIm;
                altText = "MBC 계정";
                break;
            case "AP":
                iconNm = iconNmAp;
                altText = "APPLE 계정";
                break;
        }
        return [iconNm, altText];
    },
    GoLogin: function (url) {
        if (bHybridAndroid || bHybridiOS) {
            CookieUtil.SetCookie(IMNEWS_URL, location.href, 1, '/', 'imbc.com');
            if (bHybridAndroid) {
                window.IMNewsApp.setLogin(true);
            }
            else if (bHybridiOS) {
                var msg = { 'setLogin': true }
                window.webkit.messageHandlers.IMNewsApp.postMessage(msg);
            }
        }
        else {
            CookieUtil.SetCookie(IMNEWS_URL, location.href, '', '/', 'imbc.com');
        }
        //console.log("2:" + location.href);
        location.href = "/more/login/";
        //window.open('/more/login/', 'login');
    },
    //error이미지 설정
    SetErrorImage: function (obj) {
        obj.src = "//image.imnews.imbc.com/page/include/images/default.jpg";
    },
    GetArtListUrl: function (catId, published_time, sType, callback) {
        //카테고리를 지정할수 없는 경우(앱의 큐레이션 카드 등)
        if (catId.indexOf("/") > -1) {
            if (catId.indexOf("/keyword/") > -1) {
                return callback("/page/include/js/json/card_keywordnews.js");
            }
            else {
                return callback(catId.substring(0, catId.lastIndexOf("/")) + "/index.js");
            }
        }
        else {
            var dirData = szCategory[catId];
            var published_year = published_time.substring(0, 4);
            try {
                if (dirData[1] == "D") {
                    var calUrl = dirData[0].replace("@@YEAR@@", published_year) + "cal_data.js";
                    ImDataLink.GetJsonRequest(calUrl, function (jsonData) {
                        var findData = ImUtil.FilterData(jsonData.DateList, "Day", published_time);
                        var sUrl = "";
                        if (findData.length > 0) {
                            sUrl = jsonData.Link + findData[0].CurrentID + "_";
                            if (sType == "P") sUrl += jsonData.TempleteId + ".html";
                            else sUrl += jsonData.DataId + ".js";
                        }
                        return callback(sUrl);
                    });
                } else if (dirData[1] == "Y") {
                    var sUrl = "";
                    if (dirData[0].indexOf("@@YEAR@@") > 0) {
                        sUrl = dirData[0].replace("@@YEAR@@", published_year) + "index";
                    }
                    else {
                        sUrl = dirData[0] + published_year;
                    }
                    if (sType == "P") sUrl += ".html";
                    else sUrl += ".js";
                    return callback(sUrl);
                } else {
                    var sUrl = dirData[0] + "index";
                    if (sType == "P") sUrl += ".html";
                    else sUrl += ".js";
                    return callback(sUrl);
                }
            } catch (e) { callback(""); }
        }
    },
    JumpToPage: function (part, year, month, day) {
        var vodUrl = "";
        //var sDate = ImUtil.FormatDate(year, month, day);
        ImCommon.GetArtListUrl(part, year + month + day + "", "P", function (pageUrl) {

            if (pageUrl == "" || pageUrl == "undefined") {
                alert("해당 일자의 기사가 존재하지 않습니다.");
                return;
            } else {
                location.href = pageUrl;
            }
        })
    },
    GetArtList: function (published_time, catId, artId, callback) {
        ImCommon.GetArtListUrl(catId, published_time, "J", function (jsUrl) {
            if (jsUrl == "" || jsUrl == "undefined") return callback([]);
            //console.log(jsUrl);
            ImDataLink.GetJsonRequest(jsUrl, function (jsonData) {
                if (jsonData.Data.length > 1) {
                    newsList = jsonData.Data[0].List.concat(jsonData.Data[1].List);
                    ImCommon.NewsPlayPart1 = jsonData.Data[0].List;
                    ImCommon.NewsPlayPart2 = jsonData.Data[1].List;
                }
                else
                    newsList = jsonData.Data[0].List;
                ImCommon.NewsPlayArray = newsList;
                return callback(newsList);
            });
        });
    },
    DisplayArtList: function (artId, showType) {
        //이미 그려졌으면 리턴
        if (showType == ImCommon.showOldType) {
            //alert("DisplayArtList-1")
            if ($(".vod_right .vod_list .s_slider ul").html().length > 100) { return; }
        }

        ImCommon.showOldType = showType;
        //중복 제거(다시보기만)
        var newsList = [];
        var locationUrl = "";
        try {
            locationUrl = opener.location.href;
            ImCommon.PlayerArticleName = ImCommon.PlayerArticleName;
        }
        catch (e) {
            locationUrl = location.href;
        }
        if (locationUrl.indexOf("/replay/") > 0) {
            if (showType == "P1")
                newsList = ImCommon.NewsPlayPart1;
            else if (showType == "P2")
                newsList = ImCommon.NewsPlayPart2;
            else
                newsList = ImCommon.NewsPlayArray;

            //newsList = ImUtil.RemoveDupDataObejct(newsList);
        }
        else { newsList = ImCommon.NewsPlayArray; }

        //alert("DisplayArtList-2 : " + newsList.length);

        var htmlVod = "";
        var artIdx = 0;
        var strtIdx = 0;
        var endIdx = newsList.length;

        var idx = 0;
        for (var i = strtIdx; i < endIdx; i++) {
            if (newsList[i].File.length == 0) continue;

            if (artId != "" && artId == newsList[i].AId) {
                artIdx = idx;
            }
            //첫번째일때 이미지 로딩이 안되는 경우가 종종 발생
            if (artIdx == 0 && idx < 10) {

                htmlVod += "<li onClick='ImCommon.ShowDetail(" + idx + ")' aid='" + newsList[i].AId + "'  link='" + newsList[i].Link + "' newsIdx='" + i + "'> " +
                    "<span class='img ico_vod' load='true'> <img src='" + newsList[i].Image + "' alt='" + ImUtil.RemoveTag(newsList[i].Title) + "' onerror='ImCommon.SetErrorImage(this);'></span> <div class='title'>" + newsList[i].Title + "</div>" +
                    "</li>";
            }
            else {
                htmlVod += "<li onClick='ImCommon.ShowDetail(" + idx + ")' aid='" + newsList[i].AId + "'  link='" + newsList[i].Link + "' newsIdx='" + i + "'> " +
                    "<span class='img ico_vod' load='false'></span> <div class='title'>" + newsList[i].Title + "</div>" +
                    "</li>";
            }
            idx++;
        }

        $(".vod_right .vod_list .s_slider ul").html(htmlVod);
        ImCommon.SetLoadImagePopupLayer(newsList);

        $(".layer_popup .vod_right .number").html("<span class='current'>" + artIdx + "</span> / <span class='all'>" + $(".vod_right .vod_list .s_slider ul").find("li").length + "</span>");
        $(".layer_popup .player").html("<div id='" + ImCommon.PlayerArticleName + "'></div>");
        if ($('html').hasClass('mobile')) {
            scrollX('.vod_list', 12, 'ul', 'li');
        }
        if (idx > 0) {
            if ($('html').hasClass('mobile')) {
                $(".vod_right .vod_list .s_slider").scrollLeft($(".vod_right .vod_list .s_slider ul li").outerWidth(true) * artIdx);
            }
            else {
                $(".vod_right .vod_list .s_slider ul").scrollTop($(".vod_right .vod_list .s_slider ul li").outerHeight(true) * artIdx);
            }
            ImCommon.ShowDetail(artIdx);
        }

        if (play_relay == "Y") {
            $('.layer_popup .btn_repeat').addClass("on");
            ImCommon.SetPlayerContinuous("Y");
        };

    },
    SetLoadImagePopupLayer: function (newsList) {
        $(".vod_right .vod_list .s_slider ul").scroll(function () {
            var objVod = $(this);
            var docViewTop = objVod.scrollTop();

            var docViewBottom = docViewTop + objVod.height();
            var docHeight = $(".vod_right .vod_list .s_slider ul li").outerHeight(true);

            var strtIdx = Math.floor(docViewTop / docHeight)
            var endIdx = strtIdx + Math.ceil((docViewBottom - docViewTop) / docHeight)

            for (var i = strtIdx; i < endIdx; i++) {
                if (objVod.find("li:eq(" + i + ") span").attr("load") == "false") {
                    var newsIdx = parseInt(objVod.find("li:eq(" + i + ")").attr("newsIdx"), 10);

                    objVod.find("li:eq(" + i + ") span").html("<img src='" + newsList[newsIdx].Image + "' alt='" + ImUtil.RemoveTag(newsList[newsIdx].Title) + "' onerror='ImCommon.SetErrorImage(this);'>");
                    objVod.find("li:eq(" + i + ") span").attr("load", "true");
                }
            }
        });

        $(".vod_right .vod_list .s_slider").scroll(function () {
            var objVod = $(this);
            var docViewLeft = objVod.scrollLeft();

            var docViewRight = docViewLeft + objVod.width();
            var docWidth = $(".vod_right .vod_list .s_slider ul li").outerWidth(true);

            var strtIdx = Math.floor(docViewLeft / docWidth)
            var endIdx = strtIdx + Math.ceil((docViewRight - docViewLeft) / docWidth)

            for (var i = strtIdx; i < endIdx; i++) {
                if (objVod.find("li:eq(" + i + ") span").attr("load") == "false") {
                    var newsIdx = parseInt(objVod.find("li:eq(" + i + ")").attr("newsIdx"), 10);

                    objVod.find("li:eq(" + i + ") span").html("<img src='" + newsList[newsIdx].Image + "' alt='" + ImUtil.RemoveTag(newsList[newsIdx].Title) + "' onerror='ImCommon.SetErrorImage(this);'>");
                    objVod.find("li:eq(" + i + ") span").attr("load", "true");
                }
            }
        });
    },
    SetPlayerContinuous: function (s) {
        try {
            for (var i = 0; i < playerlist.length; i++) {
                playerlist[i].setContinuous(s);
            }
        }
        catch (e) { }

    },
    ShowDetail: function (i) {
        var obj = $(".vod_right .vod_list .s_slider ul li:eq(" + i + ")");

        $(".vod_right .vod_list .s_slider ul li").removeClass("on");
        $(".vod_right .vod_list .s_slider ul li:eq(" + i + ")").addClass("on");

        $(".vod_right .vod_list .s_slider ul li span").addClass("ico_vod");
        $(".vod_right .vod_list .s_slider ul li:eq(" + i + ")  span").removeClass("ico_vod");


        $(".layer_popup .vod_right .number .current").text((i + 1));

        //$(".player").html("<img src='" + obj.find("img").attr("src") + "' alt='" + obj.find("img").attr("alt") + "' onerror='ImCommon.SetErrorImage(this);' width=800>");
        var newsIdx = parseInt(obj.attr("newsIdx"), 10);

        if (ImCommon.showOldType == "P2") {
            newsIdx += ImCommon.NewsPlayPart1.length;
        }

        var nextNews = Object();
        if ((i + 1) < $(".vod_right .vod_list .s_slider ul li").length) {
            var nextIdx = parseInt($(".vod_right .vod_list .s_slider ul li:eq(" + (i + 1) + ")").attr("newsIdx"), 10); //newsIdx;
            //console.log("nextIdx:" + nextIdx);

            nextNews.link = ImCommon.NewsPlayArray[nextIdx].Link;
            nextNews.image = ImCommon.NewsPlayArray[nextIdx].Image;
            nextNews.title = ImCommon.NewsPlayArray[nextIdx].Title;
            nextNews.desc = ImCommon.NewsPlayArray[nextIdx].Description;
        }

        ImCommon.ShowPlayer(ImCommon.NewsPlayArray[newsIdx], nextNews);

        $(".vod_title").text(obj.find(".title").text());
        $(".link_detail").attr("href", obj.attr("link"));
        $(".link_detail").attr({ "target": "_blank" })
        if (ImCommon.NewsPlayArray[newsIdx].StartDate != undefined) {
            $(".vod_left .vod_info .news_date").text(ImCommon.NewsPlayArray[newsIdx].StartDate.substring(0, 10) + " (" + ImUtil.GetWeek(ImCommon.NewsPlayArray[newsIdx].StartDate.substring(0, 10)) + ")");
        }

        var params = { "ArtId": obj.attr("aid"), "Page": 1, "PageSize": 1, "OrderType": 1 };
        ImDataLink.GetCmtList(params, function (jsonData) {
            $(".ico_comment").text(jsonData.TotalCnt);
            $(".ico_comment").attr("href", obj.attr("link") + "#commentBox");
            $(".ico_comment").attr({ "target": "_blank" })
        });
    },
    ShowPlayer: function (o, nextNews) {
        var thisMovie = new Object();

        thisMovie.aid = "P_" + o.AId;
        thisMovie.id = ImCommon.PlayerArticleName;
        thisMovie.file = ChangeWowzaplayInfo(o.File);
        thisMovie.image = o.Image;
        thisMovie.link = o.Link;
        thisMovie.caption = o.Tracks[0].File;

        var videoStartTime = o.StartTime;
        var videoEndTime = o.Endtime;
        var videoDuringTime = "";
        if (programCode == "M10_DPAQLR" || programCode == "M10_14DPVM") {
            videoDuringTime = 75;
        }
        else {
            videoDuringTime = Math.floor((videoEndTime - videoStartTime) * 0.001);
        }
        var bAd = true;
        var adObj = new Object();

        //연속 재생의 광고 제어
        if (play_relay == "Y") {
            if (ad_relayshow == "N") {
                bAd = false;
            }
            else if (ad_relayshow == "F" && ImCommon.adRelayshowCount > 0) {
                bAd = false;
            }
            else if ($.isNumeric(ad_relayshow)) {
                if (ImCommon.adRelayshowCount > 0 && (ImCommon.adRelayshowCount % parseInt(ad_relayshow, 10)) != 0) {
                    bAd = false;
                }
            }

            ImCommon.adRelayshowCount++;
        }

        adObj.programid = programCode;

        adObj.clipid = "P_" + o.AId;
        adObj.vodtype = 'C';
        adObj.playtime = videoDuringTime;
        adObj.gender = "";
        adObj.age = "";
        adObj.contentnumber = "";
        adObj.broaddate = "";
        adObj.starttime = "";
        adObj.endtime = "";
        adObj.adpercent = (bAd ? ad_percent : 0);
        adObj.autoplay = ad_autoplay;
        adObj.geoblock = o.GeoYN;

        if (o.geoblock == "Y" || o.geoblock == "T") {
            if (ImCommon.CheckGeoIP() != "KR") {
                adObj.geoblock = "Y";
            }
            else {
                adObj.geoblock = "N";
            }
        }

        ImCommon.StopPlayer();
        if (bHybridAndroid || bHybridiOS) { nextNews = null; }

        if ($("#" + thisMovie.id).html().length == 0) {
            newsPlayer(thisMovie, adObj, nextNews, "VOD");
        }
        else {
            for (var i = 0; i < playerlist.length; i++) {
                if (playerlist[i].div == thisMovie.id) {
                    playerlist[i].changeNews(thisMovie, adObj, nextNews, true);
                    playerlist[i].setContinuous(play_relay);
                    break;
                }
            }
        }
    },
    CheckGeoIP: function () {
        var geoIP = "KR";
        ImDataLink.GetGeoIP(function (jsonData) {
            geoIP = jsonData.Country;
			if(geoIP != "KR"){
				try{
					 for (var i = 0; i < playerlist.length; i++) {
							 playerlist[i].stopVod();
							 playerlist[i].player.showGeoblock();
							 setTimeout(() => {
								document.getElementById(playerlist[i].player.parent.id).remove();
							 }, 30000);
					 }
				}
				catch(e){
					alert(e);
				}				
			}			
        });
        return geoIP;
    },
    StopPlayer: function () {
        for (var i = 0; i < playerlist.length; i++) {
            playerlist[i].stopVod();
        }
    },
    ShowHeadlineNews: function () {
        ImDataLink.GetHeadlineNews(function (jsonData) {
            var sHtml = '';
            var idx = 0;
            for (var i = 0; i < jsonData.Data.length; i++) {
                sHtml += "<li class='item'>" +
                    "<a href='" + jsonData.Data[i].Link + "'>" +
                    "    <span class='txt_w'><span class='tit'>" + jsonData.Data[i].Title + "</span></span>" +
                    "    <span class='img " + (jsonData.Data[i].IsVod == "Y" ? " ico_vod" : "") + "'><img class='lazyloaded' src='//image.imnews.imbc.com/page/include/images/default.jpg' data-src='" + jsonData.Data[i].Image + "' alt='" + ImUtil.RemoveTag(jsonData.Data[i].Title) + "' onerror='ImCommon.SetErrorImage(this);'></span>" +
                    "                    </a>" +
                    "                </li>";

                if (((i + 1) % 5) == 0) {
                    $(".news_list .list_thumb_r:eq(" + idx + ")").html(sHtml);
                    sHtml = "";
                    idx++;
                }
                if (i > 9) break;
            }
        });
        $(".news_list").find("h3").html("이 시각 주요 뉴스");
        $(".recom").find("h3").html("당신이 관심 가질 뉴스");

    },
    VodTab: function (opt) {
        var sNewsType = ImCommon.GetMobiusType("rank_type");

        var className = (opt == "ONAIR" ? ".s_hits ul" : ".tabs ul");
        $(className).html("<li id='im'><span>MBC</span></li>" +
            "<li id='pt'><span>포털</span></li >" +
            "<li id='vod'><span>유튜브</span></li>");

        ImDataLink.GetRankNews(sNewsType, function (jsonData) {
            $(className + ' #' + sNewsType).addClass("on");
            ImCommon.DisplayVodTab(jsonData);

        });

        $(className + " li").click(function () {
            var index = $(className + " li").index(this);
            ImDataLink.GetRankNews($(this).attr("id"), function (jsonData) {
                ImCommon.DisplayVodTab(jsonData);
            });
            $(this).siblings().removeClass("on");
            $(this).addClass("on");
        });
    },
    DisplayVodTab: function (jsonData) {
        var sHtml = '';
        for (var i = 0; i < jsonData.Data.length; i++) {
            if (i > 9) break;
            sHtml += "<li class='item'>" +
                "<a href='" + jsonData.Data[i].Link + "' >" +
                "<strong class='tit_w'>" +
                "   <span class='num'>" + (i + 1) + "</span>" +
                "   <span class='tit ellipsis'>" + jsonData.Data[i].Title + "</span>" +
                "</strong>";
            if (i == 0) {
                sHtml += "    <span class='sum_w'>" +
                    "        <span class='img" + (jsonData.Data[i].IsVod == "Y" ? " ico_vod" : "") + "'><img src='" + jsonData.Data[i].Image + "' alt='" + ImUtil.RemoveTag(jsonData.Data[i].Title) + "'  onerror='ImCommon.SetErrorImage(this);' /></span>" +
                    "        <span class='sum'><span class='ellipsis3'>" + jsonData.Data[i].Title + "</span></span>" +
                    "    </span>" +
                    " </a>";
            }
            sHtml += "</li >";
        }
        $(".hits_list .wrapper").html(sHtml);
    },
    ShowMobius: function () {
        ImDataLink.GetMobiusNewest(function (jsonData) {
            var sHtml = ' ';
            var idx = 0;
            for (var i = 0; i < jsonData.Data.length; i++) {
                sHtml += "<li><a href='" + jsonData.Data[i].Link + "'>" + jsonData.Data[i].Title + "</a></li>";
                if (((i + 1) % 5) == 0) {
                    $(".recom ul:eq(" + idx + ")").html(sHtml);
                    sHtml = "";
                    idx++;
                }
                if (i > 14) break;
            }
        });
    },
    ShowViewAd: function () {
        ImDataLink.GetViewAd(function (jsonData) {
            for (var i = 0; i < jsonData.Data.length; i++) {
                var sHtml = "<a href='" + jsonData.Data[i].Link + "' target='_blank'><img src='" + jsonData.Data[i].Image + "' alt='" + ImUtil.RemoveTag(jsonData.Data[i].Title) + "'  ></a>";

                if (jsonData.Data[i].CategoryID == "PC")
                    $(".n_banner").html(sHtml);
                else if (jsonData.Data[i].CategoryID == "MOBILE") {
                    $(".wrap_view .section.s_ad").html(sHtml);
                }
            }
        });
        if ($('html').hasClass('mobile')) {
            ImDataLink.GetIssue(function (newsList) {
                var newsData = newsList.Data[0];
                var sHtml = "<div class='issue_list'><ul class='list_banner'><li class='item' > " +
                    "<a href='" + newsData.Link + "' >" +
                    "    <img src='" + newsData.MobileImage + "' alt='" + ImUtil.RemoveTag(newsData.Title) + "' onerror='ImCommon.SetErrorImage(this);' class='issue_img_m' />";
                if (newsData.IsDesc == "Y") {
                    sHtml = sHtml + "<span class='txt'>" +
                        "        <span class='top_inner'>" +
                        "            <span class='category ellipsis'>" + newsData.KeyWord + "</span>" +
                        "            <span class='title ellipsis'>" + newsData.Title + "</span>" +
                        "        </span>";
                    "   </span>";
                }
                sHtml = sHtml + "</a>" +
                    "</li>";
                //var sHtml = "<a href='" + newsList.Data[i].Link + "' target='_blank'><img src='" + newsList.Data[i].MobileImage + "' alt='" + newsList.Data[i].Title + "' ></a>";
                $(".wrap_view .wrap_aside .section.s_ad").html(sHtml);
            });
        }
    },
    CheckLogin: function (sType) {
        if (!ImCommon.GetLoginFlag()) {
            var sMsg = "";
            if (sType == "B")
                sMsg = "MY PICK 등록은 ";
            else
                sMsg = "댓글/답글 입력은 ";
            if (ImMessage.ShowMessage(ImMessage.LOGIN_CHECK, [sMsg], "C")) {
                ImCommon.GoLogin();
                return;
            }
        }
    },
    SettingAdInfo: function (catId) {
        var data = $(szAdCode).filter(function (index) {
            return szAdCode[index][0] == catId;
        });
        if (data.length > 0) {
            programCode = data[0][1];
            ad_percent = data[0][2];
            ad_autoplay = data[0][3];
            play_relay = data[0][4];
            dable_show = data[0][5];
            ad_relayshow = data[0][6];
        }
    },
    ShowRankKeyword: function (keyword) {
        ImDataLink.GetRankKeyword(function (jsonData) {
            var sHtml = "";
            for (var i = 0; i < jsonData.Data.length; i++) {
                sHtml += "<li><a href='" + SERVER_DOMAIN + "/more/search/?search_kwd=" + encodeURIComponent(jsonData.Data[i].Title) + "'>#" + jsonData.Data[i].Title + "</a></li>";
            }
            $(".keyword").html("<ul>" + sHtml + "</ul>");

            ImCommon.ShowKeywordNews(keyword);
        });
    },
    ShowKeywordNews: function (keyword) {
        if (keyword == "") keyword = $(".keyword").find("li:eq(0)").text().replace(/#/g, '');
        if (!ImUtil.IsNull(CookieUtil.GetCookie(MN_USR_WORD)))
            keyword = CookieUtil.GetCookie(MN_USR_WORD);

        $(".bottom_roll .news_related h3 strong").text("'" + keyword + "'");
        var param = { "query": keyword, "page": 1, "pagesize": 6, "sorttype": "date" };
        ImDataLink.GetSearch(param, function (jsonData) {

            var sHtml = " ";
            try {
                var newsList = jsonData.result.rows;
                for (var i = 0; i < newsList.length; i++) {
                    sHtml += "<li class='item'>" +
                        "<a href='" + newsList[i].fields["linkurl"] + "'><span class='img " + (!ImUtil.IsNull(newsList[i].fields["mov_url"]) ? " ico_vod" : "") + "'><img src='" + newsList[i].fields["adf_bimg01"] + "'  alt='" + ImUtil.RemoveTag(newsList[i].fields["artsubject"]) + "'   onerror='ImCommon.SetErrorImage(this)'></span>" +
                        "<span class='txt_w'><span class='txt ellipsis2'>" + newsList[i].fields["artsubject"] + "</span></span></a > " +
                        "</li>";
                }

            }
            catch (e) { }
            if (sHtml == " ") {
                ImDataLink.GetCardKeywordNews(function (jsonData) {
                    var newsList = jsonData.Data[0].List;
                    $(".news_related strong").text("'" + jsonData.Data[0].Title + "'");
                    for (var i = 0; i < newsList.length; i++) {
                        sHtml += "<li class='item'>" +
                            "<a href='" + newsList[i].Link + "'><span class='img " + (!ImUtil.IsNull(newsList[i].IsVod == "Y") ? " ico_vod" : "") + "'><img src='" + newsList[i].Image + "'  alt='" + ImUtil.RemoveTag(newsList[i].Title) + "'   onerror='ImCommon.SetErrorImage(this)'></span>" +
                            "<span class='txt_w'><span class='txt ellipsis2'>" + newsList[i].Title + "</span></span></a > " +
                            "</li>";
                        if (i >= 5) { break; }
                    }
                });
            }

            $('.news_related .s_slider .thumb_type').html(sHtml);
            scrollX('.wrap_pan .news_related', 10, 'ul', 'li');
        });

    },
    ShowZoomin: function () {
        ImDataLink.GetZoomin(function (jsonData) {
            var sThum = "";
            if (jsonData.Data.length == 0) return;
            for (var i = 0; i < 4; i++) {
                if (i >= jsonData.Data.length) break;

                sThum += "<li>" +
                    "<a href='" + jsonData.Data[i].Link + "'>" +
                    "    <span class='img " + (jsonData.Data[i].IsVod == "Y" ? " ico_vod" : "") + "'><img class='lazyloaded' src='//image.imnews.imbc.com/page/include/images/default.jpg' data-src='" + jsonData.Data[i].Image + "' alt='" + ImUtil.RemoveTag(jsonData.Data[i].Title) + "'   onerror='ImCommon.SetErrorImage(this)'></span>" +
                    "        <span class='title ellipsis2'>" + jsonData.Data[i].Title + "</span>" +
                    "                            </a>" +
                    "                        </li >";
            }
            var idx = 0;
            var sHtml = "";
            for (var i = 4; i < jsonData.Data.length; i++) {
                if (i >= jsonData.Data.length) break;
                sHtml += "<li class='ellipsis'><a href='" + jsonData.Data[i].Link + "'>" + jsonData.Data[i].Title + "</a></li>";
                if (i > 4 && ((i + 2) % 5) == 0) {
                    $(".news_plus .list_hori ul:eq(" + idx + ")").html(sHtml);
                    sHtml = "";
                    idx++;
                }
                if (i > 13) break;
            }
            $(".news_plus .wrap_plus .thumbnail").html(sThum);
        });
    },
    ShowMbig: function () {
        ImDataLink.GetMbig(function (jsonData) {
            var sHtml = "";
            for (var i = 0; i < jsonData.Data.length; i++) {
                sHtml += " <li class='item'>" +
                    "<a href='" + jsonData.Data[i].Link + "' >" +
                    "    <span class='txt_w'><span class='tit'>" + jsonData.Data[i].Title.replace("[엠빅뉴스]", "") + "</span></span>" +
                    "    <span class='img " + (jsonData.Data[i].IsVod == "Y" ? " ico_vod" : "") + "'><img class='lazyloaded' src='//image.imnews.imbc.com/page/include/images/default.jpg' data-src='" + jsonData.Data[i].Image + "' alt='" + ImUtil.RemoveTag(jsonData.Data[i].Title) + "'   onerror='ImCommon.SetErrorImage(this)'></span>" +
                    "                            </a>" +
                    "                        </li >";
                if (i >= 3) break;
            }
            $(".wrap_mbig .thumb_type").html(sHtml);
            $(".wrap_mbig").find("h3").text("엠빅뉴스");
        });
    },
    Show14Floor: function () {
        ImDataLink.Get14Floor(function (jsonData) {
            var sHtml = " ";
            for (var i = 0; i < jsonData.Data.length; i++) {
                sHtml += " <li class='item'>" +
                    "<a href='" + jsonData.Data[i].Link + "' >" +
                    "    <span class='img " + (jsonData.Data[i].IsVod == "Y" ? " ico_vod" : "") + "'><img class='lazyloaded' src='//image.imnews.imbc.com/page/include/images/default.jpg' data-src='" + jsonData.Data[i].Image + "' alt='" + ImUtil.RemoveTag(jsonData.Data[i].Title) + "'  onerror='ImCommon.SetErrorImage(this);'></span>" +
                    "    <span class='txt_w'><span class='txt ellipsis2'>" + jsonData.Data[i].Title.replace("[14F]", "") + "</span></span>" +
                    "                            </a>" +
                    "                        </li >";
                if (i > 4) break;
            }
            $(".14f .thumb_type").html(sHtml);
            scrollX('.wrap_pan .14f', 10, 'ul', 'li');
        });
    },
    GetMobiusType: function (key) {
        var def_mobisTypes = { "pan_slide": 2, "rank_type": "im", "newest_type": "mobius_newest_typeC" };

        if (!ImUtil.IsNull(CookieUtil.GetCookie(MN_USR_INFO))) {
            var mobiusTypes = szMobius[CookieUtil.GetCookie(MN_USR_INFO)];
            if (mobiusTypes == null) {
                return def_mobisTypes[key];
            }
            else {
                return mobiusTypes[key];
            }
        }

        return def_mobisTypes[key];
    },
    VideoComplete: function () {
        //console.log("VideoComplete:" + play_relay);
        if (!$(".layer_popup").is(":visible")) { return false; }
        if (play_relay == "Y") {
            var curIdx = $(".vod_right .vod_list .s_slider ul li").index($(".vod_right .vod_list .s_slider ul li.on"));
            if (curIdx == $(".vod_right .vod_list .s_slider ul li").length - 1) {
                ImCommon.ShowDetail(0);
                if ($('html').hasClass('mobile'))
                    $(".vod_right .vod_list .s_slider").scrollLeft(0);
                else
                    $(".vod_right .vod_list .s_slider ul").scrollTop(0);
            }
            else {
                curIdx++;
                ImCommon.ShowDetail(curIdx);
                if ($('html').hasClass('mobile'))
                    $(".vod_right .vod_list .s_slider").scrollLeft($(".vod_right .vod_list .s_slider ul li").outerWidth(true) * curIdx);
                else
                    $(".vod_right .vod_list .s_slider ul").scrollTop($(".vod_right .vod_list .s_slider ul li").outerHeight(true) * curIdx);
            }
        }
    },
    SetRightGoogleAD: function () {
        //modified by changhyun83.kim@mbc.co.kr 2020.07.17
		//modified by pindow@mbc.co.kr 2022.02.18 - 인라이플, 애드센스 분기처리

		// 타 카테고리와 연예뉴스 분기처리
		var thisUrl = window.location.href;

		if(thisUrl.indexOf('enter') < 0){
			// 타 카테고리일 경우
            // enliple 1 and adsense
            $.getScript('//www.mediacategory.com/servlet/passbackWebServlet?s=545293', function () {
                //console.log('ad_data.ad_exist = ' + ad_data.ad_exist);
                var adscript1_enliple = "";
                if (ad_data.ad_exist === true) {
                    adscript1_enliple = "<div id='mobonDivBanner_545293'><iframe name='ifrad' id='mobonIframe_545293' src='//www.mediacategory.com/servlet/adBanner?from="
                        + escape(document.referrer)
                        + "&s=545293&igb=102&iwh=336_280&cntad=1&cntsr=1' frameborder='0' scrolling='no' style='height:280px; width:336px;'></iframe></div>";
                    $(".ad_banner").eq(0).html(adscript1_enliple);
                } else {
                    $(".ad_banner").eq(0).html('<ins class="adsbygoogle" style="display:inline-block;width:340px;height:250px" data-ad-client="ca-pub-2961722781524256" data-ad-slot="6245332628"></ins><script>adsbygoogle = window.adsbygoogle;(adsbygoogle || []).push({});</script>');
                }
            });

            // enliple 2 and adsense
            $.getScript('//www.mediacategory.com/servlet/passbackWebServlet?s=545302', function () {
                var adscript2_enliple = "";
                if (ad_data.ad_exist === true) {
                    adscript2_enliple = "<div id='mobonDivBanner_545302'><iframe name='ifrad' id='mobonIframe_545302' src='//www.mediacategory.com/servlet/adBanner?from="
                        + escape(document.referrer)
                        + "&s=545302&igb=102&iwh=336_280&cntad=1&cntsr=1' frameborder='0' scrolling='no' style='height:280px; width:336px;'></iframe></div>";
                    $(".ad_banner").eq(1).html(adscript2_enliple);
                } else {
                    $('.ad_banner').eq(1).html('<ins class="adsbygoogle" style="display:block" data-ad-client="ca-pub-2961722781524256" data-ad-slot="2665550690" data-ad-format="auto" data-full-width-responsive="true"></ins><script>(adsbygoogle = window.adsbygoogle || []).push({});</script>');
                }
            });
		} else {
			// 연예뉴스 카테고리일 경우
            // enliple 1 and adsense
            $.getScript('//www.mediacategory.com/servlet/passbackWebServlet?s=624648', function () {
                //console.log('ad_data.ad_exist = ' + ad_data.ad_exist);
                var adscript1_enliple = "";
                if (ad_data.ad_exist === true) {
                    adscript1_enliple = "<div id='mobonDivBanner_624648'><iframe name='ifrad' id='mobonIframe_624648' src='//www.mediacategory.com/servlet/adBanner?from="
                        + escape(document.referrer)
                        + "&s=624648&igb=102&iwh=336_280&cntad=1&cntsr=1' frameborder='0' scrolling='no' style='height:280px; width:336px;'></iframe></div>";
                    $(".ad_banner").eq(0).html(adscript1_enliple);
                } else {
                    $(".ad_banner").eq(0).html('<ins class="adsbygoogle" style="display:inline-block;width:340px;height:250px" data-ad-client="ca-pub-2961722781524256" data-ad-slot="9106175159"></ins><script>adsbygoogle = window.adsbygoogle;(adsbygoogle || []).push({});</script>');
                }
            });

            // enliple 2 and adsense
            $.getScript('//www.mediacategory.com/servlet/passbackWebServlet?s=624649', function () {
                var adscript2_enliple = "";
                if (ad_data.ad_exist === true) {
                    adscript2_enliple = "<div id='mobonDivBanner_624649'><iframe name='ifrad' id='mobonIframe_624649' src='//www.mediacategory.com/servlet/adBanner?from="
                        + escape(document.referrer)
                        + "&s=624649&igb=102&iwh=336_280&cntad=1&cntsr=1' frameborder='0' scrolling='no' style='height:280px; width:336px;'></iframe></div>";
                    $(".ad_banner").eq(1).html(adscript2_enliple);
                } else {
                    $('.ad_banner').eq(1).html('<ins class="adsbygoogle" style="display:block" data-ad-client="ca-pub-2961722781524256" data-ad-slot="9708293466" data-ad-format="auto" data-full-width-responsive="true"></ins><script>(adsbygoogle = window.adsbygoogle || []).push({});</script>');
                }
            });
		}
    },
    SetRightContent: function () {
        ImCommon.ShowHeadlineNews();
        ImCommon.VodTab();
        ImCommon.ShowMobius();
        ImCommon.ShowViewAd();
        ImCommon.SetRightGoogleAD();
    }
    /*2002 vote*/
    , CheckUserIdentity: function () {
        $.ajax({
            type: "get",
            url: "https://member.imbc.com/api/info/RetriveCertCheck.ashx?type=jsonp&opt=identity",
            contentType: "application/json",
            dataType: "jsonp",
            jsonpCallback: "callback",
            timeout: 10000,
            crossDomain: true,
            async: false,
            xhrFields: {
                withCredentials: true
            },
            success: function (o) {
                var szMsg = "";
                if (o.Info == "E") {
                    if (o.Message == "기본 정보 없음") {
                        szMsg = "로그인 후 이용해 주세요";
                    }
                    else {
                        szMsg = "「공직선거법」제82조의6(인터넷언론사 게시판·대화방 등의 실명확인)에 따라" +
                            " 제21대 국회의원 선거운동 기간 중 게시판, 댓글, 라이브톡 작성 시 실명 인증이 필요합니다. \n\n" +
                            "기간 : 4월 1일(수) 18:00 ~ 4월 15일(수) 09:00 ";
                    }
                    var r = encodeURIComponent(location.href);
                    if (confirm(szMsg)) {
                        location.href = "https://member.imbc.com/user/info/UserIdentity.aspx?TemplateID=main&rtnTarget=B&rtnURL=" + r;
                    }
                    ImCommon.CheckLoginTypeState = -1;
                }
                else {
                    ImCommon.CheckLoginTypeState = 1;
                }
            },
            error: function (request, status, error) {
            }
        });
    },
    /*2002 vote*/
    CheckLoginTypeState: 0,
    CheckLoginTypeInfo: function () {
        if (CookieUtil.GetCookie(MN_USR_TYPE) == "IM") {
            if (ImCommon.CheckLoginTypeState == 0) {
                ImCommon.CheckUserIdentity();
            }
            else if (ImCommon.CheckLoginTypeState == -1) {
                szMsg = "「공직선거법」제82조의6(인터넷언론사 게시판·대화방 등의 실명확인)에 따라" +
                    " 제21대 국회의원 선거운동 기간 중 게시판, 댓글, 라이브톡 작성 시 실명 인증이 필요합니다. \n\n" +
                    "기간 : 4월 1일(수) 18:00 ~ 4월 15일(수) 09:00 ";
                var r = encodeURIComponent(location.href);
                if (confirm(szMsg)) {
                    location.href = "https://member.imbc.com/user/info/UserIdentity.aspx?TemplateID=main&rtnTarget=B&rtnURL=" + r;
                }
            }
            return (ImCommon.CheckLoginTypeState == 1 ? true : false);
        }
        else {
            alert("회원님은 " + ImCommon.GetUserInfo(ImCommon.GetLoginType())[1].replace(" 계정", "") + " 아이디로 로그인하셨습니다. \n\n" +
                "「공직선거법」 제82조의6(인터넷언론사 게시판·대화방 등의 실명확인)에 따라 제21대 국회의원 선거운동 기간 중 게시판, 댓글, 라이브톡 작성 시 실명 인증이 완료된 MBC아이디로 로그인이 필요합니다.\n\n로그아웃 후 MBC아이디로 다시 로그인해 주십시오.\n\n" +
                "기간 : 4월 1일(수) 18:00 ~ 4월 15일(수) 09:00 ");
            return false;
        }
    }
}

// 사용자상수 정의
var NOW_YEAR = "2025";

var MN_USR_NO = "MN_USR_NO";
var MN_USR_TYPE = "MN_USR_TYPE";
var MN_BOOKMARK_CNT = "MN_BOOKMARK_CNT";
var MN_USR_PIC = "MN_USR_PIC";
var MN_USR_NICK_NM = "MN_USR_NICK_NM";

var MN_USR_INFO = "MN_USR_INFO";
var MN_USR_WORD = "MN_USR_WORD";
var MN_BOOKMARK_LAST = "MN_BOOKMARK_LAST";
var MN_BOOKMARK = "MN_BOOKMARK";
var MN_SWIPE = "MN_SWIPE";

var MN_USR_LAST = "MN_USR_LAST";
var MN_EMOTICON = "MN_EMOTICON";
var MN_FONT = "MN_FONT";
var MN_CMT_GODBAD = "MN_CMT_GODBAD";
var MN_CMT_BRD_GODBAD = "MN_CMT_BRD_GODBAD1";
var MN_CMT_BM_GODBAD = "MN_CMT_BM_GODBAD";
var IMNEWS_URL = "IMNEWS_URL";
var IMG_ICON = "http://image.imnews.imbc.com/images/2015/icon/";

var API_URL = "https://imnewsapi.imnews.imbc.com";
var SEARCH_URL = "//searchapi.imnews.imbc.com";
var VIEW_PREFIX = '';
var SERVER_DOMAIN = location.protocol + '//' + location.hostname + (location.port ? ':' + location.port : ''); //"https://testnews.imbc.com";

var sLoginUrl = "https://imnewsapi.imnews.imbc.com/Social/login";
var szSearchUrl = { "search.naver.com": "query", "search.daum.net": "q" };
var szKeyword = ["MBC뉴스", "뉴스데스크"];

var nDate = new Date();
var cYear = nDate.getFullYear();
var cMonth = ((nDate.getMonth() + 1) < 10 ? '0' : '') + (nDate.getMonth() + 1);
var cDay = (nDate.getDate() < 10 ? '0' : '') + nDate.getDate();
var cToday = '' + cYear + cMonth + cDay;

var cHour = (nDate.getHours() < 10 ? '0' : '') + nDate.getHours();
var cMiniute = (nDate.getMinutes() < 10 ? '0' : '') + nDate.getMinutes();
var cSeconds = (nDate.getSeconds() < 10 ? '0' : '') + nDate.getSeconds();
var cTime = '' + cHour + cMiniute + cSeconds;

//****************************************
//    플레이어 광고 코드, 퍼센트, 광고 자동 재생 여부, 연속 재생 여부, 데이블 광고 보이는 여부, 연속 재생시 광고 재생여부(N:안보임, Y:계속 보임, F:한번만 보임, 숫자:숫자만큼 보임)
//******************************************

var szAdCode = [
    ["nwdesk", "M10_T21103G", 100, "Y", "Y", "Y", "F"],
    ["nwtoday", "M10_T21223G", 100, "Y", "Y", "Y", "F"],
    ["nw1200", "M10_T21138G", 100, "Y", "Y", "Y", "F"],
    ["nw1400", "M10_T20073G", 100, "Y", "Y", "Y", "F"],
    ["nw930", "M10_T21212G", 100, "Y", "Y", "Y", "F"],
    ["nw1700", "M10_T20066G", 100, "Y", "Y", "Y", "F"],
	["nw2500", "M10_T20066G", 100, "Y", "Y", "Y", "F"],
    ["newsflash", "M10_XMRQH", 100, "Y", "Y", "Y", "Y"],
    ["straight", "M10_T20071G", 100, "Y", "Y", "Y", "Y"],
    ["100", "M10_T22155G", 100, "Y", "Y", "Y", "Y"],
    ["unity", "M10_T24101G", 100, "Y", "Y", "Y", "Y"],
    ["mbig", "M10_DPAQLR", 100, "Y", "Y", "Y", "Y"],
    ["14f", "M10_14DPVM", 100, "Y", "Y", "Y", "Y"],
    ["politics", "M10_politic", 100, "Y", "Y", "Y", "Y"],
    ["society", "M10_society", 100, "Y", "Y", "Y", "Y"],
    ["world", "M10_world", 100, "Y", "Y", "Y", "Y"],
    ["econo", "M10_econo", 100, "Y", "Y", "Y", "Y"],
    ["culture", "M10_culture", 100, "Y", "Y", "Y", "Y"],
    ["enter", "M10_enter", 100, "Y", "Y", "Y", "Y"],
    ["sports", "M10_sport", 100, "Y", "Y", "Y", "Y"]
];

var ad_percent = 100;
var ad_autoplay = "N";
var programCode = "M10_T00000G";
var play_relay = "Y";
var dable_show = "Y";
var ad_relayshow = "Y";

//****************************************
//   최신 카테고리 기사
//******************************************
var szSaveDir = ["replay", "newszoomin ", "original", "news"];

var szCategory = {
    "nwdesk": ["/replay/@@YEAR@@/nwdesk/", "D", 16, "뉴스데스크"],
    "nwtoday": ["/replay/@@YEAR@@/nwtoday/", "D", 16, "뉴스투데이"],
    "nw1200": ["/replay/@@YEAR@@/nw1200/", "D", 15, "12MBC뉴스"],
    "nw1400": ["/replay/@@YEAR@@/nw1400/", "D", 15, "뉴스외전"],
    "nw1500": ["/replay/@@YEAR@@/nw1500/", "D", 15, "뉴스M"],
    "nw930": ["/replay/@@YEAR@@/nw930/", "D", 15, "930MBC뉴스"],
    "nw1700": ["/replay/@@YEAR@@/nw1700/", "D", 15, "5시뉴스와경제"],
    "nw1800": ["/replay/@@YEAR@@/nw1800/", "D", 15, "이브닝뉴스"],
    "nwradio": ["/replay/nwradio/", "D", 15, "라디오뉴스"],
    "nwaudio": ["/replay/nwaudio/", "D", 15, "오디오뉴스"],
    "newsflash": ["/replay/newsflash/", "Y", 15, "뉴스특보"],
    "worldreport": ["/replay/worldreport/", "Y", 15, "월드리포트"],
    "nw2400": ["/replay/@@YEAR@@/nw2400/", "Y", 15, "뉴스24"],
	"nw2500": ["/replay/@@YEAR@@/nw2500/", "D", 15, "뉴스25"],

    "straight": ["/replay/straight/", "Y", 15, "스트레이트"],
    "100": ["/replay/100/", "Y", 15, "100분토론"],
    "2580": ["/replay/2580/", "Y", 15, "시사매거진"],
    "unity": ["/replay/unity/", "Y", 15, "통일전망대"],
    "mbig": ["/original/mbig/", "Y", 16, "엠빅뉴스"],
    "14f": ["/original/14f/", "Y", 16, "14F"],
    "todayfield": ["/original/todayfield/", "Y", 16, "Right Now"],
    "politics": ["/news/@@YEAR@@/politics/", "D", 15, "정치"],
    "society": ["/news/@@YEAR@@/society/", "D", 15, "사회"],
    "world": ["/news/@@YEAR@@/world/", "D", 15, "국제"],
    "econo": ["/news/@@YEAR@@/econo/", "D", 15, "경제"],
    "culture": ["/news/@@YEAR@@/culture/", "D", 15, "문화"],
	"enter": ["/news/@@YEAR@@/enter/", "D", 15, "iMBC 연예"],
    "sports": ["/news/@@YEAR@@/sports/", "D", 15, "스포츠"],
    "socialpick": ["/news/socialpick/2020/", "D", 15, "소셜픽"],
    "network": ["/news/network/", "Y", 15, "네트워크"],

    "groupnews": ["/newszoomin/groupnews/", "", 15, "탐사보도"],
    "newsinsight": ["/newszoomin/newsinsight/", "", 15, "심층"],
    "politicstime": ["/newszoomin/politicstime/", "", 15, "정치적참견시점"],
    "todaythisnw": ["/newszoomin/todaythisnw/", "", 15, "오늘 이 뉴스"],
    "worldnow": ["/newszoomin/worldnow/", "", 15, "World Now"],
    "seochom": ["/newszoomin/seochom/", "", 15, "서초동M본부"],
    "lmkeco": ["/newszoomin/lmkeco/", "", 15, "알려줘! 경제"],
    "detecm": ["/newszoomin/detecm/", "", 15, "탐정M"],
	"mpisode": ["/newszoomin/mpisode/", "", 15, "M피소드"],
    "pyhotline": ["/newszoomin/pyhotline/", "", 15, "평양 핫라인"],
    "factweight": ["/newszoomin/factweight/", "", 15, "팩트의 무게"],
    "ahplus": ["/newszoomin/ahplus/", "", 15, "재택플러스"],
    "turnedout": ["/newszoomin/turnedout/", "", 15, "재택플러스"],
    "streeteco": ["/newszoomin/streeteco/", "", 15, "거리의 경제"],
    "roadman": ["/newszoomin/roadman/", "", 15, ""],
    "opinion": ["/newszoomin/opinion/", "", 15, ""],
    "lawless": ["/newszoomin/lawless/", "", 15, ""],
    "yournews": ["/newszoomin/yournews/", "", 15, ""],
    "vod365": ["/newszoomin/vod365/", "", 15, "현장36.5"],
    "shortcut": ["/newszoomin/shortcut/", "", 15, ""],
    "otbt": ["/newszoomin/otbt/", "", 15, "외통방통"],
    "issue12": ["/newszoomin/issue12/", "", 15, "국회M부스"],
    "maxmlb": ["/newszoomin/maxmlb/", "", 15, "스포츠라이트"],
    "russia2018": ["/issue/russia2018/", "", 15, "2018 러시아 월드컵"],
	"qatar": ["/issue/qatar/", "", 15, "2022 카타르 월드컵"],
    "vote2021": ["/issue/vote2021/", "", 15, "선택2021"],
	"vote2022": ["/issue/vote2022/", "", 15, "선택2022"],
    "culppl": ["/newszoomin/culppl/", "", 15, "문화인물"],
    "kindreporters": ["/newszoomin/kindreporters/", "", 15, "친절한기자들"],
    "cereport": ["/newszoomin/cereport/", "", 15, "기후환경리포트"],
	"democliff": ["/newszoomin/democliff/", "", 15, "인구절벽 다가온 미래"],
    "ecoinnews": ["/newszoomin/ecoinnews/", "", 15, "뉴스속경제"],
	"bizplus": ["/newszoomin/bizplus/", "", 15, "비즈&플러스"],
	"insightm": ["/newszoomin/insightm/", "", 15, "인싸M"],
	"biztrend": ["/newszoomin/biztrend/", "", 15, "비즈&트렌드"],
};

var szMFont = ['11', '12', '14'];
var szPFont = ['15', '16', '17'];

var szMobius = {
    "A": { "pan_slide": 1, "rank_type": "pt", "newest_type": "mobius_newest_typeA" },
    "B": { "pan_slide": 0, "rank_type": "sns", "newest_type": "mobius_newest_typeB" },
    "C": { "pan_slide": 2, "rank_type": "im", "newest_type": "mobius_newest_typeC" }
};

var page = {
    main: 'http://imnewsui.imbc.com/',
    login: VIEW_PREFIX + '/more/login/',
    loginPersonal: VIEW_PREFIX + '/dev/login_personal.html',
    personalSetting: VIEW_PREFIX + '/dev/personal_setting.html',
    articleComment: VIEW_PREFIX + '/dev/article_comment.html',
    brd: VIEW_PREFIX + '/more/freeboard/index.html',
    jebo: VIEW_PREFIX + '/more/report/index.html',
    keywordSetting: VIEW_PREFIX + '/dev/keyword_setting.html',
    keywordHistory: VIEW_PREFIX + '/dev/keyword_history.html'
};

//****************************************
//   새로고침 불가 페이지
//******************************************
var szReloadDeny = ["/more/report/", "/more/board/"];

var userAgent = navigator.userAgent.replace(/ /g, '');
var bHybridAndroid = false;
var bHybridiOS = false;

if (userAgent.indexOf("HybridAndroid") != -1) { bHybridAndroid = true; }
if (userAgent.indexOf("HybridiOS") != -1) { bHybridiOS = true; }

try {
    if (bHybridAndroid || bHybridiOS) {
        var l = document.location.href;
        var bReloadDeny = true;
        for (var ii = 0; ii < szReloadDeny.length; ii++) {
            if (l.indexOf(szReloadDeny[ii]) != -1) {
                bReloadDeny = false; break;
            }
        }
        if (bHybridAndroid) {
            window.IMNewsApp.setEnablePullToRefresh(bReloadDeny);
            //console.log("setEnablePullToRefresh : bHybridAndroid - " + bReloadDeny);
        }
        else if (bHybridiOS) {
            var msg = { 'setEnablePullToRefresh': bReloadDeny }
            window.webkit.messageHandlers.IMNewsApp.postMessage(msg);
            //console.log("setEnablePullToRefresh : bHybridiOS - " + bReloadDeny);
        }
    }
}
catch (e) { }

/*cookie  가져오기*/
var CookieUtil = {
    GetCookieVal: function (offset) {
        var endstr = document.cookie.indexOf(";", offset);
        if (endstr == -1)
            endstr = document.cookie.length;
        return unescape(document.cookie.substring(offset, endstr));
    },

    SetCookie: function (name, value) {
        var argv = this.SetCookie.arguments;
        var argc = this.SetCookie.arguments.length;

        var expires = null;
        if (2 < argc && argv[2] != "") {
            expires = new Date();
            expires.setTime(expires.getTime() + (argv[2] * 24 * 60 * 60 * 1000));//
        }
        var path = (3 < argc) ? argv[3] : null;
        var domain = (4 < argc) ? argv[4] : window.location.hostname;
        var secure = (5 < argc) ? argv[5] : false;

        document.cookie = name + "=" + escape(value) +
            ((expires == null || expires == "") ? "" : ("; expires=" + expires.toGMTString())) +
            ((path == null) ? "" : ("; path=" + path)) +
            ((domain == null) ? "" : ("; domain=" + domain)) +
            ((secure == true) ? "; secure" : "");
    },

    GetCookie: function (name) {
        var arg = name + "=";
        var alen = arg.length;
        var clen = document.cookie.length;
        var i = 0;
        while (i < clen) {
            var j = i + alen;
            if (document.cookie.substring(i, j) == arg)
                return this.GetCookieVal(j);
            i = document.cookie.indexOf(" ", i) + 1;
            if (i == 0)
                break;
        }
        return null;
    },

    makePersistentCookie: function (name, length, path, domain) {
        var today = new Date();
        var expiredDate = new Date(2100, 1, 1);
        var cookie;
        var value;

        cookie = this.GetCookie(name);
        if (cookie) {
            //		alert(cookie);
            return 1;
        }

        var values = new Array();
        for (i = 0; i < length; i++) {
            values[i] = "" + Math.random();
        }

        value = today.getTime();

        // use first decimal
        for (i = 0; i < length; i++) {
            value += values[i].charAt(2);
        }

        this.SetCookie(name, value, expiredDate, path, domain);
    },

    getDomain: function () {
        var _host = document.domain;
        var so = _host.split('.');
        var dm = so[so.length - 2] + '.' + so[so.length - 1];
        return (so[so.length - 1].length == 2) ? so[so.length - 3] + '.' + dm : dm;
    }

}

var ImDataLink = {
    /*js파일 읽기*/
    ReadJs: function (jsUrl, callback) {
        return this.GetJsonRequest(jsUrl, callback);
    },
    /*전체 재생목록*/
    GetAllPlayList: function (callback) {
        var curUrl = location.href.replace("/article", "");
        var szUrl = curUrl.split('/');
        var calUrl = curUrl.substring(0, curUrl.lastIndexOf('/') + 1) + "cal_data.js";  //현재디렉토리의 달력데이타 가져오기
        var currentId = szUrl[szUrl.length - 1].split('_')[0];
        this.GetJsonRequest(calUrl, function (jsonData) {
            var jsUrl = jsonData.Link + "/" + currentId + "_" + jsonData.DataId + ".js";
            return this.GetJsonRequest(jsUrl, callback);
        });
    },

    /*카테고리별 최신기사*/
    GetCategoryNews: function (catId, callback) {
        if (catId == null || catId == "" || catId == "0") {
            return callback({ "Data": [] });
        }
        var data = szCategory[catId];

        if (data == undefined) return callback({ "Data": [] });
        if (data.length == 0) return callback({ "Data": [] });
        var jsonUrl;

        if (data[1] == "D") jsonUrl = data[0].replace('@@YEAR@@', NOW_YEAR);
        else jsonUrl = data[0];

        jsonUrl += "/newest.js";
        return this.GetJsonRequest(jsonUrl, callback);
    },

    /*취재플러스*/
    GetPlus: function (callback) {
        return this.GetJsonRequest("/operate/common/main/plus/plus.js", callback);
    },
    /*위클리*/
    GetWeekly: function (callback) {
        return this.GetJsonRequest("/operate/common/main/weekly/weekly.js", callback);
    },

    /*오리지널 최신기사 */
    GetOriginal: function (callback) {
        return this.GetJsonRequest("/original/newest.js", callback);
    },

    /*mpick*/
    GetMPick: function (callback) {
        return this.GetJsonRequest("/operate/common/content/mpick/mpick.js", callback);
    },

    /* 많이본 뉴스 */
    GetRankNews: function (sNewsType, callback) {
        switch (sNewsType) {
            case "im": jsonUrl = "/operate/common/content/popular/rank_imnews.js"; break;
            case "pt": jsonUrl = "/page/include/js/json/rank_portal.js"; break;
            case "sns": jsonUrl = "/page/include/js/json/rank_sns.js"; break;
            case "vod": jsonUrl = "/page/include/js/json/rank_vod.js"; break;
        }

        return this.GetJsonRequest(jsonUrl, callback);
    },
    GetMobiusNewest: function (callback) {
        var mobius_type = ImCommon.GetMobiusType("newest_type");
        return this.GetJsonRequest("/page/include/js/json/" + mobius_type + ".js", callback);
    },
    GetMobiustMain: function (callback) {
        var mobius_type = "mobius_newest_typeC";
        return this.GetJsonRequest("/page/include/js/json/" + mobius_type + ".js", callback);
    },
    /*타임라인*/
    GetTimeLine: function (callback) {
        return this.GetJsonRequest("/operate/common/main/timeline/newest_timeline.js", callback);
    },
    /*타임라인-전체*/
    GetTimeLineAll: function (callback) {
        return this.GetJsonRequest("/timeline/index.js", callback);
    },
    /*뉴스줌인*/
    GetZoomin: function (callback) {
        return this.GetJsonRequest("/operate/common/main/plus/plus.js", callback);
    },
    /*스포츠*/
    GetSports: function (callback) {
        return this.GetJsonRequest("/news/" + NOW_YEAR + "/sports/newest.js", callback);
    },
    /*문화*/
    GetCulture: function (callback) {
        return this.GetJsonRequest("/news/" + NOW_YEAR + "/culture/newest.js", callback);
    },
    /*iMBC 연예*/
    GetEnter: function (callback) {
        return this.GetJsonRequest("/news/" + NOW_YEAR + "/enter/newest.js", callback);
    },
    /*소셜픽 */
    GetSocialpick: function (callback) {
		// 2022-01-03 소셜픽 삭제
        return this.GetJsonRequest("/news/socialpick/2020/newest.js", callback);
    },
    /*14f*/
    Get14Floor: function (callback) {
        return this.GetJsonRequest("/original/14f/newest.js", callback);
    },
    /*엠빅비디오*/
    GetMbig: function (callback) {
        return this.GetJsonRequest("/original/mbig/newest.js", callback);
    },
    /*오늘현장*/
    Gettodayfield: function (callback) {
        return this.GetJsonRequest("/original/todayfield/newest.js", callback);
    },
    /*인기키워드*/
    GetRankKeyword: function (callback) {
        return this.GetJsonRequest("/operate/common/content/keyword/rank_keyword.js", callback);
    },
    /*기자상세내용*/
    GetReporterInfo: function (callback) {
        return this.GetJsonRequest("/operate/common/author/author_list.js", callback);
    },
    /*기자동명이인1차처리용*/
    GetTotalAuthorInfo: function (callback) {
        return this.GetJsonRequest("/operate/common/author/total_author_list.js", callback);
    },
    /* 뉴스 데이타가져오기*/
    GetNewsList: function (newsType, date, startRow, page) {
        var newsUrl = "/json/list_data_type1.js";

        this.GetJsonRequest(newsUrl, function (jsonData) {
            var jsUrl = jsonData.Link + "/" + currentId + "_" + jsonData.DataId + ".js";
            //return this.GetJsonRequest(jsUrl, callback);
        });
    },
    /** 뉴스데스트 정보 가져오기
     * 
     * @param {any} callback
     */
    GetNewsdesk: function (callback) {
        return this.GetJsonRequest("/page/include/js/json/newsdesk.js", callback);
    },
    /** 주요뉴스          */
    GetHeadlineNews: function (callback) {
        return this.GetJsonRequest("/operate/common/main/topnews/headline_news.js", callback);
    },
    /** 광고*/
    GetViewAd: function (callback) {
        return this.GetJsonRequest("/operate/common/view/ad/news_view_ad_info.js", callback);
    },
    /*gnb  프로모션**/
    GetGnbPromotion: function (callback) {
        return this.GetJsonRequest("/operate/pc/main/navi/promotion/gnb_promotion.js", callback);
    },
    //앱내 카드뉴스 정보
    GetCardNewsInfo: function (callback) {
        return this.GetJsonRequest("/operate/app/curation/card/appcard_menu.js", callback);
    },
    /** 앱내 키워드 기사*/
    GetCardKeywordNews: function (callback) {
        return this.GetJsonRequest("/page/include/js/json/card_keywordnews.js", callback);
    },
    /** url이 지정되지 않은 기사*/
    GetUnassignedNews: function (callback) {
        return this.GetJsonRequest(document.location.href.replace(".html", ".js"), callback);
    },
    /*이슈목록**/
    GetIssue: function (callback) {
        return this.GetJsonRequest("/issue/index.js", callback);
    },
    /*리스트 목록
     */
    GetListTitle: function (cat_id, callback) {
        this.GetJsonRequest("/operate/common/category/program_list_title_info.js", function (jsonData) {
            var retData;
            $.each(jsonData.Data, function (i, value) {
                if (value.CategoryID == cat_id) {
                    retData = value;
                    return
                }
            });

            return callback(retData);
        });
    },
    GetLastListTitle: function (cat_id, callback) {
        this.GetJsonRequest("/operate/common/lastprogram/lastprogram_list_title_info.js", function (jsonData) {
            var retData;
            $.each(jsonData.Data, function (i, value) {
                if (value.CategoryID == cat_id) {
                    retData = value;
                    return
                }
            });

            return callback(retData);
        });
    },

    /*뉴스 속보 리스트*/
    GetFlashList: function (callback) {
        return this.GetApiRequest(API_URL + "/live/newflash", "", callback);
    },
    /*온에어 여부*/
    GetOnAirProgram: function (callback) {
        return this.GetJsonRequest("/page/include/js/json/onair_program.js", callback);
        //return this.GetApiRequest(API_URL + "/schedule/onair/program", "", callback);
    },

    /*편성정보*/
    GetSchedule: function (params, callback) {
        return this.GetApiRequest(API_URL + "/schedule", params, callback);
    },
    /**북마크 등록*/
    RegBook: function (params, callback) {
        return this.PostApiRequest(API_URL + "/book/bookReg", params, callback);
    },
    /**북마크기사 목록*/
    GetBookList: function (params, callback) {
        return this.GetApiRequest(API_URL + "/book/bookList", params, callback, "jsonp");
    },
    /**마지막 북마크 가져오기*/
    GetBookCategory: function (callback) {
        return this.GetApiRequest(API_URL + "/book/bookCatChk", "", callback, "jsonp");
    },
    /** 북마크여부 가져오기*/
    GetBookChk: function (params, callback) {
        return this.GetApiRequest(API_URL + "/book/bookChk", params, callback, "jsonp");
    },
    /**북마크삭제     */
    DelBook: function (params, callback) {
        return this.DeleteApiRequest(API_URL + "/book/bookDel", params, callback);
    },
    GetBookUsr: function (params, callback) {
        return this.GetApiRequest(API_URL + "/book/bookUsr", params, callback);
    },
    /**북마크 사용자 수정*/
    ModBookUsr: function (params, callback) {
        return this.PostApiRequest(API_URL + "/book/bookUsrMod", params, callback);
    },

    /*감정이모티콘 등록*/
    RegistEmo: function (params, callback) {
        return this.PostApiRequest(API_URL + "/emoticon/emoRegist", params, callback);
    },

    /*감정이모티콘 조회*/
    GetEmoticon: function (params, callback) {
        return this.GetApiRequest(API_URL + "/emoticon/emoticonInfo", params, callback);
    },
    /**livetalk list*/
    GetTalkList: function (params, callback) {
        return this.GetApiRequest(API_URL + "/talk/talkList", params, callback);
    },

    /**livetalk 등록*/
    RegTalk: function (params, callback) {
        return this.PostApiRequest(API_URL + "/talk/talkReg", params, callback);
    },

    /**livetalk 삭제*/
    DelTalk: function (params, callback) {
        return this.DeleteApiRequest(API_URL + "/talk/talkDel", params, callback);
    },

    /** 게시판 조회*/
    GetBrdList: function (params, callback) {
        return this.GetApiRequest(API_URL + "/brd/brdList", params, callback);
    },
    /** 게시판 상세*/
    GetBrdView: function (params, callback) {
        return this.GetApiRequest(API_URL + "/brd/brdView", params, callback);
    },
    /**게시판 등록     */
    RegBrd: function (params, callback) {
        return this.PostApiRequest(API_URL + "/brd/brdReg", params, callback);
    },
    /**게시판 수정     */
    ModBrd: function (params, callback) {
        return this.PutApiRequest(API_URL + "/brd/brdMod", params, callback);
    },
    /**게시판 삭제     */
    DelBrd: function (params, callback) {
        return this.DeleteMultiApiRequest(API_URL + "/brd/brdDel", params, callback);
    },
    /** 게시판 댓글조회*/
    GetCmtBrdList: function (params, callback) {
        return this.GetApiRequest(API_URL + "/cmt/cmtBrdList", params, callback);
    },
    /** 게시판 대댓글조회*/
    GetParnCmtBrdList: function (params, callback) {
        return this.GetApiRequest(API_URL + "/cmt/parnCmtBrdList", params, callback);
    },
    /** 게시판 댓글등록*/
    RegCmtBrd: function (params, callback) {
		return this.PostApiRequest(API_URL + "/cmt/cmtBrdReg", params, callback);
    },
    /** 게시판 댓글삭제*/
    DelCmtBrd: function (params, callback) {
        return this.DeleteApiRequest(API_URL + "/cmt/cmtBrdDel", params, callback);
    },
    /** 게시판 댓글공감*/
    LikeCmtBrd: function (params, callback) {
        return this.GetApiRequest(API_URL + "/cmt/cmtBrdLike", params, callback);
    },
    /** 기사 댓글조회*/
    GetCmtList: function (params, callback) {
        return this.GetApiRequest(API_URL + "/cmt/cmtList", params, callback);
    },
    /** 기사 대댓글조회*/
    GetParnCmtList: function (params, callback) {
        return this.GetApiRequest(API_URL + "/cmt/parnCmtList", params, callback);
    },
    RegCmt: function (params, callback) {
		// alert('기사 댓글 기능 업데이트를 위해 당분간 기사 댓글 기능이 중단됩니다.');
		return this.PostApiRequest(API_URL + "/cmt/cmtReg", params, callback);
    },
    /**  댓글삭제*/
    DelCmt: function (params, callback) {
        return this.DeleteApiRequest(API_URL + "/cmt/cmtDel", params, callback);
    },
    /** 댓글공감*/
    LikeCmt: function (params, callback) {
        return this.GetApiRequest(API_URL + "/cmt/cmtLike", params, callback);
    },
    /** 북마크 댓글조회*/
    GetCmtBookList: function (params, callback) {
        return this.GetApiRequest(API_URL + "/cmt/cmtBookList", params, callback);
    },
    /** 북마크  대댓글조회*/
    GetParnCmtBookList: function (params, callback) {
        return this.GetApiRequest(API_URL + "/cmt/parnCmtBookList", params, callback);
    },
    RegCmtBook: function (params, callback) {
        return this.PostApiRequest(API_URL + "/cmt/cmtBookReg", params, callback);
    },
    /**  북마크  댓글삭제*/
    DelCmtBook: function (params, callback) {
        return this.DeleteApiRequest(API_URL + "/cmt/cmtBookDel", params, callback);
    },
    /** 북마크  댓글공감*/
    LikeCmtBook: function (params, callback) {
        return this.GetApiRequest(API_URL + "/cmt/cmtBookLike", params, callback);
    },
    /** 기사 조회*/
    GetSearch: function (params, callback) {
        return this.GetApiRequest(SEARCH_URL + "/search", params, callback);
    },
    /** 기사의 그룹핑     */
    GetGroupSearch: function (params, callback) {
        return this.GetApiRequest(SEARCH_URL + "/search/groupsearch", params, callback);
    },
    /**기자의 기사 목록*/
    GetReportNews: function (params, callback) {
        return this.GetApiRequest(SEARCH_URL + "/search/reportnews", params, callback);
    },
    GetReportNewsEmail: function (params, callback) {
        return this.GetApiRequest(SEARCH_URL + "/search/reportemail", params, callback);
    },
    /**GEOIP*/
    GetGeoIP: function (callback) {
        return this.GetApiRequest(API_URL + "/geoip/country", "", callback, "jsonp");
    },
    GetLoadFile: function (filePath, callback) {
        $.ajax({
            type: "GET",
            url: API_URL + "/otherdata/json?url=" + escape(filePath) + "&t=" + CacheInfo.MakeCallbackTime(),
            cache: true,
            async: false,
            success: function (result) {
                return callback(result);
            },
            error: function (request, status, error) {
                //                console.log(filePath + " code:" + request.status + "," + "error:" + error + "," + "message:" + request.responseText);
                return callback({ "Data": [] });
                //alert("GetLoadFile " + filePath+" code:" + request.status + "\n" + "error:" + error + "\n" + "message:" + request.responseText);
            }
        });
    },
    GetJsonpRequest: function (apiLink, callback) {
        var sLink = apiLink.split("/");
        var retCallback = sLink[sLink.length - 1];
        retCallback = retCallback.split(".")[0];
        retCallback += "_" + CacheInfo.MakeCallbackTime();
        $.ajax({
            type: "GET",
            dataType: 'jsonp',
            url: API_URL + "/otherdata/json?url=" + escape(SERVER_DOMAIN + apiLink),
            cache: false,
            //jsonpCallback: retCallback,
            async: false,
            success: function (result) {
                return callback(result);
            },
            error: function (request, status, error) {
                return callback({ "Data": [] });
            }
        });
    },
    GetJsonRequest: function (apiLink, callback) {
        $.ajax({
            type: "GET",
            contentType: "text/html;charset=utf-8",
            dataType: 'json',
            url: apiLink + "?" + CacheInfo.MakeCallbackTime(),
            cache: true,
            async: false,
            success: function (result) {
                if (result == undefined) {
                    ImDataLink.GetJsonpRequest(apiLink, callback);
                }
                else {
                    return callback(result);
                }
            },
            error: function (request, status, error) {
                //console.log("GetJsonRequest:" + apiLink + ", code:" + request.status + ",error:" + error + ", message:");
                //ImDataLink.GetLoadFile(apiLink, callback);
                //alert("code:" + request.status + "\n" + "error:" + error + "\n" + "message:" + request.responseText);
            }
        });
    },

    GetApiRequest: function (apiLink, params, callback) {
        var sLink = apiLink.split("/");
        var retCallback = sLink[sLink.length - 1];
        retCallback += "_" + CacheInfo.MakeCallbackTime();

        $.ajax({
            type: "GET",
            dataType: 'jsonp',
            data: params,
            url: apiLink,
            cache: true,
            jsonpCallback: retCallback,
            async: false,
            success: function (result) {
                return callback(result);
            },
            error: function (request, status, error) {
                //console.log("GetApiRequest error: " + apiLink + ",code:" + request.status + "\n" + "error:" + error + "\n" + "message:");

            }
        });
    },
    PostApiRequest: function (apiLink, params, callback) {
        /* if ('XDomainRequest' in window && window.XDomainRequest !== null) {
             alert('9'+apiLink)
              var xdr = new XDomainRequest(); // Use Microsoft XDR
              xdr.open('POST', apiLink);
              xdr.onload = function () {
                  alert(xdr.responseText)
                  JSON = $.parseJSON(xdr.responseText);
                  if (JSON == null || typeof (JSON) == 'undefined') {
                      JSON = $.parseJSON(data.firstChild.textContent);
                  }
                  callback(JSON); // internal function
              };
             xdr.onerror = function (error) {
                 alert("err" + error)
                  _result = false;
              };
              xdr.send(JSON.stringify(params));
          }
          else{*/
        //console.log(JSON.stringify(params))
        $.ajax({
            contentType: "application/json; charset=utf-8",
            type: "POST",
            dataType: 'json',
            url: apiLink,
            async: false,
            data: JSON.stringify(params),
            crossDomain: true,
            xhrFields: {
                withCredentials: true
            },
            success: function (result) {
                if (result.Success == "false") {
                    if (result.Message == "climit") {
                        alert("댓글은 60초 내에 한 개만 등록하실 수 있습니다.");
                    } else if (result.Message == "blimit") {
                        alert("게시글은 60초 내에 한 개만 등록하실 수 있습니다.");
                    } else {
                        alert(result.Message);
                    }
                    return false;
                }
                else {
                    return callback(result);
                }
            },
            error: function (request, status, error) {
                alert("일시적인 오류로 글이 등록되지 않았습니다.\n다시 한번 작성해주세요");
                //                    alert("code:" + request.status + "\n" + "error:" + error + "\n" + "message:" + request.responseText);

            }
        });
        //}
    },
    PutApiRequest: function (apiLink, params, callback) {
        $.ajax({
            contentType: "application/json; charset=utf-8",
            type: "POST",
            method: 'PUT',
            dataType: 'json',
            url: apiLink,
            async: false,
            data: JSON.stringify(params),
            crossDomain: true,
            xhrFields: {
                withCredentials: true
            },
            success: function (result) {
                if (result.Success == "false") {
                    alert(result.Message);
                    return false;
                }
                else {
                    return callback(result);
                }
            },
            error: function (request, status, error) {
                alert("일시적인 오류입니다.\n다시 한번 작업해주세요");
                //alert("code:" + request.status + "\n" + "error:" + error + "\n" + "message:" + request.responseText);

            }
        });
    },
    DeleteApiRequest: function (apiLink, params, callback) {
        var sParamLink = "";
        for (var key in params) {
            sParamLink += (sParamLink != "" ? "&" : "") + key + "=" + params[key]
        }

        $.ajax({
            contentType: "application/json; charset=utf-8",
            type: "DELETE",
            dataType: 'json',
            url: apiLink + "?" + sParamLink,
            async: false,
            crossDomain: true,
            xhrFields: {
                withCredentials: true
            },
            success: function (result) {
                if (result.Success == "false") {
                    alert(result.Message);
                    return false;
                }
                else {
                    return callback(result);
                }
            },
            error: function (request, status, error) {
                alert("일시적인 오류입니다.\n다시 한번 작업해주세요");
                //                alert("code:" + request.status + "\n" + "error:" + error + "\n" + "message:" + request.responseText);

            }
        });
    },
    DeleteMultiApiRequest: function (apiLink, params, callback) {
        $.ajax({
            contentType: "application/json; charset=utf-8",
            type: "DELETE",
            dataType: 'json',
            url: apiLink,
            data: JSON.stringify(params),
            async: false,
            crossDomain: true,
            xhrFields: {
                withCredentials: true
            },
            success: function (result) {
                if (result.Success == "false") {
                    alert(result.Message);
                    return false;
                }
                else {
                    return callback(result);
                }
            },
            error: function (request, status, error) {
                alert("일시적인 오류입니다.\n다시 한번 작업해주세요");
                //                alert("code:" + request.status + "\n" + "error:" + error + "\n" + "message:" + request.responseText);

            }
        });
    }
}
// 생성자 
var ImMessage = {
    ShowMessage: function (message, orgData, msgType) {
        //alert(this.ShowMessage.arguments.length)
        if (typeof orgData === "undefined") {
            alert(message);
            return;
        }

        $.each(orgData, function (i, value) {
            //if (retData.indexOf(value) == -1) retData.push(value);
            message = message.replace("@@" + (i + 1), value);
        });

        if (msgType == "C")
            return confirm(message);
        else
            alert(message);
    },

    DUP_EMOTICON: "이미 감정을 남기셨습니다.",
    LOGIN_DUP: "이미 로그인 하였습니다.",
    LOGIN_CHECK: "@@1로그인 후 입력 가능합니다.\n로그인 화면으로 이동하시겠습니까?",
    LOGIN_ALERT: "로그인 후 댓글을 쓸 수 있습니다.",
    INPUT_CHECK: "@@1 입력하세요",
    MAX_CHECK: "@@1 입력 길이를 초과하였습니다.",
    DEL_CONFIRM: "@@1 삭제 하시겠습니까?",
    SAVE_SUCCESS: "저장되었습니다",
    DEL_SUCCESS: "삭제되었습니다",
    DUP_CMT: "이미 공감/반대 하였습니다.",
    NOT_USER: "삭제된 MY PICK 페이지입니다",
    //    COPY_SUCCESS:  "@@1가 복사되었습니다.\n원하는 곳에 붙여넣기(Ctrl+ V) 해주세요.",
    COPY_SUCCESS: "@@1가 복사되었습니다.\n원하는 곳에 붙여넣기 해주세요.",
    INPUT_KEYWORD: "검색어를 입력해주세요",
    NOT_AUTH: "수정할 권한이 없습니다.",
    NOT_UPLOADFILE_EXT: "첨부할 수 없는 파일입니다..",
    NOT_UPLOADFILE_SIZE: "첨부할 수 없는 파일사이즈입니다..",
    AGREE_PERSON: "개인정보 처리방침에 동의하셔야 합니다.",
    COUNT_FILE: "파일첨부는 5개까지만 가능합니다.",
    INVALID_TEL: "잘못된 전화번호입니다.지역번호 포함한 숫자, - 로 입력하세요.",
    INVALID_EMAIL: "잘못된 이메일 주소입니다.",
    RECP_SUCCESS: "접수되었습니다.",
    REG_SUCCESS: "등록되었습니다",
    SUCCESS: "성공하였습니다.",
    FAIL: "실패하였습니다."
}


$.support.cors = true;

var CacheInfo = {
    MakeCallbackTime: function () {
        var d = new Date();
        var t =
            d.getFullYear() +
            this.pad2(d.getMonth() + 1) +
            this.pad2(d.getDate()) +
            this.pad2(d.getHours()) +
            this.pad2(d.getMinutes());
        return t;
    },
    pad2: function (n) {
        return (n < 10 ? '0' : '') + n;
    }
}
//document.referrer
var CheckReferer = {

    GetKeyword: function (strUrl) {
        var strFindKey = szSearchUrl[RegInfo.extractDomain(strUrl)];

        return (strFindKey == null) ? "" : RegInfo.StrParameter(strFindKey, strUrl);
    },
    GetUserType: function (strUrl, strKeyword) {
        var sUserType = "A";

        if (strUrl == "" || strUrl == "api.dable.io" || strUrl == window.location.hostname) sUserType = "A";
        else {
            if ($.inArray(strUrl, Object.keys(szSearchUrl)) != -1) {
                if (strKeyword == null || $.inArray(strKeyword, szKeyword) != -1)
                    sUserType = "A";
                else
                    sUserType = "B";
            } else {
                sUserType = "C";
            }
        }
        return sUserType;
    }

}
var RegInfo = {
    InputCheckParam: function (str) {
        var isStr = /^[ㄱ-ㅎ|가-힣|a-z|A-Z|0-9| |\*]+$/;

        if (!isStr.test(str)) { return false; }

        return true;
    },
    extractDomain: function (str) {
        var domain;
        //find & remove protocol (http, ftp, etc.) and get domain
        if (str.indexOf("://") > -1) {
            domain = str.split('/')[2];
        }
        else {
            domain = str.split('/')[0];
        }

        //find & remove port number
        domain = domain.split(':')[0];

        return domain;
    },
    UrlUnDecodeParameter: function (str) {
        str = str.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
        var regex = new RegExp('[\\?&]' + str + '=([^&#]*)');
        var results = regex.exec(location.search);
        return results === null ? '' : results[1];
    },
    UrlParameter: function (str) {
        str = str.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
        var regex = new RegExp('[\\?&]' + str + '=([^&#]*)');
        var results = regex.exec(location.search);
        return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
    },
    UrlCustomParameter: function (str) {
        var url = location.href;
        var regex = new RegExp('[\\#&]' + str + '=([^&#]*)');
        var results = regex.exec(url);
        return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
    },
    StrParameter: function (key, str) {
        key = key.replace(/[*+?^$.\[\]{}()|\\\/]/g, "\\$&");
        var match = str.match(new RegExp("[?&]" + key + "=([^&]+)(&|$)"));
        return match && decodeURIComponent(match[1].replace(/\+/g, " "));
    },
    FormatTime: function (str) {
        if (str.length == 4) {
            return str.substring(0, 2) + ":" + str.substring(2, 4);
        }
        else {
            return str;
        }
    },
    PlayTime: function (seconds) {
        var pad = function (x) { return (x < 10) ? "0" + x : x; }
        if (seconds >= 3600)
            return pad(parseInt(seconds / (60 * 60))) + ":" + pad(parseInt(seconds / 60 % 60)) + ":" + pad(seconds % 60);
        return pad(parseInt(seconds / 60 % 60)) + ":" + pad(seconds % 60);
    }
}



function identifyNewsApp(str) {
    if (str.indexOf('HybridAndroid') > -1) {
        return '_NewsApp:Android';
    }
    else if (str.indexOf('HybridiOS') > -1) {
        return '_NewsApp:iOS';
    }
    else if (str.indexOf('NAVER') > -1) {
        return '_Naver';
    }
    return '';
};

function identifyNewsApp2(str) {
    if (str.indexOf('HybridAndroid.Card') > -1) {
        return 'NewsApp:Android:Curation';
    }
    else if (str.indexOf('HybridAndroid') > -1) {
        return 'NewsApp:Android:Classic';
    }
    else if (str.indexOf('HybridiOS.Card') > -1) {
        return 'NewsApp:iOS:Curation';
    }
    else if (str.indexOf('HybridiOS') > -1) {
        return 'NewsApp:iOS:Classic';
    }
    else if (str.indexOf('Android') > -1 && str.indexOf('NAVER') > -1) {
        return 'NaverApp:Android';
    }
    else if (str.indexOf('NAVER') > -1 && (str.indexOf('iPhone') > -1 || str.indexOf('iPad') > -1)) {
        return 'NaverApp:iOS';
    }
    else if (str.indexOf('NAVER') > -1) {
        return 'NaverApp:etc';
    }
    else if (str.indexOf('DaumApps') > -1) {
        return 'DaumApp';
    }
    else if (str.indexOf('KAKAOTALK') > -1) {
        return 'KakaoTalk';
    }
    else {
        return 'ETC';
    }
}

function identifyUserAgent(str) {
    if (str.match(/Android.+ Version\/[.0-9]* Chrome\/[.0-9]* Mobile/g)) {
        return 'WebView_Android_KitKat';
    }
    else if (str.match(/ wv.+ Chrome\/[.0-9]* Mobile/g)) {
        return 'WebView_Android_Lollipop';
    }
    else if (str.match(/Android .+ Version\/[.0-9]* Safari/g)) {
        return 'Webview_Android_Old';
    }
    else if (str.match(/Android.+ Chrome\/[.0-9]* Mobile/g)) {
        return 'Chrome_Android_Phone';
    }
    else if (str.match(/Android.+C hrome\/[.0-9]* (?!Mobile)/g)) {
        return 'Chrome_Android_Tables';
    }
    else if (str.match(/iPhone.+ Crios\/[.0-9]* Mobile/g)) {
        return 'Chrome_iOS_iPhone';
    }
    else if (str.match(/iPhone.+ Version\/[.0-9]* Mobile\/[.0-9]*.+ Safari/g)) {
        return 'Safari_iOS_iPhone';
    }
    else if (str.match(/iPad.+ Version\/[.0-9]* Mobile\/[.0-9]*.+ Safari/g)) {
        return 'Safari_iOS_iPad';
    }
    else if (str.match(/iPhone.+ Mobile/g)) {
        return 'UIWebView_iOS_iPhone';
    }
    else if (str.match(/iPad.+ Mobile/g)) {
        return 'UIWebView_iOS_iPad';
    }
    else if (str.match(/Macintosh.+ Version\/[.0-9]* Safari/g)) {
        return 'Safari_PC_Mac';
    }
    else if (str.match(/Macintosh.+ Chrome\/.+ Safari/g)) {
        return 'Chrome_PC_Mac';
    }
    else if (str.match(/IEMobile\/[.0-9]*/g)) {
        return 'IE_Mobile';
    }
    else if (str.match(/Android .+NAVER.+inapp/g)) {
        return 'NaverApp_Android';
    }
    return str;
};
(function (i, s, o, g, r, a, m) {
    i['GoogleAnalyticsObject'] = r; i[r] = i[r] || function () {
        (i[r].q = i[r].q || []).push(arguments)
    }, i[r].l = 1 * new Date(); a = s.createElement(o),
        m = s.getElementsByTagName(o)[0]; a.async = 1; a.src = g; m.parentNode.insertBefore(a, m)
})(window, document, 'script', '//www.google-analytics.com/analytics.js', 'ga');

// ga('create', 'UA-56832179-1', 'auto');
// ga('send', 'pageview', {
//     'dimension2': identifyUserAgent(navigator.userAgent) + identifyNewsApp(navigator.userAgent),
//     'dimension4': identifyNewsApp2(navigator.userAgent)
// });

if (location.href.indexOf("/vote2020/") < 0) {
	if (location.href.indexOf("/enter/") >= 0) {
	// iMBC 연예
        (function (d, a, b, l, e, _) {
            if (d[b] && d[b].q) return; d[b] = function () { (d[b].q = d[b].q || []).push(arguments) }; e = a.createElement(l);
            e.async = 1; e.charset = 'utf-8'; e.src = '//static.dable.io/dist/plugin.min.js';
            _ = a.getElementsByTagName(l)[0]; _.parentNode.insertBefore(e, _);
        })(window, document, 'dable', 'script');
        dable('setService', 'imnews.imbc.com/enews');
        dable('renderWidget', 'dablewidget_goBrDxoe_GlGrdZ7x', { ignore_items: true });
	} else {
	// MBC News
      (function (d, a, b, l, e, _) {
          d[b] = d[b] || function () { (d[b].q = d[b].q || []).push(arguments) }; e = a.createElement(l);
          e.async = 1; e.charset = 'utf-8'; e.src = '//static.dable.io/dist/plugin.min.js';
          _ = a.getElementsByTagName(l)[0]; _.parentNode.insertBefore(e, _);
      })(window, document, 'dable', 'script');
      dable('setService', (identifyNewsApp(navigator.userAgent).indexOf("_NewsApp") > -1 ? 'app.imnews.imbc.com' : 'imnews.imbc.com'));
	}

    dable('sendLogOnce');
}

/*
ga('create', 'UA-70779591-1', 'auto', 'mbcrnd');
ga('mbcrnd.send', 'pageview', {
    'dimension1': identifyUserAgent(navigator.userAgent) + identifyNewsApp(navigator.userAgent),
    'dimension3': 'None'
});
*/

var ImUtil = {

    RemoveDupData: function (orgData) {
        var retData = [];
        $.each(orgData, function (i, value) {
            if (retData.indexOf(value) == -1) retData.push(value);
        });
        return retData;

    },
    RemoveDupDataObejct: function (orgData) {
        var retArray = {};
        var retData = orgData;
        for (var i = retData.length - 1; i >= 0; i--) {
            var so = JSON.stringify(orgData[i].AId);
            if (retArray[so]) {
                retData.splice(i, 1);

            } else {
                retArray[so] = true;
            }
        }
        return retData;
    },

    FilterData: function (orgData, key, value) {
        return orgData.filter(function (object) {
            return object[key] == value;
            //return object[key] === value;
        });
    },
    FormatDate: function (yyyy, mm, dd) {

        var month = parseInt(mm, 0);
        var day = parseInt(dd, 0);
        return yyyy + (month < 10 ? "0" + month : "" + month) + (day < 10 ? "0" + day : "" + day);

    },

    IsNull: function (v) {
        return (v === undefined || v === null || v == "" || v == "\"\"") ? true : false;
    },
    Nvl: function (v, str) {
        return (v === undefined || v === null || v == "" || v == "\"\"") ? str : v;
    },
    DataDiff: function (_date1, _date2) {
        var diffDate_1 = _date1 instanceof Date ? _date1 : new Date(_date1);
        var diffDate_2 = _date2 instanceof Date ? _date2 : new Date(_date2.replace(" ", "T"));

//       diffDate_1 = new Date(diffDate_1.getFullYear(), diffDate_1.getMonth() + 1, diffDate_1.getDate());
//       diffDate_2 = new Date(diffDate_2.getFullYear(), diffDate_2.getMonth() + 1, diffDate_2.getDate());

        diffDate_1 = new Date(diffDate_1.getFullYear(), diffDate_1.getMonth(), diffDate_1.getDate());
        diffDate_2 = new Date(diffDate_2.getFullYear(), diffDate_2.getMonth(), diffDate_2.getDate());

        var diff = Math.abs(diffDate_2.getTime() - diffDate_1.getTime());
        diff = Math.ceil(diff / (1000 * 3600 * 24));
        return diff;
    },
    GetWeek: function (date) {
        var week = ['일', '월', '화', '수', '목', '금', '토'];
        var dayOfWeek = week[new Date(date).getDay()];
        return dayOfWeek;
    },
    FormatTimelineLimit: function (article_dt) {
        var article_date = article_dt.split(" ")[0].replace(/-/gi, "");
        var article_time = article_dt.split(" ")[1].replace(/:/gi, "");;
        //        alert(1);
        //       alert(this.cToday)
        var cTodayDiff = Math.floor(cToday) - Math.floor(article_date);

        var cYearDiff = Math.floor(parseInt(cToday) / 10000) - Math.floor(article_date / 10000);

        var cHourDiff = Math.floor(cTime) - Math.floor(article_time);
        if (cYearDiff > 1) {
            return (article_date.substr(0, 4) + '년 ' + article_date.substr(4, 2) + '월' + article_date.substr(6, 2)) + '일';
        } else if (cTodayDiff >= 2) {
            return (article_date.substr(4, 2) + '월 ' + article_date.substr(6, 2)) + '일';
        } else if (cTodayDiff < 2) {
            var hourDiff = Math.floor((cTodayDiff * 24)) + Math.floor(cTime.substr(0, 2)) - Math.floor(article_time.substr(0, 2));
            var minDiff = Math.floor(cTime.substr(2, 2)) - Math.floor(article_time.substr(2, 2));
            if (hourDiff == 0) {
                return (minDiff + '분전');
            } else {
                if (hourDiff >= 2) {
                    return (hourDiff + '시간전');
                } else {
                    if ((hourDiff * 60) + minDiff > 120) {
                        return ('2시간전');
                    } else if ((hourDiff * 60) + minDiff > 60) {
                        return ('1시간전');
                    } else {
                        return ((hourDiff * 60) + minDiff + '분전');
                    }
                }
            }
        } else if (cTodayDiff == 0 && cHourDiff > 60) {
            var minDiff = Math.floor(cTime.substr(2, 2)) - Math.floor(article_time.substr(2, 2));
            return (minDiff + '분전');
        } else {
            var seconDiff = Math.floor(cTime.substr(4, 2)) - Math.floor(article_time.substr(4, 2));
            return (seconDiff + '초전');
        }
    },
    MaskNumber: function (num) {
        var regexp = /\B(?=(\d{3})+(?!\d))/g;
        return num.toString().replace(regexp, ',');
    },
    GetCharByteSize: function (ch) {
        if (ch == null || ch.length == 0) {
            return 0;
        }

        if (escape(ch).length > 4) {
            return 2;
        } else if (ch == "\r") {
            return 1;
        } else {
            return 1;
        }
    },
    GetDataSize: function (val) {
        var leng = val.length;
        var count = 0;
        for (c = 0; c < leng; c++) {
            count += ImUtil.GetCharByteSize(val.charAt(c));
        }
        return count;
    },
    ContentLengthChk: function (obj, maxLen, trgObj) {    //글자수 체크
        /*2002 vote*/
        //if (!ImCommon.CheckLoginTypeInfo()) { $(obj).val(''); return false; }

        var totalLen = $(obj).val().length; //전체길이
        var cutLen = maxLen; //제한할 글자수 크기
        var rtnContent = $(obj).val(); //글자수를 초과하면 제한한 글자전까지만 보여줌.
        var contentLen = totalLen; // 글자수

        if (totalLen > cutLen) {
            alert("글자를 초과 입력할 수 없습니다.");
            rtnContent = rtnContent.substring(0, maxLen);
            $(obj).val(rtnContent);
            contentLen = maxLen;
        }

        // 현재 글자수 노출
        $(trgObj).html(contentLen);
        //    $(element).parent().parent().find('em').html(contentLen);
    },
    RemoveFormat: function (str) {
        if (ImUtil.IsNull(str)) { return str; }
        var regExp = /[\{\}\[\]\/?.,;:|\)*~`!^\-_+<>@\#$%&\\\=\(\'\"]/gi
        return str.replace(regExp, "");
    },
    RemoveTag: function (str) {
        if (ImUtil.IsNull(str)) { return str; }
        return str.replace(/(<([^>]+)>)/gi, "").replace(/'/gi, "");
    },
    FormatDate: function (str) {
        if (ImUtil.IsNull(str)) { return str; }
        if (!str) return "";
        var formatNum = '';
        str = str.replace(/\s/gi, "");

        try {
            if (str.length == 8) {
                formatNum = str.replace(/(\d{4})(\d{2})(\d{2})/, '$1-$2-$3');
            }
        } catch (e) {
            formatNum = str;
            //console.log(e);
        }
        return formatNum;
    },
    ConvertStrToHtml: function (str) {
        if (str == null) { return ""; }
        var regExp = /\n/gi;
        return str.replace(regExp, "<br>");
    },
    pad: function (n, width) {
        n = n + '';
        return n.length >= width ? n : new Array(width - n.length + 1).join('0') + n;
    },
    CleanXSS: function (str) {
        if (str == null) return "";

        str = str.replace(/</gi, "&lt;");
        str = str.replace(/>/gi, "&gt;");
        str = str.replace(/\(/gi, "&#40;");
        str = str.replace(/\)/gi, "&#41;");
        str = str.replace(/eval\((.*)\)/gi, "");
        str = str.replace(/[\\"\\'][\s]*javascript:(.*)[\\"\\']/gi, "");
        str = str.replace(/script/gi, "_script_");

        return str;
    },
    /*
    Copy: function (sType, str) {
        var deviceOption = navigator.userAgent;
        var isIe8 = deviceOption.toLowerCase().indexOf('msie 8.0'); // 익스플로러 8
        var iSIe = deviceOption.indexOf("NET CLR"); // 익스플로러일 경우
        var isChrome = deviceOption.indexOf("Chrome"); // 크롬일 경우
        var isSafari = deviceOption.indexOf("Version");
        var msgType = (sType == "URL" ? "주소" : "본문");

        if (iSIe > -1) { // 익스플로러
            var thisUrl = window.clipboardData.setData("Text", str);
            //            alert('주소가 복사되었습니다.\n원하는 곳에 붙여넣기(Ctrl+V)해주세요.');
            ImMessage.ShowMessage(ImMessage.COPY_SUCCESS, [msgType]);

        } else if (isSafari > -1) { // 사파리
            var copyOn = prompt("Ctrl+C를 눌러 복사하세요.", str);
        } else { // 크롬, 파이어폭스
            var hiddenTextArea = document.createElement("textarea");
            hiddenTextArea.style.opacity = 0;
            hiddenTextArea.value = str;
            document.body.appendChild(hiddenTextArea);
            hiddenTextArea.select();
            var booleanSuccess = document.execCommand('copy');
            if (booleanSuccess) ImMessage.ShowMessage(ImMessage.COPY_SUCCESS, [msgType]);
            document.body.removeChild(hiddenTextArea);
        }
    },
    */
    Copy: function (sType, textToCopy) {
        var textArea;
        var msgType = (sType == "URL" ? "주소" : "본문");

        function isOS() {
            //can use a better detection logic here
            return navigator.userAgent.match(/ipad|iphone/i);
        }

        function createTextArea(text) {
            textArea = document.createElement('textArea');
            textArea.readOnly = true;
            textArea.contentEditable = true;
            textArea.value = text;
            document.body.appendChild(textArea);
        }

        function selectText() {
            var range, selection;

            if (isOS()) {
                range = document.createRange();
                range.selectNodeContents(textArea);
                selection = window.getSelection();
                selection.removeAllRanges();
                selection.addRange(range);
                textArea.setSelectionRange(0, 999999);
            } else {
                textArea.select();
            }
        }

        function copyTo() {
            document.execCommand('copy');
            document.body.removeChild(textArea);
        }

        createTextArea(textToCopy);
        selectText();
        copyTo();
        ImMessage.ShowMessage(ImMessage.COPY_SUCCESS, [msgType]);
    },
    //error이미지 설정(전에 코딩된 부분이 너무 많아서 수정불가:두군데에 두기로)
    SetErrorImage: function (obj) {
        obj.src = "//image.imnews.imbc.com/page/include/images/default.jpg";
    },
    Shuffle: function (o) {
        o.sort(function () { return 0.5 - Math.random() });
        return o;
    },
    GetUrlParams: function () {
        var params = {};
        window.location.search.replace(/[?&]+([^=&]+)=([^&]*)/gi, function (str, key, value) { params[key] = value; });
        return params;
    },
    SetPager: function (totalCount, curPage, pageSize, size, blockPage) {
        var azHtml = [];
        azHtml.push('<div class="paging_area">');
        var totalPage = parseInt(totalCount / pageSize, 10);
        if (totalPage * pageSize != totalCount) {
            totalPage++;
        }

        if (totalPage == 1) {
            azHtml.push('<a href="#result" class="page_num on">1</a>');
        }
        else {

            if (curPage > 1) {
                azHtml.push('<a href="#result" data-page-num=1 class="page_arr first">처음 페이지로 이동</a>');
                azHtml.push('<a href="#result" data-page-num=' + (curPage - 1) + '" class="page_arr prev">이전 페이지로 이동</a>');
            }
            for (var i = blockPage; i < blockPage + size; i++) {
                if (i == curPage) {
                    azHtml.push('<a href="#none" class="page_num on">' + i + '</a>');
                }
                else {
                    azHtml.push('<a href="#result" data-page-num=' + i + ' class="page_num">' + i + '</a>');
                }
                if (i >= totalPage) {
                    break;
                }
            }
            if (curPage < totalPage) {
                azHtml.push('<a href="#result" data-page-num=' + (curPage + 1) + ' class="page_arr next">다음 페이지로 이동</a>');
                azHtml.push('<a href="#result" data-page-num=' + totalPage + ' class="page_arr last">마지막 페이지로 이동</a>');
            }
        }

        azHtml.push('</div>');

        return azHtml.join('');

    },
    GetExtensionOfFilename: function (url) {
        var lastDot = url.lastIndexOf('.');
        var fileExt = filename.substring(lastDot, url.length).toLowerCase();
    },
    IsImage: function (url) {
        var reg = /(.*?)\.(jpg|jpeg|png|gif|bmp)$/;
        if (url.match(reg)) {
            return true;
        }
        else {
            return false;
        }
    }
}


window.mobilecheck = function () {
    var check = false;
    (function (a) { if (/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a) || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0, 4))) check = true })(navigator.userAgent || navigator.vendor || window.opera);
    return check;
}

function fMP4duration(s, e) {
    try {
        return (e - s);
    }
    catch (e) {
        return 10000;
    }
}

function sumNum(st) {
    var startT = st - 355000;
    return startT;
}

function ChangeWowzaplayInfo(s) {
    try {
        var k = "";
        if (s.indexOf("sumNum") > -1 || s.indexOf("fMP4duration") > -1) {
            ktemp1 = s.split('=');
            for (var i = 0; i < ktemp1.length; i++) {
                ktemp2 = ktemp1[i].split('&');
                for (var j = 0; j < ktemp2.length; j++) {
                    if (i == 0) {
                        k += (ktemp2[j].indexOf("sumNum") > -1 || ktemp2[j].indexOf("fMP4duration") > -1 ? eval(ktemp2[j]) : ktemp2[j])
                    }
                    else {
                        k += (j == 0 ? "=" : "&") + (ktemp2[j].indexOf("sumNum") > -1 || ktemp2[j].indexOf("fMP4duration") > -1 ? eval(ktemp2[j]) : ktemp2[j])
                    }
                }
            }
            return k;
        }
        else {
            return s;
        }
    }
    catch (e) { return s; }
}

document.addEventListener("DOMContentLoaded", function () {
    var lazyloadImages;

    if ("IntersectionObserver" in window) {
        lazyloadImages = document.querySelectorAll(".lazyloaded");
        var imageObserver = new IntersectionObserver(function (entries, observer) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    var image = entry.target;
                    image.src = image.dataset.src;
                    image.classList.remove("lazyloaded");
                    imageObserver.unobserve(image);
                }
            });
        });

        lazyloadImages.forEach(function (image) {
            imageObserver.observe(image);
        });
    } else {
        var lazyloadThrottleTimeout;
        lazyloadImages = document.querySelectorAll(".lazyloaded");

        function lazyload() {
            if (lazyloadThrottleTimeout) {
                clearTimeout(lazyloadThrottleTimeout);
            }

            lazyloadThrottleTimeout = setTimeout(function () {
                var scrollTop = window.pageYOffset;
                lazyloadImages.forEach(function (img) {
                    if (img.offsetTop < (window.innerHeight + scrollTop)) {
                        img.src = img.dataset.src;
                        img.classList.remove('lazyloaded');
                    }
                });
                if (lazyloadImages.length == 0) {
                    document.removeEventListener("scroll", lazyload);
                    window.removeEventListener("resize", lazyload);
                    window.removeEventListener("orientationChange", lazyload);
                }
            }, 20);
        }

        document.addEventListener("scroll", lazyload);
        window.addEventListener("resize", lazyload);
        window.addEventListener("orientationChange", lazyload);
    }
})

if (typeof Array.prototype.forEach != 'function') {
    Array.prototype.forEach = function (callback) {
        for (var i = 0; i < this.length; i++) {
            callback.apply(this, [this[i], i, this]);
        }
    };
}

if (window.NodeList && !NodeList.prototype.forEach) {
    NodeList.prototype.forEach = Array.prototype.forEach;
}
function chkAgent() {
    //	if ( navigator.userAgent.indexOf('HybridAndroid') > -1) {
    //		// 하이브리드 안드
    //		return "HA";
    //	}else if( navigator.userAgent.indexOf('HybridiOS') > -1 ){
    //		// 하이브리드 아이폰
    //		return "HI";

    if (navigator.userAgent.indexOf('HybridAndroid') > -1 || navigator.userAgent.indexOf('HybridiOS') > -1) {
        // 하이브리드
        return "HYBRID";

    } else {
        // 웹
        return "WEB";
    }
}

function snsPostScript(sns, url, txt, imgUrl) {
    var o;
    var _url = encodeURIComponent(url);
    var _txt = encodeURIComponent(txt);
    var _br = encodeURIComponent('\r\n');

    var thisAgent = chkAgent();

    switch (sns) {
        case 'facebook':
            if ("HYBRID" == thisAgent) {
                o = {
                    method: 'popup'
                    , url: 'http://www.facebook.com/sharer/sharer.php?u=' + _url
                };

            } else {

                o = {
                    method: 'popup'
                    , url: 'http://www.facebook.com/sharer/sharer.php?u=' + _url
                };
            }
            break;

        case 'twitter':
            o = {
                method: 'popup'
                , url: 'http://twitter.com/intent/tweet?text=' + _txt + '&url=' + _url
            };
            break;

        case 'gp':
            o = {
                method: 'popup'
                , url: "https://plus.google.com/share?url=" + _url + "&t=" + _txt
            };
            break;

        case 'kt':
            sendLink(url, txt, imgUrl);

            o = { method: 'kt' };

            break;

        case 'ks':
            if ("WEB" == thisAgent) {
                o = {
                    method: 'popup',
                    url: 'https://story.kakao.com/share?url=' + _url
                };
            } else {
                o = {
                    method: 'web2app',
                    param: 'posting?post=' + _txt + _br + _url + '&apiver=1.0&appver=2.0&appid=imnews.imbc.com&appname=' + encodeURIComponent('imnews.imbc.com'),
                    a_store: 'itms-apps://itunes.apple.com/app/id486244601?mt=8',
                    g_store: 'market://details?id=com.kakao.story',
                    a_proto: 'storylink://',
                    g_proto: 'scheme=storylink;package=com.kakao.story'
                };
            }
            break;

        case 'nb':
            if ("WEB" == thisAgent) {
                o = {
                    method: 'popup'
                    , url: 'http://www.band.us/plugin/share?body=' + url
                    //					,appUrl:'bandapp://create/post?text='+_txt+'&route='+url
                    //					,iosStore:'itms-apps://itunes.apple.com/app/id542613198'
                    //					,andStore:'market://details?id=com.nhn.android.band'
                };
            } else {
                o = {
                    method: 'web2app',
                    //param:'create/post?text='+_txt+'&route='+_url, 
                    param: 'create/post?text=' + _txt + _br + _url,
                    a_store: 'itms-apps://itunes.apple.com/app/id542613198?mt=8',
                    g_store: 'market://details?id=com.nhn.android.band',
                    a_proto: 'bandapp://',
                    g_proto: 'scheme=bandapp;package=com.nhn.android.band'
                };

                //        		location.href = 'bandapp://create/post?text='+_txt+'&route='+_url;
            }

            break;

        default:
            alert('지원하지 않는 SNS입니다.');
            return false;
    }

    switch (o.method) {
        case 'popup':
            window.open(o.url, 'popup', 'width=600, height=600, menubar=no, status=no, toolbar=no');
            break;

        case 'href':
            window.open(o.url, '_system');
            break;

        case 'web2app':
            if (navigator.userAgent.match(/android/i)) {
                // Android
                setTimeout(function () { location.href = 'intent://' + o.param + '#Intent;' + o.g_proto + ';end' }, 100);

            }
            else if (navigator.userAgent.match(/(iphone)|(ipod)|(ipad)/i)) {
                // Apple
                setTimeout(function () { location.href = o.a_store; }, 200);
                setTimeout(function () { location.href = o.a_proto + o.param }, 0);
            }
            else {
                alert('이 기능은 모바일에서만 사용할 수 있습니다.');
            }
            break;
    }
}

try {
    Kakao.init('4c1484d657e65d6012b53a52909d4493');
}
catch (e) { }

function sendLink(url, txt, imgUrl) {
    try {
        Kakao.Link.sendDefault({
            objectType: 'feed',
            content: {
                title: txt,
                description: '#MBC 뉴스',
                imageUrl: imgUrl,
                link: {
                    mobileWebUrl: url,
                    webUrl: url
                }
            },

            buttons: [
                {
                    title: '뉴스 보기',
                    link: {
                        mobileWebUrl: url,
                        webUrl: url
                    }
                }

            ]
        });
    }
    catch (e) {
        Kakao.Link.createDefaultButton({
            container: '.share_kko',
            objectType: 'feed',
            content: {
                title: txt,
                description: '#MBC 뉴스',
                imageUrl: imgUrl,
                link: {
                    mobileWebUrl: url,
                    webUrl: url
                }
            },

            buttons: [
                {
                    title: '뉴스 보기',
                    link: {
                        mobileWebUrl: url,
                        webUrl: url
                    }
                }

            ]
        });
    }
}

function sendMPickLink(url, txt, msg, imgUrl) {
    try {
        Kakao.Link.sendDefault({
            objectType: 'feed',
            content: {
                title: txt,
                description: msg,
                imageUrl: imgUrl,
                link: {
                    mobileWebUrl: url,
                    webUrl: url
                }
            },

            buttons: [
                {
                    title: 'MY PICK 보기',
                    link: {
                        mobileWebUrl: url,
                        webUrl: url
                    }
                }

            ]
        });
    }
    catch (e) {
        Kakao.init('4c1484d657e65d6012b53a52909d4493');
        Kakao.Link.createDefaultButton({
            container: '#kt',
            objectType: 'feed',
            content: {
                title: txt,
                description: msg,
                imageUrl: imgUrl,
                link: {
                    mobileWebUrl: url,
                    webUrl: url
                }
            },

            buttons: [
                {
                    title: 'MY PICK 보기',
                    link: {
                        mobileWebUrl: url,
                        webUrl: url
                    }
                }
            ]
        });
    }

}
//XTVID 쿠키 존재여부를 확인하여 없을 경우 쿠키를 생성한다.
var vid = 'XTVID';
var sid = 'XTSID';
var lid = 'XTLID';
var xtrhis = "XTRHIS";
var xtrhisMaxCnt = 50;


//XTVID쿠키 확인
function makeXTVIDCookie() {
    if (!existCookie(vid)) {
        setXTVIDCookie(vid);
    }
}

//XTSID쿠키 확인
function makeSESSIONIDCookie() {
    var xtsidExpire = 30;
    var xtrTodayDate = new Date();
    xtrTodayDate.setMinutes(xtrTodayDate.getMinutes() + xtsidExpire);
    var expiresInfo = xtrTodayDate.toUTCString();
    if (!existCookie(sid)) {
        var randomid = Math.floor(Math.random() * 1000);
        var xtsid = "A" + makeXTVIDValue() + randomid;
        document.cookie = sid + "=" + xtsid + ";" + "path=/;domain=" + getXDomain() + ";expires=" + expiresInfo;
    } else {
        document.cookie = sid + "=" + getXTCookie(sid) + ";" + "path=/;domain=" + getXDomain() + ";expires=" + expiresInfo;
    }

}

//XTSID쿠키 확인
function makeXTLIDCookie(value) {
    if (!existCookie(lid)) {
        setXTLIDCookie(lid, value);
    }

}

//쿠키가 존재하는지 확인한다.
function existCookie(name) {
    var vid = getXTCookie(name);
    if (vid != null && vid != "") {
        return true;
    }
    return false;
}

//주어진 이름의 쿠키값을 얻는다.
function getXTCookie(name) {
    var cookies = document.cookie.split("; ");
    for (var i = 0; i < cookies.length; i++) {
        var cPos = cookies[i].indexOf("=");
        var cName = cookies[i].substring(0, cPos);
        if (cName == name) {
            return unescape(cookies[i].substring(cPos + 1));
        }
    }
    // a cookie with the requested name does not exist
    return "";
}

//XTVID 쿠키를 생성한다.
function setXTVIDCookie(name) {
    // 3자리 난수 발생
    var randomid = Math.floor(Math.random() * 1000);

    // XTVID =  웹서버 식별문자 (A...Z ) 한자리  + yymmdd (쿠키생성일자)  + hhmmss (쿠키생성시각)  
    //       +  MMM (쿠키 생성시각 1/1000 초) + RRR (난수)
    var xtvid = "A" + makeXTVIDValue() + randomid;
    //var xtvid = makeXTVIDValue() + randomid;
    expireDate = new Date();
    expireDate.setYear(expireDate.getYear() + 10);

    setXTCookie(name, xtvid, 365 * 10, "/", getXDomain());
}

//XTSID 쿠키를 생성한다.
function setXTSIDCookie(name) {
    // 3자리 난수 발생
    var randomid = Math.floor(Math.random() * 1000);

    // XTVID =  웹서버 식별문자 (A...Z ) 한자리  + yymmdd (쿠키생성일자)  + hhmmss (쿠키생성시각)  
    //       +  MMM (쿠키 생성시각 1/1000 초) + RRR (난수)
    var xtvid = "A" + makeXTVIDValue() + randomid;
    //var xtvid = makeXTVIDValue() + randomid;
    expireDate = new Date();
    expireDate.setYear(expireDate.getYear() + 10);

    setXTCookie(name, xtvid, -1, "/", getXDomain());
}

//XTLID 쿠키를 생성한다.
function setXTLIDCookie(name, value) {
    setXTCookie(name, value, -1, "/", getXDomain());
}

//XTLID 쿠키를 삭제한다.
function removeXTCookie(name) {
    setXTCookie(name, "", 0, "/", getXDomain());
}

//주어진 조건으로 쿠키를 생성한다.
function setXTCookie(name, value, expires, path, domain) {
    var todayDate = new Date();
    todayDate.setDate(todayDate.getDate() + expires);
    var expiresInfo = (expires < 0) ? '' : todayDate.toGMTString();
    document.cookie = name + "=" + escape(value) + ";" + "path=" + path
        + ";domain=" + domain + ";expires=" + expiresInfo;
}

//쿠키생성을 위한 도메인을 얻는다.
function getXDomain() {
    var host = document.domain;
    var tokens = host.split('.');
    var xdomain = tokens[tokens.length - 2] + '.' + tokens[tokens.length - 1];
    return (tokens[tokens.length - 1].length == 2) ? tokens[tokens.length - 3]
        + '.' + xdomain : xdomain;
}

//XTVID 값을 생성한다.
function makeXTVIDValue() {
    var str = '';
    nowdate = new Date();
    digit = nowdate.getFullYear();
    if (digit < 2000) {
        digit = digit - 1900;
    } else {
        digit = digit - 2000;
    }
    str += paddingNo(digit);

    digit = nowdate.getMonth() + 1;
    str += paddingNo(digit);

    digit = nowdate.getDate();
    str += paddingNo(digit);

    digit = nowdate.getHours();
    str += paddingNo(digit);

    digit = nowdate.getMinutes();
    str += paddingNo(digit);

    digit = nowdate.getSeconds();
    str += paddingNo(digit);

    digit = nowdate.getMilliseconds();
    if ((digit <= 99) && (digit > 9)) {
        str += '0' + digit;
    } else if (digit <= 9) {
        str += '00' + digit;
    } else {
        str += '' + digit;
    }
    return str;
}

//10보다 작은 숫자에 '0'을 채워 리턴한다.
function paddingNo(val) {
    var st = '';
    if (val <= 9) {
        st += '0' + val;
    } else {
        st = '' + val;
    }
    return st;
}

//XTVID 쿠키생성 호출
makeXTVIDCookie();

function getXtractorCookie(key) {

    var cookies = document.cookie;
    var arr = cookies.split(";");
    for (idx = 0; idx < arr.length; idx++) {
        var cookieStr = arr[idx];
        var cookieArr = cookieStr.split("=");
        var name = cookieArr[0];
        name = xtractorTrimStr(name);
        if (key == name) {
            return cookieArr[1];
        }
    }
    return '';
}


function xtractorTrimStr(str) {
    return str.replace(/(^\s*)|(\s*$)/gi, "");
}
//식별키(쿠키명)
var xtractor_cookie_name = "XTVID";
var xtractor_user_name = "MN_USR_NO";


/* 해상도 분석 시작 */
try {
    var pcX = screen.width;
    var pcY = screen.height;
    var xloc = pcX + "X";
    xloc += pcY;
    setXTCookie("xloc", xloc, 365 * 10, "/", getXDomain());
} catch (e) {
}
/* 해상도 분석 끝 */


/* 구독 기사 히스토리 시작 */
try {

    var currUrl = window.location.href;

    if (currUrl.indexOf("html") > 0) {
        var fileName = currUrl.substring(currUrl.lastIndexOf("/") + 1, currUrl.lastIndexOf("."));
        if (fileName != null && fileName.indexOf("_") > 0) {
            var refArtId = fileName.split("_")[0];
            if (refArtId) {
                var paramValue = xtractorGetQuerystring("page_gbn");
                if (paramValue == "main") {
                    xtractorMergeCookie(refArtId);
                }
            }
        }
    }


} catch (e) {
}
/* 구독 기사 히스토리 끝 */

function xtractorMergeCookie(refArtId) {
    try {
        var hisCookie = getXtractorCookie(xtrhis);
        if (hisCookie) {
            var hisArr = hisCookie.split(".");
            var newHis = true;
            var hisIdx = 0;
            for (hisIdx = 0; hisIdx < hisArr.length; hisIdx++) {
                var hisId = hisArr[hisIdx];
                if (refArtId == hisId) {
                    newHis = false;
                }
            }
            if (newHis) {

                if (hisArr.length >= xtrhisMaxCnt) {
                    hisCookie = hisCookie.substring(hisCookie.indexOf(".") + 1, hisCookie.length);

                }
                setXTCookie(xtrhis, hisCookie + "." + refArtId, 30, "/", getXDomain());
            }
        } else {
            setXTCookie(xtrhis, refArtId, 30, "/", getXDomain());
        }
    } catch (e) { }
}
function xtractorGetQuerystring(key) {
    var default_ = "";
    try {
        key = key.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
        var regex = new RegExp("[\\?&]" + key + "=([^&#]*)");
        var qs = regex.exec(window.location.href);
        if (qs == null) {
            return default_;
        } else {
            return qs[1];
        }
    } catch (e) { }
    return default_;
}

function loadScriptAsync(scriptSrc, callback) {
    if (typeof callback !== 'function') {
        throw new Error('Not a valid callback for async script load');
    }
    var script = document.createElement('script');
    script.onload = callback;
    script.async = true;
    script.src = scriptSrc;
    document.head.appendChild(script);
}

function gtag(){dataLayer.push(arguments);}
                                                           
loadScriptAsync('https://www.googletagmanager.com/gtag/js?id=G-EHGYXECH50', function(){
    window.dataLayer = window.dataLayer || [];
    gtag('js', new Date());
    gtag('config', 'G-EHGYXECH50');    
    gtag('config', 'G-2W46X6EGLY');  
})﻿/**
 * Owl Carousel v2.3.4
 * Copyright 2013-2018 David Deutsch
 * Licensed under: SEE LICENSE IN https://github.com/OwlCarousel2/OwlCarousel2/blob/master/LICENSE
 */
/**
 * Owl carousel
 * @version 2.3.4
 * @author Bartosz Wojciechowski
 * @author David Deutsch
 * @license The MIT License (MIT)
 * @todo Lazy Load Icon
 * @todo prevent animationend bubling
 * @todo itemsScaleUp
 * @todo Test Zepto
 * @todo stagePadding calculate wrong active classes
 */
;(function($, window, document, undefined) {

	/**
	 * Creates a carousel.
	 * @class The Owl Carousel.
	 * @public
	 * @param {HTMLElement|jQuery} element - The element to create the carousel for.
	 * @param {Object} [options] - The options
	 */
	function Owl(element, options) {

		/**
		 * Current settings for the carousel.
		 * @public
		 */
		this.settings = null;

		/**
		 * Current options set by the caller including defaults.
		 * @public
		 */
		this.options = $.extend({}, Owl.Defaults, options);

		/**
		 * Plugin element.
		 * @public
		 */
		this.$element = $(element);

		/**
		 * Proxied event handlers.
		 * @protected
		 */
		this._handlers = {};

		/**
		 * References to the running plugins of this carousel.
		 * @protected
		 */
		this._plugins = {};

		/**
		 * Currently suppressed events to prevent them from being retriggered.
		 * @protected
		 */
		this._supress = {};

		/**
		 * Absolute current position.
		 * @protected
		 */
		this._current = null;

		/**
		 * Animation speed in milliseconds.
		 * @protected
		 */
		this._speed = null;

		/**
		 * Coordinates of all items in pixel.
		 * @todo The name of this member is missleading.
		 * @protected
		 */
		this._coordinates = [];

		/**
		 * Current breakpoint.
		 * @todo Real media queries would be nice.
		 * @protected
		 */
		this._breakpoint = null;

		/**
		 * Current width of the plugin element.
		 */
		this._width = null;

		/**
		 * All real items.
		 * @protected
		 */
		this._items = [];

		/**
		 * All cloned items.
		 * @protected
		 */
		this._clones = [];

		/**
		 * Merge values of all items.
		 * @todo Maybe this could be part of a plugin.
		 * @protected
		 */
		this._mergers = [];

		/**
		 * Widths of all items.
		 */
		this._widths = [];

		/**
		 * Invalidated parts within the update process.
		 * @protected
		 */
		this._invalidated = {};

		/**
		 * Ordered list of workers for the update process.
		 * @protected
		 */
		this._pipe = [];

		/**
		 * Current state information for the drag operation.
		 * @todo #261
		 * @protected
		 */
		this._drag = {
			time: null,
			target: null,
			pointer: null,
			stage: {
				start: null,
				current: null
			},
			direction: null
		};

		/**
		 * Current state information and their tags.
		 * @type {Object}
		 * @protected
		 */
		this._states = {
			current: {},
			tags: {
				'initializing': [ 'busy' ],
				'animating': [ 'busy' ],
				'dragging': [ 'interacting' ]
			}
		};

		$.each([ 'onResize', 'onThrottledResize' ], $.proxy(function(i, handler) {
			this._handlers[handler] = $.proxy(this[handler], this);
		}, this));

		$.each(Owl.Plugins, $.proxy(function(key, plugin) {
			this._plugins[key.charAt(0).toLowerCase() + key.slice(1)]
				= new plugin(this);
		}, this));

		$.each(Owl.Workers, $.proxy(function(priority, worker) {
			this._pipe.push({
				'filter': worker.filter,
				'run': $.proxy(worker.run, this)
			});
		}, this));

		this.setup();
		this.initialize();
	}

	/**
	 * Default options for the carousel.
	 * @public
	 */
	Owl.Defaults = {
		items: 3,
		loop: false,
		center: false,
		rewind: false,
		checkVisibility: true,

		mouseDrag: true,
		touchDrag: true,
		pullDrag: true,
		freeDrag: false,

		margin: 0,
		stagePadding: 0,

		merge: false,
		mergeFit: true,
		autoWidth: false,

		startPosition: 0,
		rtl: false,

		smartSpeed: 250,
		fluidSpeed: false,
		dragEndSpeed: false,

		responsive: {},
		responsiveRefreshRate: 200,
		responsiveBaseElement: window,

		fallbackEasing: 'swing',
		slideTransition: '',

		info: false,

		nestedItemSelector: false,
		itemElement: 'div',
		stageElement: 'div',

		refreshClass: 'owl-refresh',
		loadedClass: 'owl-loaded',
		loadingClass: 'owl-loading',
		rtlClass: 'owl-rtl',
		responsiveClass: 'owl-responsive',
		dragClass: 'owl-drag',
		itemClass: 'owl-item',
		stageClass: 'owl-stage',
		stageOuterClass: 'owl-stage-outer',
		grabClass: 'owl-grab'
	};

	/**
	 * Enumeration for width.
	 * @public
	 * @readonly
	 * @enum {String}
	 */
	Owl.Width = {
		Default: 'default',
		Inner: 'inner',
		Outer: 'outer'
	};

	/**
	 * Enumeration for types.
	 * @public
	 * @readonly
	 * @enum {String}
	 */
	Owl.Type = {
		Event: 'event',
		State: 'state'
	};

	/**
	 * Contains all registered plugins.
	 * @public
	 */
	Owl.Plugins = {};

	/**
	 * List of workers involved in the update process.
	 */
	Owl.Workers = [ {
		filter: [ 'width', 'settings' ],
		run: function() {
			this._width = this.$element.width();
		}
	}, {
		filter: [ 'width', 'items', 'settings' ],
		run: function(cache) {
			cache.current = this._items && this._items[this.relative(this._current)];
		}
	}, {
		filter: [ 'items', 'settings' ],
		run: function() {
			this.$stage.children('.cloned').remove();
		}
	}, {
		filter: [ 'width', 'items', 'settings' ],
		run: function(cache) {
			var margin = this.settings.margin || '',
				grid = !this.settings.autoWidth,
				rtl = this.settings.rtl,
				css = {
					'width': 'auto',
					'margin-left': rtl ? margin : '',
					'margin-right': rtl ? '' : margin
				};

			!grid && this.$stage.children().css(css);

			cache.css = css;
		}
	}, {
		filter: [ 'width', 'items', 'settings' ],
		run: function(cache) {
			var width = (this.width() / this.settings.items).toFixed(3) - this.settings.margin,
				merge = null,
				iterator = this._items.length,
				grid = !this.settings.autoWidth,
				widths = [];

			cache.items = {
				merge: false,
				width: width
			};

			while (iterator--) {
				merge = this._mergers[iterator];
				merge = this.settings.mergeFit && Math.min(merge, this.settings.items) || merge;

				cache.items.merge = merge > 1 || cache.items.merge;

				widths[iterator] = !grid ? this._items[iterator].width() : width * merge;
			}

			this._widths = widths;
		}
	}, {
		filter: [ 'items', 'settings' ],
		run: function() {
			var clones = [],
				items = this._items,
				settings = this.settings,
				// TODO: Should be computed from number of min width items in stage
				view = Math.max(settings.items * 2, 4),
				size = Math.ceil(items.length / 2) * 2,
				repeat = settings.loop && items.length ? settings.rewind ? view : Math.max(view, size) : 0,
				append = '',
				prepend = '';

			repeat /= 2;

			while (repeat > 0) {
				// Switch to only using appended clones
				clones.push(this.normalize(clones.length / 2, true));
				append = append + items[clones[clones.length - 1]][0].outerHTML;
				clones.push(this.normalize(items.length - 1 - (clones.length - 1) / 2, true));
				prepend = items[clones[clones.length - 1]][0].outerHTML + prepend;
				repeat -= 1;
			}

			this._clones = clones;

			$(append).addClass('cloned').appendTo(this.$stage);
			$(prepend).addClass('cloned').prependTo(this.$stage);
		}
	}, {
		filter: [ 'width', 'items', 'settings' ],
		run: function() {
			var rtl = this.settings.rtl ? 1 : -1,
				size = this._clones.length + this._items.length,
				iterator = -1,
				previous = 0,
				current = 0,
				coordinates = [];

			while (++iterator < size) {
				previous = coordinates[iterator - 1] || 0;
				current = this._widths[this.relative(iterator)] + this.settings.margin;
				coordinates.push(previous + current * rtl);
			}

			this._coordinates = coordinates;
		}
	}, {
		filter: [ 'width', 'items', 'settings' ],
		run: function() {
			var padding = this.settings.stagePadding,
				coordinates = this._coordinates,
				css = {
					'width': Math.ceil(Math.abs(coordinates[coordinates.length - 1])) + padding * 2,
					'padding-left': padding || '',
					'padding-right': padding || ''
				};

			this.$stage.css(css);
		}
	}, {
		filter: [ 'width', 'items', 'settings' ],
		run: function(cache) {
			var iterator = this._coordinates.length,
				grid = !this.settings.autoWidth,
				items = this.$stage.children();

			if (grid && cache.items.merge) {
				while (iterator--) {
					cache.css.width = this._widths[this.relative(iterator)];
					items.eq(iterator).css(cache.css);
				}
			} else if (grid) {
				cache.css.width = cache.items.width;
				items.css(cache.css);
			}
		}
	}, {
		filter: [ 'items' ],
		run: function() {
			this._coordinates.length < 1 && this.$stage.removeAttr('style');
		}
	}, {
		filter: [ 'width', 'items', 'settings' ],
		run: function(cache) {
			cache.current = cache.current ? this.$stage.children().index(cache.current) : 0;
			cache.current = Math.max(this.minimum(), Math.min(this.maximum(), cache.current));
			this.reset(cache.current);
		}
	}, {
		filter: [ 'position' ],
		run: function() {
			this.animate(this.coordinates(this._current));
		}
	}, {
		filter: [ 'width', 'position', 'items', 'settings' ],
		run: function() {
			var rtl = this.settings.rtl ? 1 : -1,
				padding = this.settings.stagePadding * 2,
				begin = this.coordinates(this.current()) + padding,
				end = begin + this.width() * rtl,
				inner, outer, matches = [], i, n;

			for (i = 0, n = this._coordinates.length; i < n; i++) {
				inner = this._coordinates[i - 1] || 0;
				outer = Math.abs(this._coordinates[i]) + padding * rtl;

				if ((this.op(inner, '<=', begin) && (this.op(inner, '>', end)))
					|| (this.op(outer, '<', begin) && this.op(outer, '>', end))) {
					matches.push(i);
				}
			}

			this.$stage.children('.active').removeClass('active');
			this.$stage.children(':eq(' + matches.join('), :eq(') + ')').addClass('active');

			this.$stage.children('.center').removeClass('center');
			if (this.settings.center) {
				this.$stage.children().eq(this.current()).addClass('center');
			}
		}
	} ];

	/**
	 * Create the stage DOM element
	 */
	Owl.prototype.initializeStage = function() {
		this.$stage = this.$element.find('.' + this.settings.stageClass);

		// if the stage is already in the DOM, grab it and skip stage initialization
		if (this.$stage.length) {
			return;
		}

		this.$element.addClass(this.options.loadingClass);

		// create stage
		this.$stage = $('<' + this.settings.stageElement + '>', {
			"class": this.settings.stageClass
		}).wrap( $( '<div/>', {
			"class": this.settings.stageOuterClass
		}));

		// append stage
		this.$element.append(this.$stage.parent());
	};

	/**
	 * Create item DOM elements
	 */
	Owl.prototype.initializeItems = function() {
		var $items = this.$element.find('.owl-item');

		// if the items are already in the DOM, grab them and skip item initialization
		if ($items.length) {
			this._items = $items.get().map(function(item) {
				return $(item);
			});

			this._mergers = this._items.map(function() {
				return 1;
			});

			this.refresh();

			return;
		}

		// append content
		this.replace(this.$element.children().not(this.$stage.parent()));

		// check visibility
		if (this.isVisible()) {
			// update view
			this.refresh();
		} else {
			// invalidate width
			this.invalidate('width');
		}

		this.$element
			.removeClass(this.options.loadingClass)
			.addClass(this.options.loadedClass);
	};

	/**
	 * Initializes the carousel.
	 * @protected
	 */
	Owl.prototype.initialize = function() {
		this.enter('initializing');
		this.trigger('initialize');

		this.$element.toggleClass(this.settings.rtlClass, this.settings.rtl);

		if (this.settings.autoWidth && !this.is('pre-loading')) {
			var imgs, nestedSelector, width;
			imgs = this.$element.find('img');
			nestedSelector = this.settings.nestedItemSelector ? '.' + this.settings.nestedItemSelector : undefined;
			width = this.$element.children(nestedSelector).width();

			if (imgs.length && width <= 0) {
				this.preloadAutoWidthImages(imgs);
			}
		}

		this.initializeStage();
		this.initializeItems();

		// register event handlers
		this.registerEventHandlers();

		this.leave('initializing');
		this.trigger('initialized');
	};

	/**
	 * @returns {Boolean} visibility of $element
	 *                    if you know the carousel will always be visible you can set `checkVisibility` to `false` to
	 *                    prevent the expensive browser layout forced reflow the $element.is(':visible') does
	 */
	Owl.prototype.isVisible = function() {
		return this.settings.checkVisibility
			? this.$element.is(':visible')
			: true;
	};

	/**
	 * Setups the current settings.
	 * @todo Remove responsive classes. Why should adaptive designs be brought into IE8?
	 * @todo Support for media queries by using `matchMedia` would be nice.
	 * @public
	 */
	Owl.prototype.setup = function() {
		var viewport = this.viewport(),
			overwrites = this.options.responsive,
			match = -1,
			settings = null;

		if (!overwrites) {
			settings = $.extend({}, this.options);
		} else {
			$.each(overwrites, function(breakpoint) {
				if (breakpoint <= viewport && breakpoint > match) {
					match = Number(breakpoint);
				}
			});

			settings = $.extend({}, this.options, overwrites[match]);
			if (typeof settings.stagePadding === 'function') {
				settings.stagePadding = settings.stagePadding();
			}
			delete settings.responsive;

			// responsive class
			if (settings.responsiveClass) {
				this.$element.attr('class',
					this.$element.attr('class').replace(new RegExp('(' + this.options.responsiveClass + '-)\\S+\\s', 'g'), '$1' + match)
				);
			}
		}

		this.trigger('change', { property: { name: 'settings', value: settings } });
		this._breakpoint = match;
		this.settings = settings;
		this.invalidate('settings');
		this.trigger('changed', { property: { name: 'settings', value: this.settings } });
	};

	/**
	 * Updates option logic if necessery.
	 * @protected
	 */
	Owl.prototype.optionsLogic = function() {
		if (this.settings.autoWidth) {
			this.settings.stagePadding = false;
			this.settings.merge = false;
		}
	};

	/**
	 * Prepares an item before add.
	 * @todo Rename event parameter `content` to `item`.
	 * @protected
	 * @returns {jQuery|HTMLElement} - The item container.
	 */
	Owl.prototype.prepare = function(item) {
		var event = this.trigger('prepare', { content: item });

		if (!event.data) {
			event.data = $('<' + this.settings.itemElement + '/>')
				.addClass(this.options.itemClass).append(item)
		}

		this.trigger('prepared', { content: event.data });

		return event.data;
	};

	/**
	 * Updates the view.
	 * @public
	 */
	Owl.prototype.update = function() {
		var i = 0,
			n = this._pipe.length,
			filter = $.proxy(function(p) { return this[p] }, this._invalidated),
			cache = {};

		while (i < n) {
			if (this._invalidated.all || $.grep(this._pipe[i].filter, filter).length > 0) {
				this._pipe[i].run(cache);
			}
			i++;
		}

		this._invalidated = {};

		!this.is('valid') && this.enter('valid');
	};

	/**
	 * Gets the width of the view.
	 * @public
	 * @param {Owl.Width} [dimension=Owl.Width.Default] - The dimension to return.
	 * @returns {Number} - The width of the view in pixel.
	 */
	Owl.prototype.width = function(dimension) {
		dimension = dimension || Owl.Width.Default;
		switch (dimension) {
			case Owl.Width.Inner:
			case Owl.Width.Outer:
				return this._width;
			default:
				return this._width - this.settings.stagePadding * 2 + this.settings.margin;
		}
	};

	/**
	 * Refreshes the carousel primarily for adaptive purposes.
	 * @public
	 */
	Owl.prototype.refresh = function() {
		this.enter('refreshing');
		this.trigger('refresh');

		this.setup();

		this.optionsLogic();

		this.$element.addClass(this.options.refreshClass);

		this.update();

		this.$element.removeClass(this.options.refreshClass);

		this.leave('refreshing');
		this.trigger('refreshed');
	};

	/**
	 * Checks window `resize` event.
	 * @protected
	 */
	Owl.prototype.onThrottledResize = function() {
		window.clearTimeout(this.resizeTimer);
		this.resizeTimer = window.setTimeout(this._handlers.onResize, this.settings.responsiveRefreshRate);
	};

	/**
	 * Checks window `resize` event.
	 * @protected
	 */
	Owl.prototype.onResize = function() {
		if (!this._items.length) {
			return false;
		}

		if (this._width === this.$element.width()) {
			return false;
		}

		if (!this.isVisible()) {
			return false;
		}

		this.enter('resizing');

		if (this.trigger('resize').isDefaultPrevented()) {
			this.leave('resizing');
			return false;
		}

		this.invalidate('width');

		this.refresh();

		this.leave('resizing');
		this.trigger('resized');
	};

	/**
	 * Registers event handlers.
	 * @todo Check `msPointerEnabled`
	 * @todo #261
	 * @protected
	 */
	Owl.prototype.registerEventHandlers = function() {
		if ($.support.transition) {
			this.$stage.on($.support.transition.end + '.owl.core', $.proxy(this.onTransitionEnd, this));
		}

		if (this.settings.responsive !== false) {
			this.on(window, 'resize', this._handlers.onThrottledResize);
		}

		if (this.settings.mouseDrag) {
			this.$element.addClass(this.options.dragClass);
			this.$stage.on('mousedown.owl.core', $.proxy(this.onDragStart, this));
			this.$stage.on('dragstart.owl.core selectstart.owl.core', function() { return false });
		}

		if (this.settings.touchDrag){
			this.$stage.on('touchstart.owl.core', $.proxy(this.onDragStart, this));
			this.$stage.on('touchcancel.owl.core', $.proxy(this.onDragEnd, this));
		}
	};

	/**
	 * Handles `touchstart` and `mousedown` events.
	 * @todo Horizontal swipe threshold as option
	 * @todo #261
	 * @protected
	 * @param {Event} event - The event arguments.
	 */
	Owl.prototype.onDragStart = function(event) {
		var stage = null;

		if (event.which === 3) {
			return;
		}

		if ($.support.transform) {
			stage = this.$stage.css('transform').replace(/.*\(|\)| /g, '').split(',');
			stage = {
				x: stage[stage.length === 16 ? 12 : 4],
				y: stage[stage.length === 16 ? 13 : 5]
			};
		} else {
			stage = this.$stage.position();
			stage = {
				x: this.settings.rtl ?
					stage.left + this.$stage.width() - this.width() + this.settings.margin :
					stage.left,
				y: stage.top
			};
		}

		if (this.is('animating')) {
			$.support.transform ? this.animate(stage.x) : this.$stage.stop()
			this.invalidate('position');
		}

		this.$element.toggleClass(this.options.grabClass, event.type === 'mousedown');

		this.speed(0);

		this._drag.time = new Date().getTime();
		this._drag.target = $(event.target);
		this._drag.stage.start = stage;
		this._drag.stage.current = stage;
		this._drag.pointer = this.pointer(event);

		$(document).on('mouseup.owl.core touchend.owl.core', $.proxy(this.onDragEnd, this));

		$(document).one('mousemove.owl.core touchmove.owl.core', $.proxy(function(event) {
			var delta = this.difference(this._drag.pointer, this.pointer(event));

			$(document).on('mousemove.owl.core touchmove.owl.core', $.proxy(this.onDragMove, this));

			if (Math.abs(delta.x) < Math.abs(delta.y) && this.is('valid')) {
				return;
			}

			event.preventDefault();

			this.enter('dragging');
			this.trigger('drag');
		}, this));
	};

	/**
	 * Handles the `touchmove` and `mousemove` events.
	 * @todo #261
	 * @protected
	 * @param {Event} event - The event arguments.
	 */
	Owl.prototype.onDragMove = function(event) {
		var minimum = null,
			maximum = null,
			pull = null,
			delta = this.difference(this._drag.pointer, this.pointer(event)),
			stage = this.difference(this._drag.stage.start, delta);

		if (!this.is('dragging')) {
			return;
		}

		event.preventDefault();

		if (this.settings.loop) {
			minimum = this.coordinates(this.minimum());
			maximum = this.coordinates(this.maximum() + 1) - minimum;
			stage.x = (((stage.x - minimum) % maximum + maximum) % maximum) + minimum;
		} else {
			minimum = this.settings.rtl ? this.coordinates(this.maximum()) : this.coordinates(this.minimum());
			maximum = this.settings.rtl ? this.coordinates(this.minimum()) : this.coordinates(this.maximum());
			pull = this.settings.pullDrag ? -1 * delta.x / 5 : 0;
			stage.x = Math.max(Math.min(stage.x, minimum + pull), maximum + pull);
		}

		this._drag.stage.current = stage;

		this.animate(stage.x);
	};

	/**
	 * Handles the `touchend` and `mouseup` events.
	 * @todo #261
	 * @todo Threshold for click event
	 * @protected
	 * @param {Event} event - The event arguments.
	 */
	Owl.prototype.onDragEnd = function(event) {
		var delta = this.difference(this._drag.pointer, this.pointer(event)),
			stage = this._drag.stage.current,
			direction = delta.x > 0 ^ this.settings.rtl ? 'left' : 'right';

		$(document).off('.owl.core');

		this.$element.removeClass(this.options.grabClass);

		if (delta.x !== 0 && this.is('dragging') || !this.is('valid')) {
			this.speed(this.settings.dragEndSpeed || this.settings.smartSpeed);
			this.current(this.closest(stage.x, delta.x !== 0 ? direction : this._drag.direction));
			this.invalidate('position');
			this.update();

			this._drag.direction = direction;

			if (Math.abs(delta.x) > 3 || new Date().getTime() - this._drag.time > 300) {
				this._drag.target.one('click.owl.core', function() { return false; });
			}
		}

		if (!this.is('dragging')) {
			return;
		}

		this.leave('dragging');
		this.trigger('dragged');
	};

	/**
	 * Gets absolute position of the closest item for a coordinate.
	 * @todo Setting `freeDrag` makes `closest` not reusable. See #165.
	 * @protected
	 * @param {Number} coordinate - The coordinate in pixel.
	 * @param {String} direction - The direction to check for the closest item. Ether `left` or `right`.
	 * @return {Number} - The absolute position of the closest item.
	 */
	Owl.prototype.closest = function(coordinate, direction) {
		var position = -1,
			pull = 30,
			width = this.width(),
			coordinates = this.coordinates();

		if (!this.settings.freeDrag) {
			// check closest item
			$.each(coordinates, $.proxy(function(index, value) {
				// on a left pull, check on current index
				if (direction === 'left' && coordinate > value - pull && coordinate < value + pull) {
					position = index;
				// on a right pull, check on previous index
				// to do so, subtract width from value and set position = index + 1
				} else if (direction === 'right' && coordinate > value - width - pull && coordinate < value - width + pull) {
					position = index + 1;
				} else if (this.op(coordinate, '<', value)
					&& this.op(coordinate, '>', coordinates[index + 1] !== undefined ? coordinates[index + 1] : value - width)) {
					position = direction === 'left' ? index + 1 : index;
				}
				return position === -1;
			}, this));
		}

		if (!this.settings.loop) {
			// non loop boundries
			if (this.op(coordinate, '>', coordinates[this.minimum()])) {
				position = coordinate = this.minimum();
			} else if (this.op(coordinate, '<', coordinates[this.maximum()])) {
				position = coordinate = this.maximum();
			}
		}

		return position;
	};

	/**
	 * Animates the stage.
	 * @todo #270
	 * @public
	 * @param {Number} coordinate - The coordinate in pixels.
	 */
	Owl.prototype.animate = function(coordinate) {
		var animate = this.speed() > 0;

		this.is('animating') && this.onTransitionEnd();

		if (animate) {
			this.enter('animating');
			this.trigger('translate');
		}

		if ($.support.transform3d && $.support.transition) {
			this.$stage.css({
				transform: 'translate3d(' + coordinate + 'px,0px,0px)',
				transition: (this.speed() / 1000) + 's' + (
					this.settings.slideTransition ? ' ' + this.settings.slideTransition : ''
				)
			});
		} else if (animate) {
			this.$stage.animate({
				left: coordinate + 'px'
			}, this.speed(), this.settings.fallbackEasing, $.proxy(this.onTransitionEnd, this));
		} else {
			this.$stage.css({
				left: coordinate + 'px'
			});
		}
	};

	/**
	 * Checks whether the carousel is in a specific state or not.
	 * @param {String} state - The state to check.
	 * @returns {Boolean} - The flag which indicates if the carousel is busy.
	 */
	Owl.prototype.is = function(state) {
		return this._states.current[state] && this._states.current[state] > 0;
	};

	/**
	 * Sets the absolute position of the current item.
	 * @public
	 * @param {Number} [position] - The new absolute position or nothing to leave it unchanged.
	 * @returns {Number} - The absolute position of the current item.
	 */
	Owl.prototype.current = function(position) {
		if (position === undefined) {
			return this._current;
		}

		if (this._items.length === 0) {
			return undefined;
		}

		position = this.normalize(position);

		if (this._current !== position) {
			var event = this.trigger('change', { property: { name: 'position', value: position } });

			if (event.data !== undefined) {
				position = this.normalize(event.data);
			}

			this._current = position;

			this.invalidate('position');

			this.trigger('changed', { property: { name: 'position', value: this._current } });
		}

		return this._current;
	};

	/**
	 * Invalidates the given part of the update routine.
	 * @param {String} [part] - The part to invalidate.
	 * @returns {Array.<String>} - The invalidated parts.
	 */
	Owl.prototype.invalidate = function(part) {
		if ($.type(part) === 'string') {
			this._invalidated[part] = true;
			this.is('valid') && this.leave('valid');
		}
		return $.map(this._invalidated, function(v, i) { return i });
	};

	/**
	 * Resets the absolute position of the current item.
	 * @public
	 * @param {Number} position - The absolute position of the new item.
	 */
	Owl.prototype.reset = function(position) {
		position = this.normalize(position);

		if (position === undefined) {
			return;
		}

		this._speed = 0;
		this._current = position;

		this.suppress([ 'translate', 'translated' ]);

		this.animate(this.coordinates(position));

		this.release([ 'translate', 'translated' ]);
	};

	/**
	 * Normalizes an absolute or a relative position of an item.
	 * @public
	 * @param {Number} position - The absolute or relative position to normalize.
	 * @param {Boolean} [relative=false] - Whether the given position is relative or not.
	 * @returns {Number} - The normalized position.
	 */
	Owl.prototype.normalize = function(position, relative) {
		var n = this._items.length,
			m = relative ? 0 : this._clones.length;

		if (!this.isNumeric(position) || n < 1) {
			position = undefined;
		} else if (position < 0 || position >= n + m) {
			position = ((position - m / 2) % n + n) % n + m / 2;
		}

		return position;
	};

	/**
	 * Converts an absolute position of an item into a relative one.
	 * @public
	 * @param {Number} position - The absolute position to convert.
	 * @returns {Number} - The converted position.
	 */
	Owl.prototype.relative = function(position) {
		position -= this._clones.length / 2;
		return this.normalize(position, true);
	};

	/**
	 * Gets the maximum position for the current item.
	 * @public
	 * @param {Boolean} [relative=false] - Whether to return an absolute position or a relative position.
	 * @returns {Number}
	 */
	Owl.prototype.maximum = function(relative) {
		var settings = this.settings,
			maximum = this._coordinates.length,
			iterator,
			reciprocalItemsWidth,
			elementWidth;

		if (settings.loop) {
			maximum = this._clones.length / 2 + this._items.length - 1;
		} else if (settings.autoWidth || settings.merge) {
			iterator = this._items.length;
			if (iterator) {
				reciprocalItemsWidth = this._items[--iterator].width();
				elementWidth = this.$element.width();
				while (iterator--) {
					reciprocalItemsWidth += this._items[iterator].width() + this.settings.margin;
					if (reciprocalItemsWidth > elementWidth) {
						break;
					}
				}
			}
			maximum = iterator + 1;
		} else if (settings.center) {
			maximum = this._items.length - 1;
		} else {
			maximum = this._items.length - settings.items;
		}

		if (relative) {
			maximum -= this._clones.length / 2;
		}

		return Math.max(maximum, 0);
	};

	/**
	 * Gets the minimum position for the current item.
	 * @public
	 * @param {Boolean} [relative=false] - Whether to return an absolute position or a relative position.
	 * @returns {Number}
	 */
	Owl.prototype.minimum = function(relative) {
		return relative ? 0 : this._clones.length / 2;
	};

	/**
	 * Gets an item at the specified relative position.
	 * @public
	 * @param {Number} [position] - The relative position of the item.
	 * @return {jQuery|Array.<jQuery>} - The item at the given position or all items if no position was given.
	 */
	Owl.prototype.items = function(position) {
		if (position === undefined) {
			return this._items.slice();
		}

		position = this.normalize(position, true);
		return this._items[position];
	};

	/**
	 * Gets an item at the specified relative position.
	 * @public
	 * @param {Number} [position] - The relative position of the item.
	 * @return {jQuery|Array.<jQuery>} - The item at the given position or all items if no position was given.
	 */
	Owl.prototype.mergers = function(position) {
		if (position === undefined) {
			return this._mergers.slice();
		}

		position = this.normalize(position, true);
		return this._mergers[position];
	};

	/**
	 * Gets the absolute positions of clones for an item.
	 * @public
	 * @param {Number} [position] - The relative position of the item.
	 * @returns {Array.<Number>} - The absolute positions of clones for the item or all if no position was given.
	 */
	Owl.prototype.clones = function(position) {
		var odd = this._clones.length / 2,
			even = odd + this._items.length,
			map = function(index) { return index % 2 === 0 ? even + index / 2 : odd - (index + 1) / 2 };

		if (position === undefined) {
			return $.map(this._clones, function(v, i) { return map(i) });
		}

		return $.map(this._clones, function(v, i) { return v === position ? map(i) : null });
	};

	/**
	 * Sets the current animation speed.
	 * @public
	 * @param {Number} [speed] - The animation speed in milliseconds or nothing to leave it unchanged.
	 * @returns {Number} - The current animation speed in milliseconds.
	 */
	Owl.prototype.speed = function(speed) {
		if (speed !== undefined) {
			this._speed = speed;
		}

		return this._speed;
	};

	/**
	 * Gets the coordinate of an item.
	 * @todo The name of this method is missleanding.
	 * @public
	 * @param {Number} position - The absolute position of the item within `minimum()` and `maximum()`.
	 * @returns {Number|Array.<Number>} - The coordinate of the item in pixel or all coordinates.
	 */
	Owl.prototype.coordinates = function(position) {
		var multiplier = 1,
			newPosition = position - 1,
			coordinate;

		if (position === undefined) {
			return $.map(this._coordinates, $.proxy(function(coordinate, index) {
				return this.coordinates(index);
			}, this));
		}

		if (this.settings.center) {
			if (this.settings.rtl) {
				multiplier = -1;
				newPosition = position + 1;
			}

			coordinate = this._coordinates[position];
			coordinate += (this.width() - coordinate + (this._coordinates[newPosition] || 0)) / 2 * multiplier;
		} else {
			coordinate = this._coordinates[newPosition] || 0;
		}

		coordinate = Math.ceil(coordinate);

		return coordinate;
	};

	/**
	 * Calculates the speed for a translation.
	 * @protected
	 * @param {Number} from - The absolute position of the start item.
	 * @param {Number} to - The absolute position of the target item.
	 * @param {Number} [factor=undefined] - The time factor in milliseconds.
	 * @returns {Number} - The time in milliseconds for the translation.
	 */
	Owl.prototype.duration = function(from, to, factor) {
		if (factor === 0) {
			return 0;
		}

		return Math.min(Math.max(Math.abs(to - from), 1), 6) * Math.abs((factor || this.settings.smartSpeed));
	};

	/**
	 * Slides to the specified item.
	 * @public
	 * @param {Number} position - The position of the item.
	 * @param {Number} [speed] - The time in milliseconds for the transition.
	 */
	Owl.prototype.to = function(position, speed) {
		var current = this.current(),
			revert = null,
			distance = position - this.relative(current),
			direction = (distance > 0) - (distance < 0),
			items = this._items.length,
			minimum = this.minimum(),
			maximum = this.maximum();

		if (this.settings.loop) {
			if (!this.settings.rewind && Math.abs(distance) > items / 2) {
				distance += direction * -1 * items;
			}

			position = current + distance;
			revert = ((position - minimum) % items + items) % items + minimum;

			if (revert !== position && revert - distance <= maximum && revert - distance > 0) {
				current = revert - distance;
				position = revert;
				this.reset(current);
			}
		} else if (this.settings.rewind) {
			maximum += 1;
			position = (position % maximum + maximum) % maximum;
		} else {
			position = Math.max(minimum, Math.min(maximum, position));
		}

		this.speed(this.duration(current, position, speed));
		this.current(position);

		if (this.isVisible()) {
			this.update();
		}
	};

	/**
	 * Slides to the next item.
	 * @public
	 * @param {Number} [speed] - The time in milliseconds for the transition.
	 */
	Owl.prototype.next = function(speed) {
		speed = speed || false;
		this.to(this.relative(this.current()) + 1, speed);
	};

	/**
	 * Slides to the previous item.
	 * @public
	 * @param {Number} [speed] - The time in milliseconds for the transition.
	 */
	Owl.prototype.prev = function(speed) {
		speed = speed || false;
		this.to(this.relative(this.current()) - 1, speed);
	};

	/**
	 * Handles the end of an animation.
	 * @protected
	 * @param {Event} event - The event arguments.
	 */
	Owl.prototype.onTransitionEnd = function(event) {

		// if css2 animation then event object is undefined
		if (event !== undefined) {
			event.stopPropagation();

			// Catch only owl-stage transitionEnd event
			if ((event.target || event.srcElement || event.originalTarget) !== this.$stage.get(0)) {
				return false;
			}
		}

		this.leave('animating');
		this.trigger('translated');
	};

	/**
	 * Gets viewport width.
	 * @protected
	 * @return {Number} - The width in pixel.
	 */
	Owl.prototype.viewport = function() {
		var width;
		if (this.options.responsiveBaseElement !== window) {
			width = $(this.options.responsiveBaseElement).width();
		} else if (window.innerWidth) {
			width = window.innerWidth;
		} else if (document.documentElement && document.documentElement.clientWidth) {
			width = document.documentElement.clientWidth;
		} else {
			console.warn('Can not detect viewport width.');
		}
		return width;
	};

	/**
	 * Replaces the current content.
	 * @public
	 * @param {HTMLElement|jQuery|String} content - The new content.
	 */
	Owl.prototype.replace = function(content) {
		this.$stage.empty();
		this._items = [];

		if (content) {
			content = (content instanceof jQuery) ? content : $(content);
		}

		if (this.settings.nestedItemSelector) {
			content = content.find('.' + this.settings.nestedItemSelector);
		}

		content.filter(function() {
			return this.nodeType === 1;
		}).each($.proxy(function(index, item) {
			item = this.prepare(item);
			this.$stage.append(item);
			this._items.push(item);
			this._mergers.push(item.find('[data-merge]').addBack('[data-merge]').attr('data-merge') * 1 || 1);
		}, this));

		this.reset(this.isNumeric(this.settings.startPosition) ? this.settings.startPosition : 0);

		this.invalidate('items');
	};

	/**
	 * Adds an item.
	 * @todo Use `item` instead of `content` for the event arguments.
	 * @public
	 * @param {HTMLElement|jQuery|String} content - The item content to add.
	 * @param {Number} [position] - The relative position at which to insert the item otherwise the item will be added to the end.
	 */
	Owl.prototype.add = function(content, position) {
		var current = this.relative(this._current);

		position = position === undefined ? this._items.length : this.normalize(position, true);
		content = content instanceof jQuery ? content : $(content);

		this.trigger('add', { content: content, position: position });

		content = this.prepare(content);

		if (this._items.length === 0 || position === this._items.length) {
			this._items.length === 0 && this.$stage.append(content);
			this._items.length !== 0 && this._items[position - 1].after(content);
			this._items.push(content);
			this._mergers.push(content.find('[data-merge]').addBack('[data-merge]').attr('data-merge') * 1 || 1);
		} else {
			this._items[position].before(content);
			this._items.splice(position, 0, content);
			this._mergers.splice(position, 0, content.find('[data-merge]').addBack('[data-merge]').attr('data-merge') * 1 || 1);
		}

		this._items[current] && this.reset(this._items[current].index());

		this.invalidate('items');

		this.trigger('added', { content: content, position: position });
	};

	/**
	 * Removes an item by its position.
	 * @todo Use `item` instead of `content` for the event arguments.
	 * @public
	 * @param {Number} position - The relative position of the item to remove.
	 */
	Owl.prototype.remove = function(position) {
		position = this.normalize(position, true);

		if (position === undefined) {
			return;
		}

		this.trigger('remove', { content: this._items[position], position: position });

		this._items[position].remove();
		this._items.splice(position, 1);
		this._mergers.splice(position, 1);

		this.invalidate('items');

		this.trigger('removed', { content: null, position: position });
	};

	/**
	 * Preloads images with auto width.
	 * @todo Replace by a more generic approach
	 * @protected
	 */
	Owl.prototype.preloadAutoWidthImages = function(images) {
		images.each($.proxy(function(i, element) {
			this.enter('pre-loading');
			element = $(element);
			$(new Image()).one('load', $.proxy(function(e) {
				element.attr('src', e.target.src);
				element.css('opacity', 1);
				this.leave('pre-loading');
				!this.is('pre-loading') && !this.is('initializing') && this.refresh();
			}, this)).attr('src', element.attr('src') || element.attr('data-src') || element.attr('data-src-retina'));
		}, this));
	};

	/**
	 * Destroys the carousel.
	 * @public
	 */
	Owl.prototype.destroy = function() {

		this.$element.off('.owl.core');
		this.$stage.off('.owl.core');
		$(document).off('.owl.core');

		if (this.settings.responsive !== false) {
			window.clearTimeout(this.resizeTimer);
			this.off(window, 'resize', this._handlers.onThrottledResize);
		}

		for (var i in this._plugins) {
			this._plugins[i].destroy();
		}

		this.$stage.children('.cloned').remove();

		this.$stage.unwrap();
		this.$stage.children().contents().unwrap();
		this.$stage.children().unwrap();
		this.$stage.remove();
		this.$element
			.removeClass(this.options.refreshClass)
			.removeClass(this.options.loadingClass)
			.removeClass(this.options.loadedClass)
			.removeClass(this.options.rtlClass)
			.removeClass(this.options.dragClass)
			.removeClass(this.options.grabClass)
			.attr('class', this.$element.attr('class').replace(new RegExp(this.options.responsiveClass + '-\\S+\\s', 'g'), ''))
			.removeData('owl.carousel');
	};

	/**
	 * Operators to calculate right-to-left and left-to-right.
	 * @protected
	 * @param {Number} [a] - The left side operand.
	 * @param {String} [o] - The operator.
	 * @param {Number} [b] - The right side operand.
	 */
	Owl.prototype.op = function(a, o, b) {
		var rtl = this.settings.rtl;
		switch (o) {
			case '<':
				return rtl ? a > b : a < b;
			case '>':
				return rtl ? a < b : a > b;
			case '>=':
				return rtl ? a <= b : a >= b;
			case '<=':
				return rtl ? a >= b : a <= b;
			default:
				break;
		}
	};

	/**
	 * Attaches to an internal event.
	 * @protected
	 * @param {HTMLElement} element - The event source.
	 * @param {String} event - The event name.
	 * @param {Function} listener - The event handler to attach.
	 * @param {Boolean} capture - Wether the event should be handled at the capturing phase or not.
	 */
	Owl.prototype.on = function(element, event, listener, capture) {
		if (element.addEventListener) {
			element.addEventListener(event, listener, capture);
		} else if (element.attachEvent) {
			element.attachEvent('on' + event, listener);
		}
	};

	/**
	 * Detaches from an internal event.
	 * @protected
	 * @param {HTMLElement} element - The event source.
	 * @param {String} event - The event name.
	 * @param {Function} listener - The attached event handler to detach.
	 * @param {Boolean} capture - Wether the attached event handler was registered as a capturing listener or not.
	 */
	Owl.prototype.off = function(element, event, listener, capture) {
		if (element.removeEventListener) {
			element.removeEventListener(event, listener, capture);
		} else if (element.detachEvent) {
			element.detachEvent('on' + event, listener);
		}
	};

	/**
	 * Triggers a public event.
	 * @todo Remove `status`, `relatedTarget` should be used instead.
	 * @protected
	 * @param {String} name - The event name.
	 * @param {*} [data=null] - The event data.
	 * @param {String} [namespace=carousel] - The event namespace.
	 * @param {String} [state] - The state which is associated with the event.
	 * @param {Boolean} [enter=false] - Indicates if the call enters the specified state or not.
	 * @returns {Event} - The event arguments.
	 */
	Owl.prototype.trigger = function(name, data, namespace, state, enter) {
		var status = {
			item: { count: this._items.length, index: this.current() }
		}, handler = $.camelCase(
			$.grep([ 'on', name, namespace ], function(v) { return v })
				.join('-').toLowerCase()
		), event = $.Event(
			[ name, 'owl', namespace || 'carousel' ].join('.').toLowerCase(),
			$.extend({ relatedTarget: this }, status, data)
		);

		if (!this._supress[name]) {
			$.each(this._plugins, function(name, plugin) {
				if (plugin.onTrigger) {
					plugin.onTrigger(event);
				}
			});

			this.register({ type: Owl.Type.Event, name: name });
			this.$element.trigger(event);

			if (this.settings && typeof this.settings[handler] === 'function') {
				this.settings[handler].call(this, event);
			}
		}

		return event;
	};

	/**
	 * Enters a state.
	 * @param name - The state name.
	 */
	Owl.prototype.enter = function(name) {
		$.each([ name ].concat(this._states.tags[name] || []), $.proxy(function(i, name) {
			if (this._states.current[name] === undefined) {
				this._states.current[name] = 0;
			}

			this._states.current[name]++;
		}, this));
	};

	/**
	 * Leaves a state.
	 * @param name - The state name.
	 */
	Owl.prototype.leave = function(name) {
		$.each([ name ].concat(this._states.tags[name] || []), $.proxy(function(i, name) {
			this._states.current[name]--;
		}, this));
	};

	/**
	 * Registers an event or state.
	 * @public
	 * @param {Object} object - The event or state to register.
	 */
	Owl.prototype.register = function(object) {
		if (object.type === Owl.Type.Event) {
			if (!$.event.special[object.name]) {
				$.event.special[object.name] = {};
			}

			if (!$.event.special[object.name].owl) {
				var _default = $.event.special[object.name]._default;
				$.event.special[object.name]._default = function(e) {
					if (_default && _default.apply && (!e.namespace || e.namespace.indexOf('owl') === -1)) {
						return _default.apply(this, arguments);
					}
					return e.namespace && e.namespace.indexOf('owl') > -1;
				};
				$.event.special[object.name].owl = true;
			}
		} else if (object.type === Owl.Type.State) {
			if (!this._states.tags[object.name]) {
				this._states.tags[object.name] = object.tags;
			} else {
				this._states.tags[object.name] = this._states.tags[object.name].concat(object.tags);
			}

			this._states.tags[object.name] = $.grep(this._states.tags[object.name], $.proxy(function(tag, i) {
				return $.inArray(tag, this._states.tags[object.name]) === i;
			}, this));
		}
	};

	/**
	 * Suppresses events.
	 * @protected
	 * @param {Array.<String>} events - The events to suppress.
	 */
	Owl.prototype.suppress = function(events) {
		$.each(events, $.proxy(function(index, event) {
			this._supress[event] = true;
		}, this));
	};

	/**
	 * Releases suppressed events.
	 * @protected
	 * @param {Array.<String>} events - The events to release.
	 */
	Owl.prototype.release = function(events) {
		$.each(events, $.proxy(function(index, event) {
			delete this._supress[event];
		}, this));
	};

	/**
	 * Gets unified pointer coordinates from event.
	 * @todo #261
	 * @protected
	 * @param {Event} - The `mousedown` or `touchstart` event.
	 * @returns {Object} - Contains `x` and `y` coordinates of current pointer position.
	 */
	Owl.prototype.pointer = function(event) {
		var result = { x: null, y: null };

		event = event.originalEvent || event || window.event;

		event = event.touches && event.touches.length ?
			event.touches[0] : event.changedTouches && event.changedTouches.length ?
				event.changedTouches[0] : event;

		if (event.pageX) {
			result.x = event.pageX;
			result.y = event.pageY;
		} else {
			result.x = event.clientX;
			result.y = event.clientY;
		}

		return result;
	};

	/**
	 * Determines if the input is a Number or something that can be coerced to a Number
	 * @protected
	 * @param {Number|String|Object|Array|Boolean|RegExp|Function|Symbol} - The input to be tested
	 * @returns {Boolean} - An indication if the input is a Number or can be coerced to a Number
	 */
	Owl.prototype.isNumeric = function(number) {
		return !isNaN(parseFloat(number));
	};

	/**
	 * Gets the difference of two vectors.
	 * @todo #261
	 * @protected
	 * @param {Object} - The first vector.
	 * @param {Object} - The second vector.
	 * @returns {Object} - The difference.
	 */
	Owl.prototype.difference = function(first, second) {
		return {
			x: first.x - second.x,
			y: first.y - second.y
		};
	};

	/**
	 * The jQuery Plugin for the Owl Carousel
	 * @todo Navigation plugin `next` and `prev`
	 * @public
	 */
	$.fn.owlCarousel = function(option) {
		var args = Array.prototype.slice.call(arguments, 1);

		return this.each(function() {
			var $this = $(this),
				data = $this.data('owl.carousel');

			if (!data) {
				data = new Owl(this, typeof option == 'object' && option);
				$this.data('owl.carousel', data);

				$.each([
					'next', 'prev', 'to', 'destroy', 'refresh', 'replace', 'add', 'remove'
				], function(i, event) {
					data.register({ type: Owl.Type.Event, name: event });
					data.$element.on(event + '.owl.carousel.core', $.proxy(function(e) {
						if (e.namespace && e.relatedTarget !== this) {
							this.suppress([ event ]);
							data[event].apply(this, [].slice.call(arguments, 1));
							this.release([ event ]);
						}
					}, data));
				});
			}

			if (typeof option == 'string' && option.charAt(0) !== '_') {
				data[option].apply(data, args);
			}
		});
	};

	/**
	 * The constructor for the jQuery Plugin
	 * @public
	 */
	$.fn.owlCarousel.Constructor = Owl;

})(window.Zepto || window.jQuery, window, document);

/**
 * AutoRefresh Plugin
 * @version 2.3.4
 * @author Artus Kolanowski
 * @author David Deutsch
 * @license The MIT License (MIT)
 */
;(function($, window, document, undefined) {

	/**
	 * Creates the auto refresh plugin.
	 * @class The Auto Refresh Plugin
	 * @param {Owl} carousel - The Owl Carousel
	 */
	var AutoRefresh = function(carousel) {
		/**
		 * Reference to the core.
		 * @protected
		 * @type {Owl}
		 */
		this._core = carousel;

		/**
		 * Refresh interval.
		 * @protected
		 * @type {number}
		 */
		this._interval = null;

		/**
		 * Whether the element is currently visible or not.
		 * @protected
		 * @type {Boolean}
		 */
		this._visible = null;

		/**
		 * All event handlers.
		 * @protected
		 * @type {Object}
		 */
		this._handlers = {
			'initialized.owl.carousel': $.proxy(function(e) {
				if (e.namespace && this._core.settings.autoRefresh) {
					this.watch();
				}
			}, this)
		};

		// set default options
		this._core.options = $.extend({}, AutoRefresh.Defaults, this._core.options);

		// register event handlers
		this._core.$element.on(this._handlers);
	};

	/**
	 * Default options.
	 * @public
	 */
	AutoRefresh.Defaults = {
		autoRefresh: true,
		autoRefreshInterval: 500
	};

	/**
	 * Watches the element.
	 */
	AutoRefresh.prototype.watch = function() {
		if (this._interval) {
			return;
		}

		this._visible = this._core.isVisible();
		this._interval = window.setInterval($.proxy(this.refresh, this), this._core.settings.autoRefreshInterval);
	};

	/**
	 * Refreshes the element.
	 */
	AutoRefresh.prototype.refresh = function() {
		if (this._core.isVisible() === this._visible) {
			return;
		}

		this._visible = !this._visible;

		this._core.$element.toggleClass('owl-hidden', !this._visible);

		this._visible && (this._core.invalidate('width') && this._core.refresh());
	};

	/**
	 * Destroys the plugin.
	 */
	AutoRefresh.prototype.destroy = function() {
		var handler, property;

		window.clearInterval(this._interval);

		for (handler in this._handlers) {
			this._core.$element.off(handler, this._handlers[handler]);
		}
		for (property in Object.getOwnPropertyNames(this)) {
			typeof this[property] != 'function' && (this[property] = null);
		}
	};

	$.fn.owlCarousel.Constructor.Plugins.AutoRefresh = AutoRefresh;

})(window.Zepto || window.jQuery, window, document);

/**
 * Lazy Plugin
 * @version 2.3.4
 * @author Bartosz Wojciechowski
 * @author David Deutsch
 * @license The MIT License (MIT)
 */
;(function($, window, document, undefined) {

	/**
	 * Creates the lazy plugin.
	 * @class The Lazy Plugin
	 * @param {Owl} carousel - The Owl Carousel
	 */
	var Lazy = function(carousel) {

		/**
		 * Reference to the core.
		 * @protected
		 * @type {Owl}
		 */
		this._core = carousel;

		/**
		 * Already loaded items.
		 * @protected
		 * @type {Array.<jQuery>}
		 */
		this._loaded = [];

		/**
		 * Event handlers.
		 * @protected
		 * @type {Object}
		 */
		this._handlers = {
			'initialized.owl.carousel change.owl.carousel resized.owl.carousel': $.proxy(function(e) {
				if (!e.namespace) {
					return;
				}

				if (!this._core.settings || !this._core.settings.lazyLoad) {
					return;
				}

				if ((e.property && e.property.name == 'position') || e.type == 'initialized') {
					var settings = this._core.settings,
						n = (settings.center && Math.ceil(settings.items / 2) || settings.items),
						i = ((settings.center && n * -1) || 0),
						position = (e.property && e.property.value !== undefined ? e.property.value : this._core.current()) + i,
						clones = this._core.clones().length,
						load = $.proxy(function(i, v) { this.load(v) }, this);
					//TODO: Need documentation for this new option
					if (settings.lazyLoadEager > 0) {
						n += settings.lazyLoadEager;
						// If the carousel is looping also preload images that are to the "left"
						if (settings.loop) {
              position -= settings.lazyLoadEager;
              n++;
            }
					}

					while (i++ < n) {
						this.load(clones / 2 + this._core.relative(position));
						clones && $.each(this._core.clones(this._core.relative(position)), load);
						position++;
					}
				}
			}, this)
		};

		// set the default options
		this._core.options = $.extend({}, Lazy.Defaults, this._core.options);

		// register event handler
		this._core.$element.on(this._handlers);
	};

	/**
	 * Default options.
	 * @public
	 */
	Lazy.Defaults = {
		lazyLoad: false,
		lazyLoadEager: 0
	};

	/**
	 * Loads all resources of an item at the specified position.
	 * @param {Number} position - The absolute position of the item.
	 * @protected
	 */
	Lazy.prototype.load = function(position) {
		var $item = this._core.$stage.children().eq(position),
			$elements = $item && $item.find('.owl-lazy');

		if (!$elements || $.inArray($item.get(0), this._loaded) > -1) {
			return;
		}

		$elements.each($.proxy(function(index, element) {
			var $element = $(element), image,
                url = (window.devicePixelRatio > 1 && $element.attr('data-src-retina')) || $element.attr('data-src') || $element.attr('data-srcset');

			this._core.trigger('load', { element: $element, url: url }, 'lazy');

			if ($element.is('img')) {
				$element.one('load.owl.lazy', $.proxy(function() {
					$element.css('opacity', 1);
					this._core.trigger('loaded', { element: $element, url: url }, 'lazy');
				}, this)).attr('src', url);
            } else if ($element.is('source')) {
                $element.one('load.owl.lazy', $.proxy(function() {
                    this._core.trigger('loaded', { element: $element, url: url }, 'lazy');
                }, this)).attr('srcset', url);
			} else {
				image = new Image();
				image.onload = $.proxy(function() {
					$element.css({
						'background-image': 'url("' + url + '")',
						'opacity': '1'
					});
					this._core.trigger('loaded', { element: $element, url: url }, 'lazy');
				}, this);
				image.src = url;
			}
		}, this));

		this._loaded.push($item.get(0));
	};

	/**
	 * Destroys the plugin.
	 * @public
	 */
	Lazy.prototype.destroy = function() {
		var handler, property;

		for (handler in this.handlers) {
			this._core.$element.off(handler, this.handlers[handler]);
		}
		for (property in Object.getOwnPropertyNames(this)) {
			typeof this[property] != 'function' && (this[property] = null);
		}
	};

	$.fn.owlCarousel.Constructor.Plugins.Lazy = Lazy;

})(window.Zepto || window.jQuery, window, document);

/**
 * AutoHeight Plugin
 * @version 2.3.4
 * @author Bartosz Wojciechowski
 * @author David Deutsch
 * @license The MIT License (MIT)
 */
;(function($, window, document, undefined) {

	/**
	 * Creates the auto height plugin.
	 * @class The Auto Height Plugin
	 * @param {Owl} carousel - The Owl Carousel
	 */
	var AutoHeight = function(carousel) {
		/**
		 * Reference to the core.
		 * @protected
		 * @type {Owl}
		 */
		this._core = carousel;

		this._previousHeight = null;

		/**
		 * All event handlers.
		 * @protected
		 * @type {Object}
		 */
		this._handlers = {
			'initialized.owl.carousel refreshed.owl.carousel': $.proxy(function(e) {
				if (e.namespace && this._core.settings.autoHeight) {
					this.update();
				}
			}, this),
			'changed.owl.carousel': $.proxy(function(e) {
				if (e.namespace && this._core.settings.autoHeight && e.property.name === 'position'){
					this.update();
				}
			}, this),
			'loaded.owl.lazy': $.proxy(function(e) {
				if (e.namespace && this._core.settings.autoHeight
					&& e.element.closest('.' + this._core.settings.itemClass).index() === this._core.current()) {
					this.update();
				}
			}, this)
		};

		// set default options
		this._core.options = $.extend({}, AutoHeight.Defaults, this._core.options);

		// register event handlers
		this._core.$element.on(this._handlers);
		this._intervalId = null;
		var refThis = this;

		// These changes have been taken from a PR by gavrochelegnou proposed in #1575
		// and have been made compatible with the latest jQuery version
		$(window).on('load', function() {
			if (refThis._core.settings.autoHeight) {
				refThis.update();
			}
		});

		// Autoresize the height of the carousel when window is resized
		// When carousel has images, the height is dependent on the width
		// and should also change on resize
		$(window).resize(function() {
			if (refThis._core.settings.autoHeight) {
				if (refThis._intervalId != null) {
					clearTimeout(refThis._intervalId);
				}

				refThis._intervalId = setTimeout(function() {
					refThis.update();
				}, 250);
			}
		});

	};

	/**
	 * Default options.
	 * @public
	 */
	AutoHeight.Defaults = {
		autoHeight: false,
		autoHeightClass: 'owl-height'
	};

	/**
	 * Updates the view.
	 */
	AutoHeight.prototype.update = function() {
		var start = this._core._current,
			end = start + this._core.settings.items,
			lazyLoadEnabled = this._core.settings.lazyLoad,
			visible = this._core.$stage.children().toArray().slice(start, end),
			heights = [],
			maxheight = 0;

		$.each(visible, function(index, item) {
			heights.push($(item).height());
		});

		maxheight = Math.max.apply(null, heights);

		if (maxheight <= 1 && lazyLoadEnabled && this._previousHeight) {
			maxheight = this._previousHeight;
		}

		this._previousHeight = maxheight;

		this._core.$stage.parent()
			.height(maxheight)
			.addClass(this._core.settings.autoHeightClass);
	};

	AutoHeight.prototype.destroy = function() {
		var handler, property;

		for (handler in this._handlers) {
			this._core.$element.off(handler, this._handlers[handler]);
		}
		for (property in Object.getOwnPropertyNames(this)) {
			typeof this[property] !== 'function' && (this[property] = null);
		}
	};

	$.fn.owlCarousel.Constructor.Plugins.AutoHeight = AutoHeight;

})(window.Zepto || window.jQuery, window, document);

/**
 * Video Plugin
 * @version 2.3.4
 * @author Bartosz Wojciechowski
 * @author David Deutsch
 * @license The MIT License (MIT)
 */
;(function($, window, document, undefined) {

	/**
	 * Creates the video plugin.
	 * @class The Video Plugin
	 * @param {Owl} carousel - The Owl Carousel
	 */
	var Video = function(carousel) {
		/**
		 * Reference to the core.
		 * @protected
		 * @type {Owl}
		 */
		this._core = carousel;

		/**
		 * Cache all video URLs.
		 * @protected
		 * @type {Object}
		 */
		this._videos = {};

		/**
		 * Current playing item.
		 * @protected
		 * @type {jQuery}
		 */
		this._playing = null;

		/**
		 * All event handlers.
		 * @todo The cloned content removale is too late
		 * @protected
		 * @type {Object}
		 */
		this._handlers = {
			'initialized.owl.carousel': $.proxy(function(e) {
				if (e.namespace) {
					this._core.register({ type: 'state', name: 'playing', tags: [ 'interacting' ] });
				}
			}, this),
			'resize.owl.carousel': $.proxy(function(e) {
				if (e.namespace && this._core.settings.video && this.isInFullScreen()) {
					e.preventDefault();
				}
			}, this),
			'refreshed.owl.carousel': $.proxy(function(e) {
				if (e.namespace && this._core.is('resizing')) {
					this._core.$stage.find('.cloned .owl-video-frame').remove();
				}
			}, this),
			'changed.owl.carousel': $.proxy(function(e) {
				if (e.namespace && e.property.name === 'position' && this._playing) {
					this.stop();
				}
			}, this),
			'prepared.owl.carousel': $.proxy(function(e) {
				if (!e.namespace) {
					return;
				}

				var $element = $(e.content).find('.owl-video');

				if ($element.length) {
					$element.css('display', 'none');
					this.fetch($element, $(e.content));
				}
			}, this)
		};

		// set default options
		this._core.options = $.extend({}, Video.Defaults, this._core.options);

		// register event handlers
		this._core.$element.on(this._handlers);

		this._core.$element.on('click.owl.video', '.owl-video-play-icon', $.proxy(function(e) {
			this.play(e);
		}, this));
	};

	/**
	 * Default options.
	 * @public
	 */
	Video.Defaults = {
		video: false,
		videoHeight: false,
		videoWidth: false
	};

	/**
	 * Gets the video ID and the type (YouTube/Vimeo/vzaar only).
	 * @protected
	 * @param {jQuery} target - The target containing the video data.
	 * @param {jQuery} item - The item containing the video.
	 */
	Video.prototype.fetch = function(target, item) {
			var type = (function() {
					if (target.attr('data-vimeo-id')) {
						return 'vimeo';
					} else if (target.attr('data-vzaar-id')) {
						return 'vzaar'
					} else {
						return 'youtube';
					}
				})(),
				id = target.attr('data-vimeo-id') || target.attr('data-youtube-id') || target.attr('data-vzaar-id'),
				width = target.attr('data-width') || this._core.settings.videoWidth,
				height = target.attr('data-height') || this._core.settings.videoHeight,
				url = target.attr('href');

		if (url) {

			/*
					Parses the id's out of the following urls (and probably more):
					https://www.youtube.com/watch?v=:id
					https://youtu.be/:id
					https://vimeo.com/:id
					https://vimeo.com/channels/:channel/:id
					https://vimeo.com/groups/:group/videos/:id
					https://app.vzaar.com/videos/:id

					Visual example: https://regexper.com/#(http%3A%7Chttps%3A%7C)%5C%2F%5C%2F(player.%7Cwww.%7Capp.)%3F(vimeo%5C.com%7Cyoutu(be%5C.com%7C%5C.be%7Cbe%5C.googleapis%5C.com)%7Cvzaar%5C.com)%5C%2F(video%5C%2F%7Cvideos%5C%2F%7Cembed%5C%2F%7Cchannels%5C%2F.%2B%5C%2F%7Cgroups%5C%2F.%2B%5C%2F%7Cwatch%5C%3Fv%3D%7Cv%5C%2F)%3F(%5BA-Za-z0-9._%25-%5D*)(%5C%26%5CS%2B)%3F
			*/

			id = url.match(/(http:|https:|)\/\/(player.|www.|app.)?(vimeo\.com|youtu(be\.com|\.be|be\.googleapis\.com|be\-nocookie\.com)|vzaar\.com)\/(video\/|videos\/|embed\/|channels\/.+\/|groups\/.+\/|watch\?v=|v\/)?([A-Za-z0-9._%-]*)(\&\S+)?/);

			if (id[3].indexOf('youtu') > -1) {
				type = 'youtube';
			} else if (id[3].indexOf('vimeo') > -1) {
				type = 'vimeo';
			} else if (id[3].indexOf('vzaar') > -1) {
				type = 'vzaar';
			} else {
				throw new Error('Video URL not supported.');
			}
			id = id[6];
		} else {
			throw new Error('Missing video URL.');
		}

		this._videos[url] = {
			type: type,
			id: id,
			width: width,
			height: height
		};

		item.attr('data-video', url);

		this.thumbnail(target, this._videos[url]);
	};

	/**
	 * Creates video thumbnail.
	 * @protected
	 * @param {jQuery} target - The target containing the video data.
	 * @param {Object} info - The video info object.
	 * @see `fetch`
	 */
	Video.prototype.thumbnail = function(target, video) {
		var tnLink,
			icon,
			path,
			dimensions = video.width && video.height ? 'width:' + video.width + 'px;height:' + video.height + 'px;' : '',
			customTn = target.find('img'),
			srcType = 'src',
			lazyClass = '',
			settings = this._core.settings,
			create = function(path) {
				icon = '<div class="owl-video-play-icon"></div>';

				if (settings.lazyLoad) {
					tnLink = $('<div/>',{
						"class": 'owl-video-tn ' + lazyClass,
						"srcType": path
					});
				} else {
					tnLink = $( '<div/>', {
						"class": "owl-video-tn",
						"style": 'opacity:1;background-image:url(' + path + ')'
					});
				}
				target.after(tnLink);
				target.after(icon);
			};

		// wrap video content into owl-video-wrapper div
		target.wrap( $( '<div/>', {
			"class": "owl-video-wrapper",
			"style": dimensions
		}));

		if (this._core.settings.lazyLoad) {
			srcType = 'data-src';
			lazyClass = 'owl-lazy';
		}

		// custom thumbnail
		if (customTn.length) {
			create(customTn.attr(srcType));
			customTn.remove();
			return false;
		}

		if (video.type === 'youtube') {
			path = "//img.youtube.com/vi/" + video.id + "/hqdefault.jpg";
			create(path);
		} else if (video.type === 'vimeo') {
			$.ajax({
				type: 'GET',
				url: '//vimeo.com/api/v2/video/' + video.id + '.json',
				jsonp: 'callback',
				dataType: 'jsonp',
				success: function(data) {
					path = data[0].thumbnail_large;
					create(path);
				}
			});
		} else if (video.type === 'vzaar') {
			$.ajax({
				type: 'GET',
				url: '//vzaar.com/api/videos/' + video.id + '.json',
				jsonp: 'callback',
				dataType: 'jsonp',
				success: function(data) {
					path = data.framegrab_url;
					create(path);
				}
			});
		}
	};

	/**
	 * Stops the current video.
	 * @public
	 */
	Video.prototype.stop = function() {
		this._core.trigger('stop', null, 'video');
		this._playing.find('.owl-video-frame').remove();
		this._playing.removeClass('owl-video-playing');
		this._playing = null;
		this._core.leave('playing');
		this._core.trigger('stopped', null, 'video');
	};

	/**
	 * Starts the current video.
	 * @public
	 * @param {Event} event - The event arguments.
	 */
	Video.prototype.play = function(event) {
		var target = $(event.target),
			item = target.closest('.' + this._core.settings.itemClass),
			video = this._videos[item.attr('data-video')],
			width = video.width || '100%',
			height = video.height || this._core.$stage.height(),
			html,
			iframe;

		if (this._playing) {
			return;
		}

		this._core.enter('playing');
		this._core.trigger('play', null, 'video');

		item = this._core.items(this._core.relative(item.index()));

		this._core.reset(item.index());

		html = $( '<iframe frameborder="0" allowfullscreen mozallowfullscreen webkitAllowFullScreen ></iframe>' );
		html.attr( 'height', height );
		html.attr( 'width', width );
		if (video.type === 'youtube') {
			html.attr( 'src', '//www.youtube.com/embed/' + video.id + '?autoplay=1&rel=0&v=' + video.id );
		} else if (video.type === 'vimeo') {
			html.attr( 'src', '//player.vimeo.com/video/' + video.id + '?autoplay=1' );
		} else if (video.type === 'vzaar') {
			html.attr( 'src', '//view.vzaar.com/' + video.id + '/player?autoplay=true' );
		}

		iframe = $(html).wrap( '<div class="owl-video-frame" />' ).insertAfter(item.find('.owl-video'));

		this._playing = item.addClass('owl-video-playing');
	};

	/**
	 * Checks whether an video is currently in full screen mode or not.
	 * @todo Bad style because looks like a readonly method but changes members.
	 * @protected
	 * @returns {Boolean}
	 */
	Video.prototype.isInFullScreen = function() {
		var element = document.fullscreenElement || document.mozFullScreenElement ||
				document.webkitFullscreenElement;

		return element && $(element).parent().hasClass('owl-video-frame');
	};

	/**
	 * Destroys the plugin.
	 */
	Video.prototype.destroy = function() {
		var handler, property;

		this._core.$element.off('click.owl.video');

		for (handler in this._handlers) {
			this._core.$element.off(handler, this._handlers[handler]);
		}
		for (property in Object.getOwnPropertyNames(this)) {
			typeof this[property] != 'function' && (this[property] = null);
		}
	};

	$.fn.owlCarousel.Constructor.Plugins.Video = Video;

})(window.Zepto || window.jQuery, window, document);

/**
 * Animate Plugin
 * @version 2.3.4
 * @author Bartosz Wojciechowski
 * @author David Deutsch
 * @license The MIT License (MIT)
 */
;(function($, window, document, undefined) {

	/**
	 * Creates the animate plugin.
	 * @class The Navigation Plugin
	 * @param {Owl} scope - The Owl Carousel
	 */
	var Animate = function(scope) {
		this.core = scope;
		this.core.options = $.extend({}, Animate.Defaults, this.core.options);
		this.swapping = true;
		this.previous = undefined;
		this.next = undefined;

		this.handlers = {
			'change.owl.carousel': $.proxy(function(e) {
				if (e.namespace && e.property.name == 'position') {
					this.previous = this.core.current();
					this.next = e.property.value;
				}
			}, this),
			'drag.owl.carousel dragged.owl.carousel translated.owl.carousel': $.proxy(function(e) {
				if (e.namespace) {
					this.swapping = e.type == 'translated';
				}
			}, this),
			'translate.owl.carousel': $.proxy(function(e) {
				if (e.namespace && this.swapping && (this.core.options.animateOut || this.core.options.animateIn)) {
					this.swap();
				}
			}, this)
		};

		this.core.$element.on(this.handlers);
	};

	/**
	 * Default options.
	 * @public
	 */
	Animate.Defaults = {
		animateOut: false,
		animateIn: false
	};

	/**
	 * Toggles the animation classes whenever an translations starts.
	 * @protected
	 * @returns {Boolean|undefined}
	 */
	Animate.prototype.swap = function() {

		if (this.core.settings.items !== 1) {
			return;
		}

		if (!$.support.animation || !$.support.transition) {
			return;
		}

		this.core.speed(0);

		var left,
			clear = $.proxy(this.clear, this),
			previous = this.core.$stage.children().eq(this.previous),
			next = this.core.$stage.children().eq(this.next),
			incoming = this.core.settings.animateIn,
			outgoing = this.core.settings.animateOut;

		if (this.core.current() === this.previous) {
			return;
		}

		if (outgoing) {
			left = this.core.coordinates(this.previous) - this.core.coordinates(this.next);
			previous.one($.support.animation.end, clear)
				.css( { 'left': left + 'px' } )
				.addClass('animated owl-animated-out')
				.addClass(outgoing);
		}

		if (incoming) {
			next.one($.support.animation.end, clear)
				.addClass('animated owl-animated-in')
				.addClass(incoming);
		}
	};

	Animate.prototype.clear = function(e) {
		$(e.target).css( { 'left': '' } )
			.removeClass('animated owl-animated-out owl-animated-in')
			.removeClass(this.core.settings.animateIn)
			.removeClass(this.core.settings.animateOut);
		this.core.onTransitionEnd();
	};

	/**
	 * Destroys the plugin.
	 * @public
	 */
	Animate.prototype.destroy = function() {
		var handler, property;

		for (handler in this.handlers) {
			this.core.$element.off(handler, this.handlers[handler]);
		}
		for (property in Object.getOwnPropertyNames(this)) {
			typeof this[property] != 'function' && (this[property] = null);
		}
	};

	$.fn.owlCarousel.Constructor.Plugins.Animate = Animate;

})(window.Zepto || window.jQuery, window, document);

/**
 * Autoplay Plugin
 * @version 2.3.4
 * @author Bartosz Wojciechowski
 * @author Artus Kolanowski
 * @author David Deutsch
 * @author Tom De Caluwé
 * @license The MIT License (MIT)
 */
;(function($, window, document, undefined) {

	/**
	 * Creates the autoplay plugin.
	 * @class The Autoplay Plugin
	 * @param {Owl} scope - The Owl Carousel
	 */
	var Autoplay = function(carousel) {
		/**
		 * Reference to the core.
		 * @protected
		 * @type {Owl}
		 */
		this._core = carousel;

		/**
		 * The autoplay timeout id.
		 * @type {Number}
		 */
		this._call = null;

		/**
		 * Depending on the state of the plugin, this variable contains either
		 * the start time of the timer or the current timer value if it's
		 * paused. Since we start in a paused state we initialize the timer
		 * value.
		 * @type {Number}
		 */
		this._time = 0;

		/**
		 * Stores the timeout currently used.
		 * @type {Number}
		 */
		this._timeout = 0;

		/**
		 * Indicates whenever the autoplay is paused.
		 * @type {Boolean}
		 */
		this._paused = true;

		/**
		 * All event handlers.
		 * @protected
		 * @type {Object}
		 */
		this._handlers = {
			'changed.owl.carousel': $.proxy(function(e) {
				if (e.namespace && e.property.name === 'settings') {
					if (this._core.settings.autoplay) {
						this.play();
					} else {
						this.stop();
					}
				} else if (e.namespace && e.property.name === 'position' && this._paused) {
					// Reset the timer. This code is triggered when the position
					// of the carousel was changed through user interaction.
					this._time = 0;
				}
			}, this),
			'initialized.owl.carousel': $.proxy(function(e) {
				if (e.namespace && this._core.settings.autoplay) {
					this.play();
				}
			}, this),
			'play.owl.autoplay': $.proxy(function(e, t, s) {
				if (e.namespace) {
					this.play(t, s);
				}
			}, this),
			'stop.owl.autoplay': $.proxy(function(e) {
				if (e.namespace) {
					this.stop();
				}
			}, this),
			'mouseover.owl.autoplay': $.proxy(function() {
				if (this._core.settings.autoplayHoverPause && this._core.is('rotating')) {
					this.pause();
				}
			}, this),
			'mouseleave.owl.autoplay': $.proxy(function() {
				if (this._core.settings.autoplayHoverPause && this._core.is('rotating')) {
					this.play();
				}
			}, this),
			'touchstart.owl.core': $.proxy(function() {
				if (this._core.settings.autoplayHoverPause && this._core.is('rotating')) {
					this.pause();
				}
			}, this),
			'touchend.owl.core': $.proxy(function() {
				if (this._core.settings.autoplayHoverPause) {
					this.play();
				}
			}, this)
		};

		// register event handlers
		this._core.$element.on(this._handlers);

		// set default options
		this._core.options = $.extend({}, Autoplay.Defaults, this._core.options);
	};

	/**
	 * Default options.
	 * @public
	 */
	Autoplay.Defaults = {
		autoplay: false,
		autoplayTimeout: 5000,
		autoplayHoverPause: false,
		autoplaySpeed: false
	};

	/**
	 * Transition to the next slide and set a timeout for the next transition.
	 * @private
	 * @param {Number} [speed] - The animation speed for the animations.
	 */
	Autoplay.prototype._next = function(speed) {
		this._call = window.setTimeout(
			$.proxy(this._next, this, speed),
			this._timeout * (Math.round(this.read() / this._timeout) + 1) - this.read()
		);

		if (this._core.is('interacting') || document.hidden) {
			return;
		}
		this._core.next(speed || this._core.settings.autoplaySpeed);
	}

	/**
	 * Reads the current timer value when the timer is playing.
	 * @public
	 */
	Autoplay.prototype.read = function() {
		return new Date().getTime() - this._time;
	};

	/**
	 * Starts the autoplay.
	 * @public
	 * @param {Number} [timeout] - The interval before the next animation starts.
	 * @param {Number} [speed] - The animation speed for the animations.
	 */
	Autoplay.prototype.play = function(timeout, speed) {
		var elapsed;

		if (!this._core.is('rotating')) {
			this._core.enter('rotating');
		}

		timeout = timeout || this._core.settings.autoplayTimeout;

		// Calculate the elapsed time since the last transition. If the carousel
		// wasn't playing this calculation will yield zero.
		elapsed = Math.min(this._time % (this._timeout || timeout), timeout);

		if (this._paused) {
			// Start the clock.
			this._time = this.read();
			this._paused = false;
		} else {
			// Clear the active timeout to allow replacement.
			window.clearTimeout(this._call);
		}

		// Adjust the origin of the timer to match the new timeout value.
		this._time += this.read() % timeout - elapsed;

		this._timeout = timeout;
		this._call = window.setTimeout($.proxy(this._next, this, speed), timeout - elapsed);
	};

	/**
	 * Stops the autoplay.
	 * @public
	 */
	Autoplay.prototype.stop = function() {
		if (this._core.is('rotating')) {
			// Reset the clock.
			this._time = 0;
			this._paused = true;

			window.clearTimeout(this._call);
			this._core.leave('rotating');
		}
	};

	/**
	 * Pauses the autoplay.
	 * @public
	 */
	Autoplay.prototype.pause = function() {
		if (this._core.is('rotating') && !this._paused) {
			// Pause the clock.
			this._time = this.read();
			this._paused = true;

			window.clearTimeout(this._call);
		}
	};

	/**
	 * Destroys the plugin.
	 */
	Autoplay.prototype.destroy = function() {
		var handler, property;

		this.stop();

		for (handler in this._handlers) {
			this._core.$element.off(handler, this._handlers[handler]);
		}
		for (property in Object.getOwnPropertyNames(this)) {
			typeof this[property] != 'function' && (this[property] = null);
		}
	};

	$.fn.owlCarousel.Constructor.Plugins.autoplay = Autoplay;

})(window.Zepto || window.jQuery, window, document);

/**
 * Navigation Plugin
 * @version 2.3.4
 * @author Artus Kolanowski
 * @author David Deutsch
 * @license The MIT License (MIT)
 */
;(function($, window, document, undefined) {
	'use strict';

	/**
	 * Creates the navigation plugin.
	 * @class The Navigation Plugin
	 * @param {Owl} carousel - The Owl Carousel.
	 */
	var Navigation = function(carousel) {
		/**
		 * Reference to the core.
		 * @protected
		 * @type {Owl}
		 */
		this._core = carousel;

		/**
		 * Indicates whether the plugin is initialized or not.
		 * @protected
		 * @type {Boolean}
		 */
		this._initialized = false;

		/**
		 * The current paging indexes.
		 * @protected
		 * @type {Array}
		 */
		this._pages = [];

		/**
		 * All DOM elements of the user interface.
		 * @protected
		 * @type {Object}
		 */
		this._controls = {};

		/**
		 * Markup for an indicator.
		 * @protected
		 * @type {Array.<String>}
		 */
		this._templates = [];

		/**
		 * The carousel element.
		 * @type {jQuery}
		 */
		this.$element = this._core.$element;

		/**
		 * Overridden methods of the carousel.
		 * @protected
		 * @type {Object}
		 */
		this._overrides = {
			next: this._core.next,
			prev: this._core.prev,
			to: this._core.to
		};

		/**
		 * All event handlers.
		 * @protected
		 * @type {Object}
		 */
		this._handlers = {
			'prepared.owl.carousel': $.proxy(function(e) {
				if (e.namespace && this._core.settings.dotsData) {
					this._templates.push('<div class="' + this._core.settings.dotClass + '">' +
						$(e.content).find('[data-dot]').addBack('[data-dot]').attr('data-dot') + '</div>');
				}
			}, this),
			'added.owl.carousel': $.proxy(function(e) {
				if (e.namespace && this._core.settings.dotsData) {
					this._templates.splice(e.position, 0, this._templates.pop());
				}
			}, this),
			'remove.owl.carousel': $.proxy(function(e) {
				if (e.namespace && this._core.settings.dotsData) {
					this._templates.splice(e.position, 1);
				}
			}, this),
			'changed.owl.carousel': $.proxy(function(e) {
				if (e.namespace && e.property.name == 'position') {
					this.draw();
				}
			}, this),
			'initialized.owl.carousel': $.proxy(function(e) {
				if (e.namespace && !this._initialized) {
					this._core.trigger('initialize', null, 'navigation');
					this.initialize();
					this.update();
					this.draw();
					this._initialized = true;
					this._core.trigger('initialized', null, 'navigation');
				}
			}, this),
			'refreshed.owl.carousel': $.proxy(function(e) {
				if (e.namespace && this._initialized) {
					this._core.trigger('refresh', null, 'navigation');
					this.update();
					this.draw();
					this._core.trigger('refreshed', null, 'navigation');
				}
			}, this)
		};

		// set default options
		this._core.options = $.extend({}, Navigation.Defaults, this._core.options);

		// register event handlers
		this.$element.on(this._handlers);
	};

	/**
	 * Default options.
	 * @public
	 * @todo Rename `slideBy` to `navBy`
	 */
	Navigation.Defaults = {
		nav: false,
		navText: [
			'<span aria-label="' + 'Previous' + '">&#x2039;</span>',
			'<span aria-label="' + 'Next' + '">&#x203a;</span>'
		],
		navSpeed: false,
		navElement: 'button type="button" role="presentation"',
		navContainer: false,
		navContainerClass: 'owl-nav',
		navClass: [
			'owl-prev',
			'owl-next'
		],
		slideBy: 1,
		dotClass: 'owl-dot',
		dotsClass: 'owl-dots',
		dots: true,
		dotsEach: false,
		dotsData: false,
		dotsSpeed: false,
		dotsContainer: false
	};

	/**
	 * Initializes the layout of the plugin and extends the carousel.
	 * @protected
	 */
	Navigation.prototype.initialize = function() {
		var override,
			settings = this._core.settings;

		// create DOM structure for relative navigation
		this._controls.$relative = (settings.navContainer ? $(settings.navContainer)
			: $('<div>').addClass(settings.navContainerClass).appendTo(this.$element)).addClass('disabled');

		this._controls.$previous = $('<' + settings.navElement + '>')
			.addClass(settings.navClass[0])
			.html(settings.navText[0])
			.prependTo(this._controls.$relative)
			.on('click', $.proxy(function(e) {
				this.prev(settings.navSpeed);
			}, this));
		this._controls.$next = $('<' + settings.navElement + '>')
			.addClass(settings.navClass[1])
			.html(settings.navText[1])
			.appendTo(this._controls.$relative)
			.on('click', $.proxy(function(e) {
				this.next(settings.navSpeed);
			}, this));

		// create DOM structure for absolute navigation
		if (!settings.dotsData) {
			this._templates = [ $('<button role="button">')
				.addClass(settings.dotClass)
				.append($('<span>'))
				.prop('outerHTML') ];
		}

		this._controls.$absolute = (settings.dotsContainer ? $(settings.dotsContainer)
			: $('<div>').addClass(settings.dotsClass).appendTo(this.$element)).addClass('disabled');

		this._controls.$absolute.on('click', 'button', $.proxy(function(e) {
			var index = $(e.target).parent().is(this._controls.$absolute)
				? $(e.target).index() : $(e.target).parent().index();

			e.preventDefault();

			this.to(index, settings.dotsSpeed);
		}, this));

		/*$el.on('focusin', function() {
			$(document).off(".carousel");

			$(document).on('keydown.carousel', function(e) {
				if(e.keyCode == 37) {
					$el.trigger('prev.owl')
				}
				if(e.keyCode == 39) {
					$el.trigger('next.owl')
				}
			});
		});*/

		// override public methods of the carousel
		for (override in this._overrides) {
			this._core[override] = $.proxy(this[override], this);
		}
	};

	/**
	 * Destroys the plugin.
	 * @protected
	 */
	Navigation.prototype.destroy = function() {
		var handler, control, property, override, settings;
		settings = this._core.settings;

		for (handler in this._handlers) {
			this.$element.off(handler, this._handlers[handler]);
		}
		for (control in this._controls) {
			if (control === '$relative' && settings.navContainer) {
				this._controls[control].html('');
			} else {
				this._controls[control].remove();
			}
		}
		for (override in this.overides) {
			this._core[override] = this._overrides[override];
		}
		for (property in Object.getOwnPropertyNames(this)) {
			typeof this[property] != 'function' && (this[property] = null);
		}
	};

	/**
	 * Updates the internal state.
	 * @protected
	 */
	Navigation.prototype.update = function() {
		var i, j, k,
			lower = this._core.clones().length / 2,
			upper = lower + this._core.items().length,
			maximum = this._core.maximum(true),
			settings = this._core.settings,
			size = settings.center || settings.autoWidth || settings.dotsData
				? 1 : settings.dotsEach || settings.items;

		if (settings.slideBy !== 'page') {
			settings.slideBy = Math.min(settings.slideBy, settings.items);
		}

		if (settings.dots || settings.slideBy == 'page') {
			this._pages = [];

			for (i = lower, j = 0, k = 0; i < upper; i++) {
				if (j >= size || j === 0) {
					this._pages.push({
						start: Math.min(maximum, i - lower),
						end: i - lower + size - 1
					});
					if (Math.min(maximum, i - lower) === maximum) {
						break;
					}
					j = 0, ++k;
				}
				j += this._core.mergers(this._core.relative(i));
			}
		}
	};

	/**
	 * Draws the user interface.
	 * @todo The option `dotsData` wont work.
	 * @protected
	 */
	Navigation.prototype.draw = function() {
		var difference,
			settings = this._core.settings,
			disabled = this._core.items().length <= settings.items,
			index = this._core.relative(this._core.current()),
			loop = settings.loop || settings.rewind;

		this._controls.$relative.toggleClass('disabled', !settings.nav || disabled);

		if (settings.nav) {
			this._controls.$previous.toggleClass('disabled', !loop && index <= this._core.minimum(true));
			this._controls.$next.toggleClass('disabled', !loop && index >= this._core.maximum(true));
		}

		this._controls.$absolute.toggleClass('disabled', !settings.dots || disabled);

		if (settings.dots) {
			difference = this._pages.length - this._controls.$absolute.children().length;

			if (settings.dotsData && difference !== 0) {
				this._controls.$absolute.html(this._templates.join(''));
			} else if (difference > 0) {
				this._controls.$absolute.append(new Array(difference + 1).join(this._templates[0]));
			} else if (difference < 0) {
				this._controls.$absolute.children().slice(difference).remove();
			}

			this._controls.$absolute.find('.active').removeClass('active');
			this._controls.$absolute.children().eq($.inArray(this.current(), this._pages)).addClass('active');
		}
	};

	/**
	 * Extends event data.
	 * @protected
	 * @param {Event} event - The event object which gets thrown.
	 */
	Navigation.prototype.onTrigger = function(event) {
		var settings = this._core.settings;

		event.page = {
			index: $.inArray(this.current(), this._pages),
			count: this._pages.length,
			size: settings && (settings.center || settings.autoWidth || settings.dotsData
				? 1 : settings.dotsEach || settings.items)
		};
	};

	/**
	 * Gets the current page position of the carousel.
	 * @protected
	 * @returns {Number}
	 */
	Navigation.prototype.current = function() {
		var current = this._core.relative(this._core.current());
		return $.grep(this._pages, $.proxy(function(page, index) {
			return page.start <= current && page.end >= current;
		}, this)).pop();
	};

	/**
	 * Gets the current succesor/predecessor position.
	 * @protected
	 * @returns {Number}
	 */
	Navigation.prototype.getPosition = function(successor) {
		var position, length,
			settings = this._core.settings;

		if (settings.slideBy == 'page') {
			position = $.inArray(this.current(), this._pages);
			length = this._pages.length;
			successor ? ++position : --position;
			position = this._pages[((position % length) + length) % length].start;
		} else {
			position = this._core.relative(this._core.current());
			length = this._core.items().length;
			successor ? position += settings.slideBy : position -= settings.slideBy;
		}

		return position;
	};

	/**
	 * Slides to the next item or page.
	 * @public
	 * @param {Number} [speed=false] - The time in milliseconds for the transition.
	 */
	Navigation.prototype.next = function(speed) {
		$.proxy(this._overrides.to, this._core)(this.getPosition(true), speed);
	};

	/**
	 * Slides to the previous item or page.
	 * @public
	 * @param {Number} [speed=false] - The time in milliseconds for the transition.
	 */
	Navigation.prototype.prev = function(speed) {
		$.proxy(this._overrides.to, this._core)(this.getPosition(false), speed);
	};

	/**
	 * Slides to the specified item or page.
	 * @public
	 * @param {Number} position - The position of the item or page.
	 * @param {Number} [speed] - The time in milliseconds for the transition.
	 * @param {Boolean} [standard=false] - Whether to use the standard behaviour or not.
	 */
	Navigation.prototype.to = function(position, speed, standard) {
		var length;

		if (!standard && this._pages.length) {
			length = this._pages.length;
			$.proxy(this._overrides.to, this._core)(this._pages[((position % length) + length) % length].start, speed);
		} else {
			$.proxy(this._overrides.to, this._core)(position, speed);
		}
	};

	$.fn.owlCarousel.Constructor.Plugins.Navigation = Navigation;

})(window.Zepto || window.jQuery, window, document);

/**
 * Hash Plugin
 * @version 2.3.4
 * @author Artus Kolanowski
 * @author David Deutsch
 * @license The MIT License (MIT)
 */
;(function($, window, document, undefined) {
	'use strict';

	/**
	 * Creates the hash plugin.
	 * @class The Hash Plugin
	 * @param {Owl} carousel - The Owl Carousel
	 */
	var Hash = function(carousel) {
		/**
		 * Reference to the core.
		 * @protected
		 * @type {Owl}
		 */
		this._core = carousel;

		/**
		 * Hash index for the items.
		 * @protected
		 * @type {Object}
		 */
		this._hashes = {};

		/**
		 * The carousel element.
		 * @type {jQuery}
		 */
		this.$element = this._core.$element;

		/**
		 * All event handlers.
		 * @protected
		 * @type {Object}
		 */
		this._handlers = {
			'initialized.owl.carousel': $.proxy(function(e) {
				if (e.namespace && this._core.settings.startPosition === 'URLHash') {
					$(window).trigger('hashchange.owl.navigation');
				}
			}, this),
			'prepared.owl.carousel': $.proxy(function(e) {
				if (e.namespace) {
					var hash = $(e.content).find('[data-hash]').addBack('[data-hash]').attr('data-hash');

					if (!hash) {
						return;
					}

					this._hashes[hash] = e.content;
				}
			}, this),
			'changed.owl.carousel': $.proxy(function(e) {
				if (e.namespace && e.property.name === 'position') {
					var current = this._core.items(this._core.relative(this._core.current())),
						hash = $.map(this._hashes, function(item, hash) {
							return item === current ? hash : null;
						}).join();

					if (!hash || window.location.hash.slice(1) === hash) {
						return;
					}

					window.location.hash = hash;
				}
			}, this)
		};

		// set default options
		this._core.options = $.extend({}, Hash.Defaults, this._core.options);

		// register the event handlers
		this.$element.on(this._handlers);

		// register event listener for hash navigation
		$(window).on('hashchange.owl.navigation', $.proxy(function(e) {
			var hash = window.location.hash.substring(1),
				items = this._core.$stage.children(),
				position = this._hashes[hash] && items.index(this._hashes[hash]);

			if (position === undefined || position === this._core.current()) {
				return;
			}

			this._core.to(this._core.relative(position), false, true);
		}, this));
	};

	/**
	 * Default options.
	 * @public
	 */
	Hash.Defaults = {
		URLhashListener: false
	};

	/**
	 * Destroys the plugin.
	 * @public
	 */
	Hash.prototype.destroy = function() {
		var handler, property;

		$(window).off('hashchange.owl.navigation');

		for (handler in this._handlers) {
			this._core.$element.off(handler, this._handlers[handler]);
		}
		for (property in Object.getOwnPropertyNames(this)) {
			typeof this[property] != 'function' && (this[property] = null);
		}
	};

	$.fn.owlCarousel.Constructor.Plugins.Hash = Hash;

})(window.Zepto || window.jQuery, window, document);

/**
 * Support Plugin
 *
 * @version 2.3.4
 * @author Vivid Planet Software GmbH
 * @author Artus Kolanowski
 * @author David Deutsch
 * @license The MIT License (MIT)
 */
;(function($, window, document, undefined) {

	var style = $('<support>').get(0).style,
		prefixes = 'Webkit Moz O ms'.split(' '),
		events = {
			transition: {
				end: {
					WebkitTransition: 'webkitTransitionEnd',
					MozTransition: 'transitionend',
					OTransition: 'oTransitionEnd',
					transition: 'transitionend'
				}
			},
			animation: {
				end: {
					WebkitAnimation: 'webkitAnimationEnd',
					MozAnimation: 'animationend',
					OAnimation: 'oAnimationEnd',
					animation: 'animationend'
				}
			}
		},
		tests = {
			csstransforms: function() {
				return !!test('transform');
			},
			csstransforms3d: function() {
				return !!test('perspective');
			},
			csstransitions: function() {
				return !!test('transition');
			},
			cssanimations: function() {
				return !!test('animation');
			}
		};

	function test(property, prefixed) {
		var result = false,
			upper = property.charAt(0).toUpperCase() + property.slice(1);

		$.each((property + ' ' + prefixes.join(upper + ' ') + upper).split(' '), function(i, property) {
			if (style[property] !== undefined) {
				result = prefixed ? property : true;
				return false;
			}
		});

		return result;
	}

	function prefixed(property) {
		return test(property, true);
	}

	if (tests.csstransitions()) {
		/* jshint -W053 */
		$.support.transition = new String(prefixed('transition'))
		$.support.transition.end = events.transition.end[ $.support.transition ];
	}

	if (tests.cssanimations()) {
		/* jshint -W053 */
		$.support.animation = new String(prefixed('animation'))
		$.support.animation.end = events.animation.end[ $.support.animation ];
	}

	if (tests.csstransforms()) {
		/* jshint -W053 */
		$.support.transform = new String(prefixed('transform'));
		$.support.transform3d = tests.csstransforms3d();
	}

})(window.Zepto || window.jQuery, window, document);
﻿!(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    define(['jquery'], factory);
  } else if (typeof exports === 'object') {
    factory(require('jquery'));
  } else {
    factory(root.jQuery);
  }
})(this, function($) {

  'use strict';

  /**
   * Name of the plugin
   * @private
   * @const
   * @type {String}
   */
  var PLUGIN_NAME = 'vide';

  /**
   * Default settings
   * @private
   * @const
   * @type {Object}
   */
  var DEFAULTS = {
    volume: 1,
    playbackRate: 1,
    muted: true,
    loop: true,
    autoplay: true,
    position: '50% 50%',
    posterType: 'detect',
    resizing: true,
    bgColor: 'transparent',
    className: ''
  };

  /**
   * Not implemented error message
   * @private
   * @const
   * @type {String}
   */
  var NOT_IMPLEMENTED_MSG = 'Not implemented';

  /**
   * Parse a string with options
   * @private
   * @param {String} str
   * @returns {Object|String}
   */
  function parseOptions(str) {
    var obj = {};
    var delimiterIndex;
    var option;
    var prop;
    var val;
    var arr;
    var len;
    var i;

    // Remove spaces around delimiters and split
    arr = str.replace(/\s*:\s*/g, ':').replace(/\s*,\s*/g, ',').split(',');

    // Parse a string
    for (i = 0, len = arr.length; i < len; i++) {
      option = arr[i];

      // Ignore urls and a string without colon delimiters
      if (
        option.search(/^(http|https|ftp):\/\//) !== -1 ||
        option.search(':') === -1
      ) {
        break;
      }

      delimiterIndex = option.indexOf(':');
      prop = option.substring(0, delimiterIndex);
      val = option.substring(delimiterIndex + 1);

      // If val is an empty string, make it undefined
      if (!val) {
        val = undefined;
      }

      // Convert a string value if it is like a boolean
      if (typeof val === 'string') {
        val = val === 'true' || (val === 'false' ? false : val);
      }

      // Convert a string value if it is like a number
      if (typeof val === 'string') {
        val = !isNaN(val) ? +val : val;
      }

      obj[prop] = val;
    }

    // If nothing is parsed
    if (prop == null && val == null) {
      return str;
    }

    return obj;
  }

  /**
   * Parse a position option
   * @private
   * @param {String} str
   * @returns {Object}
   */
  function parsePosition(str) {
    str = '' + str;

    // Default value is a center
    var args = str.split(/\s+/);
    var x = '50%';
    var y = '50%';
    var len;
    var arg;
    var i;

    for (i = 0, len = args.length; i < len; i++) {
      arg = args[i];

      // Convert values
      if (arg === 'left') {
        x = '0%';
      } else if (arg === 'right') {
        x = '100%';
      } else if (arg === 'top') {
        y = '0%';
      } else if (arg === 'bottom') {
        y = '100%';
      } else if (arg === 'center') {
        if (i === 0) {
          x = '50%';
        } else {
          y = '50%';
        }
      } else {
        if (i === 0) {
          x = arg;
        } else {
          y = arg;
        }
      }
    }

    return { x: x, y: y };
  }

  /**
   * Search a poster
   * @private
   * @param {String} path
   * @param {Function} callback
   */
  function findPoster(path, callback) {
    var onLoad = function() {
      callback(this.src);
    };

    $('<img src="' + path + '.gif">').on('load', onLoad);
    $('<img src="' + path + '.jpg">').on('load', onLoad);
    $('<img src="' + path + '.jpeg">').on('load', onLoad);
    $('<img src="' + path + '.png">').on('load', onLoad);
  }

  /**
   * Vide constructor
   * @param {HTMLElement} element
   * @param {Object|String} path
   * @param {Object|String} options
   * @constructor
   */
  function Vide(element, path, options) {
    this.$element = $(element);

    // Parse path
    if (typeof path === 'string') {
      path = parseOptions(path);
    }

    // Parse options
    if (!options) {
      options = {};
    } else if (typeof options === 'string') {
      options = parseOptions(options);
    }

    // Remove an extension
    if (typeof path === 'string') {
      path = path.replace(/\.\w*$/, '');
    } else if (typeof path === 'object') {
      for (var i in path) {
        if (path.hasOwnProperty(i)) {
          path[i] = path[i].replace(/\.\w*$/, '');
        }
      }
    }

    this.settings = $.extend({}, DEFAULTS, options);
    this.path = path;

    // https://github.com/VodkaBears/Vide/issues/110
    try {
      this.init();
    } catch (e) {
      if (e.message !== NOT_IMPLEMENTED_MSG) {
        throw e;
      }
    }
  }

  /**
   * Initialization
   * @public
   */
  Vide.prototype.init = function() {
    var vide = this;
    var path = vide.path;
    var poster = path;
    var sources = '';
    var $element = vide.$element;
    var settings = vide.settings;
    var position = parsePosition(settings.position);
    var posterType = settings.posterType;
    var $video;
    var $wrapper;

    // Set styles of a video wrapper
    $wrapper = vide.$wrapper = $('<div>')
      .addClass(settings.className)
      .css({
        position: 'absolute',
        'z-index': -1,
        top: 0,
        left: 0,
        bottom: 0,
        right: 0,
        overflow: 'hidden',
        '-webkit-background-size': 'cover',
        '-moz-background-size': 'cover',
        '-o-background-size': 'cover',
        'background-size': 'cover',
        'background-color': settings.bgColor,
        'background-repeat': 'no-repeat',
        'background-position': position.x + ' ' + position.y
      });

    // Get a poster path
    if (typeof path === 'object') {
      if (path.poster) {
        poster = path.poster;
      } else {
        if (path.mp4) {
          poster = path.mp4;
        } else if (path.webm) {
          poster = path.webm;
        } else if (path.ogv) {
          poster = path.ogv;
        }
      }
    }

    // Set a video poster
    if (posterType === 'detect') {
      findPoster(poster, function(url) {
        $wrapper.css('background-image', 'url(' + url + ')');
      });
    } else if (posterType !== 'none') {
      $wrapper.css('background-image', 'url(' + poster + '.' + posterType + ')');
    }

    // If a parent element has a static position, make it relative
    if ($element.css('position') === 'static') {
      $element.css('position', 'relative');
    }

    $element.prepend($wrapper);

    if (typeof path === 'object') {
      if (path.mp4) {
        sources += '<source src="' + path.mp4 + '.mp4" type="video/mp4">';
      }

      if (path.webm) {
        sources += '<source src="' + path.webm + '.webm" type="video/webm">';
      }

      if (path.ogv) {
        sources += '<source src="' + path.ogv + '.ogv" type="video/ogg">';
      }

      $video = vide.$video = $('<video>' + sources + '</video>');
    } else {
      $video = vide.$video = $('<video>' +
        '<source src="' + path + '.mp4" type="video/mp4">' +
        '<source src="' + path + '.webm" type="video/webm">' +
        '<source src="' + path + '.ogv" type="video/ogg">' +
        '</video>');
    }

    // https://github.com/VodkaBears/Vide/issues/110
    try {
      $video

        // Set video properties
        .prop({
          autoplay: settings.autoplay,
          loop: settings.loop,
          volume: settings.volume,
          muted: settings.muted,
          defaultMuted: settings.muted,
          playbackRate: settings.playbackRate,
          defaultPlaybackRate: settings.playbackRate
        });
    } catch (e) {
      throw new Error(NOT_IMPLEMENTED_MSG);
    }

    // Video alignment
    $video.css({
      margin: 'auto',
      position: 'absolute',
      'z-index': -1,
      top: position.y,
      left: position.x,
      '-webkit-transform': 'translate(-' + position.x + ', -' + position.y + ')',
      '-ms-transform': 'translate(-' + position.x + ', -' + position.y + ')',
      '-moz-transform': 'translate(-' + position.x + ', -' + position.y + ')',
      transform: 'translate(-' + position.x + ', -' + position.y + ')',

      // Disable visibility, while loading
      visibility: 'hidden',
      opacity: 0
    })

    // Resize a video, when it's loaded
    .one('canplaythrough.' + PLUGIN_NAME, function() {
      vide.resize();
    })

    // Make it visible, when it's already playing
    .one('playing.' + PLUGIN_NAME, function() {
      $video.css({
        visibility: 'visible',
        opacity: 1
      });
      $wrapper.css('background-image', 'none');
    });

    // Resize event is available only for 'window'
    // Use another code solutions to detect DOM elements resizing
    $element.on('resize.' + PLUGIN_NAME, function() {
      if (settings.resizing) {
        vide.resize();
      }
    });

    // Append a video
    $wrapper.append($video);
  };

  /**
   * Get a video element
   * @public
   * @returns {HTMLVideoElement}
   */
  Vide.prototype.getVideoObject = function() {
    return this.$video[0];
  };

  /**
   * Resize a video background
   * @public
   */
  Vide.prototype.resize = function() {
    if (!this.$video) {
      return;
    }

    var $wrapper = this.$wrapper;
    var $video = this.$video;
    var video = $video[0];

    // Get a native video size
    var videoHeight = video.videoHeight;
    var videoWidth = video.videoWidth;

    // Get a wrapper size
    var wrapperHeight = $wrapper.height();
    var wrapperWidth = $wrapper.width();

    if (wrapperWidth / videoWidth > wrapperHeight / videoHeight) {
      $video.css({

        // +2 pixels to prevent an empty space after transformation
        width: wrapperWidth + 2,
        height: 'auto'
      });
    } else {
      $video.css({
        width: 'auto',

        // +2 pixels to prevent an empty space after transformation
        height: wrapperHeight + 2
      });
    }
  };

  /**
   * Destroy a video background
   * @public
   */
  Vide.prototype.destroy = function() {
    delete $[PLUGIN_NAME].lookup[this.index];
    this.$video && this.$video.off(PLUGIN_NAME);
    this.$element.off(PLUGIN_NAME).removeData(PLUGIN_NAME);
    this.$wrapper.remove();
  };

  /**
   * Special plugin object for instances.
   * @public
   * @type {Object}
   */
  $[PLUGIN_NAME] = {
    lookup: []
  };

  /**
   * Plugin constructor
   * @param {Object|String} path
   * @param {Object|String} options
   * @returns {JQuery}
   * @constructor
   */
  $.fn[PLUGIN_NAME] = function(path, options) {
    var instance;

    this.each(function() {
      instance = $.data(this, PLUGIN_NAME);

      // Destroy the plugin instance if exists
      instance && instance.destroy();

      // Create the plugin instance
      instance = new Vide(this, path, options);
      instance.index = $[PLUGIN_NAME].lookup.push(instance) - 1;
      $.data(this, PLUGIN_NAME, instance);
    });

    return this;
  };

  $(document).ready(function() {
    var $window = $(window);

    // Window resize event listener
    $window.on('resize.' + PLUGIN_NAME, function() {
      for (var len = $[PLUGIN_NAME].lookup.length, i = 0, instance; i < len; i++) {
        instance = $[PLUGIN_NAME].lookup[i];

        if (instance && instance.settings.resizing) {
          instance.resize();
        }
      }
    });

    // https://github.com/VodkaBears/Vide/issues/68
    $window.on('unload.' + PLUGIN_NAME, function() {
      return false;
    });

    // Auto initialization
    // Add 'data-vide-bg' attribute with a path to the video without extension
    // Also you can pass options throw the 'data-vide-options' attribute
    // 'data-vide-options' must be like 'muted: false, volume: 0.5'
    $(document).find('[data-' + PLUGIN_NAME + '-bg]').each(function(i, element) {
      var $element = $(element);
      var options = $element.data(PLUGIN_NAME + '-options');
      var path = $element.data(PLUGIN_NAME + '-bg');

      $element[PLUGIN_NAME](path, options);
    });
  });

});
﻿/**
* @author Sean Taylor Hutchison
* @email seanthutchison@gmail.com
* @website http://taylorhutchison.com
* @created 8/25/2014
* @last_modified 8/25/2014
*/
/// <reference path="interfaces.ts"/>
var narrate = (function () {
    function narrate(name, config) {
        if (config != undefined) {
            narrate.config(config);
        }
        if (name != undefined) {
            narrate.getAllMatchingElements(name, document.all);
        } else {
            narrate.logIfDebugging("You must supply a name to match class or attribute values against. Try narrate(\"mystory\")", true);
        }
        return narrate;
    }
    narrate.go = function (position) {
        var elementCount = narrate.settings.narrationElemCollection.length;
        if (position % elementCount == 0) {
            return 0;
        } else if (position >= 0 && position <= elementCount - 1) {
            return position;
        } else if (position >= 0) {
            return Math.abs(position % elementCount);
        } else {
            return elementCount - Math.abs(position % elementCount);
        }
    };

    narrate.getGo = function (position) {
        console.log(narrate.go(position));
    };

    narrate.play = function (start, duration) {
    };

    Object.defineProperty(narrate, "options", {
        get: function () {
            return narrate.settings;
        },
        enumerable: true,
        configurable: true
    });

    Object.defineProperty(narrate, "debug", {
        set: function (debug_bool) {
            if (typeof (debug_bool) == "boolean") {
                narrate.settings.debug = debug_bool;
                narrate.logIfDebugging("Debugging mode has be turned on");
            }
        },
        enumerable: true,
        configurable: true
    });

    Object.defineProperty(narrate, "modulator", {
        set: function (modObj) {
            //Check if modObj is valid
            if (modObj) {
                narrate.settings.modulator = modObj;
            }
        },
        enumerable: true,
        configurable: true
    });

    Object.defineProperty(narrate, "audioPath", {
        set: function (path) {
            //Check if its a full, valid path
            if (path) {
                narrate.settings.audioPath = path;
                narrate.setupAudio();
            }
        },
        enumerable: true,
        configurable: true
    });

    narrate.jump = function (position) {
        if (typeof (position) == "number") {
            narrate.go(position);
        } else if (position instanceof HTMLElement) {
            narrate.go(position);
        }
        return narrate;
    };

    narrate.previous = function () {
        return narrate;
    };

    narrate.next = function () {
        return narrate;
    };

    narrate.logIfDebugging = function (message, force) {
        if (narrate.settings.debug || force == true) {
            console.log(message);
        }
        return narrate;
    };

    narrate.setupAudio = function () {
        return narrate;
    };

    narrate.config = function (configObj) {
        for (var prop in configObj) {
            if (narrate.settings.hasOwnProperty(prop)) {
                narrate.settings[prop] = configObj[prop];
            }
        }
        return narrate;
    };

    narrate.getAllMatchingElements = function (name, docElements) {
        var counter = 0;
        for (var counter = 0; counter < docElements.length; counter++) {
            if (docElements[counter].hasAttribute(name) || docElements[counter].className.indexOf(name) > -1) {
                narrate.settings.narrationElemCollection.push(docElements[counter]);
            }
        }
        narrate.logIfDebugging(narrate.settings.narrationElemCollection.length + " elements added to the narration matching \"" + name + "\"");
    };
    narrate.settings = {
        version: 0.1,
        narrationElemCollection: [],
        debug: false,
        modulator: undefined,
        audioPath: undefined,
        autoplay: false,
        timings: [],
        control: undefined,
        position: 0
    };
    return narrate;
})();
//# sourceMappingURL=narrate.js.map
﻿function drawHelmet() {
  var helmetHtml = "";
  for (var i = 5; i < 95; i++) {
    helmetHtml +=
      "<div class='img-container' pic_num=" +
      i +
      " style='background-image:url(https://image.imnews.imbc.com/newszoomin/groupnews/groupnews_13/img/first/img_" +
      i +
      ".png')'></div>";
  }
  return helmetHtml;
}
﻿var picArray = [80, 79, 7, 49];
var currentH;
var currentP;
var overLoad = false;

$("#block2").vide(
  {
    mp4: "https://imnews.imbc.com/newszoomin/groupnews/groupnews_13/data/video/video_3_cut",
  },
  {
    loop: false,
  }
);

$(document).ready(function () {
  history.scrollRestoration = "manual";

  $(".td-day1").on("click", function () {
    $("html, body").animate(
      {
        scrollTop: $("#day1").offset().top,
      },
      500
    );
  });

  $(".td-day2").on("click", function () {
    $("html, body").animate(
        {
          scrollTop: $("#day2").offset().top,
        },
        500
    );
  });

  $(".td-day3").on("click", function () {
    $("html, body").animate(
        {
          scrollTop: $("#day3").offset().top,
        },
        500
    );
  });

  if (isiPhone()) {
    $(".narrator").css("display", "none");
  }

  // 날짜별 초기화면 설정
  $("html, body").animate(
    {
      scrollTop: 0,
    },
    1
  );

  var vid = document.getElementById("day1_1");
  var screenW = $(window).width();
  var screenH = $(window).height();

  $(window).resize(function () {
    screenH = $(window).height();
  });

  $(".go-down").on("click", function () {
    $("body").css("overflow-y", "scroll");
    var audio_nar1 = document.getElementById("day1_nar1");
    if (audio_nar1.paused == false) {
      audio_nar1.pause();
    } else {
      audio_nar1.play();
    }

    $("html, body").animate(
      {
        scrollTop: screenH,
      },
      1000
    );
  });

  $("#day1_2").width($(window).width() > 800 ? 800 : $(window).width() - 40);
  $("#day1_2").height(
    $(window).width() > 800 ? (800 * 9) / 16 : ($(window).width() * 9) / 16
  );

  $("#day1_1").width($(window).width() > 800 ? 800 : $(window).width() - 40);
  $("#day1_1").height(
      $(window).width() > 800 ? (800 * 9) / 16 : ($(window).width() * 9) / 16
  );

  $("#day3_1").width($(window).width() > 800 ? 800 : $(window).width() - 40);
  $("#day3_1").height(
      $(window).width() > 800 ? (800 * 9) / 16 : ($(window).width() * 9) / 16
  );
  for (var i = 0; i < 10; i++) {
    day3BGText();
  }

  $(".day3-button-container .button").on("click", function () {
    $(".judge-script").html(scriptContainer($(this).attr("cate")));
    var jd = $(this).attr("cate");
    if (jd == "생명보다 이윤") {
      $(".judge-text").html(
          "*비용을 아낄 수 있다면 안전 작업 절차 등을 무시하는등 생명보다 이윤을 앞세우는 기업의 민낯이 드러납니다."
      );
    } else if (jd == "시간은 곧 돈") {
      $(".judge-text").html(
          "*”빨리 빨리.” 위험한 줄 알면서도 기업은 노동자들을 속도전으로 내몰고 있습니다."
      );
    } else if (jd == "솜방망이 처벌") {
      $(".judge-text").html("*기업들은 처벌을 두려워하지 않습니다.");
    } else if (jd == "돌이킬 수 없는 피해") {
      $(".judge-text").html(
          "*사망한 노동자들은 누군가의 부모이자, 자식이자, 친구였습니다."
      );
    } else if (jd == "안전불감증") {
      $(".judge-text").html("*기업의 ‘안전불감증’이 사망사고를 불러왔습니다.");
    } else if (jd == "구조적 문제") {
      $(".judge-text").html(
          "*불법 재하도급, 무면허 등 불법이 만연한 현장이 사망사고의 원인이 되기도 했습니다."
      );
    }
    $(".accident-card").on("click", function () {
      onModal($(this).attr("acc_num"));
    });
  });

  $(".close-btn").on("click", function () {
    $(".acc-modal").css("display", "none");
    $("body").css("overflow", "auto");
  });

  var fisrtContainer = screenH * (picArray.length + 3);
  var secondContainer = screenH * 2;
  $(".day-container.first").height(fisrtContainer);
  $(".day-container.second").height(secondContainer);
  $(".helmet-container").html(drawHelmet());

  $(window).scroll(function () {
    currentH = $(document).scrollTop();
    currentP = Math.floor((currentH + 1) / screenH - 0.5);
    currentPFloat = (currentH + 1) / screenH;
    // console.log(currentP);
    console.log(currentPFloat);

    $(".img-container").css("transform", "scale(1)");
    $(".img-container").css("z-index", "1");
    $(".img-container").removeClass("glow-shadow");
    if (currentP > 3) {
      $(".img-container").css("opacity", 0.2);
    } else {
      $(".img-container").css("opacity", 1);
    }

    // 첫 나레이션
    var audio_nar1 = document.getElementById("day1_nar1");
    var audio_nar2 = document.getElementById("day1_nar2");
    var audio_nar3 = document.getElementById("day1_nar3");
    var audio_nar4 = document.getElementById("day1_nar4");
    var audio_nar5 = document.getElementById("day1_nar5");
    var audio_nar6 = document.getElementById("day1_nar6");

    if (currentPFloat < 1.5 && currentPFloat > 0) {
      audio_nar1.play();
    } else {
      audio_nar1.pause();
    }

    if (currentPFloat < 4.5 && currentPFloat > 3.5) {
      audio_nar2.play();
    } else {
      audio_nar2.pause();
    }

    if (currentPFloat < 5.5 && currentPFloat > 4.5) {
      audio_nar3.play();
    } else {
      audio_nar3.pause();
    }

    if (currentPFloat < 6.5 && currentPFloat > 5.5) {
      audio_nar4.play();
    } else {
      audio_nar4.pause();
    }

    if (currentPFloat < 7.5 && currentPFloat > 6.5) {
      audio_nar5.play();
    } else {
      audio_nar5.pause();
    }

    if (currentPFloat < 8.5 && currentPFloat > 7.5) {
      audio_nar6.play();
    } else {
      audio_nar6.pause();
    }

    // 첫번쨰 인터뷰 영상
    // if (currentPFloat > 2 && currentPFloat < 3.5) {
    //   document.getElementById("day1_1").play();
    //   $("video").prop("muted", true);
    // } else {
    //   document.getElementById("day1_1").pause();
    // }

    if (currentPFloat > 9 && currentPFloat < 10.5) {
      if (!isiPhone()) {
        document.getElementById("day1_2").play();
        $("video").prop("muted", true);
      }
    } else {
      document.getElementById("day1_2").pause();
    }

    if (currentPFloat > 11.5 && currentPFloat < 12.5) {
      if (!isiPhone()) {
        document.getElementById("day1_1").play();
        $("video").prop("muted", true);
      }
    } else {
      document.getElementById("day1_1").pause();
    }

    $.each($(".img-container"), function (i, d) {
      if ($(d).attr("pic_num") == picArray[Math.floor(currentPFloat) - 5]) {
        $(d).css("opacity", 1);
        $(d).css("transform", "scale(4)");
        $(d).css("z-index", "100");
        $(d).addClass("glow-shadow");
      }
    });
    if (currentP == 3) {
    }

    // DAY2 관련 시작

    var call_nar1 = document.getElementById("call_nar1");
    var call_nar2 = document.getElementById("call_nar2");
    var call_nar3 = document.getElementById("call_nar3");
    var call_nar4 = document.getElementById("call_nar4");
    var call_nar5 = document.getElementById("call_nar5");

    if (currentPFloat > 18.5) {
      call_nar1.pause();
      call_nar2.pause();
      call_nar3.pause();
      call_nar4.pause();
      call_nar5.pause();
    }

    // DAY 2 vod
    if (currentPFloat > 18.5 && currentPFloat < 19.5) {
      if (!isiPhone()) {
        document.getElementById("day2_1").play();
        $("video").prop("muted", true);
      }
    } else {
      document.getElementById("day2_1").pause();
    }

    // Day3 vod
    if (currentPFloat > 22.3 && currentPFloat < 23.5) {
      if (!isiPhone()) {
        document.getElementById("day3_1").play();
        $("video").prop("muted", true);
      }
    } else {
      document.getElementById("day3_1").pause();
    }

    // Day4 vod
    if (currentPFloat > 32.4 && currentPFloat < 33.5) {
      if (!isiPhone()) {
        document.getElementById("day4_1").play();
        $("video").prop("muted", true);
      }
    } else {
      document.getElementById("day4_1").pause();
    }

    // Day4 vod
    if (currentPFloat > 42.5 && currentPFloat < 43.5) {
      if (!isiPhone()) {
        document.getElementById("day5_1").play();
        $("video").prop("muted", true);
      }
    } else {
      document.getElementById("day5_1").pause();
    }

    if (currentPFloat > 46.7 && currentPFloat < 47.7) {
      if (!isiPhone()) {
        document.getElementById("day5_2").play();
        $("video").prop("muted", true);
      }
    } else {
      document.getElementById("day5_2").pause();
    }
  });

  // DAY2 시작
  $("#block3").vide(
      {
        mp4: "https://imnews.imbc.com/newszoomin/groupnews/groupnews_13/data/video/day2_bg",
		poster: "https://image.imnews.imbc.com/newszoomin/groupnews/groupnews_13/img/day2_bg.png"
      },
      {
        loop: true,
        muted: true
      }
  );

  if ($(window).width() > 1200) {
    $("#block4").vide(
        {
          mp4: "https://imnews.imbc.com/newszoomin/groupnews/groupnews_13/data/video/day3_bg_pc",
          poster: "https://image.imnews.imbc.com/newszoomin/groupnews/groupnews_13/img/day3_bg_pc.png"
        },
        {
          loop: true,
          muted: true
        }
    );
  } else {
    $("#block4").vide(
        {
          mp4: "https://imnews.imbc.com/newszoomin/groupnews/groupnews_13/data/video/day3_bg",
          poster: "https://image.imnews.imbc.com/newszoomin/groupnews/groupnews_13/img/day3_bg_pc.png"
        },
        {
          loop: true,
          muted: true
        }
    );
  }

  $("#day2_1").width($(window).width() > 800 ? 800 : $(window).width() - 40);
  $("#day2_1").height(
      $(window).width() > 800 ? (800 * 9) / 16 : ($(window).width() * 9) / 16
  );
  $(".company .material-icons").css("opacity", 1);

  $(".company").on("click", function () {
    call_nar1.pause();
    call_nar2.pause();
    call_nar3.pause();
    call_nar4.pause();
    call_nar5.pause();
    $(".call-container").css("display", "none");
    $(".company").removeClass("twinkle");

    $(".company").removeClass("active");
    $(".log-container").css("display", "none");
    // console.log(".com-" + $(this).attr("com_num") + "-log");
    $(".com-" + $(this).attr("com_num") + "-log").css("display", "block");
    $(this).addClass("active");

    var thisAudio = document.getElementById(
        "call_nar" + $(this).attr("com_num")
    );

    thisAudio.play();
  });

  // DAY2 끝

  //   initializeFlow();
});

function isiPhone() {
  return (
      navigator.platform.indexOf("iPhone") != -1 ||
      navigator.platform.indexOf("iPod") != -1
  );
}

function day3BGText() {
  $.each(day3_data, function (i, d) {
    $(".bg-text-container").append(d.wording);
  });
}

function scriptContainer(cate) {
  var scriptHTML = "";
  $.each(day3_data, function (i, d) {
    if (d.category == cate) {
      scriptHTML += "<div class='accident-card' acc_num='" + i + "'>";
      scriptHTML += "<img src='https://image.imnews.imbc.com/newszoomin/groupnews/groupnews_13/img/third/" + d.img + "' class='card-img'> ";

      scriptHTML += "<div class='card-text'>";
      scriptHTML += "<div class='serif'>";
      scriptHTML += d.wording;
      scriptHTML += "</div>";
      scriptHTML += "<div class='cunstruntor'>";
      scriptHTML += d.construction;
      scriptHTML += "</div>";
      scriptHTML += "</div>";

      scriptHTML += "</div>";
    }
  });
  return scriptHTML;
}

function onModal(num) {
  var d = day3_data[num];
  // console.log(d);
  $("body").css("overflow", "hidden");
  $(".acc-modal").css("display", "flex");

  $(".acc-img").attr("src", "https://image.imnews.imbc.com/newszoomin/groupnews/groupnews_13/img/third/" + d.img);
  $(".acc-wording").html(d.wording);
  $(".acc-source").html(d.source);
  $(".acc-date").html(d.date);
  $(".acc-where").html(d.where);
  $(".acc-content").html(d.content);
  $(".acc-construction").html(d.construction);
  $(".acc-sentence").html(d.sentence);
}

var day3_data = [
  {
    category: "안전불감증",
    source: "판결문",
    index: "170113_인성종합건설",
    img: "img_1.png",
    wording:
        "&quot;고질적인 안전불감증이 부른 전형적인 인재&quot;, &quot;향후 재발방지를 다짐&quot;",
    date: "2017년 1월 13일 오전 10시 40분경",
    where: "강원도",
    construction: "태양광시설 설치공사 현장",
    content:
        "외국인 일용직 노동자 43살 A씨가 태양광 모듈을 설치하던 중 사다리가 접혀 5m 아래로 추락해 사망",
    sentence:
        "원청업체 벌금 700만 원, 원청업체 대표 징역 1년에 집행유예 2년, 하청업체 벌금 500만 원, 하청업체 사내이사 징역 1년에 집행유예 2년",
    source_where: "7페이지 양형이유",
    source_link:
        "https://drive.google.com/file/d/1e6v903UO6weoYavzoruuKaT9k5X6-dqD/view?usp=sharing",
    photo_link:
        "https://drive.google.com/file/d/16jndMtQZ_c7y7JJV-G46POFTtfv83lGx/view?usp=sharing",
    video_name: "",
  },
  {
    category: "돌이킬 수 없는 피해",
    source: "판결문",
    index: "170119_㈜신성종합건설",
    img: "img_2.png",
    wording:
        "&quot;유족으로부터 용서받지 못한 점&quot;,&quot;재판에 불출석하고 도주&quot;",
    date: "2017년 1월 19일 오전 11시 30분경",
    where: "충청북도 청주시",
    construction: "근린생활시설 신축공사 현장",
    content:
        "하청소속 일용직 노동자 55살 김 모 씨가 천장 미장작업 중 2.5m 아래로 추락해 사망",
    sentence:
        "원청업체 벌금 700만 원, 원청업체 현장소장 징역 8월에 집행유예 2년, 하청업체 벌금 700만 원, 하청업체 실제 운영자 징역 10월",
    source_where: "8페이지 양형이유",
    source_link:
        "https://drive.google.com/file/d/1lSKBbNvHszBsjScjAMTrzZ9wrxBcs8lK/view?usp=sharing",
    photo_link:
        "https://drive.google.com/file/d/1Ilq7QlhBdNhdkc0iOEiCgCSczp-be7AH/view?usp=sharing",
    video_name: "",
  },
  {
    category: "생명보다 이윤",
    source: "재해조사의견서",
    index: "170202_㈜삼우씨에스씨",
    img: "img_3.png",
    wording:
        "&quot;금전적 손실만을 생각하고 근로자 안전은 생각하지 않음.&quot;",
    date: "2017년 2월 2일 오전 10시 30분경",
    where: "충청남도 아산시 둔포면",
    construction: "냉동창고 신축공사 현장",
    content:
        "하청업체 소속 일용직 노동자 37살 이 모 씨가 전실 천장에 발을 내딛는 순간 천장마감재가 빠지면서 7m 아래로 추락하여 사망",
    sentence: "불기소",
    source_where: "14페이지 라. 문화적 요인",
    source_link:
        "https://drive.google.com/file/d/12kgcE1PdMqf65nLTP2VkWFgwAT7rgmIl/view?usp=sharing",
    photo_link:
        "https://drive.google.com/file/d/1qzTsKPRhDG1K1Jgqvh2KhcPINdJlof5d/view?usp=sharing",
    video_name: "",
  },
  {
    category: "반복되는 사고",
    source: "재해조사의견서",
    index: "170203_요진건설산업㈜",
    img: "img_4.png",
    wording: "&quot;당 현장은 현재까지 사망 3명, 재해자수 12명&quot;",
    date: "2017년 2월 3일 오전 7시 30분경",
    where: "인천광역시 서구",
    construction: "친환경표면처리센터 신축공사현장",
    content:
        "하청업체 소속 일용직 노동자 50살 천 모 씨가 합판을 치우다 12m 아래로 추락하여 사망",
    sentence: "재판중",
    source_where: "13페이지 가. 관리적 원인",
    source_link:
        "https://drive.google.com/file/d/1MtDthSo0Rcmqq0TNAlnTdKP3CBkfc8Gp/view?usp=sharing",
    photo_link:
        "https://drive.google.com/file/d/1gDJHMxhK8NvcC4DsxUqXi1Gww5T7DL1b/view?usp=sharing",
    video_name: "",
  },
  {
    category: "시간은 곧 돈",
    source: "재해조사의견서",
    index: "170203_요진건설산업㈜",
    img: "img_4.png",
    wording: "&quot;지체 상환금을 피하기 위하여 안전을 등한시&quot;",
    date: "2017년 2월 3일 오전 7시 30분경",
    where: "인천광역시 서구",
    construction: "친환경표면처리센터 신축공사현장",
    content:
        "하청업체 소속 일용직 노동자 50살 천 모 씨가 합판을 치우다 12m 아래로 추락하여 사망",
    sentence: "재판중",
    source_where: "13페이지 가. 관리적 원인",
    source_link:
        "https://drive.google.com/file/d/1MtDthSo0Rcmqq0TNAlnTdKP3CBkfc8Gp/view?usp=sharing",
    photo_link:
        "https://drive.google.com/file/d/1gDJHMxhK8NvcC4DsxUqXi1Gww5T7DL1b/view?usp=sharing",
    video_name: "",
  },
  {
    category: "돌이킬 수 없는 피해",
    source: "판결문",
    index: "170216_세협종합건설㈜",
    img: "img_5.png",
    wording: "&quot;유족들이 피고인의 엄벌을 탄원하는 점&quot;",
    date: "2017년 2월 16일 오후 1시 20분경",
    where: "경기도 성남시 분당구",
    construction: "초등학교 교실증축공사 현장",
    content:
        "일용직 노동자 73살 김 모 씨가 옥상 바닥 천공 작업 중 14m 아래로 추락해 사망",
    sentence:
        "원청업체 벌금 1000만 원, 원청업체 현장소장 징역 10월에 집행유예 2년",
    source_where: "6페이지 양형이유",
    source_link:
        "https://drive.google.com/file/d/1xORBR6721Re75c9NwtauBcP5EJYF5_Qu/view?usp=sharing",
    photo_link:
        "https://drive.google.com/file/d/1lWADrE-fJTJ5rx_Sftnn8bjKN7mTBs1S/view?usp=sharing",
    video_name: "",
  },
  {
    category: "돌이킬 수 없는 피해",
    source: "판결문",
    index: "170303_㈜수홍종합건설",
    img: "img_50.png",
    wording:
        "&quot;피해자 및 유족들에게 돌이킬 수 없는 피해를 입혔다는 점&quot;",
    date: "2017년 3월 3일 오후 1시 45분경",
    where: "부산광역시 사하구 괴정동",
    construction: "아파트 신축공사 현장",
    content:
        "하청업체 소속 노동자 75살 박 모 씨가 엘리베이터실 옥탑 방수 작업 중 5.4m 아래로 추락해 사망",
    sentence:
        "원청업체 벌금 500만 원, 원청업체 현장소장 징역 6월에 집행유예 2년 및 사회봉사 80시간, 하청업체 벌금 500만원, 하청업체 대표 징역 6월에 집행유예 2년 및 사회봉사 80시간,",
    source_where: "선고형의 결정",
    source_link:
        "https://drive.google.com/file/d/17F6fmVcrX-KanKw6VaqZl8p6sC2tOvDN/view?usp=sharing",
    photo_link:
        "https://drive.google.com/file/d/1P939VmfWk19-kEpfzDTs2K0Qh3WTRNoY/view?usp=sharing",
    video_name: "",
  },
  {
    category: "안전불감증",
    source: "판결문",
    index: "170319_㈜성흥씨앤디종합건설",
    img: "img_6.png",
    wording: "&quot;고소작업 하도급 현장에 만연한 안전불감증&quot;",
    date: "2017년 3월 19일 오전 10시 10분경",
    where: "인천광역시 서구",
    construction: "공장 신축공사",
    content:
        "하청업체 소속 일용직 노동자 55살 박 모씨가 고소 작업차량에서 도장 작업 중 8.5m 아래로 추락하여 사망",
    sentence:
        "원청업체 벌금 300만 원, 원청업체 대표 벌금 300만 원, 원청업체 현장소장 금고 5월에 집행유예 1년, 재재하청업체 대표 금고 6월에 집행유예 1년 및 사회봉사 120시간",
    source_where: "6페이지 양형이유",
    source_link:
        "https://drive.google.com/file/d/1YfLB26Pe-nJoI-_4Jm_i2B6oUISG246J/view?usp=sharing",
    photo_link:
        "https://drive.google.com/file/d/1oI_QNc4-7Cpv-JBl4iXq3Gss8ybd2m51/view?usp=sharing",
    video_name: "",
  },
  {
    category: "시간은 곧 돈",
    source: "재해조사의견서",
    index: "170403_㈜씨엔와이이엔씨",
    img: "img_7.png",
    wording: "&quot;단기간동안 공정을 맞추기 위해 무리하게 작업을 진행&quot;",
    date: "2017년 4월 3시 오전 10시 10분경",
    where: "경기도 부천시 장말로",
    construction: "공영주차장 철거 현장",
    content: "57살 류 모 씨가 주차타워 철거 작업 중 18m 아래로 추락하여 사망",
    sentence:
        "원청업체 벌금 300만 원, 원청업체 대표 징역 8월에 집행유예 2년 및 사회봉사 80시간, 원청업체 현장소장 금고 6월에 집행유예 2년 및 사회봉사 40시간",
    source_where: "16페이지 다. 기술적 원인",
    source_link:
        "https://drive.google.com/file/d/1D98leoB-NIN1EF2hryaZ8ERC79unxvWG/view?usp=sharing",
    photo_link:
        "https://drive.google.com/file/d/1CXPfkVJB-NG8c3EwarbzJY_nQxPESg1o/view?usp=sharing",
    video_name: "",
  },
  {
    category: "안전불감증",
    source: "판결문",
    index: "170403_㈜씨엔와이이엔씨",
    img: "img_7.png",
    wording: "&quot;원인은 안전시설 미설치&quot;",
    date: "2017년 4월 3일 오전 10시 10분경",
    where: "경기도 부천시 장말로",
    construction: "공영주차장 철거공사 현장",
    content:
        "일용직 노동자 57살 류 모 씨가 철골보를 타고 이동하던 중 18m 아래로 추락하여 사망",
    sentence:
        "원청업체 벌금 300만 원, 원청업체 대표 징역 8월에 집행유예 2년 및 사회봉사 80시간, 원청업체 현장소장 금고 6월에 집행유예 2년 및 사회봉사 40시간",
    source_where: "9페이지 양형이유",
    source_link:
        "https://drive.google.com/file/d/1D98leoB-NIN1EF2hryaZ8ERC79unxvWG/view?usp=sharing",
    photo_link:
        "https://drive.google.com/file/d/1CXPfkVJB-NG8c3EwarbzJY_nQxPESg1o/view?usp=sharing",
    video_name: "",
  },
  {
    category: "구조적 문제",
    source: "판결문",
    index: "170403_㈜씨엔와이이엔씨",
    img: "img_7.png",
    wording: "&quot;하도급이 금지된 공사였고&quot;",
    date: "2017년 4월 3일 오전 10시 10분경",
    where: "경기도 부천시 장말로",
    construction: "공영주차장 철거공사 현장",
    content:
        "일용직 노동자 57살 류 모 씨가 철골보를 타고 이동하던 중 18m 아래로 추락하여 사망",
    sentence:
        "원청업체 벌금 300만 원, 원청업체 대표 징역 8월에 집행유예 2년 및 사회봉사 80시간, 원청업체 현장소장 금고 6월에 집행유예 2년 및 사회봉사 40시간",
    source_where: "9페이지 양형이유",
    source_link:
        "https://drive.google.com/file/d/1D98leoB-NIN1EF2hryaZ8ERC79unxvWG/view?usp=sharing",
    photo_link:
        "https://drive.google.com/file/d/1CXPfkVJB-NG8c3EwarbzJY_nQxPESg1o/view?usp=sharing",
    video_name: "",
  },
  {
    category: "생명보다 이윤",
    source: "재해조사의견서",
    index: "170510_㈜선민건설",
    img: "img_8.png",
    wording: "&quot;비용절감을 이유로 안전작업절차를 준수하지 않음&quot;",
    date: "2017년 5월 10일 오후 4시 30분경",
    where: "충청남도 천안시 서북구 불당동",
    construction: "타워 신축 공사 현장",
    content:
        "하청업체 소속 일용직 노동자 55살 손 모 씨가 30cm 폭의 버팀대 위에서 띠장 해체 신호를 하던 중 9m 아래로 추락하여 사망",
    sentence: "약식기소",
    source_where: "15페이지 라. 문화적 요인",
    source_link:
        "https://drive.google.com/file/d/1IKDKCAfPzKo4yGlyndXBa5bTYucaStw7/view?usp=sharing",
    photo_link:
        "https://drive.google.com/file/d/1AT5UUOs9oV6Pj0tzO_FDCqBPSoyeDyB-/view?usp=sharing",
    video_name: "",
  },
  {
    category: "시간은 곧 돈",
    source: "재해조사의견서",
    index: "170518_동아에스텍㈜",
    img: "img_9.png",
    wording: "&quot;당일 작업 물량을 완료하기 위해&quot;",
    date: "2017년 5월 18일 오전 3시 40분경",
    where: "경기도 수원시 영통구",
    construction: "고속도로 방음시설 설치공사",
    content:
        "일용직 노동자 48살 강 모 씨가 방음판 설치작업 중 7.7m 아래로 추락하여 사망",
    sentence: "약식기소",
    source_where: "13페이지 라. 문화적 요인",
    source_link:
        "https://drive.google.com/file/d/1cvybFGVvbGOKE1CcMODFEwp-UrQvQF5e/view?usp=sharing",
    photo_link:
        "https://drive.google.com/file/d/1-duAfvirtFY5WALrqch-_IcD2IQyKDx5/view?usp=sharing",
    video_name: "",
  },
  {
    category: "안전불감증",
    source: "재해조사의견서",
    index: "170518_동아에스텍㈜",
    img: "img_9.png",
    wording: "&quot;안전조치가 미흡&quot;",
    date: "2017년 5월 18일 오전 3시 40분경",
    where: "경기도 수원시 영통구",
    construction: "고속도로 방음시설 설치공사",
    content:
        "일용직 노동자 48살 강 모 씨가 방음판 설치작업 중 7.7m 아래로 추락하여 사망",
    sentence: "약식기소",
    source_where: "13페이지 라. 문화적 요인",
    source_link:
        "https://drive.google.com/file/d/1cvybFGVvbGOKE1CcMODFEwp-UrQvQF5e/view?usp=sharing",
    photo_link:
        "https://drive.google.com/file/d/1-duAfvirtFY5WALrqch-_IcD2IQyKDx5/view?usp=sharing",
    video_name: "",
  },
  {
    category: "안전불감증",
    source: "판결문",
    index: "170522_현대엔지니어링",
    img: "img_10.png",
    wording:
        "&quot;정품이 아닌 임의로 제작된 보조 포올&quot;, &quot;현장소장, 총 436건의 위반행위&quot;, &quot;실제 교육 없이 교육하는 장면을 사진촬영한 후 끝내&quot;",
    date: "2017년 5월 22일 오후 4시 40분경",
    where: "경기도 남양주시",
    construction: "아파트 신축공사 현장",
    content:
        "하청업체 소속 일용직 노동자 김 모 씨, 석 모 씨, 윤 모 씨가 타워크레인 상부 구조물과 함께 50m 아래로 추락해 사망",
    sentence:
        "원청업체 벌금 1500만 원, 원청업체 현장소장 벌금 1500만 원, 원청업체 안전과장 벌금 1000만 원, 하청업체 현장소장 금고 12월, 하청업체 안전과장 벌금 700만 원, 재하청업체 대표 징역 1년 6월",
    source_where: "2페이지, 13페이지, 41페이지",
    source_link:
        "https://drive.google.com/file/d/1IDaJbpq78S9n7LEuUog9EcicFGNim4xG/view?usp=sharing",
    photo_link:
        "https://drive.google.com/file/d/1xcnUX82B4fOi45FHnG6syRQMcCrBn9c1/view?usp=sharing",
    video_name: "",
  },
  {
    category: "안전불감증",
    source: "판결문",
    index: "170522_현대엔지니어링㈜",
    img: "img_11.png",
    wording: "&quot;임의로 제작한 부품을 검증도 하지 않고 사용&quot",
    date: "2017년 5월 22일 오후 4시 40분경",
    where: "경기도 남양주시",
    construction: "아파트 신축공사 현장",
    content:
        "하청업체 소속 일용직 노동자 김 모 씨, 석 모 씨, 윤 모 씨가 타워크레인 상부 구조물과 함께 50m 아래로 추락해 사망",
    sentence:
        "원청업체 벌금 1500만 원, 원청업체 현장소장 벌금 1500만 원, 원청업체 안전과장 벌금 1000만 원, 하청업체 현장소장 금고 12월, 하청업체 안전과장 벌금 700만 원, 재하청업체 대표 징역 1년 6월",
    source_where: "2페이지 판단",
    source_link:
        "https://drive.google.com/file/d/1IDaJbpq78S9n7LEuUog9EcicFGNim4xG/view?usp=sharing",
    photo_link:
        "https://drive.google.com/file/d/1xcnUX82B4fOi45FHnG6syRQMcCrBn9c1/view?usp=sharing",
    video_name: "",
  },
  {
    category: "안전불감증",
    source: "판결문",
    index: "170522_현대엔지니어링㈜",
    img: "img_11.png",
    wording: "&quot;심각한 안전의식 부재&quot;",
    date: "2017년 5월 22일 오후 4시 40분경",
    where: "경기도 남양주시",
    construction: "아파트 신축공사 현장",
    content:
        "하청업체 소속 일용직 노동자 김 모 씨, 석 모 씨, 윤 모 씨가 타워크레인 상부 구조물과 함께 50m 아래로 추락해 사망",
    sentence:
        "원청업체 벌금 1500만 원, 원청업체 현장소장 벌금 1500만 원, 원청업체 안전과장 벌금 1000만 원, 하청업체 현장소장 금고 12월, 하청업체 안전과장 벌금 700만 원, 재하청업체 대표 징역 1년 6월",
    source_where: "2페이지 판단",
    source_link:
        "https://drive.google.com/file/d/1IDaJbpq78S9n7LEuUog9EcicFGNim4xG/view?usp=sharing",
    photo_link:
        "https://drive.google.com/file/d/1xcnUX82B4fOi45FHnG6syRQMcCrBn9c1/view?usp=sharing",
    video_name: "",
  },
  {
    category: "생명보다 이윤",
    source: "재해조사의견서",
    index: "170704_㈜도우엔지니어링",
    img: "img_12.png",
    wording: "&quot;금전적 손실만을 생각하여 안전을 소홀히 함&quot;",
    date: "2017년 7월 4일 오전 10시 10분경",
    where: "충청남도 아산시 둔포면 석폭리",
    construction: "크린룸 설비공사 현장",
    content:
        "하청업체 소속 일용직 노동자 24살 황 모 씨가 딛고 있던 크린룸 천장 마감재가 떨어져 10m 아래로 추락하여 사망",
    sentence: "재판중",
    source_where: "14페이지 라. 문화적 요인",
    source_link:
        "https://drive.google.com/file/d/1V-LetpN8PBSed3O2PK9wIhabPzK3y65f/view?usp=sharing",
    photo_link:
        "https://drive.google.com/file/d/1pLBXG300ZQ6X3BymRQusIA5kK6m3m1cU/view?usp=sharing",
    video_name: "",
  },
  {
    category: "시간은 곧 돈",
    source: "재해조사의견서",
    index: "170729_현대건설㈜",
    img: "img_13.png",
    wording:
        "&quot;공기가 부족&quot;, &quot;2016년에도 사망재해가 발생했던 현장&quot;, &quot;2차 하도급&quot;",
    date: "2017년 7월 29일 오후 3시 40분경",
    where: "경기도 광주시 태전동",
    construction: "아파트 신축공사 현장",
    content:
        "하청업체 소속 일용직 노동자 양 모 씨와 고 모 씨가 타고있던 운반구가 추락해 23m 아래로 떨어져 사망",
    sentence: "불기소",
    source_where: "29페이지 가. 관리적 원인, 다. 문화적 제도적 원인",
    source_link:
        "https://drive.google.com/file/d/1ytCiUrrKBPeCEPF1vr3nUl2iiHX8JOl2/view?usp=sharing",
    photo_link:
        "https://drive.google.com/file/d/141i1gIW34yAM5DmkzSUGmAAdVVe3k1Zw/view?usp=sharing",
    video_name: "",
  },
  {
    category: "시간은 곧 돈",
    source: "재해조사의견서",
    index: "170824_㈜성현이앤씨",
    img: "img_14.png",
    wording: "&quot;원청은 공사 일정 위주로 현장 관리&quot;",
    date: "2017년 8월 24일 오전 9시경",
    where: "전라북도 익산시 왕궁면",
    construction: "공장 신축공사 현장",
    content:
        "하청업체 소속 일용직 노동자 66살 이 모 씨가 폭 20cm의 철골보 위에서 이동하던 중 5m 아래로 추락하여 사망",
    sentence: "불기소",
    source_where: "9페이지 나. 관리적 요인",
    source_link:
        "https://drive.google.com/file/d/1Puzu9I70lmSludHTT8BVkWlIwJ-HEn-t/view?usp=sharing",
    photo_link:
        "https://drive.google.com/file/d/1ATGONFtkD9trwjdAsFUwkkdZhaTgBkz2/view?usp=sharing",
    video_name: "",
  },
  {
    category: "구조적 문제",
    source: "재해조사의견서",
    index: "170904_개인업자",
    img: "img_15.png",
    wording: "&quot;소규모 현장, 관리책임자가 다른 현장 겸직&quot;",
    date: "2017년 9월 4일 오후 2시 15분경",
    where: "경기도 양주시 백석읍",
    construction: "기숙사 증축 공사 현장",
    content:
        "일용직 노동자 50살 배 모 씨가 지붕에서 방수 및 마감작업 중 11.4m 아래로 추락하여 사망",
    sentence: "원청업체 대표 징역 6월에 집행유예 2년 및 사회봉사 40시간",
    source_where: "14페이지 재해발생 원인 다. 문화적 제도적 원인",
    source_link:
        "https://drive.google.com/file/d/1NAtlW8ovHHsya7qiKv0L_yL3gWL90NR0/view?usp=sharing",
    photo_link:
        "https://drive.google.com/file/d/1mnkW2FPPjwkJcB8_x5-Mp6E85BWA3QAv/view?usp=sharing",
    video_name: "",
  },
  {
    category: "구조적 문제",
    source: "재해조사의견서",
    index: "170921_근화건설",
    img: "img_16.png",
    wording:
        "&quot;무면허업자 시공&quot;, &quot; 전문건설업면허가 없어 하도급 받을 수 없음&quot;",
    date: "2017년 9월 21일 오전 10시 30분경",
    where: "충청북도 괴산군 청안면",
    construction: "공장 신축 공사 현장",
    content:
        "하청업체 소속 일용직 노동자 51살 진 모 씨가 퍼린 설치 작업 중 9m 아래로 추락하여 사망",
    sentence:
        "원청업체 벌금 500만 원, 원청업체 대표 징역 6월에 집행유예 2년 및 사회봉사 40시간, 하청업체 대표 징역 1년에 집행유예 2년 및 사회봉사 120시간",
    source_where: "10페이지 다. 무면허업자 시공",
    source_link:
        "https://drive.google.com/file/d/1zgTuPk0Y4quDPWFvZFGdEgmPl34SkQ_o/view?usp=sharing",
    photo_link:
        "https://drive.google.com/file/d/1ngVKNoLjJ3Af6tHKswObqWM8ABCxnUX_/view?usp=sharing",
    video_name: "",
  },
  {
    category: "시간은 곧 돈",
    source: "재해조사의견서",
    index: "171010_라온건설",
    img: "img_17.png",
    wording:
        "&quot;지연이 되면 공기지연을 초래&quot;, &quot;공기, 원가, 품질을 우선으로&quot;",
    date: "2017년 10월 10일 오전 11시 30분경",
    where: "대구광역시 수성구 범어동",
    construction: "아파트 신축공사 현장",
    content:
        "하청업체 소속 일용직 노동자 64살 김 모 씨가 갱퐁 상승 작업 중 갱폼 외벽이 탈락돼 43m 아래로 추락해 사망",
    sentence:
        "원청업체 벌금 500만 원, 원청업체 현장소장 벌금 700만 원, 하청업체 벌금 500만 원, 하청업체 현장소장 벌금 500만 원",
    source_where: "19페이지 라. 문화적 요인, 마. 제도적 요인",
    source_link:
        "https://drive.google.com/file/d/1HUO0BnOVK-J8ohU4qgy8ZbUjpPhEXy5t/view?usp=sharing",
    photo_link:
        "https://drive.google.com/file/d/1EoLy8D03JaZX09xwjeHwV-ytKO3-Njbe/view?usp=sharing",
    video_name: "",
  },
  {
    category: "생명보다 이윤",
    source: "재해조사의견서",
    index: "171021_해신종합건설㈜",
    img: "img_18.png",
    wording:
        "&quot;비용 상의 문제 등으로 안전난간을 설치하지 않고&quot;, &quot;비용 절감의 목적&quot;",
    date: "2017년 10월 21일 오전 10시 30분경",
    where: "경기도 평택시 오성면",
    construction: "오피스텔 및 다세대주택공사 현장",
    content:
        "하청업체 소속 일용직 노동자 55살 박 모 씨가 외부 벽돌을 쌓던 중 12.5m 아래로 추락하여 사망",
    sentence: "불기소",
    source_where: "11페이지 라. 문화적 요인, 마. 제도적 요인",
    source_link:
        "https://drive.google.com/file/d/1aUCzltvnaRkeurGYLkhZaYLFXM9DPCwY/view?usp=sharing",
    photo_link:
        "https://drive.google.com/file/d/1fFjnJsj9paw8CEeL6dOY8MqCqOwNYd8x/view?usp=sharing",
    video_name: "",
  },
  {
    category: "시간은 곧 돈",
    source: "재해조사의견서",
    index: "171107_우진공영㈜",
    img: "img_19.png",
    wording: "&quot;추락에 의한 재해 위험이 있더라도 공기단축을 위해&quot;",
    date: "2017년 11월 7일 오후 1시 20분경",
    where: "대구광역시 서구 비산동",
    construction: "건물 철거공사 현장",
    content:
        "일용직 노동자 63살 신 모 씨가 지붕재 해체 작업 중 지붕 마감재가 파손되면서 4m 아래로 추락하여 사망",
    sentence: "약식기소",
    source_where: "6페이지 라. 문화적 요인",
    source_link:
        "https://drive.google.com/file/d/1yTajV7E04ePyvCIS-UbDB5AxPHlxmgo2/view?usp=sharing",
    photo_link:
        "https://drive.google.com/file/d/16rTYfIP1o3f-NcIwAKhy_m48S0vWqY1d/view?usp=sharing",
    video_name: "",
  },
  {
    category: "생명보다 이윤",
    source: "재해조사의견서",
    index: "180103_한신공영㈜",
    img: "img_20.png",
    wording: "&quot;공사원가를 최소화하려는 문화가 팽배&quot;",
    date: "2018년 1월 3일 오전 8시 35분경",
    where: "경상북도 영천시 화산면",
    construction: "철도 노반신설 공사 현장",
    content:
        "하청업체 소속 외국인 일용직 노동자 39살 A씨가 외벽에서 떨어진 거푸집에 맞아 13m 아래로 추락하여 사망",
    sentence:
        "원청업체 벌금 300만 원, 원청업체 안전보건관리책임자 벌금 300만 원, 하청업체1 벌금 700만 원, 하청업체1 안전관리책임자 700만 원, 하청업체2 벌금 100만 원, 하청업체2 안전보건관리책임자 벌금 100만 원",
    source_where: "18페이지 라. 문화적 요인",
    source_link:
        "https://drive.google.com/file/d/1L8lifI-anOy5w3GpttWenBZ4o11p1UTA/view?usp=sharing",
    photo_link:
        "https://drive.google.com/file/d/1d9J3rlA8s2Og3rTRbhP-4CT2cGaFAywR/view?usp=sharing",
    video_name: "",
  },
  {
    category: "돌이킬 수 없는 피해",
    source: "판결문",
    index: "180116_㈜동신",
    img: "img_51.png",
    wording:
        "&quot;유족들은 정신적으로 헤아릴 수 없이 커다란 충격과 고통을 받게&quot;",
    date: "2018년 1월 16일 오후 1시 30분경",
    where: "부산광역시 금정구",
    construction: "대학교 기숙사 신축현장",
    content:
        "하청업체 소속 일용직 노동자 57세 백 모 씨가 실내 견출 작업 중 17m 아래로 추락해 사망",
    sentence:
        "원청업체 벌금 300만 원, 원청업체 상무이사 벌금 300만 원, 하청업체 벌금 500만원, 하청업체 대표 벌금 500만원",
    source_where: "6페이지 선고형의 결정",
    source_link:
        "https://drive.google.com/file/d/1ckaYi06BKIqROjkpB0wxYis014Pm2lhW/view?usp=sharing",
    photo_link:
        "https://drive.google.com/file/d/1qCH54idcTK19FeCrmhP_j3mKbj5D3h4a/view?usp=sharing",
    video_name: "",
  },
  {
    category: "구조적 문제",
    source: "판결문",
    index: "180228_해유건설㈜",
    img: "img_21.png",
    wording:
        "&quot;안전보건책임과 개인 과실이 아닌 사업주 차원의 구조적 문제&quot;",
    date: "2018년 2월 28일 오후 1시 10분경",
    where: "경기도 의정부시 의정부동",
    construction: "오피스텔 건설현장",
    content:
        "하청업체 소속 일용직 노동자 43살 최 모 씨가 갱폼 인양 작업 중 42m 아래로 추락하여 사망",
    sentence:
        "원청업체 벌금 500만 원, 원청업체 현장소장 징역 6월에 집행유예 1년, 하청업체 벌금 500만 원, 하청업체 현장소장 징역 6월에 집행유예 1년",
    source_where: "7페이지 판단, 8페이지 양형이유",
    source_link:
        "https://drive.google.com/file/d/1cbhDZVPjCPmoGyT7DNX8LLUdklk3SEPn/view?usp=sharing",
    photo_link:
        "https://drive.google.com/file/d/12xAq6U6sedC-jGWvL7WAFaOXtbk3Gtid/view?usp=sharing",
    video_name: "",
  },
  {
    category: "안전불감증",
    source: "판결문",
    index: "180228_해유건설㈜",
    img: "img_21.png",
    wording: "&quot;피고인들의 안전불감증&quot;",
    date: "2018년 2월 28일 오후 1시 10분경",
    where: "경기도 의정부시 의정부동",
    construction: "오피스텔 건설현장",
    content:
        "하청업체 소속 일용직 노동자 43살 최 모 씨가 갱폼 인양 작업 중 42m 아래로 추락하여 사망",
    sentence:
        "원청업체 벌금 500만 원, 원청업체 현장소장 징역 6월에 집행유예 1년, 하청업체 벌금 500만 원, 하청업체 현장소장 징역 6월에 집행유예 1년",
    source_where: "7페이지 판단, 8페이지 양형이유",
    source_link:
        "https://drive.google.com/file/d/1cbhDZVPjCPmoGyT7DNX8LLUdklk3SEPn/view?usp=sharing",
    photo_link:
        "https://drive.google.com/file/d/12xAq6U6sedC-jGWvL7WAFaOXtbk3Gtid/view?usp=sharing",
    video_name: "",
  },
  {
    category: "안전불감증",
    source: "판결문",
    index: "180228_해유건설㈜",
    img: "img_21.png",
    wording: "&quot;피고인들의 안전 불감증으로 인하여&quot;",
    date: "2018년 2월 28일 오후 1시 10분경",
    where: "경기도 의정부시 의정부동",
    construction: "오피스텔 건설현장",
    content:
        "하청업체 소속 일용직 노동자 43살 최 모 씨가 갱폼 인양 작업 중 42m 아래로 추락하여 사망",
    sentence:
        "원청업체 벌금 500만 원, 원청업체 현장소장 징역 6월에 집행유예 1년, 하청업체 벌금 500만 원, 하청업체 현장소장 징역 6월에 집행유예 1년",
    source_where: "7페이지 판단, 8페이지 양형이유",
    source_link:
        "https://drive.google.com/file/d/1cbhDZVPjCPmoGyT7DNX8LLUdklk3SEPn/view?usp=sharing",
    photo_link:
        "https://drive.google.com/file/d/12xAq6U6sedC-jGWvL7WAFaOXtbk3Gtid/view?usp=sharing",
    video_name: "",
  },
  {
    category: "구조적 문제",
    source: "판결문",
    index: "180302_㈜포스코건설",
    img: "img_22.png",
    wording:
        "&quot;220만 원 상당의 양주 3병, 접대부 2명, 접대부와의 성관계 제공&quot;, &quot;중층적 도급 관계의 가장 밑에서 직접 위험에 노출되는 작업자&quot;",
    date: "2018년 3월 2일 오후 1시 50분경",
    where: "부산광역시 해운대구 중동",
    construction: "공동주택 건설현장",
    content:
        "하청업체 소속 일용직 노동자 남 모 씨, 이 모 씨, 김 모 씨가 작업대와 함께 201m 아래로 추락해 사망. 하청업체 소속 일용직 노동자 김 모 씨는 떨어지는 작업대에 맞아 사망",
    sentence:
        "원청업체 벌금 1000만 원, 원청업체 건축소장 벌금 700만 원, 원청업체 건축팀장 벌금 700만 원, 원청업체 안전팀장 벌금 700만 원, 원청업체 선임현장소장 징역 1년에 집행유예 2년, 하청업체 1500만 원, 하청업체 총괄소장 벌금 700만 원, 하청업체 현장소장1 벌금 200만 원, 하청업체 현장소장2 징역 6월에 집행유예 1년, 재하청업체 무죄, 재하청업체 팀장 금고 8월에 집행유예 1년, 재하청업체 현장관리자 금고 8월에 집행유예 1년, 감리업체 총괄감리원 벌금 700만 원",
    source_where: "19페이지, 75페이지",
    source_link:
        "https://drive.google.com/file/d/1Lm6B-4ynXi7XiaZJ955qdyq2CxRFl3mW/view?usp=sharing",
    photo_link:
        "https://drive.google.com/file/d/1FeQKbUT7sPlmCnszZAgYXsON8KbV8cHY/view?usp=sharing",
    video_name: "[엠바고 6월30일이후] 추락사 엘시티 사고_LTE10",
  },
  {
    category: "생명보다 이윤",
    source: "재해조사의견서",
    index: "180328_㈜에스아이종합건설",
    img: "img_23.png",
    wording: "&quot;안전관리비 집행에 소극적&quot;",
    date: "2018년 3월 28일 오후 16시 40분경",
    where: "경기도 수원시 권선구 서둔동",
    construction: "주택 신축공사 현장",
    content:
        "일용직 노동자 34살 추 모 씨가 외부 비계 작업발판 위에서 파벽돌 타일 자재를 정리하던 중 11.5m 아래로 추락하여 사망",
    sentence: "약식기소",
    source_where: "12페이지 라. 문화적 요인",
    source_link:
        "https://drive.google.com/file/d/1Hcdck3QG_E0GaT91h4w8uZa0FdItQ5AZ/view?usp=sharing",
    photo_link:
        "https://drive.google.com/file/d/12uJStg61hIW9ma6X1a7uGO4Zc5XC9aDD/view?usp=sharing",
    video_name: "",
  },
  {
    category: "생명보다 이윤",
    source: "재해조사의견서",
    index: "180421_현해건설㈜",
    img: "img_24.png",
    wording: "&quot;관급 발주공사 시 한정된 예산문제로&quot;",
    date: "2018년 4월 21일 오전 11시 30분경",
    where: "경기도 오산시 청호동",
    construction: "주택 건설공사 현장",
    content:
        "하청업체 소속 일용직 노동자 42살 정 모 씨가 청소 작업 중 10m 아래로 추락하여 사망",
    sentence: "불기소",
    source_where: "12페이지 마. 제도적 요인",
    source_link:
        "https://drive.google.com/file/d/17y0Xn6-X8184LxeFVaVT7vJuLshJ0iM9/view?usp=sharing",
    photo_link:
        "https://drive.google.com/file/d/1WYstomWSbc-k19gRd8PMiYqjlwFsY5DT/view?usp=sharing",
    video_name: "",
  },
  {
    category: "솜방망이 처벌",
    source: "판결문",
    index: "180428_신진산업",
    img: "img_25.png",
    wording:
        "&quot;안전한 작업환경을 조성하는데 드는 비용이 형별이나 행정벌보다 훨씬 크다고 여기고 있기 때문&quot;, &quot;가벼운 형을 선고하는 것은 피고인의 재범을 용인하는 것&quot;",
    date: "2018년 4월 28일 오후 7시경",
    where: "경기도 동두천시 강변로",
    construction: "작업장",
    content:
        "외국인 노동자 28살 A씨가 승강기로 가죽 제품 출하 작업을 하던 중 6.2m 아래로 추락하여 사망",
    sentence: "원청업체 대표 징역 10월에 집행유예 2년 및 사회봉사 160시간",
    source_where: "3페이지 양평이유",
    source_link:
        "https://drive.google.com/file/d/17BQ3kftTrnHbmcwWAgDnFYCUPt64g4s8/view?usp=sharing",
    photo_link:
        "https://drive.google.com/file/d/1ogAiMU9KXIUf_JVhwPXdApLTtgL-fSo5/view?usp=sharing",
    video_name: "",
  },
  {
    category: "시간은 곧 돈",
    source: "재해조사의견서",
    index: "180721_태하이앤씨",
    img: "img_28.png",
    wording: "&quot;공기가 부족&quot;",
    date: "2018년 7월 21일 오전 9시 30분경",
    where: "경기도 김포시 사우동",
    construction: "고등학교 화장실 개선 공사",
    content:
        "외국인 일용직 노동자 41살 A씨가 4층 화장실 외부 벽돌 철거작업 중 8m 아래로 추락해 사망",
    sentence:
        "원청업체 벌금 700만 원, 원청업체 현장소장 징역 1년에 집행유예 2년",
    source_where: "18페이지 가. 재해발생 원인- 2",
    source_link:
        "https://drive.google.com/file/d/1OMFqLiPtebIAkhN_zzHIked5HoiRwiZW/view?usp=sharing",
    photo_link:
        "https://drive.google.com/file/d/1EN69UL32qyQ1DuwIsAFuIYnTjQUxCDId/view?usp=sharing",
    video_name: "",
  },
  {
    category: "구조적 문제",
    source: "판결문",
    index: "181105_㈜동방종합건설",
    img: "img_30.png",
    wording:
        "&quot;사문서 위조-피해자 사망 이후에 벌금 등 불이익을 피하기 위하여&quot;",
    date: "2018년 11월 5일 오후 3시 28분경",
    where: "경상남도 창원시 마산합포구 산호동",
    construction: "건물 신축공사현장",
    content:
        "하청업체 소속 일용직 노동자 59세 이 모 씨가 철골보 위에서 이동하던 중 12.85m 아래로 추락하여 사망",
    sentence:
        "원청업체 벌금 500만 원, 원청업체 현장소장 징역 8월, 하청업체 벌금 300만 원, 하청업체 공동경영자1 징역 4월에 집행유예 1년,과 벌금 50만 원 및 사회봉사 80시간, 하청업체 공동경영자2 징역 6월에 집행유예 2년과 벌금 50만 원 및 사회봉사 120시간, 하청업체 부사장 징역 8월에 집행유예 2년과 사회봉사 160시간",
    source_where: "11, 12페이지",
    source_link:
        "https://drive.google.com/file/d/1tHIGAx17JlRUR6qRftS1EffCCG6PfXIE/view?usp=sharing",
    photo_link:
        "https://drive.google.com/file/d/1umDeNvUZZU_r2WSn6I6S5XCKofKWmpdG/view?usp=sharing",
    video_name:
        "영상 O (무면허, 왜 사고가 일어난거냐, 내부 스케치, H빔 철골 영상)",
  },
  {
    category: "생명보다 이윤",
    source: "판결문",
    index: "181105_㈜동방종합건설",
    img: "img_30.png",
    wording:
        "&quot;안전을 무시한 채 최대이익 창출만&quot;, &quot;법령의 준수에는 크게 신경을 쓰지 않은 것&quot;",
    date: "2018년 11월 5일 오후 3시 28분경",
    where: "경상남도 창원시 마산합포구 산호동",
    construction: "건물 신축공사현장",
    content:
        "하청업체 소속 일용직 노동자 59세 이 모 씨가 철골보 위에서 이동하던 중 12.85m 아래로 추락하여 사망",
    sentence:
        "원청업체 벌금 500만 원, 원청업체 현장소장 징역 8월, 하청업체 벌금 300만 원, 하청업체 공동경영자1 징역 4월에 집행유예 1년,과 벌금 50만 원 및 사회봉사 80시간, 하청업체 공동경영자2 징역 6월에 집행유예 2년과 벌금 50만 원 및 사회봉사 120시간, 하청업체 부사장 징역 8월에 집행유예 2년과 사회봉사 160시간",
    source_where: "11, 12페이지",
    source_link:
        "https://drive.google.com/file/d/1tHIGAx17JlRUR6qRftS1EffCCG6PfXIE/view?usp=sharing",
    photo_link:
        "https://drive.google.com/file/d/1umDeNvUZZU_r2WSn6I6S5XCKofKWmpdG/view?usp=sharing",
    video_name:
        "영상 O (무면허, 왜 사고가 일어난거냐, 내부 스케치, H빔 철골 영상)",
  },
  {
    category: "솜방망이 처벌",
    source: "판결문",
    index: "181105_㈜동방종합건설",
    img: "img_30.png",
    wording:
        "&quot;형사적 비용보다 재발사고를 예방하기 위하여 안전조치 의무를 이행하는 것이 합리적이라고 판단할 수 있을 정도의 적정한 양형을 할 필요&quot;",
    date: "2018년 11월 5일 오후 3시 28분경",
    where: "경상남도 창원시 마산합포구 산호동",
    construction: "건물 신축공사현장",
    content:
        "하청업체 소속 일용직 노동자 59세 이 모 씨가 철골보 위에서 이동하던 중 12.85m 아래로 추락하여 사망",
    sentence:
        "원청업체 벌금 500만 원, 원청업체 현장소장 징역 8월, 하청업체 벌금 300만 원, 하청업체 공동경영자1 징역 4월에 집행유예 1년,과 벌금 50만 원 및 사회봉사 80시간, 하청업체 공동경영자2 징역 6월에 집행유예 2년과 벌금 50만 원 및 사회봉사 120시간, 하청업체 부사장 징역 8월에 집행유예 2년과 사회봉사 160시간",
    source_where: "11, 12페이지",
    source_link:
        "https://drive.google.com/file/d/1tHIGAx17JlRUR6qRftS1EffCCG6PfXIE/view?usp=sharing",
    photo_link:
        "https://drive.google.com/file/d/1umDeNvUZZU_r2WSn6I6S5XCKofKWmpdG/view?usp=sharing",
    video_name:
        "영상 O (무면허, 왜 사고가 일어난거냐, 내부 스케치, H빔 철골 영상)",
  },
  {
    category: "시간은 곧 돈",
    source: "재해조사의견서",
    index: "181230_동아건설",
    img: "img_32.png",
    wording: "&quot;급박한 공사진행&quot;",
    date: "2018년 12월 30일 오전 10시 40분경",
    where: "광주광역시 광산구 도산동",
    construction: "아파트 신축 공사 현장",
    content:
        "하청업체 소속 일용직 노동자 54살 이 모 씨가 어두운 정화조 기계실에서 작업 중 3m 아래로 추락해 사망",
    sentence:
        "원청업체 벌금 500만 원, 원청업체 현장소장 징역 6월에 집행유예 2년",
    source_where: "10페이지 나. 관리적 원인",
    source_link:
        "https://drive.google.com/file/d/1yQa4_lLJMZBAScBV1A5cBjqN0CYgQtAb/view?usp=sharing",
    photo_link:
        "https://drive.google.com/file/d/10TsAGL1MkjVBp58EQzoOKeFikI3eBxqg/view?usp=sharing",
    video_name: "",
  },
  {
    category: "시간은 곧 돈",
    source: "재해조사의견서",
    index: "190422_중흥토건",
    img: "img_33.png",
    wording: "&quot;공기 맞추는 것에만 집중&quot;",
    date: "2019년 4월 22일 오전 10시경",
    where: "경기도 화성시",
    construction: "연립주택 신축 현장",
    content:
        "하청업체 소속 일용직 노동자 57살 이 모 씨가 계단에서 실족해 13m 아래로 추락하여 사망",
    sentence:
        "원청업체 벌금 500만 원, 원청업체 현장소장 징역 6월에 집행유예 1년, 하청업체 벌금 500만 원, 하청업체 현장소장 징역 6월에 집행유예 1년",
    source_where: "16페이지 라. 문화적 요인",
    source_link:
        "https://drive.google.com/file/d/161HyHQX8fX0OSrtUPJ2ojF-nC6aIBRnO/view?usp=sharing",
    photo_link:
        "https://drive.google.com/file/d/1wEUsfOeNZYkrOFHqPR0uG9Z6HGWoENiP/view?usp=sharing",
    video_name: "",
  },
  {
    category: "시간은 곧 돈",
    source: "재해조사의견서",
    index: "190525_열린공간",
    img: "img_34.png",
    wording: "&quot;빠른 공기를 맞추기 위해&quot;",
    date: "2019년 5월 25일 오전 9시 10분경",
    where: "전라남도 순천시 조례동",
    construction: "견본주택(모델하우스) 신축 현장",
    content:
        "하청업체 소속 일용직 노동자 48살 최 모 씨가 쓰러지는 철골 기둥에 부딪혀 5.8m 아래로 추락하여 사망",
    sentence:
        "원청업체 벌금 500만 원, 원청업체 현장소장 징역 4월에 집행유예 1년,  재재하청업체 벌금 250만 원, 재재재하청업체 대표 250만 원",
    source_where: "11페이지 재해발생원인",
    source_link:
        "https://drive.google.com/file/d/1A3fViQpxE5d7HLTgbS-3mKdavZCpvuF7/view?usp=sharing",
    photo_link:
        "https://drive.google.com/file/d/1wxXuNunw-pVSA5PV8aeqSfIx7WNSlVgN/view?usp=sharing",
    video_name:
        "영상 O  탐사 추락사 R#12_열린공간 관계자 몰카, R#15~17 현장소장 인터뷰",
  },
  {
    category: "구조적 문제",
    source: "판결문",
    index: "190525_열린공간",
    img: "img_34.png",
    wording: "&quot;다시 하도급&quot;",
    date: "2019년 5월 25일 오전 9시 10분경",
    where: "전라남도 순천시 조례동",
    construction: "견본주택(모델하우스) 신축 현장",
    content:
        "하청업체 소속 일용직 노동자 48살 최 모 씨가 쓰러지는 철골 기둥에 부딪혀 5.8m 아래로 추락하여 사망",
    sentence:
        "원청업체 벌금 500만 원, 원청업체 현장소장 징역 4월에 집행유예 1년,  재재하청업체 벌금 250만 원, 재재재하청업체 대표 250만 원",
    source_where: "2페이지 범죄사실",
    source_link:
        "https://drive.google.com/file/d/1aBUZJNCNlnM3XFL45vxsntDkkMPq6IBy/view?usp=sharing",
    photo_link:
        "https://drive.google.com/file/d/1wxXuNunw-pVSA5PV8aeqSfIx7WNSlVgN/view?usp=sharing",
    video_name: "",
  },
  {
    category: "시간은 곧 돈",
    source: "재해조사의견서",
    index: "190604_에이치디씨아이서비스㈜",
    img: "img_35.png",
    wording: "&quot;안전시설물을 생략하고 서둘러 공사를 종료하려&quot;",
    date: "2019년 6월 4일 오전 9시 30분경",
    where: "경기도 김포시 장기동",
    construction: "모델하우스 건립공사 현장",
    content:
        "하청업체 소속 일용직 노동자 65살 신 모 씨가 바닥 데크플레이트 설치 작업 중 7.3m 아래로 추락하여 사망",
    sentence: "약식기소",
    source_where: "10페이지 라. 문화적 요인",
    source_link:
        "https://drive.google.com/file/d/1VylHD0UXTQt1dRvdTZF101VkgyBfAFLY/view?usp=sharing",
    photo_link:
        "https://drive.google.com/file/d/1UzqfOfCNI8W71k-XnwwhZnfrHlpxNLV7/view?usp=sharing",
    video_name: "",
  },
];﻿var sinArray = [];
var sinListArray = [
  "발주처",
  " A 건설",
  "B 업체",
  "발주처의 대표",
  "A 건설의 대표",
  "A 건설의 현장소장",
  "B 건설의 대표",
  "B 건설의 현장소장",
];

var sinValueArray = [
  "처벌받지 않음",
  "벌금 7백만원",
  "벌금 5백만원",
  "처벌받지 않음",
  "처벌받지 않음",
  "벌금 1천만원",
  "처벌받지 않음",
  "벌금 8백만원",
];

$(document).ready(function () {
  $(".td-day4").on("click", function () {
    $("html, body").animate(
        {
          scrollTop: $("#day4").offset().top,
        },
        500
    );
  });

  $("#day4_1").width($(window).width() > 800 ? 800 : $(window).width() - 40);
  $("#day4_1").height(
      $(window).width() > 800 ? (800 * 9) / 16 : ($(window).width() * 9) / 16
  );

  $(".submit-btn.step-1").on("click", function () {
    // console.log("ddd");
    $(".step-1").css("display", "none");
    $(".step-2").css("display", "block");
  });

  $(".submit-btn.step-2").on("click", function () {
    // console.log("ddd");
    $(".step-2").css("display", "none");
    $(".step-3").css("display", "block");
    $.each($(".sin-check"), function (i, d) {
      sinArray[i] = $(d).is(":checked");
    });
    // console.log(sinArray);
    $(".sin-list-container").html(makeSinRange(sinArray));
    $(".input-range").on("input", function () {
      // console.log($(this).attr("case-id"));
      $("." + $(this).attr("case-id")).html(numberWithCommas($(this).val()));
    });
  });
  $(".submit-btn.step-3").on("click", function () {
    $(".step-3").css("display", "none");
    $(".step-4").css("display", "block");
  });
  $(".submit-btn.step-4").on("click", function () {
    $(".step-2").css("display", "block");
    $(".step-4").css("display", "none");
  });

  // $(".graph-con-2").on("click", function () {
  //   $(".graph3").css("display", "none");
  //   $(".graph4").css("display", "block");
  // });
  // $(".graph-con-1").on("click", function () {
  //   $(".graph1").css("display", "none");
  //   $(".graph2").css("display", "block");
  // });

  // $(".graph-con-2").on("mouseout", function () {
  //   $(".graph4").css("display", "none");
  //   $(".graph3").css("display", "block");
  // });
  // $(".graph-con-1").on("mouseout", function () {
  //   $(".graph2").css("display", "none");
  //   $(".graph1").css("display", "block");
  // });
});

function makeSinRange(array) {
  sinListHtml = "";
  $.each(array, function (i, d) {
    // console.log(d);
    if (d) {
      $(".id-" + i).css("display", "block");
      $(".id-" + i + " .case-row").css("display", "flex");
      sinListHtml += "<div style='font-size:18px;margin-top:30px;'>";
      sinListHtml += "<span class='serif'>" + sinListArray[i] + "</span>";
      sinListHtml += "<hr class='narrow'>";
      sinListHtml += "<div style='display:flex'>";
      sinListHtml += "<span class='range-label'>벌금</span>";
      sinListHtml +=
          "<input class='input-range' type='range' value='0' min='0' max='10000' case-id='case-" +
          i +
          "' >";
      sinListHtml +=
          "<div class='input-val'><span class='case-" +
          i +
          "'>0</span> 만원</div>";
      sinListHtml += "</div>";

      if (i > 2) {
        sinListHtml += "<div style='display:flex'>";
        sinListHtml += "<span class='range-label'>형량</span>";
        sinListHtml +=
            "<input class='input-range' type='range'  value='0' min='0' max='7' case-id='j-case-" +
            i +
            "' >";
        sinListHtml +=
            "<div class='input-val'><span class='j-case-" +
            i +
            "'>0</span> 년 </div>";
        sinListHtml += "</div>";
      }

      sinListHtml += "</div>";
    } else {
      $(".id-" + i).css("display", "none");
    }
  });

  return sinListHtml;
}

function numberWithCommas(x) {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}
﻿var sinArray = [];
var sinListArray = [
  "발주처",
  " A 건설",
  "B 업체",
  "발주처의 대표",
  "A 건설의 대표",
  "A 건설의 현장소장",
  "B 건설의 대표",
  "B 건설의 현장소장",
];

var sinValueArray = [
  "처벌받지 않음",
  "벌금 7백만원",
  "벌금 5백만원",
  "처벌받지 않음",
  "처벌받지 않음",
  "벌금 1천만원",
  "처벌받지 않음",
  "벌금 8백만원",
];

$(document).ready(function () {
  var call_nar1 = document.getElementById("call_nar1");
  $(".td-day5").on("click", function () {
    $("html, body").animate(
      {
        scrollTop: $("#day5").offset().top,
      },
      500
    );
  });

  $("#day5_1").width($(window).width() > 800 ? 800 : $(window).width() - 40);
  $("#day5_1").height(
    $(window).width() > 800 ? (800 * 9) / 16 : ($(window).width() * 9) / 16
  );
  $("#day5_2").width($(window).width() > 800 ? 800 : $(window).width() - 40);
  $("#day5_2").height(
    $(window).width() > 800 ? (800 * 9) / 16 : ($(window).width() * 9) / 16
  );

  var callcontentshow = false;
  $('.call-content-day5').css('visibility', 'hidden');

  $(".day5-call").on("click", function () {
    if(callcontentshow){
        $('.call-content-day5').css('visibility', 'hidden');
        callcontentshow = false;
        document.getElementById("day5_nar1").pause();
    }else{
        $('.call-content-day5').css('visibility', 'visible');
        callcontentshow = true;
        document.getElementById("day5_nar1").play();
    }
  });
});
﻿// set the dimensions and margins of the graph
var margin = { top: 30, right: 10, bottom: 10, left: 10 };
var width = $(window).width() - margin.left - margin.right - 20;
if (width > 1200) {
  width = 1200 - margin.left - margin.right;
} else {
  margin.left = 0;
  margin.right = 0;
}
var height = $(window).height() * 0.7 - margin.top - margin.bottom;

// append the svg object to the body of the page
var svg = d3
  .select("#chart")
  .append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
  .append("g")
  .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

// Color scale used
var color = d3.scaleOrdinal(d3.schemeCategory20);

// Set the sankey diagram properties
var sankey = d3.sankey().nodeWidth(10).nodePadding(5).size([width, height]);
var textData2 = [
  { text: "업종" },
  { text: "원청/하청" },
  { text: "고용형태" },
  { text: "안전벨트" },
  { text: "추락위치" },
];
var textSet = ["업종", "원청하청", "고용형태", "안전벨트", "추락위치"];
// load the data
d3.json("https://imnews.imbc.com/newszoomin/groupnews/groupnews_13/data/sankey.json", function (error, graph) {
  // Constructs a new Sankey generator with the default settings.
  sankey.nodes(graph.nodes).links(graph.links).layout(1);

  var cate_text = svg
    .append("g")
    .selectAll(".text")
    .data(textData2)
    .enter()
    .append("text")
    .attr("class", "text")
    .attr("x", function (d, i) {
      if (i == 4) {
        return width - 65;
      } else if (i == 3) {
        return (width / 4) * i - 40;
      } else if (i == 2) {
        return (width / 4) * i - 40;
      } else if (i == 1) {
        return (width / 4) * i - 40;
      } else {
        return (width / 4) * i;
      }
    })
    .attr("y", -10)
    .text(function (d) {
      return d.text;
    });

  // add in the links
  var link = svg
    .append("g")
    .selectAll(".link")
    .data(graph.links)
    .enter()
    .append("path")
    .attr("class", "link")
    .attr("d", sankey.link())
    .style("stroke-width", function (d) {
      return Math.max(1, d.dy);
    })
    .sort(function (a, b) {
      return b.dy - a.dy;
    });

  // add in the nodes
  var node = svg
    .append("g")
    .selectAll("#chart .node")
    .data(graph.nodes)
    .enter()
    .append("g")
    .attr("class", "node")
    .attr("transform", function (d) {
      return "translate(" + d.x + "," + d.y + ")";
    });

  d3.selectAll("#chart .node").on("click", function (d) {
    d3.selectAll("#chart .node").style("opacity", 0.5);
    d3.select(this).style("opacity", 1);
    d3.selectAll("#chart .link").style("opacity", function (link) {
      switch (d.cate) {
        case "업종":
          if (link.업종 == d.name) {
            return 1;
          } else {
            return 0.1;
          }
        case "추락위치":
          if (link.추락위치 == d.name) {
            return 1;
          } else {
            return 0.1;
          }
        case "고용형태":
          if (link.고용형태 == d.name) {
            return 1;
          } else {
            return 0.1;
          }
        case "원청하청":
          if (link.원청하청 == d.name) {
            return 1;
          } else {
            return 0.1;
          }
        case "안전벨트":
          if (link.안전벨트 == d.name) {
            return 1;
          } else {
            return 0.1;
          }
        default:
          return 1;
      }
    });
  });
  // add the rectangles for the nodes
  node
    .append("rect")
    .attr("height", function (d) {
      return d.dy;
    })
    .attr("width", sankey.nodeWidth())
    .style("fill", function (d) {
      return (d.color = color(d.name.replace(/ .*/, "")));
    })
    .style("stroke", function (d) {
      return d3.rgb(d.color).darker(2);
    })
    // Add hover text
    .append("title")
    .text(function (d) {
      return d.name + "\n" + "There is " + d.value + " stuff in this node";
    });

  // add in the title for the nodes
  node
    .append("text")
    .attr("x", -6)
    .attr("y", function (d) {
      return d.dy / 2;
    })
    .attr("dy", ".35em")
    .attr("text-anchor", "end")
    .attr("transform", null)
    .text(function (d) {
      return d.name;
    })
    .filter(function (d) {
      return d.x < width / 2;
    })
    .attr("x", 6 + sankey.nodeWidth())
    .attr("text-anchor", "start");

  // the function for moving the nodes
});
﻿// set the dimensions and margins of the graph
var margin = { top: 30, right: 10, bottom: 10, left: 10 };
var width = $(window).width() - margin.left - margin.right - 20;
if (width > 1200) {
  width = 1200 - margin.left - margin.right;
} else {
  margin.left = 0;
  margin.right = 0;
}
var height = $(window).height() * 0.7 - margin.top - margin.bottom;

// append the svg object to the body of the page
var svg_day4 = d3
  .select("#chart_day4")
  .append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
  .append("g")
  .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

// Color scale used
var color = d3.scaleOrdinal(d3.schemeCategory20);

// Set the sankey diagram properties
var sankey = d3.sankey().nodeWidth(10).nodePadding(5).size([width, height]);
var textData = [
  { text: "발생" },
  { text: "고용노동부" },
  { text: "검찰" },
  { text: "법원" },
  { text: "처벌대상" },
  { text: "처벌" },
];
var textSet = ["업종", "원청하청", "고용형태", "안전벨트", "추락위치"];
// load the data
d3.json("https://imnews.imbc.com/newszoomin/groupnews/groupnews_13/data/sankey_day4.json", function (error, graph) {
  // console.log(graph);
  // Constructs a new Sankey generator with the default settings.
  sankey.nodes(graph.nodes).links(graph.links).layout(1);

  var cate_text = svg_day4
    .append("g")
    .selectAll("#chart_day4 .text")
    .data(textData)
    .enter()
    .append("text")
    .attr("class", "text")
    .attr("x", function (d, i) {
      if (i == 5) {
        return width - 30;
      } else if (i == 4) {
        return (width / 5) * i - 30;
      } else if (i == 2) {
        return (width / 5) * i - 15;
      } else if (i == 3) {
        return (width / 5) * i - 15;
      } else if (i == 1) {
        return (width / 5) * i - 35;
      } else {
        return (width / 5) * i;
      }
    })
    .attr("y", -10)
    .text(function (d) {
      return d.text;
    });

  // add in the links
  var link = svg_day4
    .append("g")
    .selectAll("#chart_day4 .link")
    .data(graph.links)
    .enter()
    .append("path")
    .attr("class", "link")
    .attr("d", sankey.link())
    .style("stroke-width", function (d) {
      return Math.max(1, d.dy);
    })
    .sort(function (a, b) {
      return b.dy - a.dy;
    });

  // add in the nodes
  var node = svg_day4
    .append("g")
    .selectAll("#chart_day4 .node")
    .data(graph.nodes)
    .enter()
    .append("g")
    .attr("class", "node")
    .attr("transform", function (d) {
      return "translate(" + d.x + "," + d.y + ")";
    });

  d3.selectAll("#chart_day4 .node").style("opacity", function (d) {
    // console.log(d.cate);
    if (d.cate == "NONE") {
      return 0;
    } else {
      return 1;
    }
  });

  d3.selectAll("#chart_day4 .link").style("opacity", function (d) {
    if (
      d.target.id == 8 ||
      d.target.id == 14 ||
      d.target.id == 19 ||
      d.target.id == 22
    ) {
      return 0;
    } else {
      return 1;
    }
  });

  // add the rectangles for the nodes
  node
    .append("rect")
    .attr("height", function (d) {
      return d.dy;
    })
    .attr("width", sankey.nodeWidth())
    .style("fill", function (d) {
      return (d.color = color(d.name.replace(/ .*/, "")));
    })
    .style("stroke", function (d) {
      return d3.rgb(d.color).darker(2);
    })
    // Add hover text
    .append("title")
    .text(function (d) {
      return d.name + "\n" + "There is " + d.value + " stuff in this node";
    });

  // add in the title for the nodes
  node
    .append("text")
    .attr("x", -6)
    .attr("y", function (d) {
      return d.dy / 2;
    })
    .attr("dy", ".35em")
    .attr("text-anchor", "end")
    .attr("transform", null)
    .text(function (d) {
      return d.name;
    })
    .filter(function (d) {
      return d.x < width / 2;
    })
    .attr("x", 6 + sankey.nodeWidth())
    .attr("text-anchor", "start");

  // the function for moving the nodes
});
﻿am4core.ready(function () {
  // Themes begin
  am4core.useTheme(am4themes_dark);
  am4core.useTheme(am4themes_animated);
  // Themes end

  var chart = am4core.create("chartdiv", am4charts.XYChart);
  chart.hiddenState.properties.opacity = 0; // this creates initial fade-in

  chart.data = [
    {
      money: "10 만원",
      number: 0,
    },
    {
      money: "20 만원",
      number: 0,
    },
    {
      money: "30 만원",
      number: 1,
    },
    {
      money: "40 만원",
      number: 0,
    },
    {
      money: "50 만원",
      number: 6,
    },
    {
      money: "60 만원",
      number: 0,
    },
    {
      money: "70 만원",
      number: 10,
    },
    {
      money: "80 만원",
      number: 0,
    },
    {
      money: "90 만원",
      number: 0,
    },
    {
      money: "100 만원",
      number: 33,
    },
    {
      money: "110 만원",
      number: 0,
    },
    {
      money: "120 만원",
      number: 0,
    },
    {
      money: "130 만원",
      number: 0,
    },
    {
      money: "140 만원",
      number: 0,
    },
    {
      money: "150 만원",
      number: 19,
    },
    {
      money: "160 만원",
      number: 0,
    },
    {
      money: "170 만원",
      number: 0,
    },
    {
      money: "180 만원",
      number: 0,
    },
    {
      money: "190 만원",
      number: 0,
    },
    {
      money: "200 만원",
      number: 53,
    },
    {
      money: "210 만원",
      number: 0,
    },
    {
      money: "220 만원",
      number: 0,
    },
    {
      money: "230 만원",
      number: 0,
    },
    {
      money: "240 만원",
      number: 0,
    },
    {
      money: "250 만원",
      number: 7,
    },
    {
      money: "260 만원",
      number: 0,
    },
    {
      money: "270 만원",
      number: 0,
    },
    {
      money: "280 만원",
      number: 0,
    },
    {
      money: "290 만원",
      number: 0,
    },
    {
      money: "300 만원",
      number: 242,
    },
    {
      money: "310 만원",
      number: 0,
    },
    {
      money: "320 만원",
      number: 0,
    },
    {
      money: "330 만원",
      number: 0,
    },
    {
      money: "340 만원",
      number: 0,
    },
    {
      money: "350 만원",
      number: 0,
    },
    {
      money: "360 만원",
      number: 0,
    },
    {
      money: "370 만원",
      number: 0,
    },
    {
      money: "380 만원",
      number: 0,
    },
    {
      money: "390 만원",
      number: 0,
    },
    {
      money: "400 만원",
      number: 76,
    },
    {
      money: "410 만원",
      number: 0,
    },
    {
      money: "420 만원",
      number: 0,
    },
    {
      money: "430 만원",
      number: 0,
    },
    {
      money: "440 만원",
      number: 0,
    },
    {
      money: "450 만원",
      number: 0,
    },
    {
      money: "460 만원",
      number: 0,
    },
    {
      money: "470 만원",
      number: 0,
    },
    {
      money: "480 만원",
      number: 0,
    },
    {
      money: "490 만원",
      number: 0,
    },
    {
      money: "500 만원",
      number: 489,
    },
    {
      money: "510 만원",
      number: 0,
    },
    {
      money: "520 만원",
      number: 0,
    },
    {
      money: "530 만원",
      number: 0,
    },
    {
      money: "540 만원",
      number: 0,
    },
    {
      money: "550 만원",
      number: 0,
    },
    {
      money: "560 만원",
      number: 0,
    },
    {
      money: "570 만원",
      number: 0,
    },
    {
      money: "580 만원",
      number: 0,
    },
    {
      money: "590 만원",
      number: 0,
    },
    {
      money: "600 만원",
      number: 29,
    },
    {
      money: "610 만원",
      number: 0,
    },
    {
      money: "620 만원",
      number: 0,
    },
    {
      money: "630 만원",
      number: 0,
    },
    {
      money: "640 만원",
      number: 0,
    },
    {
      money: "650 만원",
      number: 0,
    },
    {
      money: "660 만원",
      number: 0,
    },
    {
      money: "670 만원",
      number: 0,
    },
    {
      money: "680 만원",
      number: 0,
    },
    {
      money: "690 만원",
      number: 0,
    },
    {
      money: "700 만원",
      number: 124,
    },
    {
      money: "710 만원",
      number: 0,
    },
    {
      money: "720 만원",
      number: 0,
    },
    {
      money: "730 만원",
      number: 0,
    },
    {
      money: "740 만원",
      number: 0,
    },
    {
      money: "750 만원",
      number: 0,
    },
    {
      money: "760 만원",
      number: 0,
    },
    {
      money: "770 만원",
      number: 0,
    },
    {
      money: "780 만원",
      number: 0,
    },
    {
      money: "790 만원",
      number: 0,
    },
    {
      money: "800 만원",
      number: 18,
    },
    {
      money: "810 만원",
      number: 0,
    },
    {
      money: "820 만원",
      number: 0,
    },
    {
      money: "830 만원",
      number: 0,
    },
    {
      money: "840 만원",
      number: 0,
    },
    {
      money: "850 만원",
      number: 0,
    },
    {
      money: "860 만원",
      number: 0,
    },
    {
      money: "870 만원",
      number: 0,
    },
    {
      money: "880 만원",
      number: 0,
    },
    {
      money: "890 만원",
      number: 0,
    },
    {
      money: "900 만원",
      number: 2,
    },
    {
      money: "910 만원",
      number: 0,
    },
    {
      money: "920 만원",
      number: 0,
    },
    {
      money: "930 만원",
      number: 0,
    },
    {
      money: "940 만원",
      number: 0,
    },
    {
      money: "950 만원",
      number: 0,
    },
    {
      money: "960 만원",
      number: 0,
    },
    {
      money: "970 만원",
      number: 0,
    },
    {
      money: "980 만원",
      number: 0,
    },
    {
      money: "990 만원",
      number: 0,
    },
    {
      money: "1000 만원",
      number: 44,
    },
    {
      money: "1010 만원",
      number: 0,
    },
    {
      money: "1020 만원",
      number: 0,
    },
    {
      money: "1030 만원",
      number: 0,
    },
    {
      money: "1040 만원",
      number: 0,
    },
    {
      money: "1050 만원",
      number: 0,
    },
    {
      money: "1060 만원",
      number: 0,
    },
    {
      money: "1070 만원",
      number: 0,
    },
    {
      money: "1080 만원",
      number: 0,
    },
    {
      money: "1090 만원",
      number: 0,
    },
    {
      money: "1100 만원",
      number: 0,
    },
    {
      money: "1110 만원",
      number: 0,
    },
    {
      money: "1120 만원",
      number: 0,
    },
    {
      money: "1130 만원",
      number: 0,
    },
    {
      money: "1140 만원",
      number: 0,
    },
    {
      money: "1150 만원",
      number: 0,
    },
    {
      money: "1160 만원",
      number: 0,
    },
    {
      money: "1170 만원",
      number: 0,
    },
    {
      money: "1180 만원",
      number: 0,
    },
    {
      money: "1190 만원",
      number: 0,
    },
    {
      money: "1200 만원",
      number: 2,
    },
    {
      money: "1210 만원",
      number: 0,
    },
    {
      money: "1220 만원",
      number: 0,
    },
    {
      money: "1230 만원",
      number: 0,
    },
    {
      money: "1240 만원",
      number: 0,
    },
    {
      money: "1250 만원",
      number: 0,
    },
    {
      money: "1260 만원",
      number: 0,
    },
    {
      money: "1270 만원",
      number: 0,
    },
    {
      money: "1280 만원",
      number: 0,
    },
    {
      money: "1290 만원",
      number: 0,
    },
    {
      money: "1300 만원",
      number: 0,
    },
    {
      money: "1310 만원",
      number: 0,
    },
    {
      money: "1320 만원",
      number: 0,
    },
    {
      money: "1330 만원",
      number: 0,
    },
    {
      money: "1340 만원",
      number: 0,
    },
    {
      money: "1350 만원",
      number: 0,
    },
    {
      money: "1360 만원",
      number: 0,
    },
    {
      money: "1370 만원",
      number: 0,
    },
    {
      money: "1380 만원",
      number: 0,
    },
    {
      money: "1390 만원",
      number: 0,
    },
    {
      money: "1400 만원",
      number: 0,
    },
    {
      money: "1410 만원",
      number: 0,
    },
    {
      money: "1420 만원",
      number: 0,
    },
    {
      money: "1430 만원",
      number: 0,
    },
    {
      money: "1440 만원",
      number: 0,
    },
    {
      money: "1450 만원",
      number: 0,
    },
    {
      money: "1460 만원",
      number: 0,
    },
    {
      money: "1470 만원",
      number: 0,
    },
    {
      money: "1480 만원",
      number: 0,
    },
    {
      money: "1490 만원",
      number: 0,
    },
    {
      money: "1500 만원",
      number: 5,
    },
    {
      money: "1510 만원",
      number: 0,
    },
    {
      money: "1520 만원",
      number: 0,
    },
    {
      money: "1530 만원",
      number: 0,
    },
    {
      money: "1540 만원",
      number: 0,
    },
    {
      money: "1550 만원",
      number: 0,
    },
    {
      money: "1560 만원",
      number: 0,
    },
    {
      money: "1570 만원",
      number: 0,
    },
    {
      money: "1580 만원",
      number: 0,
    },
    {
      money: "1590 만원",
      number: 0,
    },
    {
      money: "1600 만원",
      number: 0,
    },
    {
      money: "1610 만원",
      number: 0,
    },
    {
      money: "1620 만원",
      number: 0,
    },
    {
      money: "1630 만원",
      number: 0,
    },
    {
      money: "1640 만원",
      number: 0,
    },
    {
      money: "1650 만원",
      number: 0,
    },
    {
      money: "1660 만원",
      number: 0,
    },
    {
      money: "1670 만원",
      number: 0,
    },
    {
      money: "1680 만원",
      number: 0,
    },
    {
      money: "1690 만원",
      number: 0,
    },
    {
      money: "1700 만원",
      number: 0,
    },
    {
      money: "1710 만원",
      number: 0,
    },
    {
      money: "1720 만원",
      number: 0,
    },
    {
      money: "1730 만원",
      number: 0,
    },
    {
      money: "1740 만원",
      number: 0,
    },
    {
      money: "1750 만원",
      number: 0,
    },
    {
      money: "1760 만원",
      number: 0,
    },
    {
      money: "1770 만원",
      number: 0,
    },
    {
      money: "1780 만원",
      number: 0,
    },
    {
      money: "1790 만원",
      number: 0,
    },
    {
      money: "1800 만원",
      number: 0,
    },
    {
      money: "1810 만원",
      number: 0,
    },
    {
      money: "1820 만원",
      number: 0,
    },
    {
      money: "1830 만원",
      number: 0,
    },
    {
      money: "1840 만원",
      number: 0,
    },
    {
      money: "1850 만원",
      number: 0,
    },
    {
      money: "1860 만원",
      number: 0,
    },
    {
      money: "1870 만원",
      number: 0,
    },
    {
      money: "1880 만원",
      number: 0,
    },
    {
      money: "1890 만원",
      number: 0,
    },
    {
      money: "1900 만원",
      number: 0,
    },
    {
      money: "1910 만원",
      number: 0,
    },
    {
      money: "1920 만원",
      number: 0,
    },
    {
      money: "1930 만원",
      number: 0,
    },
    {
      money: "1940 만원",
      number: 0,
    },
    {
      money: "1950 만원",
      number: 0,
    },
    {
      money: "1960 만원",
      number: 0,
    },
    {
      money: "1970 만원",
      number: 0,
    },
    {
      money: "1980 만원",
      number: 0,
    },
    {
      money: "1990 만원",
      number: 0,
    },
    {
      money: "2000 만원",
      number: 2,
    },
    {
      money: "2010 만원",
      number: 0,
    },
    {
      money: "2020 만원",
      number: 0,
    },
    {
      money: "2030 만원",
      number: 0,
    },
    {
      money: "2040 만원",
      number: 0,
    },
    {
      money: "2050 만원",
      number: 0,
    },
    {
      money: "2060 만원",
      number: 0,
    },
    {
      money: "2070 만원",
      number: 0,
    },
    {
      money: "2080 만원",
      number: 0,
    },
    {
      money: "2090 만원",
      number: 0,
    },
    {
      money: "2100 만원",
      number: 0,
    },
    {
      money: "2110 만원",
      number: 0,
    },
    {
      money: "2120 만원",
      number: 0,
    },
    {
      money: "2130 만원",
      number: 0,
    },
    {
      money: "2140 만원",
      number: 0,
    },
    {
      money: "2150 만원",
      number: 0,
    },
    {
      money: "2160 만원",
      number: 0,
    },
    {
      money: "2170 만원",
      number: 0,
    },
    {
      money: "2180 만원",
      number: 0,
    },
    {
      money: "2190 만원",
      number: 0,
    },
    {
      money: "2200 만원",
      number: 0,
    },
    {
      money: "2210 만원",
      number: 0,
    },
    {
      money: "2220 만원",
      number: 0,
    },
    {
      money: "2230 만원",
      number: 0,
    },
    {
      money: "2240 만원",
      number: 0,
    },
    {
      money: "2250 만원",
      number: 0,
    },
    {
      money: "2260 만원",
      number: 0,
    },
    {
      money: "2270 만원",
      number: 0,
    },
    {
      money: "2280 만원",
      number: 0,
    },
    {
      money: "2290 만원",
      number: 0,
    },
    {
      money: "2300 만원",
      number: 0,
    },
    {
      money: "2310 만원",
      number: 0,
    },
    {
      money: "2320 만원",
      number: 0,
    },
    {
      money: "2330 만원",
      number: 0,
    },
    {
      money: "2340 만원",
      number: 0,
    },
    {
      money: "2350 만원",
      number: 0,
    },
    {
      money: "2360 만원",
      number: 0,
    },
    {
      money: "2370 만원",
      number: 0,
    },
    {
      money: "2380 만원",
      number: 0,
    },
    {
      money: "2390 만원",
      number: 0,
    },
    {
      money: "2400 만원",
      number: 0,
    },
    {
      money: "2410 만원",
      number: 0,
    },
    {
      money: "2420 만원",
      number: 0,
    },
    {
      money: "2430 만원",
      number: 0,
    },
    {
      money: "2440 만원",
      number: 0,
    },
    {
      money: "2450 만원",
      number: 0,
    },
    {
      money: "2460 만원",
      number: 0,
    },
    {
      money: "2470 만원",
      number: 0,
    },
    {
      money: "2480 만원",
      number: 0,
    },
    {
      money: "2490 만원",
      number: 0,
    },
    {
      money: "2500 만원",
      number: 0,
    },
    {
      money: "2510 만원",
      number: 0,
    },
    {
      money: "2520 만원",
      number: 0,
    },
    {
      money: "2530 만원",
      number: 0,
    },
    {
      money: "2540 만원",
      number: 0,
    },
    {
      money: "2550 만원",
      number: 0,
    },
    {
      money: "2560 만원",
      number: 0,
    },
    {
      money: "2570 만원",
      number: 0,
    },
    {
      money: "2580 만원",
      number: 0,
    },
    {
      money: "2590 만원",
      number: 0,
    },
    {
      money: "2600 만원",
      number: 0,
    },
    {
      money: "2610 만원",
      number: 0,
    },
    {
      money: "2620 만원",
      number: 0,
    },
    {
      money: "2630 만원",
      number: 0,
    },
    {
      money: "2640 만원",
      number: 0,
    },
    {
      money: "2650 만원",
      number: 0,
    },
    {
      money: "2660 만원",
      number: 0,
    },
    {
      money: "2670 만원",
      number: 0,
    },
    {
      money: "2680 만원",
      number: 0,
    },
    {
      money: "2690 만원",
      number: 0,
    },
    {
      money: "2700 만원",
      number: 0,
    },
    {
      money: "2710 만원",
      number: 0,
    },
    {
      money: "2720 만원",
      number: 0,
    },
    {
      money: "2730 만원",
      number: 0,
    },
    {
      money: "2740 만원",
      number: 0,
    },
    {
      money: "2750 만원",
      number: 0,
    },
    {
      money: "2760 만원",
      number: 0,
    },
    {
      money: "2770 만원",
      number: 0,
    },
    {
      money: "2780 만원",
      number: 0,
    },
    {
      money: "2790 만원",
      number: 0,
    },
    {
      money: "2800 만원",
      number: 0,
    },
    {
      money: "2810 만원",
      number: 0,
    },
    {
      money: "2820 만원",
      number: 0,
    },
    {
      money: "2830 만원",
      number: 0,
    },
    {
      money: "2840 만원",
      number: 0,
    },
    {
      money: "2850 만원",
      number: 0,
    },
    {
      money: "2860 만원",
      number: 0,
    },
    {
      money: "2870 만원",
      number: 0,
    },
    {
      money: "2880 만원",
      number: 0,
    },
    {
      money: "2890 만원",
      number: 0,
    },
    {
      money: "2900 만원",
      number: 0,
    },
    {
      money: "2910 만원",
      number: 0,
    },
    {
      money: "2920 만원",
      number: 0,
    },
    {
      money: "2930 만원",
      number: 0,
    },
    {
      money: "2940 만원",
      number: 0,
    },
    {
      money: "2950 만원",
      number: 0,
    },
    {
      money: "2960 만원",
      number: 0,
    },
    {
      money: "2970 만원",
      number: 0,
    },
    {
      money: "2980 만원",
      number: 0,
    },
    {
      money: "2990 만원",
      number: 0,
    },
    {
      money: "3000 만원",
      number: 0,
    },
    {
      money: "3010 만원",
      number: 0,
    },
    {
      money: "3020 만원",
      number: 0,
    },
    {
      money: "3030 만원",
      number: 0,
    },
    {
      money: "3040 만원",
      number: 0,
    },
    {
      money: "3050 만원",
      number: 0,
    },
    {
      money: "3060 만원",
      number: 0,
    },
    {
      money: "3070 만원",
      number: 0,
    },
    {
      money: "3080 만원",
      number: 0,
    },
    {
      money: "3090 만원",
      number: 0,
    },
    {
      money: "3100 만원",
      number: 0,
    },
    {
      money: "3110 만원",
      number: 0,
    },
    {
      money: "3120 만원",
      number: 0,
    },
    {
      money: "3130 만원",
      number: 0,
    },
    {
      money: "3140 만원",
      number: 0,
    },
    {
      money: "3150 만원",
      number: 0,
    },
    {
      money: "3160 만원",
      number: 0,
    },
    {
      money: "3170 만원",
      number: 0,
    },
    {
      money: "3180 만원",
      number: 0,
    },
    {
      money: "3190 만원",
      number: 0,
    },
    {
      money: "3200 만원",
      number: 0,
    },
    {
      money: "3210 만원",
      number: 0,
    },
    {
      money: "3220 만원",
      number: 0,
    },
    {
      money: "3230 만원",
      number: 0,
    },
    {
      money: "3240 만원",
      number: 0,
    },
    {
      money: "3250 만원",
      number: 0,
    },
    {
      money: "3260 만원",
      number: 0,
    },
    {
      money: "3270 만원",
      number: 0,
    },
    {
      money: "3280 만원",
      number: 0,
    },
    {
      money: "3290 만원",
      number: 0,
    },
    {
      money: "3300 만원",
      number: 0,
    },
    {
      money: "3310 만원",
      number: 0,
    },
    {
      money: "3320 만원",
      number: 0,
    },
    {
      money: "3330 만원",
      number: 0,
    },
    {
      money: "3340 만원",
      number: 0,
    },
    {
      money: "3350 만원",
      number: 0,
    },
    {
      money: "3360 만원",
      number: 0,
    },
    {
      money: "3370 만원",
      number: 0,
    },
    {
      money: "3380 만원",
      number: 0,
    },
    {
      money: "3390 만원",
      number: 0,
    },
    {
      money: "3400 만원",
      number: 0,
    },
    {
      money: "3410 만원",
      number: 0,
    },
    {
      money: "3420 만원",
      number: 0,
    },
    {
      money: "3430 만원",
      number: 0,
    },
    {
      money: "3440 만원",
      number: 0,
    },
    {
      money: "3450 만원",
      number: 0,
    },
    {
      money: "3460 만원",
      number: 0,
    },
    {
      money: "3470 만원",
      number: 0,
    },
    {
      money: "3480 만원",
      number: 0,
    },
    {
      money: "3490 만원",
      number: 0,
    },
    {
      money: "3500 만원",
      number: 0,
    },
    {
      money: "3510 만원",
      number: 0,
    },
    {
      money: "3520 만원",
      number: 0,
    },
    {
      money: "3530 만원",
      number: 0,
    },
    {
      money: "3540 만원",
      number: 0,
    },
    {
      money: "3550 만원",
      number: 0,
    },
    {
      money: "3560 만원",
      number: 0,
    },
    {
      money: "3570 만원",
      number: 0,
    },
    {
      money: "3580 만원",
      number: 0,
    },
    {
      money: "3590 만원",
      number: 0,
    },
    {
      money: "3600 만원",
      number: 0,
    },
    {
      money: "3610 만원",
      number: 0,
    },
    {
      money: "3620 만원",
      number: 0,
    },
    {
      money: "3630 만원",
      number: 0,
    },
    {
      money: "3640 만원",
      number: 0,
    },
    {
      money: "3650 만원",
      number: 0,
    },
    {
      money: "3660 만원",
      number: 0,
    },
    {
      money: "3670 만원",
      number: 0,
    },
    {
      money: "3680 만원",
      number: 0,
    },
    {
      money: "3690 만원",
      number: 0,
    },
    {
      money: "3700 만원",
      number: 0,
    },
    {
      money: "3710 만원",
      number: 0,
    },
    {
      money: "3720 만원",
      number: 0,
    },
    {
      money: "3730 만원",
      number: 0,
    },
    {
      money: "3740 만원",
      number: 0,
    },
    {
      money: "3750 만원",
      number: 0,
    },
    {
      money: "3760 만원",
      number: 0,
    },
    {
      money: "3770 만원",
      number: 0,
    },
    {
      money: "3780 만원",
      number: 0,
    },
    {
      money: "3790 만원",
      number: 0,
    },
    {
      money: "3800 만원",
      number: 0,
    },
    {
      money: "3810 만원",
      number: 0,
    },
    {
      money: "3820 만원",
      number: 0,
    },
    {
      money: "3830 만원",
      number: 0,
    },
    {
      money: "3840 만원",
      number: 0,
    },
    {
      money: "3850 만원",
      number: 0,
    },
    {
      money: "3860 만원",
      number: 0,
    },
    {
      money: "3870 만원",
      number: 0,
    },
    {
      money: "3880 만원",
      number: 0,
    },
    {
      money: "3890 만원",
      number: 0,
    },
    {
      money: "3900 만원",
      number: 0,
    },
    {
      money: "3910 만원",
      number: 0,
    },
    {
      money: "3920 만원",
      number: 0,
    },
    {
      money: "3930 만원",
      number: 0,
    },
    {
      money: "3940 만원",
      number: 0,
    },
    {
      money: "3950 만원",
      number: 0,
    },
    {
      money: "3960 만원",
      number: 0,
    },
    {
      money: "3970 만원",
      number: 0,
    },
    {
      money: "3980 만원",
      number: 0,
    },
    {
      money: "3990 만원",
      number: 0,
    },
    {
      money: "4000 만원",
      number: 0,
    },
    {
      money: "4010 만원",
      number: 0,
    },
    {
      money: "4020 만원",
      number: 0,
    },
    {
      money: "4030 만원",
      number: 0,
    },
    {
      money: "4040 만원",
      number: 0,
    },
    {
      money: "4050 만원",
      number: 0,
    },
    {
      money: "4060 만원",
      number: 0,
    },
    {
      money: "4070 만원",
      number: 0,
    },
    {
      money: "4080 만원",
      number: 0,
    },
    {
      money: "4090 만원",
      number: 0,
    },
    {
      money: "4100 만원",
      number: 0,
    },
    {
      money: "4110 만원",
      number: 0,
    },
    {
      money: "4120 만원",
      number: 0,
    },
    {
      money: "4130 만원",
      number: 0,
    },
    {
      money: "4140 만원",
      number: 0,
    },
    {
      money: "4150 만원",
      number: 0,
    },
    {
      money: "4160 만원",
      number: 0,
    },
    {
      money: "4170 만원",
      number: 0,
    },
    {
      money: "4180 만원",
      number: 0,
    },
    {
      money: "4190 만원",
      number: 0,
    },
    {
      money: "4200 만원",
      number: 0,
    },
    {
      money: "4210 만원",
      number: 0,
    },
    {
      money: "4220 만원",
      number: 0,
    },
    {
      money: "4230 만원",
      number: 0,
    },
    {
      money: "4240 만원",
      number: 0,
    },
    {
      money: "4250 만원",
      number: 0,
    },
    {
      money: "4260 만원",
      number: 0,
    },
    {
      money: "4270 만원",
      number: 0,
    },
    {
      money: "4280 만원",
      number: 0,
    },
    {
      money: "4290 만원",
      number: 0,
    },
    {
      money: "4300 만원",
      number: 0,
    },
    {
      money: "4310 만원",
      number: 0,
    },
    {
      money: "4320 만원",
      number: 0,
    },
    {
      money: "4330 만원",
      number: 0,
    },
    {
      money: "4340 만원",
      number: 0,
    },
    {
      money: "4350 만원",
      number: 0,
    },
    {
      money: "4360 만원",
      number: 0,
    },
    {
      money: "4370 만원",
      number: 0,
    },
    {
      money: "4380 만원",
      number: 0,
    },
    {
      money: "4390 만원",
      number: 0,
    },
    {
      money: "4400 만원",
      number: 0,
    },
    {
      money: "4410 만원",
      number: 0,
    },
    {
      money: "4420 만원",
      number: 0,
    },
    {
      money: "4430 만원",
      number: 0,
    },
    {
      money: "4440 만원",
      number: 0,
    },
    {
      money: "4450 만원",
      number: 0,
    },
    {
      money: "4460 만원",
      number: 0,
    },
    {
      money: "4470 만원",
      number: 0,
    },
    {
      money: "4480 만원",
      number: 0,
    },
    {
      money: "4490 만원",
      number: 0,
    },
    {
      money: "4500 만원",
      number: 0,
    },
    {
      money: "4510 만원",
      number: 0,
    },
    {
      money: "4520 만원",
      number: 0,
    },
    {
      money: "4530 만원",
      number: 0,
    },
    {
      money: "4540 만원",
      number: 0,
    },
    {
      money: "4550 만원",
      number: 0,
    },
    {
      money: "4560 만원",
      number: 0,
    },
    {
      money: "4570 만원",
      number: 0,
    },
    {
      money: "4580 만원",
      number: 0,
    },
    {
      money: "4590 만원",
      number: 0,
    },
    {
      money: "4600 만원",
      number: 0,
    },
    {
      money: "4610 만원",
      number: 0,
    },
    {
      money: "4620 만원",
      number: 0,
    },
    {
      money: "4630 만원",
      number: 0,
    },
    {
      money: "4640 만원",
      number: 0,
    },
    {
      money: "4650 만원",
      number: 0,
    },
    {
      money: "4660 만원",
      number: 0,
    },
    {
      money: "4670 만원",
      number: 0,
    },
    {
      money: "4680 만원",
      number: 0,
    },
    {
      money: "4690 만원",
      number: 0,
    },
    {
      money: "4700 만원",
      number: 0,
    },
    {
      money: "4710 만원",
      number: 0,
    },
    {
      money: "4720 만원",
      number: 0,
    },
    {
      money: "4730 만원",
      number: 0,
    },
    {
      money: "4740 만원",
      number: 0,
    },
    {
      money: "4750 만원",
      number: 0,
    },
    {
      money: "4760 만원",
      number: 0,
    },
    {
      money: "4770 만원",
      number: 0,
    },
    {
      money: "4780 만원",
      number: 0,
    },
    {
      money: "4790 만원",
      number: 0,
    },
    {
      money: "4800 만원",
      number: 0,
    },
    {
      money: "4810 만원",
      number: 0,
    },
    {
      money: "4820 만원",
      number: 0,
    },
    {
      money: "4830 만원",
      number: 0,
    },
    {
      money: "4840 만원",
      number: 0,
    },
    {
      money: "4850 만원",
      number: 0,
    },
    {
      money: "4860 만원",
      number: 0,
    },
    {
      money: "4870 만원",
      number: 0,
    },
    {
      money: "4880 만원",
      number: 0,
    },
    {
      money: "4890 만원",
      number: 0,
    },
    {
      money: "4900 만원",
      number: 0,
    },
    {
      money: "4910 만원",
      number: 0,
    },
    {
      money: "4920 만원",
      number: 0,
    },
    {
      money: "4930 만원",
      number: 0,
    },
    {
      money: "4940 만원",
      number: 0,
    },
    {
      money: "4950 만원",
      number: 0,
    },
    {
      money: "4960 만원",
      number: 0,
    },
    {
      money: "4970 만원",
      number: 0,
    },
    {
      money: "4980 만원",
      number: 0,
    },
    {
      money: "4990 만원",
      number: 0,
    },
    {
      money: "5000 만원",
      number: 0,
    },
    {
      money: "5010 만원",
      number: 0,
    },
    {
      money: "5020 만원",
      number: 0,
    },
    {
      money: "5030 만원",
      number: 0,
    },
    {
      money: "5040 만원",
      number: 0,
    },
    {
      money: "5050 만원",
      number: 0,
    },
    {
      money: "5060 만원",
      number: 0,
    },
    {
      money: "5070 만원",
      number: 0,
    },
    {
      money: "5080 만원",
      number: 0,
    },
    {
      money: "5090 만원",
      number: 0,
    },
    {
      money: "5100 만원",
      number: 0,
    },
    {
      money: "5110 만원",
      number: 0,
    },
    {
      money: "5120 만원",
      number: 0,
    },
    {
      money: "5130 만원",
      number: 0,
    },
    {
      money: "5140 만원",
      number: 0,
    },
    {
      money: "5150 만원",
      number: 0,
    },
    {
      money: "5160 만원",
      number: 0,
    },
    {
      money: "5170 만원",
      number: 0,
    },
    {
      money: "5180 만원",
      number: 0,
    },
    {
      money: "5190 만원",
      number: 0,
    },
    {
      money: "5200 만원",
      number: 0,
    },
    {
      money: "5210 만원",
      number: 0,
    },
    {
      money: "5220 만원",
      number: 0,
    },
    {
      money: "5230 만원",
      number: 0,
    },
    {
      money: "5240 만원",
      number: 0,
    },
    {
      money: "5250 만원",
      number: 0,
    },
    {
      money: "5260 만원",
      number: 0,
    },
    {
      money: "5270 만원",
      number: 0,
    },
    {
      money: "5280 만원",
      number: 0,
    },
    {
      money: "5290 만원",
      number: 0,
    },
    {
      money: "5300 만원",
      number: 0,
    },
    {
      money: "5310 만원",
      number: 0,
    },
    {
      money: "5320 만원",
      number: 0,
    },
    {
      money: "5330 만원",
      number: 0,
    },
    {
      money: "5340 만원",
      number: 0,
    },
    {
      money: "5350 만원",
      number: 0,
    },
    {
      money: "5360 만원",
      number: 0,
    },
    {
      money: "5370 만원",
      number: 0,
    },
    {
      money: "5380 만원",
      number: 0,
    },
    {
      money: "5390 만원",
      number: 0,
    },
    {
      money: "5400 만원",
      number: 0,
    },
    {
      money: "5410 만원",
      number: 0,
    },
    {
      money: "5420 만원",
      number: 0,
    },
    {
      money: "5430 만원",
      number: 0,
    },
    {
      money: "5440 만원",
      number: 0,
    },
    {
      money: "5450 만원",
      number: 0,
    },
    {
      money: "5460 만원",
      number: 0,
    },
    {
      money: "5470 만원",
      number: 0,
    },
    {
      money: "5480 만원",
      number: 0,
    },
    {
      money: "5490 만원",
      number: 0,
    },
    {
      money: "5500 만원",
      number: 0,
    },
    {
      money: "5510 만원",
      number: 0,
    },
    {
      money: "5520 만원",
      number: 0,
    },
    {
      money: "5530 만원",
      number: 0,
    },
    {
      money: "5540 만원",
      number: 0,
    },
    {
      money: "5550 만원",
      number: 0,
    },
    {
      money: "5560 만원",
      number: 0,
    },
    {
      money: "5570 만원",
      number: 0,
    },
    {
      money: "5580 만원",
      number: 0,
    },
    {
      money: "5590 만원",
      number: 0,
    },
    {
      money: "5600 만원",
      number: 0,
    },
    {
      money: "5610 만원",
      number: 0,
    },
    {
      money: "5620 만원",
      number: 0,
    },
    {
      money: "5630 만원",
      number: 0,
    },
    {
      money: "5640 만원",
      number: 0,
    },
    {
      money: "5650 만원",
      number: 0,
    },
    {
      money: "5660 만원",
      number: 0,
    },
    {
      money: "5670 만원",
      number: 0,
    },
    {
      money: "5680 만원",
      number: 0,
    },
    {
      money: "5690 만원",
      number: 0,
    },
    {
      money: "5700 만원",
      number: 0,
    },
    {
      money: "5710 만원",
      number: 0,
    },
    {
      money: "5720 만원",
      number: 0,
    },
    {
      money: "5730 만원",
      number: 0,
    },
    {
      money: "5740 만원",
      number: 0,
    },
    {
      money: "5750 만원",
      number: 0,
    },
    {
      money: "5760 만원",
      number: 0,
    },
    {
      money: "5770 만원",
      number: 0,
    },
    {
      money: "5780 만원",
      number: 0,
    },
    {
      money: "5790 만원",
      number: 0,
    },
    {
      money: "5800 만원",
      number: 0,
    },
    {
      money: "5810 만원",
      number: 0,
    },
    {
      money: "5820 만원",
      number: 0,
    },
    {
      money: "5830 만원",
      number: 0,
    },
    {
      money: "5840 만원",
      number: 0,
    },
    {
      money: "5850 만원",
      number: 0,
    },
    {
      money: "5860 만원",
      number: 0,
    },
    {
      money: "5870 만원",
      number: 0,
    },
    {
      money: "5880 만원",
      number: 0,
    },
    {
      money: "5890 만원",
      number: 0,
    },
    {
      money: "5900 만원",
      number: 0,
    },
    {
      money: "5910 만원",
      number: 0,
    },
    {
      money: "5920 만원",
      number: 0,
    },
    {
      money: "5930 만원",
      number: 0,
    },
    {
      money: "5940 만원",
      number: 0,
    },
    {
      money: "5950 만원",
      number: 0,
    },
    {
      money: "5960 만원",
      number: 0,
    },
    {
      money: "5970 만원",
      number: 0,
    },
    {
      money: "5980 만원",
      number: 0,
    },
    {
      money: "5990 만원",
      number: 0,
    },
    {
      money: "6000 만원",
      number: 0,
    },
    {
      money: "6010 만원",
      number: 0,
    },
    {
      money: "6020 만원",
      number: 0,
    },
    {
      money: "6030 만원",
      number: 0,
    },
    {
      money: "6040 만원",
      number: 0,
    },
    {
      money: "6050 만원",
      number: 0,
    },
    {
      money: "6060 만원",
      number: 0,
    },
    {
      money: "6070 만원",
      number: 0,
    },
    {
      money: "6080 만원",
      number: 0,
    },
    {
      money: "6090 만원",
      number: 0,
    },
    {
      money: "6100 만원",
      number: 0,
    },
    {
      money: "6110 만원",
      number: 0,
    },
    {
      money: "6120 만원",
      number: 0,
    },
    {
      money: "6130 만원",
      number: 0,
    },
    {
      money: "6140 만원",
      number: 0,
    },
    {
      money: "6150 만원",
      number: 0,
    },
    {
      money: "6160 만원",
      number: 0,
    },
    {
      money: "6170 만원",
      number: 0,
    },
    {
      money: "6180 만원",
      number: 0,
    },
    {
      money: "6190 만원",
      number: 0,
    },
    {
      money: "6200 만원",
      number: 0,
    },
    {
      money: "6210 만원",
      number: 0,
    },
    {
      money: "6220 만원",
      number: 0,
    },
    {
      money: "6230 만원",
      number: 0,
    },
    {
      money: "6240 만원",
      number: 0,
    },
    {
      money: "6250 만원",
      number: 0,
    },
    {
      money: "6260 만원",
      number: 0,
    },
    {
      money: "6270 만원",
      number: 0,
    },
    {
      money: "6280 만원",
      number: 0,
    },
    {
      money: "6290 만원",
      number: 0,
    },
    {
      money: "6300 만원",
      number: 0,
    },
    {
      money: "6310 만원",
      number: 0,
    },
    {
      money: "6320 만원",
      number: 0,
    },
    {
      money: "6330 만원",
      number: 0,
    },
    {
      money: "6340 만원",
      number: 0,
    },
    {
      money: "6350 만원",
      number: 0,
    },
    {
      money: "6360 만원",
      number: 0,
    },
    {
      money: "6370 만원",
      number: 0,
    },
    {
      money: "6380 만원",
      number: 0,
    },
    {
      money: "6390 만원",
      number: 0,
    },
    {
      money: "6400 만원",
      number: 0,
    },
    {
      money: "6410 만원",
      number: 0,
    },
    {
      money: "6420 만원",
      number: 0,
    },
    {
      money: "6430 만원",
      number: 0,
    },
    {
      money: "6440 만원",
      number: 0,
    },
    {
      money: "6450 만원",
      number: 0,
    },
    {
      money: "6460 만원",
      number: 0,
    },
    {
      money: "6470 만원",
      number: 0,
    },
    {
      money: "6480 만원",
      number: 0,
    },
    {
      money: "6490 만원",
      number: 0,
    },
    {
      money: "6500 만원",
      number: 0,
    },
    {
      money: "6510 만원",
      number: 0,
    },
    {
      money: "6520 만원",
      number: 0,
    },
    {
      money: "6530 만원",
      number: 0,
    },
    {
      money: "6540 만원",
      number: 0,
    },
    {
      money: "6550 만원",
      number: 0,
    },
    {
      money: "6560 만원",
      number: 0,
    },
    {
      money: "6570 만원",
      number: 0,
    },
    {
      money: "6580 만원",
      number: 0,
    },
    {
      money: "6590 만원",
      number: 0,
    },
    {
      money: "6600 만원",
      number: 0,
    },
    {
      money: "6610 만원",
      number: 0,
    },
    {
      money: "6620 만원",
      number: 0,
    },
    {
      money: "6630 만원",
      number: 0,
    },
    {
      money: "6640 만원",
      number: 0,
    },
    {
      money: "6650 만원",
      number: 0,
    },
    {
      money: "6660 만원",
      number: 0,
    },
    {
      money: "6670 만원",
      number: 0,
    },
    {
      money: "6680 만원",
      number: 0,
    },
    {
      money: "6690 만원",
      number: 0,
    },
    {
      money: "6700 만원",
      number: 0,
    },
    {
      money: "6710 만원",
      number: 0,
    },
    {
      money: "6720 만원",
      number: 0,
    },
    {
      money: "6730 만원",
      number: 0,
    },
    {
      money: "6740 만원",
      number: 0,
    },
    {
      money: "6750 만원",
      number: 0,
    },
    {
      money: "6760 만원",
      number: 0,
    },
    {
      money: "6770 만원",
      number: 0,
    },
    {
      money: "6780 만원",
      number: 0,
    },
    {
      money: "6790 만원",
      number: 0,
    },
    {
      money: "6800 만원",
      number: 0,
    },
    {
      money: "6810 만원",
      number: 0,
    },
    {
      money: "6820 만원",
      number: 0,
    },
    {
      money: "6830 만원",
      number: 0,
    },
    {
      money: "6840 만원",
      number: 0,
    },
    {
      money: "6850 만원",
      number: 0,
    },
    {
      money: "6860 만원",
      number: 0,
    },
    {
      money: "6870 만원",
      number: 0,
    },
    {
      money: "6880 만원",
      number: 0,
    },
    {
      money: "6890 만원",
      number: 0,
    },
    {
      money: "6900 만원",
      number: 0,
    },
    {
      money: "6910 만원",
      number: 0,
    },
    {
      money: "6920 만원",
      number: 0,
    },
    {
      money: "6930 만원",
      number: 0,
    },
    {
      money: "6940 만원",
      number: 0,
    },
    {
      money: "6950 만원",
      number: 0,
    },
    {
      money: "6960 만원",
      number: 0,
    },
    {
      money: "6970 만원",
      number: 0,
    },
    {
      money: "6980 만원",
      number: 0,
    },
    {
      money: "6990 만원",
      number: 0,
    },
    {
      money: "7000 만원",
      number: 0,
    },
    {
      money: "7010 만원",
      number: 0,
    },
    {
      money: "7020 만원",
      number: 0,
    },
    {
      money: "7030 만원",
      number: 0,
    },
    {
      money: "7040 만원",
      number: 0,
    },
    {
      money: "7050 만원",
      number: 0,
    },
    {
      money: "7060 만원",
      number: 0,
    },
    {
      money: "7070 만원",
      number: 0,
    },
    {
      money: "7080 만원",
      number: 0,
    },
    {
      money: "7090 만원",
      number: 0,
    },
    {
      money: "7100 만원",
      number: 0,
    },
    {
      money: "7110 만원",
      number: 0,
    },
    {
      money: "7120 만원",
      number: 0,
    },
    {
      money: "7130 만원",
      number: 0,
    },
    {
      money: "7140 만원",
      number: 0,
    },
    {
      money: "7150 만원",
      number: 0,
    },
    {
      money: "7160 만원",
      number: 0,
    },
    {
      money: "7170 만원",
      number: 0,
    },
    {
      money: "7180 만원",
      number: 0,
    },
    {
      money: "7190 만원",
      number: 0,
    },
    {
      money: "7200 만원",
      number: 0,
    },
    {
      money: "7210 만원",
      number: 0,
    },
    {
      money: "7220 만원",
      number: 0,
    },
    {
      money: "7230 만원",
      number: 0,
    },
    {
      money: "7240 만원",
      number: 0,
    },
    {
      money: "7250 만원",
      number: 0,
    },
    {
      money: "7260 만원",
      number: 0,
    },
    {
      money: "7270 만원",
      number: 0,
    },
    {
      money: "7280 만원",
      number: 0,
    },
    {
      money: "7290 만원",
      number: 0,
    },
    {
      money: "7300 만원",
      number: 0,
    },
    {
      money: "7310 만원",
      number: 0,
    },
    {
      money: "7320 만원",
      number: 0,
    },
    {
      money: "7330 만원",
      number: 0,
    },
    {
      money: "7340 만원",
      number: 0,
    },
    {
      money: "7350 만원",
      number: 0,
    },
    {
      money: "7360 만원",
      number: 0,
    },
    {
      money: "7370 만원",
      number: 0,
    },
    {
      money: "7380 만원",
      number: 0,
    },
    {
      money: "7390 만원",
      number: 0,
    },
    {
      money: "7400 만원",
      number: 0,
    },
    {
      money: "7410 만원",
      number: 0,
    },
    {
      money: "7420 만원",
      number: 0,
    },
    {
      money: "7430 만원",
      number: 0,
    },
    {
      money: "7440 만원",
      number: 0,
    },
    {
      money: "7450 만원",
      number: 0,
    },
    {
      money: "7460 만원",
      number: 0,
    },
    {
      money: "7470 만원",
      number: 0,
    },
    {
      money: "7480 만원",
      number: 0,
    },
    {
      money: "7490 만원",
      number: 0,
    },
    {
      money: "7500 만원",
      number: 0,
    },
    {
      money: "7510 만원",
      number: 0,
    },
    {
      money: "7520 만원",
      number: 0,
    },
    {
      money: "7530 만원",
      number: 0,
    },
    {
      money: "7540 만원",
      number: 0,
    },
    {
      money: "7550 만원",
      number: 0,
    },
    {
      money: "7560 만원",
      number: 0,
    },
    {
      money: "7570 만원",
      number: 0,
    },
    {
      money: "7580 만원",
      number: 0,
    },
    {
      money: "7590 만원",
      number: 0,
    },
    {
      money: "7600 만원",
      number: 0,
    },
    {
      money: "7610 만원",
      number: 0,
    },
    {
      money: "7620 만원",
      number: 0,
    },
    {
      money: "7630 만원",
      number: 0,
    },
    {
      money: "7640 만원",
      number: 0,
    },
    {
      money: "7650 만원",
      number: 0,
    },
    {
      money: "7660 만원",
      number: 0,
    },
    {
      money: "7670 만원",
      number: 0,
    },
    {
      money: "7680 만원",
      number: 0,
    },
    {
      money: "7690 만원",
      number: 0,
    },
    {
      money: "7700 만원",
      number: 0,
    },
    {
      money: "7710 만원",
      number: 0,
    },
    {
      money: "7720 만원",
      number: 0,
    },
    {
      money: "7730 만원",
      number: 0,
    },
    {
      money: "7740 만원",
      number: 0,
    },
    {
      money: "7750 만원",
      number: 0,
    },
    {
      money: "7760 만원",
      number: 0,
    },
    {
      money: "7770 만원",
      number: 0,
    },
    {
      money: "7780 만원",
      number: 0,
    },
    {
      money: "7790 만원",
      number: 0,
    },
    {
      money: "7800 만원",
      number: 0,
    },
    {
      money: "7810 만원",
      number: 0,
    },
    {
      money: "7820 만원",
      number: 0,
    },
    {
      money: "7830 만원",
      number: 0,
    },
    {
      money: "7840 만원",
      number: 0,
    },
    {
      money: "7850 만원",
      number: 0,
    },
    {
      money: "7860 만원",
      number: 0,
    },
    {
      money: "7870 만원",
      number: 0,
    },
    {
      money: "7880 만원",
      number: 0,
    },
    {
      money: "7890 만원",
      number: 0,
    },
    {
      money: "7900 만원",
      number: 0,
    },
    {
      money: "7910 만원",
      number: 0,
    },
    {
      money: "7920 만원",
      number: 0,
    },
    {
      money: "7930 만원",
      number: 0,
    },
    {
      money: "7940 만원",
      number: 0,
    },
    {
      money: "7950 만원",
      number: 0,
    },
    {
      money: "7960 만원",
      number: 0,
    },
    {
      money: "7970 만원",
      number: 0,
    },
    {
      money: "7980 만원",
      number: 0,
    },
    {
      money: "7990 만원",
      number: 0,
    },
    {
      money: "8000 만원",
      number: 0,
    },
    {
      money: "8010 만원",
      number: 0,
    },
    {
      money: "8020 만원",
      number: 0,
    },
    {
      money: "8030 만원",
      number: 0,
    },
    {
      money: "8040 만원",
      number: 0,
    },
    {
      money: "8050 만원",
      number: 0,
    },
    {
      money: "8060 만원",
      number: 0,
    },
    {
      money: "8070 만원",
      number: 0,
    },
    {
      money: "8080 만원",
      number: 0,
    },
    {
      money: "8090 만원",
      number: 0,
    },
    {
      money: "8100 만원",
      number: 0,
    },
    {
      money: "8110 만원",
      number: 0,
    },
    {
      money: "8120 만원",
      number: 0,
    },
    {
      money: "8130 만원",
      number: 0,
    },
    {
      money: "8140 만원",
      number: 0,
    },
    {
      money: "8150 만원",
      number: 0,
    },
    {
      money: "8160 만원",
      number: 0,
    },
    {
      money: "8170 만원",
      number: 0,
    },
    {
      money: "8180 만원",
      number: 0,
    },
    {
      money: "8190 만원",
      number: 0,
    },
    {
      money: "8200 만원",
      number: 0,
    },
    {
      money: "8210 만원",
      number: 0,
    },
    {
      money: "8220 만원",
      number: 0,
    },
    {
      money: "8230 만원",
      number: 0,
    },
    {
      money: "8240 만원",
      number: 0,
    },
    {
      money: "8250 만원",
      number: 0,
    },
    {
      money: "8260 만원",
      number: 0,
    },
    {
      money: "8270 만원",
      number: 0,
    },
    {
      money: "8280 만원",
      number: 0,
    },
    {
      money: "8290 만원",
      number: 0,
    },
    {
      money: "8300 만원",
      number: 0,
    },
    {
      money: "8310 만원",
      number: 0,
    },
    {
      money: "8320 만원",
      number: 0,
    },
    {
      money: "8330 만원",
      number: 0,
    },
    {
      money: "8340 만원",
      number: 0,
    },
    {
      money: "8350 만원",
      number: 0,
    },
    {
      money: "8360 만원",
      number: 0,
    },
    {
      money: "8370 만원",
      number: 0,
    },
    {
      money: "8380 만원",
      number: 0,
    },
    {
      money: "8390 만원",
      number: 0,
    },
    {
      money: "8400 만원",
      number: 0,
    },
    {
      money: "8410 만원",
      number: 0,
    },
    {
      money: "8420 만원",
      number: 0,
    },
    {
      money: "8430 만원",
      number: 0,
    },
    {
      money: "8440 만원",
      number: 0,
    },
    {
      money: "8450 만원",
      number: 0,
    },
    {
      money: "8460 만원",
      number: 0,
    },
    {
      money: "8470 만원",
      number: 0,
    },
    {
      money: "8480 만원",
      number: 0,
    },
    {
      money: "8490 만원",
      number: 0,
    },
    {
      money: "8500 만원",
      number: 0,
    },
    {
      money: "8510 만원",
      number: 0,
    },
    {
      money: "8520 만원",
      number: 0,
    },
    {
      money: "8530 만원",
      number: 0,
    },
    {
      money: "8540 만원",
      number: 0,
    },
    {
      money: "8550 만원",
      number: 0,
    },
    {
      money: "8560 만원",
      number: 0,
    },
    {
      money: "8570 만원",
      number: 0,
    },
    {
      money: "8580 만원",
      number: 0,
    },
    {
      money: "8590 만원",
      number: 0,
    },
    {
      money: "8600 만원",
      number: 0,
    },
    {
      money: "8610 만원",
      number: 0,
    },
    {
      money: "8620 만원",
      number: 0,
    },
    {
      money: "8630 만원",
      number: 0,
    },
    {
      money: "8640 만원",
      number: 0,
    },
    {
      money: "8650 만원",
      number: 0,
    },
    {
      money: "8660 만원",
      number: 0,
    },
    {
      money: "8670 만원",
      number: 0,
    },
    {
      money: "8680 만원",
      number: 0,
    },
    {
      money: "8690 만원",
      number: 0,
    },
    {
      money: "8700 만원",
      number: 0,
    },
    {
      money: "8710 만원",
      number: 0,
    },
    {
      money: "8720 만원",
      number: 0,
    },
    {
      money: "8730 만원",
      number: 0,
    },
    {
      money: "8740 만원",
      number: 0,
    },
    {
      money: "8750 만원",
      number: 0,
    },
    {
      money: "8760 만원",
      number: 0,
    },
    {
      money: "8770 만원",
      number: 0,
    },
    {
      money: "8780 만원",
      number: 0,
    },
    {
      money: "8790 만원",
      number: 0,
    },
    {
      money: "8800 만원",
      number: 0,
    },
    {
      money: "8810 만원",
      number: 0,
    },
    {
      money: "8820 만원",
      number: 0,
    },
    {
      money: "8830 만원",
      number: 0,
    },
    {
      money: "8840 만원",
      number: 0,
    },
    {
      money: "8850 만원",
      number: 0,
    },
    {
      money: "8860 만원",
      number: 0,
    },
    {
      money: "8870 만원",
      number: 0,
    },
    {
      money: "8880 만원",
      number: 0,
    },
    {
      money: "8890 만원",
      number: 0,
    },
    {
      money: "8900 만원",
      number: 0,
    },
    {
      money: "8910 만원",
      number: 0,
    },
    {
      money: "8920 만원",
      number: 0,
    },
    {
      money: "8930 만원",
      number: 0,
    },
    {
      money: "8940 만원",
      number: 0,
    },
    {
      money: "8950 만원",
      number: 0,
    },
    {
      money: "8960 만원",
      number: 0,
    },
    {
      money: "8970 만원",
      number: 0,
    },
    {
      money: "8980 만원",
      number: 0,
    },
    {
      money: "8990 만원",
      number: 0,
    },
    {
      money: "9000 만원",
      number: 0,
    },
    {
      money: "9010 만원",
      number: 0,
    },
    {
      money: "9020 만원",
      number: 0,
    },
    {
      money: "9030 만원",
      number: 0,
    },
    {
      money: "9040 만원",
      number: 0,
    },
    {
      money: "9050 만원",
      number: 0,
    },
    {
      money: "9060 만원",
      number: 0,
    },
    {
      money: "9070 만원",
      number: 0,
    },
    {
      money: "9080 만원",
      number: 0,
    },
    {
      money: "9090 만원",
      number: 0,
    },
    {
      money: "9100 만원",
      number: 0,
    },
    {
      money: "9110 만원",
      number: 0,
    },
    {
      money: "9120 만원",
      number: 0,
    },
    {
      money: "9130 만원",
      number: 0,
    },
    {
      money: "9140 만원",
      number: 0,
    },
    {
      money: "9150 만원",
      number: 0,
    },
    {
      money: "9160 만원",
      number: 0,
    },
    {
      money: "9170 만원",
      number: 0,
    },
    {
      money: "9180 만원",
      number: 0,
    },
    {
      money: "9190 만원",
      number: 0,
    },
    {
      money: "9200 만원",
      number: 0,
    },
    {
      money: "9210 만원",
      number: 0,
    },
    {
      money: "9220 만원",
      number: 0,
    },
    {
      money: "9230 만원",
      number: 0,
    },
    {
      money: "9240 만원",
      number: 0,
    },
    {
      money: "9250 만원",
      number: 0,
    },
    {
      money: "9260 만원",
      number: 0,
    },
    {
      money: "9270 만원",
      number: 0,
    },
    {
      money: "9280 만원",
      number: 0,
    },
    {
      money: "9290 만원",
      number: 0,
    },
    {
      money: "9300 만원",
      number: 0,
    },
    {
      money: "9310 만원",
      number: 0,
    },
    {
      money: "9320 만원",
      number: 0,
    },
    {
      money: "9330 만원",
      number: 0,
    },
    {
      money: "9340 만원",
      number: 0,
    },
    {
      money: "9350 만원",
      number: 0,
    },
    {
      money: "9360 만원",
      number: 0,
    },
    {
      money: "9370 만원",
      number: 0,
    },
    {
      money: "9380 만원",
      number: 0,
    },
    {
      money: "9390 만원",
      number: 0,
    },
    {
      money: "9400 만원",
      number: 0,
    },
    {
      money: "9410 만원",
      number: 0,
    },
    {
      money: "9420 만원",
      number: 0,
    },
    {
      money: "9430 만원",
      number: 0,
    },
    {
      money: "9440 만원",
      number: 0,
    },
    {
      money: "9450 만원",
      number: 0,
    },
    {
      money: "9460 만원",
      number: 0,
    },
    {
      money: "9470 만원",
      number: 0,
    },
    {
      money: "9480 만원",
      number: 0,
    },
    {
      money: "9490 만원",
      number: 0,
    },
    {
      money: "9500 만원",
      number: 0,
    },
    {
      money: "9510 만원",
      number: 0,
    },
    {
      money: "9520 만원",
      number: 0,
    },
    {
      money: "9530 만원",
      number: 0,
    },
    {
      money: "9540 만원",
      number: 0,
    },
    {
      money: "9550 만원",
      number: 0,
    },
    {
      money: "9560 만원",
      number: 0,
    },
    {
      money: "9570 만원",
      number: 0,
    },
    {
      money: "9580 만원",
      number: 0,
    },
    {
      money: "9590 만원",
      number: 0,
    },
    {
      money: "9600 만원",
      number: 0,
    },
    {
      money: "9610 만원",
      number: 0,
    },
    {
      money: "9620 만원",
      number: 0,
    },
    {
      money: "9630 만원",
      number: 0,
    },
    {
      money: "9640 만원",
      number: 0,
    },
    {
      money: "9650 만원",
      number: 0,
    },
    {
      money: "9660 만원",
      number: 0,
    },
    {
      money: "9670 만원",
      number: 0,
    },
    {
      money: "9680 만원",
      number: 0,
    },
    {
      money: "9690 만원",
      number: 0,
    },
    {
      money: "9700 만원",
      number: 0,
    },
    {
      money: "9710 만원",
      number: 0,
    },
    {
      money: "9720 만원",
      number: 0,
    },
    {
      money: "9730 만원",
      number: 0,
    },
    {
      money: "9740 만원",
      number: 0,
    },
    {
      money: "9750 만원",
      number: 0,
    },
    {
      money: "9760 만원",
      number: 0,
    },
    {
      money: "9770 만원",
      number: 0,
    },
    {
      money: "9780 만원",
      number: 0,
    },
    {
      money: "9790 만원",
      number: 0,
    },
    {
      money: "9800 만원",
      number: 0,
    },
    {
      money: "9810 만원",
      number: 0,
    },
    {
      money: "9820 만원",
      number: 0,
    },
    {
      money: "9830 만원",
      number: 0,
    },
    {
      money: "9840 만원",
      number: 0,
    },
    {
      money: "9850 만원",
      number: 0,
    },
    {
      money: "9860 만원",
      number: 0,
    },
    {
      money: "9870 만원",
      number: 0,
    },
    {
      money: "9880 만원",
      number: 0,
    },
    {
      money: "9890 만원",
      number: 0,
    },
    {
      money: "9900 만원",
      number: 0,
    },
    {
      money: "9910 만원",
      number: 0,
    },
    {
      money: "9920 만원",
      number: 0,
    },
    {
      money: "9930 만원",
      number: 0,
    },
    {
      money: "9940 만원",
      number: 0,
    },
    {
      money: "9950 만원",
      number: 0,
    },
    {
      money: "9960 만원",
      number: 0,
    },
    {
      money: "9970 만원",
      number: 0,
    },
    {
      money: "9980 만원",
      number: 0,
    },
    {
      money: "9990 만원",
      number: 0,
    },
    {
      money: "1억원",
      number: 0,
    },
  ];

  var categoryAxis = chart.xAxes.push(new am4charts.CategoryAxis());
  categoryAxis.renderer.grid.template.location = 0;
  categoryAxis.dataFields.category = "money";
  categoryAxis.renderer.minGridDistance = 40;
  categoryAxis.fontSize = 11;
  categoryAxis.renderer.labels.template.rotation = 45;

  var valueAxis = chart.yAxes.push(new am4charts.ValueAxis());
  valueAxis.min = 0;
  valueAxis.max = 500;
  valueAxis.strictMinMax = true;
  valueAxis.renderer.minGridDistance = 30;

  var scrollbarX = new am4core.Scrollbar();
  chart.scrollbarX = scrollbarX;

  /*
      // this is exactly the same, but with events
      axisBreak.events.on("over", function() {
        axisBreak.animate(
          [{ property: "breakSize", to: 1 }, { property: "opacity", to: 0.1 }],
          1500,
          am4core.ease.sinOut
        );
      });
      axisBreak.events.on("out", function() {
        axisBreak.animate(
          [{ property: "breakSize", to: 0.005 }, { property: "opacity", to: 1 }],
          1000,
          am4core.ease.quadOut
        );
      });*/

  var series = chart.series.push(new am4charts.ColumnSeries());
  series.dataFields.categoryX = "money";
  series.dataFields.valueY = "number";
  series.columns.template.tooltipText = "{valueY.value}";
  series.columns.template.tooltipY = 0;
  series.columns.template.strokeOpacity = 0;

  // as by default columns of the same series are of the same color, we add adapter which takes colors from chart.colors color set
  series.columns.template.adapter.add("fill", function (fill, target) {
    return chart.colors.getIndex(target.dataItem.index);
  });
}); // end am4core.ready()

am4core.ready(function () {
  // Themes begin
  am4core.useTheme(am4themes_dark);
  am4core.useTheme(am4themes_animated);
  // Themes end

  var chart = am4core.create("chartdiv2", am4charts.XYChart);
  chart.hiddenState.properties.opacity = 0; // this creates initial fade-in

  chart.data = [
    {
      month: "1 개월",
      label: "",
      number: 0,
    },
    {
      month: "2 개월",
      label: "",
      number: 0,
    },
    {
      month: "3 개월",
      label: "",
      number: 1,
    },
    {
      month: "4 개월",
      label: "",
      number: 31,
    },
    {
      month: "5 개월",
      label: "",
      number: 3,
    },
    {
      month: "6 개월",
      label: "6개월",
      number: 100,
    },
    {
      month: "7 개월",
      label: "",
      number: 1,
    },
    {
      month: "8 개월",
      label: "",
      number: 45,
    },
    {
      month: "9 개월",
      label: "",
      number: 0,
    },
    {
      month: "10 개월",
      label: "",
      number: 19,
    },
    {
      month: "11 개월",
      label: "",
      number: 0,
    },
    {
      month: "12 개월",
      label: "1년",
      number: 18,
    },
    {
      month: "13 개월",
      label: "",
      number: 0,
    },
    {
      month: "14 개월",
      label: "",
      number: 0,
    },
    {
      month: "15 개월",
      label: "",
      number: 0,
    },
    {
      month: "16 개월",
      label: "",
      number: 0,
    },
    {
      month: "17 개월",
      label: "",
      number: 0,
    },
    {
      month: "18 개월",
      label: "",
      number: 1,
    },
    {
      month: "19 개월",
      label: "",
      number: 0,
    },
    {
      month: "20 개월",
      label: "",
      number: 0,
    },
    {
      month: "21 개월",
      label: "",
      number: 0,
    },
    {
      month: "22 개월",
      label: "",
      number: 0,
    },
    {
      month: "23 개월",
      label: "",
      number: 0,
    },
    {
      month: "24 개월",
      label: "2년",
      number: 0,
    },
    {
      month: "25 개월",
      label: "",
      number: 0,
    },
    {
      month: "26 개월",
      label: "",
      number: 0,
    },
    {
      month: "27 개월",
      label: "",
      number: 0,
    },
    {
      month: "28 개월",
      label: "",
      number: 0,
    },
    {
      month: "29 개월",
      label: "",
      number: 0,
    },
    {
      month: "30 개월",
      label: "",
      number: 0,
    },
    {
      month: "31 개월",
      label: "",
      number: 0,
    },
    {
      month: "32 개월",
      label: "",
      number: 0,
    },
    {
      month: "33 개월",
      label: "",
      number: 0,
    },
    {
      month: "34 개월",
      label: "",
      number: 0,
    },
    {
      month: "35 개월",
      label: "",
      number: 0,
    },
    {
      month: "36 개월",
      label: "3년",
      number: 0,
    },
    {
      month: "37 개월",
      label: "",
      number: 0,
    },
    {
      month: "38 개월",
      label: "",
      number: 0,
    },
    {
      month: "39 개월",
      label: "",
      number: 0,
    },
    {
      month: "40 개월",
      label: "",
      number: 0,
    },
    {
      month: "41 개월",
      label: "",
      number: 0,
    },
    {
      month: "42 개월",
      label: "",
      number: 0,
    },
    {
      month: "43 개월",
      label: "",
      number: 0,
    },
    {
      month: "44 개월",
      label: "",
      number: 0,
    },
    {
      month: "45 개월",
      label: "",
      number: 0,
    },
    {
      month: "46 개월",
      label: "",
      number: 0,
    },
    {
      month: "47 개월",
      label: "",
      number: 0,
    },
    {
      month: "48 개월",
      label: "4년",
      number: 0,
    },
    {
      month: "49 개월",
      label: "",
      number: 0,
    },
    {
      month: "50 개월",
      label: "",
      number: 0,
    },
    {
      month: "51 개월",
      label: "",
      number: 0,
    },
    {
      month: "52 개월",
      label: "",
      number: 0,
    },
    {
      month: "53 개월",
      label: "",
      number: 0,
    },
    {
      month: "54 개월",
      label: "",
      number: 0,
    },
    {
      month: "55 개월",
      label: "",
      number: 0,
    },
    {
      month: "56 개월",
      label: "",
      number: 0,
    },
    {
      month: "57 개월",
      label: "",
      number: 0,
    },
    {
      month: "58 개월",
      label: "",
      number: 0,
    },
    {
      month: "59 개월",
      label: "",
      number: 0,
    },
    {
      month: "60 개월",
      label: "5년",
      number: 0,
    },
    {
      month: "61 개월",
      label: "",
      number: 0,
    },
    {
      month: "62 개월",
      label: "",
      number: 0,
    },
    {
      month: "63 개월",
      label: "",
      number: 0,
    },
    {
      month: "64 개월",
      label: "",
      number: 0,
    },
    {
      month: "65 개월",
      label: "",
      number: 0,
    },
    {
      month: "66 개월",
      label: "",
      number: 0,
    },
    {
      month: "67 개월",
      label: "",
      number: 0,
    },
    {
      month: "68 개월",
      label: "",
      number: 0,
    },
    {
      month: "69 개월",
      label: "",
      number: 0,
    },
    {
      month: "70 개월",
      label: "",
      number: 0,
    },
    {
      month: "71 개월",
      label: "",
      number: 0,
    },
    {
      month: "72 개월",
      label: "6년",
      number: 0,
    },
    {
      month: "73 개월",
      label: "",
      number: 0,
    },
    {
      month: "74 개월",
      label: "",
      number: 0,
    },
    {
      month: "75 개월",
      label: "",
      number: 0,
    },
    {
      month: "76 개월",
      label: "",
      number: 0,
    },
    {
      month: "77 개월",
      label: "",
      number: 0,
    },
    {
      month: "78 개월",
      label: "",
      number: 0,
    },
    {
      month: "79 개월",
      label: "",
      number: 0,
    },
    {
      month: "80 개월",
      label: "",
      number: 0,
    },
    {
      month: "81 개월",
      label: "",
      number: 0,
    },
    {
      month: "82 개월",
      label: "",
      number: 0,
    },
    {
      month: "83 개월",
      label: "",
      number: 0,
    },
    {
      month: "84 개월",
      label: "7년",
      number: 0,
    },
  ];

  var categoryAxis = chart.xAxes.push(new am4charts.CategoryAxis());
  categoryAxis.renderer.grid.template.location = 0;
  categoryAxis.dataFields.category = "month";
  categoryAxis.renderer.minGridDistance = 40;
  categoryAxis.fontSize = 11;
  categoryAxis.renderer.labels.template.rotation = 45;

  var valueAxis = chart.yAxes.push(new am4charts.ValueAxis());
  valueAxis.min = 0;
  valueAxis.max = 120;
  valueAxis.strictMinMax = true;
  valueAxis.renderer.minGridDistance = 30;

  var scrollbarX = new am4core.Scrollbar();
  chart.scrollbarX = scrollbarX;

  /*
        // this is exactly the same, but with events
        axisBreak.events.on("over", function() {
          axisBreak.animate(
            [{ property: "breakSize", to: 1 }, { property: "opacity", to: 0.1 }],
            1500,
            am4core.ease.sinOut
          );
        });
        axisBreak.events.on("out", function() {
          axisBreak.animate(
            [{ property: "breakSize", to: 0.005 }, { property: "opacity", to: 1 }],
            1000,
            am4core.ease.quadOut
          );
        });*/

  var series = chart.series.push(new am4charts.ColumnSeries());
  series.dataFields.categoryX = "month";
  series.dataFields.valueY = "number";
  series.columns.template.tooltipText = "{valueY.value}";
  series.columns.template.tooltipY = 0;
  series.columns.template.strokeOpacity = 0;

  // as by default columns of the same series are of the same color, we add adapter which takes colors from chart.colors color set
  series.columns.template.adapter.add("fill", function (fill, target) {
    return chart.colors.getIndex(target.dataItem.index);
  });
}); // end am4core.ready()
