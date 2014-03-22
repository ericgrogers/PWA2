/*  
	horas professional time management
	Author: Eric Rogers
*/

(function($){
	
	/*
	===============================================
	=========================== APPLICATION GLOBALS	
	*/
	
	var win = $(window),
		body = $(document.body),
		container = $('#container'),	// the only element in index.html
		currentUser = {},
        usr
	;

	/*
	===============================================
	========================= APPLICATION FUNCTIONS	
	*/

    // *********** Load Landing Page ***********************

	var loadLanding = function(){
		$.get('templates/landing.html', function(html){
			var h = $(html);
			var landingCode = h.find('#template_landing').html();
			$.template('landing', landingCode);		// compile template
			$.render(currentUser, 'landing');		// use template
			container.html(landingCode);

            $('#login_btn').on('click', login);
            $('#signup_btn').on('click', registerUser);
		});
        return false;
	};


    // ********* Load the application UI ***************

    var loadApp = function(){
        $.get('templates/app.html', function(html){
            var h = $(html);
            var appCode = h.find('#template_app').html();
            $.template('app', appCode);
            $.render(currentUser, 'app');
            container.html(appCode);
            displayProjects();
            $('#welcome_msg').empty().append('Welcome ' + usr + '!');

            // ----- Navigation Elements ------------

            $('.logout').on('click', logout);
            $('.my_account').on('click', loadAccount);
            $('#pnew_btn').on('click', newProject);
        });
        return false;
    };

    // ************ Load Account Edit Modal **********************

    var loadAccount = function(){
        $.get('templates/app.html', function(html){
            var h = $(html);
            var accountCode = h.find('#template_account_edit').html();
            $.template('app', accountCode);		// compile template
            $.render(currentUser, 'app');		// use template
            $('#container').append(accountCode);
            $('#overlay').animate({opacity: 1});
            $('#accmodal_container').css({
                top: win.height() / 2 - 327 / 2 + win.scrollTop(),
                left: win.width() / 2 - 602 / 2 + win.scrollLeft()
            });

            win.on('resize', accModalPos);

            // ----- Navigation Elements ---------------
            $('#cancel_link').on('click', accountCancel);
            $('#change_link').on('click', changeAccount);
        });
        return false;
    };

    // ************* Load Task Page Function ********************

    var loadTasks = function(id){
        $.get('templates/app.html', function(html){
            var h = $(html);
            var taskCode = h.find('#template_task').html();
            $.template('task', taskCode);
            $.render(currentUser, 'task');
            container.html(taskCode);
            $('#welcome_msg').empty().append('Welcome ' + usr + '!');
            displayTasks(id);


            // ------- Navigation Elements ---------

            $('.projects').on('click', loadApp);
            $('.my_account').on('click', loadAccount);
            $('.logout').on('click', logout);
            $('#tnew_btn').on('click', function(e){
                newTask(id);

                e.preventDefault();
                return false;
            });
        });

        return false;
    };

    // *************** New Project Modal ********************************

    var newProject = function(){
        $.get('templates/app.html', function(html){
            var h = $(html);
            var newProjectCode = h.find('#template_project_new').html();
            $.template('newProj', newProjectCode);		// compile template
            $.render(currentUser, 'newProj');		// use template
            $('#container').append(newProjectCode);
            $('#f_date').datepicker();
            $('#overlay').animate({opacity: 1});
            $('#modal_container').css({
                top: win.height() / 2 - 602 / 2 + win.scrollTop(),
                left: win.width() / 2 - 602 / 2 + win.scrollLeft()
            });

            win.on('resize', modalPos);

            // ------ Navigation Elements ----------

            $('#cancel_link').on('click', cancel);
            $('#add_link').on('click', addProject);
        });
        return false;
    };

    // ************** Edit Project Modal ************************

    var editProject = function(id){
        $.get('templates/app.html', function(html){
            var h = $(html);
            var editProjectCode = h.find('#template_project_edit').html();
            $.template('editProj', editProjectCode);		// compile template
            $.render(currentUser, 'editProj');		// use template
            $('#container').append(editProjectCode);
            $('#f_date').datepicker();
            $('#overlay').animate({opacity: 1});
            $('#modal_container').css({
                top: win.height() / 2 - 602 / 2 + win.scrollTop(),
                left: win.width() / 2 - 602 / 2 + win.scrollLeft()
            });

            win.on('resize', modalPos);

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

    // **************** New Task Modal ************************

    var newTask = function(id){
        $.get('templates/app.html', function(html){
            var h = $(html);
            var newTaskCode = h.find('#template_task_new').html();
            $.template('newTask', newTaskCode);		// compile template
            $.render(currentUser, 'newTask');		// use template
            $('#container').append(newTaskCode);
            $('#f_date').datepicker();
            $('#overlay').animate({opacity: 1});
            $('#modal_container').css({
                top: win.height() / 2 - 602 / 2 + win.scrollTop(),
                left: win.width() / 2 - 602 / 2 + win.scrollLeft()
            });

            win.on('resize', modalPos);

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

    // ****************** Edit Task Modal ***********************

    var editTask = function(id){
        $.get('templates/app.html', function(html){
            var h = $(html);
            var editTaskCode = h.find('#template_task_edit').html();
            $.template('editTask', editTaskCode);		// compile template
            $.render(currentUser, 'editTask');		// use template
            $('#container').append(editTaskCode);
            $('#f_date').datepicker();
            $('#overlay').animate({opacity: 1});
            $('#modal_container').css({
                top: win.height() / 2 - 602 / 2 + win.scrollTop(),
                left: win.width() / 2 - 602 / 2 + win.scrollLeft()
            });

            win.on('resize', modalPos);

            // -------- Navigation Elements -----------

            $('#cancel_link').on('click', cancel);
            $('#change_link').on('click', function(e){
                changeTask(id);
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
                        if(projectList.length <= 0){
                            $('.projects').append("<div class='noshow'>There are currently no projects to display. Click the 'New +' button to add a                            project.</div>");
                        }else{

                        // ------ Truncate description ------
                        $('.descrip_text').succinct({
                                size: 60
                        }); // ---- end truncate ------------

                        // ----------- Status Images ---------------

                        $('.status').each(function(i){
                            $(this).addClass(projectList[i].status);
                        }); // ----- end status images ------------

                        // ---------- Delete Buttons ----------------
                        $('.delete_btn').each(function(i){
                            $(this).attr('id', projectList[i].id);
                        }).on('click', function(){
                            var idd = Number($(this).attr('id'));
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
                        }); // ------- end delete buttons -------

                        // ------- Edit Buttons -------------

                        $('.edit_btn').each(function(i){
                            $(this).attr('id', projectList[i].id);
                        }).on('click', function(){
                                var idd = Number($(this).attr('id'));
                                editProject(idd);
                        }); // ---- end edit buttons

                        // -------- Click on project name to load it's tasks ---

                        $('.r_name').each(function(i){
                            $(this).attr('id', projectList[i].id);
                        }).on('click', function(){
                                var idd = Number($(this).attr('id'));
                                loadTasks(idd);
                        }); // ---- end of project name listener -------
                        }
                    });
                }

            }
        });
    };

    // ********************* Display Tasks Function ****************************

    var displayTasks = function(id){
        var taskList = [];

        $('.tasks').empty();
        $.ajax({
            url: 'xhr/get_tasks.php',
            type: 'get',
            data: {
                projectID: id
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
                        if(taskList.length <= 0){
                            $('.tasks').append("<div class='noshow'>There are currently no tasks to display. Click the 'New +' button to add a                            task.</div>");
                            $('.noshow').css({'marginTop': '90px'});
                        }else{

                        // ------ Truncate description ------
                        $('.descrip_text').succinct({
                            size: 60
                        }); // ---- end truncate ------------

                        // ----------- Status Images ---------------

                        $('.status').each(function(i){
                            $(this).addClass('t'+taskList[i].status);
                        }); // ----- end status images ------------

                        // ---------- Delete Buttons ----------------
                        $('.delete_btn').each(function(i){
                            $(this).attr('id', taskList[i].id);
                        }).on('click', function(){
                                var idd = Number($(this).attr('id'));
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
                                            loadTasks(id);
                                        }
                                    }
                                });
                            }); // ------- end delete buttons -------

                        // ------- Edit Buttons -------------

                        $('.edit_btn').each(function(i){
                            $(this).attr('id', taskList[i].id);
                        }).on('click', function(){
                                var idd = Number($(this).attr('id'));
                                editTask(idd);
                            }); // ---- end edit buttons -----

                        }
                    });
                }
            }
        });

    };

    // ************* Register New User Function *******************

    var registerUser = function(){
        var user = $('input#su_username').val();
        var pwd = $('input#su_password').val();
        var eml = $('input#su_email').val();

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
                    $('.errormsg').empty()
                        .append(response.error)
                        .css('visibility', 'visible');
                }else{
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

    // --------- Account Modal Positioning Function ---------

    var accModalPos = function(){
        $('#accmodal_container').stop(true).animate({
            top: win.height() / 2 - 327 / 2 + win.scrollTop(),
            left: win.width() / 2 - 602 / 2 + win.scrollLeft()
        }, 500);
    };

    // ---------- Project/Task Modal Positioning Function ------

    var modalPos = function(){
        $('#modal_container').stop(true).animate({
            top: win.height() / 2 - 602 / 2 + win.scrollTop(),
            left: win.width() / 2 - 602 / 2 + win.scrollLeft()
        }, 1200);
    };

    // ************* Change Account Function ******************

    var changeAccount = function(){
        var username = $('input#a_name').val();
        var pass = $('input#a_password').val();
        var eml = $('input#a_email').val();
        if(username === usr){
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
                        console.log(response.error);
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
                    $('.errormsg').empty()
                        .append(response.error)
                        .css('visibility', 'visible');
                }else{
                    console.log('success');
                    cancel();
                    loadApp();
                }
            }
        });
    };

    // ************** Change Project Function *****************

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
                        .css('visibility', 'visible');
                }else{
                    cancel();
                    loadApp();
                }
            }
        });
    };

    // *************** Add Task Function **********************

    var addTask = function(id){
        var name = $('input#f_name').val();
        var stat= $('select#f_priority').val();
        var descrip = $('textarea#f_description').val();
        var date = $('input#f_date').val();

        $.ajax({
            url: 'xhr/new_task.php',
            type: 'post',
            data: {
                projectID: id,
                taskName: name,
                status: stat,
                taskDescription: descrip,
                dueDate: date
            },
            dataType: 'json',
            success: function(response){
                if(response.error){
                    $('.errormsg').empty()
                        .append(response.error)
                        .css('visibility', 'visible');
                }else{
                    cancel();
                    setTimeout(function(){loadTasks(id)}, 1000);

                }
            }
        });
    };

    // ****************** Change Task Function *********************

    var changeTask = function(id){
        var name = $('input#f_name').val();
        var stat= $('select#f_priority').val();
        var descrip = $('textarea#f_description').val();
        var date = $('input#f_date').val();
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
                    setTimeout(function(){loadApp()}, 1000);

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
    ================================================
    ========================= Login/Logout Functions
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
                    loadApp();
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
                    $('.errormsg').empty()
                        .append(response.error)
                        .css('visibility', 'visible');


                }else{
                    usr = response.user.user_n;
                    loadApp();
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

	// 	============================================
	//	SETUP FOR INIT
		
	var init = function(){
		checkLoginState();
	};

	init();

})(jQuery); // end private scope




