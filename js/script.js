/**
 * Global variables
 */
'use strict'

var userAgent = navigator.userAgent.toLowerCase(),
  initialDate = new Date(),
  $document = $(document),
  $window = $(window),
  $html = $('html'),
  isDesktop = $html.hasClass('desktop'),
  isIE =
    userAgent.indexOf('msie') != -1
      ? parseInt(userAgent.split('msie')[1])
      : userAgent.indexOf('trident') != -1
      ? 11
      : userAgent.indexOf('edge') != -1
      ? 12
      : false,
  isMobile =
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    ),
  isTouch = 'ontouchstart' in window,
  plugins = {
    pointerEvents: isIE < 11 ? 'js/pointer-events.min.js' : false,
    smoothScroll: $html.hasClass('use--smoothscroll')
      ? 'js/smoothscroll.min.js'
      : false,
    bootstrapTooltip: $("[data-toggle='tooltip']"),
    bootstrapTabs: $('.tabs'),
    rdParallax: $('.rd-parallax'),
    rdAudioPlayer: $('.rd-audio'),
    rdVideoPlayer: $('.rd-video-player'),
    responsiveTabs: $('.responsive-tabs'),
    maps: $('.google-map-container'),
    rdInputLabel: $('.form-label'),
    rdNavbar: $('.rd-navbar'),
    rdVideoBG: $('.rd-video'),
    regula: $('[data-constraints]'),
    stepper: $("input[type='number']"),
    radio: $("input[type='radio']"),
    checkbox: $("input[type='checkbox']"),
    textRotator: $('.text-rotator'),
    owl: $('.owl-carousel'),
    swiper: $('.swiper-slider'),
    counter: $('.counter'),
    lightGallery: $("[data-lightgallery='group']"),
    lightGalleryItem: $("[data-lightgallery='item']"),
    lightDynamicGalleryItem: $("[data-lightgallery='dynamic']"),
    flickrfeed: $('.flickr'),
    twitterfeed: $('.twitter'),
    progressBar: $('.progress-linear'),
    circleProgress: $('.progress-bar-circle'),
    isotope: $('.isotope'),
    countDown: $('.countdown'),
    stacktable: $("table[data-responsive='true']"),
    customToggle: $('[data-custom-toggle]'),
    customWaypoints: $('[data-custom-scroll-to]'),
    resizable: $('.resizable'),
    selectFilter: $('select'),
    calendar: $('.rd-calendar'),
    productThumb: $('.product-thumbnails'),
    imgZoom: $('.img-zoom'),
    facebookfeed: $('.facebook'),
    pageLoader: $('.page-loader'),
    search: $('.rd-search'),
    searchResults: $('.rd-search-results'),
    instafeed: $('.instafeed'),
    rdMailForm: $('.rd-mailform'),
    iframeEmbed: $('iframe.embed-responsive-item'),
    bootstrapDateTimePicker: $('[data-time-picker]'),
    additionalFields: $('.additional-fields'),
    materialParallax: $('.parallax-container'),
    copyrightYear: $('.copyright-year'),
    videBG: $('.bg-vide'),
  }

/**
 * Initialize All Scripts
 */
$document.ready(function () {
  var isNoviBuilder = window.xMode

  /**
   * isScrolledIntoView
   * @description  check the element whas been scrolled into the view
   */
  function isScrolledIntoView(elem) {
    if (!isNoviBuilder) {
      return (
        elem.offset().top + elem.outerHeight() >= $window.scrollTop() &&
        elem.offset().top <= $window.scrollTop() + $window.height()
      )
    } else {
      return true
    }
  }

  /**
   * @desc Calls a function when element has been scrolled into the view
   * @param {object} element - jQuery object
   * @param {function} func - init function
   */
  function lazyInit(element, func) {
    var scrollHandler = function () {
      if (!element.hasClass('lazy-loaded') && isScrolledIntoView(element)) {
        func.call()
        element.addClass('lazy-loaded')
      }
    }

    scrollHandler()
    $window.on('scroll', scrollHandler)
  }

  /**
   * Google map function for getting latitude and longitude
   */
  function getLatLngObject(str, marker, map, callback) {
    var coordinates = {}
    try {
      coordinates = JSON.parse(str)
      callback(
        new google.maps.LatLng(coordinates.lat, coordinates.lng),
        marker,
        map
      )
    } catch (e) {
      map.geocoder.geocode({ address: str }, function (results, status) {
        if (status === google.maps.GeocoderStatus.OK) {
          var latitude = results[0].geometry.location.lat()
          var longitude = results[0].geometry.location.lng()

          callback(
            new google.maps.LatLng(parseFloat(latitude), parseFloat(longitude)),
            marker,
            map
          )
        }
      })
    }
  }

  /**
   * @desc Initialize Google maps
   */
  function initMaps() {
    var key

    for (var i = 0; i < plugins.maps.length; i++) {
      if (plugins.maps[i].hasAttribute('data-key')) {
        key = plugins.maps[i].getAttribute('data-key')
        break
      }
    }

    $.getScript(
      '//maps.google.com/maps/api/js?' +
        (key ? 'key=' + key + '&' : '') +
        'sensor=false&libraries=geometry,places&v=quarterly',
      function () {
        var head = document.getElementsByTagName('head')[0],
          insertBefore = head.insertBefore

        head.insertBefore = function (newElement, referenceElement) {
          if (
            (newElement.href &&
              newElement.href.indexOf(
                '//fonts.googleapis.com/css?family=Roboto'
              ) !== -1) ||
            newElement.innerHTML.indexOf('gm-style') !== -1
          ) {
            return
          }
          insertBefore.call(head, newElement, referenceElement)
        }

        var geocoder = new google.maps.Geocoder()
        for (var i = 0; i < plugins.maps.length; i++) {
          var zoom = parseInt(plugins.maps[i].getAttribute('data-zoom')) || 11
          var styles
          if (plugins.maps[i].hasAttribute('data-styles')) {
            try {
              styles = JSON.parse(plugins.maps[i].getAttribute('data-styles'))
            } catch (error) {
              styles = []
            }
          }
          var center = plugins.maps[i].getAttribute('data-center')

          // Initialize map
          var map = new google.maps.Map(
            plugins.maps[i].querySelectorAll('.google-map')[0],
            {
              zoom: zoom,
              styles: styles,
              scrollwheel: false,
              center: { lat: 0, lng: 0 },
            }
          )
          // Add map object to map node
          plugins.maps[i].map = map
          plugins.maps[i].geocoder = geocoder
          plugins.maps[i].keySupported = true
          plugins.maps[i].google = google

          // Get Center coordinates from attribute
          getLatLngObject(
            center,
            null,
            plugins.maps[i],
            function (location, markerElement, mapElement) {
              mapElement.map.setCenter(location)
            }
          )

          // Add markers from google-map-markers array
          var markerItems = plugins.maps[i].querySelectorAll(
            '.google-map-markers li'
          )
          if (markerItems.length) {
            var markers = []
            for (var j = 0; j < markerItems.length; j++) {
              var markerElement = markerItems[j]
              getLatLngObject(
                markerElement.getAttribute('data-location'),
                markerElement,
                plugins.maps[i],
                function (location, markerElement, mapElement) {
                  var icon =
                    markerElement.getAttribute('data-icon') ||
                    mapElement.getAttribute('data-icon')
                  var activeIcon =
                    markerElement.getAttribute('data-icon-active') ||
                    mapElement.getAttribute('data-icon-active')
                  var info =
                    markerElement.getAttribute('data-description') || ''
                  var infoWindow = new google.maps.InfoWindow({
                    content: info,
                  })
                  markerElement.infoWindow = infoWindow
                  var markerData = {
                    position: location,
                    map: mapElement.map,
                  }
                  if (icon) {
                    markerData.icon = icon
                  }
                  var marker = new google.maps.Marker(markerData)
                  markerElement.gmarker = marker
                  markers.push({
                    markerElement: markerElement,
                    infoWindow: infoWindow,
                  })
                  marker.isActive = false
                  // Handle infoWindow close click
                  google.maps.event.addListener(
                    infoWindow,
                    'closeclick',
                    function (markerElement, mapElement) {
                      var markerIcon
                      markerElement.gmarker.isActive = false
                      if (
                        (markerIcon =
                          markerElement.getAttribute('data-icon') ||
                          mapElement.getAttribute('data-icon'))
                      ) {
                        markerElement.gmarker.setIcon(markerIcon)
                      }
                    }.bind(this, markerElement, mapElement)
                  )

                  // Set marker active on Click and open infoWindow
                  google.maps.event.addListener(
                    marker,
                    'click',
                    function (markerElement, mapElement) {
                      if (markerElement.infoWindow.getContent().length === 0)
                        return
                      var gMarker,
                        currentMarker = markerElement.gmarker,
                        currentInfoWindow
                      for (var k = 0; k < markers.length; k++) {
                        var markerIcon
                        if (markers[k].markerElement === markerElement) {
                          currentInfoWindow = markers[k].infoWindow
                        }
                        gMarker = markers[k].markerElement.gmarker
                        if (
                          gMarker.isActive &&
                          markers[k].markerElement !== markerElement
                        ) {
                          gMarker.isActive = false
                          if (
                            (markerIcon =
                              markers[k].markerElement.getAttribute(
                                'data-icon'
                              ) || mapElement.getAttribute('data-icon'))
                          ) {
                            gMarker.setIcon(markerIcon)
                          }
                          markers[k].infoWindow.close()
                        }
                      }

                      currentMarker.isActive = !currentMarker.isActive
                      if (currentMarker.isActive) {
                        if (
                          (markerIcon =
                            markerElement.getAttribute('data-icon-active') ||
                            mapElement.getAttribute('data-icon-active'))
                        ) {
                          currentMarker.setIcon(markerIcon)
                        }

                        currentInfoWindow.open(map, marker)
                      } else {
                        if (
                          (markerIcon =
                            markerElement.getAttribute('data-icon') ||
                            mapElement.getAttribute('data-icon'))
                        ) {
                          currentMarker.setIcon(markerIcon)
                        }
                        currentInfoWindow.close()
                      }
                    }.bind(this, markerElement, mapElement)
                  )
                }
              )
            }
          }
        }
      }
    )
  }

  /**
   * resizeOnImageLoad
   * @description  calls a resize event when imageloaded
   */
  function resizeOnImageLoad(image) {
    image.onload = function () {
      $window.trigger('resize')
    }
  }

  /**
   * @desc Calculate the height of swiper slider basing on data attr
   * @param {object} object - slider jQuery object
   * @param {string} attr - attribute name
   * @return {number} slider height
   */
  function getSwiperHeight(object, attr) {
    var val = object.attr('data-' + attr),
      dim

    if (!val) {
      return undefined
    }

    dim = val.match(/(px)|(%)|(vh)|(vw)$/i)

    if (dim.length) {
      switch (dim[0]) {
        case 'px':
          return parseFloat(val)
        case 'vh':
          return $window.height() * (parseFloat(val) / 100)
        case 'vw':
          return $window.width() * (parseFloat(val) / 100)
        case '%':
          return object.width() * (parseFloat(val) / 100)
      }
    } else {
      return undefined
    }
  }

  /**
   * @desc Toggle swiper videos on active slides
   * @param {object} swiper - swiper slider
   */
  function toggleSwiperInnerVideos(swiper) {
    var prevSlide = $(swiper.slides[swiper.previousIndex]),
      nextSlide = $(swiper.slides[swiper.activeIndex]),
      videos,
      videoItems = prevSlide.find('video')

    for (var i = 0; i < videoItems.length; i++) {
      videoItems[i].pause()
    }

    videos = nextSlide.find('video')
    if (videos.length) {
      videos.get(0).play()
    }
  }

  /**
   * @desc Toggle swiper animations on active slides
   * @param {object} swiper - swiper slider
   */
  function toggleSwiperCaptionAnimation(swiper) {
    var prevSlide = $(swiper.container).find('[data-caption-animate]'),
      nextSlide = $(swiper.slides[swiper.activeIndex]).find(
        '[data-caption-animate]'
      ),
      delay,
      duration,
      nextSlideItem,
      prevSlideItem

    for (var i = 0; i < prevSlide.length; i++) {
      prevSlideItem = $(prevSlide[i])

      prevSlideItem
        .removeClass('animated')
        .removeClass(prevSlideItem.attr('data-caption-animate'))
        .addClass('not-animated')
    }

    var tempFunction = function (nextSlideItem, duration) {
      return function () {
        nextSlideItem
          .removeClass('not-animated')
          .addClass(nextSlideItem.attr('data-caption-animate'))
          .addClass('animated')
        if (duration) {
          nextSlideItem.css('animation-duration', duration + 'ms')
        }
      }
    }

    for (var i = 0; i < nextSlide.length; i++) {
      nextSlideItem = $(nextSlide[i])
      delay = nextSlideItem.attr('data-caption-delay')
      duration = nextSlideItem.attr('data-caption-duration')
      if (!isNoviBuilder) {
        if (delay) {
          setTimeout(tempFunction(nextSlideItem, duration), parseInt(delay, 10))
        } else {
          tempFunction(nextSlideItem, duration)
        }
      } else {
        nextSlideItem.removeClass('not-animated')
      }
    }
  }

  /**
   * attachFormValidator
   * @description  attach form validation to elements
   */
  function attachFormValidator(elements) {
    for (var i = 0; i < elements.length; i++) {
      var o = $(elements[i]),
        v
      o.addClass('form-control-has-validation').after(
        "<span class='form-validation'></span>"
      )
      v = o.parent().find('.form-validation')
      if (v.is(':last-child')) {
        o.addClass('form-control-last-child')
      }
    }

    elements
      .on('input change propertychange blur', function (e) {
        var $this = $(this),
          results

        if (e.type !== 'blur') {
          if (!$this.parent().hasClass('has-error')) {
            return
          }
        }

        if ($this.parents('.rd-mailform').hasClass('success')) {
          return
        }

        if ((results = $this.regula('validate')).length) {
          for (i = 0; i < results.length; i++) {
            $this
              .siblings('.form-validation')
              .text(results[i].message)
              .parent()
              .addClass('has-error')
          }
        } else {
          $this
            .siblings('.form-validation')
            .text('')
            .parent()
            .removeClass('has-error')
        }
      })
      .regula('bind')

    var regularConstraintsMessages = [
      {
        type: regula.Constraint.Required,
        newMessage: 'The text field is required.',
      },
      {
        type: regula.Constraint.Email,
        newMessage: 'The email is not a valid email.',
      },
      {
        type: regula.Constraint.Numeric,
        newMessage: 'Only numbers are required',
      },
      {
        type: regula.Constraint.Selected,
        newMessage: 'Please choose an option.',
      },
    ]

    for (var i = 0; i < regularConstraintsMessages.length; i++) {
      var regularConstraint = regularConstraintsMessages[i]

      regula.override({
        constraintType: regularConstraint.type,
        defaultMessage: regularConstraint.newMessage,
      })
    }
  }

  /**
   * isValidated
   * @description  check if all elemnts pass validation
   */
  function isValidated(elements, captcha) {
    var results,
      errors = 0

    if (elements.length) {
      for (j = 0; j < elements.length; j++) {
        var $input = $(elements[j])
        if ((results = $input.regula('validate')).length) {
          for (k = 0; k < results.length; k++) {
            errors++
            $input
              .siblings('.form-validation')
              .text(results[k].message)
              .parent()
              .addClass('has-error')
          }
        } else {
          $input
            .siblings('.form-validation')
            .text('')
            .parent()
            .removeClass('has-error')
        }
      }

      if (captcha) {
        if (captcha.length) {
          return validateReCaptcha(captcha) && errors == 0
        }
      }

      return errors == 0
    }
    return true
  }

  /**
   * validateReCaptcha
   * @description  validate google reCaptcha
   */
  function validateReCaptcha(captcha) {
    var captchaToken = captcha.find('.g-recaptcha-response').val()

    if (captchaToken.length === 0) {
      captcha
        .siblings('.form-validation')
        .html('Please, prove that you are not robot.')
        .addClass('active')
      captcha.closest('.form-group').addClass('has-error')

      captcha.on('propertychange', function () {
        var $this = $(this),
          captchaToken = $this.find('.g-recaptcha-response').val()

        if (captchaToken.length > 0) {
          $this.closest('.form-group').removeClass('has-error')
          $this.siblings('.form-validation').removeClass('active').html('')
          $this.off('propertychange')
        }
      })

      return false
    }

    return true
  }

  /**
   * onloadCaptchaCallback
   * @description  init google reCaptcha
   */
  window.onloadCaptchaCallback = function () {
    for (i = 0; i < plugins.captcha.length; i++) {
      var $capthcaItem = $(plugins.captcha[i])

      grecaptcha.render($capthcaItem.attr('id'), {
        sitekey: $capthcaItem.attr('data-sitekey'),
        size: $capthcaItem.attr('data-size')
          ? $capthcaItem.attr('data-size')
          : 'normal',
        theme: $capthcaItem.attr('data-theme')
          ? $capthcaItem.attr('data-theme')
          : 'light',
        callback: function (e) {
          $('.recaptcha').trigger('propertychange')
        },
      })
      $capthcaItem.after("<span class='form-validation'></span>")
    }
  }

  /**
   * makeParallax
   * @description  create swiper parallax scrolling effect
   */
  function makeParallax(el, speed, wrapper, prevScroll) {
    var scrollY = window.scrollY || window.pageYOffset

    if (prevScroll != scrollY) {
      prevScroll = scrollY
      el.addClass('no-transition')
      el[0].style['transform'] =
        'translate3d(0,' + -scrollY * (1 - speed) + 'px,0)'
      el.height()
      el.removeClass('no-transition')

      if (el.attr('data-fade') === 'true') {
        var bound = el[0].getBoundingClientRect(),
          offsetTop = bound.top * 2 + scrollY,
          sceneHeight = wrapper.outerHeight(),
          sceneDevider = wrapper.offset().top + sceneHeight / 2.0,
          layerDevider = offsetTop + el.outerHeight() / 2.0,
          pos = sceneHeight / 6.0,
          opacity
        if (
          sceneDevider + pos > layerDevider &&
          sceneDevider - pos < layerDevider
        ) {
          el[0].style['opacity'] = 1
        } else {
          if (sceneDevider - pos < layerDevider) {
            opacity =
              1 + ((sceneDevider + pos - layerDevider) / sceneHeight / 3.0) * 5
          } else {
            opacity =
              1 - ((sceneDevider - pos - layerDevider) / sceneHeight / 3.0) * 5
          }
          el[0].style['opacity'] =
            opacity < 0 ? 0 : opacity > 1 ? 1 : opacity.toFixed(2)
        }
      }
    }

    requestAnimationFrame(function () {
      makeParallax(el, speed, wrapper, prevScroll)
    })
  }

  /**
   * @desc Initialize owl carousel plugin
   * @param {object} c - carousel jQuery object
   */
  function initOwlCarousel(c) {
    var aliaces = ['-', '-xs-', '-sm-', '-md-', '-lg-', '-xl-'],
      values = [0, 480, 768, 992, 1200, 1600],
      responsive = {}

    for (var j = 0; j < values.length; j++) {
      responsive[values[j]] = {}
      for (var k = j; k >= -1; k--) {
        if (
          !responsive[values[j]]['items'] &&
          c.attr('data' + aliaces[k] + 'items')
        ) {
          responsive[values[j]]['items'] =
            k < 0 ? 1 : parseInt(c.attr('data' + aliaces[k] + 'items'), 10)
        }
        if (
          !responsive[values[j]]['stagePadding'] &&
          responsive[values[j]]['stagePadding'] !== 0 &&
          c.attr('data' + aliaces[k] + 'stage-padding')
        ) {
          responsive[values[j]]['stagePadding'] =
            k < 0
              ? 0
              : parseInt(c.attr('data' + aliaces[k] + 'stage-padding'), 10)
        }
        if (
          !responsive[values[j]]['margin'] &&
          responsive[values[j]]['margin'] !== 0 &&
          c.attr('data' + aliaces[k] + 'margin')
        ) {
          responsive[values[j]]['margin'] =
            k < 0 ? 30 : parseInt(c.attr('data' + aliaces[k] + 'margin'), 10)
        }
      }
    }

    // Enable custom pagination
    if (c.attr('data-dots-custom')) {
      c.on('initialized.owl.carousel', function (event) {
        var carousel = $(event.currentTarget),
          customPag = $(carousel.attr('data-dots-custom')),
          active = 0

        if (carousel.attr('data-active')) {
          active = parseInt(carousel.attr('data-active'), 10)
        }

        carousel.trigger('to.owl.carousel', [active, 300, true])
        customPag.find("[data-owl-item='" + active + "']").addClass('active')

        customPag.find('[data-owl-item]').on('click', function (e) {
          e.preventDefault()
          carousel.trigger('to.owl.carousel', [
            parseInt(this.getAttribute('data-owl-item'), 10),
            300,
            true,
          ])
        })

        carousel.on('translate.owl.carousel', function (event) {
          customPag.find('.active').removeClass('active')
          customPag
            .find("[data-owl-item='" + event.item.index + "']")
            .addClass('active')
        })
      })
    }

    c.on('initialized.owl.carousel', function () {
      initLightGalleryItem(
        c.find('[data-lightgallery="item"]'),
        'lightGallery-in-carousel'
      )
    })

    c.owlCarousel({
      autoplay: isNoviBuilder ? false : c.attr('data-autoplay') === 'true',
      loop: isNoviBuilder ? false : c.attr('data-loop') !== 'false',
      items: 1,
      center: c.attr('data-center') === 'true',
      dotsContainer: c.attr('data-pagination-class') || false,
      navContainer: c.attr('data-navigation-class') || false,
      mouseDrag: isNoviBuilder ? false : c.attr('data-mouse-drag') !== 'false',
      nav: c.attr('data-nav') === 'true',
      dots:
        isNoviBuilder && c.attr('data-nav') !== 'true'
          ? true
          : c.attr('data-dots') === 'true',
      dotsEach: c.attr('data-dots-each')
        ? parseInt(c.attr('data-dots-each'), 10)
        : false,
      animateIn: c.attr('data-animation-in')
        ? c.attr('data-animation-in')
        : false,
      animateOut: c.attr('data-animation-out')
        ? c.attr('data-animation-out')
        : false,
      responsive: responsive,
      navText: c.attr('data-nav-text')
        ? $.parseJSON(c.attr('data-nav-text'))
        : [],
      navClass: c.attr('data-nav-class')
        ? $.parseJSON(c.attr('data-nav-class'))
        : ['owl-prev', 'owl-next'],
    })
  }

  /**
   * Live Search
   * @description  create live search results
   */
  function liveSearch(options) {
    $('#' + options.live)
      .removeClass('cleared')
      .html()
    options.current++
    options.spin.addClass('loading')
    $.get(
      handler,
      {
        s: decodeURI(options.term),
        liveSearch: options.live,
        dataType: 'html',
        liveCount: options.liveCount,
        filter: options.filter,
        template: options.template,
      },
      function (data) {
        options.processed++
        if (
          options.processed == options.current &&
          !$('#' + options.live).hasClass('cleared')
        ) {
          $('#' + options.live).html(data)
        }
        options.spin
          .parents('.rd-search')
          .find('.input-group-addon')
          .removeClass('loading')
      }
    )
  }

  /**
   * @desc Initialize the gallery with set of images
   * @param {object} itemsToInit - jQuery object
   * @param {string} addClass - additional gallery class
   */
  function initLightGallery(itemsToInit, addClass) {
    if (!isNoviBuilder) {
      $(itemsToInit).lightGallery({
        thumbnail: $(itemsToInit).attr('data-lg-thumbnail') !== 'false',
        selector: "[data-lightgallery='item']",
        autoplay: $(itemsToInit).attr('data-lg-autoplay') === 'true',
        pause: parseInt($(itemsToInit).attr('data-lg-autoplay-delay')) || 5000,
        addClass: addClass,
        mode: $(itemsToInit).attr('data-lg-animation') || 'lg-slide',
        loop: $(itemsToInit).attr('data-lg-loop') !== 'false',
      })
    }
  }

  /**
   * @desc Initialize the gallery with dynamic addition of images
   * @param {object} itemsToInit - jQuery object
   * @param {string} addClass - additional gallery class
   */
  function initDynamicLightGallery(itemsToInit, addClass) {
    if (!isNoviBuilder) {
      $(itemsToInit).on('click', function () {
        $(itemsToInit).lightGallery({
          thumbnail: $(itemsToInit).attr('data-lg-thumbnail') !== 'false',
          selector: "[data-lightgallery='item']",
          autoplay: $(itemsToInit).attr('data-lg-autoplay') === 'true',
          pause:
            parseInt($(itemsToInit).attr('data-lg-autoplay-delay')) || 5000,
          addClass: addClass,
          mode: $(itemsToInit).attr('data-lg-animation') || 'lg-slide',
          loop: $(itemsToInit).attr('data-lg-loop') !== 'false',
          dynamic: true,
          dynamicEl:
            JSON.parse($(itemsToInit).attr('data-lg-dynamic-elements')) || [],
        })
      })
    }
  }

  /**
   * @desc Initialize the gallery with one image
   * @param {object} itemToInit - jQuery object
   * @param {string} addClass - additional gallery class
   */
  function initLightGalleryItem(itemToInit, addClass) {
    if (!isNoviBuilder) {
      $(itemToInit).lightGallery({
        selector: 'this',
        addClass: addClass,
        counter: false,
        youtubePlayerParams: {
          modestbranding: 1,
          showinfo: 0,
          rel: 0,
          controls: 0,
        },
        vimeoPlayerParams: {
          byline: 0,
          portrait: 0,
        },
      })
    }
  }

  /**
   * IE Polyfills
   * @description  Adds some loosing functionality to IE browsers
   */
  if (isIE) {
    if (isIE < 10) {
      $html.addClass('lt-ie-10')
    }

    if (isIE < 11) {
      if (plugins.pointerEvents) {
        $.getScript(plugins.pointerEvents).done(function () {
          $html.addClass('ie-10')
          PointerEventsPolyfill.initialize({})
        })
      }
    }

    if (isIE === 11) {
      $('html').addClass('ie-11')
    }

    if (isIE === 12) {
      $('html').addClass('ie-edge')
    }
  }

  // Swiper
  if (plugins.swiper.length) {
    for (var i = 0; i < plugins.swiper.length; i++) {
      var s = $(plugins.swiper[i])
      var pag = s.find('.swiper-pagination'),
        next = s.find('.swiper-button-next'),
        prev = s.find('.swiper-button-prev'),
        bar = s.find('.swiper-scrollbar'),
        swiperSlide = s.find('.swiper-slide'),
        autoplay = false

      for (var j = 0; j < swiperSlide.length; j++) {
        var $this = $(swiperSlide[j]),
          url

        if ((url = $this.attr('data-slide-bg'))) {
          $this.css({
            'background-image': 'url(' + url + ')',
            'background-size': 'cover',
          })
        }
      }

      swiperSlide
        .end()
        .find('[data-caption-animate]')
        .addClass('not-animated')
        .end()

      s.swiper({
        autoplay:
          !isNoviBuilder && $.isNumeric(s.attr('data-autoplay'))
            ? s.attr('data-autoplay')
            : false,
        direction: s.attr('data-direction')
          ? s.attr('data-direction')
          : 'horizontal',
        effect: s.attr('data-slide-effect')
          ? s.attr('data-slide-effect')
          : 'slide',
        speed: s.attr('data-slide-speed') ? s.attr('data-slide-speed') : 600,
        keyboardControl: s.attr('data-keyboard') === 'true',
        mousewheelControl: s.attr('data-mousewheel') === 'true',
        mousewheelReleaseOnEdges: s.attr('data-mousewheel-release') === 'true',
        nextButton: next.length ? next.get(0) : null,
        prevButton: prev.length ? prev.get(0) : null,
        pagination: pag.length ? pag.get(0) : null,
        paginationClickable: pag.length
          ? pag.attr('data-clickable') !== 'false'
          : false,
        paginationBulletRender: pag.length
          ? pag.attr('data-index-bullet') === 'true'
            ? function (swiper, index, className) {
                return (
                  '<span class="' + className + '">' + (index + 1) + '</span>'
                )
              }
            : null
          : null,
        scrollbar: bar.length ? bar.get(0) : null,
        scrollbarDraggable: bar.length
          ? bar.attr('data-draggable') !== 'false'
          : true,
        scrollbarHide: bar.length
          ? bar.attr('data-draggable') === 'false'
          : false,
        loop: isNoviBuilder ? false : s.attr('data-loop') !== 'false',
        simulateTouch:
          s.attr('data-simulate-touch') && !isNoviBuilder
            ? s.attr('data-simulate-touch') === 'true'
            : false,
        onTransitionStart: function (swiper) {
          toggleSwiperInnerVideos(swiper)
        },
        onTransitionEnd: function (swiper) {
          toggleSwiperCaptionAnimation(swiper)
        },
        onInit: function (swiper) {
          toggleSwiperInnerVideos(swiper)
          toggleSwiperCaptionAnimation(swiper)
        },
      })

      $window
        .on(
          'resize',
          (function (s) {
            return function () {
              var mh = getSwiperHeight(s, 'min-height'),
                h = getSwiperHeight(s, 'height')
              if (h) {
                s.css('height', mh ? (mh > h ? mh : h) : h)
              }
            }
          })(s)
        )
        .trigger('resize')
    }
  }

  /**
   * Copyright Year
   * @description  Evaluates correct copyright year
   */
  if (plugins.copyrightYear.length) {
    plugins.copyrightYear.text(initialDate.getFullYear())
  }

  /**
   * Circle Progress
   * @description Enable Circle Progress plugin
   */
  if (plugins.circleProgress.length) {
    var i
    for (i = 0; i < plugins.circleProgress.length; i++) {
      var circleProgressItem = $(plugins.circleProgress[i])
      $document
        .on('scroll', function () {
          if (!circleProgressItem.hasClass('animated')) {
            var arrayGradients = circleProgressItem
              .attr('data-gradient')
              .split(',')

            circleProgressItem
              .circleProgress({
                value: circleProgressItem.attr('data-value'),
                size: circleProgressItem.attr('data-size')
                  ? circleProgressItem.attr('data-size')
                  : 175,
                fill: { gradient: arrayGradients, gradientAngle: Math.PI / 4 },
                startAngle: (-Math.PI / 4) * 2,
                emptyFill: $(this).attr('data-empty-fill')
                  ? $(this).attr('data-empty-fill')
                  : 'rgb(245,245,245)',
              })
              .on(
                'circle-animation-progress',
                function (event, progress, stepValue) {
                  $(this)
                    .find('span')
                    .text(
                      String(stepValue.toFixed(2))
                        .replace('0.', '')
                        .replace('1.', '1')
                    )
                }
              )
            circleProgressItem.addClass('animated')
          }
        })
        .trigger('scroll')
    }
  }

  /**
   * Progress bar
   * @description  Enable progress bar
   */
  if (plugins.progressBar.length) {
    for (i = 0; i < plugins.progressBar.length; i++) {
      var progressBar = $(plugins.progressBar[i])
      $window.on(
        'scroll load',
        $.proxy(function () {
          var bar = $(this)
          if (!bar.hasClass('animated-first') && isScrolledIntoView(bar)) {
            var end = bar.attr('data-to')
            bar.find('.progress-bar-linear').css({ width: end + '%' })
            bar.find('.progress-value').countTo({
              refreshInterval: 40,
              from: 0,
              to: end,
              speed: 500,
            })
            bar.addClass('animated-first')
          }
        }, progressBar)
      )
    }
  }

  /**
   * jQuery Countdown
   * @description  Enable countdown plugin
   */
  if (plugins.countDown.length) {
    var i, j
    for (i = 0; i < plugins.countDown.length; i++) {
      var countDownItem = plugins.countDown[i],
        $countDownItem = $(countDownItem),
        d = new Date(),
        type = countDownItem.getAttribute('data-type'),
        time = countDownItem.getAttribute('data-time'),
        format = countDownItem.getAttribute('data-format'),
        settings = []

      d.setTime(Date.parse(time)).toLocaleString()
      settings[type] = d
      settings['format'] = format

      if ($countDownItem.parents('.countdown-modern').length) {
        settings['onTick'] = function () {
          var section = $(this).find('.countdown-section')
          for (j = 0; j < section.length; j++) {
            $(section[section.length - j - 1]).append(
              '<span class="countdown-letter">' +
                format[format.length - j - 1] +
                '</span>'
            )
          }
        }
      }

      $countDownItem.countdown(settings)
    }
  }

  /**
   * Smooth scrolling
   * @description  Enables a smooth scrolling for Google Chrome (Windows)
   */
  if (plugins.smoothScroll) {
    $.getScript(plugins.smoothScroll)
  }

  /**
   * Bootstrap tabs
   * @description Activate Bootstrap Tabs
   */
  if (plugins.bootstrapTabs.length) {
    var i
    for (i = 0; i < plugins.bootstrapTabs.length; i++) {
      var bootstrapTab = $(plugins.bootstrapTabs[i])

      bootstrapTab.on('click', 'a', function (event) {
        event.preventDefault()
        $(this).tab('show')
      })
    }
  }

  /**
   * Bootstrap Tooltips
   * @description Activate Bootstrap Tooltips
   */
  if (plugins.bootstrapTooltip.length) {
    plugins.bootstrapTooltip.tooltip()
  }

  /**
   * RD Audio player
   * @description Enables RD Audio player plugin
   */
  if (plugins.rdAudioPlayer.length) {
    var i
    for (i = 0; i < plugins.rdAudioPlayer.length; i++) {
      $(plugins.rdAudioPlayer[i]).RDAudio()
    }
    var playlistButton = $('.rd-audio-playlist-button')
    var playlist = plugins.rdAudioPlayer.find('.rd-audio-playlist-wrap')
    if (playlistButton.length) {
      playlistButton.on('click', function (e) {
        e.preventDefault()
        plugins.rdAudioPlayer.toggleClass('playlist-show')
        if (playlist.is(':hidden')) {
          playlist.slideDown(300)
        } else {
          playlist.slideUp(300)
        }
      })
      $document.on('click', function (e) {
        if (
          !$(e.target).is(playlist) &&
          playlist.find($(e.target)).length == 0 &&
          !$(e.target).is(playlistButton)
        ) {
          playlist.slideUp(300)
        }
      })
    }
  }

  /**
   * RD Video Player
   * @description Enables RD Video player plugin
   */
  function hidePlaylist() {
    $('.rd-video-player').removeClass('playlist-show')
  }

  function showPlaylist() {
    $('.rd-video-player').addClass('playlist-show')
  }

  if (plugins.rdVideoPlayer.length) {
    var i
    for (i = 0; i < plugins.rdVideoPlayer.length; i++) {
      var videoItem = $(plugins.rdVideoPlayer[i])

      $window.on(
        'scroll',
        $.proxy(function () {
          var video = $(this)
          if (
            isDesktop &&
            !video.hasClass('played') &&
            video.hasClass('play-on-scroll') &&
            isScrolledIntoView(video)
          ) {
            video.find('video')[0].play()
            video.addClass('played')
          }
        }, videoItem)
      )

      videoItem.RDVideoPlayer({
        callbacks: {
          onPlay: hidePlaylist,
          onPaused: showPlaylist,
          onEnded: showPlaylist,
        },
      })
      $window.on('load', showPlaylist)

      var volumeWrap = $('.rd-video-volume-wrap')

      volumeWrap.on('mouseenter', function () {
        $(this).addClass('hover')
      })

      volumeWrap.on('mouseleave', function () {
        $(this).removeClass('hover')
      })

      if (isTouch) {
        volumeWrap.find('.rd-video-volume').on('click', function () {
          $(this).toggleClass('hover')
        })
        $document.on('click', function (e) {
          if (
            !$(e.target).is(volumeWrap) &&
            $(e.target).parents(volumeWrap).length == 0
          ) {
            volumeWrap.find('.rd-video-volume').removeClass('hover')
          }
        })
      }
    }
  }

  /**
   * Responsive Tabs
   * @description Enables Responsive Tabs plugin
   */
  if (plugins.responsiveTabs.length) {
    var i = 0
    for (i = 0; i < plugins.responsiveTabs.length; i++) {
      var $this = $(plugins.responsiveTabs[i])
      $this.easyResponsiveTabs({
        type: $this.attr('data-type'),
        tabidentify: $this.find('.resp-tabs-list').attr('data-group') || 'tab',
      })
    }
  }

  /**
   * RD Flickr Feed
   * @description Enables RD Flickr Feed plugin
   */
  if (plugins.flickrfeed.length > 0) {
    var i
    for (i = 0; i < plugins.flickrfeed.length; i++) {
      var flickrfeedItem = $(plugins.flickrfeed[i])
      flickrfeedItem.RDFlickr({
        callback: function () {
          var items = flickrfeedItem.find('[data-photo-swipe-item]')

          if (items.length) {
            for (var j = 0; j < items.length; j++) {
              var image = new Image()
              image.setAttribute('data-index', j)
              image.onload = function () {
                items[this.getAttribute('data-index')].setAttribute(
                  'data-size',
                  this.naturalWidth + 'x' + this.naturalHeight
                )
              }
              image.src = items[j].getAttribute('href')
            }
          }
        },
      })
    }
  }

  /**
   * RD Twitter Feed
   * @description Enables RD Twitter Feed plugin
   */
  if (plugins.twitterfeed.length > 0) {
    var i
    for (i = 0; i < plugins.twitterfeed.length; i++) {
      var twitterfeedItem = plugins.twitterfeed[i]
      $(twitterfeedItem).RDTwitter({
        hideReplies: false,
        localTemplate: {
          avatar: 'images/features/rd-twitter-post-avatar-48x48.jpg',
        },
        callback: function () {
          $window.trigger('resize')
        },
      })
    }
  }

  /**
   * RD Input Label
   * @description Enables RD Input Label Plugin
   */
  if (plugins.rdInputLabel.length) {
    plugins.rdInputLabel.RDInputLabel()
  }

  /**
   * Stepper
   * @description Enables Stepper Plugin
   */
  if (plugins.stepper.length) {
    plugins.stepper.stepper({
      labels: {
        up: '',
        down: '',
      },
    })
  }

  /**
   * Radio
   * @description Add custom styling options for input[type="radio"]
   */
  if (plugins.radio.length) {
    var i
    for (i = 0; i < plugins.radio.length; i++) {
      var $this = $(plugins.radio[i])
      $this
        .addClass('radio-custom')
        .after("<span class='radio-custom-dummy'></span>")
    }
  }

  /**
   * Checkbox
   * @description Add custom styling options for input[type="checkbox"]
   */
  if (plugins.checkbox.length) {
    var i
    for (i = 0; i < plugins.checkbox.length; i++) {
      var $this = $(plugins.checkbox[i])
      $this
        .addClass('checkbox-custom')
        .after("<span class='checkbox-custom-dummy'></span>")
    }
  }

  /**
   * Regula
   * @description Enables Regula plugin
   */
  if (plugins.regula.length) {
    attachFormValidator(plugins.regula)
  }

  /**
   * WOW
   * @description Enables Wow animation plugin
   */
  if (
    $html.hasClass('desktop') &&
    $html.hasClass('wow-animation') &&
    $('.wow').length &&
    !isNoviBuilder
  ) {
    new WOW().init()
  }

  /**
   * Text Rotator
   * @description Enables Text Rotator plugin
   */
  if (plugins.textRotator.length) {
    var i
    for (i = 0; i < plugins.textRotator.length; i++) {
      var textRotatorItem = $(plugins.textRotator[i])
      textRotatorItem.rotator()
    }
  }

  /**
   * jQuery Count To
   * @description Enables Count To plugin
   */
  if (plugins.counter.length) {
    var i
    for (i = 0; i < plugins.counter.length; i++) {
      var counterItem = $(plugins.counter[i])

      $window.on(
        'scroll load',
        $.proxy(function () {
          var counter = $(this)
          if (
            !counter.hasClass('animated-first') &&
            isScrolledIntoView(counter)
          ) {
            counter.countTo({
              refreshInterval: 40,
              speed: counter.attr('data-speed') || 1000,
            })
            counter.addClass('animated-first')
          }
        }, counterItem)
      )
    }
  }

  /**
   * Owl carousel
   * @description Enables Owl carousel plugin
   */
  if (plugins.owl.length) {
    for (var i = 0; i < plugins.owl.length; i++) {
      var c = $(plugins.owl[i])
      plugins.owl[i] = c

      //skip owl in bootstrap tabs
      if (!c.parents('.tab-content').length) {
        initOwlCarousel(c)
      }
    }
  }

  /**
   * Isotope
   * @description Enables Isotope plugin
   */
  if (plugins.isotope.length) {
    var i,
      isogroup = []
    for (i = 0; i < plugins.isotope.length; i++) {
      var isotopeItem = plugins.isotope[i],
        iso = new Isotope(isotopeItem, {
          itemSelector: '.isotope-item',
          layoutMode: isotopeItem.getAttribute('data-isotope-layout')
            ? isotopeItem.getAttribute('data-isotope-layout')
            : 'masonry',
          filter: '*',
        })

      isogroup.push(iso)
    }

    $(window).on('load', function () {
      setTimeout(function () {
        var i
        for (i = 0; i < isogroup.length; i++) {
          isogroup[i].element.className += ' isotope--loaded'
          isogroup[i].layout()
        }
      }, 600)
    })

    var resizeTimout

    $('[data-isotope-filter]')
      .on('click', function (e) {
        e.preventDefault()
        var filter = $(this)
        clearTimeout(resizeTimout)
        filter.parents('.isotope-filters').find('.active').removeClass('active')
        filter.addClass('active')
        var iso = $(
          '.isotope[data-isotope-group="' +
            this.getAttribute('data-isotope-group') +
            '"]'
        )
        iso.isotope({
          itemSelector: '.isotope-item',
          layoutMode: iso.attr('data-isotope-layout')
            ? iso.attr('data-isotope-layout')
            : 'masonry',
          filter:
            this.getAttribute('data-isotope-filter') == '*'
              ? '*'
              : '[data-filter*="' +
                this.getAttribute('data-isotope-filter') +
                '"]',
        })
        //resizeTimout = setTimeout(function () {
        //  $window.trigger('resize');
        //}, 300);
      })
      .eq(0)
      .trigger('click')
  }

  /**
   * RD Video
   * @description Enables RD Video plugin
   */
  if (plugins.rdVideoBG.length) {
    for (i = 0; i < plugins.rdVideoBG.length; i++) {
      var videoItem = $(plugins.rdVideoBG[i])
      videoItem.RDVideo({})
    }
  }

  /**
   * RD Navbar
   * @description Enables RD Navbar plugin
   */
  if (plugins.rdNavbar.length) {
    for (i = 0; i < plugins.rdNavbar.length; i++) {
      var $currentNavbar = $(plugins.rdNavbar[i])
      $currentNavbar.RDNavbar({
        anchorNav: !isNoviBuilder,
        stickUpClone:
          $currentNavbar.attr('data-stick-up-clone') && !isNoviBuilder
            ? $currentNavbar.attr('data-stick-up-clone') === 'true'
            : false,
        responsive: {
          0: {
            stickUp: !isNoviBuilder
              ? $currentNavbar.attr('data-stick-up') === 'true'
              : false,
          },
          768: {
            stickUp: !isNoviBuilder
              ? $currentNavbar.attr('data-sm-stick-up') === 'true'
              : false,
          },
          992: {
            stickUp: !isNoviBuilder
              ? $currentNavbar.attr('data-md-stick-up') === 'true'
              : false,
          },
          1200: {
            stickUp: !isNoviBuilder
              ? $currentNavbar.attr('data-lg-stick-up') === 'true'
              : false,
          },
        },
        callbacks: {
          onStuck: function () {
            var navbarSearch = this.$element.find('.rd-search input')

            if (navbarSearch) {
              navbarSearch.val('').trigger('propertychange')
            }
          },
          onUnstuck: function () {
            if (this.$clone === null) return

            var navbarSearch = this.$clone.find('.rd-search input')

            if (navbarSearch) {
              navbarSearch.val('').trigger('propertychange')
              navbarSearch.blur()
            }
          },
          onDropdownOver: function () {
            return !isNoviBuilder
          },
        },
      })
      if (plugins.rdNavbar.attr('data-body-class')) {
        document.body.className +=
          ' ' + plugins.rdNavbar.attr('data-body-class')
      }
    }
  }

  /**
   * Stacktable
   * @description Enables Stacktable plugin
   */
  if (plugins.stacktable.length) {
    var i
    for (i = 0; i < plugins.stacktable.length; i++) {
      var stacktableItem = $(plugins.stacktable[i])
      stacktableItem.stacktable()
    }
  }

  /**
   * Select2
   * @description Enables select2 plugin
   */
  if (plugins.selectFilter.length) {
    var i
    for (i = 0; i < plugins.selectFilter.length; i++) {
      var select = $(plugins.selectFilter[i])

      select
        .select2({
          theme: 'bootstrap',
        })
        .next()
        .addClass(
          select
            .attr('class')
            .match(/(input-sm)|(input-lg)|($)/i)
            .toString()
            .replace(new RegExp(',', 'g'), ' ')
        )
    }
  }

  /**
   * Product Thumbnails
   * @description Enables product thumbnails
   */
  if (plugins.productThumb.length) {
    var i
    for (i = 0; i < plugins.productThumb.length; i++) {
      var thumbnails = $(plugins.productThumb[i])

      thumbnails.find('li').on('click', function () {
        var item = $(this)
        item.parent().find('.active').removeClass('active')
        var image = item.parents('.product').find('.product-image-area')
        image.removeClass('animateImageIn')
        image.addClass('animateImageOut')
        item.addClass('active')
        setTimeout(function () {
          var src = item.find('img').attr('src')
          if (item.attr('data-large-image')) {
            src = item.attr('data-large-image')
          }
          image.attr('src', src)
          image.removeClass('animateImageOut')
          image.addClass('animateImageIn')
        }, 300)
      })
    }
  }

  /**
   * RD Calendar
   * @description Enables RD Calendar plugin
   */
  if (plugins.calendar.length) {
    for (i = 0; i < plugins.calendar.length; i++) {
      var calendarItem = $(plugins.calendar[i])

      calendarItem.rdCalendar({
        days: calendarItem.attr('data-days')
          ? c.attr('data-days').split(/\s?,\s?/i)
          : ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
        month: calendarItem.attr('data-months')
          ? c.attr('data-months').split(/\s?,\s?/i)
          : [
              'January',
              'February',
              'March',
              'April',
              'May',
              'June',
              'July',
              'August',
              'September',
              'October',
              'November',
              'December',
            ],
      })
    }
  }

  /**
   * jQuery elevateZoom
   * @description Enables jQuery elevateZoom plugin
   */
  if (plugins.imgZoom.length) {
    for (i = 0; i < plugins.imgZoom.length; i++) {
      var zoomItem = $(plugins.imgZoom[i])

      zoomItem.elevateZoom({
        zoomType: 'inner',
        cursor: 'crosshair',
        zoomWindowFadeIn: 300,
        zoomWindowFadeOut: 300,
        scrollZoom: true,
      })
    }
  }

  /**
   * RD Facebook
   * @description Enables RD Facebook plugin
   */
  if (plugins.facebookfeed.length > 0) {
    for (i = 0; i < plugins.facebookfeed.length; i++) {
      var facebookfeedItem = plugins.facebookfeed[i]
      $(facebookfeedItem).RDFacebookFeed({
        callbacks: {
          postsLoaded: function () {
            var posts = $('.post-facebook')
            var i = 0
            for (i = 0; i < posts.length; i++) {
              var $this = $(posts[i])
              var commentBlock = $this.find('.post-comments')
              var commentBlockItem = $this.find(
                '.post-comments [data-fb-comment]'
              )
              var j = 0
              for (j = 0; j < commentBlockItem.length; j++) {
                var commentItem = commentBlockItem[j]
                if (commentItem.innerHTML.trim().length == 0) {
                  $(commentItem).remove()
                }
              }
              if (commentBlock.find('[data-fb-comment]').length == 0) {
                commentBlock.remove()
              }
            }

            $window.trigger('resize')
          },
        },
      })
    }
  }

  /**
   * RD Search
   * @description Enables search
   */
  if (plugins.search.length || plugins.searchResults) {
    var handler = 'bat/rd-search.php'
    var defaultTemplate =
      '<h5 class="search_title"><a target="_top" href="#{href}" class="search_link">#{title}</a></h5>' +
      '<p>...#{token}...</p>' +
      '<p class="match"><em>Terms matched: #{count} - URL: #{href}</em></p>'
    var defaultFilter = '*.html'

    if (plugins.search.length) {
      for (i = 0; i < plugins.search.length; i++) {
        var searchItem = $(plugins.search[i]),
          options = {
            element: searchItem,
            filter: searchItem.attr('data-search-filter')
              ? searchItem.attr('data-search-filter')
              : defaultFilter,
            template: searchItem.attr('data-search-template')
              ? searchItem.attr('data-search-template')
              : defaultTemplate,
            live: searchItem.attr('data-search-live')
              ? searchItem.attr('data-search-live')
              : false,
            liveCount: searchItem.attr('data-search-live-count')
              ? parseInt(searchItem.attr('data-search-live'))
              : 4,
            current: 0,
            processed: 0,
            timer: {},
          }

        if ($('.rd-navbar-search-toggle').length) {
          var toggle = $('.rd-navbar-search-toggle')
          toggle.on('click', function () {
            if (!$(this).hasClass('active')) {
              searchItem.find('input').val('').trigger('propertychange')
            }
          })
        }

        if (options.live) {
          searchItem.find('input').on(
            'keyup input propertychange',
            $.proxy(
              function () {
                this.term = this.element.find('input').val().trim()
                this.spin = this.element.find('.input-group-addon')

                if (this.term.length > 2) {
                  this.timer = setTimeout(liveSearch(this), 200)
                } else if (this.term.length == 0) {
                  $('#' + this.live)
                    .addClass('cleared')
                    .html('')
                }
              },
              options,
              this
            )
          )
        }

        searchItem.submit(
          $.proxy(
            function () {
              $('<input />')
                .attr('type', 'hidden')
                .attr('name', 'filter')
                .attr('value', this.filter)
                .appendTo(this.element)
              return true
            },
            options,
            this
          )
        )
      }
    }

    if (plugins.searchResults.length) {
      var regExp = /\?.*s=([^&]+)\&filter=([^&]+)/g
      var match = regExp.exec(location.search)

      if (match != null) {
        $.get(
          handler,
          {
            s: decodeURI(match[1]),
            dataType: 'html',
            filter: match[2],
            template: defaultTemplate,
            live: '',
          },
          function (data) {
            plugins.searchResults.html(data)
          }
        )
      }
    }
  }

  /**
   * RD Instafeed
   * @description Enables Instafeed
   */
  if (plugins.instafeed.length > 0) {
    var i
    for (i = 0; i < plugins.instafeed.length; i++) {
      var instafeedItem = $(plugins.instafeed[i])
      instafeedItem.RDInstafeed({})
    }
  }

  /**
   * UI To Top
   * @description Enables ToTop Button
   */
  if (isDesktop && !isNoviBuilder) {
    $().UItoTop({
      easingType: 'easeOutQuart',
      containerClass:
        'ui-to-top icon icon-xs icon-circle icon-darker-filled mdi mdi-chevron-up',
    })
  }

  /**
   * RD Mailform
   */
  if (plugins.rdMailForm.length) {
    var i,
      j,
      k,
      msg = {
        MF000: 'Successfully sent!',
        MF001: 'Recipients are not set!',
        MF002: 'Form will not work locally!',
        MF003: 'Please, define email field in your form!',
        MF004: 'Please, define type of your form!',
        MF254: 'Something went wrong with PHPMailer!',
        MF255: 'Aw, snap! Something went wrong.',
      }

    for (i = 0; i < plugins.rdMailForm.length; i++) {
      var $form = $(plugins.rdMailForm[i]),
        formHasCaptcha = false

      $form.attr('novalidate', 'novalidate').ajaxForm({
        data: {
          'form-type': $form.attr('data-form-type') || 'contact',
          counter: i,
        },
        beforeSubmit: function (arr, $form, options) {
          var form = $(plugins.rdMailForm[this.extraData.counter]),
            inputs = form.find('[data-constraints]'),
            output = $('#' + form.attr('data-form-output')),
            captcha = form.find('.recaptcha'),
            captchaFlag = true

          output.removeClass('active error success')

          if (isValidated(inputs, captcha)) {
            // veify reCaptcha
            if (captcha.length) {
              var captchaToken = captcha.find('.g-recaptcha-response').val(),
                captchaMsg = {
                  CPT001:
                    'Please, setup you "site key" and "secret key" of reCaptcha',
                  CPT002: 'Something wrong with google reCaptcha',
                }

              formHasCaptcha = true

              $.ajax({
                method: 'POST',
                url: 'bat/reCaptcha.php',
                data: { 'g-recaptcha-response': captchaToken },
                async: false,
              }).done(function (responceCode) {
                if (responceCode !== 'CPT000') {
                  if (output.hasClass('snackbars')) {
                    output.html(
                      '<p><span class="icon text-middle mdi mdi-check icon-xxs"></span><span>' +
                        captchaMsg[responceCode] +
                        '</span></p>'
                    )

                    setTimeout(function () {
                      output.removeClass('active')
                    }, 3500)

                    captchaFlag = false
                  } else {
                    output.html(captchaMsg[responceCode])
                  }

                  output.addClass('active')
                }
              })
            }

            if (!captchaFlag) {
              return false
            }

            form.addClass('form-in-process')

            if (output.hasClass('snackbars')) {
              output.html(
                '<p><span class="icon text-middle fa fa-circle-o-notch fa-spin icon-xxs"></span><span>Sending</span></p>'
              )
              output.addClass('active')
            }
          } else {
            return false
          }
        },
        error: function (result) {
          var output = $(
              '#' +
                $(plugins.rdMailForm[this.extraData.counter]).attr(
                  'data-form-output'
                )
            ),
            form = $(plugins.rdMailForm[this.extraData.counter])

          output.text(msg[result])
          form.removeClass('form-in-process')

          if (formHasCaptcha) {
            grecaptcha.reset()
          }
        },
        success: function (result) {
          var form = $(plugins.rdMailForm[this.extraData.counter]),
            output = $('#' + form.attr('data-form-output')),
            select = form.find('select')

          form.addClass('success').removeClass('form-in-process')

          if (formHasCaptcha) {
            grecaptcha.reset()
          }

          result = result.length === 5 ? result : 'MF255'
          output.text(msg[result])

          if (result === 'MF000') {
            if (output.hasClass('snackbars')) {
              output.html(
                '<p><span class="icon text-middle mdi mdi-check icon-xxs"></span><span>' +
                  msg[result] +
                  '</span></p>'
              )
            } else {
              output.addClass('active success')
            }
          } else {
            if (output.hasClass('snackbars')) {
              output.html(
                ' <p class="snackbars-left"><span class="icon icon-xxs mdi mdi-alert-outline text-middle"></span><span>' +
                  msg[result] +
                  '</span></p>'
              )
            } else {
              output.addClass('active error')
            }
          }

          form.clearForm()

          if (select.length) {
            select.select2('val', '')
          }

          form.find('input, textarea').trigger('blur')

          setTimeout(function () {
            output.removeClass('active error success')
            form.removeClass('success')
          }, 3500)
        },
      })
    }
  }

  /**
   * Custom Toggles
   */
  if (plugins.customToggle.length) {
    var i
    for (i = 0; i < plugins.customToggle.length; i++) {
      var $this = $(plugins.customToggle[i])
      $this.on('click', function (e) {
        e.preventDefault()
        $('#' + $(this).attr('data-custom-toggle'))
          .add(this)
          .toggleClass('active')
      })

      if ($this.attr('data-custom-toggle-disable-on-blur') === 'true') {
        $('body').on('click', $this, function (e) {
          if (
            e.target !== e.data[0] &&
            $('#' + e.data.attr('data-custom-toggle')).find($(e.target))
              .length == 0 &&
            e.data.find($(e.target)).length == 0
          ) {
            $('#' + e.data.attr('data-custom-toggle'))
              .add(e.data[0])
              .removeClass('active')
          }
        })
      }
    }
  }

  /**
   * Custom Waypoints
   */
  if (plugins.customWaypoints.length) {
    var i
    $document.delegate('[data-custom-scroll-to]', 'click', function (e) {
      e.preventDefault()
      $('body, html')
        .stop()
        .animate(
          {
            scrollTop: $('#' + $(this).attr('data-custom-scroll-to')).offset()
              .top,
          },
          1000,
          function () {
            $(window).trigger('resize')
          }
        )
    })
  }

  /**
   * Additional Fields
   */
  if (plugins.additionalFields.length) {
    var counter, i, j, k, fields

    for (i = 0; i < plugins.additionalFields.length; i++) {
      counter = 0
      var additionalFields = $(plugins.additionalFields[i]),
        markup = additionalFields
          .attr('data-additional-field')
          .replace(/\$num\$/g, counter),
        init = additionalFields.attr('data-init-count')

      additionalFields.find('.additional-fields-add').on('click', function (e) {
        e.preventDefault()
        counter++
        fields = $(this).parents('.additional-fields')
        fields.find('.additional-fields-wrap').append(markup)
        for (
          j = 0;
          j < fields.find('.additional-fields-wrap > *').length;
          j++
        ) {
          var field = fields.find('.additional-fields-wrap > *')[j]
          if (field.className.indexOf('additional-field') == -1) {
            $(field).wrap('<div class="additional-field"></div>')
            attachFormValidator($(field).find('[data-constraints]'))
          }
        }
      })

      for (j = 0; j < init; j++) {
        additionalFields.find('.additional-fields-wrap').append(markup)
        for (
          k = 0;
          k < additionalFields.find('.additional-fields-wrap > *').length;
          k++
        ) {
          var field = additionalFields.find('.additional-fields-wrap > *')[k]

          if (field.className.indexOf('additional-field') == -1) {
            $(field).wrap('<div class="additional-field"></div>')
            attachFormValidator($(field).find('[data-constraints]'))
          }
        }
      }
    }

    $document.delegate('.additional-field-remove', 'click', function (e) {
      e.preventDefault()
      $(this).parents('.additional-field').remove()
    })
  }

  /**
   * Bootstrap Date time picker
   */
  if (plugins.bootstrapDateTimePicker.length) {
    var i
    for (i = 0; i < plugins.bootstrapDateTimePicker.length; i++) {
      var $dateTimePicker = $(plugins.bootstrapDateTimePicker[i])
      var options = {}

      options['format'] = 'dddd DD MMMM YYYY - HH:mm'
      if ($dateTimePicker.attr('data-time-picker') == 'date') {
        options['format'] = 'dddd DD MMMM YYYY'
        options['minDate'] = new Date()
      } else if ($dateTimePicker.attr('data-time-picker') == 'time') {
        options['format'] = 'HH:mm'
      }

      options['time'] = $dateTimePicker.attr('data-time-picker') != 'date'
      options['date'] = $dateTimePicker.attr('data-time-picker') != 'time'
      options['shortTime'] = true

      $dateTimePicker.bootstrapMaterialDatePicker(options)
    }
  }

  /**
   * RD Parallax
   * @description Enables RD Parallax plugin
   */
  if (plugins.rdParallax.length) {
    var i
    $.RDParallax()

    if (!isIE && !isMobile) {
      $(window).on('scroll', function () {
        for (i = 0; i < plugins.rdParallax.length; i++) {
          var parallax = $(plugins.rdParallax[i])
          if (isScrolledIntoView(parallax)) {
            parallax.find('.rd-parallax-inner').css('position', 'fixed')
          } else {
            parallax.find('.rd-parallax-inner').css('position', 'absolute')
          }
        }
      })
    }

    $("a[href='#']").on('click', function (e) {
      setTimeout(function () {
        $(window).trigger('resize')
      }, 300)
    })
  }

  // Material Parallax
  if (plugins.materialParallax.length) {
    if (!isNoviBuilder && !isIE && !isMobile) {
      plugins.materialParallax.parallax()

      // heavy pages fix
      $window.on('load', function () {
        setTimeout(function () {
          $window.scroll()
        }, 500)
      })
    } else {
      for (var i = 0; i < plugins.materialParallax.length; i++) {
        var parallax = $(plugins.materialParallax[i]),
          imgPath = parallax.data('parallax-img')

        parallax.css({
          'background-image': 'url(' + imgPath + ')',
          'background-size': 'cover',
        })
      }
    }
  }

  // lightGallery
  if (plugins.lightGallery.length) {
    for (var i = 0; i < plugins.lightGallery.length; i++) {
      initLightGallery(plugins.lightGallery[i])
    }
  }

  // lightGallery item
  if (plugins.lightGalleryItem.length) {
    // Filter carousel items
    var notCarouselItems = []

    for (var z = 0; z < plugins.lightGalleryItem.length; z++) {
      if (
        !$(plugins.lightGalleryItem[z]).parents('.owl-carousel').length &&
        !$(plugins.lightGalleryItem[z]).parents('.swiper-slider').length &&
        !$(plugins.lightGalleryItem[z]).parents('.slick-slider').length
      ) {
        notCarouselItems.push(plugins.lightGalleryItem[z])
      }
    }

    plugins.lightGalleryItem = notCarouselItems

    for (var i = 0; i < plugins.lightGalleryItem.length; i++) {
      initLightGalleryItem(plugins.lightGalleryItem[i])
    }
  }

  // Dynamic lightGallery
  if (plugins.lightDynamicGalleryItem.length) {
    for (var i = 0; i < plugins.lightDynamicGalleryItem.length; i++) {
      initDynamicLightGallery(plugins.lightDynamicGalleryItem[i])
    }
  }

  // Google maps
  if (plugins.maps.length) {
    lazyInit(plugins.maps, initMaps)
  }

  // Background Video
  if (plugins.videBG.length) {
    for (var i = 0; i < plugins.videBG.length; i++) {
      var $element = $(plugins.videBG[i]),
        options = $element.data('vide-options'),
        path = $element.data('vide-bg')

      $element.vide(path, options)

      var videObj = $element.data('vide').getVideoObject()

      if (isNoviBuilder) {
        videObj.pause()
      } else {
        document.addEventListener(
          'scroll',
          (function ($element, videObj) {
            return function () {
              if (isScrolledIntoView($element)) videObj.play()
              else videObj.pause()
            }
          })($element, videObj)
        )
      }
    }
  }
})

/**
 * Page loader
 * @description Enables Page loader
 */
if (plugins.pageLoader.length) {
  $window.on('load', function () {
    var loader = setTimeout(function () {
      plugins.pageLoader.addClass('loaded')
      $window.trigger('resize')
    }, 200)
  })
}

// FLOATING WHATSAPP BUTTON

!(function (v) {
  v.fn.floatingWhatsApp = function (e) {
    var t,
      a,
      i = v.extend(
        {
          phone: '',
          message: '',
          size: '72px',
          backgroundColor: '#25D366',
          position: 'left',
          popupMessage: '',
          showPopup: !1,
          showOnIE: !0,
          autoOpenTimeout: 0,
          headerColor: '#128C7E',
          headerTitle: 'WhatsApp Chat',
          zIndex: 0,
          buttonImage:
            '<?xml version="1.0" encoding="UTF-8" standalone="no"?><svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" style="isolation:isolate" viewBox="0 0 800 800" width="800" height="800"><defs><clipPath id="_clipPath_A3g8G5hPEGG2L0B6hFCxamU4cc8rfqzQ"><rect width="800" height="800"/></clipPath></defs><g clip-path="url(#_clipPath_A3g8G5hPEGG2L0B6hFCxamU4cc8rfqzQ)"><g><path d=" M 787.59 800 L 12.41 800 C 5.556 800 0 793.332 0 785.108 L 0 14.892 C 0 6.667 5.556 0 12.41 0 L 787.59 0 C 794.444 0 800 6.667 800 14.892 L 800 785.108 C 800 793.332 794.444 800 787.59 800 Z " fill="rgb(37,211,102)"/></g><g><path d=" M 508.558 450.429 C 502.67 447.483 473.723 433.24 468.325 431.273 C 462.929 429.308 459.003 428.328 455.078 434.22 C 451.153 440.114 439.869 453.377 436.434 457.307 C 433 461.236 429.565 461.729 423.677 458.78 C 417.79 455.834 398.818 449.617 376.328 429.556 C 358.825 413.943 347.008 394.663 343.574 388.768 C 340.139 382.873 343.207 379.687 346.155 376.752 C 348.804 374.113 352.044 369.874 354.987 366.436 C 357.931 362.999 358.912 360.541 360.875 356.614 C 362.837 352.683 361.857 349.246 360.383 346.299 C 358.912 343.352 347.136 314.369 342.231 302.579 C 337.451 291.099 332.597 292.654 328.983 292.472 C 325.552 292.301 321.622 292.265 317.698 292.265 C 313.773 292.265 307.394 293.739 301.996 299.632 C 296.6 305.527 281.389 319.772 281.389 348.752 C 281.389 377.735 302.487 405.731 305.431 409.661 C 308.376 413.592 346.949 473.062 406.015 498.566 C 420.062 504.634 431.03 508.256 439.581 510.969 C 453.685 515.451 466.521 514.818 476.666 513.302 C 487.978 511.613 511.502 499.06 516.409 485.307 C 521.315 471.55 521.315 459.762 519.842 457.307 C 518.371 454.851 514.446 453.377 508.558 450.429 Z  M 401.126 597.117 L 401.047 597.117 C 365.902 597.104 331.431 587.661 301.36 569.817 L 294.208 565.572 L 220.08 585.017 L 239.866 512.743 L 235.21 505.332 C 215.604 474.149 205.248 438.108 205.264 401.1 C 205.307 293.113 293.17 205.257 401.204 205.257 C 453.518 205.275 502.693 225.674 539.673 262.696 C 576.651 299.716 597.004 348.925 596.983 401.258 C 596.939 509.254 509.078 597.117 401.126 597.117 Z  M 567.816 234.565 C 523.327 190.024 464.161 165.484 401.124 165.458 C 271.24 165.458 165.529 271.161 165.477 401.085 C 165.46 442.617 176.311 483.154 196.932 518.892 L 163.502 641 L 288.421 608.232 C 322.839 627.005 361.591 636.901 401.03 636.913 L 401.126 636.913 L 401.127 636.913 C 530.998 636.913 636.717 531.2 636.77 401.274 C 636.794 338.309 612.306 279.105 567.816 234.565" fill-rule="evenodd" fill="rgb(255,255,255)"/></g></g></svg>',
        },
        e
      ),
      o =
        ((t = !1),
        (a = navigator.userAgent || navigator.vendor || window.opera),
        (/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(
          a
        ) ||
          /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(
            a.substr(0, 4)
          )) &&
          (t = !0),
        t)
    this.addClass('floating-wpp')
    var n,
      s = v(document.createElement('div')),
      p = v(document.createElement('div')),
      l = v(document.createElement('div')),
      c = v(document.createElement('div')),
      d = v(document.createElement('div')),
      m = v(document.createElement('div')),
      r = v(document.createElement('div'))
    if (
      (p.addClass('floating-wpp-button-image'),
      s.addClass('floating-wpp-button').append(v(i.buttonImage)).css({
        width: i.size,
        height: i.size,
        'background-color': i.backgroundColor,
      }),
      (!(
        0 <= (n = window.navigator.userAgent).indexOf('MSIE') ||
        n.match(/Trident.*rv\:11\./)
      ) ||
        i.showOnIE) &&
        s.append(p).appendTo(this),
      s.on('click', function () {
        o && i.showPopup ? u() : C()
      }),
      i.showPopup)
    ) {
      var g = v(document.createElement('textarea')),
        h = v(document.createElement('strong')),
        w = v(
          '<?xml version="1.0" encoding="UTF-8" standalone="no"?><svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" style="isolation:isolate" viewBox="0 0 20 18" width="20" height="18"><defs><clipPath id="_clipPath_fgX00hLzP9PnAfCkGQoSPsYB7aEGkj1G"><rect width="20" height="18"/></clipPath></defs><g clip-path="url(#_clipPath_fgX00hLzP9PnAfCkGQoSPsYB7aEGkj1G)"><path d=" M 0 0 L 0 7.813 L 16 9 L 0 10.188 L 0 18 L 20 9 L 0 0 Z " fill="rgb(46,46,46)"/></g></svg>'
        )
      function u() {
        l.hasClass('active') || (l.addClass('active'), g.focus())
      }
      l.addClass('floating-wpp-popup'),
        c.addClass('floating-wpp-head'),
        d.addClass('floating-wpp-message'),
        r.addClass('floating-wpp-input-message'),
        m.addClass('floating-wpp-btn-send'),
        d.text(i.popupMessage),
        g.val(i.message),
        i.popupMessage || d.hide(),
        c
          .append('<span>' + i.headerTitle + '</span>', h)
          .css('background-color', i.headerColor),
        m.append(w),
        r.append(g, m),
        h.addClass('close').html('&times;'),
        l.append(c, d, r).appendTo(this),
        d.click(function () {}),
        h.click(function () {}),
        c.click(function () {
          l.removeClass('active')
        }),
        g.keypress(function (e) {
          ;(i.message = v(this).val()),
            13 != e.keyCode ||
              e.shiftKey ||
              o ||
              (e.preventDefault(), m.click())
        }),
        m.click(function () {
          ;(i.message = g.val()), C()
        }),
        this.mouseenter(function () {
          u()
        }),
        0 < i.autoOpenTimeout &&
          setTimeout(function () {
            u()
          }, i.autoOpenTimeout)
    }
    function C() {
      var e = 'http://'
      ;(e += o ? 'api' : 'web'),
        (e +=
          '.whatsapp.com/send?phone=' +
          i.phone +
          '&text=' +
          encodeURI(i.message)),
        window.open(e)
    }
    i.zIndex && v(this).css('z-index', i.zIndex),
      'right' === i.position &&
        (this.css({ left: 'auto', right: '15px' }), l.css('right', '0'))
  }
})(jQuery)
