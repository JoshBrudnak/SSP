Ext.define('Ssp.controller.tool.actionplan.DisplayActionPlanViewController', {
    extend: 'Deft.mvc.ViewController',
    mixins: [ 'Deft.mixin.Injectable' ],
    inject: {
    	apiProperties: 'apiProperties',
    	person: 'currentPerson',
    	appEventsController: 'appEventsController',
    	authenticatedPerson: 'authenticatedPerson',
    	formUtils: 'formRendererUtils',
    	store: 'tasksStore'
    },
    
    config: {
    	filteredTaskStatus: null,
    	filterAuthenticated: false,
    	personTaskUrl: '',
    	personTaskGroupUrl: '',
    	personEmailTaskUrl: '',
    	personPrintTaskUrl: ''
    },
    
    control: {    	
    	'taskStatusTabs': {
    		tabchange: 'onTaskStatusTabChange'
    	},
    	
		'filterTasksBySelfCheck': {
			change: 'onFilterTasksBySelfChange'
		},

		'viewHistoryButton': {
			click: 'onViewHistoryClick'
		},
		
		'emailTasksButton': {
			click: 'onEmailTasksClick'
		},

		'printTasksButton': {
			click: 'onPrintTasksClick'
		}
	},
	
	init: function() {
		var me = this;
		var personId;
		var successFunc = function(response,view){
	    	var r, records;
	    	var groupedTasks=[];
	    	r = Ext.decode(response.responseText);
	    	if (r != null)
	    	{
	    		Ext.Object.each(r,function(key,value){
		    		var taskGroup = key;
		    		var tasks = value;
		    		Ext.Array.each(tasks,function(task,index){
		    			task.group=taskGroup;
		    			groupedTasks.push(task);
		    		},this);
		    	},this);		    		

	    		me.store.loadData(groupedTasks);
	    		me.filteredTaskStatus="ACTIVE";
	    		me.filterTasks();
	    	}
		};
		
		personId = this.person.get('id');
		this.personTaskUrl = this.apiProperties.getItemUrl('personTask');
		this.personTaskUrl = this.personTaskUrl.replace('{id}',personId);
		this.personTaskGroupUrl = this.apiProperties.getItemUrl('personTaskGroup');
		this.personTaskGroupUrl = this.personTaskGroupUrl.replace('{id}',personId);
		this.personEmailTaskUrl = this.apiProperties.getItemUrl('personEmailTask');
		this.personEmailTaskUrl = this.personEmailTaskUrl.replace('{id}',personId);	
		this.personPrintTaskUrl = this.apiProperties.getItemUrl('personPrintTask');
		this.personPrintTaskUrl = this.personPrintTaskUrl.replace('{id}',personId);
		
		this.apiProperties.makeRequest({
			url: this.apiProperties.createUrl(this.personTaskGroupUrl),
			method: 'GET',
			successFunc: successFunc 
		});
		
		return this.callParent(arguments);
    },
    
    onTaskStatusTabChange: function(panel, newComp, oldComp, eOpts) {
		this.filteredTaskStatus = newComp.action.toUpperCase();
		this.filterTasks();
    },

    onFilterTasksBySelfChange: function(comp) {
		this.filterAuthenticated=comp.checked;
		this.filterTasks();
    },
    
    filterTasks: function(){
    	var filtersArr = [];
		var filterStatusFunc = null;
		var authenticatedId = this.authenticatedPerson.get('id');
		var filterAuthenticatedFunc = function(item) { 
			return (item.get('createdBy').id == authenticatedId); 
		}; 

		switch (this.filteredTaskStatus)
		{
			case 'ACTIVE':
				filterStatusFunc = function(item) { return (item.get('completed') == false); };
				break;
			
			case 'COMPLETE':
				filterStatusFunc = function(item) { return (item.get('completed') == true); };
				break;
		}
		
		if (filterStatusFunc != null)
			filtersArr.push(filterStatusFunc);
		
		if (this.filterAuthenticated)
			filtersArr.push(filterAuthenticatedFunc);
		
		// reset filter
		this.store.clearFilter();
		
		// apply new filters
		this.store.filter(filtersArr);
    },
    
    onViewHistoryClick: function(button) {
		this.appEventsController.getApplication().fireEvent("viewHistory");
    },

    onEmailTasksClick: function(button) {
    	var me=this;
		Ext.create('Ext.window.Window', {
		    title: 'To whom would you like to send this Action Plan',
		    height: 200,
		    width: 400,
		    layout: 'fit',
		    modal: true,
		    items:[{
		        xtype:'form',
		        layout:'anchor',
		        items :[{
		            xtype: 'label',
		            text: 'Enter recipient email addresses separated by a comma'
		            
		        },{
		            xtype: 'textarea',
		            anchor: '100%',
		            name: 'recipientEmailAddresses'
		        }]
			}],
			dockedItems: [{
		        dock: 'bottom',
		        xtype: 'toolbar',
		        items: [{
		            text: 'Send',
		            xtype: 'button',
		            handler: me.emailTaskList,
		            scope: me
		        },{
		            text: 'Cancel',
		            xtype: 'button',
		            handler: function(button){
		            	button.up('window').close();
		            }
		        }]
    	    }]
		}).show();
    },
    
    emailTaskList: function( button ){
    	var grid = this.getView().down('grid');
	    var valid = false;
	    var jsonData;
	    var emailTestArr;
	    var arrRecipientEmailAddresses = [];
	    var recipientEmailAddresses = button.up('panel').down('form').getValues().recipientEmailAddresses;
	    if (recipientEmailAddresses != null)
	    {
	    	// validate email addresses
		    if ( recipientEmailAddresses.indexOf(",") )
		    {
		    	emailTestArr = recipientEmailAddresses.split(',');
		    	// handle a list of email addresses
		    	Ext.each(emailTestArr,function(emailAddress,index){
		    		valid = this.validateEmailAddress( emailAddress );
		    		arrRecipientEmailAddresses.push( Ext.String.trim(emailAddress) );
		    		if (valid != true)
		    			return;
		    	}, this);
		    }else{
		    	valid = this.validateEmailAddress( recipientEmailAddresses );
		    	arrRecipientEmailAddresses.push( Ext.String.trim( recipientEmailAddresses ) );
		    }

		    // define data to email
			jsonData = {
					taskIds: this.getSelectedIdsArray( grid.getView().getSelectionModel().getSelection() ),
					recipientIds: [],
					recipientEmailAddresses: arrRecipientEmailAddresses
			};

		    if (valid==true)
		    {
		    	/*
		    	if (jsonData.taskIds.length > 0){
			    	// email the task list
		    		url = this.apiProperties.createUrl( this.personEmailTaskUrl );
			    	this.apiProperties.makeRequest({
						url: url,
						method: 'GET',
						jsonData: jsonData,
						successFunc: function(){
							button.up('window').close();
							Ext.Msg.alert('The task list has been sent to the listed recipient(s).');
						}
					});		    		
		    	}else{
			    	Ext.Msg.alert('Error','Please select the tasks you would like to send before initiating an email.');		    		
		    	}
		    	*/
		    }else{
		    	Ext.Msg.alert('Error','1 or more of the addresses you entered are invalid. Please correct the form and try again.');		    	
		    }	
	    }else{
	    	Ext.Msg.alert('Error','Unable to determine an email address please enter a valid email address.');
	    }
    },
    
    validateEmailAddress: function( value ){
    	var emailExpression = filter = new RegExp('^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$');
    	return emailExpression.test( value );
    },
    
    onPrintTasksClick: function(button) {
    	var grid, url, jsonData;	
		var tasksGrid = button.up('panel').down('grid');
		var goals = Ext.ComponentQuery.query('#goalsPanel');
		var jsonData = {
	    				"taskIds": this.getSelectedIdsArray( tasksGrid.getView().getSelectionModel().getSelection() ),
	    		        "goalIds": this.getSelectedIdsArray( tasksGrid.getView().getSelectionModel().getSelection() )
	    		        };
	    if (jsonData.taskIds.length > 0)
	    {
	    	url = this.apiProperties.createUrl( this.personPrintTaskUrl );
	        /*
			this.apiProperties.makeRequest({
				url: url,
				method: 'GET',
				jsonData: jsonData,
				successFunc: function(){
					// handle response here
				}
			});
			*/	    	
	    }else{
	    	Ext.Msg.alert('Please select the tasks and goals you would like to print.');
	    }
    },
    
    getSelectedIdsArray: function(arr){
		var selectedIds = [];
		Ext.each(arr, function(item, index) {
			selectedIds.push( item.id );
		});
		
		return selectedIds;
    }
});