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
		console.log("SAVE", data);
		return this._set("data:"+data.SH+":"+data.QH+":"+parseInt(data.ts),JSON.stringify(data));
	}
	
	this._clearAll = function () {
		try {
			AsyncStorage.clear();
		} catch (e) {
			console.warn("clearERROR", error);
		}
	}
	
	this.sync = function (id) {
		// retrive data
		try {
			AsyncStorage.getAllKeys(function (id, err, keys) {
				AsyncStorage.multiGet(keys, function (id, err, stores) {
					stores.map(function (id, result, i, store) {
						if ((!id &&  store[i][0].indexOf(":data:")!=-1) || store[i][0].indexOf(":data:"+id+":")!=-1) {
							//console.log("SYNC ",i," id=",store[i][0]," data=",store[i][1]);
							try {
								var tmp = JSON.parse(store[i][1]);
								if (tmp.SH && tmp.QH) {
									delete tmp.type;
									//console.log("so send", tmp);
									restapi.doSave(tmp, 
										function(k, r) { 
											this._syncElementSuccess(k, r); }.bind(this,store[i][0]), 
										function(k, r) { 
											this._syncElementError(k, r); }.bind(this,store[i][0])
										);
								}
							} catch (e) {
								console.log("CATCH error", e);
							}
						} else {
							//console.log("---- ",i," id=",store[i][0]," data=",store[i][1]);
						}
					}.bind(this,id))
				}.bind(this,id))
			}.bind(this,id))
		} catch (e) {
			console.warn("syncERROR", error);
		}
	}
	
	this._syncElementSuccess = function (k,r) {
		//console.log("SYNC-success", k, r);
		this._remove(k);
	}
	
	this._syncElementError = function (k,r) {
		console.log("SYNC-failed", k, r);
	}
	
	this.setToken = function (token) {
		return this._set("token",token);
	}
	
	this.getToken = function (token) {
		return this._get("token");
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
