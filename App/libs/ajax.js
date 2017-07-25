var ajax = {
    init: function(){
        if (window.ActiveXObject)
		return new ActiveXObject('Microsoft.XMLHTTP');
	else if (window.XMLHttpRequest)
		return new XMLHttpRequest();
	return false;
        },
    arrayToString: function (ar,prefix) {
        var out="";
        for (var i in ar) {
            if (ar[i] instanceof Array) {
                ar[i]=this.arrayToString(ar[i], prefix+"["+i+"]");
            } else {
                ar[i]="&"+prefix+"["+i+"]="+encodeURIComponent(ar[i]);
            }
        }
        for (var i in ar) { out+=ar[i]; }
        return out;
        },
    formToData: function (id) {
	    var id_len=id.length;
	    var out=new Array();
	    var tmp=[document.getElementsByTagName('input'),document.getElementsByTagName('select'),document.getElementsByTagName('textarea')];
		for (var t in tmp) {
		    for (var i in tmp[t]) {
			    if (tmp[t][i].id) {
				    if ((tmp[t][i].id).substring(0,id_len)==id) {
				        out[(tmp[t][i].id).substring(id_len)]=tmp[t][i].value || tmp[t][i].innerHTML;
				    }
			    }
		    }
		}
	    return out;
	    },
    dataToForm: function (id,data) {
	    for (var i in data) {
		var obj=document.getElementById(id+i);
		if (obj) {
		    obj.value=data[i];
		}
	    }
	},


    send: function(url,method,args,cookies,async,_callback){
        var q=ajax.init();
        q.open(method,url,async);
        q.onreadystatechange=function(){
                if(this.readyState==4 && this.status==200) {
                    _callback(this.responseText);
                }
            };
        if (cookies) {
            q.setRequestHeader('Cookie',cookies);
        }
        if(method=='POST') {
            q.setRequestHeader('Content-type','application/x-www-form-urlencoded');
            q.send(args);
        } else {
            q.send(null);
        }
    }
}
module.exports = ajax;
