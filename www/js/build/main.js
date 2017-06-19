"use strict";

(function (window, document, $, undefined) {
    "use strict"; //Modo estricto para prevenir errores y malas prácticas

    //Se almacena window y document en variables al comienzo para no utilizar memoria después

    var _this = this;

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

    /////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////////////////////// PLUGINS

    //Igual la altura de las cajas
    $.fn.equalizeHeights = function () {
        var $items = $(_this),
            heightArray = [];
        if (!$items.length) {
            return;
        }
        $items.height('auto');
        $items.each(function (index, elem) {
            heightArray.push($(elem).height());
        });
        $items.height(Math.max.apply(Math, heightArray));
        return _this;
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
            var _this2 = this;

            this.$body = $('body'); //Se almacena el body en una variable para ahorrar memoria
            this.indexCount = 0;

            this.eventsHandler($('[data-func]')); //Se ejecuta el método que permite la delegación de eventos automática desde el HTML

            //Validador de formularios
            $('form[data-validate]').on('submit', function (event) {
                _this2.validateForms(event);
            });
            $('form[data-validate]').find('[required]').on('blur keyup change', function (event) {
                _this2.validateForms(event);
            });

            //Animaciones CSS al mostrar elemento en pantalla
            this.animateElements($('[data-animate]'));

            if ($('.flex-grid').length) this.setupFlexGrid();

            if ($('.b-lazy').length) {
                var bLazy = new Blazy({
                    success: function success(ele) {
                        $(ele).addClass('elastic-img');
                    }
                });
            }
        },

        //Funciones que se inicializan en el window.load
        onLoadSetup: function onLoadSetup() {
            $('.equal').equalizeHeights();
            this.showFlexGrid();
        },

        //Funciones que se inicializan en el evento scroll
        onScrollSetup: function onScrollSetup() {
            //Animaciones CSS al mostrar elemento en pantalla
            this.animateOnView($('[data-animate-on-scroll]'));
            //Animaciones CSS con delay
            this.animateOnDelay($('[data-animate-delay]'));

            this.callNewProyects();
        },

        //Funciones que se inicializan en el evento resize
        onResizeSetup: function onResizeSetup() {
            $('.equal').equalizeHeights();
        },
        onPopStateSetup: function onPopStateSetup(event) {
            var url = document.URL;
            var character = url.split('/').pop().split('.').shift();

            if (!character) {
                character = 'work';
            }

            if (character) {
                this.switchPage(null, character);
            }
        },

        //Setea delegaciones automáticas a través del HTML
        eventsHandler: function eventsHandler($elements) {
            var _this3 = this;

            if (!$elements.length) {
                return;
            }

            $.each($elements, function (index, elem) {
                var $item = $(elem),
                    func = $item.data('func'),
                    events = $item.data('event') ? $item.data('event') : 'click.handler';
                if (func && typeof _this3[func] === 'function') {
                    $item.on(events, $.proxy(_this3[func], _this3));
                    $item.data('delegated', true);
                }
            });
        },
        setupFlexGrid: function setupFlexGrid() {
            $('.flex-grid').NewWaterfall({
                width: 355,
                delay: 60
            });
        },
        callNewProyects: function callNewProyects() {
            var _this4 = this;

            var flexGrid = $('.flex-grid');

            if (!flexGrid.length) {
                return false;
            }

            if ($(window).scrollTop() >= $(document).height() - $(window).height()) {
                if (this.indexCount == 2) {
                    $('.ajax-loader').remove();
                    return false;
                }

                $.ajax({ url: 'partials/items-' + this.indexCount + '.html', dataType: "html", success: function success(result) {
                        flexGrid.append(result);
                        var $flexItems = flexGrid.find('[data-items-set="' + _this4.indexCount + '"]');
                        _this4.eventsHandler($flexItems.find('[data-func]'));
                        $flexItems.find('img').on('load', function (event) {
                            _this4.showFlexGridBySet($(event.currentTarget).parents('li'));
                        });
                        _this4.indexCount++;
                    } });
            }
        },

        showFlexGrid: function showFlexGrid() {
            var $flexGrid = $('.flex-grid'),
                $proyects = $flexGrid.find('li');

            $('.ajax-loader').not('.relative').remove();
            $flexGrid.addClass('active');

            $.each($proyects, function (index, element) {
                var $element = $(element),
                    animation = $element.data('animation');

                $element.addClass(animation);
            });

            if (!$('.infinite-scroll').find('.ajax-loader').length) $('.infinite-scroll').append('<div class="ajax-loader relative"><div class="ajax-loader-indicator"></div></div>');
        },
        showFlexGridBySet: function showFlexGridBySet($set) {
            $.each($set, function (index, element) {
                var $element = $(element),
                    animation = $element.data('animation');

                $element.addClass(animation);
            });
        },
        switchPage: function switchPage(event, pageTarget) {
            var _this5 = this;

            if (event) event.preventDefault();
            var $item = event ? $(event.currentTarget) : null,
                target = event ? $item.data('page') : pageTarget,
                $container = $('#content-load');

            window.scrollTo(0, 0);

            this.$body.addClass('preload');
            $container.css({ 'pointer-events': 'none', 'opacity': 0 });
            setTimeout(function () {
                $.ajax({
                    url: 'partials/' + target + '.html',
                    dataType: 'html',
                    success: function success(result) {
                        _this5.indexCount = 0;
                        $container.html(result).css({ 'pointer-events': 'auto', 'opacity': 1 });

                        if ($container.find('.flex-grid').length) {
                            _this5.setupFlexGrid();
                            $container.find('.flex-grid').find('img').on('load', function (event) {
                                _this5.showFlexGrid();
                            });
                        }

                        if ($container.find('.b-lazy').length) {
                            var bLazy = new Blazy({
                                success: function success(ele) {
                                    $(ele).addClass('elastic-img');
                                }
                            });
                        }

                        _this5.eventsHandler($container.find('[data-func]'));

                        $container.find('form[data-validate]').on('submit', function (event) {
                            _this5.validateForms(event);
                        });
                        $container.find('form[data-validate]').find('[required]').on('blur keyup change', function (event) {
                            _this5.validateForms(event);
                        });

                        _this5.$body.removeClass('preload');

                        if (history && event) {
                            history.pushState(null, null, target == 'work' ? '/' : target + '.html');
                        }
                    }
                });
            }, 700);
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

            var validateCheckboxLimit = function validateCheckboxLimit($element) {
                var $checkboxPack = $element.parents('.checkbox-wrapp').find('input[type="checkbox"]');
                var counter = 0;
                isValid = true;

                $.each($checkboxPack, function (index, element) {
                    var $input = $(element);

                    if ($input.prop('checked') == true) {
                        counter++;
                    }
                });

                if (counter < 1 || counter > 3) {
                    $checkboxPack.addClass('invalid-input');
                    isValid = false;
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

                //Checkbox
                if (tagName == 'input' && $element.attr('type') == 'checkbox' && $element.hasClass('checkbox-limit') && event.type == 'submit') {
                    validateCheckboxLimit($element);
                }

                //Email
                if (tagName == 'input' && $element.attr('type') == 'email' && emailRegEx.test(elementValue) == false) {
                    setToFalse($element);
                }

                //RUT
                if (tagName == 'input' && ($element.hasClass('rut') || $element.hasClass('rut-id')) && $.Rut.validar($('.rut').val() + '-' + $('.rut-id').val()) == false && $('.rut').val().length >= 7) {
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

            if (isValid && event.type == 'submit' && $form.data('validate') == 'async') {
                $form.css({ 'pointer-events': 'none', 'opacity': 0 });
                $form.after('<div class="ajax-loader absolute"><div class="ajax-loader-indicator"></div></div>');

                // $.ajax({
                //     method : 'POST',
                //     url: 'partials/items.html',
                //     data: $form.serialize(),
                //     dataType: "html",
                //     success: function(result){
                //         console.log('success');
                //         $form.html(result.html);
                //         $form.css({'pointer-events': 'auto', 'opacity': 1 });
                //         $form.next('.ajax-loader').remove();
                //     }
                // });

                $.ajax({ url: 'partials/contact-result.html', dataType: "html", success: function success(result) {
                        $form.html(result);
                        $form.css({ 'pointer-events': 'auto', 'opacity': 1 });
                        $form.next('.ajax-loader').remove();
                    } });
            } else if (isValid && event.type == 'submit') {
                $form.off('submit');
                $form.submit();
            } else if (!isValid && !$form.data('no-scroll') && event.type == 'submit') {
                $('html, body').animate({
                    scrollTop: $(".invalid-input").offset().top - 120
                }, 300);
            }
        },
        getModal: function getModal(event) {
            var _this6 = this;

            event.preventDefault();
            var $item = $(event.currentTarget);
            var target = $item.data('modal');

            if ($item.data('modal-delegated') === true) {
                return false;
            }

            var $cortina = this.setScreen();

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

                    _this6.eventsHandler($cortina.find('[data-func]'));
                } });
        },
        setScreen: function setScreen() {
            var cortina = '<div class="screen" data-func="closeModal"></div>';
            this.$body.append(cortina);

            var $cortina = $('.screen');
            $cortina.height($document.height());
            $cortina.addClass('on-screen');

            return $cortina;
        },

        //Retorna truo o false si el elemento está en pantalla
        isScrolledIntoView: function isScrolledIntoView(elem) {
            var $elem = $(elem);

            var docViewTop = this.$window.scrollTop();
            var docViewBottom = docViewTop + this.$window.height();

            var elemTop = $elem.offset().top;
            var elemBottom = elemTop + $elem.height();

            return elemBottom <= docViewBottom && elemTop >= docViewTop;
        },
        animateElements: function animateElements($elements) {
            $.each($elements, function (index, element) {
                var $element = $(element);
                var animation = $element.data('animate') ? $element.data('animate') : $element.data('animate-on-scroll');

                $element.addClass('animated ' + animation);
            });
        },
        animateOnView: function animateOnView($elements) {
            var _this7 = this;

            $.each($elements, function (index, element) {
                var $element = $(element);
                var animation = $element.data('animate') ? $element.data('animate') : $element.data('animate-on-scroll');

                if (_this7.isScrolledIntoView($element)) {
                    $element.addClass('animated ' + animation);
                }
            });
        },
        animateOnDelay: function animateOnDelay($elements) {
            var _this8 = this;

            $.each($elements, function (index, element) {
                var $element = $(element);
                if (_this8.isScrolledIntoView($element)) {
                    $element.addClass('animated ' + $element.data('animate'));
                }
            });
        },

        /////////////////////////////////////////////////////////////////////////////////////////////
        /////////////////////////////////////////////////////////////////////////////////////////////
        ///////////////////////////////////////////////////////////////////////////////////////////// DELEGACIONES
        closeModal: function closeModal(event) {
            event.preventDefault();
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
        },
        'popstate': function popstate(event) {
            Main.onPopStateSetup(event);
        }
    });
})(window, document, jQuery);