'use strict';

import React from 'react';
import {
  Text,
  TextInput,
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Button
} from 'react-native';

const suuid = require('uuid/v4');
const quuid = require('uuid/v1');

var SurveyManager = function () {
	this.config=false;
	this.network = false;
	this.ready=false;
	this.survey = false;
	this.storage = false;
	this.getSurveyCallback = false;
	this.surveyKeys = [];
	this.currentSurveyUUID = false;
	this.currentQuestion = false;
	this.currentQuestionID = false;
	this.currentQuestionsNum = 0;
	this.questionFormState = {};
	this.surveyStarted = false;
	
	this.init = function (_config,_storage) {
		this.config=_config;
		this.storage = _storage;
		this.ready = true;
	}
	
	this.reInit = function () {
		this.currentQuestion = false;
		this.currentQuestionID = false;
		this.currentQuestionsNum = 0;
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
					this.rebuildKeys();
					this.renderSurveyInfo();
				} else {
					this.getSurveyLoadError(["no_survey_in_cache"]);
				}
			}.bind(this));
		}
	}
	
	
	this.pressCallback = function (e,id) {
		if (e=='start') {
			this.surveyStarted = true;
			this.surveyNew();
			this.renderQuestion();
		}
	}
	this.renderSurveyInfo = function () {
		if (this.getSurveyCallback) {
			let start = (<View><Button onPress={() => this.pressCallback('start','')} title="Start survey"/></View>);
			this.getSurveyCallback({ title: this.survey.survey.title, description: this.survey.survey.Description}, start);
		}
	}
	
	this.nextQuestion = function () {
		if (this.surveyStarted) {
			this.saveQuestionState(this.questionFormState);
			this.questionFormState = {}
			this.currentQuestionsNum++;
			if (this.currentQuestionsNum>=this.surveyKeys.length) {
				this.surveyDone();
			} else {
				this.currentQuestionID=this.surveyKeys[this.currentQuestionsNum];
				this.renderQuestion();
			}
		} else {
			this.surveyNew();
		}
	}
	
	this.renderQuestion = function () {
		this.currentQuestion=this.survey.questions[this.currentQuestionID];
		console.log("RENDER", this.currentQuestion);
		this.questionFormState.SH = this.currentSurveyUUID;
		this.questionFormState.QH = quuid();
		this.questionFormState.qid = this.currentQuestion.id;
		if (this.getSurveyCallback) {
			let r = (<View></View>);
			if (this.currentQuestion.type=='text') {
				r = (<View><TextInput onChangeText={(text) => this.questionFormState.t=text} autoFocus={true} returnKeyType='next' autoCorrect={false} /></View>);
			}
			// TODO
			this.getSurveyCallback({ title: this.currentQuestion.title, description: this.currentQuestion.description}, r);
		}
	}
	
	this.surveyNew = function () {
		this.reInit();
		if (!this.currentQuestionID) {
			this.currentQuestionID=this.surveyKeys[0];
			this.currentQuestionsNum=0;
		}
		this.currentSurveyUUID=suuid();
		this.renderSurveyInfo();
	}
	
	this.surveyDone = function () {
		this.surveyStarted = false;
		let r = (<View><Text>Survey Done</Text></View>);
		this.getSurveyCallback({ title: '', description: ''}, r);
		console.warn("TODO.surveyDone", this.currentSurveyUUID);
	}
	this.saveQuestionState = function (q) {
		// TODO q.ts
		console.warn("TODO.saveQuestionState", q);
	}
	
	this.rebuildKeys = function () {
		this.surveyKeys = [];
		for(var key in this.survey.questions) {
			this.surveyKeys.push(key);
		}
	}
	
	this.getSurveyLoadSuccess = function (v) {
		console.log("Survey",v);
		this.storage.setSurvey(JSON.stringify(v));
		this.survey = v;
		this.rebuildKeys();
		this.renderSurveyInfo();
	}
	
	this.getSurveyLoadError = function (r) {
		console.warn("SurveyERROR",r);
	}
	
}
module.exports = SurveyManager;
