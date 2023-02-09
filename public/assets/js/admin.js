document.getElementsByClassName("form-upload__input-file")[0].onchange = function(){
  document.getElementsByClassName("form-upload__input-file-title")[0].textContent = this.files[0].name;
}
