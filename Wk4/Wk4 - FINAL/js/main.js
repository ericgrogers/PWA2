/*  
	horas professional time management
	Author: Eric Rogers
*/

(function($){
	
	/*
	============================================================
	======================================== APPLICATION GLOBALS
	*/
	
	var win = $(window),
		body = $(document.body),
		container = $('#container'),	// the only element in index.html
		currentUser = {},
        list,
        usr
	;

    // Use jQuery Placeholder

    $(":input[placeholder]").placeholder();

	/*
	============================================================
	====================================== APPLICATION FUNCTIONS
	*/

    // *********** Load Landing Page ******************************

	var loadLanding = function(){
		$.get('templates/landing.html', function(html){
			var h = $(html);
			var landingCode = h.find('#template_landing').html();
			$.template('landing', landingCode);		// compile template
			$.render(currentUser, 'landing');		// use template
			container.html(landingCode);

            $('#click_me').on('click', animateRegister);
            $('#login_btn').on('click', function(e){
                clearErrors();
                login();

                e.preventDefault();
                return false;
            });
            $('#signup_btn').on('click', function(e){
                clearErrors();
                registerUser();

                e.preventDefault();
                return false;
            });
		});
        return false;
	};


    // ********* Load the application UI **************************

    var loadApp = function(user){
        $.get('templates/app.html', function(html){
            var h = $(html);
            var appCode = h.find('#template_app').html();
            $.template('app', appCode); // compile template
            $.render(currentUser, 'app'); // use template
            container.html(appCode);
            displayProjects(); // display the projects

            if(usr.length > 10){ // shorten the username to keep it from breaking the css
                usr = usr.slice(0, 10)
            }
            $('#welcome_msg').empty().append('Welcome ' + usr + '!'); // welcome the user

            // ----- Navigation Elements ------------

            $('.logout').on('click', logout);
            $('.my_account').on('click', function(e){
                loadAccount(user);

                e.preventDefault();
                return false;
            });
            $('#calendar').on('click', calendarView);
            $('#pnew_btn').on('click', newProject);
        });
        return false;
    };

    // ************ Load Account Edit Modal ***********************

    var loadAccount = function(user){
        $.get('templates/app.html', function(html){
            var h = $(html);
            var accountCode = h.find('#template_account_edit').html();
            $.template('app', accountCode);		// compile template
            $.render(currentUser, 'app');		// use template
            $('#container').append(accountCode);
            $('#overlay').animate({opacity: 1}); // fade in the overlay

            // ----- Navigation Elements ---------------
            $('#cancel_link').on('click', accountCancel);
            $('#change_link').on('click', function(e){
                clearErrors(); // clear current errors before checking for new errors
                changeAccount(user); // submit changes

                e.preventDefault();
                return false;
            });
        });
        return false;
    };

    // ************* Load Task Page Function ************************

    var loadTasks = function(pid){
        $.get('templates/app.html', function(html){
            var h = $(html);
            var taskCode = h.find('#template_task').html();
            $.template('task', taskCode); // compile template
            $.render(currentUser, 'task'); // use template
            container.html(taskCode);

            if(usr.length > 10){ // shorten the username to keep it from breaking the css
                usr = usr.slice(0, 10)
            }

            $('#welcome_msg').empty().append('Welcome ' + usr + '!'); // welcome the user

            displayTasks(pid); // display the tasks

            // ------- Navigation Elements ---------

            $('.projects').on('click', loadApp);
            $('.my_account').on('click', loadAccount);
            $('.logout').on('click', logout);
            $('#tnew_btn').on('click', function(e){
                newTask(pid);

                e.preventDefault();
                return false;
            });
        });

        return false;
    };

    // *************** New Project Modal *****************************

    var newProject = function(){
        $.get('templates/app.html', function(html){
            var h = $(html);
            var newProjectCode = h.find('#template_project_new').html();
            $.template('newProj', newProjectCode);		// compile template
            $.render(currentUser, 'newProj');		// use template
            $('#container').append(newProjectCode);
            $('#f_date').datepicker().datepicker('setDate', new Date()); // populate the due date
            $('#overlay').animate({opacity: 1}); // fade in the overlay

            setStatus(); // status images function

            // ------ Navigation Elements ----------

            $('#cancel_link').on('click', cancel);
            $('#add_link').on('click', addProject);
        });
        return false;
    };

    // ************** Edit Project Modal ****************************

    var editProject = function(id){
        $.get('templates/app.html', function(html){
            var h = $(html);
            var editProjectCode = h.find('#template_project_edit').html();
            $.template('editProj', editProjectCode);		// compile template
            $.render(currentUser, 'editProj');		// use template
            $('#container').append(editProjectCode);
            $('#f_date').datepicker();
            $('#overlay').animate({opacity: 1}); // fade in the overlay

            setStatus(); // status images function

            $.ajax({
                url: 'xhr/get_projects.php',
                type: 'get',
                data: {
                    projectID: id
                },
                dataType: 'json',
                success: function(response){
                    var project = response.projects[0];
                    $('input#f_name').val(project.projectName);
                    $('input#f_date').val(project.dueDate);
                    $('select#f_priority').val(project.status);
                    $('textarea#f_description').val(project.projectDescription);

                }
            });

            // -------- Navigation Elements -----------

            $('#cancel_link').on('click', cancel);
            $('#change_link').on('click', function(e){
                changeProject(id);
                e.preventDefault();
                return false;
            });
        });
        return false;
    };

    // **************** New Task Modal *******************************

    var newTask = function(id){
        $.get('templates/app.html', function(html){
            var h = $(html);
            var newTaskCode = h.find('#template_task_new').html();
            $.template('newTask', newTaskCode);		// compile template
            $.render(currentUser, 'newTask');		// use template
            $('#container').append(newTaskCode);
            $('#f_date').datepicker().datepicker('setDate', new Date()); // populate the due date
            $('#overlay').animate({opacity: 1}); // fade in the overlay

            setStatus(); // status images function

            // ------ Navigation Elements ----------

            $('#cancel_link').on('click', cancel);
            $('#add_link').on('click', function(e){
                    addTask(id);
                e.preventDefault();
                return false;
            });
        });
        return false;
    };

    // ****************** Edit Task Modal ****************************

    var editTask = function(id, pid){
        $.get('templates/app.html', function(html){
            var h = $(html);
            var editTaskCode = h.find('#template_task_edit').html();
            $.template('editTask', editTaskCode);		// compile template
            $.render(currentUser, 'editTask');		// use template
            $('#container').append(editTaskCode);
            $('#f_date').datepicker();
            $('#overlay').animate({opacity: 1}); // fade in the overlay
            $('.f_name_label').css({marginLeft: 40}); // adjust the margin for the name label

            setStatus(); // status images function

            $.ajax({
                url: 'xhr/get_tasks.php',
                type: 'get',
                data: {
                    projectID: pid
                },
                dataType: 'json',
                success: function(response){
                    var task = response.tasks;

                    // populate the fields
                    $(task).each(function(i){
                       if(Number(task[i].id) === Number(id)){
                    $('input#f_name').val(task[i].taskName);
                    $('input#f_date').val(task[i].dueDate);
                    $('select#f_priority').val(task[i].status);
                    $('textarea#f_description').val(task[i].taskDescription);
                        }
                    });
                }
            });

            // -------- Navigation Elements -----------

            $('#cancel_link').on('click', cancel);
            $('#change_link').on('click', function(e){
                changeTask(id, pid);
                e.preventDefault();
                return false;
            });
        });
        return false;
    };

    // *************** Calendar View Modal ****************************

    var calendarView = function(){
        var event = generateEvents(); // events function
        $.get('templates/app.html', function(html){
            var h = $(html);
            var calendarCode = h.find('#template_calendar').html();
            $.template('cal', calendarCode);		// compile template
            $.render(currentUser, 'cal');		// use template
            $('#container').append(calendarCode);

            // generate the calendar
            $('#modal_container').fullCalendar({theme: true, resizable: false,
                events: event
                }).css({
                    padding: '10px 10px 30px 10px',
                    top: '50%',
                    left: '50%'
            });
            $('#overlay').animate({opacity: 1}); // fade in the overlay

            // -------- Navigation Elements -----------

            $('#close_link').on('click', function(e){
                cancel();

                e.preventDefault();
                return false;
            });
        });
        return false;
    };

    // ****************** Display Projects Function ******************

    var displayProjects =function(){
        var projectList = [];

        $('.projects').empty();
        $.ajax({
            url: 'xhr/get_projects.php',
            type: 'get',
            dataType: 'json',
            success: function(response){
                if(response.error){
                    console.log(response.error);
                }else{
                    $.get('templates/app.html', function(html){
                        var h = $(html);
                        var tempCode = h.find('#template_projects').html();
                        var markup ='';
                        $.template('projects', tempCode);
                        for(var i = 0, j = response.projects.length; i < j; i ++){
                            var status = response.projects[i].status;
                            var project = response.projects[i];
                            projectList.push(project);
                            markup += $.render(project, 'projects');
                        }
                        $('.projects').html(markup);

                        list = projectList;

                        if(projectList.length <= 0){
                            $('.projects').append("<div class='noshow'>There are currently no projects to display. Click the 'New +' button to add a project.</div>");
                        }else{

                        // ------ Truncate description ------
                        $('.descrip_text').jTruncate({
                            length: 50
                        }); // ---- end truncate ------------

                        // ----------- Status Images ---------------

                        $('.status').each(function(i){
                            $(this).addClass(projectList[i].status);
                        }); // ----- end status images ------------

                        // --------- Priority Colors ----------------

                        $('.r_prior2').each(function(){

                            $(this)
                                .removeClass('Normal_color Completed_color Canceled_color')
                                .addClass($(this).html()+'_color');
                        }); // ----- end priority colors ----------

                        // ---------- Delete Buttons ----------------
                        $('.delete_btn').each(function(i){
                            $(this).attr('id', projectList[i].id);
                        }).on('click', function(){
                            var idd = Number($(this).attr('id'));

                            $('#dialog_confirm').html('Are you sure you want to delete?').dialog({
                                dialogClass: 'no-close',
                                title: 'Delete Project',
                                buttons: [
                                    {
                                        text: 'Delete Project',
                                        click: function(e){
                                            $(this).dialog('close');
                                            $.ajax({
                                                url: 'xhr/delete_project.php',
                                                data: {
                                                    projectID: idd
                                                },
                                                type: 'post',
                                                dataType: 'json',
                                                success: function(response){
                                                    if(response.error){
                                                        console.log(response.error)
                                                    }else{
                                                        loadApp();
                                                    }
                                                }
                                            });

                                            e.preventDefault();
                                            return false;
                                        }
                                    },
                                    {
                                        text: 'Cancel',
                                        click: function(e){
                                            $(this).dialog('close');

                                            e.preventDefault();
                                            return false;
                                        }
                                    }
                                ]

                            });

                        }); // ------- end delete buttons -------


                        // ------- Edit Buttons -------------

                        $('.edit_btn').each(function(i){
                            $(this).attr('id', projectList[i].id);
                        }).on('click', function(e){

                                var idd = Number($(this).attr('id'));
                                editProject(idd);

                                e.preventDefault();
                                return false;
                        }); // ---- end edit buttons

                        // -------- Click on project name to load it's tasks ---

                        $('.r_name').each(function(i){
                            $(this).attr('id', projectList[i].id);
                        }).on('click', function(e){

                                var idd = Number($(this).attr('id'));
                                loadTasks(idd);

                                e.preventDefault();
                                return false;
                        }); // ---- end of project name listener -------
                        }
                    });
                }
            }
        });
    };

    // ********************* Display Tasks Function *********************

    var displayTasks = function(pid){

        var taskList = [];

        $('.tasks').empty();
        $.ajax({
            url: 'xhr/get_tasks.php',
            type: 'get',
            data: {
                projectID: pid
            },
            dataType: 'json',
            success: function(response){
                if(response.error){
                    console.log(response.error);
                }else{

                    $.get('templates/app.html', function(html){
                        var h = $(html);
                        var tempCode = h.find('#template_display_tasks').html();
                        var markup ='';
                        $.template('tasks', tempCode);
                        for(var i = 0, j = response.tasks.length; i < j; i ++){
                            var status = response.tasks[i].status;
                            var task = response.tasks[i];
                            taskList.push(task);
                            markup += $.render(task, 'tasks');

                        }

                        // ----- Populate the page ----------
                        $('.tasks').html(markup);
                        if(taskList.length <= 0){ // if there aren't any tasks display a message.
                            $('.tasks').append("<div class='noshow'>There are currently no tasks to display. Click the 'New +' button to add a task.</div>");
                            $('.noshow').css({'marginTop': '90px'});
                        }else{

                            // ------ Truncate description ------
                            $('.descrip_text').jTruncate({
                                length: 50
                            }); // ---- end truncate ------------

                        // --------- Status Images ------------------

                        $('.status').each(function(i){
                            $(this).addClass('t'+taskList[i].status);
                        }); // ----- end status images ------------

                            // --------- Priority Colors ----------------

                            $('.r_prior2').each(function(){

                                $(this)
                                    .removeClass('Normal_color Completed_color Canceled_color')
                                    .addClass($(this).html()+'_color');
                            }); // --- end priority colors -----------

                        // ---------- Delete Buttons ----------------
                        $('.delete_btn').each(function(i){
                            $(this).attr('id', taskList[i].id);
                        }).on('click', function(){
                                var idd = Number($(this).attr('id'));

                                $('#dialog_confirm').html('Are you sure you want to delete?').dialog({
                                    dialogClass: 'no-close',
                                    title: 'Delete Task',
                                    buttons: [
                                        {
                                            text: 'Delete Task',
                                            click: function(e){
                                                $(this).dialog('close');
                                                $.ajax({
                                                    url: 'xhr/delete_task.php',
                                                    data: {
                                                        taskID: idd
                                                    },
                                                    type: 'post',
                                                    dataType: 'json',
                                                    success: function(response){
                                                        if(response.error){
                                                            console.log(response.error)
                                                        }else{
                                                            loadTasks(pid);
                                                        }
                                                    }
                                                });

                                                e.preventDefault();
                                                return false;
                                            }
                                        },
                                        {
                                            text: 'Cancel',
                                            click: function(e){
                                                $(this).dialog('close');

                                                e.preventDefault();
                                                return false;
                                             }
                                        }
                                    ]
                                });
                            }); // ------- end delete buttons -------

                        // ------- Edit Buttons -------------

                        $('.edit_btn').each(function(i){
                            $(this).attr('id', taskList[i].id);
                        }).on('click', function(){
                                var idd = Number($(this).attr('id'));
                                editTask(idd, pid);
                            }); // ---- end edit buttons -----

                        }
                    });
                }
            }
        });

    };

    // ************* Register New User Function *******************

    var registerUser = function(){
        var user = $('input#su_username').val(),
            pwd = $('input#su_password').val(),
            eml = $('input#su_email').val()
        ;

        $.ajax({
            url: 'xhr/register.php',
            data: {
                username: user,
                password: pwd,
                email: eml
            },
            type: 'post',
            dataType: 'json',
            success: function(response){
                if(response.error){
                   signUpErrors(response);
                }else{
                    $('#overlay').animate({opacity: 0}, 500); // remove the overlay if present.
                    setTimeout(function(){
                        $('#overlay').remove();
                    }, 500);
                    checkLoginState();
                }
            }

        });

        return false;
    };

    /*
    ==========================================================
    ========================================== Modal Functions
     */

    // ****** Changes priority on status change ***************

    var setStatus = function(){
        $('#com_img').on('click', function(e){
            $('select#f_priority').val('Completed');

            e.preventDefault();
            return false;
        });

        $('#act_img').on('click', function(e){
            $('select#f_priority').val('Normal');

            e.preventDefault();
            return false;
        });

        $('#can_img').on('click', function(e){
            $('select#f_priority').val('Canceled');

            e.preventDefault();
            return false;
        });
    };

    // ************* Change Account Function ***********************

    var changeAccount = function(user){
        var username = $('input#a_name').val(),
            pass = $('input#a_password').val(),
            eml = $('input#a_email').val()
        ;
        if(username != usr){
            $('.acc-errormsg1').append("Username incorrect.");
            console.log(usr)
        }else if(pass === "" || pass === undefined){
            $('.acc-errormsg2').append("You must enter a new Password.");
        }else{
            $.ajax({
                url: 'xhr/update_user.php',
                type: 'post',
                data: {
                    password: pass,
                    email: eml
                },
                dataType: 'json',
                success: function(response){
                    if(response.error){
                        accErrors(response);
                    }else{
                        checkLoginState();
                    }
                }
            });
        }
    };

    // ******************* Add Project Function ********************

    var addProject = function(){
        var name = $('input#f_name').val();
        var stat= $('select#f_priority').val();
        var descrip = $('textarea#f_description').val();
        var date = $('input#f_date').val();

        $.ajax({
            url: 'xhr/new_project.php',
            type: 'post',
            data: {
                projectName: name,
                status: stat,
                projectDescription: descrip,
                dueDate: date
            },
            dataType: 'json',
            success: function(response){
                if(response.error){
                    modalErrors(response);
                }else{

                    cancel();
                    loadApp();
                }
            }
        });
    };

    // ************** Change Project Function ******************

    var changeProject = function(id){
        var name = $('input#f_name').val();
        var stat= $('select#f_priority').val();
        var descrip = $('textarea#f_description').val();
        var date = $('input#f_date').val();
        $.ajax({
            url: 'xhr/update_project.php',
            type: 'post',
            data: {
                projectID: id,
                projectName: name,
                status: stat,
                projectDescription: descrip,
                dueDate: date
            },
            dataType: 'json',
            success: function(response){
                if(response.error){
                    $('.errormsg2').empty()
                        .append(response.error)
                        .show();
                }else{
                    cancel();
                    loadApp();
                }
            }
        });
    };

    // *************** Add Task Function **********************

    var addTask = function(pid){
        var name = $('input#f_name').val();
        var stat= $('select#f_priority').val();
        var descrip = $('textarea#f_description').val();
        var date = $('input#f_date').val();

        $.ajax({
            url: 'xhr/new_task.php',
            type: 'post',
            data: {
                projectID: pid,
                taskName: name,
                status: stat,
                taskDescription: descrip,
                dueDate: date
            },
            dataType: 'json',
            success: function(response){
                if(response.error){
                    modalErrors(response);
                }else{
                    cancel();
                    setTimeout(function(){loadTasks(pid)}, 1000); // give the modal time to animate closed.

                }
            }
        });
    };

    // ****************** Change Task Function ******************

    var changeTask = function(id, pid){
        var name = $('input#f_name').val(),
            stat= $('select#f_priority').val(),
            descrip = $('textarea#f_description').val(),
            date = $('input#f_date').val()
        ;
        $.ajax({
            url: 'xhr/update_task.php',
            type: 'post',
            data: {
                taskID: id,
                taskName: name,
                status: stat,
                taskDescription: descrip,
                dueDate: date
            },
            dataType: 'json',
            success: function(response){
                if(response.error){
                    $('.errormsg2').empty()
                        .append(response.error)
                        .css('visibility', 'visible');
                }else{
                    cancel();
                    setTimeout(function(){loadTasks(pid)}, 1000); // give the modal time to animate closed.

                }
            }
        });
    };

    // --------- Account Cancel Link ------------------------

    var accountCancel = function(){
        $('#accmodal_container').slideUp(300, function(){
            $('#overlay').animate({opacity: 0}, function(){
                $('#overlay').remove();
            });
        });
    };

    // --------- Modals Cancel Links -----------------------

    var cancel = function(){
        $('#modal_container').slideUp(300, function(){
            $('#overlay').animate({opacity: 0}, function(){
                $('#overlay').remove();
            });
        });
    };


    /*
    ==========================================================
    =================================== Login/Logout Functions
    */

    // ---------- Check Login State -------------

    var checkLoginState = function(){
        $.ajax({
            url: 'xhr/check_login.php',
            type: 'get',
            dataType: 'json',
            success: function(response){
                if(response.user){
                    usr = response.user.user_n;
                    loadApp(response.user);
                }else{
                    loadLanding();
                }
            }
        });
        return false;
    };

    //------- Login Function ----------------------

    var login = function(){
        var user = $('input#li_username').val();
        var pwd = $('input#li_password').val();

        $.ajax({
            url: 'xhr/login.php',
            data: {
                username: user,
                password: pwd
            },
            type: 'post',
            dataType: 'json',
            success: function(response){
                if(response.error){
                   loginErrors(response);
                }else{
                    usr = response.user.user_n;
                    loadApp(response.user);
                }
            }
        });
        return false;
    };

    //----------- Logout Function -----------------

    var logout = function(){

        $.ajax({
            url: 'xhr/logout.php',
            type: 'get',
            dataType: 'json',
            success: function(response){
                loadLanding();
            }
        });
        return false;
    };

    // =============================================
    // =================================== Tool Tips

    $(body).tooltip({
        position: {
            my: "center bottom-20",
            at: "center top",
            using: function( position, feedback ) {
                $( this ).css( position );
                $( "<td>" )
                    .addClass( feedback.vertical )
                    .addClass( feedback.horizontal )
                    .appendTo( this )
                ;
            }
        }
    });

    // =============================================
    // ================================== Animations

    var animateRegister = function(e){

        $('<div id="overlay"></div>').appendTo(body).animate({opacity: 1}, 500);
        setTimeout(function(){
            $('#overlay').on('click', function(e){
                $(this).animate({opacity: 0}, 500);
                setTimeout(function(){
                    $('#overlay').remove();
                }, 500);
            });
        }, 1000);

        e.preventDefault();
        return false;
    };

    // =============================================
    // ============================= Calendar Events

    var generateEvents = function(){

        var events = [],
            color,
            text
        ;

        for(var i = 0, j = list.length; i < j; i ++){

            switch (list[i].status){
                case 'Normal':
                    color = '#ff9135', text = '#fff';
                    break;
                case 'Canceled':
                    color = '#ff0000', text = '#fff';
                    break;
                case 'Completed':
                    color = 'green', text = '#fff';
            }
            events.push({title: list[i].projectName, start: list[i].dueDate, status: list[i].status, backgroundColor: color, textColor: text});
        }
        return events;
    };

    // ==============================================
    // ============================== Error Messaging

    // *********** Landing Page ********************

    // ------- Login Errors --------
    var loginErrors = function(err){
        var error = err.error,
            msg1 = $('.land-errormsg1'),
            msg2 = $('.land-errormsg2');


        if(error === 'Username required.' || error === 'Username or password incorrect.'){
            msg1.empty().append(error);
        }else{
            msg2.empty().append(error);
        }
    };

    // ------- Sign Up Errors -----------
    var signUpErrors = function(err){
        var error = err.error,
            msg1 = $('.land-errormsg3'),
            msg2 = $('.land-errormsg4'),
            msg3 = $('.land-errormsg5')
        ;

        if(error === 'Username required.' || error === 'Username already exists.'){
            msg1.empty().append(error);
        }else if(error === 'Password required.'){
            msg2.empty().append(error);
        }else{
            msg3.empty().append(error);
        }
    };

    // ----- Modal Errors ------
    var modalErrors = function(err){
        var error = err.error,
            msg1 = $('.modal-errormsg1');

        msg1.empty().append(error);
    };

    // ----- Account Edit Errors --
    var accErrors = function(err){
        var error = err.error,
            msg3 = $('.acc-errormsg3')
        ;

        msg3.empty().append(error);
    };


    // ------ clear errors ----------

    var clearErrors = function(){
        $('.err').each(function(){
            $(this).empty();
        });
    };

	// 	============================================
	//	============================= SETUP FOR INIT
		
	var init = function(){
		checkLoginState();
	};

	init();

})(jQuery); // end private scope




