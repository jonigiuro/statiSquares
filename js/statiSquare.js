(function ($) {


    $.fn.statiSquare = function (options, method) {

        //SOME DEFAULTS

        var settings = $.extend({
            'width': 400,
                'height': 200,
                'responsive': false,
                'hasValue': false,
                'type': 'blocks',
                'theme': 'random',
                'sort': 'ascendant',
                'strokeWidth': 10
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
                if (settings.sort == "descendant") {
                    for (var i = 0; i < valuesArray.length; i++) {
                        valuesArray.sort().reverse();
                    }
                } else if (settings.sort == "ascendant") {
                    for (var i = 0; i < valuesArray.length; i++) {
                        valuesArray.sort();
                    }
                }

                innerElement.remove();

                if (settings.responsive) {
                    element.css('width', '100%');
                    element.append("<div class='statiSquare-single'></div>").css({
                        'width': '100%',
                            'height': settings.height
                    });
                } else {
                    if (settings.type != 'ring' && settings.type != 'pie') {
                        element.css('width', settings.width);
                        element.append("<div class='statiSquare-single'></div>").css({
                            'width': settings.width,
                                'height': settings.height
                        });
                    } else {
                        element.css('width', settings.width);
                        element.append("<div class='statiSquare-single'></div>").css({
                            'width': settings.width,
                                'height': settings.width
                        });
                    }
                }

                var singleGraph = element.find('.statiSquare-single');

                if (settings.type == 'blocks') {

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
                    if (settings.responsive) {
                        blocks.css({
                            "width": '10%'
                        })
                    } else {
                        blocks.css({
                            "width": settings.width / 10
                        })
                    }
                    blocks.css({
                        "height": settings.height / 10
                    })

                } else if (settings.type == 'map') {

                    /*************/
                    //STYLE MAP
                    /*************/

                    var offsetX = 0;
                    var offsetY = 0;
                    if (settings.responsive) {
                        var width = 100;
                    } else {
                        var width = 100;
                    }

                    var height = settings.height;

                    element.css('height', height);

                    for (var i = 0; i < valuesArray.length; i++) {
                        if (settings.hasValue) {
                            singleGraph.append("<div class='statiSquare-map'><span class='value-label'>" + valuesArray[i] + "%</span></div>");
                        } else {
                            singleGraph.append("<div class='statiSquare-map'></div>");
                        }
                        var current = $('.statiSquare-map').last();
                        current.css('background-color', getColor(settings.theme, i))

                        total -= valuesArray[i];


                        var currentArea = (width * valuesArray[i]); // in pixels
                        if (i % 2 == 0) {
                            current.css({
                                'top': offsetY + '%',
                                    'left': offsetX + '%',
                                    'width': currentArea / (width - offsetY) + '%', //this
                                'height': width - offsetY + '%'
                            })
                            offsetX += currentArea / (width - offsetY); // and this
                        } else {
                            current.css({
                                'top': offsetY + '%',
                                    'left': offsetX + '%',
                                    'width': width - offsetX + '%',
                                    'height': currentArea / (width - offsetX) + '%'
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
                        if (settings.responsive) {
                            $('.statiSquare-bars').last().css({
                                'width': valuesArray[i] + "%"
                            });
                        } else {
                            $('.statiSquare-bars').last().css({
                                'width': settings.width / 100 * valuesArray[i]
                            });

                        }
                        $('.statiSquare-bars').last().css({
                            'height': settings.height,
                                'background-color': getColor(settings.theme, i)
                        });
                    }
                } else if (settings.type == 'pie') {

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
                        var arcSize = valueAngle;
                        var endingAngle = startingAngle + arcSize;
                        var radius = settings.width / 2;

                        context.lineWidth = 0;
                        context.beginPath();
                        context.moveTo(centerX, centerY);
                        context.arc(centerX, centerY, radius, startingAngle, endingAngle, false);

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

                } else if (settings.type == 'ring') {

                    /*************/
                    //STYLE RING // USES CANVAS ELEMENT!!
                    /*************/

                    var newCanvas = document.createElement('canvas');
                    newCanvas.height = settings.width;
                    newCanvas.width = settings.width;
                    singleGraph.append(newCanvas);
                    var context = newCanvas.getContext('2d');
                    var startingAngle = 0;

                    var drawSegment = function (value, color) {
                        context.save();
                        var valueAngle = valueToRadians(value);
                        var centerX = Math.floor(newCanvas.width / 2);
                        var centerY = Math.floor(newCanvas.height / 2);
                        var radius = settings.width / 2;
                        var arcSize = valueAngle;
                        var endingAngle = startingAngle + arcSize;

                        context.lineWidth = settings.strokeWidth;
                        context.beginPath();
                        //context.moveTo(centerX, centerY);
                        context.arc(centerX, centerY, radius - (settings.strokeWidth / 2), startingAngle, endingAngle, false);

                        // context.fill();
                        context.lineWidth = settings.strokeWidth;
                        context.strokeStyle = color;
                        context.stroke();

                        context.fillStyle = color;
                        //context.fill();

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