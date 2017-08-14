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
	TextInput,
	StatusBar, 
	DrawerLayoutAndroid } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
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


  render() {
	  var navigationView = (<View style={AppStyle.MenuModalInner}>
				<TouchableOpacity onPress={() => clearDB()} style={AppStyle.MenuModalButton}>
					<Text style={AppStyle.MenuModalButtonTxt}>Clear DB</Text>
				</TouchableOpacity>
				<TouchableOpacity onPress={() => this.newSurvey()} style={AppStyle.MenuModalButton}>
					<Text style={AppStyle.MenuModalButtonTxt}>{l18n.newsurvey}</Text>
				</TouchableOpacity>
				<TouchableOpacity onPress={() => this.summary()} style={AppStyle.MenuModalButton}>
					<Text style={AppStyle.MenuModalButtonTxt}>{l18n.summary}</Text>
				</TouchableOpacity>
				<TouchableOpacity onPress={() => this.Logout()} style={AppStyle.MenuModalButton}>
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
		backgroundColor={Color.LightGreen}
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
				<TouchableOpacity onPress={() => this.nextQuestion()} style={MainScreenStyles.NavBtnNext}>
					<Ionicons name="ios-arrow-dropright-circle" size={32} color="black" />
				</TouchableOpacity>
			</View>
			<ScrollView style={MainScreenStyles.ScrollView}>
				<Text style={MainScreenStyles.surveyTitle}>{this.state.survey.title}</Text><Text style={MainScreenStyles.surveyDescription}>{this.state.survey.description}</Text>
				{ this.state.q }
				{ this.state.qother }
			</ScrollView>
		</View>
		)}

      </View>
      </DrawerLayoutAndroid>
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
		width: Dimensions.get('window').width,
		height: Dimensions.get('window').height,
		backgroundColor: Color.Black,
	},
	ScrollView: {
		backgroundColor: Color.White,
	},
	NavView: {
		flexDirection: 'row', 
		width: Dimensions.get('window').width, 
		backgroundColor: Color.LightGreen,
		shadowColor: '#000',
		shadowOffset: { width: 2, height: 2 },
		shadowOpacity: 0.8,
		shadowRadius: 2,
		elevation: 5,
	},
	NavTitle: {
		color: Color.White,
		fontSize: 20,
		paddingTop:15, 
	},
	NavBtnMenu: {
		width: 60,
		margin: 5, 
		padding: 10, 
		backgroundColor: Color.Transparent,
	},
	NavBtnMenuModal: {
		width: 60,
		margin: 5, 
		padding: 5, 
		backgroundColor: Color.Transparent,
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
		color: Color.White
	},
	NavBtn: {
		width: 100,
		margin: 5, 
		padding: 10, 
		borderRadius: 4, 
		borderWidth: 0.5, 
		borderColor: Color.Blue[900], 
		backgroundColor: Color.Blue,
	},
	NavBtnNext: {
		position: 'absolute',
		bottom: 15,
		right: 10,
		backgroundColor: Color.Transparent,
	},
	NavBtnTxt: {
		textAlign: 'center',
		color: Color.White
	},
	surveyTitle: {
		fontSize: 20,
		paddingTop: 5,
		paddingBottom: 5,
		paddingLeft: 10,
		paddingRight: 10,
		color: Color.Black,
	},
	surveyDescription: {
		fontSize: 15,
		paddingTop: 10,
		paddingBottom: 5,
		paddingLeft: 10,
		paddingRight: 10,
		lineHeight: 25,
		color: Color.Grey,
	},
	SurveyTextBtn : {
		padding: 10,
	}

});


const AppStyle = StyleSheet.create({
	Main: {
		width: Dimensions.get('window').width,
		height: Dimensions.get('window').height,
		backgroundColor: Color.Black,
	},
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Color.Gray,
    paddingTop: Constants.statusBarHeight,
  },
  MenuModal: {
	  backgroundColor: Color.Transparent,
  },
  MenuModalInner: {
		paddingTop: 50,
		backgroundColor: Color.Black, 
	},
	MenuModalButton: {
		padding: 5,
	},
	MenuModalButtonTxt: {
		padding: 10,
		textAlign: 'left',
		color: Color.White
	},
	MenuModalTxt: {
		padding: 5,
		textAlign: 'right',
		color: Color.White
	},
	modal: {
		backgroundColor: 'rgba(0, 0, 0, 0.5)',
		flex: 1,
		justifyContent: 'center',
		padding: 20,
	},
	modalInner: {
		backgroundColor: Color.White, 
		padding: 20,
		borderRadius: 10,
		alignItems: 'center',
	},
	modalButtons: {
		flexDirection: 'row', 
		justifyContent: 'center',
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
