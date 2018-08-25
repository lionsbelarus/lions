export default function Header() {
  
  var $header = $('.header');

  checkScroll();
  $(window).on('scroll orientationchange resize', function (e) {
    checkScroll();
  })
  function checkScroll() {
    var currentScrollTop = window.pageXOffset || document.documentElement.scrollTop || document.body.scrollTop;

    // console.log(currentScrollTop)
    if(currentScrollTop >= 50) {
      $header.addClass('header--fixed')
      
    } else {
      $header.removeClass('header--fixed')
      
    }
  }

  $('.header-nav__link, .mobile-menu__link, .banner3__link, .go-top').on('click', function (e) {
    var $el = $(this);
    if(!$el.hasClass('phone')) {
      e.preventDefault();
      goToHref();
    }
    function goToHref() {
      var scrollToEl = $el.attr('href');

      scrollTo(scrollToEl);

      if($el.hasClass('mobile-menu__link')) {
        $('.mobile-menu').removeClass('mobile-menu--active');
      }
    }
    
  })
  function scrollTo(href) {
    // var $el = $(this),
    //     sect = $el.attr('href')

    $('html, body').stop().animate({
            scrollTop: $(href).offset().top - 50
        }, 1000);
  }

  $('.header__hamburger').on('click', function (e) {
    e.preventDefault();
    $(this).blur();
    $('.mobile-menu').addClass('mobile-menu--active');
    // $('body').addClass('ovh')
  })
  $('.mobile-menu__close').on('click', function (e) {
    e.preventDefault();
    $('.mobile-menu').removeClass('mobile-menu--active');
    // $('body').removeClass('ovh')
  })


  // $('.header__try-btn').magnificPopup({
  //     removalDelay: 350, //delay removal by X to allow out-animation
  //     callbacks: {
  //       beforeOpen: function() {
  //          this.st.mainClass = 'mfp-zoom-in js-try-popup-el';
  //       }
  //     },
  //     items: [
  //       {
  //         src: '.try-popup', // CSS selector of an element on page that should be used as a popup
  //         type: 'inline'
  //       }
  //     ]
  // });
  $('.header__try-btn').on('click', function (e) {
    e.preventDefault();

    $.magnificPopup.open({
      removalDelay: 350, //delay removal by X to allow out-animation
      callbacks: {
        beforeOpen: function() {
           this.st.mainClass = 'mfp-zoom-in js-try-popup-el';
        }
      },
      items: [
        {
          src: '.try-popup', // CSS selector of an element on page that should be used as a popup
          type: 'inline'
        }
      ]
    });
  })



  function try_popup__select() {
    var selectType = $('#try-type'),
        selectAddress = $('#try-address'),
        currentType,
        addresses = {
          "mma": [
            {
              value:'dlg43',
              title:'Долгобродская, 43'
            },
          ],
          "karate": [
            {
              value:'dlg43',
              title:'Долгобродская, 43'
            },
            {
              value: 's219',
              title: 'СШ №219'
            },
            {
              value: 's161',
              title: 'СШ №161'
            },
            {
              value: 's199',
              title: 'СШ №199'
            }
          ],
          "judo": [
            {
              value: 's219',
              title: 'СШ №219'
            }
          ]
        }


    selectType.on('change', function (e) {
      currentType = selectType.val();

      changeOptions(currentType);
    })

    function changeOptions(type) {
      selectAddress.empty();

      addresses[type].forEach(function (item, i) {
        selectAddress.append(`<option>${item.title}</option>`)
      })
    }

  }
  try_popup__select();


  $('.try-popup__submit').on('click', function (e) {
    e.preventDefault();
    try_popup__submit();
  })
  function try_popup__submit() {
    var age = $('#try-age').val(),
        type = $('#try-type').val(),
        address = $('#try-address').val(),
        phone = $('#try-tel').val();

    switch(type) {
    case 'mma':
      type = 'ММА'
    break;
    case 'karate':
      type = 'Карате'
    break;
    case 'judo':
      type = 'Дзюдо'
    break;
    }
    $.magnificPopup.instance.close();
    
    setTimeout(function(){
      $.magnificPopup.open({
        removalDelay: 350, //delay removal by X to allow out-animation
        callbacks: {
          beforeOpen: function() {
             this.st.mainClass = 'mfp-zoom-in js-try-popup-el';
          }
        },
        items: [
          {
            src: '<div class="try-thanks mfp-with-anim">Спасибо, ваша заявка принята!</div>', // CSS selector of an element on page that should be used as a popup
            type: 'inline'
          }
        ]
      });
    }, 400)
    $.ajax({
      url: "https://docs.google.com/forms/d/e/1FAIpQLSdSJ6bE5CmvIukKKHxtiFN-eibn9K2twTItRfm00dJ92xQK_g/formResponse",
      data: {
        "entry.2141322086": age,
        "entry.188064224": type,
        "entry.1356612435": address,
        "entry.1395514583": phone
      },
      type: "POST",
      dataType: "xml"
    });
  }
}
