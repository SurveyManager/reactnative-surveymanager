'use strict';

import { AsyncStorage } from 'react-native';

const suuid = require('uuid/v4');

var SurveyStorage = function () {
	this.config=false;
	this.prefix="SurveyStorage";

	this.syncLock=true;
	this.syncData=false;
	this.syncDataElements=0;
	this.syncCallbackSuccess=false;
	this.syncCallbackFailed=false;
	
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
					var tmp = new Array();
					for (var i in stores) {
						try {
							if ((!id && stores[i][0].indexOf(":data:")!=-1) || stores[i][0].indexOf(":data:"+id+":")!=-1) {
								var tmp2=JSON.parse(stores[i][1]);
								if (tmp2.SH && tmp2.QH) {
									tmp.push({id: stores[i][0], data: tmp2});
								}
							} else {
							}
						} catch (e) {
						}
					}
					this.syncData=tmp;
					this.syncDataElements=tmp.length;
					this.syncCallbackSuccess=_callbackSuccess;
					this.syncCallbackFailed=_callbackFailed;
					this.syncLock=false;
					this.syncDo(false);
				}.bind(this,id,_callbackSuccess, _callbackFailed))
			}.bind(this,id,_callbackSuccess, _callbackFailed))
		} catch (e) {
			//console.warn("syncERROR", e, error);
		}
	}
	
	
	this.syncDo = function (force) {
		if (this.syncLock && !force) {
			syncStatus("busy");
		} else {
			if (this.syncData.length>0) {
				this.syncLock=true;
				//syncStatus("do");
				var t = this.syncData.shift();
				console.log("Elements progress ", (this.syncDataElements>0?parseInt((1-this.syncData.length/this.syncDataElements)*100):"none"));
				syncStatus((this.syncDataElements>0?parseInt((1-this.syncData.length/this.syncDataElements)*100):""));
				restapi.doSave(t.data, 
					function(_callbackSuccess, k, r) { 
						this._syncElementSuccess(k, r,_callbackSuccess); }.bind(this, this.syncCallbackSuccess, t.id), 
					function(_callbackFailed, k, r) { 
						this._syncElementError(k, r,_callbackFailed); }.bind(this, this.syncCallbackFailed, t.id)
					);
			} else {
				this.syncLock=false;
				this.syncData=false;
				this.syncElements=0;
				this.syncCallbackSuccess=false;
				this.syncCallbackFailed=false;
				syncStatus("success");
			}
		}
	}
	
	this._syncElementSuccess = function (k ,r,_callbackS) {
		//console.log("SYNC-success", k, r);
		//syncStatus("success");
		this._remove(k);
		_callbackS(r);
		this.syncDo(true);
	}
	
	this._syncElementError = function (k,r,_callbackE) {
		//console.log("SYNC-failed", k, r);
		syncStatus("failed");
		_callbackE(r);
		//this.syncDo(false);
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
