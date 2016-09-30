// Initialize your app
var myApp = new Framework7(
{
	pushState: true,
	swipeBackPage: true,
	uniqueHistory: true,
	dynamicPageUrl: true,
	precompileTemplates: true,
	 template7Pages: true, //gotcha!
   // Hide and show indicator during ajax requests
   onAjaxStart: function (xhr) {
   	myApp.showIndicator();
   },
   onAjaxComplete: function (xhr) {
   	myApp.hideIndicator();
   }

});






// Export selectors engine
var $$ = Dom7;

// Add view
var mainView = myApp.addView('.view-main');







//for making calls



//its quite difficult to perform CRUD on quickblox, a lot of headache, so many unexpected behaviours. I'm now growing bald because of it.
//So, soon as that retrieval is succsseful, we upload the user's details to fireabse for easy CRUD next time we want to make a call.
//The two functions below help with that.

function findDoctorQuickbloxDetails(doctorUserID){

	//alert("Help findDoctorQuickbloxDetails running");
	//since user is only registered once on quickblox
	//during registeration, user's details would also be registered on firebase
	//so we simply get the quickblox details from the doctor's firebase profile 
	//then we save on on localStorage
	//we do this for every doctor the user chats up

	var quickbloxDoctorRef = new Firebase("https://doctordial.firebaseio.com/users/"+doctorUserID);
	quickbloxDoctorRef.once("value", function(snapshot){
		localStorage.quickblox_doctor_id = snapshot.val().quickblox_id;
		localStorage.quickblox_doctor_owner_id = snapshot.val().quickblox_owner_id ;
		localStorage.quickblox_doctor_full_name = snapshot.val().quickblox_full_name ;
		localStorage.quickblox_owner_email = snapshot.val().quickblox_email ;
		localStorage.quickblox_doctor_login = snapshot.val().quickblox_login ;

	});

}







//for date and time
var currentdate = new Date(); 
var todaysdate = "Now: " + currentdate.getDate() + "/"
+ (currentdate.getMonth()+1)  + "/" 
+ currentdate.getFullYear();
var currenttime =    currentdate.getHours() + ":"  
+ currentdate.getMinutes() + ":" 
+ currentdate.getSeconds();

//function to create anything
function createAnything(formData, childVar){
	var postsRef = new Firebase("https://doctordial.firebaseio.com/");

	ref = postsRef.child(childVar);

	    // we can also chain the two calls together
	    //postsRef.push(formData);
	    
		     // we can also chain the two calls together
		     ref.push().set(formData,
		     	function(error) {
		     		if (error) {
		  //  alert("Data could not be saved. :" + error,"Error");
		} else {
		    //alert("Data saved successfully.");
		}
	}
	);
		 }

				//function to create anything
				function updateAnything(formData, childVar){
					var postsRef = new Firebase("https://doctordial.firebaseio.com/");
					ref = postsRef.child(childVar);
					ref.update(formData,   function(error) {
						if (error) {
							myApp.alert("Data could not be saved. :" + error,"Error");
						} else {
				    //myApp.alert("Update successful.","Updated");
				}
			});
				}



//create account
function createUserAccount(formData){
	var ref = new Firebase("https://doctordial.firebaseio.com/users");
	ref.once("value", function(data) {
            // do some stuff once
        });
	
	ref.createUser(formData,
		function(error, userData) {
			if (error) {
				myApp.alert("Error creating account:"+error.message, error);
			} else {
    //alert("Successfully created user account with uid:", userData.uid);
    //log user in and create user profile at  /users
    loginFire(formData.email, formData.password);

    		//create user profile
			// we would probably save a profile when we register new users on our site
			// we could also read the profile to see if it's null
			// here we will just simulate this with an isNewUser boolean
			var isNewUser = true;
			ref.onAuth(function(authData) {
				if (authData && isNewUser) {
			    // save the user's profile into the database so we can list users,
			    // use them in Security and Firebase Rules, and show profiles
			    ref.child(authData.uid).set({
			    	provider: authData.provider,
			      name: getName(authData) //the first part of the users email
			  });
			    
			    //update the user's data to carry the rest of the data
			    var hopperRef = ref.child(authData.uid);
			    hopperRef.update(formData);
			}
		});
			// find a suitable name based on the meta info given by each provider
			function getName(authData) {
				switch(authData.provider) {
					case 'password':
					return authData.password.email.replace(/@.*/, '');
					case 'twitter':
					return authData.twitter.displayName;
					case 'facebook':
					return authData.facebook.displayName;
				}
			}


			myApp.alert("Successfully created account. Please login","Registration Successful");
			localStorage.setItem(formData);
			console.log("Login successful now closing modal");
    myApp.closeModal(); // open Login Screen//load another page with auth form
}
});

}

		//handle login
		function loginFire(sentEmail,sentPassword){ //get this login from database 
			var ref = new Firebase("https://doctordial.firebaseio.com");
			
			ref.authWithPassword({
				email    : sentEmail,
				password : sentPassword
			}, function(error, authData) {
				if (error) {
					switch (error.code) {
						case "INVALID_EMAIL":
						myApp.alert("The specified user account email is invalid.","Error");
						break;
						case "INVALID_PASSWORD":
						myApp.alert("The specified user account password is incorrect.","Error");
						break;
						case "INVALID_USER":
						myApp.alert("The specified user account does not exist.","Error");
						break;
						default:
						myApp.alert("Error logging user in:", error);
					}
		    return false; //required to prevent default router action
		} else {
		  	//save data in local storage
		  	localStorage.doctordial_email = sentEmail;
		  	localStorage.email = sentEmail;
		  	

		  	var ref = new Firebase("https://doctordial.firebaseio.com/users");

		  	ref.orderByChild('email').equalTo(sentEmail).on("child_added", function(snapshot){
		  		
		  		localStorage.doctordial_user_id = snapshot.key();

		  		if(snapshot.val().firstname){
		  			localStorage.firstname = snapshot.val().firstname || ' ' ;	
		  		}else{
		  			localStorage.firstname = '';
		  		}
		  		if(snapshot.val().middlename){
		  			localStorage.middlename = snapshot.val().middlename || ' ' ;
		  		}else{
		  			localStorage.middlename = '';
		  		}
		  		if(snapshot.val().lastname){
		  			localStorage.lastname = snapshot.val().lastname  || ' ';
		  		}else{
		  			localStorage.lastname = '';
		  		}
		  		localStorage.full_name = snapshot.val().firstname + ' '+ snapshot.val().middlename + ' '+ snapshot.val().lastname ;

		  	localStorage.doctordial_profile_id = snapshot.key(); // save the profile id (the second user id)
		  	//get personal doctor's details
		  	if(snapshot.val().personal_doctor_id != null){
		  		var personalDoctorRef = new Firebase("https://doctordial.firebaseio.com/users/"+snapshot.val().personal_doctor_id);
		  		personalDoctorRef.once("value", function(snapshot){
		  			localStorage.personal_doctor_name = snapshot.val().firstname ;

		  		});
		  	}
		  	
		  });
		  	
		  	
		  	
		  	personalDocNameInsert(); //
		  	myApp.alert("Login successful ", 'Success!');
		       myApp.closeModal('.login-screen'); //closelogin screen
		       myApp.closeModal();
		       mainView.router.loadPage("index.html");
		   }
		});

		}

		//messages log

		if(typeof localStorage.quickblox_id === "undefined" && typeof  localStorage.doctordial_user_id !== "undefined"){


			myApp.alert("Please follow the link in the next page to activate your call account.", "Alert");



		}










		function checkCaller(){

		if(typeof localStorage.doctordial_user_id !== "undefined"){ //if the user is logged in
			//if caller isnt on quickblox, redirect to page to signup
			if(typeof localStorage.quickblox_id == "undefined"){ //the person doesnt have their quickbox details saved on device
				mainView.router.loadPage("messages_call_settings.html");
			}
			
			//if caller is on quickblox, but callee is not, post warning message
			//if both are on quickblox, catch fun with the calls
		}

	}

	checkCaller();

	$$('.demo-progressbar-load-hide .button').on('click', function () {
		var container = $$('.demo-progressbar-load-hide p:first-child');
    if (container.children('.progressbar').length) return; //don't run all this if there is a current progressbar loading

    myApp.showProgressbar(container, 0);

    // Simluate Loading Something
    var progress = 0;
    function simulateLoading() {
    	setTimeout(function () {
    		var progressBefore = progress;
    		progress += Math.random() * 20;
    		myApp.setProgressbar(container, progress);
    		if (progressBefore < 100) {
                simulateLoading(); //keep "loading"
            }
            else myApp.hideProgressbar(container); //hide
        }, Math.random() * 200 + 200);
    }
    simulateLoading();
});











	function changeEmail(){
		var ref = new Firebase("https://doctordial.firebaseio.com");
		ref.changeEmail({
			oldEmail : "bobtony@firebase.com",
			newEmail : "bobtony@google.com",
			password : "correcthorsebatterystaple"
		}, function(error) {
			if (error === null) {
				console.log("Email changed successfully");
			} else {
				console.log("Error changing email:", error);
			}
		});
	}

	function changePassword(){
		var ref = new Firebase("https://doctordial.firebaseio.com");
		ref.changePassword({
			email       : "bobtony@firebase.com",
			oldPassword : "correcthorsebatterystaple",
			newPassword : "neatsupersecurenewpassword"
		}, function(error) {
			if (error === null) {
				console.log("Password changed successfully");
			} else {
				console.log("Error changing password:", error);
			}
		});
	}

	function sendPasswordResetEmail(recoveryEmail){ 
		//You can edit the content of the password reset email from the Login & Auth tab of your App Dashboard.
		var ref = new Firebase("https://doctordial.firebaseio.com");
		ref.resetPassword({
			email : recoveryEmail
		}, function(error) {
			if (error === null) {
				myApp.alert("Password reset email sent successfully");
			} else {
				myApp.alert("Error sending password reset email:", error);
			}
		});
	}

	function deleteUser(){
		var ref = new Firebase("https://doctordial.firebaseio.com");
		ref.removeUser({
			email    : "bobtony@firebase.com",
			password : "correcthorsebatterystaple"
		}, function(error) {
			if (error === null) {
				console.log("User removed successfully");
			} else {
				console.log("Error removing user:", error);
			}
		});
	}

		// Create a callback which logs the current auth state
		function checkLoggedIn(authData) {
			if (localStorage.doctordial_user_id != null) {

		       myApp.closeModal(); //closelogin screen
		   } else {
					myApp.loginScreen(); // open Login Screen if user is not logged in
				}
			}
		// Register the callback to be fired every time auth state changes
		var ref = new Firebase("https://doctordial.firebaseio.com");
		ref.onAuth(checkLoggedIn);

		  //recover email
		  $$('.recovery-button').on('click', function () {
		  	var email = $$('input[name="recoveryEmail"]').val();
		  	sendPasswordResetEmail(email);
		  });

		  

			$$('.list-button').on('click', function () { //signup
			   // var email = pageContainer.find('input[name="email"]').val();
			    var formData = myApp.formToJSON('#signupForm'); //convert submitted form to json.

			  createUserAccount(formData); //do the registration and report errors if found
			  

			});

		       //run login function
			//messages must be initialized here
			$$('.login-button').on('click', function () {

				var email = $$('input[name="loginemail"]').val();
				var password = $$('input[name="loginpassword"]').val();
				loginFire(email, password);

			});  


		  //schedule appointment
		  function createScheduleAppointment(){
		  	var formData = myApp.formToJSON('#scheduleAppointmentFormSubmit'); //convert submitted form to json.

		  	createAnything(formData, "appointments_schedule_list"); //do the registration and report errors if found

		  	myApp.alert("Appointment Scheduled", "Success");
		  	mainView.router.loadPage("appointments_schedule_list.html");
		  }





		  function logoutUser(){
	//myApp.alert("You are loging out", "Logout");
	var ref = new Firebase("https://doctordial.firebaseio.com");

		          	  ref.unauth(); //logout
		          	  localStorage.removeItem("user_id");
		          	  localStorage.removeItem("email");
		          	  localStorage.removeItem("personal_doctor_id");

                       //users quickblox details
                       localStorage.removeItem("quickblox_id");
                       localStorage.removeItem("quickblox_login");
                       localStorage.removeItem("quickblox_email");
                       localStorage.removeItem("quickblox_full_name");

		          	  //quickblox doctor to call details
		          	  localStorage.removeItem("quickblox_doctor_id");
		          	  localStorage.removeItem("quickblox_doctor_email");
		          	  localStorage.removeItem("quickblox_doctor_login");
		          	  localStorage.removeItem("quickblox_doctor_full_name");
		          	 myApp.loginScreen(); // open Login Screen if user is not logged in 
		          	}
		          	function logoutPop(message){
		          		if(typeof message === "undefined"){
		          			message('Are you sure you wish to logout?');
		          		}   

		          		myApp.modal({

		          			title: message,
		          			text: '<div class="list-block"></div>',
		          			buttons: [
		          			{
		          				text: 'ok',
		          				onClick: function() {
		          					logoutUser();
		          				}
		          			},
								    /*  {
								        text: 'cancel',
								        bold: true,
								        
								    },*/
								    ]

								});
		          	}

		          	if(typeof localStorage.doctordial_user_id === "undefined" || localStorage.doctordial_user_id === "undefined"){

		          		logoutUser();
		          	}	

// Generate dynamic page
var dynamicPageIndex = 0;
function createContentPage() {
	mainView.router.loadContent(
		'<!-- Top Navbar-->' +
		'<div class="navbar">' +
		'  <div class="navbar-inner">' +
		'    <div class="left"><a href="#" class="back link"><i class="icon icon-back"></i><span>Back</span></a></div>' +
		'    <div class="center sliding">Dynamic Page ' + (++dynamicPageIndex) + '</div>' +
		'  </div>' +
		'</div>' +
		'<div class="pages">' +
		'  <!-- Page, data-page contains page name-->' +
		'  <div data-page="dynamic-pages" class="page">' +
		'    <!-- Scrollable page content-->' +
		'    <div class="page-content">' +
		'      <div class="content-block">' +
		'        <div class="content-block-inner">' +
		'          <p>Here is a dynamic page created on ' + new Date() + ' !</p>' +
		'          <p>Go <a href="#" class="back">back</a> or go to <a href="services.html">Services</a>.</p>' +
		'        </div>' +
		'      </div>' +
		'    </div>' +
		'  </div>' +
		'</div>'
		);
	return;
}

	// Callbacks to run specific code for specific pages, for example for About page:




	function deleteItem(linkBink){
		var refD = new Firebase("https://doctordial.firebaseio.com/"+linkBink);
		var onComplete = function(error) {
			if (error) {
				console.log('Synchronization failed');
			} else {
				console.log('Synchronization succeeded');
			}
		};
		refD.remove();
	}




	function approveSchedule(appointmentId, acceptedValue, schedule_user_id, schedule_doctor_id){

	         //if its not accepted yet
	         //if the viewer is not the one that scheduled it
	         if(localStorage.doctordial_user_id != schedule_user_id && acceptedValue != "yes"){ 
	         	myApp.confirm('Do you approve this appointment request?', 'Manage Approval', 
	         		function () {
	         			formData = {
	         				accepted: "yes"
	         			}
	         			updateAnything(formData,"appountments_schedule_list/"+appointmentId);
	         			mainView.router.loadPage("users_view.html?id="+schedule_user_id);
	         		},
	         		function () {
		        //choose cancel button, nothing happens
		        //optionally,
		        //redirect to this users profile
		        mainView.router.loadPage("users_view.html?id="+schedule_user_id);
		    });


		    //if the owner of this is view it. 
		    if(localStorage.doctordial_user_id == schedule_user_id){
		    	mainView.router.loadPage("users_view.html?id="+schedule_doctor_id+"&fullname=JohnLennon");
		    }
	      }else if(localStorage.doctordial_user_id == schedule_user_id){ //give the user the option to cancle or delete this appointment

	      	myApp.modal({
	      		title:  'Manage Appointment',
	      		text: 'Use the options below to manage this appointment',
	      		buttons: [

	      		{
	      			text: 'View',
	      			onClick: function() {
				          //if this is doctor, then view patient's profile
				          //If patient then view doctor's profile
				          mainView.router.loadPage("");
				      }
				  },{
				  	text: 'Delete',
				  	onClick: function() {

				  		var linkBink = "appointments_schedule_list/"+appointmentId;

				  		deleteItem(linkBink);


				  		myApp.alert("This appointment has been successfully deleted", "Deleted");
				  	}
				  },
				  {
				  	text: 'Cancel',
				  	onClick: function() {
				          //nothing happens when you cancel
				      }
				  }
				  ]
				});


	      }
	      
	  }








	  myApp.onPageInit('specializations_list', function (page) {

	  	var mySearchbar = myApp.searchbar('.searchbar', {
	  		searchList: '.list-block-search',
	  		searchIn: '.item-title'
	  	}); 

//dummy function I used to create new stuff
$$("#addAccount").on('click', function () {
   // var email = pageContainer.find('input[name="email"]').val();
    var formData = myApp.formToJSON('#addNew'); //convert submitted form to json.
    formData.user_id = localStorage.doctordial_user_id;
  createAnything(formData, "specializations"); //do the registration and report errors if found

});


var messageList = $$('.specialization-list-block');


  //get the list from database
  var ref = new Firebase("https://doctordial.firebaseio.com/specializations");
		// Attach an asynchronous callback to read the data at our posts reference
		//var specializations;
		
		
		
		ref.limitToLast(50).on("child_added", function(snapshot) {
			var data = snapshot.val();
		   //specializations = JSON.stringify(snapshot.val());
					//doctors list
					
					var name = data.name || "anonymous";
					var message = data.description;
			    var specs_id = snapshot.key(); //get the id

			    //CREATE ELEMENTS MESSAGE & SANITIZE TEXT
             // myApp.alert(JSON.stringify(snapshot.val()));
			    //ADD MESSAGE


			    messageList.append('<li style="border: 1px solid #88868c; color: black; border-radius: 5px; background: white;">'+
			    	'<a href="doctors_list.html?id='+specs_id+'&categoryname='+name+'" class="item-link item-content">'+
			    	'<div class="item-media color-teal" style="font-size:20px;"> <i class="fa fa-caret-right" aria-hidden="true" style="font-size: 30px;"></i> </div>'+
			    	'<div class="item-inner">'+
			    	'<div class="item-title-row">'+
			    	'<div class="item-title" style="font-weight: bold !important;" >'+name+'</div>'+
			    	'</div>'+
			    	'<div class="item-text">'+message+'</div>'+
			    	'</div>'+
			    	'</a>'+
			    	'</li>');





			}, function (errorObject) {
				console.log("The read failed: " + errorObject.code);
			});
		
		

	});










	  function shortMonthName(monthNumber){
	  	var month = [];
	  	month[0] = "Jan";
	  	month[1] = "Feb";
	  	month[2] = "Mar";
	  	month[3] = "Apr";
	  	month[4] = "May";
	  	month[5] = "Jun";
	  	month[6] = "Jul";
	  	month[7] = "Aug";
	  	month[8] = "Sep";
	  	month[9] = "Oct";
	  	month[10] = "Nov";
	  	month[11] = "Dec";
	  	n = month[monthNumber];
	  	return n;
	  }




	  myApp.onPageInit('appointments_schedule_list', function (page) {

	  	var mySearchbar = myApp.searchbar('.searchbar', {
	  		searchList: '.list-block-search',
	  		searchIn: '.item-title'
	  	}); 


	  //get the list from database
	  var ref = new Firebase("https://doctordial.firebaseio.com/appointments_schedule_list");
		// Attach an asynchronous callback to read the data at our posts reference
		//var specializations;
		
		var messageList = $$('.appointment-list-block'); 
		
		ref.orderByChild("user_id").startAt(localStorage.doctordial_user_id).endAt(localStorage.doctordial_user_id).limitToLast(50).on("child_added", function(snapshot) {
			data = snapshot.val(); 
		     specs_id = snapshot.key(); //get the id
		     
					//get todays date
					function getTodayDate() {
						var tdate = new Date();
					   var dd = tdate.getDate(); //yields day
					   var MM = tdate.getMonth(); //yields month
					   var yyyy = tdate.getFullYear(); //yields year
					   var xxx = (shortMonthName(MM)) +" "+ dd + " " + yyyy;

					   return xxx; //Jun 13 2012
					}
					if(getTodayDate() == data.day){//it
						
					}


					messageList.append('<a href="#" style="background-color: white; color: black; border: 1px solid #7e7e7e;" class="item-link item-content" onclick="approveSchedule(specs_id, data.accepted,data.user_id,data.doctor_id);">'+
						'<div class="item-inner">'+
						'<div class="item-title-row">'+
						'<div class="item-title color-teal" ><i class="fa fa-clock-o" aria-hidden="true"></i> '+data.day+'</div>'+
						'<div class="item-after"  > '+data.start_time+'</div>'+
						'</div>'+
						'<div class="item-text">approval: '+data.accepted+'</div>'+
						'</div>'+
						'</a>');
					
					
					//our aim is to divide the time difference into snaps of 15 minutes each,
					var diff = new Date("Aug 08 2012 9:30") - new Date("Aug 08 2012 5:30"); 
					diff_time = diff/(60*1000);



		       //convert time to seconds and simply add the two seconds
		       function getTimeAsSeconds(time){ 
		       	var timeArray = time.split(':');
		       	return Number(timeArray [0]) * 3600 + Number(timeArray [1]) * 60 + Number(timeArray[2]);
		       }

				//convert seconds back to time
				function formatSeconds(seconds)
				{
					var date = new Date(1970,0,1);
					date.setSeconds(seconds);
					return date.toTimeString().replace(/.*(\d{2}:\d{2}:\d{2}).*/, "$1");
				}
				
				
				
				

			}, function (errorObject) {
				console.log("The read failed: " + errorObject.code);
			});


	});



	  function viewPersonalDoc(){
      if(localStorage.personal_doctor_id != null){ //if personal doctor is another doctor
     // myApp.alert("Local Storage: "+localStorage.personal_doctor_id);
     mainView.router.loadPage("doctors_view.html?id="+localStorage.personal_doctor_id);
 } else if(localStorage.personal_doctor_id == null){

			//redirect to doctor categories
			myApp.confirm('You have not added a personal doctor yet. Would you like to add one now?','Add doctor', 
				function () {
					mainView.router.loadPage("specializations_list.html");
				},
				function () {

			       // updateAnything();
			   }
			   );
		}
	}


function personalDocNameInsert(){ //insert personal doctor's name into the button on index'
$$('.user-name').html('<i class="fa fa-user" aria-hidden="true" style="font-size: 30px;"></i> ' + localStorage.full_name);
if(localStorage.personal_doctor_name != null){
	var docName = String(localStorage.personal_doctor_name);
	$$('.personal-doctor-name').html('Dr. '+docName.replace('undefined',''));
}

}



		//if the user email is not set, ask user to login again
		if(typeof localStorage.email === "undefined" || localStorage.email == null){
			
			logoutPop("Sorry, you have to log in again");
		} 





		

		function pullCalendar(calendarId,dayNumber){
			var calendarEvents = myApp.calendar({
				input: '#calendar-events'+calendarId,
				dateFormat: 'M dd yyyy',
				closeOnSelect: true,
				    //Disabled all dates in November 2015
				    disabled: function (date) {
				    	if (date.getDay() !== dayNumber) {
				    		return true;
				    	}
				    	else {
				    		return false;
				    	}
				    },
				});
		}


   	//dummy function I used to create new category of doctors
   	function addAppointmentSchedule() {
			   // var email = pageContainer.find('input[name="email"]').val();
			    var formData = myApp.formToJSON('#addNewAppointmentSchedule'); //convert submitted form to json.
			    
			    //convert days to numbers
			    if(formData.day === "Sunday"){
			    	formData.dayNumber = 0;
			    }
			    else if(formData.day === "Monday"){
			    	formData.dayNumber = 1;
			    }
			    else if(formData.day === "Tuesday"){
			    	formData.dayNumber = 2;
			    }
			    else if(formData.day === "Wednesday"){
			    	formData.dayNumber = 3;
			    }
			    else if(formData.day === "Thursday"){
			    	formData.dayNumber = 4;
			    }
			    else if(formData.day === "Friday"){
			    	formData.dayNumber = 5;
			    }
			    else if(formData.day === "Saturday"){
			    	formData.dayNumber = 6;
			    }
			    formData.user_id = localStorage.doctordial_user_id;
			  createAnything(formData, "appointments"); //do the registration and report errors if found

			}





			myApp.onPageInit('users_view', function (page) {
				
				$$('.open-about').on('click', function () {
					myApp.popup('.popup-about');
				});

				$$('.open-services').on('click', function () {
					myApp.popup('.popup-services');
				});   

				
				
				
				if(typeof page.query.id === "undefined"){
					page.query.id = localStorage.doctordial_user_id;
				}

				if(page.query.id == localStorage.doctordial_user_id){

					$$('.menuList').prepend('<a href="users_edit.html" class="link button open-popup">'+
						'<i class="fa fa-pencil-square-o" aria-hidden="true"> </i>&nbsp;Edit Profile&nbsp;  </a>');
				}


				var ref = new Firebase("https://doctordial.firebaseio.com/users/"+page.query.id);


				ref.once("value", function(snapshot) {

					data = snapshot.val();

					$$('#profile-name').html(' '+data.firstname);

			//if(data.firstname){
				
				$$('.profile-details').append('<li class="item-content">'+
					'<div class="item-inner">'+
					'<div class="item-title"><i class="fa fa-user" aria-hidden="true"></i> <strong>First Name:</strong> '+data.firstname+'</div>'+
					'</div>'+
					'</li>'
					);

					     //   }
					     if(data.middlename != null){
					     	$$('.profile-details').append('<li class="item-content">'+
					     		'<div class="item-inner">'+
					     		'<div class="item-title"><i class="fa fa-user" aria-hidden="true"></i>  <b>Middle Name: </b>'+data.middlename+'</div>'+
					     		'</div>'+
					     		'</li>'
					     		);
					     }
					     if(data.lastname != null){
					     	$$('.profile-details').append('<li class="item-content">'+
					     		'<div class="item-inner">'+
					     		'<div class="item-title"><i class="fa fa-user" aria-hidden="true"></i>  <b>Last Name:</b> '+data.lastname+'</div>'+
					     		'</div>'+
					     		'</li>'
					     		);

					     }
					     if(data.gender != null){
					     	$$('.profile-details').append('<li class="item-content">'+
					     		'<div class="item-inner">'+
					     		'<div class="item-title"><i class="fa fa-user" aria-hidden="true"></i> <b>Gender:</b> '+data.gender+'</div>'+
					     		'</div>'+
					     		'</li>'
					     		);

					     }

					     if(data.bloodgroup != null){
					     	$$('.profile-details').append('<li class="item-content">'+
					     		'<div class="item-inner">'+
					     		'<div class="item-title"><i class="fa fa-universal-access" aria-hidden="true"></i> <b>Blood Group:</b> '+data.bloodgroup+'</div>'+
					     		'</div>'+
					     		'</li>'
					     		);

					     }


					     if(data.bloodsugar != null){
					     	$$('.profile-details').append('<li class="item-content">'+
					     		'<div class="item-inner">'+
					     		'<div class="item-title"><i class="fa fa-object-group" aria-hidden="true"></i> <b>Blood Sugar:</b> '+data.bloodsugar+'</div>'+
					     		'</div>'+
					     		'</li>'
					     		);

					     }

					     if(data.allergies != null){
					     	$$('.profile-details').append('<li class="item-content">'+
					     		'<div class="item-inner">'+
					     		'<div class="item-title"><i class="fa fa-crosshairs" aria-hidden="true"></i> <b>Allergies:</b> '+data.allergies+'</div>'+
					     		'</div>'+
					     		'</li>'
					     		);

					     }


					     if(page.query.id !== localStorage.doctordial_user_id){
					     	$$('.contactButtons').html('<p class="buttons-row">'+
					     		'<a href="messages_view.html?id={{url_query.id}}&fullname='+data.firstname+'" class="link button button-fill color-red">'+
					     		'<i class="fa fa-comment-o" aria-hidden="true"></i> Chat</a>'+
					     		'<a href="#" class="link button button-fill color-red"><i class="fa fa-phone" aria-hidden="true"></i> Call</a>'+
					     		'</p>');
					     }

					 });



			});




//change the text on homepage
function manageHomePageText(){


	//search firebase using this person opponent id and get the fullname
	var newUserlogRef = new Firebase('https://doctordial.firebaseio.com/users/'+localStorage.doctordial_profile_id);
	newUserlogRef.once("value", function(snapshotuser) {


		var dataMessagesLog = snapshotuser.val();
		var firstname = dataMessagesLog.firstname;
		var lastname = dataMessagesLog.lastname;
		name = firstname + ' ' + lastname;

                    if(typeof dataMessagesLog.doctors === "undefined"){ //if this is a doctor
                    	$$('.nameOfChat').html('My Doctors');
                    }else{
                    	$$('.nameOfChat').html('My Patients');
                    }
                });
}
manageHomePageText();







var today = new Date();
var weekLater = new Date().setDate(today.getDate() + 7);

var calendarDisabled = myApp.calendar({
	input: '#calendar-disabled',
	scrollToInput: true,
	inputReadOnly: true,
	dateFormat: 'M dd yyyy',
	disabled: function (date) {
		if (date.getDay() != 3) {
			return true;
		}
		else {
			return false;
		}
	} 
});

		//our aim is to divide the time difference into snaps of 15 minutes each,
		function differenceInHours(){
			var diff = new Date("Aug 08 2012 9:30") - new Date("Aug 08 2012 4:30"); 
			diff_time = diff/(60*60*1000);

			return(diff_time);
		}



               //convert time to seconds

		      function getTimeAsSeconds(time){  //convert time to seconds and simply add the two seconds
		      	var timeArray = time.split(':');
		      	return Number(timeArray [0]) * 3600 + Number(timeArray [1]) * 60 + Number(timeArray[2]);
		      }
				//convert seconds back to time
				function formatSeconds(seconds){
					var date = new Date(1970,0,1);
					date.setSeconds(seconds);
					return date.toTimeString().replace(/.*(\d{2}:\d{2}:\d{2}).*/, "$1");
				}
				
				


function setSchedule(doctor_id, appointment_starttime, appointment_endtime){ //
	
	myApp.confirm('Are you sure?', 
		function () {
			myApp.alert('You clicked Ok button');
		},
		function () {
			myApp.alert('You clicked Cancel button');
		}
		);
}

function timeTo12HrFormat(time)
{   // Take a time in 24 hour format and format it in 12 hour format
	var time_part_array = time.split(":");
	var ampm = 'AM';

	if (time_part_array[0] >= 12) {
		ampm = 'PM';
	}

	if (time_part_array[0] > 12) {
		time_part_array[0] = time_part_array[0] - 12;
	}

	var time2 = time_part_array[2] || '';
	formatted_time = time_part_array[0] + ':' + time_part_array[1] + ':' + time2 + ' ' + ampm;

	return formatted_time;
}








myApp.onPageInit('doctors_view', function (page) {
	
	 //dont show the add button if this is the viewer's personal doc
	 if(localStorage.personal_doctor_id != null && localStorage.personal_doctor_id == page.query.id){
		   //hide button
		   $$('.add-personal-doctor').hide();

		}
		

		if(localStorage.doctordial_profile_id !== page.query.id){
         	//retrieve this doctors full profile details

	//find the personal doctor of this viewer
	var ref = new Firebase("https://doctordial.firebaseio.com/users/"+page.query.id);
	
	//check if this user already has a personal doctor
	ref.once("value", function(snapshot) {
		var dataDoc = snapshot.val();

            //save these doctor's quickblox details on this user's phone for later use
            if(typeof dataDoc.quickblox_id !== "undefined"){
            	localStorage.quickblox_doctor_id =  dataDoc.quickblox_id;
            	localStorage.quickblox_doctor_login =  dataDoc.quickblox_login;
            	localStorage.quickblox_doctor_full_name =  dataDoc.quickblox_full_name;
            	localStorage.quickblox_doctor_owner_id =  dataDoc.quickblox_owner_id;
            }
            
        });
}else{
	$$('.hideThisButton').hide();
}








if(localStorage.doctordial_profile_id != page.query.id){

//add doctor button on index page. 
$$('.add-personal-doctor').on('click', function () {
			//redirect to doctor categories
			myApp.confirm('Would you like to set this doctor as your personal doctor? This will replace your current personal doctor','Add Peronsal Doctor', 
				function () {
			      //yes
			      
			      var formData = {personal_doctor_id: page.query.id};
			      
			      updateAnything(formData, "users/"+localStorage.doctordial_profile_id); //update this user's record and add personal doctor
			      
			      localStorage.personal_doctor_id = page.query.id;
			      $$('.add-personal-doctor').hide();
			  },
			  function () {

			  }
			  );

		});		

//add doctor button on index page. 
$$('.change-personal-doctor').on('click', function () {
			//redirect to doctor categories
			myApp.confirm('Would you like choose another personal doctor? This will delete your current personal doctor setings','Add Peronsal Doctor', 
				function () {
			      //yes
			      localStorage.removeItem("personal_doctor_id");
			      $$('.add-personal-doctor').show();
			      mainView.router.loadPage("specializations_list.html");
			      //myApp.alert("Doctor added successfully");
			  },
			  function () {

			       // updateAnything();
			   }
			   );

		});


	//find the personal doctor of this viewer
	var ref = new Firebase("https://doctordial.firebaseio.com/users/"+localStorage.doctordial_profile_id);
	
	//check if this user already has a personal doctor
	ref.once("value", function(snapshot) {


		  if(snapshot.val().personal_doctor_id != null){ //hide the personal doctor button
		  	


		  	$( ".add-personal-doctor" ).attr({
		  		class: "color-gray"
		  	});

				$$('.add-personal-doctor').hide(); //attempt to hide it completely
			}else{
					  	//show button
					  	$$('.add-personal-doctor').on('click', function () {
					  		myApp.confirm('Are you sure you want to make this doctor your personal doctor?','Please Confirm', 
					  			function () {

					  				var personalDoc = {
					  					personal_doctor_id: page.query.id
					  				}
					  				updateAnything(personalDoc, "users/"+localStorage.doctordial_profile_id);

				        localStorage.personal_doctor_id = page.query.id; // save it
				        
				       $$('.add-personal-doctor').hide(); //hide the button 
				       
				   },
				   function () {

				       // updateAnything();
				   }
				   );
					  	});
					  }
					});



}			



	  //get the list from database
	  var ref = new Firebase("https://doctordial.firebaseio.com/appointments");
		// Attach an asynchronous callback to read the data at our posts reference
		//var specializations;
		var messageList = $$('.appointment-list-block');
		
		var totalCalendarCount = 0;
		ref.orderByChild("user_id").startAt(page.query.id).endAt(page.query.id).limitToLast(50).on("child_added", function(snapshot) {
			
			
			totalCalendarCount += 1;
			var data = snapshot.val();
		   //specializations = JSON.stringify(snapshot.val());
				//doctors list
			    var specs_id = snapshot.key(); //get the id

			    messageList.append('<form id="scheduleAppointmentFormSubmit"><div class="list-block accordion-list" style="border: 1px solid #7a8b74;">'+
			    	'<ul>'+
			    	'<li class="accordion-item"><a href="#" class="item-content item-link">'+
			    	'<div class="item-inner" style="background-color: 1px solid #eceeed !important">'+
			    	'<div class="item-title">'+
			    	'<i class="fa fa-plus-square" aria-hidden="true"></i> '+data.day+'s '+timeTo12HrFormat(data.starttime)+' - '+timeTo12HrFormat(data.endtime)+'</div>'+
			    	'</div></a>'+
			    	'<div class="accordion-item-content">'+
			    	'<div class="content-block">'+
			    	'<p>'+
			    	'<div class="list-block">'+
			    	'<ul>'+
			    	'<li>'+
			    	'<div class="item-content">'+
			    	'<div class="item-inner">'+
			    	'<div class="item-input" style="color: black !important;">'+
			    	'<input type="text" style="border: 1px solid #797580; color: black !important; padding-left: 10px;" name="day" placeholder="Doubletap here to select date" readonly id="calendar-events'+totalCalendarCount+'" onclick="pullCalendar('+totalCalendarCount+','+data.dayNumber+')">'+
			    	'<input type="text" style="border: 1px solid #797580; color: black !important;" name="start_time"  value="'+timeTo12HrFormat(data.starttime)+'" placeholder="Time" readonly id="calendar-events'+data.starttime+'" disabled>'+
			    	'<input type="hidden" name="user_id" value="'+localStorage.doctordial_user_id+'">'+
			    	'<input type="hidden" name="doctor_id" value="'+page.query.id+'">'+
			    	'<input type="hidden" name="accepted" value="pending" placeholder="The doctor needs to accept this" >'+
			    	'<div class="row">'+
			    	'<div class="col-50">'+
			    	'<a href="#" class="button button-big button-red button-fill hideThisButton" onclick="createScheduleAppointment()" id="scheduleAppointmentSubmitButton">Submit</a>'+
			    	'</div></div>'+
			    	'</div>'+
			    	'</div>'+
			    	'</div>'+
			    	'</li>'+
			    	'</ul>'+
			    	'</div>'+ 
			    	'</p>'+
			    	'</div>'+
			    	'</div>'+
			    	'</li>'+
			    	'</ul>'+
			    	'</div></form>');






			}, function (errorObject) {
				console.log("The read failed: " + errorObject.code);
			});



		var refUser = new Firebase("https://doctordial.firebaseio.com/users/"+localStorage.doctordial_profile_id);

		refUser.on("value", function(snapshot) {


					  if(snapshot.val().doctors != null){ //check if this user is a doctor
					  	//myApp.alert("This is a doctor");
					  	$$('.addNewAppointment').html('<h4>What times of the week are you usually free?</h4>'+
					  		'<form id="addNewAppointmentSchedule" class="list-block">'+
					  		' <ul>'+
					  		'<li>'+
					  		'<div class="item-content">'+
					  		' <div class="item-inner">'+
					  		' <div class="item-title label"><i class="fa fa-wpforms" aria-hidden="true"></i> Choose Weekday</div>'+
					  		' <div class="item-input">'+
					  		'  <input type="text" name="name" >'+
					  		' <div class="item-input">'+
					  		'  <select name="day">'+
					  		'  <option value="Monday">Monday</option>'+
					  		'  <option value="Tuesday">Tuesday</option>'+
					  		'  <option value="Wednesday">Wednesday</option>'+
					  		'  <option value="Thursday">Thursday</option>'+
					  		'  <option value="Friday">Friday</option>'+
					  		'  <option value="Saturday">Saturday</option>'+
					  		'  <option value="Sunday">Sunday</option>'+
					  		'</select>'+
					  		' </div>'+
					  		' </div>'+
					  		'</div>'+
					  		'</div>'+
					  		' </li>'+
					  		' <li>'+
					  		' <div class="item-content">'+
					  		'  <div class="item-inner">'+
					  		'<div class="item-title label"><i class="fa fa-wpforms " aria-hidden="true"></i> Start Time</div>'+
					  		' <div class="item-input">'+
					  		'<input type="text" name="starttime" placeholder="Start Time" class="timepicker">'+
					  		'</div>'+
					  		' </div>'+
					  		' </div>'+
					  		'</li>'+
					  		'<li>'+
					  		' <div class="item-content">'+
					  		'<div class="item-inner">'+
					  		'<div class="item-title label"><i class="fa fa-wpforms" aria-hidden="true"></i> End Time</div>'+
					  		'<div class="item-input">'+
					  		'<input type="text" name="endtime" placeholder="End Time"class="timepicker">'+
					  		'</div>'+
					  		'</div>'+
					  		'</div>'+
					  		'</li>'+
					  		'</ul>'+
					  		'</form>'+
					  		'<div class="content-block">'+
					  		'<a href="#" onclick="addAppointmentSchedule()" class="button button-fill">Add</a>'+
					  		'</div>');

					  }
					  
					}, function (errorObject) {
						console.log("The read failed: " + errorObject.code);
					});


	});



function decideQuickbloxPage(){
//if this doctor does not have a quickblox account and this user is logged int
if((typeof localStorage.quickblox_doctor_id === "undefined" || localStorage.quickblox_doctor_id === "undefined") && typeof localStorage.doctordial_user_id != "undefined"){
	myApp.alert("Sorry, this person cannot make or receive calls because they have not activated their call account yet.",'Alert');
						mainView.router.back(); //return to previous page
					}

						   //if this user is logged in but does not have a quickblox account
					if(typeof localStorage.doctordial_user_id !== "undefined"  && typeof localStorage.quickblox_id === "undefined"){ //this user does not have a quickblox account

			           //  myApp.alert("Please use the button below to activate your call account", "Info");

			           myApp.modal({
			           	title:  'Alert',
			           	text: 'Please use the button below to activate your call account',
			           	verticalButtons: true,
			           	buttons: [
			           	{
			           		text: 'continue',
			           		onClick: function() {
			           			mainView.router.loadPage("messages_call_settings.html");
			           		}
			           	}
			           	]
			           })

			       }
			   }

			   myApp.onPageInit('messages_call_view', function (page) {


//update user's details to this user's firebase
//this will reduce multiple 
if(typeof localStorage.quickblox_id !== "undefined" && localStorage.doctordial_quickblox_id !== "undefined"){

	formData = {
		"quickblox_id" : localStorage.quickblox_id,
		"quickblox_login" : localStorage.quickblox_login,
		"quickblox_email" : localStorage.quickblox_login,
		"quickblox_owner_id" : localStorage.quickblox_owner_id
	}

	var postsRef = new Firebase("https://doctordial.firebaseio.com/users/"+localStorage.doctordial_profile_id);

	postsRef.update(formData,   function(error) {
		if (error) {

                //alert("Data could not be saved. :" + JSON.stringify(error),"Error");
            } else {
               // alert("Update successful.","Updated :"+user.login);
               // alert(JSON.stringify(user));
           }
       });

	localStorage.doctordial_quickblox_updated = "yes";
}


mainView.router.refreshPage() ;

decideQuickbloxPage();
		   // findDoctorQuickbloxDetails(page.query.doctorUserID);
		//if the other user's detail is not saved here, means the other user is not on quickblox


	});

			   myApp.onPageInit('messages_call_settings', function (page) {

			   	mainView.router.refreshPreviousPage();
   // findDoctorQuickbloxDetails(page.query.doctorUserID);
//if the other user's detail is not saved here, means the other user is not on quickblox

});





			   myApp.onPageInit('doctors_list', function (page) {
   //var page = e.detail.page;
  // alert(page.query.categoryname);
  var mySearchbar = myApp.searchbar('.searchbar', {
  	searchList: '.list-block-search',
  	searchIn: '.item-title'
  }); 

/*
//dummy function I used to create new category of doctors
  $("#addAccountDoctor").on('click', function () {
   // var email = pageContainer.find('input[name="email"]').val();
    var formData = myApp.formToJSON('#addNewDoctor'); //convert submitted form to json.
  if(formData != null){
  	  updateAnything(formData, "users/"+formData.user_id+"/doctors"); //do the registration and report errors if found
  } 

 
}); */


  //get the list from database
  var ref = new Firebase("https://doctordial.firebaseio.com/users");
		// Attach an asynchronous callback to read the data at our posts reference
		var specializations;
		var messageList = $$('.doctors-list-block');
		
		
		  //find list of doctors in this specialization . page.query.id is the query received from the incoming page GET request
		 // myApp.alert("Dave");
		 ref.orderByChild("doctors").on("child_added", function(snapshot) {
			  //myApp.alert("Dave"+snapshot.val().doctors.specialization_id);

		//ref.limitToLast(50).on("child_added", function(snapshot) {
			var data = snapshot.val();
			var email = data.email || "anonymous";
			var message = data.specialization_id;
			    var specs_id = snapshot.key(); //get the id
			    var about = snapshot.val().about || '';
			    var gender = snapshot.val().gender || '';
			    var city = snapshot.val().city || '';
			    var state = snapshot.val().state || '';
			    var title = snapshot.val().doctors.title || '';
			    var firstname = snapshot.val().firstname || '';
			    var middlename = snapshot.val().middlename || '';
			    var lastname = snapshot.val().lastname || '';
			    var fullname = title+' '+firstname+' '+middlename+' '+lastname;
			    


			    //list doctors in this category except this viewer's profile
			    if(data.doctors.specialization_id == page.query.id){



			    	messageList.append('<li style="border: 1px solid #88868c; color: black; border-radius: 5px; background: white;">'+
			    		'<a href="doctors_view.html?id='+snapshot.key()+'&fullname='+fullname+'&about='+about+'&gender='+data.gender+'&fullname='+fullname+'" class="item-link item-content" data-context-name="doctor-card" class="item-link item-content">'+
			    		'<div class="item-media" width="20%"> <img src="img/doctor1.jpg" /> </div>'+
			    		'<div class="item-inner">'+
			    		'<div class="item-title-row">'+
			    		'<div class="item-title" style="font-weight: bold !important;" > '+title+' '+fullname+'</div>'+
			    		'</div>'+
			    		'<div class="item-text">'+gender+'  '+city+'  '+state+'</div>'+
			    		'</div>'+
			    		'</a>'+
			    		'</li>');

			    }





			}, function (errorObject) {
				console.log("The read failed: " + errorObject.code);
			});





		});




			   myApp.onPageInit('complaints_list', function (page) {
  //create new coomplaint
  $$('.create-complaint-modal').on('click', function () {
  	
  	myApp.modal({
  		title:  'Type your health complaint below',
  		text: '<div class="list-block" ><ul><li class="align-top"><form id="addComplaintForm"> <div class="item-content"><div class="item-inner"><div class="item-input">'+
  		'<input type="text" name="title" placeholder="Title" style="border: 1px solid #9fa39a; border-radius: 3px; "/> <br/><textarea name="text" placeholder="Symptoms" style="border: 1px solid #9fa39a; border-radius: 3px;"></textarea>'+
  		'<input type="hidden" value="'+currenttime+'" name="time" hidden />'+
  		'<input type="hidden" value="'+todaysdate+'" name="date" hidden />'+
  		'<input type="hidden" value="'+localStorage.doctordial_user_id+'" name="user_id" hidden />'+
  		'</div> </div> </div> </form> </li> </ul> </div>',
  		buttons: [
  		{
  			text: 'submit',
  			onClick: function() {
			   // var email = pageContainer.find('input[name="email"]').val();
			    var formData = myApp.formToJSON('#addComplaintForm'); //convert submitted form to json.
			    createAnything(formData, "complaints"); //do the registration and report errors if found

			}
		},
		{
			text: 'cancel',
			bold: true,
			onClick: function() {
        //  myApp.alert('You clicked third button!')
    }
},
]
})
  });
  
  
  var mySearchbar = myApp.searchbar('.searchbar', {
  	searchList: '.list-block-search',
  	searchIn: '.item-title'
  }); 

  //get the list from database
  var ref = new Firebase("https://doctordial.firebaseio.com/complaints");
		// Attach an asynchronous callback to read the data at our posts reference
		var messageList = $$('.specialization-list-block');
		
		
		
		var announcementDiv = $$('.announcementDiv');
		
		announcementDiv.html('<li style="background-color: white; color: black;">'+
			'<a href="#" class="link create-complaint-modal color-gray">'+
			'<div class="item-inner">'+
			'<div class="item-title">&nbsp; &nbsp; <i class="fa fa-meh-o" aria-hidden="true"></i> <i>None yet </i></div>'+
			'</div>'+
			'</div>'+
			'</li>');

		
		
		
		
		ref.orderByChild("user_id").startAt(localStorage.doctordial_user_id).endAt(localStorage.doctordial_user_id).limitToFirst(50).on("child_added", function(snapshot) {
			
			announcementDiv.hide();
			var data = snapshot.val();
		   //specializations = JSON.stringify(snapshot.val());
					//doctors list
					
					var title = data.title || "anonymous";
					var message = data.text;
			    var specs_id = snapshot.key(); //get the id

			    //CREATE ELEMENTS MESSAGE & SANITIZE TEXT
			    //ADD MESSAGE
			    
			    //shorten Text
			    function truncateString(str, length) {
			    	return str.length > length ? str.substring(0, length - 3) + '...' : str
			    }



			    messageList.append('<li style="border: 1px solid #88868c; color: black; background-color: white; border-radius: 5px;">'+
			    	'<a href="complaints_view.html?id='+specs_id+'&title='+truncateString(title, 25)+'"  class="item-link item-content">'+
			    	'<div class="item-media"> <i class="fa fa-commenting-o color-red " aria-hidden="true" style="font-size: 30px;"></i> </div>'+
			    	'<div class="item-inner">'+
			    	'<div class="item-title-row">'+
			    	'<div class="item-title" style="font-weight: bold !important;" >'+truncateString(title, 140)+'</div>'+
			    	'</div>'+
			    	'<div class="item-subtitle">'+truncateString(message, 140)+'</div>'+
			    	'</div>'+
			    	'</a>'+
			    	'</li>');




			}, function (errorObject) {
				console.log("The read failed: " + errorObject.code);
			});
		
		

	});


			   myApp.onPageInit('complaints_view', function(page) {




// Conversation flag
var conversationStarted = false;

try{
	var myMessages = myApp.messages('.messages', {
		autoLayout:true
	});
}catch(err1){
	alert("As you can see: "+err1.message);
}

var myMessagebar = myApp.messagebar('.messagebar', {
	maxHeight: 150
});  

// Do something here when page loaded and initialized
	//var scrolled = 0;
			  // CREATE A REFERENCE TO FIREBASE
			  var messagesRef = new Firebase('https://doctordial.firebaseio.com/complaints');


               //find this message, 
               var thismessage = messagesRef.child(page.query.id);
               thismessage.once("value", function(snapshot) {
				// attach it as the first message
				   //GET DATA

				   var data = snapshot.val();
				   var username = data.name || "anonymous";
				   var message = "<b>"+data.title+"</b> <br/> "+data.text;

			    if(localStorage.doctordial_user_id == data.user_id){ //if this is the sender
			    	var messageType = 'sent';
			    }else{
			    	var messageType = 'received';
			    }
			    var day = data.day;
			    var time = data.time;
			    
			    //CREATE ELEMENTS MESSAGE & SANITIZE TEXT
			    try{
			    	myMessages.addMessage({
				    // Message text
				    text: message,
				    // Random message type
				    type: messageType,
				    // Avatar and name:
				    //avatar: avatar,
				    //name: name,
				    // Day
				    day: !conversationStarted ? 'Today' : false,
				    time: !conversationStarted ? (new Date()).getHours() + ':' + (new Date()).getMinutes() : false
				});
			    }catch(err){
					//alert("got the error"+err);
				}

			});


			  // REGISTER DOM ELEMENTS
			  var messageField = $$('#messageInput');
			  var nameField = $$('#nameInput');
			  var messageList = $$('.messages');
			  var sendMessageButton = $$('#sendMessageButton');

				// Init Messagebar
				var myMessagebar = myApp.messagebar('.messagebar');

				// Handle message
				$$('.messagebar .link').on('click', function () {
					
				  // Message text
				  var messageText = myMessagebar.value().trim();
				  // Exit if empy message
				  if (messageText.length === 0) return;

				  // Empty messagebar
				  myMessagebar.clear()

				  
				  var name = nameField.val(); 
				 //SAVE DATA TO FIREBASE AND EMPTY FIELD
			     // messagesRef.push({name:name, text:messageText});
				  // Avatar and name for received message
				 // var avatar;



				 var complaintReply = messagesRef.child(page.query.id+"/complaint_replies");
				  // Add message
				  complaintReply.push({
				  	//userid
				  	user_id: localStorage.doctordial_user_id, 
				  	receiver_user_id: page.query.id,
				    // Message text
				    text: messageText,
				    complaint_id: page.query.id,
				    // Random message type
				    // Avatar and name:
				    //avatar: avatar,
				   // name: name,
				    // Day
				    day: !conversationStarted ? 'Today' : false,
				    time: !conversationStarted ? (new Date()).getHours() + ':' + (new Date()).getMinutes() : false
				})
				  

				  // Update conversation flag
				  conversationStarted = true;
				});                


			  // Add a callback that is triggered for each chat message. .child("receiver_user_id")equalTo(page.query.id)
			  //messagesRef.orderByChild("personal_doctor_id").equalTo(page.query.id).limitToLast(20).on('child_added', function (snapshot) {
			  	var replyMessage = messagesRef.child(page.query.id+"/complaint_replies");
			  	replyMessage.on('child_added', function (snapshot) {
			    //GET DATA
			    var data = snapshot.val();
			    var username = data.title || "anonymous";
			    var message = data.text;
			    
			    if(localStorage.doctordial_user_id == data.user_id){ //if this is the sender
			    	var messageType = 'sent';
			    }else{
			    	var messageType = 'received';
			    }
			    var day = data.day;
			    var time = data.time;
			    
			    

			    //CREATE ELEMENTS MESSAGE & SANITIZE TEXT


			    try{
			    	myMessages.addMessage({

				    // Message text
				    text: message,
				    // Random message type
				    type: messageType,
				    // Avatar and name:
				    //avatar: avatar,
				    //name: name,
				    // Day
				    day: !conversationStarted ? 'Today' : false,
				    time: !conversationStarted ? (new Date()).getHours() + ':' + (new Date()).getMinutes() : false
				});
			    }catch(err){
					//alert("got the error"+err);
				}

			});

			  });



$$('.googleLogin').click(function(e){
	var provider = new firebase.auth.GoogleAuthProvider();
	provider.addScope('https://www.googleapis.com/auth/plus.login');

	firebase.auth().signInWithPopup(provider).then(function(result) {
  // This gives you a Google Access Token. You can use it to access the Google API.
  var token = result.credential.accessToken;
  // The signed-in user info.
  var user = result.user;

 //createAnything(user, "users");
//createUserAccount(user);

var postsRef = new Firebase("https://doctordial.firebaseio.com/");

ref = postsRef.child("users/"+user.uid);

	    // we can also chain the two calls together
	    //postsRef.push(formData);
	    
		     // we can also chain the two calls together
		     var fullNameOfUser = user.displayName.split(" ");
		     var formData = {
		     	uid: user.uid,
		     	email: user.email,
		     	displayname: user.displayName,
		     	firstname : fullNameOfUser[0],
		     	lastname : fullNameOfUser[1],
		     	photo : user.photoURL,
		     }
		     ref.set(formData,
		     	function(error) {
		     		if (error) {
		  //  alert("Data could not be saved. :" + error,"Error");
		} else {
		    //alert("Data saved successfully.");
		}
	});

		     localStorage.doctordial_email = user.email;
		     localStorage.email = user.email;
		     localStorage.doctordial_user_id = user.email;
		     localStorage.fullname = user.displayName;
	myApp.closeModal(); // open Login Screen//load another page with auth form

	console.log(user);
  // ...
}).catch(function(error) {
  // Handle Errors here.
  var errorCode = error.code;
  var errorMessage = error.message;
  // The email of the user's account used.
  var email = error.email;
  // The firebase.auth.AuthCredential type that was used.
  var credential = error.credential;

  console.log(errorMessage);
  // ...
});


});





function updateUserProfileButton(){
	var formData = myApp.formToJSON('#users-edit-form'); //convert submitted form to json.

			  updateAnything(formData, "users/"+localStorage.doctordial_profile_id); //do the registration and report errors if found
			  
			  myApp.alert("Profile Update Successful", "Successful");
			  // Go back on main View
			  mainView.router.back();
			}




			function getPictureFromGallery(){

				navigator.camera.getPicture(onSuccess, onFail, { 
					destinationType: Camera.DestinationType.FILE_URI,
					sourceType : Camera.PictureSourceType.CAMERA,
					saveToPhotoAlbum: true,
					allowEdit: true,
					quality: 100,
					correctOrientation: true,

				});


			}

			function uploadPicture(){

				navigator.camera.getPicture(onSuccess, onFail, { 
					destinationType: Camera.DestinationType.FILE_URI,
					sourceType : Camera.PictureSourceType.CAMERA,
					saveToPhotoAlbum: true,
					allowEdit: true,
					quality: 100,
					correctOrientation: true,

				});


			}




			function onSuccess(imageData) {
				var image = document.getElementById('myImage');
				image.src=  imageData;


var file = imageData; //useless idiot like me :) 

// Create the file metadata
var metadata = {
	contentType: 'image/jpeg'
};


var fileName = url.substring(url.lastIndexOf('/')+1); //get name of file from file path
// Create a root reference
myApp.alert("File Name: "+ fileName);

var storageRef = firebase.storage().ref();
// Upload file and metadata to the object 'images/mountains.jpg'
var uploadTask = storageRef.child('images/' + fileName).put(file, metadata);

myApp.alert("Upload Task: "+ uploadTask);
// Listen for state changes, errors, and completion of the upload.
uploadTask.on(firebase.storage.TaskEvent.STATE_CHANGED, // or 'state_changed'
	function(snapshot) {
    // Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
    var progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
    alert('Upload is ' + progress + '% done');
    switch (snapshot.state) {
      case firebase.storage.TaskState.PAUSED: // or 'paused'
      console.log('Upload is paused');
      break;
      case firebase.storage.TaskState.RUNNING: // or 'running'
      console.log('Upload is running');
      break;
  }
}, function(error) {
	switch (error.code) {
		case 'storage/unauthorized':
      // User doesn't have permission to access the object
      alert("Storage unauthorized");
      break;

      case 'storage/canceled':
      // User canceled the upload
      alert("Error: storage/canceled");
      break;

      case 'storage/unknown':
      // Unknown error occurred, inspect error.serverResponse
      alert("Error: storage/unknown");
      break;
  }
}, function() {
  // Upload completed successfully, now we can get the download URL
  var downloadURL = uploadTask.snapshot.downloadURL;
});










}
function onFail(message) {
//alert('Failed because: ' + message);
setTimeout(function(){
	navigator.notification.alert(message);
}, 0);
}














myApp.onPageInit('messages_log', function(page) {



	var messageList = $$('.messageslog-list-block');

	var messageslogRef = new Firebase('https://doctordial.firebaseio.com/messageslog/'+localStorage.doctordial_profile_id);




    //find a message log where this user is the sender and update it
    messageslogRef.orderByChild('time').on("child_added", function(snapshot) {


    	otherUserId = snapshot.key(); 
                 //alert("User ID: "+ otherUserId + " Localstorage: " + localStorage.doctordial_profile_id);
               	  //search firebase using this person opponent id and get the fullname

               	  var newUserlogRef = new Firebase('https://doctordial.firebaseio.com/users/'+otherUserId);

               	  newUserlogRef.once("value", function(snapshotuser) {

               	  	var dataMessagesLog = snapshotuser.val();
               	  	var firstname = dataMessagesLog.firstname;
               	  	var lastname = dataMessagesLog.lastname;
               	  	otherName = firstname + ' ' + lastname;

                   manageHomePageText(); //change text on top of page to "My Patients" or "My Doctors"




                   var datetime =  currentdate.getDate(snapshot.val().time) + "/"
                   + (currentdate.getMonth()+1)  + "/" 
                   + currentdate.getFullYear() + " @ "  
                   + currentdate.getHours() + ":"  
                   + currentdate.getMinutes() + ":" 
                   + currentdate.getSeconds();



                   if(snapshot.val().seen == 1){
                   	messageList.append('<li style="border: 1px solid #88868c; color: black; border-radius: 5px; background: white;">'+
                   		'<a href="messages_view.html?id='+otherUserId+'&fullname='+otherName+'" class="item-link item-content">'+
                   		'<div class="item-media color-red"> <i class="fa fa-envelope-o" aria-hidden="true" style="font-size: 30px;"></i> </div>'+
                   		'<div class="item-inner">'+
                   		'<div class="item-title-row">'+
                   		'<div class="item-title" style="font-weight: bold !important;" >'+otherName+'</div>'+
                   		'</div>'+
                   		'<div class="item-text">Last message: '+datetime+'</div>'+
                   		'</div>'+
                   		'</a>'+
                   		'</li>');


                   } else{
                   	messageList.append('<li style="border: 1px solid #88868c; color: black; border-radius: 5px; background: white;">'+
                   		'<a href="messages_view.html?id='+otherUserId+'&fullname='+otherName+'" class="item-link item-content">'+
                   		'<div class="item-media color-red"> <i class="fa fa-envelope" aria-hidden="true" style="font-size: 30px;"></i> </div>'+
                   		'<div class="item-inner">'+
                   		'<div class="item-title-row">'+
                   		'<div class="item-title" style="font-weight: bold !important;" >'+otherName+'</div>'+
                   		'</div>'+
                   		'<div class="item-text">Last message: '+datetime+'</div>'+
                   		'</div>'+
                   		'</a>'+
                   		'</li>');

                   }
               });


               	});



});



function updateMessagesLog(mainUserId, otherUserId, seenStatus){
	var messageslogRef = new Firebase('https://doctordial.firebaseio.com/messageslog/');

    //find a message log where this user is the sender and update it
    formDataMesssages =  {
    	type: 'text',
    	receiver_id: otherUserId,
    	sender_id: mainUserId,
    	time:  new Date(),
    	seen: seenStatus 

    }
    messageslogRef.child(mainUserId+"/"+otherUserId).set(formDataMesssages);

}





myApp.onPageInit('messages_view', function(page) {


	if(page.query.id == localStorage.doctordial_profile_id ){
		//alert("Page query ID: "+ page.query.id + " Mine : " + localStorage.doctordial_profile_id);
		mainView.router.loadPage('index.html');

		myApp.alert('View your messages log', 'Redirecting...', function () {
			mainView.router.loadPage('index.html');
		});


	}

//set my messages with this person to 'seen'
updateMessagesLog(localStorage.doctordial_profile_id, page.query.id, 1);

var quickBloxCheck = new Firebase('https://doctordial.firebaseio.com/users/'+page.query.id);

quickBloxCheck.once("value", function(snapshot) {

			    //GET DATA
			    var data = snapshot.val();
			    

			    if(typeof data.quickblox_id == 'undefined'){
			    	myApp.alert("Sorry, this person you are chatting with cannot make calls, they have not activated their call account.", "Alert");
			    }else{
				 	//save this other person's quickblox details on this persons device
				 	localStorage.quickblox_doctor_id = data.quickblox_id;
				 	localStorage.quickblox_doctor_login = data.quickblox_login;
				 	localStorage.quickblox_doctor_name = data.firstname;
				 }

				});



//create a message log 
//this is the contents of the page the user will see to have a list of recent messages












// Conversation flag
var conversationStarted = false;

try{
	var myMessages = myApp.messages('.messages', {
		autoLayout:true
	});
}catch(err1){
	//alert("As you can see: "+err1.message);
}

var myMessagebar = myApp.messagebar('.messagebar', {
	maxHeight: 150
});  

// Do something here when page loaded and initialized
	//var scrolled = 0;
			  // CREATE A REFERENCE TO FIREBASE
			  var messagesRef = new Firebase('https://doctordial.firebaseio.com/messages');

			  // REGISTER DOM ELEMENTS
			  var messageField = $$('#messageInput');
			  var nameField = $$('#nameInput');
			  var messageList = $$('.messages');
			  var sendMessageButton = $$('#sendMessageButton');

			  // LISTEN FOR KEYPRESS EVENT
			/*  sendMessageButton.click(function (e) {
			      //FIELD VALUES
			      var username = nameField.val();
			      var message = messageField.val();
                  messageField.val('');
			      if(message != ''){
			      	 
			      //SAVE DATA TO FIREBASE AND EMPTY FIELD
			      messagesRef.push({name:username, text:message});
			      
			      }
			     
			   
			  });*/
			  
			  

				// Init Messagebar
				var myMessagebar = myApp.messagebar('.messagebar');

				
				function addNewPostMessage(){
				  // Message text
				  var messageText = myMessagebar.value().trim();
				  // Exit if empy message
				  if (messageText.length === 0) return;

				  // Empty messagebar
				  myMessagebar.clear()

				  
				  var name = nameField.val(); 
				 //SAVE DATA TO FIREBASE AND EMPTY FIELD
			     // messagesRef.push({name:name, text:messageText});
				  // Avatar and name for received message
				 // var avatar;




				  // Add message
				  messagesRef.push({
				  	//userid
				  	user_id: localStorage.doctordial_user_id, 
				  	receiver_user_id: page.query.id,
				    // Message text
				    text: messageText,
				    // Random message type
				    // Avatar and name:
				    //avatar: avatar,
				   // name: name,
				    // Day
				    day: !conversationStarted ? 'Today' : false,
				    time: !conversationStarted ? (new Date()).getHours() + ':' + (new Date()).getMinutes() : false
				});



				  

					//repeat the same thing for the sender and receiver

					updateMessagesLog(localStorage.doctordial_profile_id, page.query.id, 1);
					//do it again to update the messages log for the other user

					//the other user has not seen the message, that's why the 0
					updateMessagesLog(page.query.id, localStorage.doctordial_profile_id, 0);

				  // Update conversation flag
				  conversationStarted = true;
				}             

               // Handle message
               $$('.messagebar .link').on('click', function () {
               	addNewPostMessage();

               });   

               function runScript(event) {
               	if (event.which == 13 || event.keyCode == 13) {
						        //code to execute here
						        addNewPostMessage();
						        return false;
						    }
						    return true;
						};

						messagesRef.limitToLast(10).on('child_added', function (snapshot) {
			    //GET DATA
			    var data = snapshot.val();
			    var username = data.name || "anonymous";
			    var message = data.text;
			    
			    if(localStorage.doctordial_user_id == data.user_id){ //if this is the sender
			    	var messageType = 'sent';
			    }else{
			    	var messageType = 'received';

			    }
			    var day = data.day;
			    var time = data.time;
			    
			    

			    //CREATE ELEMENTS MESSAGE & SANITIZE TEXT
			 //show only messages where this person is the sender or receiver.
			if(localStorage.doctordial_user_id == data.user_id || localStorage.doctordial_user_id == data.receiver_user_id){ //if this is the sender
				try{
					myMessages.addMessage({

				    // Message text
				    text: message,
				    // Random message type
				    type: messageType,
				    // Avatar and name:
				    //avatar: avatar,
				    //name: name,
				    // Day
				    day: !conversationStarted ? 'Today' : false,
				    time: !conversationStarted ? (new Date()).getHours() + ':' + (new Date()).getMinutes() : false
				});
				}catch(err){
					//alert("got the error"+err);
				}
			}




		});

					});

