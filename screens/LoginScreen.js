import * as React from 'react';
import {Text,StyleSheet,View,TextInput,TouchableOpacity,Alert,KeyboardAvoidingView,Image} from 'react-native';
import * as firebase from 'firebase';
import db from '../config';

export default class LoginScreen extends React.Component{
    constructor(){
        super();
        this.state={
            emailId:'',
            password:''
        }
    }

    login=async(email,password)=>{
        if(email && password ){
            try{
                const response=await firebase.auth().signInWithEmailAndPassword(email,password)
                if(response){
                    this.props.navigation.navigate('Transaction');
                }
            }
            catch(error){
                switch(error.code){
                    case 'auth/user-not-found':
                        Alert.alert('USER DOES NOT EXIST');
                        console.log('user does not exist');
                        break;
                    case 'auth/invalid-email':
                        Alert.alert('INCORRECT EMAIL OR PASSWORD');
                        console.log('incorrect email or password');
                        break;
                    default:break;
                }
            }
        }
        else{
            Alert.alert('ENTER EMAIL AND PASSWORD');
        }
    }

    render(){
        return(
            <KeyboardAvoidingView style={{alignItems:'center',marginTop:20}}>
                <View>
                    <Image source={
                        require('../assets/booklogo.jpg')}
                        style={{width:200,height:200}}
                    />
                    <Text style={{textAlign:'center',fontSize:30}}>WILY</Text>
                </View>
                <View>
                  <TextInput
                    placeholder='abc@example.com'
                    keyboardType='email-address'
                    style={styles.loginBox}
                    onChangeText={(text)=>{this.setState({emailId:text})}}
                    />
                  <TextInput
                    placeholder='enter password'
                    secureTextEntry={true}
                    style={styles.loginBox}
                    onChangeText={(text)=>{this.setState({password:text})}}
                    />
                </View>
                <View>
                    <TouchableOpacity style={styles.button}
                      onPress={()=>{
                        this.login(this.state.emailId,this.state.password);
                      }}
                    >
                       <Text style={{textAlign:'center'}}>LOGIN</Text>
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        )
    }
}

const styles=StyleSheet.create({
    loginBox:{
        width:300,
        height:40,
        borderWidth:1.5,
        fontSize:20,
        margin:10,
        paddingLeft:10
    },
    button:{
        height:30,
        width:90,
        borderWidth:1,
        marginTop:20,
        paddingTop:5,
        borderRadius:7
    }
})
