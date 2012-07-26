/**
* jsTrac
* A Javascript interface for Trac
* @author Romain Laï-King
* @version 1.0
*/
/**
* @class jsTrac
*/
var jsTrac=(function(){
	var option={
		'tracUrl':null,
		'rpcPlugin':'/rpc' ,
		'prefill':null,
		'onSubmitted':null,
		'onCancel':null,
		'defaultComponent':null,
		'defaultMilestone':null,
		'defaultPriority':null,
		'defaultType':null,
		'lockDefault':null,
		'allowUpdate':false,
		'updateAnyId':false,
		'zIndex':50000,
		'ticketQuery':null
	};

/**
* RPC method
* @param Remote RPC Method to call
* @param Parameter additional parameters to the RPC method, not compulsory
* @return Data Formated by the RPC method after XML parsing
* @throw Exception Either an error object generated from connection error or error from the Trac
* */

function rpcTrac(method) {
	var request = new XmlRpcRequest(option.tracUrl+option.rpcPlugin, method);

	for (var i=1;i<arguments.length;i++){
		request.addParam(arguments[i]);
	}
	try{
		var data = request.send().parseXML();
	}
	catch(err){
		throw err;
	}
	if (typeof data.faultCode!='undefined'){
		throw data;
	}
	return data;
};



/**
* Method creating a select dropdown list in the body
* @param Data array provided by the RPC method
* @param Name Name/id of the select tag
* @param Title Label to display
* @parem Append Where it will be appended
* @param defaultValue Select a value in the select if it exists
*/

function createSelect(data, name, title, append, defaultValue) {
	createDiv=$('<div>').addClass('tracSelect')
	.append("<label for='" + title + "'>" + title + "</label>").appendTo(append);
	selectTag=$('<select>').attr('id',name).attr('name',name).appendTo(createDiv);
	var defaultFound=false;
	$.each(data, function(index, value) {
		if (defaultValue!= null && value.toLowerCase()==defaultValue.toLowerCase()){
			defaultFound=true;
			selectTag.append("<option selected='selected' value='" + value + "'>" + value + "</option>");
		}
		selectTag.append("<option value='" + value + "'>" + value + "</option>");
	});
	if (defaultFound){
		switch(option.lockDefault){
			case 'disabled': 
			selectTag.attr('disabled','disabled');
			break;
			case 'hidden':
			createDiv.hide();
			break;
		}
	}
};

/**
* Create a text area
* @param {string} Name/id of the textarea
* @param {string} Title to display above
* @param {number} Rows Number of rows
* @parem {string} Where it will be appended
*/

function createTextArea(name, title,rows,append) {
	$(append).append("<label for='" + title + "'>" + title + "</label>")
	.append("<textarea id='" + name + "' rows='" + rows + "'  name=" + name + ">");
}

/**
* Create an input text
* @param Name/id of the input text
* @param Title Title to display above in label
* @param Size Size of the input field
* @parem Append Where it will be appended
*/

function createInputText(name, title,append) {
	$(append).append("<label for='" + title + "'>" + title + "</label>")
	.append("<input type='text' id='" + name + "'name='" + name + "'>");
}

/**
* Method combining both the RPC method and the createSelect
* @param RPC RPC method to call
* @param Name Name of the select tag
* @param Title to display in label
* @parem Append Where it will be appended
*/
function rpcAndCreateSelect(method, name, title, append, defaultValue) {
	try{
		var result = rpcTrac(method);
	}
	catch(err){
		throw(err);
	}
	createSelect(result, name, title, append, defaultValue);
}

/**
* Method to create a specific select dropdown menu for milestone.
* It removes milestone which are already completed.
* @param Title to display in label
* @parem Append Where it will be appended
*/


function rpcMilestone(name,title,append){
	try{
		var data=rpcTrac("ticket.milestone.getAll");
	}
	catch(err){
		throw err;
	}
	createDiv=$('<div>').addClass('tracSelect')
	.append("<label for='" + title + "'>" + title + "</label>").appendTo(append);
	selectTag=$('<select>').attr('id',name).attr('name',name).appendTo(createDiv);
	var defaultFound=false;
	$.each(data, function(index, value) {
		try{
			var result=rpcTrac("ticket.milestone.get",value);
		}
		catch(err){
			throw err;
		}
		//if the milestone is complete, it returns a date and not a number
		if(result.completed instanceof Number){
			if (option.defaultMilestone!= null && value.toLowerCase()==option.defaultMilestone.toLowerCase()){
				defaultFound=true;
				selectTag.append("<option selected='selected' value='" + value + "'>" + value + "</option>");
			}
			else{
				selectTag.append("<option value='" + value + "'>" + value + "</option>")
			}
		}
	});
	if (defaultFound){
		switch(option.lockDefault){
			case 'disabled': 
			selectTag.attr('disabled','disabled');
			break;
			case 'hidden':
			createDiv.hide();
			break;
		}
	}
}


/**
* Get ticket's information and display them, while removing previous information
* @param id id of the ticket
* @param append where to append
* @return timestand needed for update
*/

function rpcTracTicketInfo(id,append){
	try{
		var data=rpcTrac("ticket.get",id);
		$(append).children().remove();
		$('<h2>').text('Ticket:' + data[0] + ' - Milestone:' + data[3].milestone).appendTo(append);
		$('<p>').text(data[3].summary).appendTo(append);
		return data[3]._ts;
	}
	catch(err){
		console.log("Unknow ticket");
	}
}

/**
* Get available actions on a ticket and display them like Trac. Also remove previous actions
* @param id id of the ticket
* @param append where to append
*/

function rpcTracTicketAction(id,append){
	$(append).children().remove();
	try{
		var data=rpcTrac("ticket.getActions",id);
		$.each(data,function(index,value){
			var createDiv=$('<div>').addClass('tracAction').appendTo(append);
			$('<input>').attr('type','radio').attr('name','tracAction').attr('id',value[0]).attr('value',value[0]).appendTo(createDiv);
			$('<label>').attr('for',value[0]).text(value[1]).appendTo(createDiv);
			if( value[3].length > 0 && value[3][0][2].length > 0){
				var selectTag=$('<select>').attr('name',value[3][0][0]).attr('name',value[3][0][0]).appendTo(createDiv);
				$.each(value[3][0][2],function(index,value){
					selectTag.append("<option value='" + value + "'>" + value + "</option>")
				});
			}
			$('<div>').addClass('tracHint').text(value[2]).appendTo(createDiv);
		})
		$('input:radio[name=tracAction]').val([data[0][0]]);
	}
	catch(err){
		console.log("Most likely, unknow ticket. Error= " + err.faultString);
	}

}

/**
* Test the connection to the trac.
* @returns {Boolean} True if connection is ok, else false
*/

function testTracConnection(){
	try{
		var data=rpcTrac("system.getAPIVersion");
	}
	catch(err){
		$('<div>').addClass('alert alert-error').attr('id','tracAlert').appendTo('#tracAppendZone');;
		if(err.code==101){
			$('<p>').text('101 error from XHR, check that you are connected and logged to the Trac server and that XSS are allowed').appendTo('#tracAlert');
		}
		else if(err.faultCode==403){
			$('<p>').text('403 error from Trac, check that you are connected and logged to the Trac server').appendTo('#tracAlert');
		}
		else{
			$('<p>').text('Unidentified error, check that you are connected and logged to the Trac server').appendTo('#tracAlert');
		}
		var retry=$('<button>').attr('data-dismiss','alert').attr('type','button').addClass('btn').text('Retry').appendTo('#tracAlert');
		retry.click(function(){
			$("#tracAlert").alert('close');
			createTracForm();
		});
		return false
	}
	return true
}

/**
* Prefill the ticket with informations and display them
* @param append Where to append
*/

function prefillTrac(append){
	if(option.prefill!=null){
		var text = "Prefilled information <br> "+ option.prefill;
		var prefill = $('<div>').attr('id','prefillTrac').append(text);
	}
	else{
		var prefill = $('<div>').attr('id','prefillTrac').append("");
	}
	prefill.appendTo(append);
}


/**
* Create the form content of the modal after test
* @param callback Function to call when you submitted or close the modal
*/

function createTracForm(){
	if(testTracConnection()){
		// New Pane
		var li,data,ticket,ts;
		li = $('<li>').addClass('active').appendTo('#tracTabBar');
		$('<a>').attr('href','#tracNewPane').attr('data-toggle','tab').text('New ticket').appendTo(li);
		$('<form>').attr('id','tracNewPane').addClass('tab-pane active').appendTo('#tracAppendZone');
		createInputText("summaryField",'Summary','#tracNewPane');

		createTextArea("descriptionField",'Description',9,'#tracNewPane');
		rpcAndCreateSelect("ticket.type.getAll", "typeSelect",'Type','#tracNewPane',option.defaultType);
		rpcAndCreateSelect("ticket.priority.getAll", "prioritySelect", 'Priority','#tracNewPane',option.defaultPriority);
		rpcMilestone("milestoneSelect", 'Milestone','#tracNewPane');
		rpcAndCreateSelect("ticket.component.getAll", "componentSelect", 'Component','#tracNewPane',option.defaultComponent);
		$('<button>').attr('type', 'submit').addClass('btn btn-primary').text('Submit').appendTo('#tracBarBase');
		$('#tracBarBase').clone().appendTo('#tracNewPane').attr('id','tracBarNewPane');


		$('#tracNewPane').validate({
			rules : {
				summaryField : "required",
				descriptionField : "required"
			},
			submitHandler : function(form) {
				var result = submitTracTicket();
				var name=addAttachment(result,$('#screenshotPreview').attr('src'));
				$('#tracModalPopup').modal('hide');
				$('#tracModalPopup').remove();
				if (typeof option.onSubmitted=='function')
				option.onSubmitted.call(this,result);
			}
		});

		// Update pane
		if(option.allowUpdate&&(option.ticketQuery||option.updateAnyId)){
			//Adding to tabbar
			li = $('<li>').appendTo('#tracTabBar');
			$('<a>').attr('href','#tracUpdatePane').attr('data-toggle','tab').text('Update ticket').appendTo(li);

			//the pane itself
			$('<form>').attr('id','tracUpdatePane').addClass('tab-pane').appendTo('#tracAppendZone');

			if(option.ticketQuery){
				try{
					data=rpcTrac("ticket.query",option.ticketQuery);
				}
				catch(err){
					console.log("Invalid query");
				}
				$('<div>').attr('id','updateTicketIdSelect').appendTo('#tracUpdatePane');
				createSelect(data,"updateTicketSelect",'Ticket list','#updateTicketIdSelect');
				rpcTracTicketAction($('#updateTicketSelect').val(),'#tracTicketAction');
				ticket=$('#updateTicketSelect').val();
				ts=rpcTracTicketInfo($('#updateTicketSelect').val(),'#tracTicketInfo');
			}
			if(option.updateAnyId){
				$('<div>').addClass('tracSelect').attr('id','updateTicketIdField').appendTo('#tracUpdatePane');
				createInputText("updateTicketField",'Ticket #','#updateTicketIdField');
			}
			$('<div>').attr('id','tracTicketInfo').appendTo('#tracUpdatePane');


			createTextArea("commentField",'Comment',9,'#tracUpdatePane');
			$('<div>').attr('id','tracTicketAction').appendTo('#tracUpdatePane');







			$('#tracBarBase').clone().appendTo('#tracUpdatePane').attr('id','tracBarUpdatePane');


			$('#updateTicketSelect').change(function(){
				ts=rpcTracTicketInfo($('#updateTicketSelect').val(),'#tracTicketInfo');
				ticket=$('#updateTicketSelect').val();
				rpcTracTicketAction($('#updateTicketSelect').val(),'#tracTicketAction');
			});

			$('#updateTicketField').keyup(function(){
				ts=rpcTracTicketInfo($('#updateTicketField').val(),'#tracTicketInfo');
				ticket=$('#updateTicketField').val();
				rpcTracTicketAction($('#updateTicketField').val(),'#tracTicketAction');
			});

			//Validate the form and send the ticket


			$('#tracUpdatePane').validate({
				rules : {
					commentField : "required",
				},
				submitHandler : function(form) {
					var name=addAttachment(ticket,$('#screenshotPreview').attr('src'));
					var result = updateTracTicket(ticket,ts);
					$('#tracModalPopup').modal('hide');
					$('#tracModalPopup').remove();
					if (typeof option.onSubmitted=='function')
					option.onSubmitted.call(this,result[0]);
				}
			});

		}
		$('#tracBarBase').remove();
		$('#tracModalPopup').modal('show');

	}
}

/**
* Retrieve all the information from the form created by createTracForm and submit it to trac
*/

function submitTracTicket() {
	//Structure containing the attribute
	var attributes = {
		'priority' : $('#prioritySelect').val(),
		'milestone' : $('#milestoneSelect').val(),
		'component' : $('#componentSelect').val(),
		'type' : $('#typeSelect').val()
	};
	try{
		return rpcTrac("ticket.create",$('#summaryField').val(), $('#descriptionField').val() + "\n" + $('#prefillTrac').html().replace(/<br>|<br\/>/g,'\n'), attributes );
	}
	catch(err){
		console.debug(err);
	}
}

/**
* Add an attachment to ticket
* @param id Id of the ticket
*/

function addAttachment(id,img) {
	//Create the base64 data
	var base = new Base64();
	//Warning, the XMLRPC plugin's documentation has wrong informations. The file accepted is a binary, not base64
	//If they fix it, remove the atob() function
	base.bytes = atob(img.replace(/^data:image\/(png|jpg);base64,/, ""));
	try{
		var result = rpcTrac("ticket.putAttachment", id, "screenshot.png", "Automatic screenshot", base, false);
	}
	catch(err){

	}
}


/**
* Update a ticket with a comment and action
* @param id id of the ticket
* @param timestamp timestamp of the ticket, it should match the _ts of the one provided by ticket info
*/

function updateTracTicket(id,timestamp){
	//document.write(ticket[3]._ts);
	var attributes={
		'_ts': timestamp,
		'action': $('input:radio[name=tracAction]:checked').val()
	}
	//retrieve value in select box if it exists
	var test = $('input:radio[name=tracAction]:checked').parent().children('select');
	if (test.length>0){
		attributes[test.attr('name')]=test.val();
	}
	try{
		return rpcTrac("ticket.update",id, $('#commentField').val()  + "\n" + $('#prefillTrac').html().replace(/<br>|<br\/>/g,'\n'),attributes);
	}
	catch(err){
		console.debug(err);
	}
}


return{
	/**
	* Init the modal to submit ticket
	* @public
	* @param img An image in base64
	* @param callback Function to call when you submited or close the modal
	*/
	initTracForm : function(img,opts) {
		option=$.extend(true,option,opts);
		var modal=$('<div>').attr('id','tracModalPopup').css('z-index',option.zIndex+1).appendTo('body');
		$("#tracModalPopup").addClass('modal hide').on('hidden',function(){
			modal.remove();
			if(typeof option.onCancel == 'function')
			option.onCancel.call(this);
		});
		var leftPane = $('<div>').attr('id','tracLeftPane').appendTo(modal);
		leftPane.append("<img id='screenshotPreview' src='"+img+"' />");
		prefillTrac('#tracLeftPane');
		modal.append("<div  id='tracForm'>");
		$('<div>').attr('id','tracModalHeader').appendTo('#tracForm');
		$('<button>').attr('type','button').addClass('close').attr('data-dismiss','modal').text('x').appendTo('#tracModalHeader');
		$('<ul>').attr('id','tracTabBar').addClass('nav nav-tabs').appendTo('#tracModalHeader');
		$('#tracModalPopup').modal('show');
		$('.modal-backdrop').css('z-index',option.zIndex);
		$('<div>').attr('id','tracAppendZone').addClass('tab-content').appendTo('#tracForm');
		$('<div>').attr('id','tracBarBase').addClass('tracBar').appendTo('#tracForm');
		$('<button>').addClass('btn').text('Cancel').attr('type','button').attr('data-dismiss','modal').appendTo('#tracBarBase');
		createTracForm();
	}
};

})();




$(document).ready(function() {
	var opts={
		'prefill': " URL: " + window.location+
		" <br> Organisation: " + $("[name=fieldsetOrga] option:selected").text() +
		" <br> Personate: " + $("[name=fieldsetUser] option:selected").text() +
		" <br> Module: " + $("body").attr('id') ,
		'defaultComponent': $("body").attr('id') ,
		'callback': function(){
			$('#reportTracBug').show();
		}
	}
	if(jQuery.browser.msie){
		$('#reportTracBug').remove();
	}

	$('#reportTracBug').click(function(){
		reportTracBug(opts);
	});
	Mousetrap.bind('alt+s', function(e) {
		if($('#reportTracBug:hidden').length == 0 )
		reportTracBug(opts);
	});
	Mousetrap.bind('up up down down left right left right b a', function() {
		if($('#reportTracBug:hidden').length == 0 )
		reportTracBug(opts);
	});
});

