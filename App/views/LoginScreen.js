import React from 'react';
import {
  View,
  StyleSheet,
  TextInput,
  Button,
} from 'react-native';
import { StackNavigator, NavigationActions, } from 'react-navigation';
import l18n from '../localization/LoginScreen.js';


class LoginScreen extends React.Component {
  static navigationOptions = {
    title: l18n.title,
  };
  
  focusNextField = (nextField) => {
    this.refs[nextField].focus();
  };
  formState = {
		"login": false,
		"password": false
	  }
  doAuth = function () {
	  restapi.doLogin(this.formState.login.text, this.formState.password.text, 
		function(r) { this.doAuthSuccess(r); }.bind(this), 
		function(r) { this.doAuthError(r); }.bind(this));
  }
  doAuthSuccess = function (r) {
	  Sstorage.setToken(r['token']);
  }
  
  doAuthError = function (r) {
  }
  
  
  render() {
    return (
    <View style={LoginScreenStyles.container}>
    <TextInput style={LoginScreenStyles.textBtn} ref="1" onChangeText={(text) => this.formState.login={text}} autoFocus={true} placeholder={l18n.plogin} returnKeyType="next" autoCorrect={false} onSubmitEditing={() => this.focusNextField('2')} />
    <TextInput style={LoginScreenStyles.textBtn} ref="2" onChangeText={(text) => this.formState.password={text}} placeholder={l18n.ppassword} returnKeyType="done" secureTextEntry={true} autoCorrect={false} onSubmitEditing={() => this.doAuth()} />
    <Button
          onPress={() => this.doAuth()}
          title={l18n.login}
        />
     </View>
    );
  }
}

const LoginScreenStyles = StyleSheet.create({
	container: {
		padding: 20,
	},
	textBtn : {
		padding: 10,
	}
});



export default LoginScreen;
