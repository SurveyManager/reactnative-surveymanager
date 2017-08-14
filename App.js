import React from 'react';
import renderIf from './App/libs/renderif'
import { 
	AppRegistry, 
	View, 
	StyleSheet, 
	Dimensions, 
	AsyncStorage, 
	NetInfo, 
	Modal, 
	Button, 
	ScrollView,
	TouchableOpacity,
	Text, 
	TextInput, } from 'react-native';
import Color from 'react-native-material-color';
import { Constants } from 'expo';
import l18n from './App/localization/all.js';


var uuid = require('react-native-uuid');

var _storage = require('./App/models/SurveyStorage.js');
	Sstorage=new _storage();
	Sstorage.init({});
	
var _restapi = require('./App/models/restapi.js');
	restapi=new _restapi();
	restapi.init("https://survey.sovgvd.info/your-survey/API/");
	
var _manager = require('./App/models/Survey.js');
	survey = new _manager();
	survey.init({},Sstorage);

NetInfo.fetch().then( function (survey,t) {
	survey.networkChange(t);
}.bind(null, survey));

NetInfo.addEventListener(
  'change',
  function (survey, t) { survey.networkChange(t); }.bind(null, survey)
);

var thisActivity = false;

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



export default class App extends React.Component {
	static waitTimer = false;
  constructor() {
    super();
    this.state = {
		modalVisible: false, 
		modalLoginVisible: false, 
		mainVisible: false,
		modalProgressVisible: true,
		modalNewSurvey: false,
		modalMenu: false,
		modalTxt: "",
		survey: false,
		q: [],
		qother: []
	}
	thisActivity=this;
  }
  loginFormState = {
		"login": false,
		"password": false
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

doNewSurvey = function () {
	this.ModalMenu('hide');
	survey.surveyNew();
	this.hideNewSurvey();
}
hideNewSurvey = function () {
	this.setState({ modalNewSurvey: false });
}

  
  doAuth = function () {
	  this.setState({modalProgressVisible: true });
	  restapi.doAuth(this.loginFormState.login.text, this.loginFormState.password.text, 
		function(r) { this.doAuthSuccess(r); }.bind(this), 
		function(r) { this.doAuthError(r); }.bind(this));
  }
  doAuthSuccess = function (r) {
	  Sstorage.setToken(r);
	  this.doAfterAuthSuccess();
  }
  doAfterAuthSuccess = function () {
	  this.setState({ modalLoginVisible: false, modalProgressVisible: false });
	  this.doLoad();
  }
  
  doAuthError = function (r) {
	  this.setState({modalProgressVisible: false });
  }
  
  doLoad = function () {
	  this.setState({modalProgressVisible: true });
	  survey.getSurvey( function (r,e, other) {
			this.setState({ survey: r, q: e, qother: other,  mainVisible: true, modalProgressVisible: false, });
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
			}
		}.bind(this));
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
		} else {
			this.setState({ modalMenu: false, });
		}
	}
	Logout() {
		this.ModalMenu('hide');
		Sstorage.setToken("");
		switchToLoginActivity(false);
	}


  render() {
    return (
      <View>
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
            <Button style={AppStyle.modalButton} onPress={() => { _goLoginActivity() }} title="OK" />
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
			<TextInput style={LoginScreenStyles.textBtn} ref="1" onChangeText={(text) => this.loginFormState.login={text}} autoFocus={true} placeholder={l18n.plogin} returnKeyType="next" autoCorrect={false} onSubmitEditing={() => this.focusNextField('2')} />
			<TextInput style={LoginScreenStyles.textBtn} ref="2" onChangeText={(text) => this.loginFormState.password={text}} placeholder={l18n.ppassword} returnKeyType="done" secureTextEntry={true} autoCorrect={false} onSubmitEditing={() => this.doAuth()} />
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
				<Text style={AppStyle.modalTxt}>Loading. Please wait...</Text>
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
				<Text style={AppStyle.modalTxt}>Start new survey?</Text>
				<Button style={AppStyle.modalButton} onPress={() => { this.doNewSurvey() }} title="Start" />
				<Button style={AppStyle.modalButton} onPress={() => { this.hideNewSurvey() }} title="Cancel" />
			</View>
          </View>
        </Modal>
         <Modal style={AppStyle.MenuModal}
          animationType={"slide"}
          transparent={false}
          presentationStyle={"fullScreen"}
          visible={this.state.modalMenu}
          onRequestClose={() => { this.ModalMenu('hide') }}
          >
          <View style={AppStyle.MenuModal}>
			<View style={AppStyle.MenuModalInner}>
				<TouchableOpacity onPress={() => this.ModalMenu('hide') } style={AppStyle.MenuModalButton}>
					<Text style={AppStyle.MenuModalButtonTxt}>Hide menu modal</Text>
				</TouchableOpacity>
				<TouchableOpacity onPress={() => clearDB()} style={AppStyle.MenuModalButton}>
					<Text style={AppStyle.MenuModalButtonTxt}>Clear DB</Text>
				</TouchableOpacity>
				<TouchableOpacity onPress={() => this.newSurvey()} style={AppStyle.MenuModalButton}>
					<Text style={AppStyle.MenuModalButtonTxt}>New survey</Text>
				</TouchableOpacity>
				<TouchableOpacity onPress={() => this.Logout()} style={AppStyle.MenuModalButton}>
					<Text style={AppStyle.MenuModalButtonTxt}>Logout</Text>
				</TouchableOpacity>
			</View>
          </View>
        </Modal>
        {renderIf(this.state.mainVisible)(
		<View style={MainScreenStyles.MainView}>
			<View style={MainScreenStyles.NavView}>
				<TouchableOpacity onPress={() => this.ModalMenu('show')} style={MainScreenStyles.NavBtnAlert}>
					<Text style={MainScreenStyles.NavBtnTxtAlert}>Menu</Text>
				</TouchableOpacity>
				<TouchableOpacity onPress={() => this.nextQuestion()} style={MainScreenStyles.NavBtnNext}>
					<Text style={MainScreenStyles.NavBtnTxt}>Next</Text>
				</TouchableOpacity>
			</View>
			<ScrollView>
				<Text style={MainScreenStyles.surveyTitle}>{this.state.survey.title}</Text><Text style={MainScreenStyles.surveyDescription}>{this.state.survey.description}</Text>
				{ this.state.q }
				{ this.state.qother }
			</ScrollView>
		</View>
		)}

      </View>
    );
  }
}

const LoginScreenStyles = StyleSheet.create({
	container: {
		padding: 20,
	},
	textBtn : {
		width: 200,
		padding: 10,
	}
});

const MainScreenStyles = StyleSheet.create({
	MainView: {
		paddingTop: Constants.statusBarHeight,
		width: Dimensions.get('window').width
	},
	NavView: {
		flexDirection: 'row', 
		width: 180, 
	},
	NavBtnAlert: {
		width: 60,
		margin: 5, 
		padding: 10, 
		borderRadius: 4, 
		borderWidth: 0.5, 
		borderColor: Color.Red[900], 
		backgroundColor: Color.Red,
	},
	NavBtnTxtAlert: {
		textAlign: 'center',
		color: '#ffffff'
	},
	NavBtn: {
		width: 60,
		margin: 5, 
		padding: 10, 
		borderRadius: 4, 
		borderWidth: 0.5, 
		borderColor: Color.Green[900], 
		backgroundColor: Color.Green,
	},
	NavBtnNext: {
		width: 100,
		margin: 5, 
		padding: 10, 
		borderRadius: 4, 
		borderWidth: 0.5, 
		borderColor: Color.Green[900], 
		backgroundColor: Color.Green,
	},
	NavBtnTxt: {
		textAlign: 'center',
		color: '#000000'
	},
	surveyTitle: {
		fontSize: 20,
		paddingTop: 5,
		paddingBottom: 5,
		paddingLeft: 5,
		paddingRight: 5,
	},
	surveyDescription: {
		fontSize: 15,
		paddingTop: 10,
		paddingBottom: 5,
		paddingLeft: 5,
		paddingRight: 5,
		lineHeight: 25
	},
	SurveyTextBtn : {
		padding: 10,
	}

});


const AppStyle = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ecf0f1',
    paddingTop: Constants.statusBarHeight,
  },
  MenuModal: {
	  backgroundColor: '#000',
  },
  MenuModalInner: {
		backgroundColor: '#000', 
	},
	MenuModalButton: {
		padding: 5,
	},
	MenuModalButtonTxt: {
		padding: 10,
		textAlign: 'left',
		color: '#fff'
	},
	MenuModalTxt: {
		padding: 5,
		textAlign: 'right',
		color: '#fff'
	},
	modal: {
		backgroundColor: 'rgba(0, 0, 0, 0.5)',
		flex: 1,
		justifyContent: 'center',
		padding: 20,
	},
	modalInner: {
		backgroundColor: '#fff', 
		padding: 20,
		borderRadius: 10,
		alignItems: 'center',
	},
	modalButton: {
		margin: 10,
		width: 100,
	},
	modalTxt: {
		margin: 10,
	},

});
