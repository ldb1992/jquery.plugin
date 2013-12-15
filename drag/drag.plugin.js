/*created by ldb199224@163.com*/
$(function() {
    var opt = {
        gpu: true,
        rAF: true,
        dragEnd: null,
    };
    var tar;
    var doc = $(document);
    var elemX = 0,
        elemY = 0,
        offsetClickX = 0,
        offsetClickY = 0;
    var parentW,
        parentH,
        elemW,
        elemH;
    var requestAnimationFrame = window.requestAnimationFrame ||
        window.mozRequestAnimationFrame ||
        window.webkitRequestAnimationFrame ||
        window.msRequestAnimationFrame ||
        window.oRequestAnimationFrame,
        cancelAnimationFrame = window.cancelAnimationFrame ||
            window.mozCancelAnimationFrame ||
            window.webkitCancelAnimationFrame ||
            window.msCancelAnimationFrame ||
            window.oCancelAnimationFrame,
        rAF_time;


    function checkBeforeDrag() {
        var cssPos;

        console.info('--------------drag target is--------------');
        console.info(tar[0]);

        cssPos = tar.css('position');
        if (cssPos === 'static' || cssPos === 'relative') {
            tar.css('position', 'absolute');
            console.warn('--------------position is not correctly configured,and is now set to absolute--------------');
        }
        console.info('--------------offsetParent is--------------');
        console.info((offsetParent = tar.offsetParent())[0]);

        // if (!requestAnimationFrame) {
        //     console.log('--------------requestAnimationFrame is not support--------------');
        //     opt.rAF = false;
        // }

        // tar.css('transform', 'translateZ(0)');
        // if (!tar.css('transform')) {
        //     console.log('--------------gpu accelerate is not support--------------');
        //     opt.gpu = false;
        // }

        return isOverFlow();
    }

    function startDrag(evt) {
        offsetClickX = evt.clientX - elemX;
        offsetClickY = evt.clientY - elemY;
        console.log('>>>>>>>>>start drag,and clickPos is:', evt.clientX, evt.clientY);
        doc.on({
            'mousemove': drag,
            'mouseup': clear
        });
        if (opt.rAF) {
            console.log('--------------use requestAnimationFrame move--------------');
            move_rAF();
            return;
        } //执行raf
        console.log('--------------no requestAnimationFrame move--------------');
    }

    function drag(evt) {
        elemX = evt.clientX - offsetClickX;
        elemY = evt.clientY - offsetClickY;
        if (!opt.rAF) {
            move();
        }
        return;
    }

    function move() {
        isOverFlow();
        if (opt.gpu) {
            tar.css({
                '-webkit-transform': 'translate3D(' + elemX + 'px,' + elemY + 'px,0px)',
                'left': 0,
                'top': 0
            });
            console.log('--------------use gpu move--------------');
        } else {
            tar.css({
                'left': elemX,
                'top': elemY
            });
            console.log('--------------no gpu move--------------');
        }
    }

    function move_rAF() {
        move();
        rAF_time = requestAnimationFrame(move_rAF);
    }

    function clear(evt) {
        doc.off('mousemove');
        doc.off('mouseup');
        if (opt.gpu) {
            isOverFlow();
            tar.hide();
            tar.css({
                '-webkit-transform': 'translate3D(0px,0px,0px)',
                'left': elemX,
                'top': elemY
            });
            tar.show();
        } //gpu拖拽
        if (opt.rAF) {
            cancelAnimationFrame(rAF_time);
        }
        if (opt.dragEnd) {
            opt.dragEnd();
        }
        console.log('>>>>>>>>>end drag,and elemPos is:', elemX, elemY);
    }

    function isOverFlow() {
        var flag = false;
        parentW = parentW || offsetParent.width();
        parentH = parentH || offsetParent.height();
        elemW = elemW || tar.width();
        elemH = elemH || tar.height();

        if (elemW > parentW || elemH > parentH) {
            console.log('wrapper is:', parentW, parentH, 'elem is:', elemW, elemH);
            console.error('--------------wrapper is too small--------------');
            flag = true;
        }
        if (elemX + elemW > parentW) {
            elemX = parentW - elemW;
            flag = true;
        }
        if (elemX < 0) {
            elemX = 0;
            flag = true;
        }
        if (elemY + elemH > parentH) {
            elemY = parentH - elemH;
            flag = true;
        }
        if (elemY < 0) {
            elemY = 0;
            flag = true;
        }
        return flag;
    }

    $.extend($.fn, {
        'drag': function(_opt) {
            tar = $(this);
            if (checkBeforeDrag()) {
                return;
            }

            if (!$.isPlainObject(_opt)) {
                console.error('--------------conf wrong--------------');
                return;
            }

            $.extend(opt, _opt);

            console.log(JSON.stringify(opt));

            tar.on('mousedown', startDrag);
        }
    });

});