'use strict';

import React from 'react';
import {
  Text,
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Button
} from 'react-native';



var SurveyManager = function () {
	this.config=false;
	this.network = false;
	this.ready=false;
	this.survey = false;
	this.storage = false;
	this.getSurveyCallback = false;
	
	this.init = function (_config,_storage) {
		this.config=_config;
		this.storage = _storage;
		this.ready = true;
	}
	
	this.networkChange = function (n) {
		console.warn("SurveyManager [network]", n);
		if (n=='NONE') { 
			this.network=false; 
		} else { 
			this.network=true; 
		}
	}
	
	this.getSurvey = function (_callback) {
		this.getSurveyCallback = _callback;
		if (this.network) {
			restapi.doQuestions(
				function(r) { 
					this.getSurveyLoadSuccess(r); }.bind(this), 
				function(r) { 
					this.getSurveyLoadError(r); }.bind(this)
				);
		} else {
			this.storage.getSurvey().then( function (v) {
				if (v) {
					this.survey = JSON.parse(v);
					this.renderSurveyInfo();
				} else {
					this.getSurveyLoadError(["no_survey_in_cache"]);
				}
			}.bind(this));
		}
	}
	
	this.renderSurveyInfo = function () {
		if (this.getSurveyCallback) {
			let ele1 = (
      <View>
        <Text>Hello</Text>
      </View>
     );
			this.getSurveyCallback(this.survey.survey, ele1);
		}
			//var ret="<Text style={MainScreenStyles.surveyTitle}>"+this.survey.survey.title+"</Text><Text style={MainScreenStyles.surveyDescription}>"+this.survey.survey.Description+"</Text>";

	}
	
	this.renderQuestion = function () {
		
	}
	
	this.getSurveyLoadSuccess = function (v) {
		console.log("Survey",v);
		this.storage.setSurvey(JSON.stringify(v));
		this.survey = v;
		this.renderSurveyInfo();
	}
	
	this.getSurveyLoadError = function (r) {
		console.warn("SurveyERROR",r);
	}
	
}
module.exports = SurveyManager;
