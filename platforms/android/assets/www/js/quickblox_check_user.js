var QBApp = {
 appId: 43487,
    authKey: 'YBbj2eTUPBL8VJP',
    authSecret: 'X2kpWVMeK7bF3f6'
};



// Init QuickBlox application here
//
QB.init(QBApp.appId, QBApp.authKey, QBApp.authSecret);

$(document).ready(function() {

  // First of all create a session and obtain a session token
  // Then you will be able to run requests to Users
  //
  QB.createSession(function(err,result){
    console.log('Session create callback', err, result);
  });

  // Init Twitter Digits
  //


$('#usr_sgn_p_lgn').val(localStorage.email);
$('#usrs_get_by_filter').val(localStorage.email);

$('#usr_sgn_p_lgn').attr('disabled');

//hide 
$('.userCreateAccountRow').hide();

$('.userSuccessRow').hide();
   $('.userFailureRow').hide();
  $('.loading').hide();
  // Create user
  //
  $('#sign_up').on('click', function() {
    $('.loading').show();
    var login = $('#usr_sgn_p_lgn').val();
    var password = $('#usr_sgn_p_pwd').val();

    var params = { 'login': login, 'password': password};

    QB.users.create(params, function(err, user){
      if (user) {
        
          localStorage.quickblox_id = user.id;
          localStorage.quickblox_login = user.login;
          localStorage.quickblox_email = user.email;
          localStorage.quickblox_owner_id = user.owner_id;
          
           $('.userCreateAccountRow').hide();
            
           $('.userSuccessRow').show();

           $('.loading').hide();
          
      } else  {
        

        
           $('.userCreateAccountRow').hide();
            
           $('.userFailureRow').show();
           $('.loading').hide();
        
      }

    });
  });


 


  // Get users
  //
  $('#get_by').on('click', function() {
    $('.loading').show();
    var filter_value = $('#usrs_get_by_filter').val();
    var filter_type = $("#sel_filter_for_users").val();

    var params;

    var request_for_many_user = false;

    switch (filter_type) {
      // all users, no filters<
      case "1":
        params = { page: '1', per_page: '100'};
        request_for_many_user = true;
        break;

      // by id
      case "2":
        params = parseInt(filter_value);
        break;

      // by login
      case "3":
        params = {login: filter_value};
        break;

      // by fullname
      case "4":
        params = {full_name: filter_value};
        break;

      // by facebook id
      case "5":
        params = {facebook_id: filter_value};
        break;

      // by twitter id
      case "6":
        params = {twitter_id: filter_value};
        break;

      // by email
      case "7":
        params = {email: filter_value};
        break;

      // by tags
      case "8":
        params = {tags: filter_value};
        break;

      // by external id
      case "9":
        params = {external: filter_value};
        break;

      // custom filters
      case "10":
        // More info about filters here
        // http://quickblox.com/developers/Users#Filters
        params = {filter: { field: 'login', param: 'in', value: ["sam33","ivan_gram"] }};
        //request_for_many_user = true;
        break;
    }

    console.log("filter_value: " + filter_value);

    if(request_for_many_user){
      QB.users.listUsers(params, function(err, result){
        if (result) {
          $('#output_place').val(JSON.stringify(result));
        } else  {
          $('#output_place').val(JSON.stringify(err));
        }

        console.log("current_page: " + result.current_page);
        console.log("per_page: " + result.per_page);
        console.log("total_entries: " + result.total_entries);
        console.log("count: " + result.items.length);

        $("#progressModal").modal("hide");

        $("html, body").animate({ scrollTop: 0 }, "slow");
      });
    }else{
      QB.users.get(params, function(err, user){
        if (user) {
         // alert("Success so far");
        	$('.userSearchRow').hide();
          $('.userSuccessRow').show();
          $('.loading').hide();
          localStorage.quickblox_id = user.id;
          localStorage.quickblox_login = user.login;
          localStorage.quickblox_email = user.email;
          localStorage.quickblox_owner_id = user.owner_id;

    
        } else  {
        	
        	//failed
           //$('.userFailureRow').show();
           $('.userCreateAccountRow').show();
           $('.userSearchRow').hide();
           $('.loading').hide();
        }

      });
    }
  });



});
