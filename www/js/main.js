(function (window, document, $, undefined) {
    "use strict"; //Modo estricto para prevenir errores y malas prácticas
    
    //Se almacena window y document en variables al comienzo para no utilizar memoria después
    const $window = $(window),
        $document = $(document);
    
    //Detecta la versión de Internet Explorer según su User Agent y retorna su versión
    function getInternetExplorerVersion() {
        let rv = -1; // Return value assumes failure.
        if (navigator.appName == 'Microsoft Internet Explorer') {
            const ua = navigator.userAgent;
            const re = new RegExp("MSIE ([0-9]{1,}[\.0-9]{0,})");
            if (re.exec(ua) != null)
                rv = parseFloat(RegExp.$1);
        }
        return rv;
    }

    // detecta IE9- a través del parseo del useragent y coloca una clase con la versión de IE en el HTML a través de Modernizr
    Modernizr.addTest('oldie', () => {
        const v = getInternetExplorerVersion();
        return v <= 9 && v > -1 ;
    });
    Modernizr.addTest('oldie-8', () => {
        const v = getInternetExplorerVersion();
        return v <= 8 && v > -1 ;
    });
    Modernizr.addTest('oldie-7', () => {
        const v = getInternetExplorerVersion();
        return v <= 7 && v > -1 ;
    });
    
    /////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////////////////////// PLUGINS

    //Igual la altura de las cajas
    $.fn.equalizeHeights = () => {
        let $items = $(this),
            heightArray = [];
        if( !$items.length ){ return; }
        $items.height('auto');
        $items.each((index, elem) => { heightArray.push( $(elem).height() ); });
        $items.height( Math.max.apply( Math, heightArray ) ); 
        return this;
    };

    /////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////////////////////// HANDLERS

    window.handler = () => {
       
    };


    //Se almacenan las funciones dentro del prototipo del objeto por convención, recomendación y performance por sobre todo
    window.handler.prototype = {

        /////////////////////////////////////////////////////////////////////////////////////////////
        /////////////////////////////////////////////////////////////////////////////////////////////
        ///////////////////////////////////////////////////////////////////////////////////////////// INICIALIZADORAS

        //Funciones que se inicializan en el document.ready
        onReadySetup(){
            this.$body = $('body'); //Se almacena el body en una variable para ahorrar memoria

            this.eventsHandler( $('[data-func]') ); //Se ejecuta el método que permite la delegación de eventos automática desde el HTML
            if( ! Modernizr.svg ) { this.svgFallback( $('[data-svgfallback]') ); } //Se ejecuta el fallback para SVG's si es que el navegador no lo soporta
            
            //Validador de formularios
            $('form[data-validate]').on('submit', (event) => {
                this.validateForms(event);
            });
            $('form[data-validate]').find('[required]').on('blur keyup change', (event) => {
                this.validateForms(event);
            });

            //Animaciones CSS al mostrar elemento en pantalla
            this.animateElements($('[data-animate]'));

        },
        //Funciones que se inicializan en el window.load
        onLoadSetup(){
            $('.equal').equalizeHeights();
        },
        //Funciones que se inicializan en el evento scroll
        onScrollSetup(){
             //Animaciones CSS al mostrar elemento en pantalla
            this.animateOnView($('[data-animate-on-scroll]'));
            //Animaciones CSS con delay
            this.animateOnDelay($('[data-animate-delay]'));
        },
        //Funciones que se inicializan en el evento resize
        onResizeSetup(){
            $('.equal').equalizeHeights();
        },
        //Setea delegaciones automáticas a través del HTML
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
        //Fallback para imágenes SVG
        svgFallback( $elements ){
            if( ! $elements.length ){ return; }
            let $item;

            $elements.each((index, elem) => {
                $item = $(elem);
                $item.attr('src', $item.data('svgfallback'));
            });
        },
        //Formatea strings según parámetros
        // self.currency(value, 0, ['.', '.', '.'])
        currency(num) {
            let str = num.toString().replace("$", ""), parts = false, output = [], i = 1, formatted = null;
            if(str.indexOf(".") > 0) {
                parts = str.split(".");
                str = parts[0];
            }
            str = str.split("").reverse();
            for(var j = 0, len = str.length; j < len; j++) {
                if(str[j] != ".") {
                    output.push(str[j]);
                    if(i%3 == 0 && j < (len - 1)) {
                        output.push(".");
                    }
                    i++;
                }
            }
            formatted = output.reverse().join("");
            return(formatted + ((parts) ? "." + parts[1].substr(0, 2) : ""));
        },
        validateForms(event){
            event.preventDefault();
            const $form = event.type == 'submit' ? $(event.currentTarget) : $(event.currentTarget).parents('form');//Se almacena el objeto del formulario, en caso de submit y en caso de otros eventos
            const $inputs = event.type == 'submit' ? $form.find('[required]') : $(event.currentTarget); //Se almacenan todos los elementos requeridos
            let isValid = true; //Flag para saber si el formulario finalmente es válido o no, al comienzo siempre es válido
            const emailRegEx = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/; //Regex para comprobar email
            const numerosRegEx = /^\d+(?:\.\d{1,2})?$/; //Regex para comprobar números
            const letrasyNumerosRegEx = /^[0-9a-zA-Z]+$/ //Regex para numeros y letras;
            //Función que setea un input inválido
            const setToFalse = ($input) => {
                const customMessage = $input.data('custom-message'); //Mensaje customizado
                const type = $input.attr('type'); //Tipo de input
                isValid = false; //flag

                if(type == 'hidden'){return false;} //Si el tipo de input es hidden no hace nada

                $input.addClass('invalid-input').removeClass('valid-input'); //Agrega la clase de inválido y quita la clase de válido

                if(!$input.next().is('.error-message') && event.type == 'submit' && customMessage){
                    $input.after('<p class="error-message">'+ customMessage +'</p>'); //Agrega mensaje de error si es que este no existe
                }

                if(type == 'radio' || type == 'checkbox'){return false;} //Si es un checkbox o un radio no hace nada
            }
            //Función que setea un input válido
            const setToTrue = ($input) => {
                const type = $input.attr('type');

                if(type == 'hidden' || type == 'radio' || type == 'checkbox'){return false;}

                $input.addClass('valid-input').removeClass('invalid-input'); //Agrega la clase valdia al input

                if($input.data('disable-img-error')){return false;}
            }
            //Función que valida radio buttons, comprobando si uno está marcado o no
            const validateRadio = ($element) => {
                const $radioPack = $('input[name="'+ $element.attr('name') +'"]');
                let isValidRadio = false;
                $.each($radioPack, (index, element) => {
                    const $e = $(element);
                    if($e.prop('checked') == true){
                        isValidRadio = true;
                    }
                });

                if(isValidRadio == false){
                    setToFalse($element);
                }
            }

            //Se elimina la clase de error a los inputs y la clase de input válido
            $inputs.removeClass('invalid-input');
            $('[name="'+ $inputs.attr('name') +'"]').removeClass('invalid-input');
            $inputs.removeClass('valid-input');

            //Si no es click, elimina el mensaje de error
            if(event.type != 'submit'){
                const $currentItem = $(event.currentTarget);
                if($currentItem.next().is('.error-message')){
                    $currentItem.next().remove();
                }
            }

            $.each($inputs, (index, element) => {
                const $element = $(element);
                const tagName = $(element).prop('tagName').toLowerCase();
                const limit = $element.data('limit') ? $element.data('limit') : 5;
                const elementValue = tagName == 'input' || tagName == 'textarea' ? $element.val() : $element.find('option:selected').val();

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

                //Email
                if(tagName == 'input' && $element.attr('type') == 'email' && emailRegEx.test(elementValue) == false){
                    setToFalse($element);
                }

                //RUT
                if(tagName == 'input' && $element.hasClass('rut-input') && $.Rut.validar(elementValue) == false){
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

            
            if(isValid && event.type == 'submit'){
                $form.off('submit');
                $form.submit();
            }else if(!isValid && !$form.data('no-scroll') && event.type == 'submit'){
                $('html, body').animate({
                    scrollTop: $(".invalid-input").offset().top - 120
                }, 300);
            }
        },
        setupSliders(){
            const $content_sliders = $('.slider'),
                automatic = $content_sliders.attr('data-auto') ? $content_sliders.attr('data-auto') : false;

            if($content_sliders.length === 0){return;}

            $content_sliders.each((index, elem) => {
                const $elem = $(elem),
                      slider = $elem.ninjaSlider({
                        auto : automatic,
                        transitionCallback : ( index, slide, container ) => {
                            const $slider = $(container),
                                $bullets = $slider.find('.slide-control'),
                                $numbers = $slider.prev().find('.change-number');

                            $bullets.removeClass('active').filter('[data-slide="'+ index +'"]').addClass('active');
                            $numbers.text(index + 1);
                        }
                    }).data('ninjaSlider'),
                    totalSlidesIndex = $elem.find('.content-slider-items').children().length - 1;


                    $elem.parent().find('.control-arrow').on('click', ( event ) => {
                        const $item = $(event.currentTarget),
                            activeSlideNum = $elem.find('.slide-control.active').data('slide'),
                            direction = $item.hasClass('next'),
                            totalSlidesIndex = $elem.find('.content-slider-items').children().length - 1;

                        let targetSlidenum;

                        if( direction ){
                            targetSlidenum = (activeSlideNum + 1) > totalSlidesIndex ? 0 : (activeSlideNum + 1);
                        } else {
                            targetSlidenum = (activeSlideNum - 1) < 0 ? totalSlidesIndex : (activeSlideNum - 1);
                        }

                        slider.slide(targetSlidenum);
                    });

                    $elem.find('.slide-control').on('click', ( event ) => {
                        const $item = $(event.currentTarget),
                            targetSlidenum = $item.data('slide');
                        slider.slide(targetSlidenum);
                    });


            });

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
        //Retorna truo o false si el elemento está en pantalla
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

    
    /////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////////////////////// COMIENZO
    
    
    var Main = new window.handler(); //Se genera un nuevo objeto para almacenar las funciones
    $document.ready(() => {Main.onReadySetup();}); //Se inicializan las funcionalidades en el document.ready
    $window.load(() => { Main.onLoadSetup(); }); //Se inicializan las funcionalidades en el window.ready

    //Se inicializan las funcionalidades los eventos scroll y resize
    $window.on({
        'scroll' : () => {Main.onScrollSetup();},
        'resize' : () => {Main.onResizeSetup();}
    });
    
    
        
} (window, document, jQuery));
