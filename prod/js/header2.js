!function(e){function t(o){if(n[o])return n[o].exports;var a=n[o]={exports:{},id:o,loaded:!1};return e[o].call(a.exports,a,a.exports,t),a.loaded=!0,a.exports}var n={};return t.m=e,t.c=n,t.p="/",t(0)}({0:function(e,t,n){e.exports=n(6)},6:function(e,t){"use strict";function n(){function e(){var e=window.pageXOffset||document.documentElement.scrollTop||document.body.scrollTop;e>=50?a.addClass("header--fixed"):a.removeClass("header--fixed")}function t(e){$("html, body").stop().animate({scrollTop:$(e).offset().top-50},1e3)}function n(){function e(e){o.empty(),a[e].forEach(function(e,t){o.append("<option>"+e.title+"</option>")})}var t,n=$("#try-type"),o=$("#try-address"),a={mma:[{value:"dlg43",title:"Долгобродская, 43"}],karate:[{value:"dlg43",title:"Долгобродская, 43"},{value:"s219",title:"СШ №219"},{value:"s161",title:"СШ №161"},{value:"s199",title:"СШ №199"}],gym:[{value:"s219",title:"СШ №219"}]};n.on("change",function(o){t=n.val(),e(t)})}function o(){var e=$("#try-age").val(),t=$("#try-type").val(),n=$("#try-address").val(),o=$("#try-tel").val();switch(t){case"mma":t="ММА";break;case"karate":t="Карате";break;case"gym":t="Гимнастика"}$.magnificPopup.instance.close(),setTimeout(function(){$.magnificPopup.open({removalDelay:350,callbacks:{beforeOpen:function(){this.st.mainClass="mfp-zoom-in js-try-popup-el"}},items:[{src:'<div class="try-thanks mfp-with-anim">Спасибо, ваша заявка принята!</div>',type:"inline"}]})},400),$.ajax({url:"https://docs.google.com/forms/d/e/1FAIpQLSdSJ6bE5CmvIukKKHxtiFN-eibn9K2twTItRfm00dJ92xQK_g/formResponse",data:{"entry.2141322086":e,"entry.188064224":t,"entry.1356612435":n,"entry.1395514583":o},type:"POST",dataType:"xml"})}var a=$(".header");e(),$(window).on("scroll orientationchange resize",function(t){e()}),$(".header-nav__link, .mobile-menu__link, .banner3__link, .go-top").on("click",function(e){function n(){var e=o.attr("href");t(e),o.hasClass("mobile-menu__link")&&$(".mobile-menu").removeClass("mobile-menu--active")}var o=$(this);o.hasClass("phone")||(e.preventDefault(),n())}),$(".header__hamburger").on("click",function(e){e.preventDefault(),$(this).blur(),$(".mobile-menu").addClass("mobile-menu--active")}),$(".mobile-menu__close").on("click",function(e){e.preventDefault(),$(".mobile-menu").removeClass("mobile-menu--active")}),$(".header__try-btn").on("click",function(e){e.preventDefault(),$.magnificPopup.open({removalDelay:350,callbacks:{beforeOpen:function(){this.st.mainClass="mfp-zoom-in js-try-popup-el"}},items:[{src:".try-popup",type:"inline"}]})}),n(),$(".try-popup__submit").on("click",function(e){e.preventDefault(),o()})}Object.defineProperty(t,"__esModule",{value:!0}),t.default=n}});