import React from 'react';
import {
  AppRegistry,
  Text,
  View,
  ToastAndroid,
  ListView,
  StyleSheet,
  TouchableHighlight,
  ScrollView,
} from 'react-native';
import { StackNavigator, NavigationActions, } from 'react-navigation';
import l18n from '../localization/MainScreen.js';


class MainScreen extends React.Component {
  static navigationOptions = {
    title: "SurveyManager",
  };

  
  constructor() {
    super();
    const ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
    this.state = {
      dataSource: ds.cloneWithRows([l18n.loading+'...']),
    };
  }

  doList = function () {
	/*restapi.doDomains(
		function(r) { 
			this.doListSuccess(r); }.bind(this), 
		function(r) { 
			this.doListError(r); }.bind(this)
		);*/
  }

  doListSuccess = function (r) {
	  var domains_list=new Array();
	  for (var i in r) {
		  domains_list[domains_list.length]=r[i]['http'];
	  }
		this.setState({
			dataSource: this.state.dataSource.cloneWithRows(domains_list),
		});
	  
  }
  doListError = function (r) {
	  // TODO better error handler
	  //ToastAndroid.show("ERROR:"+r, ToastAndroid.SHORT);
  }
 
	componentDidMount() {
		//this.doList();
	} 

  render() {
	const { navigate } = this.props.navigation;
    return (
      <View>
        <ListView
        dataSource={this.state.dataSource} 
        renderRow={(rowData) => <TouchableHighlight><Text style={styles.listviewitembig}>{rowData}</Text></TouchableHighlight>} 
        renderSeparator={(sectionId, rowId) => <View key={rowId} style={styles.separator} />}
      />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  listviewitembig: {
    flex: 1,
    paddingTop: 20,
    paddingBottom: 20,
    paddingLeft: 5,
    paddingRight: 5,
    fontSize: 19,
  },
  separator: {
    flex: 1,
    height: StyleSheet.hairlineWidth,
    backgroundColor: '#8E8E8E',
  },
});


export default MainScreen;
