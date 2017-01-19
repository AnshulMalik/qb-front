/**
 * Created by Kaushik on 1/8/2017.
 */
(function($d, $w, $, t){
    var Globals = {
            Contest: {
              eventToken: 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJhcHBJZCI6IjM2NzNjYjMzLTA4YWUtNGVmZS05YmI0LTI3MDQxMzliMzEwZiIsImV4cCI6MTQ4NTQyMjk5OSwidXNlcklkIjoidTphb295a29peTloaWhtcDhpIiwiaWF0IjoxNDg0ODE4MTk5LCJqdGkiOiJjNDQ4NDA2Yy05MGI3LTQ5MjAtOGQ1NC04NWNjNGQ5YzJjYWQifQ.1BMkf-hz9-ovYUiskdYJsy7QcHLAInatQumP7b4_J04',
              userId: 'u:aooykoiy9hihmp8i'
            },
            isPLayerListOpen: false
        },
        $Objects = {

        },
        Functions = {
            // Functions to trigger socket request on start contest
            // Check for valid data, if invalid data is entered error message is displayed
            StartSocket: function(){
                Globals.socket = io.connect('http://localhost:3000/', {query: 'eventToken=' + Globals.Contest.eventToken + '&userId=' + Globals.Contest.userId});
                Globals.socket.on('list-contacts-complete', Functions.Display);
            },
            StartContest: function(){
                if(Functions.VerifyContest()){
                    Functions.StartSocket();
                    Globals.socket.emit('list-contacts', {'eventToken': Globals.Contest.eventToken});
                }
                // Globals.socket.on('join-contest-complete', Functions.Display);
                // Globals.socket.on('message', Functions.Display);
                // Globals.socket.on('get-questions-complete', Functions.Display);
                // Globals.socket.on('err', Functions.Display);
                // Globals.socket.on('list-contacts-complete', Functions.Display);
                // Globals.socket.on('install-required', Functions.Display);
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
                        left: '-300px',
                        onComplete: function(){
                            Globals.isPLayerListOpen = false;
                        }
                    });
                }
            },
            VerifyContest: function(){
                return true;
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
        $Objects.GameFrame = $('#game-frame');
        $Objects.PlayerNaviagtion.on('click', Functions.TogglePlayerList);
    });
})(jQuery(document), jQuery(window), jQuery, TweenMax);
