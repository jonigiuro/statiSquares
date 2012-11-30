(function ($) {


    $.fn.statiSquare = function (options, method) {

        //SOME DEFAULTS

        var settings = $.extend({
            'width': 150,
                'hasValue': false,
                'type': 'dots',
                'theme': 'random',
                'sort': 'ascendant'
        }, options);

        //METHODS

        var methods = {
            init: function () {
                var element = $(this);
                var innerElement = $(this).find('.value');
                var valuesArray = new Array();
                var total = 0;

                element.find('.value').each(function () {
                    value = parseInt($(this).html().replace("%", ""));
                    total += value;
                    valuesArray.push(value);
                });

                // Convert to percentage if total is not 100
                if (total != 100) {
                    for (var i = 0; i < valuesArray.length; i++) {
                        valuesArray[i] = Math.round(valuesArray[i] / total * 100);
                    }
                }

                //sort elements if requested
                if (settings.sort == "ascendant") {
                    for (var i = 0; i < valuesArray.length; i++) {
                        valuesArray.sort().reverse();
                    }
                } else if (settings.sort == "descendant") {
                    for (var i = 0; i < valuesArray.length; i++) {
                        valuesArray.sort();
                    }
                }

                innerElement.remove();

                element.css('width', settings.width);
                element.append("<div class='statiSquare-single'></div>").css('width', (settings.width));
                var singleGraph = element.find('.statiSquare-single');

                if (settings.type == 'dots') {

                    /*************/
                    //STYLE DOTS
                    /*************/

                    for (var i = 0; i < 100; i++) {
                        singleGraph.append("<div class='block'></div>");
                    }

                    var blocks = element.find('.block');
                    var startCount = 0;

                    //APPLY CLASSES
                    for (var q = 0; q < valuesArray.length; q++) {
                        var color = getColor(settings.theme, q);
                        for (var i = startCount; i < valuesArray[q] + startCount; i++) {
                            $(blocks[i]).addClass('active value-' + valuesArray[q]);
                            $(blocks[i]).css('background-color', color)
                        }

                        startCount += valuesArray[q];

                    }

                    blocks.css({
                        "width": settings.width / 10,
                         "height": settings.width / 10
                    })
                } else if (settings.type == 'map') {

                    /*************/
                    //STYLE MAP
                    /*************/

                    var offsetX = 0;
                    var offsetY = 0;
                    var total = 100;
                    var width = settings.width;

                    element.css('height', settings.width);

                    for (var i = 0; i < valuesArray.length; i++) {
                        if (settings.hasValue) {
                            singleGraph.append("<div class='statiSquare-map'><span class='value-label'>" + valuesArray[i] + "%</span></div>");
                        } else {
                            singleGraph.append("<div class='statiSquare-map'></div>");
                        }
                        var current = $('.statiSquare-map').last();
                        current.css('background-color', getColor(settings.theme, i))
                        var currentArea = ((width * width / 100) * valuesArray[i]); // in pixels

                        total -= valuesArray[i];

                        if (i % 2 == 0) {
                            current.css({
                                'top': offsetY,
                                'left': offsetX,
                                'width': currentArea / (width - offsetY), //this
                                'height': width - offsetY
                            })
                            offsetX += currentArea / (width - offsetY); // and this
                        } else {
                            current.css({
                                'top': offsetY,
                                    'left': offsetX,
                                    'width': width - offsetX,
                                    'height': currentArea / (width - offsetX)
                            })
                            offsetY += currentArea / (width - offsetX);
                        }
                    }
                } else if (settings.type == 'bars') {

                    /*************/
                    //STYLE BARS
                    /*************/

                    for (var i = 0; i < valuesArray.length; i++) {
                        if (settings.hasValue) {
                            singleGraph.append("<div class='statiSquare-bars'><span class='value-label'>" + valuesArray[i] + "%</span></div>");
                        } else {
                            singleGraph.append("<div class='statiSquare-bars'></div>");
                        }

                        $('.statiSquare-bars').last().css({
                            'width': settings.width / 100 * valuesArray[i],
                                'height': settings.width,
                                'background-color': getColor(settings.theme, i)
                        });
                    }
                } else if (settings.type == 'pie' || settings.type == 'ring') {

                    /*************/
                    //STYLE PIE // USES CANVAS ELEMENT!!
                    /*************/

                    var newCanvas = document.createElement('canvas');
                    newCanvas.height = settings.width;
                    newCanvas.width = settings.width;
                    singleGraph.append(newCanvas);
                    var context = newCanvas.getContext('2d');
                    var startingAngle = 0;

                    var drawSegment = function (value, color, isRing) {
                        context.save();
                        var valueAngle = valueToRadians(value);
                        var centerX = Math.floor(newCanvas.width / 2);
                        var centerY = Math.floor(newCanvas.height / 2);
                        if (isRing) {
                            radius = Math.floor((newCanvas.width / 2) / 100 * 70);
                        } else {
                            radius = Math.floor(newCanvas.width / 2);
                        }

                        var arcSize = valueAngle;
                        var endingAngle = startingAngle + arcSize;

                        context.beginPath();
                        context.moveTo(centerX, centerY);
                        context.arc(centerX, centerY, radius, startingAngle, endingAngle, false);
                        context.closePath();

                        context.fillStyle = color;
                        context.fill();

                        startingAngle += valueAngle;

                        context.restore();

                    }

                    var valueToRadians = function (value) {
                        var degrees = 360 / 100 * value;
                        var radians = degrees * 0.0174532925;
                        return radians;
                    }

                    for (var i = 0; i < valuesArray.length; i++) {
                        var color = getColor(settings.theme, i);
                        drawSegment(valuesArray[i], color);
                    }
                    if (settings.type == 'ring') {
                        drawSegment(100, "#FFFFFF", true);
                    }

                }
            },

        };

        return this.each(function () {
            if (methods[method]) {
                return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
            } else if (typeof method === 'object' || !method) {
                return methods.init.apply(this, arguments);
            } else {
                $.error('Method ' + method + ' does not exist on jQuery.statiSquare');
            }
        });

    };

    function getColor(theme, loopIndex) {
        if (theme == 'random') {
            var letters = '0123456789ABCDEF'.split('');
            var color = '#';
            for (var i = 0; i < 6; i++) {
                color += letters[Math.round(Math.random() * 15)];
            }
            return color;
        } else if (theme == 'aurora') {
            var colors = ['#011526', '#025959', '#027353', '#03a678', '#03a696'];
        } else if (theme == 'bird') {
            var colors = ['#b0d9d5', '#f2e6c2', '#d9bf8f', '#734636', '#591b0c'];
        } else if (theme == 'goldfish') {
            var colors = ['#f2c6a0', '#f2b705', '#f28705', '#f22613', '#a60303'];
        } else if (theme == 'sepia') {
            var colors = ['#ebe7b6', '#dec984', '#ad9461', '#503e28', '#3b2d1e'];
        } else if (theme == 'bright') {
            var colors = ['#fc1209', '#fab035', '#ffdd00', '#c2d730', '#00a3e4'];
        } else if (theme == 'custom') {
            return false;
        }
        color = colors[loopIndex % colors.length];
        return color;
    }
})(jQuery);