'use strict';

import React from 'react';
import {
  Text,
  TextInput,
  View,
  ListView,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Button
} from 'react-native';

const suuid = require('uuid/v4');
const quuid = require('uuid/v1');

const SurveyStyles = StyleSheet.create({
	textBtn : {
		padding: 10,
	},
	
	activeOpionStyle : {
		backgroundColor: '#00ff00',	// TODO better color
		borderRadius: 5,
		padding: 20,
		margin: 5
	},
	opionStyle : {
		backgroundColor: '#ff0000',
		borderRadius: 5,
		padding: 20,
		margin: 5
	}
});


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
	this.showLoginActivity = false;
	this.currentQuestionOptions = false;
	this.currentQuestionOptionsObj = false;
	
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
	
	this.questionFormStateOption = function (id, is_one) {
		if (is_one) {
			this.questionFormState.o = {};
		}
		if (this.questionFormState.o[id]) {
			this.questionFormState.o[id]=false;
		} else {
			this.questionFormState.o[id]=true;
		}
		
		this.renderQuestion(true);
	}
	
	this.questionFormStateGet = function (id) {
		return this.questionFormState.o[id];
	}
	
	this.renderQuestionRender = function (r,rother) {
		this.getSurveyCallback({ title: this.currentQuestion.title, description: this.currentQuestion.description}, r, rother);
	}
	
	this.renderQuestion = function (doreinit) {
		this.currentQuestion=this.survey.questions[this.currentQuestionID];
		if (!doreinit) {
			this.questionFormState.SH = this.currentSurveyUUID;
			this.questionFormState.QH = quuid();
			this.questionFormState.qid = this.currentQuestion.id;
			this.questionFormState.o = {};
			this.questionFormState.t = "";
			this.questionFormState.type = this.currentQuestion.type;
		}
		if (this.getSurveyCallback) {
			let r = (<View>Unknown question type</View>);
			let rother = (<View></View>);
			if (this.currentQuestion.type=='text') {
				this.questionFormState.o = false;
				r = (<View><TextInput style={SurveyStyles.textBtn} onChangeText={(text) => this.questionFormState.t=text} autoFocus={true} returnKeyType='next' autoCorrect={false} /></View>);
			} else if (this.currentQuestion.type=='one' || this.currentQuestion.type=='multi') {
				this.currentQuestionOptionsObj = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
				var tmp = this.currentQuestion.options;
				for (var i in tmp) {
					if (tmp[i].id) { tmp[i].state=this.questionFormState.o[(tmp[i].id)]?true:false; }
				}
				this.currentQuestionOptions = this.currentQuestionOptionsObj.cloneWithRows(tmp);
				if (this.currentQuestion.type=='one') {
					r = (<View><ListView dataSource={this.currentQuestionOptions} renderRow={(rowData) => <TouchableOpacity onPress={ () => this.questionFormStateOption(rowData.id, true) }><Text style={ rowData.state?SurveyStyles.activeOpionStyle:SurveyStyles.opionStyle }>{rowData.title}</Text></TouchableOpacity> } /></View>);
				} else {
					r = (<View><ListView dataSource={this.currentQuestionOptions} renderRow={(rowData) => <TouchableOpacity onPress={ () => this.questionFormStateOption(rowData.id, false) }><Text style={ rowData.state?SurveyStyles.activeOpionStyle:SurveyStyles.opionStyle }>{rowData.title}</Text></TouchableOpacity> } /></View>);
				}
				if (this.currentQuestion.other==1) {
					rother = (<View><TextInput style={SurveyStyles.textBtn} onChangeText={(text) => this.questionFormState.t=text} placeholder="Other variant" autoCorrect={false} /></View>);
				}
			} 
			this.renderQuestionRender(r, rother);
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
		let r = (<View></View>);
		this.getSurveyCallback({ title: 'Done', description: 'Survey finished'}, r);
		console.warn("TODO.surveyDone", this.currentSurveyUUID);
		
		console.log(this.storage.sync());
	}
	this.saveQuestionState = function (q) {
		if (q.type=='one' || q.type=='multi') {
			var tmp=[];
			if (q.t=='' || q.type=='multi') {
				for (var i in q.o) {
					if (q.o[i]) tmp.push(i);
				}
				q.o = tmp;
			} else {
				q.o = 0;
			}
		}
		//console.warn("TODO.saveQuestionState", q);
		this.storage.save(q);
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
		if (r[0]=='access_denied') {
			this.storage.setToken("");
			this.showLoginActivity();
		}
	}
	
}
module.exports = SurveyManager;
