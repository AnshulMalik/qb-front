/**
 * Created by Kaushik on 1/6/2017.
 */
(function($d, $w, $, t){
    var GameVar = {
            CurrentSolution: {
                string: '',
                face: -1,
                x: -1,
                y: -1,
                hashed: ''
            }
        },
        $Objects = {},
        Controller = {
            isDragging: false,
            isDraggingKey: false,
            mouse: {
                xpos: 0,
                ypos: 0
            },
            cube: {
                rotateX: 45,
                rotateY: 45
            }
        },
        Functions = {
            RandChar: function () {
                return (function(){
                    var chars = "ABCDEFGHIJKLMNOPQURSTUVWXYZ";
                    return chars.substr( Math.floor(Math.random() * 26), 1);
                })();
            },
            InitializeCube : function(){
                var c = "";
                for (var i = 2; i < 6; i++){
                    $($Objects.CubeFaces[i]).html('');
                    for (var j = 1; j <= 25; j++){
                        if(Math.ceil(j/5)%2 === 0 && j%2 === 0)    c = '';
                        else if(Math.ceil(j/5)%2 === 1 && j%2 === 0) c = '';
                        else c = 'tile';
                        $($Objects.CubeFaces[i]).append('<div class="character '+ c +'"><span>'+ Functions.RandChar() +'</span></div>');
                    }
                }
            },
            RotateLeft: function(l){
                Controller.cube.rotateY -= l/4;
                if(Controller.cube.rotateY){

                }
                t.to($Objects.Cube, 0.2, {
                    transform: 'rotateY(' + Controller.cube.rotateY + 'deg)',
                    ease: Back.easeOut,
                    onComplete: function(){
                    }
                });
            },
            RotateRight: function(l){
                Controller.cube.rotateY += l/4;
                t.to($Objects.Cube, 0.2, {
                    transform: 'rotateY(' + Controller.cube.rotateY + 'deg)',
                    ease: Back.easeOut,
                    onComplete: function(){
                    }
                });
            }
    };
    $d.ready(function(){
        $Objects.Cube = $('div.cube');
        Controller.cube.matrix = $Objects.Cube.css('transform');
        $Objects.CubeFaces = $('figure');
        $Objects.SelectedAnswerDisplay = $('#selected-answer');
        Functions.InitializeCube();
        $('div.character').on('mouseenter', function(){
            if(Controller.isSelecting){
                var ch = $(this).find('span').html();
                GameVar.CurrentSolution.string += ch;
                $Objects.SelectedAnswerDisplay.append('<span>'+ ch +'</span>');
            }
        });
        $d.mousedown(function(event) {
                Controller.mouse.xpos = event.pageX;
                Controller.mouse.ypos = event.pageY;
                if(!$(event.target).closest('.cube').length) {
                    Controller.isDragging = true;
                } else {
                    Controller.isSelecting = true;
                    var $item = $(event.target);
                    var c = '';
                    if($item.is('div')) c = $item.find('span').html();
                    else if($item.is('span')) c = $item.html();
                    GameVar.CurrentSolution.string = c;
                    $Objects.SelectedAnswerDisplay.html('<span>'+ c +'</span>');
                    GameVar.CurrentSolution.face = $item.closest('figure').index() - 2;
                    GameVar.CurrentSolution.x = Math.floor($item.index()/5);
                    GameVar.CurrentSolution.y = GameVar.CurrentSolution.face*5 + Math.floor($item.index()%5);
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
                    GameVar.CurrentSolution.hashed = md4(GameVar.CurrentSolution.x + ',' + GameVar.CurrentSolution.y + ',' + GameVar.CurrentSolution.string);
                    console.log(GameVar.CurrentSolution);
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
