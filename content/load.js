
function GetData(url, onFinished)
{
  xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function() {
    if (this.readyState == 4) {
      //if (this.status == 200) { this.responseText;}
      //if (this.status == 404) {}
      onFinished(this.responseText);
    }
  }
  xhttp.open("GET", url, true);
  xhttp.send();
}

function includeJs(onFinished)
{
    var z, i, elmnt, file, xhttp;
    /* Loop through a collection of all HTML elements: */
    z = document.getElementsByTagName("*");
    for (i = 0; i < z.length; i++) {
      elmnt = z[i];
      /*search for elements with a certain atrribute:*/
      if(elmnt.getAttribute("w3-include-js") == null)
      {
        continue;
      }
      if(elmnt.text.length > 0)
      {
        elmnt.removeAttribute("w3-include-js");
        (1, eval)(elmnt.text);
        continue;
      }
      file = elmnt.src;
      if (file) {
        /* Make an HTTP request using the attribute value as the file name: */
        xhttp = new XMLHttpRequest();
        xhttp.onreadystatechange = function() {
          if (this.readyState == 4) {
            if (this.status == 200) {
                (1, eval)(this.responseText);
            }
            if (this.status == 404) {
                
            }
            /* Remove the attribute, and call this function once more: */
            elmnt.removeAttribute("w3-include-js");
  
            includeJs(onFinished);
          }
        }
        xhttp.open("GET", file, true);
        xhttp.send();
        /* Exit the function: */
        return;
      }
    }
  
    onFinished();
}

function includeHTML(onFinished) {
    var z, i, elmnt, file, xhttp;
    /* Loop through a collection of all HTML elements: */
    z = document.getElementsByTagName("*");
    for (i = 0; i < z.length; i++) {
        elmnt = z[i];
        /*search for elements with a certain atrribute:*/
        file = elmnt.getAttribute("w3-include-html");
        if (file) {
            /* Make an HTTP request using the attribute value as the file name: */
            xhttp = new XMLHttpRequest();
            xhttp.onreadystatechange = function () {
                if (this.readyState == 4) {
                    if (this.status == 200) { elmnt.innerHTML = this.responseText; }
                    if (this.status == 404) { elmnt.innerHTML = "Page not found."; }
                    /* Remove the attribute, and call this function once more: */
                    elmnt.removeAttribute("w3-include-html");

                    includeJs(function () {
                        includeHTML(onFinished);
                    }
                    );
                }
            }
            xhttp.open("GET", file, true);
            xhttp.send();
            /* Exit the function: */
            return;
        }
    }

    onFinished();
}