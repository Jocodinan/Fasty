(function (window, document, $, undefined) {
    "use strict";
    const $window = $(window),
        $document = $(document);
    
    function getInternetExplorerVersion() {
        let rv = -1;
        if (navigator.appName == 'Microsoft Internet Explorer') {
            const ua = navigator.userAgent;
            const re = new RegExp("MSIE ([0-9]{1,}[\.0-9]{0,})");
            if (re.exec(ua) != null)
                rv = parseFloat(RegExp.$1);
        }
        return rv;
    }
    
    $.fn.equalizeHeights = () => {
        let $items = $(this),
            heightArray = [];
        if( !$items.length ){ return; }
        $items.height('auto');
        $items.each((index, elem) => { heightArray.push( $(elem).height() ); });
        $items.height( Math.max.apply( Math, heightArray ) ); 
        return this;
    };

    window.handler = () => {
       
    };

    window.handler.prototype = {
        onReadySetup(){
            this.$body = $('body');
            this.indexCount = 0;

            this.eventsHandler( $('[data-func]') );
            
            $('form[data-validate]').on('submit', (event) => {
                this.validateForms(event);
            });
            $('form[data-validate]').find('[required]').on('blur keyup change', (event) => {
                this.validateForms(event);
            });
        },
        onLoadSetup(){
            $('.equal').equalizeHeights();
        },
        onScrollSetup(){

        },
        onResizeSetup(){
            $('.equal').equalizeHeights();
        },
        eventsHandler( $elements ){
            if( ! $elements.length ){ return; }

            $.each( $elements, ( index, elem ) => {
                const $item = $(elem),
                    func = $item.data('func'),
                    events = $item.data('event') ? $item.data('event') : 'click.handler';
                if( func && typeof( this[func] ) === 'function' ){
                    $item.on( events, $.proxy( this[ func ], this ) );
                    $item.data('delegated', true);
                } 
            });
        },
        validateForms : function(event){
            event.preventDefault();
            var self = this;
            var $form = event.type == 'submit' ? $(event.currentTarget) : $(event.currentTarget).parents('form');//Se almacena el objeto del formulario, en caso de submit y en caso de otros eventos
            var $inputs = event.type == 'submit' ? $form.find('[required]') : $(event.currentTarget); //Se almacenan todos los elementos requeridos
            var isValid = true; //Flag para saber si el formulario finalmente es válido o no, al comienzo siempre es válido
            var emailRegEx = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/; //Regex para comprobar email
            var numerosRegEx = /^\d+(?:\.\d{1,2})?$/; //Regex para comprobar números
            var letrasyNumerosRegEx = /^[0-9a-zA-Z]+$/; //Regex para numeros y letras;
            //Función que setea un input inválido
            var setToFalse = function($input){
                var customMessage = $input.data('custom-message'); //Mensaje customizado
                var $parentHolder = $input.parent(); //Elemento padre
                var type = $input.attr('type'); //Tipo de input
                isValid = false; //flag

                if(type == 'hidden'){return false;} //Si el tipo de input es hidden no hace nada

                $input.addClass('invalid-input').removeClass('valid-input'); //Agrega la clase de inválido y quita la clase de válido

                if(!$input.next().is('.error-message') && event.type == 'submit' && customMessage){
                    $input.after('<p class="error-message">'+ customMessage +'</p>'); //Agrega mensaje de error si es que este no existe
                }

                if(type == 'radio' || type == 'checkbox'){return false;} //Si es un checkbox o un radio no hace nada
            };

            //Función que setea un input válido
            var setToTrue = function($input){
                var $parentHolder = $input.parent();
                var type = $input.attr('type');

                if(type == 'hidden' || type == 'radio' || type == 'checkbox'){return false;}

                $input.addClass('valid-input').removeClass('invalid-input'); //Agrega la clase valdia al input

                if($input.data('disable-img-error')){return false;}
            };

            //Función que valida radio buttons, comprobando si uno está marcado o no
            var validateRadio = function($element){
                var $radioPack = $('input[name="'+ $element.attr('name') +'"]');
                var isValidRadio = false;
                $.each($radioPack, function(index, element){
                    var $e = $(element);
                    if($e.prop('checked') == true){
                        isValidRadio = true;
                    }
                });

                if(isValidRadio == false){
                    setToFalse($element);
                }
            };

            var validateCheckboxLimit = function($element){
                var $checkboxPack = $element.parents('.checkbox-wrapp').find('input[type="checkbox"]');
                var counter = 0;
                isValid = true;

                $.each($checkboxPack, function(index, element){
                    var $input = $(element);

                    if($input.prop('checked') == true){
                        counter++;
                    }
                });

                if(counter < 1 || counter > 3){
                    $checkboxPack.addClass('invalid-input');
                    isValid = false;
                }

            };

            //Se elimina la clase de error a los inputs y la clase de input válido
            $inputs.removeClass('invalid-input');
            $('[name="'+ $inputs.attr('name') +'"]').removeClass('invalid-input');
            $inputs.removeClass('valid-input');

            //Si no es click, elimina el mensaje de error
            if(event.type != 'submit'){
                var $currentItem = $(event.currentTarget);
                if($currentItem.next().is('.error-message')){
                    $currentItem.next().remove();
                }
            }

            $.each($inputs, function(index, element){
                var $element = $(element);
                var tagName = $(element).prop('tagName').toLowerCase();
                var limit = $element.data('limit') ? $element.data('limit') : 5;
                var elementValue = tagName == 'input' || tagName == 'textarea' ? $element.val() : $element.find('option:selected').val();

                if($element.attr('data-validate-on-show') == 'false' || $element.attr('readonly')){
                    return true;
                }

                //Select vacío
                if(tagName == 'select' && elementValue == ""){
                    setToFalse($element);
                }else if(tagName == 'select' && elementValue != ""){
                    setToTrue($element);
                }

                //Input vacío
                if((tagName == 'input' || tagName == 'textarea') && elementValue == ""){
                    setToFalse($element);
                }else if((tagName == 'input' || tagName == 'textarea') && elementValue != "" && $element.attr('type') != 'radio'){
                    setToTrue($element);
                }

                //Radio buttons
                if(tagName == 'input' && $element.attr('type') == 'radio' && event.type == 'submit'){
                    validateRadio($element);
                }

                //Checkbox
                if(tagName == 'input' && $element.attr('type') == 'checkbox' && $element.hasClass('checkbox-limit') && event.type == 'submit'){
                    validateCheckboxLimit($element);
                }


                //Email
                if(tagName == 'input' && $element.attr('type') == 'email' && emailRegEx.test(elementValue) == false){
                    setToFalse($element);
                }

                //RUT
                if(tagName == 'input' && ($element.hasClass('rut') || $element.hasClass('rut-id')) && ($.Rut.validar($('.rut').val() +'-'+$('.rut-id').val()) == false) && ($('.rut').val().length >= 7)){
                    setToFalse($element);
                }

                //Sólo números
                if(tagName == 'input' && $element.hasClass('number-validation') && elementValue != "" && numerosRegEx.test(elementValue) == false){
                    setToFalse($element);
                }

                //minimo y maximo de caracteres
                if(tagName == 'input' && ((elementValue.length < $element.data('min')) || (elementValue.length > $element.data('max')))){
                    setToFalse($element);
                }

                //minimo y maximo
                if(tagName == 'input' && ((elementValue.split('.').join("") < $element.data('min-value')) || (elementValue.split('.').join("") > $element.data('max-value')))){
                    setToFalse($element);
                }

                //Solo letras y numeros
                if(tagName == 'input' && $element.hasClass('numeros-letras')&& letrasyNumerosRegEx.test(elementValue) == false){
                    setToFalse($element);
                }

                //Confirmar clave
                if(tagName == 'input' && $element.hasClass('same-validation') && elementValue != "" && (elementValue != $('[name="clave-nueva"]').val())){
                    setToFalse($element);
                }

            });

            if(isValid && event.type == 'submit' && $form.data('validate') == 'async'){
                $form.css({'pointer-events': 'none', 'opacity': 0 });
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

                $.ajax({url: 'partials/contact-result.html',dataType: "html", success: (result) => {
                    $form.html(result);
                    $form.css({'pointer-events': 'auto', 'opacity': 1 });
                    $form.next('.ajax-loader').remove();
                }});
            }
            else if(isValid && event.type == 'submit'){
                $form.off('submit');
                $form.submit();
            }else if(!isValid && !$form.data('no-scroll') && event.type == 'submit'){
                $('html, body').animate({
                    scrollTop: $(".invalid-input").offset().top - 120
                }, 300);
            }
        },
        getModal(event){
            event.preventDefault();
            const $item = $(event.currentTarget);
            const target = $item.data('modal');

            if($item.data('modal-delegated') === true){
                return false;
            }

            let $cortina = this.setScreen();

            $cortina.append('<div class="la-ball-beat"><div></div><div></div><div></div></div>').addClass('loaded');


            $.ajax({url: 'partials/'+ target +'.html',dataType: "html", success: (result) => {
                $('.la-ball-beat').remove();
                $cortina.append(result);

                $cortina.find('.lightbox').css('top', $document.scrollTop() + 30).addClass('animated bounceInDown');

                $cortina.one('click', (event) => {
                    event.stopPropagation();
                    $cortina.removeClass('loaded').remove();
                });

                $cortina.find('.lightbox').on('click',(event) => {
                    event.stopPropagation();
                });

                this.eventsHandler( $cortina.find('[data-func]') );

            }});

        },
        setScreen(){
            const cortina = '<div class="screen" data-func="closeModal"></div>';
            this.$body.append(cortina);

            const $cortina = $('.screen');
            $cortina.height($document.height());
            $cortina.addClass('on-screen');

            return $cortina;
        },
        isScrolledIntoView(elem){
            const $elem = $(elem);

            const docViewTop = this.$window.scrollTop();
            const docViewBottom = docViewTop + this.$window.height();

            const elemTop = $elem.offset().top;
            const elemBottom = elemTop + $elem.height();

            return ((elemBottom <= docViewBottom) && (elemTop >= docViewTop));
        },
        animateElements($elements){
            $.each($elements, (index, element) => {
                const $element = $(element);
                const animation = $element.data('animate') ? $element.data('animate') : $element.data('animate-on-scroll');

                $element.addClass('animated ' + animation);

            });
        },
        animateOnView($elements){
            $.each($elements, (index, element) => {
                const $element = $(element);
                const animation = $element.data('animate') ? $element.data('animate') : $element.data('animate-on-scroll');

                if(this.isScrolledIntoView($element)){
                    $element.addClass('animated ' + animation);
                }
            });
        },
        animateOnDelay($elements){
            $.each($elements, (index, element) => {
                const $element = $(element);
                if(this.isScrolledIntoView($element)){
                    $element.addClass('animated ' + $element.data('animate'));
                }
            });
        },
        /////////////////////////////////////////////////////////////////////////////////////////////
        /////////////////////////////////////////////////////////////////////////////////////////////
        ///////////////////////////////////////////////////////////////////////////////////////////// DELEGACIONES
        closeModal(event){
            event.preventDefault();
            const $item = $(event.currentTarget);
            $('.screen').find('.lightbox').removeClass('bounceInDown').addClass('bounceOutUp');

            setTimeout(() => {
                $('.screen').removeClass('on-screen');
            }, 600);
            
            setTimeout(() => {
                $('.screen').remove();
            }, 900);
        }
    };
    
    var Main = new window.handler();
    $document.ready(() => {Main.onReadySetup();});
    $window.on('load',() => { Main.onLoadSetup(); });

    $window.on({
        'scroll' : () => {Main.onScrollSetup();},
        'resize' : () => {Main.onResizeSetup();},
        'popstate' : (event) => {Main.onPopStateSetup(event);}
    });
} (window, document, jQuery));
