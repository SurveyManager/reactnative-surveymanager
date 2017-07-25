'use strict';

var SurveyStorage = function () {
	this.config=false;
	this.prefix="SurveyStorage";
	
	this.init = function (_config) {
		this.config=_config;
	}
	
	this.save = function (data) {
		// save survey question result
		data.ts = new Date().getTime()/1000;
		return this._set(uuid.v1(),JSON.stringify(data));
	}
	
	this.sync = function () {
		// retrive data
	}
	
	this.setToken = function (token) {
		return this._set("token",token);
	}
	
	this.getToken = function (token) {
		return this._get("token");
	}
	
	this._set = function (key, value) {
		try {
			await AsyncStorage.setItem(this.prefix+":"+key, value);
			return true;
		} catch (error) {
			return false;
		}
	}
	
	this._get = function (key) {
		try {
			var value = await AsyncStorage.getItem(this.prefix+":"+key);
			if (value !== null){
				return value;
			} else {
				return false;
			}
		} catch (error) {
			return false;
		}
	}
}


module.exports = SurveyStorage;
