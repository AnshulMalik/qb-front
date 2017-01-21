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
                // eventToken: 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJhcHBJZCI6IjM2NzNjYjMzLTA4YWUtNGVmZS05YmI0LTI3MDQxMzliMzEwZiIsImV4cCI6MTQ4NTQyMjk5OSwidXNlcklkIjoidTphb295a29peTloaWhtcDhpIiwiaWF0IjoxNDg0ODE4MTk5LCJqdGkiOiJjNDQ4NDA2Yy05MGI3LTQ5MjAtOGQ1NC04NWNjNGQ5YzJjYWQifQ.1BMkf-hz9-ovYUiskdYJsy7QcHLAInatQumP7b4_J04',
                // userId: 'u:aooykoiy9hihmp8i'
                eventToken: '',
                userId: '',
                contestId: '5883182fa263df4a9399ccc3',
                primaryUrl: 'http://af8604b3.ngrok.io/'
            },
            isPLayerListOpen: false
        },
        $Objects = {

        },
        Functions = {
            //cube control and game rules script
            RandChar: function () {
                return (function(){
                    var chars = "ABCDEFGHIJKLMNOPQURSTUVWXYZ";
                    return chars.substr( Math.floor(Math.random() * 26), 1);
                })();
            },
            InitializeCube : function(data){
                GameVar.Questions = data.data;
                console.log(data.data);
                $Objects.QuestionHolder.html(GameVar.Questions[GameVar.CurrentQuestion].text);
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
                if(index >= 0){
                    GameVar.Score+=5;
                    GameVar.Questions['words'][index] = '';
                    console.log($Objects.PlayerStatsButton.after(), GameVar.Score);
                    $Objects.PlayerStatsButton.attr('data-score', GameVar.Score);
                    Functions.Alert("Found a bonus word!!");
                }
                else {
                    console.log(GameVar.Questions['words'].indexOf(answer));
                }
            },
            //Page controls
            GetParams: function(){
                var params = window.location.search.substr(1).split('&');
                for(var i in params){
                    var object = params[i].split('=');
                    var key = object[0];
                    var value = object[1];
                    Globals.Contest[key] = value;
                    console.log(key, value);
                }
            },
            // Functions to trigger socket request on start contest
            // Check for valid data, if invalid data is entered error message is displayed
            StartSocket: function(){
                Globals.socket = io.connect(Globals.Contest.primaryUrl, {query: 'eventToken=' + Globals.Contest.eventToken + '&userId=' + Globals.Contest.userId});
                // Globals.socket.emit('create-contest', {name: 'Test Contest', start: Date.now(), numberOfQuestions: 10, participants: ['u:aooykoiy9hihmp8i'], language: 'english'});
                Globals.socket.emit('list-contacts', {'eventToken': Globals.Contest.eventToken});
                Globals.socket.on('list-contacts-complete', Functions.Display);
                Globals.socket.on('get-questions-complete', Functions.InitializeCube);
                // Globals.socket.on('join-contest-complete', Functions.Display);
                // Globals.socket.on('message', Functions.Display);
                // Globals.socket.on('err', Functions.Display);
                // Globals.socket.on('list-contacts-complete', Functions.Display);
                // Globals.socket.on('install-required', Functions.Display);
            },
            StartContest: function(){
                if(Functions.VerifyContest()){
                    Globals.socket.emit('get-questions', {contestId: Globals.Contest.contestId})
                }
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
            VerifyContest: function(){
                return (function (){
                    return true;
                })();
            },
            Display: function(data) {
                Functions.TogglePlayerList();
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
            SendInvites: function(){
                Globals.InviteList = [];
                var invited = $Objects.PlayerSelectList.find('li');
                for( var i = 0; i < invited.length; i++ ){
                    if($(invited[i]).attr('class') === 'active')   Globals.InviteList.push($(invited[i]).attr('id'));
                }
                console.log(Globals.InviteList);
            }
        };
    $d.ready(function(){
        Functions.GetParams();
        $Objects.PlayerSelect = $('#select-players');
        $Objects.PlayerSelectList = $Objects.PlayerSelect.find('ul');
        $Objects.ToggleInviteAll = $('#toggle-invite-all')
            .bind('click', function(){
                if(this.checked)    Functions.SelectAll(true);
                else if(!this.checked)    Functions.SelectAll(false);
            });
        $Objects.InvitePlayersBtn = $('#send-invites')
            .bind('click', Functions.SendInvites);
        $Objects.SubmitContest = $('#start-contest')
            .bind('click', Functions.StartContest);
        $Objects.PlayerNaviagtion = $('#player-list-button');
        $Objects.PlayerStatsButton = $('#player-stats-button');
        $Objects.GameFrame = $('#game-frame');
        $Objects.PlayerNaviagtion.on('click', Functions.TogglePlayerList);
        $('#close-players-list').on('click', Functions.TogglePlayerList);
        Functions.StartSocket();

        // Cube controls and game object bindings
        $Objects.QuestionHolder = $('#question-holder');
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
