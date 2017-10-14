function Gallery() {
  $('.gallery a').magnificPopup({
    type: 'image',
    gallery:{
      enabled:true
    },
    removalDelay: 350, //delay removal by X to allow out-animation
    callbacks: {
      beforeOpen: function() {
        // just a hack that adds mfp-anim class to markup 
         this.st.image.markup = this.st.image.markup.replace('mfp-figure', 'mfp-figure mfp-with-anim');
         this.st.mainClass = 'mfp-zoom-in';
      }
    },
    
    
  });
}

export default Gallery;