'use strict';

import { AsyncStorage } from 'react-native';

const suuid = require('uuid/v4');

var SurveyStorage = function () {
	this.config=false;
	this.prefix="SurveyStorage";
	
	this.init = function (_config) {
		this.config=_config;
	}
	
	this.save = function (data) {
		// save survey question result
		data.ts = new Date().getTime()/1000;
		return this._set("data:"+data.SH+":"+data.QH+":"+parseInt(data.ts),JSON.stringify(data));
	}
	
	this._clearAll = function () {
		try {
			AsyncStorage.clear();
		} catch (e) {
			console.warn("clearERROR", error);
		}
	}
	
	this.sync = function (id,_callbackSuccess, _callbackFailed) {
		// retrive data
		try {
			AsyncStorage.getAllKeys(function (id, _callbackSuccess, _callbackFailed, err, keys) {
				AsyncStorage.multiGet(keys, function (id, _callbackSuccess, _callbackFailed, err, stores) {
					stores.map(function (id, _callbackSuccess, _callbackFailed, result, i, store) {
						if ((!id &&  store[i][0].indexOf(":data:")!=-1) || store[i][0].indexOf(":data:"+id+":")!=-1) {
							//console.log("SYNC ",i," id=",store[i][0]," data=",store[i][1]);
							try {
								// TODO, one by one!!!
								var tmp = JSON.parse(store[i][1]);
								if (tmp.SH && tmp.QH) {
									delete tmp.type;
									//console.log("so send", tmp);
									syncStatus("do");
									restapi.doSave(tmp, 
										function(_callbackSuccess, k, r) { 
											this._syncElementSuccess(k, r,_callbackSuccess); }.bind(this, _callbackSuccess,store[i][0]), 
										function(_callbackFailed, k, r) { 
											this._syncElementError(k, r,_callbackFailed); }.bind(this, _callbackFailed,store[i][0])
										);
								}
							} catch (e) {
								console.log("CATCH error", e);
							}
						} else {
							//console.log("---- ",i," id=",store[i][0]," data=",store[i][1]);
						}
					}.bind(this,id,_callbackSuccess, _callbackFailed))
				}.bind(this,id,_callbackSuccess, _callbackFailed))
			}.bind(this,id,_callbackSuccess, _callbackFailed))
		} catch (e) {
			//console.warn("syncERROR", e, error);
		}
	}
	
	this._syncElementSuccess = function (k,r,_callbackS) {
		//console.log("SYNC-success", k, r);
		syncStatus("success");
		this._remove(k);
		_callbackS(r);
	}
	
	this._syncElementError = function (k,r,_callbackE) {
		//console.log("SYNC-failed", k, r);
		syncStatus("failed");
		_callbackE(r);
	}
	
	this.setToken = function (token) {
		return this._set("token",token);
	}
	
	this.getToken = function (token) {
		return this._get("token");
	}

	this.setUser = function (userdata) {
		//console.warn("DBG", userdata);
		return this._set("user",userdata);
	}
	
	this.getUser = function (token) {
		return this._get("user");
	}
	
	this.setSurvey = function (survey) {
		return this._set("survey",survey);
	}
	this.getSurvey = function () {
		return this._get("survey");
	}
	
	this._remove = function (key) {
		if (key.indexOf(this.prefix)!=0) {
			key=this.prefix+key;
		}
		try {
			AsyncStorage.removeItem(key);
			return true;
		} catch (error) {
			console.warn("removeERROR", error);
		}
	}
	
	this._set = function (key, value) {
		try {
			//console.log("SS-set", this.prefix+":"+key, value);
			AsyncStorage.setItem(this.prefix+":"+key, value);
			return true;
		} catch (error) {
			console.warn("setERROR", error);
		}
	}
	
	this._get = function (key) {
		try {
			return AsyncStorage.getItem(this.prefix+":"+key);
		} catch (error) {
			console.warn("getERROR", error);
		}
	}
}


module.exports = SurveyStorage;
