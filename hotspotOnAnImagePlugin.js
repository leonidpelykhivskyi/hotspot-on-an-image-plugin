(function(){
    'use strict';
    
    var classList = {
        tooltipWrapper: 'tl-wrapper',
        tooltipArrowWrapper: 'tl-arrow-wrapper',
        tooltipArrow: 'tl-arrow',
        tooltipTextWrapper: 'tl-text-wrapper',
        top: 'top',
        bottom: 'bottom',
        infoContainer: 'info-container',
        mouseover: 'mouseover'
    };
    
    var isTouchDevice = function(){
            return (('ontouchstart' in window)
                    || (navigator.MaxTouchPoints > 0)
                    || (navigator.msMaxTouchPoints > 0));
        },
        getElementsByAttribute = function (parent, attr){
            var matchingElements = [];
            var allElements = parent.getElementsByTagName('*');
            for (var i = 0, l = allElements.length; i < l; i++) {
                if (allElements[i].getAttribute(attr) !== null){
                    matchingElements.push(allElements[i]);
                }
            }
            return matchingElements;
        };
        
    var Tooltip = (function(){
        var tooltip;
        
        function init(){
            var domElement = 'div',
                tooltipElement = document.createElement(domElement),
                arrowWrapper = document.createElement(domElement),
                arrow = document.createElement(domElement),
                textWrapper = document.createElement(domElement);
            
            buildMarkup();
            
            bindEvents();

            return {
                show: show,
                hide: hide,
                element: tooltipElement
            };
            
            function show(container, element, text){
                if(text !== ''){
                    container.appendChild(tooltipElement);
                    textWrapper.textContent = text;
                    arrow.style.display = 'block';
                    tooltipElement.style.display = 'block';
                    var infoContainer = element.getElementsByClassName(classList.infoContainer)[0],
                        infoContainerHeight = infoContainer.offsetHeight,
                        arrowHalfWidth = arrow.offsetWidth / 2,
                        windowWidth = window.innerWidth,
                        spotBounds = {
                            width: element.offsetWidth,
                            height: element.offsetHeight,
                            clientTop: element.getBoundingClientRect().top,
                            clientLeft: element.getBoundingClientRect().left,
                            top: element.offsetTop,
                            left: element.offsetLeft,
                            centerPosition: {
                                top: element.offsetTop + element.offsetHeight / 2,
                                left: element.offsetLeft + element.offsetWidth / 2
                            }
                        },
                        tooltipBounds = {
                            width: tooltipElement.offsetWidth,
                            heigth: tooltipElement.offsetHeight,
                            top: 0,
                            left: 0
                        },
                        tooltipClientRect = null;
                    
                    if (tooltipBounds.heigth < spotBounds.clientTop + infoContainerHeight){
                        tooltipElement.classList.remove(classList.bottom);
                        tooltipElement.classList.add(classList.top);
                        tooltipBounds.top = spotBounds.centerPosition.top - infoContainerHeight - tooltipBounds.heigth;
                        tooltipElement.style.top = tooltipBounds.top + 'px';
                    } else {
                        tooltipElement.classList.remove(classList.top);
                        tooltipElement.classList.add(classList.bottom);
                        tooltipBounds.top = spotBounds.centerPosition.top + infoContainerHeight;
                        tooltipElement.style.top = tooltipBounds.top + 'px';
                    }
                    
                    tooltipBounds.left = spotBounds.centerPosition.left - tooltipBounds.width * 0.5;
                    arrow.style.left = spotBounds.centerPosition.left - tooltipBounds.left - arrowHalfWidth + 'px';

                    tooltipElement.style.left = tooltipBounds.left + 'px';
                    tooltipClientRect = tooltipElement.getBoundingClientRect();
                    if(tooltipClientRect.bottom > window.innerHeight){
                        tooltipElement.style.top = tooltipBounds.top - (tooltipClientRect.bottom - window.innerHeight) + 'px';
                        arrow.style.display = 'none';
                    }
                    if (tooltipClientRect.left < 0) {
                        tooltipElement.style.left =  tooltipBounds.left - tooltipClientRect.left + 'px';
                        arrow.style.left = spotBounds.centerPosition.left - tooltipBounds.left + tooltipClientRect.left - arrowHalfWidth + 'px';
                    } if (tooltipClientRect.right > windowWidth){
                        tooltipElement.style.left = tooltipBounds.left + (windowWidth - tooltipClientRect.right) + 'px';
                        arrow.style.left = spotBounds.centerPosition.left - tooltipBounds.left - (windowWidth - tooltipClientRect.right) - arrowHalfWidth + 'px';
                    }
                }
            }
            
            function hide(){
                var parentNode = tooltipElement.parentNode;
                if (parentNode){
                    parentNode.removeChild(tooltipElement);
                } else {
                    tooltipElement.style.display = 'block';
                }
            }
            
            function buildMarkup(){
                tooltipElement.classList.add(classList.tooltipWrapper);
                arrowWrapper.classList.add(classList.tooltipArrowWrapper);
                arrow.classList.add(classList.tooltipArrow);
                textWrapper.classList.add(classList.tooltipTextWrapper);

                arrowWrapper.appendChild(arrow);
                tooltipElement.appendChild(arrowWrapper);
                tooltipElement.appendChild(textWrapper);
            }
            
            function bindEvents(){
                if (isTouchDevice()){
                    tooltipElement.addEventListener('click', function(event){
                        event.stopPropagation();
                    });
                    document.addEventListener('click', function(event){
                        hide();
                    });
                } else{
                    tooltipElement.addEventListener('mouseover', function(){
                        tooltipElement.classList.add(classList.mouseover);
                    });

                    tooltipElement.addEventListener('mouseout', function(event){
                        var e = event.toElement || event.relatedTarget;
                        if (e && (e.parentNode == this || e == this)) {
                           return;
                        }
                        tooltipElement.classList.remove(classList.mouseover);
                        hide();
                    });
                }
            }
        }
        
        return {
            getInstance: function(){
                if (!tooltip){
                    tooltip = init();
                }
                return tooltip;
            }
        };
    })();
    
    var Spot = function(element, container, ratio){
        var that = this;
        that.element = element;
        that.defaultTopStyle = parseFloat(element.style.top);
        that.defaultLeftStyle = parseFloat(element.style.left);
        that.defaultWidthStyle = parseFloat(element.style.width);
        that.defaultHeightStyle = parseFloat(element.style.height);
        that.text = element.getAttribute('data-text');
        
        var tooltip = Tooltip.getInstance();
        
        that.hide = function (){
            element.style.display = 'none';
        }
        
        that.show = function() {
            that.element.style.display = 'inline-block';
        };
        
        that.updatePosition = function(ratio){
            that.element.style.top = that.defaultTopStyle * ratio + 'px';
            that.element.style.left = that.defaultLeftStyle * ratio + 'px';
            that.element.style.width = that.defaultWidthStyle * ratio + 'px';
            that.element.style.height = that.defaultHeightStyle * ratio + 'px';
        };
        
        init();
        
        function init(){
            var infoElement = document.createElement('span');
            infoElement.classList.add(classList.infoContainer);
            that.element.appendChild(infoElement);
            that.hide();
            if (isTouchDevice()){
                that.element.addEventListener('click', function(event){
                    tooltip.show(container, that.element, that.text);
                    event.stopPropagation();
                });

            } else {
                that.element.addEventListener('mouseover', function () {
                    tooltip.show(container, that.element, that.text);
                });

                that.element.addEventListener('mouseout', function (event) {
                    var e = event.toElement || event.relatedTarget;
                    if (e && (e.parentNode == this || e == this || e == tooltip.element)) {
                       return;
                    }

                    setTimeout(function(){
                        if (!tooltip.element.classList.contains(classList.mouseover)){
                            tooltip.hide();
                        }
                    }, 10);
                });
            }
        }
    };
    
    window.HotspotOnImage = function(element) {
        var that = this,
            resizeTimer,
            refreshRate = 250;
        that.element = element;
        that.renderedImage = that.element.getElementsByTagName('img')[0];
        that.spots = [];
        that.ratio = 1;
        that.defaultImageWidth = 0;
        
        init();
        
        function init(){
            generateSpots();
            loadImage();
        }
        
        function loadImage(){
            var image = new Image();
            image.onload = function(){
                that.defaultImageWidth = this.width;
                that.ratio = that.renderedImage.offsetWidth / that.defaultImageWidth;
                updateSpotsPosition();
            };
            image.src = that.renderedImage.getAttribute('src');
        }
        
        function generateSpots(){
            var spots = getElementsByAttribute(that.element, 'data-id');
            eachSpots(spots, function(spot){
                that.spots.push(new Spot(spot, that.element, that.ratio));
            });
        }
        
        function updateSpotsPosition(){
            that.ratio = that.renderedImage.offsetWidth / that.defaultImageWidth;
            eachSpots(that.spots, function(spot){
                spot.updatePosition(that.ratio);
                spot.show();
            });
        }
        
        function eachSpots(spots, callback){
            var spotsLength = spots.length;
            for (var i = 0; i < spotsLength; i++){
                if (typeof callback === 'function'){
                    callback.call(this, spots[i]);
                }
            }
        }

        window.addEventListener('resize', function(){
            eachSpots(that.spots, function(spot){ spot.hide(); });
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(updateSpotsPosition, 250);
        });
    };
    
})();