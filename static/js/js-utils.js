// 프로토 타입 정의

// Array
Array.prototype.insert = function(index) {
    this.splice.apply(this, [index, 0].concat(
        Array.prototype.slice.call(arguments, 1)));
    return this;
};

// String
String.prototype.replaceAll = function(target, replacement) {
  return this.split(target).join(replacement);
};

if (!String.prototype.startsWith) {
    String.prototype.startsWith = function(search, pos) {
        return this.substr(!pos || pos < 0 ? 0 : +pos, search.length) === search;
    };
}

if (!String.prototype.endsWith) {
    String.prototype.endsWith = function(searchString, position) {
        var subjectString = this.toString();
        if (typeof position !== 'number' || !isFinite(position) || Math.floor(position) !== position || position > subjectString.length) {
            position = subjectString.length;
        }
        position -= searchString.length;
        var lastIndex = subjectString.indexOf(searchString, position);
        return lastIndex !== -1 && lastIndex === position;
    };
}

// Date
Date.prototype.format = function (f) {
    if (!this.valueOf()) return " ";
    var weekName = ["일요일", "월요일", "화요일", "수요일", "목요일", "금요일", "토요일"];
    var d = this;

    return f.replace(/(yyyy|yy|MM|dd|E|hh|mm|ss|a\/p)/gi, function ($1) {
        switch ($1) {
            case "yyyy": return d.getFullYear();
            case "yy": return (d.getFullYear() % 1000).zf(2);
            case "MM": return (d.getMonth() + 1).zf(2);
            case "dd": return d.getDate().zf(2);
            case "E": return weekName[d.getDay()];
            case "HH": return d.getHours().zf(2);
            case "hh": return ((h = d.getHours() % 12) ? h : 12).zf(2);
            case "mm": return d.getMinutes().zf(2);
            case "ss": return d.getSeconds().zf(2);
            case "a/p": return d.getHours() < 12 ? "오전" : "오후";
            default: return $1;
        }
    });
};

String.prototype.string = function (len) { var s = '', i = 0; while (i++ < len) { s += this; } return s; };
String.prototype.zf = function (len) { return "0".string(len - this.length) + this; };
Number.prototype.zf = function (len) { return this.toString().zf(len); };


var MINUTE_BY_SEC = 60 * 1000;
var HOUR_BY_SEC = 60 * MINUTE_BY_SEC;
var DAY_BY_SEC = 24 * HOUR_BY_SEC;

var JSUtils = {

    setJqeuryBrowserInit : function(){
        jQuery.browser = {};
        jQuery.browser.msie = false;
        jQuery.browser.version = 0;
        if (navigator.userAgent.match(/MSIE ([0-9]+)\./)) {
            jQuery.browser.msie = true;
            jQuery.browser.version = RegExp.$1;
        }
    },
    /**
     * 오브젝트 dom 맵핑
     * param dom_id : DOM id
     * tmpl_id : 템플릿 id
     * obj : 오브젝트
     * isAppend : append 붙여쓰기 여부 (기본 false)
     */
    generateTemplate : function( dom_id, tmpl_id, obj, isAppend ){
        var element = document.getElementById( dom_id );
        if ( element ){

            if( isAppend ){
                element.innerHTML = element.innerHTML + tmpl( tmpl_id, { obj : obj } );
            }
            else{
                element.innerHTML = tmpl( tmpl_id, { obj : obj } );
            }
        }
    },

    /**
     * 디코딩 처리
     * @param html
     * @returns {*}
     */
    decodeHtml : function (html) {
        var txt = document.createElement("textarea");
        txt.innerHTML = html;
        return txt.value;
    },

    /**
     * JSON -> Object : Firebase 에서 불러온 데이터를 변환
     * @param json
     * @param usingNormalize
     * @returns {any}
     */
    getObjectFromJson : function ( json, usingNormalize ){

        var decodeJson = this.decodeHtml( json )
        if ( usingNormalize ){
            var normalizeJson = decodeJson.replaceAll( "(\"", "(\'").replaceAll( "\")", "\')");
            return JSON.parse( normalizeJson );
        }
        return JSON.parse( decodeJson );
    },

    /**
     *  현재 시간 기준으로, 시간차 텍스트 조회
     *  @param dt : datetime (yyyy-MM-dd HH:mm:ss)
     *  @return : N일 전, N시간 전, N분 전
     **/
    getTimeGapFmt : function( dt ){
        var now = new Date();
        var itemDate = new Date( dt );
        var timeDiff = now.getTime() - itemDate.getTime();

        if ( timeDiff <  0 ){
            return '방금전';
        }
        else if ( timeDiff > DAY_BY_SEC ){
            return ( Math.ceil(timeDiff/ DAY_BY_SEC) - 1   ) + '일전';
        }
        else if ( timeDiff > HOUR_BY_SEC ){
            return ( Math.ceil(timeDiff/ HOUR_BY_SEC) - 1 ) + '시간전';
        }
        return ( Math.ceil(timeDiff/ MINUTE_BY_SEC) - 1 ) + '분전';
    },

    /**
     * AJAX 데이터 요청
     * @param url
     * @param method
     * @param contentType
     * @param data
     * @param callBackSuccessFunc
     * @param callBackErrorFunc
     */
    reqeuestAjax : function ( url, method, async, data, callBackSuccessFunc, callBackErrorFunc, headers ){

        //console.log("access = ", Login.getAccessToken() )
        $.ajax({
            url : url,
            type: method,
            async : async,
            contentType : 'application/json',
            timeout : 5 * 1000,
            data : data ? JSON.stringify(data) : {},
            beforeSend : function(xhr){
                xhr.setRequestHeader("Authorization", Login.getAccessToken());
                if ( headers ){
                    for( var key in headers ){
                        xhr.setRequestHeader( key, headers[key] );
                    }
                }
            },
            success: function ( res ) {
                console.log( "res = ", res);
                if ( callBackSuccessFunc && typeof(callBackSuccessFunc) == "function") {

                    if ( typeof(res) == "object" ){
                        //callBackSuccessFunc(res).bind( caller );
                        callBackSuccessFunc(res);
                    }
                    else{
                        //callBackSuccessFunc(JSON.parse(res)).bind( caller );
                        if( res ){
                            console.log( "res = [string -> object] ", JSON.parse(res));
                            callBackSuccessFunc(JSON.parse(res));
                        }
                        else{
                            callBackSuccessFunc();
                        }
                    }
                }
            },
            error: function ( xhr, ajaxOptions, thrownError) {
                console.error( "error = " + xhr.status + " " + thrownError);
                if ( callBackErrorFunc && typeof(callBackErrorFunc) == "function") {
                    //callBackErrorFunc(xhr, ajaxOptions, thrownError).bind( caller );
                    callBackErrorFunc(xhr, ajaxOptions, thrownError);
                }
                else{
                    // 운영환경이 아닐 경우에만 에러메시지 노출
                    var phase = getPhase();
                    if ( !phase.startsWith("RELEASE")){
                        var msg = "[ERROR] JSON URL : " + url;
                        msg += " \nStatus : " + xhr.status;
                        msg += " \nMessage : " + thrownError;
                        msg += " \nUserId : " + Login.getUserId();
                        msg += " \nTime : " + (new Date()).format("yyyy-MM-dd HH:mm:ss");
                        alert( msg );
                    }
                }
            }
        });
    },
    /**
     * 현재 url 의 쿼리스트링 조회
     * return : object { }
     */
    getQueryStringObject : function() {
        var a = window.location.search.substr(1).split('&');
        if (a == "") return {};
        var b = {};
        for (var i = 0; i < a.length; ++i) {
            var p = a[i].split('=', 2);
            if (p.length == 1)
                b[p[0]] = "";
            else
                b[p[0]] = decodeURIComponent(p[1].replace(/\+/g, " "));
        }
        return b;
    },

    /**
     * 쿼리 스트링의 특정 KEY 를 조회
     * return : value 값 리턴
     */
    getQueryStringKey : function( key ){

        var queryParams = this.getQueryStringObject();
        if ( !queryParams[key] ){
            //alert("NO KEY = " + key );
        }
        else{
            return queryParams[key];
        }
        return null;
    },

    /**
     * obj를 쿼리 스트링으로 변환
     * return : aa=10&bb=20&....
     */
    getObjectToQueryString : function( obj ){

        var length = Object.keys( obj ).length;
        var idx = 0;
        var queryString = '';
        for ( key in obj ){
            queryString += key + '=' + obj[key];
            if ( idx < length - 1){
                queryString += '&';
            }
            idx++;
        }
        return queryString;
    },

    // 브라우저에서 지원하지 않을수 있음.
//    getURLInfo : function( url ){
//        var oUrl = new URL( url );
//        return oUrl;
//    },

    /**
     * 기존의 new URL(url) 오브젝트를 대체
     * @param url
     * @returns {{pathname: string}}
     */
    getUrlObject : function ( url ){

        var protocol = url.indexOf( "https:") == 0 ? "https:" : "http:";
        var hostAndPath = url.replace("http://", "" ).replace("https://", "");
        var index = hostAndPath.indexOf("/");
        var pathname = hostAndPath.substr( index );
        var origin = url.replace( pathname, "" );
        return { 'pathname' : pathname, 'origin' : origin, 'protocol' : protocol };
    },

    /**
     * 말줄임 문구
     * @param str : 스트링
     * @param len : 글자수
     * @returns {{pathname: string}} : 말줄임 문구
     */
    getShortcutStr : function( str, len, shortcutText ){

        if ( shortcutText == null ){
            shortcutText = "...";
        }
        return ( str.length > len ) ? str.substring( 0, len ) + shortcutText : str;
    },


    /**
     * 두 시간 사이에, 기준시간이 포함되는지 조회
     * @param startDateTime : 시작시간
     * @param endDateTime : 종료시간
     * @param baseTime : 기준시간
     * @returns 포함여부 : true, false
     */
    isBetweenTime : function( startDateTime, endDateTime, baseTime ){
        if ( startDateTime.getTime() < baseTime.getTime() && baseTime.getTime() < endDateTime.getTime() ){
            return true;
        }
        return false;
    },

    /**
     * 두 시간차이 계산
     * @param startDateTime : 시작시간
     * @param endDateTime : 종료시간
     * @param unit : 기준단위 (SECOND, MINITE, HOUR, DAY )
     * @returns gap Seconds : 시간차 (단위:초)
     */
    getBetweenTime : function( startDateTime, endDateTime, unit ){
        var gapMillisec = ( endDateTime.getTime() - startDateTime.getTime() );

        if ( unit == 'MINUTE'){
            return gapMillisec / MINUTE_BY_SEC;
        }
        else if ( unit == 'HOUR'){
            return gapMillisec / HOUR_BY_SEC;
        }
        else if ( unit == 'DAY'){
            return gapMillisec / HOUR_BY_SEC;
        }
        return gapMillisec / 1000;
    },

    /**
     * DAY_OF_WEEK 조회 (일요일 : 0, 월요일 : 1, ... 토요일 : 6 )
     * @param date : 기준날짜
     * @returns {{pathname: string}} : 일(0) ~ 토(6)
     */
    getDayOfWeek : function( date ){
        return date.getDay();
    },

    /**
     * ISO 표준 DAY_OF_WEEK 조회 (월요일 : 1, ... 일요일 : 7 )
     * @param date : 기준날짜
     * @returns {{pathname: string}} : 월(1) ~ 일(7)
     */
    getISODayOfWeek : function( date ){
        var SUNDAY = 7;
        var wod = this.getDayOfWeek( date );
        // 일요일 = 0
        return ( wod > 0 )? wod : SUNDAY;
    },

    reload : function(){
        location.reload();
    }
}