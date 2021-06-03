import * as React from 'react';
import { Text, View,StyleSheet,TouchableOpacity, TextInput ,KeyboardAvoidingView ,Alert,ToastAndroid } from 'react-native';
import * as Permissions from 'expo-permissions';
import {BarCodeScanner} from 'expo-barcode-scanner';
import * as firebase from 'firebase';
import db from '../config';

export default class TransactionScreen extends React.Component {
    constructor(){
      super();
      this.state={
        hasCameraPermissions:null,
        scanned:false,
        scannedData:'',
        buttonState:'normal',
        scannedBookID:'',
        scannedStudentID:'',
        transactionMessage:''
      }
    }

    initiateBookIssue = async ()=>{
      //add a transaction
      db.collection("transaction").add({
        'studentId' : this.state.scannedStudentID,
        'bookId' : this.state.scannedBookID,
        'data' : firebase.firestore.Timestamp.now().toDate(),
        'transactionType' : "Issue"
      })
  
      //change book status
      db.collection("books").doc(this.state.scannedBookID).update({
        'bookAvailability' : false
      })
      //change number of issued books for student
      db.collection("students").doc(this.state.scannedStudentID).update({
        'numberOfBooksIssued' : firebase.firestore.FieldValue.increment(1)
      })
  
      this.setState({
        scannedStudentID : '',
        scannedBookID: ''
      })
    }

    initiateBookReturn = async ()=>{
      //add a transaction
      db.collection("transaction").add({
        'studentId' : this.state.scannedStudentID,
        'bookId' : this.state.scannedBookID,
        'data' : firebase.firestore.Timestamp.now().toDate(),
        'transactionType' : "Return"
      })
  
      //change book status
      db.collection("books").doc(this.state.scannedBookID).update({
        'bookAvailability' : true
      })
      //change number of issued books for student
      db.collection("students").doc(this.state.scannedStudentID).update({
        'numberOfBooksIssued' : firebase.firestore.FieldValue.increment(-1)
      })
  
      this.setState({
        scannedStudentID : '',
        scannedBookID: ''
      })
    }


    handleTransaction=async()=>{
      var transactionType= await this.checkBookEligibility();
      console.log("transaction type",transactionType);
      if(!transactionType){
        Alert.alert("The book does not exist in the library database!")
        this.setState({
          scannedStudentID:'',
          scannedBookID:''
        })
      }
      else if(transactionType === 'Issue'){
        var isStudentEligible= await this.checkStudentEligibilityForBookIssue();
        if(isStudentEligible){
          this.initiateBookIssue();
          Alert.alert("BOOK ISSUED TO THE STUDENT")
        }
        
      }
      else{
        var isStudentEligible= await this.checkStudentEligibilityForBookReturn();
        if(isStudentEligible){
          this.initiateBookReturn();
          Alert.alert("BOOK RETURNED TO THE LIBRARY")
        }
      }
    }

    checkStudentEligibilityForBookIssue=async()=>{
      const studentRef=await db.collection("students")
      .where("studentId","==",this.state.scannedStudentID).get();
      var isStudentEligible='';
      if(studentRef.docs.length==0){
        this.setState({
          scannedStudentID:'',
          scannedBookID:''
        })
        isStudentEligible=false;
        Alert.alert("STUDENT ID IS INVALID")
      }
      else{
        studentRef.docs.map(doc=>{
          var student=doc.data()
          if(student.noOfBooksIssued<2){
            isStudentEligible=true;
          }
          else{
            isStudentEligible=false;
            Alert.alert("LIMIT EXCEEDED! ISSUED 2 BOOKS")
            this.setState({
              scannedBookID:'',
              scannedStudentID:''
            })
          }
        })
      }
    
      return isStudentEligible;
    }

    checkStudentEligibilityForBookReturn=async()=>{
      const transactionRef = await db.collection("transactions")
      .where("bookId","==",this.state.scannedBookID).limit(1).get()
      var isStudentEligible='';
      transactionRef.docs.map(doc => {
        var lastBookTransaction = doc.data();
        if (lastBookTransaction.studentId === this.state.scannedStudentID) {
          isStudentEligible = true;
        } else {
          isStudentEligible = false;
          Alert.alert("The book wasn't issued by this student!");
          this.setState({
            scannedStudentID: "",
            scannedBookID: ""
          });
        }
      });
      return isStudentEligible;
    }

    checkBookEligibility=async()=>{
      const bookRef=await db.collection("books")
      .where("bookId","==",this.state.scannedBookID).get();
      var transactionType='';
      if(bookRef.docs.length==0){
        transactionType=false
      }
      else{
        bookRef.docs.map(doc=>{
        var book=doc.data();
        if(book.bookAvailability ){
          transactionType='Issue'
        }  
        else{
          transactionType='Return'
        }      
        })
      }
      return transactionType;
    }

    getCameraPermissions= async(id)=>{
      const {status}=await Permissions.askAsync(Permissions.CAMERA);
      this.setState({hasCameraPermissions:status==="granted",buttonState:'id',scanned:false});
    }

    handleBarCodeScanned=async({type,data})=>{
      const {buttonState}=this.state
        if(buttonState === 'BookId'){
          this.setState({scanned:true,scannedBookID:data,buttonState:'normal'})
        }
        else if(buttonState === 'StudentId'){
          this.setState({scanned:true,scannedStudentID:data,buttonState:'normal'})
        }
    }

    render() {
      const hasCameraPermissions=this.state.hasCameraPermissions;
      const scanned=this.state.scanned;
      const buttonState=this.state.buttonState;
      if(buttonState === 'clicked' && hasCameraPermissions){
        return(
          <BarCodeScanner
          onBarCodeScanned={scanned?
            undefined:
            this.handleBarCodeScanned
          }
          style={StyleSheet.absoluteFillObject}
           />
        )
      }
      else if(buttonState === 'normal'){

      return (
        <KeyboardAvoidingView style={styles.container}
        behaviour='padding' enabled>

          <View>
            <Image source={
              require('../assets/booklogo.jpg') }
              style={{width:200,height:200}}
            />
            <Text style={{textAlign:'center',fontSize:30}}>WILY</Text>
          </View>

          <View style={styles.inputView}>

            <TextInput style={styles.inputBox}
            placeholder='BOOK ID'
            onChangeText={text=>this.setState({scannedBookID:text})}
            value={this.state.scannedBookID}
            />
            <TouchableOpacity style={styles.scanButton}
             onPress={()=>{
               this.getCameraPermissions('BookId')
             }}>
              <Text style={styles.buttonText}>SCAN</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.inputView}>
            <TextInput style={styles.inputBox}
            placeholder='STUDENT ID'
            onChangeText={text=>this.setState({scannedStudentID:text})}
            value={this.state.scannedStudentID}
            />
            <TouchableOpacity style={styles.scanButton}
              onPress={()=>{
                this.getCameraPermissions('StudentId')
            }}>
              <Text style={styles.buttonText}>SCAN</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.submitButton}
              onPress={async()=>{
                var transactionMessage=this.handleTransaction();
                this.setState({scannedBookID:'',scannedStudentID:''})
              }}>
              <Text style={styles.submitButtonText}>SUBMIT</Text>
            </TouchableOpacity>
          </View>

        </KeyboardAvoidingView>

      );
     }
    }
  }

  const styles = StyleSheet.create({
    scanButton:{
      backgroundColor:'blue',
      width:50,
      borderWidth:1.5,
      borderLeftWidth:0
    },
    buttonText:{
      fontSize:18,
      textAlign:'center',
      marginTop:10
    },
    container:{
      flex:1,
      justifyContent:'center',
      alignItems:'center'
    },
    displayText:{
      fontSize:15,
      textDecorationLine:'underline'
    },
    inputView:{
      flexDirection:'row',
      margin:20
    },
    inputBox:{
      width:200,
      height:40,
      borderWidth:1.5,
      borderRightWidth:0,
      fontSize:20
    },
    submitButton:{
      backgroundColor:'green',
      width:100,
      height:50
    },
    submitButtonText:{
      textAlign:'center',
      fontSize:20,
      fontWeight:'bold',
      color:'#fff',
      padding:10
    }
  });