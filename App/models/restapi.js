'use strict';

var global_ajax = require("../libs/ajax");

var restapi = function () {
	var api_host=false;
	var credentials = false;

	this.init = function (api_host) {
		this.api_host = api_host;
	}
	
	this.doAuth = function (email, pin, _callbackSuccess, _callbackFailed) {
		var _data = {"email":email, "pin":pin, "request_id":"API_auth"};
		this.api("auth",this._prepareRequest(_data), 
			function (_callbackSuccess, _callbackFailed, r) { this.doAuth_answer(r, _callbackSuccess, _callbackFailed)}.bind(this,_callbackSuccess, _callbackFailed));
	}
	this.doAuth_answer = function(raw,_callbackSuccess, _callbackFailed) {
		//console.warn(raw);
		var r=JSON.parse(raw);
		if (r['ok']) {
			this.credentials = r['d']['tokenID'];
			_callbackSuccess(r['d']['tokenID']);
		} else {
			_callbackFailed(raw);
		}
	}
	
	this.doQuestions = function (_callbackSuccess, _callbackFailed) {
		var _data = {"request_id":"API_question"};
		this.api("questions",this._prepareRequest(_data), 
			function (_callbackSuccess, _callbackFailed, r) { this.doQuestions_answer(r, _callbackSuccess, _callbackFailed)}.bind(this,_callbackSuccess, _callbackFailed));		
	}
	this.doQuestions_answer = function(raw,_callbackSuccess, _callbackFailed) {
		var r=JSON.parse(raw);
		if (r['ok']) {
			_callbackSuccess(r['d']);
		} else {
			_callbackFailed(r['e']);
		}
	}
	
	this._prepareRequest = function (_raw, _Draw) {
		var tmp=new Array();
		if (this.credentials) {
			tmp[tmp.length]="token="+encodeURIComponent(this.credentials);
		}
		for (var i in _raw) {
			tmp[tmp.length]=i+"="+encodeURIComponent(_raw[i]);
		}
		for (var i in _Draw) {
			tmp[tmp.length]="d["+i+"]="+encodeURIComponent(_Draw[i]);
		}
		return tmp.join("&");
	}
	
	this.api = function (method,args,_callback) {
		console.warn("API", this.api_host+""+method, args);
		global_ajax.send(this.api_host+""+method,"POST",args,null,true,_callback);
	}
}

module.exports = restapi;

