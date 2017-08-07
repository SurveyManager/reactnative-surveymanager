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
		AsyncStorage.clear();	// TODO
		return this._set("survey:"+data.SH+":"+suuid()+":"+parseInt(data.ts),JSON.stringify(data));
	}
	
	this.sync = function (id) {
		// retrive data
		try {
			AsyncStorage.getAllKeys().then(
				function (v) { 
					console.log("Alldata", v);
				}.bind(this)
			);
		} catch (e) {
			console.warn("syncERROR", error);
		}
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
			return AsyncStorage.getItem(this.prefix+":"+key);
		} catch (error) {
			console.warn("getERROR", error);
		}
	}
}


module.exports = SurveyStorage;
