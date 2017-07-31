'use strict';

import { AsyncStorage } from 'react-native';

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
	
	this.setSurvey = function (survey) {
		return this._set("survey",survey);
	}
	this.getSurvey = function () {
		return this._get("survey");
	}
	
	this._set = function (key, value) {
		try {
			console.log("SS-set", this.prefix+":"+key, value);
			AsyncStorage.setItem(this.prefix+":"+key, value);
			return true;
		} catch (error) {
			console.warn("setERROR", error);
		}
	}
	
	this._get = function (key) {
		try {
			//console.log("SS-get", this.prefix+":"+key);
			//AsyncStorage.getItem(this.prefix+":"+key).then( function (_callback, key, value) { _callback(key,value); }.bind(null, _callback, key, value ); ).done();
			return AsyncStorage.getItem(this.prefix+":"+key);
		} catch (error) {
			console.warn("getERROR", error);
		}
	}
}


module.exports = SurveyStorage;
