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
                //eventToken: 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJhcHBJZCI6IjM2NzNjYjMzLTA4YWUtNGVmZS05YmI0LTI3MDQxMzliMzEwZiIsImV4cCI6MTQ4NDgxNzIyOSwidXNlcklkIjoidTp4bjJuNzczMXF6MnpmMzIyIiwiaWF0IjoxNDg0MjEyNDI5LCJqdGkiOiJjM2ZlYzg5MC02MTQ3LTQwNzctYjk4MC0xZTc0M2U0YjBiZTkifQ.j6LiFfClJvS7r56i2M2d8KtnDRDrkCfwMph5yrcrNuQ',
                //userId: 'u:xn2n7731qz2zf322',
                primaryUrl: 'https://41a40735.ngrok.io/'
            },
            contestId: '',
            NewContest: {

            },
            InviteList: [],
            isPLayerListOpen: false,
            contestTimer: -1,
            Winner: {
                name: '',
                Score: 0
            },
            Me: {
                name: '',
                score: 0,
            }
        },
        $Objects = {

        },
        Functions = {
            ShowAlert: function(string){
                $Objects.AlertBox.find('#alert-body').html(string);
                t.fromTo($Objects.AlertBox, 0.5, {
                    bottom: '-100px'
                }, {
                    bottom: 0,
                    ease: Back.easeIn
                });
            },
            DismissAlert: function(){
                t.to($Objects.AlertBox, 0.5, {
                    bottom: '-100px',
                    ease: Back.easeIn
                });
            },
            //cube control and game rules script
            InitializeCube : function(){
                Functions.DismissAlert();
                t.fromTo($Objects.QuestionHolder, 0.5, {
                    scale: 1,
                    top: '0px',
                    opacity: 1
                },{
                    opacity: 0,
                    top: 0,
                    scale: 0.9,
                    onComplete: function(){
                        $Objects.QuestionHolder.html(GameVar.Questions[GameVar.CurrentQuestion].text);
                        t.fromTo($Objects.QuestionHolder, 0.5, {
                            top: '-10px',
                            scale: 1.05,
                            opacity: 0
                        },{
                            top: 0,
                            scale: 1,
                            opacity: 1
                        });
                    }
                });
                $Objects.QuestionNumberHolder.html((GameVar.CurrentQuestion + 1) + ' of ' + GameVar.Questions.length);
                $Objects.SelectedAnswerDisplay.html('');
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
                t.set($Objects.Cube, {
                    transform: 'scaleX(0.9) scaleY(0.9) scaleZ(0.9) rotateY(' + Controller.cube.rotateY + 'deg)',
                    ease: Back.easeOut,
                    onComplete: function(){
                    }
                });
            },
            RotateRight: function(l){
                Controller.cube.rotateY += l/4;
                t.set($Objects.Cube, {
                    transform: 'scaleX(0.9) scaleY(0.9) scaleZ(0.9) rotateY(' + Controller.cube.rotateY + 'deg)',
                    ease: Back.easeOut,
                    onComplete: function(){
                    }
                });
            },
            CheckSolution: function(answer){
                var index = GameVar.Questions[GameVar.CurrentQuestion]['words'].indexOf(answer.hashed);
                console.log("index hashed", index);
                if(index >= 0){
                    Globals.socket.emit('submit-answer', {questionId: GameVar.Questions[GameVar.CurrentQuestion].id, text: answer.y + ',' + answer.x + ',' + answer.string, contestId: Globals.Contest.contestId});
                }
                else {
                    Functions.ShowAlert('<strong>Sorry! </strong>Keep looking!');
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
                if(window.location.search.indexOf('attachmentButton') < 0)
                    t.set($('.contest-form'), {
                        display: 'block'
                    });
                for(var i in params){
                    var object = params[parseInt(i)].split('=');
                    var key = object[0];
                    Globals.Contest[key] = object[1];
                }
                Globals.Contest['flockEvent'] = JSON.parse(decodeURIComponent(Globals.Contest['flockEvent']));
                //Start a socket once userId is read from the page url
                Functions.StartSocket();
                if(Globals.Contest.flockEvent.button === 'attachmentButton'){
                    Globals.Contest.flockEvent.attachmentId = JSON.parse(Globals.Contest.flockEvent.attachmentId);
                    Globals.Contest.contestId = Globals.Contest.flockEvent.attachmentId.contestId;
                    Globals.NewContest.Start = new Date(Globals.Contest.flockEvent.attachmentId.start);
                    Globals.NewContest.End = new Date(Globals.Contest.flockEvent.attachmentId.end);
                    console.log("Dates: ", Globals.NewContest.Start, Globals.NewContest.End);
                    Globals.socket.emit('join-contest', {contestId: Globals.Contest.contestId});
                } else {
                    Globals.socket.emit('list-categories');
                    Globals.socket.emit('list-contacts', {'eventToken': Globals.Contest['flockEventToken']});
                    t.set($('.contest-form'), {
                        display: 'block'
                    });
                }
                //console.log(Globals.Contest);
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
                t.set($('.contest-start'), {
                    display: 'none'
                });
                t.fromTo($Objects.GameFrame, 0.5, {
                    display: 'block',
                    opacity: 0,
                    scale: 1.05
                },{
                    opacity: 1,
                    scale: 1
                });
                Globals.socket.emit('get-leaderboard', {contestId: Globals.Contest.contestId});
                $Objects.PlayerSelect = $('#select-players');
                $Objects.PlayerSelect.html('<h3>Scores</h3><ul></ul>');
                Globals.socket.emit('get-questions', {contestId: Globals.Contest.contestId});
                Globals.socket.on('get-questions-complete', Functions.GetAllQuestions);
            },
            // Functions to trigger socket request on start contest
            // Check for valid data, if invalid data is entered error message is displayed
            StartSocket: function(){
                Globals.socket = io.connect(Globals.Contest.primaryUrl, {query: 'eventToken=' + Globals.Contest['flockEventToken'] + '&userId=' + Globals.Contest['flockEvent'].userId});
                Globals.socket.on('create-contest-complete', function(response){
                    console.log(response);
                    if(response.status.code === 200){
                        Functions.StartNewTimer();
                        Globals.Contest.contestId = response.data.contestId;
                    } else {
                        Functions.ShowAlert('<strong>Error! </strong>Could not create contest!!');
                    }
                });

                //Query the list of categories and display them
                Globals.socket.on('list-categories-complete', Functions.ListCategories);
                //Query the list of contacts
                Globals.socket.on('list-contacts-complete', Functions.DisplayInviteList);
                //On join-contest event complete
                Globals.socket.on('join-contest-complete', Functions.StartNewTimer);

                //On show-leader event complete
                Globals.socket.on('get-leaderboard-complete', Functions.ChangeLeaderBoard);

                Globals.socket.on('submit-answer-complete', function(data){
                    console.log('submit-complete', data);
                    if(data.status.code === 200){
                        if(data.data.type === 'answer') {
                            GameVar.Score = data.data.newScore;
                            $Objects.GameFrame.attr('data-score', 'Score: ' + GameVar.Score);
                            Functions.ShowAlert("<strong>Congratulations! </strong>Found the correct Answer!!");
                        } else if(data.data.type === 'bonus'){
                            GameVar.Score = data.data.newScore;
                            $Objects.GameFrame.attr('data-score', 'Score: ' + GameVar.Score);
                            Functions.ShowAlert("<strong>Wow! </strong>Found the bonus word!!");
                        } else {
                            Functions.ShowAlert("<strong>Sorry! </strong>Answer already submitted!!");
                        }
                    } else{

                    }
                });

                Globals.socket.on('user-joined', function(data){
                    Functions.ShowAlert('user joined ' + data.data);
                });
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
                Globals.socket.emit('show-leaderboard', {contestId: Globals.Contest.contestId});
                Globals.gameTimer = setInterval(function(){
                    var ctime = Date.now();
                    var remaining = Functions.RemainingTime(ctime, Globals.NewContest.End, $Objects.GameTimer);
                    if(remaining.total < 0) {
                        clearInterval(Globals.gameTimer);
                        $Objects.GameTimer.Hours.html('00');
                        $Objects.GameTimer.Minutes.html('00');
                        $Objects.GameTimer.Seconds.html('00');
                        Functions.StopGame();
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
                Globals.NewContest.End = Globals.NewContest.Start + 300000*Globals.NewContest.NumberOfQuestions;
                console.log(Globals.NewContest);
                if(Globals.NewContest.Name === '' || Globals.NewContest.Category === '-none-')
                {
                    Functions.ShowAlert('Please enter a name and select a category');
                } else {
                    return true;
                }
            },
            DisplayInviteList: function(data) {
                console.log(data);
                $Objects.PlayerSelectList.html('');
                $Objects.PlayersInviteList =  [];
                for(var i = 0; i < data.data.length; i++){
                    var item = $('<li id="' + data.data[i].id + '">' + data.data[i].firstName + ' ' + data.data[i].lastName + ' </li>')
                        .bind('click', function(){
                            if($(this).attr('class') === undefined || $(this).attr('class') === '') {
                                $(this).addClass('active');
                                Globals.InviteList.push($(this).attr('id'));
                            }
                            else {
                                $(this).removeClass('active');
                                var id = $(this).attr('id');
                                console.log('find', Globals.InviteList.indexOf(id));
                                Globals.InviteList.splice($.inArray(id, Globals.InviteList), 1 );
                                $Objects.ToggleInviteAll[0].checked = false;
                            }
                        });
                    $Objects.PlayersInviteList.push(item);
                    $Objects.PlayerSelectList.append(item);
                }
                Functions.TogglePlayerList();
            },
            //Function to list players who have joined the contest, called on 'join-contest-complete'
            ChangeLeaderBoard: function(data){
                $Objects.PlayerSelectList = $Objects.PlayerSelect.find('ul');
                $Objects.PlayerSelectList.html('');
                for(var i = 0; i < data.data.length; i++){
                    var item = $('<li class="active" id="' + data.data[i].id + '">' + data.data[i].firstName + ' ' + data.data[i].lastName + '<span class="badge">' + data.data[i].score + '</span></li>');
                    $Objects.PlayerSelectList.append(item);
                    if(data.data[i].id === Globals.Contest.flockEvent.userId)
                    {
                        $Objects.GameFrame.attr('data-score', 'Score: ' + data.data[i].score);
                    }
                    if(data.data[i].score > Globals.Winner.Score)
                    {
                        Globals.Winner.Score = data.data[i].score;
                        Globals.Winner.name = data.data[i].firstName + ' ' + data.data[i].lastName;
                    }
                }
                if(!Globals.isPLayerListOpen)
                    Functions.TogglePlayerList();
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
            StopGame: function(){
                Globals.socket.disconnect();
                if(Globals.isPLayerListOpen)
                    Functions.TogglePlayerList();
                t.set($('.game-frame-cover'), {
                    display: 'block'
                });
                $('.game-frame-cover').find('span').html('Winner is <strong>' + Globals.Winner.name + '</strong><br/> with ' + Globals.Winner.Score + ' points');
            }
        };
    $d.ready(function(){
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
        $Objects.PlayerStatsButton.on('click', Functions.TogglePlayerList);
        $('#close-players-list').on('click', Functions.TogglePlayerList);

        $Objects.NextQuestion = $('#next-question')
            .bind('click', Functions.NextQuestion);
        $Objects.PreviousQuestion = $('#previous-question')
            .bind('click', Functions.PreviousQuestion);
        // Cube controls and game object bindings
        $Objects.GameTimer = {};
        $Objects.GameTimer.Container = $('#game-timer');
        $Objects.GameTimer.Hours = $('#game-timer-hour');
        $Objects.GameTimer.Minutes = $('#game-timer-min');
        $Objects.GameTimer.Seconds = $('#game-timer-sec');
        $Objects.QuestionHolder = $('#question-holder');
        $Objects.QuestionNumberHolder = $('#question-number');
        $Objects.Cube = $('div.cube');
        Controller.cube.matrix = $Objects.Cube.css('transform');
        $Objects.CubeFaces = $('figure');
        $Objects.SelectedAnswerDisplay = $('#selected-answer');
        $Objects.AlertBox = $('#alert-box');
        $Objects.AlertBoxDismiss = $Objects.AlertBox.find('button')
            .bind('click', Functions.DismissAlert);
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
                    if($item.is('div')){
                        c = $item.find('span').html();
                        GameVar.CurrentSolution.face = $item.closest('figure').index() - 2;
                        GameVar.CurrentSolution.x = Math.floor($item.index()/5);
                        GameVar.CurrentSolution.y = GameVar.CurrentSolution.face*5 + Math.floor($item.index()%5);
                    }
                    else if($item.is('span')){
                        c = $item.html();
                        GameVar.CurrentSolution.face = $item.closest('figure').index() - 2;
                        GameVar.CurrentSolution.x = Math.floor($item.closest('div').index()/5);
                        GameVar.CurrentSolution.y = GameVar.CurrentSolution.face*5 + Math.floor($item.closest('div').index()%5);
                    }
                    if(c !== ''){
                        Controller.isSelecting = true;
                        GameVar.CurrentSolution.string = c;
                        $Objects.SelectedAnswerDisplay.html('<span>'+ c +'</span>');
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
                    Functions.CheckSolution(GameVar.CurrentSolution);
                }
            });
        $d.mousedown(function(event){
            if(Globals.isPLayerListOpen && event.target.closest('#select-players').length === 0)
                Functions.TogglePlayerList();
        });
        $d.mouseup(function() {
            var wasSelecting = Controller.isSelecting;
            Controller.isDragging = false;
            Controller.isSelecting = false;
            if(wasSelecting){
                GameVar.CurrentSolution.hashed = md4(GameVar.CurrentSolution.y + ',' + GameVar.CurrentSolution.x + ',' + GameVar.CurrentSolution.string);
                console.log(GameVar.CurrentSolution);
                Functions.CheckSolution(GameVar.CurrentSolution);
            }
        });
        $d.keydown(function(event) {
                if(event.keyCode === 37)   Functions.RotateLeft(5);
                else if(event.keyCode === 39)   Functions.RotateRight(5);
            })
            .keyup(function() {
                Controller.isDraggingKey =  false;
            });
        $d.keypress(function(event){

        });
    });
})(jQuery(document), jQuery(window), jQuery, TweenMax);