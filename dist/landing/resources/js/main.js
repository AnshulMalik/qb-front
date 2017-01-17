/**
 * Created by Kaushik on 1/8/2017.
 */
(function($d, $w, $, t){
    var Globals = {
        Contest: {
        }
    },
        $Objects = {}
        Functions = {
            StartDual: function(){

            },
            StartContest: function(){

            }
        };
    $d.ready(function(){
        $Objects.SubmitDual = $('#start-dual')
          .bind('click', Functions.StartDual);
        $Objects.Submit = $('#start-contest')
          .bind('click', Functions.StartContest);
    });
})(jQuery(document), jQuery(window), jQuery, TweenMax);
