"use strict";

(function (window, document, $, undefined) {
    "use strict"; //Modo estricto para prevenir errores y malas prácticas

    //Se almacena window y document en variables al comienzo para no utilizar memoria después

    var $window = $(window),
        $document = $(document);

    //Detecta la versión de Internet Explorer según su User Agent y retorna su versión
    function getInternetExplorerVersion() {
        var rv = -1; // Return value assumes failure.
        if (navigator.appName == 'Microsoft Internet Explorer') {
            var ua = navigator.userAgent;
            var re = new RegExp("MSIE ([0-9]{1,}[\.0-9]{0,})");
            if (re.exec(ua) != null) rv = parseFloat(RegExp.$1);
        }
        return rv;
    }

    // detecta IE10+ a través de la deteccion de los eventos pointers y coloca una clase "mspointers" en el HTML a través de Modernizr
    Modernizr.addTest('mspointers', function () {
        return window.navigator.msPointerEnabled;
    });
    // detecta IE9- a través del parseo del useragent y coloca una clase con la versión de IE en el HTML a través de Modernizr
    Modernizr.addTest('oldie', function () {
        var v = getInternetExplorerVersion();
        return v <= 9 && v > -1;
    });
    Modernizr.addTest('oldie-8', function () {
        var v = getInternetExplorerVersion();
        return v <= 8 && v > -1;
    });
    Modernizr.addTest('oldie-7', function () {
        var v = getInternetExplorerVersion();
        return v <= 7 && v > -1;
    });

    /////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////////////////////// PLUGINS

    //Igual la altura de las cajas
    $.fn.equalizeHeights = function () {
        var $items = $(this),
            heightArray = [];
        if (!$items.length) {
            return;
        }
        $items.height('auto');
        $items.each(function (index, elem) {
            heightArray.push($(elem).height());
        });
        $items.height(Math.max.apply(Math, heightArray));
        return this;
    };

    /////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////////////////////// HANDLERS

    window.handler = function () {};

    //Se almacenan las funciones dentro del prototipo del objeto por convención, recomendación y performance por sobre todo
    window.handler.prototype = {

        /////////////////////////////////////////////////////////////////////////////////////////////
        /////////////////////////////////////////////////////////////////////////////////////////////
        ///////////////////////////////////////////////////////////////////////////////////////////// INICIALIZADORAS

        //Funciones que se inicializan en el document.ready
        onReadySetup: function onReadySetup() {
            var self = this; //Se almacena this com oel objeto para no confundir
            self.$body = $('body'); //Se almacena el body en una variable para ahorrar memoria

            self.loadScripts();

            self.eventsHandler($('[data-func]')); //Se ejecuta el método que permite la delegación de eventos automática desde el HTML
            if (!Modernizr.svg) {
                self.svgFallback($('[data-svgfallback]'));
            } //Se ejecuta el fallback para SVG's si es que el navegador no lo soporta

            //Validador de formularios
            $('form[data-validate]').on('submit', function (event) {
                self.validateForms(event);
            });
            $('form[data-validate]').find('[required]').on('blur keyup change', function (event) {
                self.validateForms(event);
            });

            //Animaciones CSS al mostrar elemento en pantalla
            self.animateElements($('[data-animate]'));
        },
        //Funciones que se inicializan en el window.load
        onLoadSetup: function onLoadSetup() {
            var self = this;
            $('.equal').equalizeHeights();
        },
        //Funciones que se inicializan en el evento scroll
        onScrollSetup: function onScrollSetup() {
            var self = this;

            //Animaciones CSS al mostrar elemento en pantalla
            self.animateOnView($('[data-animate-on-scroll]'));
            //Animaciones CSS con delay
            self.animateOnDelay($('[data-animate-delay]'));
        },
        //Funciones que se inicializan en el evento resize
        onResizeSetup: function onResizeSetup() {
            $('.equal').equalizeHeights();
        },
        //Setea delegaciones automáticas a través del HTML
        eventsHandler: function eventsHandler($elements) {
            if (!$elements.length) {
                return;
            }
            var self = this;
            $.each($elements, function (index, elem) {
                var $item = $(elem),
                    func = $item.data('func'),
                    events = $item.data('event') ? $item.data('event') : 'click.handler';
                if (func && typeof self[func] === 'function') {
                    $item.on(events, $.proxy(self[func], self));
                    $item.data('delegated', true);
                }
            });
        },
        //Fallback para imágenes SVG
        svgFallback: function svgFallback($elements) {
            if (!$elements.length) {
                return;
            }
            var $item;

            $elements.each(function (index, elem) {
                $item = $(elem);
                $item.attr('src', $item.data('svgfallback'));
            });
        },
        //Formatea strings según parámetros
        // self.currency(value, 0, ['.', '.', '.'])
        currency: function currency(num) {
            var str = num.toString().replace("$", ""),
                parts = false,
                output = [],
                i = 1,
                formatted = null;
            if (str.indexOf(".") > 0) {
                parts = str.split(".");
                str = parts[0];
            }
            str = str.split("").reverse();
            for (var j = 0, len = str.length; j < len; j++) {
                if (str[j] != ".") {
                    output.push(str[j]);
                    if (i % 3 == 0 && j < len - 1) {
                        output.push(".");
                    }
                    i++;
                }
            }
            formatted = output.reverse().join("");
            return formatted + (parts ? "." + parts[1].substr(0, 2) : "");
        },
        loadScripts: function loadScripts() {
            var self = this;
            Modernizr.load([{
                test: $('.slider').length,
                yep: 'js/libs/ninjaSlider.js',
                callback: function callback(url, result, key) {
                    setTimeout(function () {}, 3000);
                    if (result) {
                        self.setupSliders();
                    }
                }
            }]);
        },
        validateForms: function validateForms(event) {
            event.preventDefault();
            var self = this;
            var $form = event.type == 'submit' ? $(event.currentTarget) : $(event.currentTarget).parents('form'); //Se almacena el objeto del formulario, en caso de submit y en caso de otros eventos
            var $inputs = event.type == 'submit' ? $form.find('[required]') : $(event.currentTarget); //Se almacenan todos los elementos requeridos
            var isValid = true; //Flag para saber si el formulario finalmente es válido o no, al comienzo siempre es válido
            var emailRegEx = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/; //Regex para comprobar email
            var numerosRegEx = /^\d+(?:\.\d{1,2})?$/; //Regex para comprobar números
            var letrasyNumerosRegEx = /^[0-9a-zA-Z]+$/; //Regex para numeros y letras;
            //Función que setea un input inválido
            var setToFalse = function setToFalse($input) {
                var customMessage = $input.data('custom-message'); //Mensaje customizado
                var $parentHolder = $input.parent(); //Elemento padre
                var type = $input.attr('type'); //Tipo de input
                isValid = false; //flag

                if (type == 'hidden') {
                    return false;
                } //Si el tipo de input es hidden no hace nada

                $input.addClass('invalid-input').removeClass('valid-input'); //Agrega la clase de inválido y quita la clase de válido

                if (!$input.next().is('.error-message') && event.type == 'submit' && customMessage) {
                    $input.after('<p class="error-message">' + customMessage + '</p>'); //Agrega mensaje de error si es que este no existe
                }

                if (type == 'radio' || type == 'checkbox') {
                    return false;
                } //Si es un checkbox o un radio no hace nada
            };
            //Función que setea un input válido
            var setToTrue = function setToTrue($input) {
                var $parentHolder = $input.parent();
                var type = $input.attr('type');

                if (type == 'hidden' || type == 'radio' || type == 'checkbox') {
                    return false;
                }

                $input.addClass('valid-input').removeClass('invalid-input'); //Agrega la clase valdia al input

                if ($input.data('disable-img-error')) {
                    return false;
                }
            };
            //Función que valida radio buttons, comprobando si uno está marcado o no
            var validateRadio = function validateRadio($element) {
                var $radioPack = $('input[name="' + $element.attr('name') + '"]');
                var isValidRadio = false;
                $.each($radioPack, function (index, element) {
                    var $e = $(element);
                    if ($e.prop('checked') == true) {
                        isValidRadio = true;
                    }
                });

                if (isValidRadio == false) {
                    setToFalse($element);
                }
            };

            //Se elimina la clase de error a los inputs y la clase de input válido
            $inputs.removeClass('invalid-input');
            $('[name="' + $inputs.attr('name') + '"]').removeClass('invalid-input');
            $inputs.removeClass('valid-input');

            //Si no es click, elimina el mensaje de error
            if (event.type != 'submit') {
                var $currentItem = $(event.currentTarget);
                if ($currentItem.next().is('.error-message')) {
                    $currentItem.next().remove();
                }
            }

            $.each($inputs, function (index, element) {
                var $element = $(element);
                var tagName = $(element).prop('tagName').toLowerCase();
                var limit = $element.data('limit') ? $element.data('limit') : 5;
                var elementValue = tagName == 'input' || tagName == 'textarea' ? $element.val() : $element.find('option:selected').val();

                if ($element.attr('data-validate-on-show') == 'false' || $element.attr('readonly')) {
                    return true;
                }

                //Select vacío
                if (tagName == 'select' && elementValue == "") {
                    setToFalse($element);
                } else if (tagName == 'select' && elementValue != "") {
                    setToTrue($element);
                }

                //Input vacío
                if ((tagName == 'input' || tagName == 'textarea') && elementValue == "") {
                    setToFalse($element);
                } else if ((tagName == 'input' || tagName == 'textarea') && elementValue != "" && $element.attr('type') != 'radio') {
                    setToTrue($element);
                }

                //Radio buttons
                if (tagName == 'input' && $element.attr('type') == 'radio' && event.type == 'submit') {
                    validateRadio($element);
                }

                //Email
                if (tagName == 'input' && $element.attr('type') == 'email' && emailRegEx.test(elementValue) == false) {
                    setToFalse($element);
                }

                //RUT
                if (tagName == 'input' && $element.hasClass('rut-input') && $.Rut.validar(elementValue) == false) {
                    setToFalse($element);
                }

                //Sólo números
                if (tagName == 'input' && $element.hasClass('number-validation') && elementValue != "" && numerosRegEx.test(elementValue) == false) {
                    setToFalse($element);
                }

                //minimo y maximo de caracteres
                if (tagName == 'input' && (elementValue.length < $element.data('min') || elementValue.length > $element.data('max'))) {
                    setToFalse($element);
                }

                //minimo y maximo
                if (tagName == 'input' && (elementValue.split('.').join("") < $element.data('min-value') || elementValue.split('.').join("") > $element.data('max-value'))) {
                    setToFalse($element);
                }

                //Solo letras y numeros
                if (tagName == 'input' && $element.hasClass('numeros-letras') && letrasyNumerosRegEx.test(elementValue) == false) {
                    setToFalse($element);
                }

                //Confirmar clave
                if (tagName == 'input' && $element.hasClass('same-validation') && elementValue != "" && elementValue != $('[name="clave-nueva"]').val()) {
                    setToFalse($element);
                }
            });

            if (isValid && event.type == 'submit') {
                $form.off('submit');
                $form.submit();
            } else if (!isValid && !$form.data('no-scroll') && event.type == 'submit') {
                $('html, body').animate({
                    scrollTop: $(".invalid-input").offset().top - 120
                }, 300);
            }
        },
        setupSliders: function setupSliders() {
            var self = this,
                $content_sliders = $('.slider'),
                automatic = $content_sliders.attr('data-auto') ? $content_sliders.attr('data-auto') : false;

            if ($content_sliders.length === 0) {
                return;
            }

            $content_sliders.each(function (index, elem) {
                var $elem = $(elem),
                    slider = $elem.ninjaSlider({
                    auto: automatic,
                    transitionCallback: function transitionCallback(index, slide, container) {
                        var $slider = $(container),
                            $bullets = $slider.find('.slide-control'),
                            $numbers = $slider.prev().find('.change-number');

                        $bullets.removeClass('active').filter('[data-slide="' + index + '"]').addClass('active');
                        $numbers.text(index + 1);
                    }
                }).data('ninjaSlider'),
                    totalSlidesIndex = $elem.find('.content-slider-items').children().length - 1;

                $elem.parent().find('.control-arrow').on('click', function (event) {
                    var $item = $(event.currentTarget),
                        activeSlideNum = $elem.find('.slide-control.active').data('slide'),
                        direction = $item.hasClass('next'),
                        totalSlidesIndex = $elem.find('.content-slider-items').children().length - 1,
                        targetSlidenum;

                    if (direction) {
                        targetSlidenum = activeSlideNum + 1 > totalSlidesIndex ? 0 : activeSlideNum + 1;
                    } else {
                        targetSlidenum = activeSlideNum - 1 < 0 ? totalSlidesIndex : activeSlideNum - 1;
                    }

                    slider.slide(targetSlidenum);
                });

                $elem.find('.slide-control').on('click', function (event) {
                    var $item = $(event.currentTarget),
                        targetSlidenum = $item.data('slide');

                    slider.slide(targetSlidenum);
                });
            });
        },
        getModal: function getModal(event) {
            event.preventDefault();
            var self = this;
            var $item = $(event.currentTarget);
            var target = $item.data('modal');

            if ($item.data('modal-delegated') === true) {
                return false;
            }

            var $cortina = self.setScreen();

            $cortina.append('<div class="la-ball-beat"><div></div><div></div><div></div></div>').addClass('loaded');

            $.ajax({ url: 'partials/' + target + '.html', dataType: "html", success: function success(result) {
                    $('.la-ball-beat').remove();
                    $cortina.append(result);

                    $cortina.find('.lightbox').css('top', $document.scrollTop() + 30).addClass('animated bounceInDown');

                    $cortina.one('click', function (event) {
                        event.stopPropagation();
                        $cortina.removeClass('loaded').remove();
                    });

                    $cortina.find('.lightbox').on('click', function (event) {
                        event.stopPropagation();
                    });

                    self.eventsHandler($cortina.find('[data-func]'));
                } });
        },
        setScreen: function setScreen() {
            var self = this;
            var cortina = '<div class="screen" data-func="closeModal"></div>';
            self.$body.append(cortina);

            var $cortina = $('.screen');
            $cortina.height($document.height());
            $cortina.addClass('on-screen');

            return $cortina;
        },
        //Retorna truo o false si el elemento está en pantalla
        isScrolledIntoView: function isScrolledIntoView(elem) {
            var $elem = $(elem);
            var $window = $(window);

            var docViewTop = $window.scrollTop();
            var docViewBottom = docViewTop + $window.height();

            var elemTop = $elem.offset().top;
            var elemBottom = elemTop + $elem.height();

            return elemBottom <= docViewBottom && elemTop >= docViewTop;
        },
        animateElements: function animateElements($elements) {
            var self = this;
            $.each($elements, function (index, element) {
                var $element = $(element);
                var animation = $element.data('animate') ? $element.data('animate') : $element.data('animate-on-scroll');

                $element.addClass('animated ' + animation);
            });
        },
        animateOnView: function animateOnView($elements) {
            var self = this;
            $.each($elements, function (index, element) {
                var $element = $(element);
                var animation = $element.data('animate') ? $element.data('animate') : $element.data('animate-on-scroll');

                if (self.isScrolledIntoView($element)) {
                    $element.addClass('animated ' + animation);
                }
            });
        },
        animateOnDelay: function animateOnDelay($elements) {
            var self = this;
            $.each($elements, function (index, element) {
                var $element = $(element);
                if (self.isScrolledIntoView($element)) {
                    $element.addClass('animated ' + $element.data('animate'));
                }
            });
        },
        /////////////////////////////////////////////////////////////////////////////////////////////
        /////////////////////////////////////////////////////////////////////////////////////////////
        ///////////////////////////////////////////////////////////////////////////////////////////// DELEGACIONES
        closeModal: function closeModal(event) {
            event.preventDefault();
            var self = this;
            var $item = $(event.currentTarget);
            $('.screen').find('.lightbox').removeClass('bounceInDown').addClass('bounceOutUp');

            setTimeout(function () {
                $('.screen').removeClass('on-screen');
            }, 600);

            setTimeout(function () {
                $('.screen').remove();
            }, 900);
        }
    };

    /////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////////////////////// COMIENZO


    var Main = new window.handler(); //Se genera un nuevo objeto para almacenar las funciones
    $document.ready(function () {
        Main.onReadySetup();
    }); //Se inicializan las funcionalidades en el document.ready
    $window.load(function () {
        Main.onLoadSetup();
    }); //Se inicializan las funcionalidades en el window.ready

    //Se inicializan las funcionalidades los eventos scroll y resize
    $window.on({
        'scroll': function scroll() {
            Main.onScrollSetup();
        },
        'resize': function resize() {
            Main.onResizeSetup();
        }
    });
})(window, document, jQuery);