document.addEventListener('DOMContentLoaded', function(){

    const allSearchButtons = document.querySelectorAll('.searchBtn');
    const searchBar = document.querySelector('.searchBar');
    const searchInput = document.getElementById('searchInput');
    const searchClose = document.getElementById('searchClose');
    const colorModeButton=document.querySelector(".header_color_mode");
  
    for (var i = 0; i < allSearchButtons.length; i++) {
      allSearchButtons[i].addEventListener('click', function() {
        colorModeButton.style.visibility="hidden";

        searchBar.style.visibility = 'visible';
        searchBar.classList.add('open');
        this.setAttribute('aria-expanded', 'true');
        searchInput.focus();
      });
    }
  
    searchClose.addEventListener('click', function() {
    searchBar.style.visibility = 'hidden';
        colorModeButton.style.visibility="visible";
      searchBar.classList.remove('open');
      this.setAttribute('aria-expanded', 'false');
    });
  
  
  });

  //Register Btn
  document.querySelector(".showPassBtn").addEventListener('change',function(){
    let passwordField= document.getElementById("passwordField");
    if(this.checked){
      passwordField.setAttribute("type","text");
    }else{
      passwordField.setAttribute("type","password");

    }
  })