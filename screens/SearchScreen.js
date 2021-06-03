import React from 'react';
import { Text, View ,FlatList,StyleSheet,TouchableOpacity,TextInput} from 'react-native';
import db from '../config';
import {ScrollView} from 'react-native-gesture-handler';

export default class Searchscreen extends React.Component {

  constructor(props){
    super(props);
    this.state={
      allTransactions:[],
      lastVisibleTransaction:null ,
      search:''

    }
  }

  componentDidMount=async()=>{
    const query=await db.collection("transactions").get()
    query.docs.map((doc)=>{
      this.setState({
        allTransactions:[...this.state.allTransactions,doc.data()]
      })
    })
  }
  fetchMoreTransactions=async()=>{
    var text=this.state.search.toUpperCase();
    var enteredText=text.split("")
  
    if(enteredText[0].toUpperCase()=== "B"){
      const transaction=await db.collection("transactions")
      .where('bookID','==',text).get()
      transaction.docs.map((doc)=>{
        this.setState({
          allTransactions:[...this.state.allTransactions,doc.data()],
          lastVisibleTransaction:doc
        })
      })
    }
    else if(enteredText[0].toUpperCase()=== "S"){
      const transaction=await db.collection("transactions")
      .where('studentID','==',text).get()
      transaction.docs.map((doc)=>{
        this.setState({
          allTransactions:[...this.state.allTransactions,doc.data()],
          lastVisibleTransaction:doc
        })
      })
    }
  }
searchTransactions=async(text)=>{
 
  var text=text.toUpperCase()
  var enteredText=text.split("")
  if(enteredText[0].toUpperCase()=== "B"){
    const transaction=await db.collection("transactions")
    .where('bookID','==',text).get()
    transaction.docs.map((doc)=>{
      this.setState({
        allTransactions:[...this.state.allTransactions,doc.data()],
        lastVisibleTransaction:doc
      })
    })
  }
  else if(enteredText[0].toUpperCase()=== "S"){
    const transaction=await db.collection("transactions")
    .where('studentID','==',text).get()
    transaction.docs.map((doc)=>{
      this.setState({
        allTransactions:[...this.state.allTransactions,doc.data()],
        lastVisibleTransaction:doc
      })
    })
  }
}
  

    render() {
      return (
        <View style={styles.container}>
        <View Style={styles.searchBar}>
          <TextInput
          style={styles.bar}
          placeholder="Enter Book ID or Student ID"
          onChangeText={(text)=>{this.setState({search:text})}}/>
          <TouchableOpacity
          style={styles.searchButton}
          onPress={()=>{this.searchTransactions(this.state.search)}}
          >
          <Text>Search</Text>
          </TouchableOpacity>
          </View>
        <FlatList data={this.state.allTransactions}
            renderItem={({item})=>(
         
           
                <View key={index} style={{borderBottomWidth:2}}>
                  <Text>{"Book Id:" + transaction.bookID}</Text>
                  <Text>{"Student Id:" +transaction.studentID} </Text>
                  <Text>{"Transaction Type:" +transaction.transactionType}</Text>
                  <Text>{"Date:"+ transaction.date.toDate()}</Text>
                </View>
                )}
              keyExtractor={(item,index)=>index.toString()}
              onEndReached={this.fetchMoreTransactions}
              onEndReachedThreshold={0.7}
        />
        </View>
              )
           
          }


      
  }
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      marginTop: 20
    },
    searchBar:{
      flexDirection:'row',
      height:40,
      width:'auto',
      borderWidth:0.5,
      alignItems:'center',
      backgroundColor:'grey',
  
    },
    bar:{
      borderWidth:2,
      height:30,
      width:300,
      paddingLeft:10,
    },
    searchButton:{
      borderWidth:1,
      height:30,
      width:50,
      alignItems:'center',
      justifyContent:'center',
      backgroundColor:'green'
    }
  })