;(function(window) {
  /**
   * Add parameter to url search
   * for switch users groups
   *
   * Possible options:
   * https://examples.com?users=prod
   * https://examples.com?users=dev
   * https://examples.com - for qa by default
   */
  var usersQuery = _getQueryVar('users');

  var CONFIG = {
    debug: true,
    webrtc: {
      answerTimeInterval: 30,
      dialingTimeInterval: 5,
      disconnectTimeInterval: 30,
      statsReportTimeInterval: 5
    }
  };

  /**
   * QBAppDefault for qa and dev
   * QBAppProd for production
   appId: 43487,
    authKey: 'YBbj2eTUPBL8VJP',
    authSecret: 'X2kpWVMeK7bF3f6'
   */
  var QBAppProd = {
    appId: 43487,
    authKey: 'YBbj2eTUPBL8VJP',
    authSecret: 'X2kpWVMeK7bF3f6'
  },
  QBAppDefault = {
    appId: 28287,
    authKey: 'XydaWcf8OO9xhGT',
    authSecret: 'JZfqTspCvELAmnW'
  };

  /** set QBApp */
  var QBApp = usersQuery === 'qa' ? QBAppDefault : usersQuery === 'dev' ? QBAppDefault : QBAppProd;

  var QBUsersQA = [
    {
      id: 5395743,
      login: 'webuser111',
      password: 'webuser111',
      full_name: 'User 1',
      colour: 'FD8209'
    },
    {
      id: 5395747,
      login: 'webuser112',
      password: 'webuser112',
      full_name: 'User 2',
      colour: '11a209'
    },
    {
      id: 5681538,
      login: 'webuser113',
      password: 'webuser113',
      full_name: 'User 3',
      colour: '11a2a9'
    },
    {
      id: 5719859,
      login: 'webuser114',
      password: 'webuser114',
      full_name: 'User 4',
      colour: '51c209'
    },
    {
      id: 5719860,
      login: 'webuser115',
      password: 'webuser115',
      full_name: 'User 5',
      colour: '511209'
    },
    {
      id: 5719866,
      login: 'webuser116',
      password: 'webuser116',
      full_name: 'User 6',
      colour: '01e209'
    }
  ],
  QBUsersDev = [
    {
      id: 6970356,
      login: 'dev_user_1',
      password: 'dev_user_1',
      full_name: 'User 1',
      colour: 'ffaa00'
    },
    {
      id: 6970368,
      login: 'dev_user_2',
      password: 'dev_user_2',
      full_name: 'User 2',
      colour: '0890ff'
    },
    {
      id: 6970375,
      login: 'dev_user_3',
      password: 'dev_user_3',
      full_name: 'User 3',
      colour: 'ff03a6'
    },
    {
      id: 6970379,
      login: 'dev_user_4',
      password: 'dev_user_4',
      full_name: 'User 4',
      colour: '60e27a'
    }
  ],
  QBUsersProd = [
    
   /* {
      id: localStorage.quickblox_id,
      login: localStorage.quickblox_login,
      password: 'Doctordial1234',
      full_name: localStorage.quickblox_full_name,
      colour: 'C7B325'
    },*/ 
  /*  {  //enter doctor's detail here
      id: localStorage.quickblox_doctor_id,
      login: localStorage.quickblox_doctor_login,
      password: 'Doctordial1234',
      full_name: 'Dr. '+localStorage.quickblox_doctor_name,
      colour: 'BDA0CA'
    } */

     
     {  //enter doctor's detail here
      id: localStorage.quickblox_doctor_id,
      login: localStorage.quickblox_doctor_login,
      password: 'Doctordial1234',
      full_name: localStorage.quickblox_doctor_full_name,
      colour: 'BDA0CA'
    }
  ];


  /** set QBUsers */ 
  var QBUsers = usersQuery === 'qa' ? QBUsersQA : usersQuery === 'dev' ? QBUsersDev : QBUsersProd;

  var MESSAGES = {
    'login': '',
    'create_session': 'Creating a session...',
    'connect': 'Connecting...',
    'connect_error': 'Something is not working right. Check your internet connection and try again.',
    'login_as': 'Logged in as ',
    'title_login': 'Click your name below to continue:',
    'title_callee': 'Click on the name below once, then click on \'start call\':',
    'calling': 'Calling...',
    'webrtc_not_avaible': 'WebRTC is not available in your browser',
    'no_internet': 'Please check your Internet connection and try again'
  };

  /**
   * PRIVATE
   */
  /**
   * [_getQueryVar get value of key from search string of url]
   * @param  {[string]} q [name of query]
   * @return {[string]}   [value of query]
   */
  function _getQueryVar(q) {
    var query = window.location.search.substring(1),
        vars = query.split("&"),
        answ = false;

    vars.forEach(function(el, i){
      var pair = el.split('=');

      if(pair[0] === q) {
        answ = pair[1];
      }
    });

    return answ;
  }

  /**
   * set configuration variables in global
   */
  window.QBApp = QBApp;
  window.CONFIG = CONFIG;
  window.QBUsers = QBUsers;
  window.MESSAGES = MESSAGES;
}(window));
