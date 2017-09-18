'use strict';

import React from 'react';
import {
  Text,
  TextInput,
  View,
  ListView,
  ScrollView,
  TouchableOpacity,
  WebView,
} from 'react-native';
import l18n from '../localization/all.js';
import SurveyStyles from '../styles/SurveyStyles.js'
import Color from 'react-native-material-color';

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
	this.currentQuestionOptions = false;
	this.currentQuestionOptionsObj = false;
	this.surveyTXTresult = false;
	
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
		
	this.networkState = function () {
		return this.network;
	}
	
	this.networkChange = function (n) {
		//console.warn("SurveyManager [network]", n);
		if (n=='NONE') { 
			this.network=false; 
		} else { 
			this.network=true; 
			this.surveySync();
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
	
	
	this.surveyResults = function () {
		if (this.network) {
			restapi.doResults(
				function(r) { 
					this.getSurveyResultsLoadSuccess(r); }.bind(this), 
				function(r) { 
					this.getSurveyLoadError(r); }.bind(this)
				);
		} else {
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
			let start = (<View style={{ flex: 1,flexDirection: 'row',justifyContent: 'center', alignItems: 'center', marginTop:30 }}><TouchableOpacity onPress={ () => this.pressCallback('start','')}><Text style={SurveyStyles.button}>{l18n.startsurvey}</Text></TouchableOpacity></View>);
			this.getSurveyCallback({ title: this.survey.survey.title, description: this.survey.survey.Description}, start, null, {cur: 0, total: 10 });
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
			//this.pressCallback('start',false);
		}
	}
	
	this.questionFormStateOption = function (id, is_one) {
		if (is_one) {
			this.questionFormState.oid = {};
		}
		if (id!==false) {
			if (this.questionFormState.oid[id]) {
				this.questionFormState.oid[id]=false;
			} else {
				this.questionFormState.oid[id]=true;
			}
			if (is_one) {
				this.questionFormState.t="";
			}
		}
		
		this.renderQuestion(true);
	}
	
	this.questionFormStateGet = function (id) {
		return this.questionFormState.oid[id];
	}
	
	this.renderQuestionRender = function (r,rother) {
		this.getSurveyCallback({ title: this.currentQuestion.title, description: this.currentQuestion.description}, r, rother, {cur: this.currentQuestionsNum, total: (this.surveyKeys.length-1) });
	}
	
	this.renderQuestion = function (doreinit) {
		this.currentQuestion=this.survey.questions[this.currentQuestionID];
		if (!doreinit) {
			this.questionFormState.SH = this.currentSurveyUUID;
			this.questionFormState.QH = quuid();
			this.questionFormState.qid = this.currentQuestion.id;
			this.questionFormState.oid = {};
			this.questionFormState.t = "";
			this.questionFormState.type = this.currentQuestion.type;
		}
		if (this.getSurveyCallback) {
			let r = (<View>Unknown question type</View>);
			let rother = (<View></View>);
			if (this.currentQuestion.type=='text') {
				this.questionFormState.oid = 0;
				r = (<View><TextInput style={SurveyStyles.otherText} onChangeText={(text) => this.questionFormState.t=text} autoFocus={true} returnKeyType='next' autoCorrect={false} /></View>);
			} else if (this.currentQuestion.type=='one' || this.currentQuestion.type=='multi') {
				this.currentQuestionOptionsObj = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
				var tmp = this.currentQuestion.options;
				for (var i in tmp) {
					if (tmp[i].id) { 
						tmp[i].state=this.questionFormState.oid[(tmp[i].id)]?true:false; 
					}
				}
				this.currentQuestionOptions = this.currentQuestionOptionsObj.cloneWithRows(tmp);
				if (this.currentQuestion.type=='one') {
					r = (<View><ListView dataSource={this.currentQuestionOptions} renderRow={(rowData) => <TouchableOpacity onPress={ () => this.questionFormStateOption(rowData.id, true) }><Text style={ rowData.state?SurveyStyles.activeOpionStyle:SurveyStyles.opionStyle }>{rowData.title}</Text></TouchableOpacity> } /></View>);
					if (this.currentQuestion.other==1) {
						rother = (<View><TextInput style={this.questionFormState.t!=''?SurveyStyles.activeOtherText:SurveyStyles.otherText} onChangeText={(text) => {this.questionFormState.t=text; this.questionFormStateOption(false, true); }} defaultValue={this.questionFormState.t} placeholder={l18n.othervar} autoCorrect={false} /></View>);
					}
				} else {
					r = (<View><ListView dataSource={this.currentQuestionOptions} renderRow={(rowData) => <TouchableOpacity onPress={ () => this.questionFormStateOption(rowData.id, false) }><Text style={ rowData.state?SurveyStyles.activeOpionStyle:SurveyStyles.opionStyle }>{rowData.title}</Text></TouchableOpacity> } /></View>);
					if (this.currentQuestion.other==1) {
						rother = (<View><TextInput style={this.questionFormState.t!=''?SurveyStyles.activeOtherText:SurveyStyles.otherText} onChangeText={(text) => { this.questionFormState.t=text; this.questionFormStateOption(false, false); }} defaultValue={this.questionFormState.t} placeholder={l18n.othervar} autoCorrect={false} /></View>);
					}
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
		let r = (<View style={{ flex: 1,flexDirection: 'row',justifyContent: 'center', alignItems: 'center', marginTop:30 }}><TouchableOpacity onPress={ () => this.nextQuestion() }><Text style={SurveyStyles.button}>{l18n.newsurvey}</Text></TouchableOpacity></View>);
		this.getSurveyCallback({ title: 'Done', description: 'Survey finished'}, r);
		this.surveySync();
	}
	
	this.surveySync = function () {
		if (this.networkState()) {
			//console.warn("Start sync");
			syncStatus("start");
			this.storage.sync('', 
				function (s) { }.bind(this), 
				function (e) { this.getSurveyLoadError(e); }.bind(this));
		}
	}
	
	this.saveQuestionState = function (q) {
		// preprocessing
		if (q.type=='one' || q.type=='multi') {
			if (q.t!='' && q.type=='one') {
				q.oid=0;
				this.storage.save(q);
			} else if (q.t=='' && q.type=='one') {
				for (var i in q.oid) {
					if (q.oid[i]==true) {
						q.oid=i;
						break;
					}
				}
				this.storage.save(q);
			} else if (q.type=='multi') {
				for (var i in q.oid) {
					var tmp = Object.assign({}, q);
					if (q.oid[i]===true) {
						tmp.QH = quuid();
						tmp.oid=i;
						tmp.t='';
						this.storage.save(tmp);
					}
				}
				if (q.t!='') {
					var tmp = q;
					tmp.QH = quuid();
					tmp.oid=0;
					this.storage.save(tmp);
				}
			}
		} else {
			this.storage.save(q);
		}
	}
	
	this.rebuildKeys = function () {
		this.surveyKeys = [];
		for(var key in this.survey.questions) {
			this.surveyKeys.push(key);
		}
	}
	
	this.getSurveyLoadSuccess = function (v) {
		this.storage.setSurvey(JSON.stringify(v));
		this.survey = v;
		this.rebuildKeys();
		this.renderSurveyInfo();
	}

	this.getSurveyResultsLoadSuccess = function (v) {
		//console.warn("Results",v);
		if (this.getSurveyCallback) {
			this.surveyTXTresult=false;
			//var v_js = JSON.stringify(v.questions).replace(new RegExp("\}","g"),"} \n");
			var v_html="";
			this.surveyTXTresult=""+v.survey.title+"\n "+v.survey.Description+"\n\n";
			for (var i in v.questions) {
				if (v.questions[i].title) {
					v_html+="<div style='margin:15px 0px 5px 0px; padding:15px 5px 0px 5px; border-top:1px solid gray;'>";
					v_html+="<div style='text-weight: bold;'>"+v.questions[i].title+"</div>";
					this.surveyTXTresult+="\n"+v.questions[i].title+"\n";
					v_html+="<div style='color: gray; margin-bottom:5px;'>"+v.questions[i].description+"</div>";
					this.surveyTXTresult+=" "+v.questions[i].description+"\n";
					if (v.questions[i].type=='one' || v.questions[i].type=='multi') {
						var get_max=0;
						var get_sum=0;
						for (var o in v.questions[i].options) {
							if (v.questions[i].options[o] && (o>0 || v.questions[i].other==1)) {
								if (get_max<v.questions[i].options[o].results) get_max=v.questions[i].options[o].results;
								get_sum+=parseInt(v.questions[i].options[o].results);
							}
						}
						var tmp_v_html_after="";
						var tmp_v_html="";
						v_html+="<table><thead><tr><th width=40%></th><th></th><th width=1%></th></tr></thead><tbody>";
						for (var o in v.questions[i].options) {
							if (v.questions[i].options[o] && (o>0 || v.questions[i].other==1)) {
								if (get_max==0)  {
									var tmp_perc=0;
								} else {
									var tmp_perc=v.questions[i].options[o].results/get_max;
								}
								tmp_v_html="<tr>";
									tmp_v_html+="<td>"+(v.questions[i].options[o].title=="_"?("<i>"+l18n.othershort+"</i>"):v.questions[i].options[o].title)+"</td>";
									this.surveyTXTresult+="  "+(v.questions[i].options[o].title=="_"?(l18n.othershort):v.questions[i].options[o].title)+"   ";
									tmp_v_html+="<td><div><div style='width:"+tmp_perc*100+"%; background: "+Color.LightGreen+"; border-radius:0px 5px 5px 0px; float:left;'>&nbsp;</div></div></td>";
									if (get_sum>0) {
										this.surveyTXTresult+=(Math.round((v.questions[i].options[o].results/get_sum)*1000)/10)+"% ("+v.questions[i].options[o].results+")\n";
										tmp_v_html+="<td nowrap style='text-align:right;'>"+(Math.round((v.questions[i].options[o].results/get_sum)*1000)/10)+"%</td>";
									} else {
										this.surveyTXTresult+="\n";
										tmp_v_html+="<td>&nbsp;</td>";
									}
								tmp_v_html+="</tr>";
								if (o==0) {
									tmp_v_html_after=tmp_v_html;
								} else {
									v_html+=tmp_v_html;
								}
							}
						}
						v_html+=tmp_v_html_after+"</tbody></table>"
					}
					this.surveyTXTresult+=" "+l18n.totalanswers+": "+v.questions[i].total+"\n";
					v_html+="<div style='color: gray; text-align:right;'>"+l18n.totalanswers+": "+v.questions[i].total+"</div>";
					v_html+="</div>"
				}
			}
			//console.log(this.surveyTXTresult);
			v_html="<html><body style='margin:0; padding:0;'><div style='width:100%; margin-bottom:25px;'>"+v_html+"</div></body></html>";
			this.getSurveyCallback({ title: v.survey.title, description: v.survey.Description}, "", v_html);
		}
	}
	
	this.getSurveyLoadError = function (r) {
		//console.warn("SurveyERROR",r);
		if (r[0]=='access_denied') {
			this.storage.setToken("");
			switchToLoginActivity(l18n.error_auth);
		} else if (r[0]=='no_survey_in_cache') {
			this.storage.setToken("");
			switchToLoginActivity(l18n.error_no_survey);
		} else if (r[0]=='internal_parse_error') {
			this.storage.setToken("");
			switchToLoginActivity(l18n.error_internal);
		}
	}
	
}
module.exports = SurveyManager;
