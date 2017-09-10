import React from 'react';
import renderIf from './App/libs/renderif'
import { 
	AppRegistry, 
	View, 
	NetInfo, 
	Modal, 
	Button, 
	ScrollView,
	TouchableOpacity,
	Text, 
	TextInput,
	StatusBar, 
	DrawerLayoutAndroid,
	KeyboardAvoidingView,
	WebView,
	Share,
	Slider,
	ProgressBar,
	} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import l18n from './App/localization/all.js';
import MainScreenStyles from './App/styles/MainScreenStyles.js';
import AppStyle from './App/styles/AppStyle.js';
import config from './App/config.js';

var thisActivity = false;

// Init components
var _storage = require('./App/models/SurveyStorage.js');
	Sstorage=new _storage();
	Sstorage.init({});
	
var _restapi = require('./App/models/restapi.js');
	restapi=new _restapi();
	restapi.init(config.APIurl);
	
var _manager = require('./App/models/Survey.js');
	survey = new _manager();
	survey.init({},Sstorage);

// Init network info handler
NetInfo.fetch().then( function (survey,t) {
	survey.networkChange(t);
}.bind(null, survey));

NetInfo.addEventListener( 'change',
	  function (survey, t) { survey.networkChange(t); }.bind(null, survey)
);

// Global methods
switchToLoginActivity = function (e) {
	  if (e) {
		  thisActivity.setState({ modalVisible: true, mainVisible: false, modalTxt: e });
	  } else {
		  _goLoginActivity();
	  }
	}
_goLoginActivity = function () {
		thisActivity.setState({ modalVisible: false, mainVisible: false, modalLoginVisible: true,  });
}

clearDB = function () {
	Sstorage._clearAll();
}

syncStatus = function (s) {
	if (thisActivity) {
		thisActivity.syncStatusHandler(s);
	}
}



export default class App extends React.Component {
	constructor() {
		super();
		this.state = {
			surveyVisible: true, 
			resultVisible: false, 
			modalVisible: false, 
			modalLoginVisible: false, 
			mainVisible: false,
			modalProgressVisible: true,
			modalNewSurvey: false,
			modalMenu: false,
			syncProgress: false, 
			syncProgressPerc: "",
			modalTxt: "",
			email: "",
			webViewHeight: 1,
			survey: false,
			syncicon: "md-cloud",
			q: "",
			qother: "",
			progressData: {
				cur:0,
				total:10
			}
		}
		thisActivity=this;
	}

	static waitTimer = false;
  
	syncStatusHandlerTimer = false;

	loginFormState = {
		"login": {text:''},
		"password": {text:''}
	}
	focusNextField = (nextField) => {
		this.refs[nextField].focus();
	};

	nextQuestion = function () {
		survey.nextQuestion();
	}

	newSurvey = function () {
		this.setState({ modalNewSurvey: true });
	}
	
	shareSurveyResult = function () {
		Share.share({
			message: (survey.surveyTXTresult!==false?survey.surveyTXTresult:"No results"),
			title: 'Survey results',
		}, {
			dialogTitle: 'Share Survey results',
		})
	}

	doNewSurvey = function () {
		this.setState({ surveyVisible: true, resultVisible: false });
		this.setState({ progressData: {cur:0, total:10} });
		this.ModalMenu('hide');
		survey.surveyNew();
		this.hideNewSurvey();
	}
	hideNewSurvey = function () {
		this.setState({ modalNewSurvey: false });
	}
	sync = function () {
		this.ModalMenu('hide');
		survey.surveySync();
	}
	surveyResults = function () {
		this.ModalMenu('hide');
		this.setState({ surveyVisible: false, resultVisible: true, qother: "" });
		survey.surveyResults();
	}

	syncStatusHandler = function (s) {
		if (this.syncStatusHandlerTimer) {
			clearTimeout(this.syncStatusHandlerTimer);
			this.syncStatusHandlerTimer=false;
		}
		if (s=='start' || s=='do') {
			this.setState({ syncicon: "md-cloud-upload", syncProgress: true } );
		} else if (s=='success') {
			this.setState({ syncicon: "md-cloud-done", syncProgress: true, syncProgressPerc: "Done" } );
		} else if (s=='failed') {
			this.setState({ syncicon: "md-cloud-outline", syncProgress: true, syncProgressPerc: "Error" } );
		} else if (s=='busy') {
			this.setState({ syncicon: "md-cloud-circle", syncProgress: true } );
		} else if (s>0) {
			this.setState({ syncProgressPerc: s+"%" })
		}
		this.syncStatusHandlerTimer = setTimeout(function (s) { this.syncStatusHandlerFinish(s) }.bind(this,s) ,1500);
	}

	syncStatusHandlerFinish = function (s) {
		this.setState({ syncProgress: false } );
	}
  
	doAuth = function () {
	  this.setState({modalProgressVisible: true });
	  if (survey.networkState()) {
		  restapi.doAuth(this.loginFormState.login.text, this.loginFormState.password.text, 
			function(r) { this.doAuthSuccess(r); }.bind(this), 
			function(r) { this.doAuthError(r); }.bind(this));
	  } else {
		  this.checkUser(this.loginFormState.login.text, this.loginFormState.password.text, 
			function() { this.doAuthSuccess(false); }.bind(this), 
			function() { this.doAuthError(false); }.bind(this));
	  }
	}
	doAuthSuccess = function (r) {
		if (r) {
			Sstorage.setToken(r['tokenID']);
			Sstorage.setUser(JSON.stringify(r));
		}
		this.doAfterAuthSuccess();
	}
	doAfterAuthSuccess = function () {
		this.setState({ modalLoginVisible: false, modalProgressVisible: false });
		this.checkUser(false, false, false, false); 
		this.doLoad();
	}

	doAuthError = function (r) {
		this.setState({modalProgressVisible: false, modalVisible: true, modalTxt: "Authorization error" });
	}

	doLoad = function () {
		this.setState({modalProgressVisible: true });
		survey.getSurvey( function (r, e, other, progress) {
			this.setState({ survey: r, q: e, qother: other,  mainVisible: true, modalProgressVisible: false, });
			if (progress) {
				this.setState({progressData: progress });
			}
		}.bind(this) );
	}

  
	checkToken = function () {
		clearInterval(this.waitTimer);
		Sstorage.getToken().then( function (v) { 
			if (v) {
				restapi.credentials = v;
				this.doAfterAuthSuccess();
			} else {
				this.setState({ modalLoginVisible: true, modalProgressVisible: false, });
				this.checkUser(false, false, false, false); 
			}
		}.bind(this));
	}

	checkUser = function (login, password, _callbackSuccess, _callbackFailed) {
		Sstorage.getUser().then( function (login, password,_callbackSuccess, _callbackFailed, v) {
			if (v) {
				v=JSON.parse(v);
				this.setState({ email:v.email });
				this.loginFormState.login.text=v.email;
				this.loginFormState.password.text="";
				if (v.email && v.PIN && v.email==login && v.PIN==password && _callbackSuccess!==false)  {
					_callbackSuccess(false);
				} else {
					if (_callbackFailed!==false) _callbackFailed(false);
				}
			} else {
				if (_callbackFailed!==false) _callbackSuccess(false);
			}
		}.bind(this, login, password,_callbackSuccess, _callbackFailed));
	}

	componentDidMount() {
		this.waitTimer = setInterval (function () { 
			if (survey.ready) { 
				this.checkToken(); 
			} else { 
				//console.warn("WAIT...", survey.ready); 
			} 
		}.bind(this), 100);
	}

	ModalMenu(d) {
		if (d=='show') {
			this.setState({ modalMenu: true, });
			this.menudrawer.openDrawer();
		} else {
			this.setState({ modalMenu: false, });
			this.menudrawer.closeDrawer();
		}
	}
	Logout() {
		this.ModalMenu('hide');
		Sstorage.setToken("");
		switchToLoginActivity(false);
	}

	webViewMsg(event) {
		var h=parseInt(event.nativeEvent.data);
		thisActivity.setState({webViewHeight: h});
    }



  render() {
	  var navigationView = (<View style={AppStyle.MenuModalInner}>
				<Text style={AppStyle.MenuHeader}>{this.state.email}</Text>
				<TouchableOpacity onPress={() => this.newSurvey()} style={AppStyle.MenuModalButton}>
					<Text style={AppStyle.MenuModalButtonTxt}>{l18n.newsurvey}</Text>
				</TouchableOpacity>
				<TouchableOpacity onPress={() => this.surveyResults()} style={AppStyle.MenuModalButton}>
					<Text style={AppStyle.MenuModalButtonTxt}>{l18n.surveyresults}</Text>
				</TouchableOpacity>
				<TouchableOpacity onPress={() => this.sync()} style={AppStyle.MenuModalButton}>
					<Text style={AppStyle.MenuModalButtonTxt}>{l18n.syncmanual}</Text>
				</TouchableOpacity>
				<TouchableOpacity onPress={() => this.Logout()} style={AppStyle.MenuModalButtonLogout}>
					<Text style={AppStyle.MenuModalButtonTxt}>{l18n.logout}</Text>
				</TouchableOpacity></View>);
    return (
       <DrawerLayoutAndroid
      drawerWidth={300}
      ref={(_menudrawer) => this.menudrawer = _menudrawer}
      drawerPosition={DrawerLayoutAndroid.positions.Left}
      renderNavigationView={() => navigationView}>
      <View style={AppStyle.Main}>
      <StatusBar
		style={AppStyle.statusBar}
		barStyle="dark-content"
		/>
         <Modal
          animationType={"fade"}
          transparent={true}
          presentationStyle={"fullScreen"}
          visible={this.state.modalVisible}
          onRequestClose={() => { _goLoginActivity() }}
          >
          <View style={AppStyle.modal}>
          <View style={AppStyle.modalInner}>
            <Text style={AppStyle.modalTxt}>{this.state.modalTxt}</Text>
            <Button style={AppStyle.modalButton} onPress={() => { _goLoginActivity() }} title={l18n.ok} />
          </View></View>
        </Modal>
         <Modal
          animationType={"fade"}
          transparent={true}
          presentationStyle={"fullScreen"}
          visible={this.state.modalLoginVisible}
          onRequestClose={() => { _goLoginActivity() }}
          >
          <View style={AppStyle.modal}>
          <View style={AppStyle.modalInner}>        
			<TextInput style={AppStyle.LoginText} ref="1" onChangeText={(text) => this.loginFormState.login={text} } defaultValue={this.state.email} autoFocus={true} placeholder={l18n.plogin} returnKeyType="next" autoCorrect={false} onSubmitEditing={() => this.focusNextField('2')} />
			<TextInput style={AppStyle.LoginText} ref="2" onChangeText={(text) => this.loginFormState.password={text} } placeholder={l18n.ppassword} returnKeyType="done" secureTextEntry={true} autoCorrect={false} onSubmitEditing={() => this.doAuth()} />
			<Button
				  onPress={() => this.doAuth()}
				  title={l18n.login}
				/>
          </View></View>
        </Modal>
         <Modal
          animationType={"fade"}
          transparent={true}
          presentationStyle={"fullScreen"}
          visible={this.state.modalProgressVisible}
          onRequestClose={() => { _goLoginActivity() }}
          >
          <View style={AppStyle.modal}>
			<View style={AppStyle.modalInner}>
				<Text style={AppStyle.modalTxt}>{l18n.loading}</Text>
			</View>
          </View>
        </Modal>
         <Modal
          animationType={"fade"}
          transparent={true}
          presentationStyle={"fullScreen"}
          visible={this.state.modalNewSurvey}
          onRequestClose={() => { this.hideNewSurvey() }}
          >
          <View style={AppStyle.modal}>
			<View style={AppStyle.modalInner}>
				<Text style={AppStyle.modalTxt}>{l18n.startnew}</Text>
				<View style={AppStyle.modalButtons}>
					<TouchableOpacity onPress={() => this.doNewSurvey() } style={MainScreenStyles.NavBtn}>
						<Text style={MainScreenStyles.NavBtnTxtAlert}>{l18n.start}</Text>
					</TouchableOpacity>
					<TouchableOpacity onPress={() => this.hideNewSurvey() } style={MainScreenStyles.NavBtn}>
						<Text style={MainScreenStyles.NavBtnTxt}>{l18n.cancel}</Text>
					</TouchableOpacity>
				</View>			
			</View>
          </View>
        </Modal>
        {renderIf(this.state.mainVisible)(
		<View style={MainScreenStyles.MainView}>
			<View style={MainScreenStyles.NavView}>
				<TouchableOpacity onPress={() => this.ModalMenu('show')} style={MainScreenStyles.NavBtnMenu}>
					<Ionicons name="md-menu" size={32} color="black" />
				</TouchableOpacity>
				<Text style={MainScreenStyles.NavTitle}>{this.state.survey.title}</Text>
				{renderIf(this.state.syncProgress)(
				<Ionicons style={MainScreenStyles.NavSyncIcon} name={this.state.syncicon} size={32} color="white" />
				)}{renderIf(this.state.syncProgress)(<Text style={MainScreenStyles.NavSyncProgress}>{this.state.syncProgressPerc}</Text>)}{renderIf(this.state.surveyVisible)(
				<TouchableOpacity onPress={() => this.nextQuestion()} style={MainScreenStyles.NavBtnNext}>
					<Ionicons name="ios-arrow-dropright-circle" size={32} color="black" />
				</TouchableOpacity>)}{renderIf(this.state.resultVisible)(
				<TouchableOpacity onPress={() => this.shareSurveyResult()} style={MainScreenStyles.NavBtnNext}>
					<Ionicons name="md-share" size={32} color="black" />
				</TouchableOpacity>)}
			</View>
			{renderIf(this.state.surveyVisible)(
			<KeyboardAvoidingView behavior='padding' style = {{backgroundColor: 'white', flex: 1}}>
			<ScrollView style={MainScreenStyles.ScrollView}>
				<Slider disabled={true} minimumTrackTintColor={'black'} thumbTintColor={'white'} style={AppStyle.ProgressSlider} value={this.state.progressData.cur} minimumValue={0} maximumValue={this.state.progressData.total} step={1} />
				<Text style={MainScreenStyles.surveyTitle}>{this.state.survey.title}</Text><Text style={MainScreenStyles.surveyDescription}>{this.state.survey.description}</Text>
				{ this.state.q }
				{ this.state.qother }
			</ScrollView>
			</KeyboardAvoidingView>
			)}{renderIf(this.state.resultVisible)(
			<KeyboardAvoidingView behavior='padding' style = {{backgroundColor: 'white', flex: 1}}>
			<ScrollView style={MainScreenStyles.ScrollView}>
				<Text style={MainScreenStyles.surveyTitle}>{this.state.survey.title}</Text><Text style={MainScreenStyles.surveyDescription}>{this.state.survey.description}</Text>
				<WebView 
					automaticallyAdjustContentInsets={true} 
					injectedJavaScript='var t=false; function _rn_height() { if (t) { clearTimeout(t); t=false; }; if (window.postMessage.length !== 1) { t=setTimeout(_rn_height,500); } else { try { window.postMessage(parseInt(document.body.scrollHeight)); t=setTimeout(_rn_height,2000); } catch (e) { } } }; window.onLoad=_rn_height();' 
					onMessage={this.webViewMsg} 
                    scrollEnabled={false} 
                    source={{html: this.state.qother }}  
                    automaticallyAdjustContentInsets={true}
                    style={[AppStyle.webViewStyle, {height: this.state.webViewHeight }]}/>
			</ScrollView>
			</KeyboardAvoidingView>
			)}
		</View>
		)}

      </View>
      </DrawerLayoutAndroid>
    );
  }
}
