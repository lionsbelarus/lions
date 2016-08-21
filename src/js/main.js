'use strict';
import svg4everybody from 'svg4everybody'
svg4everybody();

$(function() {
  Header();
  Banner();
});

function Header() {
  // console.log('header')
  var $header = $('.header'),
      $logo = $('.logo');

  checkScroll();
  $(window).on('scroll orientationchange resize', function (e) {
    checkScroll();
  })
  function checkScroll() {
    var currentScrollTop = window.pageXOffset || document.documentElement.scrollTop || document.body.scrollTop;

    if(!currentScrollTop) {
      $header.removeClass('header--fixed')
    } else {
      $header.addClass('header--fixed')
    }
  }
}




function Banner() {
  var $banner =$('.banner');

  $banner.addClass('banner--loaded');
}