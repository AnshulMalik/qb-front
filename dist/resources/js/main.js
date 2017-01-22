/**
 * Created by Kaushik on 1/8/2017.
 */
(function($d, $w, $, t){
    var GameVar = {
            CurrentSolution: {
                string: '',
                face: -1,
                x: -1,
                y: -1,
                hashed: ''
            },
            Score: 0,
            Questions: [
            ],
            CurrentQuestion: 0
        },
        Controller = {
            isDragging: false,
            isDraggingKey: false,
            mouse: {
                xpos: 0,
                ypos: 0
            },
            cube: {
                rotateX: 45,
                rotateY: 45,
                scale: 0.9
            }
        },
        Globals = {
            Contest: {
                eventToken: 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJhcHBJZCI6IjM2NzNjYjMzLTA4YWUtNGVmZS05YmI0LTI3MDQxMzliMzEwZiIsImV4cCI6MTQ4NDgxNzIyOSwidXNlcklkIjoidTp4bjJuNzczMXF6MnpmMzIyIiwiaWF0IjoxNDg0MjEyNDI5LCJqdGkiOiJjM2ZlYzg5MC02MTQ3LTQwNzctYjk4MC0xZTc0M2U0YjBiZTkifQ.j6LiFfClJvS7r56i2M2d8KtnDRDrkCfwMph5yrcrNuQ',
                userId: 'u:xn2n7731qz2zf322',
                primaryUrl: 'https://b81b9070.ngrok.io/'
            },
            contestId: '',
            NewContest: {

            },
            InviteList: [],
            isPLayerListOpen: false,
            contestTimer: -1
        },
        $Objects = {

        },
        Functions = {
            //cube control and game rules script
            InitializeCube : function(){
                t.set($Objects.GameFrame, {
                    display: 'block',
                    opacity: 1
                });
                $Objects.QuestionHolder.html(GameVar.Questions[GameVar.CurrentQuestion].text);
                $Objects.QuestionNumberHolder.html((GameVar.CurrentQuestion + 1) + ' of ' + GameVar.Questions.length);
                for (var i = 2; i < 6; i++){
                    $($Objects.CubeFaces[i]).html('');
                    for (var j = 0; j < 25; j++){
                        if(Math.ceil(j/5)%2 === 0 && j%2 === 0)    c = '';
                        else if(Math.ceil(j/5)%2 === 1 && j%2 === 0) c = '';
                        else c = 'tile';
                        var item = $('<div class="character '+ c +'"><span>'+ GameVar.Questions[GameVar.CurrentQuestion].grid[i-2][j] +'</span></div>');
                        item.on('mouseenter', function(){
                            if(Controller.isSelecting){
                                var ch = $(this).find('span').html();
                                GameVar.CurrentSolution.string += ch;
                                $Objects.SelectedAnswerDisplay.append('<span>'+ ch +'</span>');
                            }
                        });
                        $($Objects.CubeFaces[i]).append(item);
                    }
                }
                t.to($Objects.Cube, 0.5, {
                    scaleX: Controller.cube.scale,
                    scaleY: Controller.cube.scale,
                    scaleZ: Controller.cube.scale
                });
            },
            RotateLeft: function(l){
                Controller.cube.rotateY -= l/4;
                if(Controller.cube.rotateY){

                }
                t.to($Objects.Cube, 0.25, {
                    transform: 'scaleX(0.9) scaleY(0.9) scaleZ(0.9) rotateY(' + Controller.cube.rotateY + 'deg)',
                    ease: Back.easeOut,
                    onComplete: function(){
                    }
                });
            },
            RotateRight: function(l){
                Controller.cube.rotateY += l/4;
                t.to($Objects.Cube, 0.25, {
                    transform: 'scaleX(0.9) scaleY(0.9) scaleZ(0.9) rotateY(' + Controller.cube.rotateY + 'deg)',
                    ease: Back.easeOut,
                    onComplete: function(){
                    }
                });
            },
            CheckSolution: function(answer){
                var index = GameVar.Questions[GameVar.CurrentQuestion]['words'].indexOf(answer);
                console.log(index);
                if(index >= 0){
                    GameVar.Score+=5;
                    GameVar.Questions[GameVar.CurrentQuestion]['words'][index] = '';
                    $Objects.GameFrame.attr('data-score', 'Score: ' + GameVar.Score);
                    alert("Found a bonus word!!");
                }
                else {
                    console.log(GameVar.Questions[GameVar.CurrentQuestion]['words'].indexOf(answer));
                }
            },
            NextQuestion: function(){
                if(GameVar.CurrentQuestion < GameVar.Questions.length - 1){
                    GameVar.CurrentQuestion++;
                    Functions.InitializeCube();
                } else{
                    console.log('Last question reached');
                }
            },
            PreviousQuestion: function(){
                if(GameVar.CurrentQuestion > 0){
                    GameVar.CurrentQuestion--;
                    Functions.InitializeCube();
                } else{
                    console.log('first question reached');
                }
            },
            //Page controls
            GetParams: function(){
                var params = window.location.search.substr(1).split('&');
                for(var i in params){
                    var object = params[parseInt(i)].split('=');
                    var key = object[0];
                    Globals.Contest[key] = object[1];
                }
                Globals.Contest['flockEvent'] = JSON.parse(decodeURIComponent(Globals.Contest['flockEvent']));
                $Objects.UserName.html('Welcome ' + Globals.Contest.flockEvent['userName'] + ' !');
                //Start a socket once userId is read from the page url
                Functions.StartSocket();
                if(Globals.Contest.flockEvent.button === "attachmentButton"){
                    Globals.Contest.flockEvent.attachmentId = JSON.parse(Globals.Contest.flockEvent.attachmentId);
                    Globals.Contest.contestId = Globals.Contest.flockEvent.attachmentId.contestId;
                    Functions.JoinContest();
                } else {
                    t.set($('.contest-form'), {
                        display: 'block'
                    });
                }
                console.log(Globals.Contest);
            },
            JoinContest: function(){
                Globals.NewContest = {};
                Globals.NewContest.Start = Globals.Contest.flockEvent.attachmentId.startTime;
                Functions.StartNewTimer();
                Globals.socket.emit('join-contest', {contestId: Globals.Contest.contestId});
                Globals.socket.on('join-contest-complete', Functions.StartNewTimer);
            },
            GetAllQuestions: function(questions){
                GameVar.Questions = questions.data;
                Functions.StartGameTimer();
                //Hide the contest start form and display the cube
                Functions.InitializeCube();
            },
            ListCategories: function(categories){
                console.log(categories, 'Listing');
                var container = $('#contest-category-input');
                container.html('<option>-none-</option>');
                for(var i = 0; i < categories.data.length; i++){
                    container.append('<option>' +categories.data[i]+ '</option>')
                }
            },
            StartGame: function(){
                t.set($('.contest-form'), {
                    display: 'none'
                });
                Globals.socket.emit('get-questions', {contestId: Globals.Contest.contestId});
                Globals.socket.on('get-questions-complete', Functions.GetAllQuestions);
            },
            // Functions to trigger socket request on start contest
            // Check for valid data, if invalid data is entered error message is displayed
            StartSocket: function(){
                Globals.socket = io.connect(Globals.Contest.primaryUrl, {query: 'eventToken=' + Globals.Contest['flockEventToken'] + '&userId=' + Globals.Contest['flockEvent'].userId});
                Globals.socket.on('create-contest-complete', function(response){
                    if(response.status.code === 200){
                        Functions.StartNewTimer();
                        Globals.Contest.contestId = response.data.contestId;
                    } else {
                        alert('Could not create contest !');
                    }
                });

                //Query the list of categories and display them
                Globals.socket.emit('list-categories');
                Globals.socket.on('list-categories-complete', Functions.ListCategories);
                //Query the list of contacts
                Globals.socket.emit('list-contacts', {'eventToken': Globals.Contest['flockEventToken']});
                Globals.socket.on('list-contacts-complete', Functions.DisplayInviteList);

                //Globals.socket.on('install-required', Functions.Display);
                //Globals.socket.on('message', Functions.Display);
                //Globals.socket.on('err', Functions.Display);
                //Globals.socket = io.connect(Globals.Contest.primaryUrl, {query: 'eventToken=' + Globals.Contest.eventToken + '&userId=' + Globals.Contest.userId});
            },
            StartContest: function(){
                if(confirm(Globals.InviteList.length + ' players invited')){
                    if(Functions.VerifyContest()){
                        Globals.socket.emit('create-contest', {name: Globals.NewContest.Name, start: Globals.NewContest.Start, numberOfQuestions: Globals.NewContest.NumberOfQuestions, participants: Globals.InviteList, language: Globals.NewContest.Category});
                    }
                } else {
                    Functions.TogglePlayerList();
                }
            },
            RemainingTime: function(current, reference, timer) {
                var t = reference - current;
                var seconds = Math.floor( (t/1000) % 60 );
                var minutes = Math.floor( (t/1000/60) % 60 );
                var hours = Math.floor( (t/(1000*60*60)) % 24 );
                if(timer.Hours !== undefined)    timer.Hours.html(('0' + hours).slice(-2));
                timer.Minutes.html(('0' + minutes).slice(-2));
                timer.Seconds.html(('0' + seconds).slice(-2));
                return {'hour': hours, 'min': minutes, 'sec': seconds, 'total': t};
            },
            StartNewTimer: function(){
                t.set($('.contest-form'), {display: 'none'});
                t.set($Objects.ContestStartTimer.Container, {display: 'inline-block'});
                Globals.contestTimer = setInterval(function(){
                    var ctime = Date.now();
                    var remaining = Functions.RemainingTime(ctime, Globals.NewContest.Start, $Objects.ContestStartTimer);
                    if(remaining.total < 0) {
                        clearInterval(Globals.contestTimer);
                        $Objects.ContestStartTimer.Minutes.html('00');
                        $Objects.ContestStartTimer.Seconds.html('00');
                        Functions.StartGame();
                    }
                }, 1000);
            },
            StartGameTimer: function(){
                console.log('timing');
                Globals.gameTimer = setInterval(function(){
                    var ctime = Date.now();
                    var remaining = Functions.RemainingTime(ctime, Globals.NewContest.End, $Objects.GameTimer);
                    if(remaining.total < 0) {
                        clearInterval(Globals.gameTimer);
                        $Objects.GameTimer.Hour.html('00');
                        $Objects.GameTimer.Minutes.html('00');
                        $Objects.GameTimer.Seconds.html('00');
                        Functions.StartGame();
                    }
                }, 1000);
            },
            VerifyContest: function(){
                //console.log((new Date()).getTime(), Date.now());
                Globals.NewContest.Name = $('#contest-name-input').val();
                Globals.NewContest.NumberOfQuestions = parseInt($('#contest-numq-input').val());
                Globals.NewContest.Category = $('#contest-category-input').val();
                var offset = parseInt($('#contest-start-input').val().split(' ')[0]);
                Globals.NewContest.Start = Date.now() + offset*60*1000;
                Globals.NewContest.End = Globals.NewContest.Start + 5000*Globals.NewContest.NumberOfQuestions;
                console.log(Globals.NewContest);
                if(Globals.NewContest.Name === '' || Globals.NewContest.Category === '-none-')
                {
                    console.log('Please enter a name and select a category');
                } else {
                    return (function(){
                        return true;
                    })();
                }
            },
            DisplayInviteList: function(data) {
                console.log(data);
                $Objects.PlayerSelectList.html('');
                $Objects.PlayersInviteList =  [];
                for(var i = 0; i < data.length; i++){
                    var item = $('<li id="' + data[i].id + '">' + data[i].firstName + ' ' + data[i].lastName + ' </li>')
                        .bind('click', function(){
                            if($(this).attr('class') === undefined || $(this).attr('class') === '')     $(this).addClass('active');
                            else {
                                $(this).removeClass('active');
                                $Objects.ToggleInviteAll[0].checked = false;
                            }
                        });
                    $Objects.PlayersInviteList.push(item);
                    $Objects.PlayerSelectList.append(item);
                }
                Functions.TogglePlayerList();
            },
            //Function to list players who have joined the contest, called on 'join-contest-complete'
            ListPlayers: function(data){
            },
            TogglePlayerList: function(){
                if(!Globals.isPLayerListOpen){
                    t.to($Objects.PlayerSelect, 0.5, {
                        left: 0,
                        onComplete: function(){
                            Globals.isPLayerListOpen = true;
                        }
                    });
                }
                else {
                    t.to($Objects.PlayerSelect, 0.5, {
                        left: '-320px',
                        onComplete: function(){
                            Globals.isPLayerListOpen = false;
                        }
                    });
                }
            },
            SelectAll: function(state){
                if(state)   {
                    for(var i = 0; i < $Objects.PlayersInviteList.length; i++){
                        $Objects.PlayersInviteList[i].attr('class', 'active');
                    }
                }
                else if(!state)   {
                    for(var i = 0; i < $Objects.PlayersInviteList.length; i++){
                        $Objects.PlayersInviteList[i].attr('class', '');
                    }
                }
            },
            AddInvites: function(){
                Globals.InviteList = [];
                var invited = $Objects.PlayerSelectList.find('li');
                for( var i = 0; i < invited.length; i++ ){
                    if($(invited[i]).attr('class') === 'active')   Globals.InviteList.push($(invited[i]).attr('id'));
                }
            }
        };
    $d.ready(function(){
        $Objects.UserName = $('.user-name');
        $Objects.ContestStartTimer = {};
        $Objects.ContestStartTimer.Container = $('#contest-start-timer');
        $Objects.ContestStartTimer.Minutes = $('#contest-start-min');
        $Objects.ContestStartTimer.Seconds = $('#contest-start-sec');
        Functions.GetParams();
        $Objects.PlayerSelect = $('#select-players');
        $Objects.PlayerSelectList = $Objects.PlayerSelect.find('ul');
        $Objects.ToggleInviteAll = $('#toggle-invite-all')
            .bind('click', function(){
                if(this.checked)    Functions.SelectAll(true);
                else if(!this.checked)    Functions.SelectAll(false);
            });
        $Objects.SubmitContest = $('#start-contest')
            .bind('click', Functions.StartContest);
        $Objects.PlayerNaviagtion = $('#player-list-button');
        $Objects.PlayerStatsButton = $('#player-stats-button');
        $Objects.GameFrame = $('#game-frame');
        $Objects.PlayerNaviagtion.on('click', Functions.TogglePlayerList);
        $('#close-players-list').on('click', Functions.TogglePlayerList);

        $Objects.NextQuestion = $('#next-question')
            .bind('click', Functions.NextQuestion);
        $Objects.PreviousQuestion = $('#previous-question')
            .bind('click', Functions.PreviousQuestion);
        // Cube controls and game object bindings
        $Objects.GameTimer = {};
        $Objects.GameTimer.Container = $('#game-timer');
        $Objects.GameTimer.Hour = $('#game-timer-hour');
        $Objects.GameTimer.Minutes = $('#game-timer-min');
        $Objects.GameTimer.Seconds = $('#game-timer-sec');
        $Objects.QuestionHolder = $('#question-holder');
        $Objects.QuestionNumberHolder = $('#question-number');
        $Objects.Cube = $('div.cube');
        Controller.cube.matrix = $Objects.Cube.css('transform');
        $Objects.CubeFaces = $('figure');
        $Objects.SelectedAnswerDisplay = $('#selected-answer');
        $('div.character').on('mouseenter', function(){
            if(Controller.isSelecting){
                var ch = $(this).find('span').html();
                GameVar.CurrentSolution.string += ch;
                $Objects.SelectedAnswerDisplay.append('<span>'+ ch +'</span>');
            }
        });
        // controlling the cube movement
        $Objects.GameFrame.mousedown(function(event) {
                Controller.mouse.xpos = event.pageX;
                Controller.mouse.ypos = event.pageY;
                if(!$(event.target).closest('.cube').length) {
                    Controller.isDragging = true;
                } else {
                    var $item = $(event.target);
                    var c = '';
                    if($item.is('div')) c = $item.find('span').html();
                    else if($item.is('span')) c = $item.html();
                    if(c !== ''){
                        Controller.isSelecting = true;
                        GameVar.CurrentSolution.string = c;
                        $Objects.SelectedAnswerDisplay.html('<span>'+ c +'</span>');
                        GameVar.CurrentSolution.face = $item.closest('figure').index() - 2;
                        GameVar.CurrentSolution.x = Math.floor($item.index()/5);
                        GameVar.CurrentSolution.y = GameVar.CurrentSolution.face*5 + Math.floor($item.index()%5);
                    }
                }
            })
            .mousemove(function(event) {
                if(Controller.isDragging){
                    var x = event.pageX,
                        y = event.pageY;
                    if(Controller.mouse.xpos < x)   Functions.RotateRight(Math.abs(Controller.mouse.xpos - x));
                    else if(Controller.mouse.xpos > x)   Functions.RotateLeft(Math.abs(Controller.mouse.xpos - x));
                    Controller.mouse.xpos = x;
                    Controller.mouse.ypos = y;
                }
            })
            .mouseup(function() {
                var wasSelecting = Controller.isSelecting;
                Controller.isDragging = false;
                Controller.isSelecting = false;
                if(wasSelecting){
                    GameVar.CurrentSolution.hashed = md4(GameVar.CurrentSolution.y + ',' + GameVar.CurrentSolution.x + ',' + GameVar.CurrentSolution.string);
                    console.log(GameVar.CurrentSolution);
                    Functions.CheckSolution(GameVar.CurrentSolution.hashed);
                }
            });
        $d.mouseup(function() {
            var wasSelecting = Controller.isSelecting;
            Controller.isDragging = false;
            Controller.isSelecting = false;
            if(wasSelecting){
                GameVar.CurrentSolution.hashed = md4(GameVar.CurrentSolution.y + ',' + GameVar.CurrentSolution.x + ',' + GameVar.CurrentSolution.string);
                console.log(GameVar.CurrentSolution);
                Functions.CheckSolution(GameVar.CurrentSolution.hashed);
            }
        });
        $d.keydown(function(event) {
                if(event.keyCode === 37)   Functions.RotateLeft(5);
                else if(event.keyCode === 39)   Functions.RotateRight(5);
            })
            .keyup(function() {
                Controller.isDraggingKey =  false;
            });
    });
})(jQuery(document), jQuery(window), jQuery, TweenMax);