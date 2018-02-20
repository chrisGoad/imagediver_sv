// support for creating and editing snapshots
(function () {
  var lib = page;
  var geom = idv.geom;
  var imlib = idv.image;
  var com = idv.common;
  var util  = idv.util;

  lib.licenseOptions = ["PD-old: Public Domain where the author died more thn 100 years ago",
                        "PD-self: A statement intended to release your own work into public domain",
                        "PD-author: A statement that the work is released into the public domain by its author",
                        "cc-by-3.0: Creative Commons Attribution 3.0",
                        "cc-by-sa-3.0:Creative Commons Attribution-ShareAlike 3.0",
                        "Copyright &lt;author(above)&gt; &lt;year(above)&gt;",
                        "Other"]
  lib.copyrightIndex = 4;
  
  
  
  lib.licenseOptions = [
                        "No License Asserted (retain all rights)",
                        "PD-old: Public Domain where the author died more thn 100 years ago",
                        "PD-self: A statement intended to release your own work into public domain",
                        "PD-author: A statement that the work is released into the public domain by its author",
                        "cc-by-3.0: Creative Commons Attribution 3.0",
                        "cc-by-sa-3.0:Creative Commons Attribution-ShareAlike 3.0",
                      ]

  
  lib.licenseCode  = function (opt) {
    if (!opt) return "none";
    var sp = opt.split(":");
    if (sp.length == 1) {
      return "none"
    } else {
      return sp[0];
    }
  }
  lib.licenseIdx = function (cd) {
    
  }
  lib.genLicenseOption = function (n) {
    return "<option style='width:200px' id='option"+n+"' value = '"+n+"'>"+lib.licenseOptions[n]+"</option>";
  }
  
  lib.genLicenseOptions = function () {
    var rs = "";
    var ln = lib.licenseOptions.length;
    lib.licenseIndices = {};
    for (var i=0;i<ln;i++) {
      var opt = lib.licenseOptions[i];
      var cd = lib.licenseCode(opt);
      lib.licenseIndices[cd] = i;
      rs += lib.genLicenseOption(i);
    }
    return rs;
  }
  lib.editImageWd = 450;
  lib.editImageDiv =
    $('<div class="editImageDiv">' +
        '<div id="newNote">Describe your image. </div>'+
        '<div id="optional">optional, and you can always come back and edit image properties via "image details"</div>'+
        "<div id='editNote'>This is a shared image, imported by another user, so you can't edit its properties. Only the album title and description are available for editing.</div>"+
        '<table id="imageFields">' +
            '<tr class="forImage"><td class="inputsTD">Identifier</td><td><span id="imageID"></span></td></tr>' +
            '<tr class="forImage"><td class="inputsTD">Title</td><td><input style="width:'+lib.editImageWd+'px" id="imageTitle" type="text"/></td></tr>' +
            '<tr class="forImage"><td class="inputsTD"></td><td>To include links or other formatting in the description, use <a target="_blank" href="http://daringfireball.net/projects/markdown/basics">Markdown</a></td></tr>' +
            '<tr class="forImage"><td class="inputsTD">Description</td><td><textarea style="width:'+lib.editImageWd+'px" rows="5"  id="imageDescription"/></td></tr>' +
            '<tr class="forImage"><td class="inputsTD">Artist/<br/>Photographer</td><td><input style="width:'+lib.editImageWd+'px" id="imageAuthor" type="text"/></td></tr>' +
            '<tr class="forImage"><td class="inputsTD">Year Created</td><td><input style="width:'+lib.editImageWd+'px" id="imageYear" type="text"/></td></tr>' +
            '<tr class="forImage"><td class="inputsTD">Tags</td><td><input style="width:'+lib.editImageWd+'px" id="imageTags" type="text"/></td></tr>' +
            '<tr class="forImage"><td class="inputsTD" id="externalLinkLabel">External Link</td><td><input style="width:'+lib.editImageWd+'px" id="imageExternalLink" type="text"/></td></tr>' +
            //'<tr class="forImage" id="publicOnlyRow"><td class="inputsTD"></td><td>Public </td></tr>' + 
            '<tr class="forImage"  id="publicRow" ><td class="inputsTD"></td><td><input  id="publicImage" type="checkbox"  /> Public  </td></tr>' + 
            // '<tr class="forImage"><td class="inputsTD">Source</td><td><div style="width:'+lib.editImageWd+'px;;word-wrap:break-word" id="imageSource"></div></td></tr>' +
           //  '<tr><td class="inputsTD">Source</td><td style="width:'+lib.editImageWd+'px;word-wrap:break-word" id="imageSource"></td></tr>' +
           '<tr class="forImage"><td class="inputsTD">Dimensions</td><td id="imageDimensions"></td></tr>' +
    
          /*  '<tr id="licenseOtherRow"><td class="inputsTD">Other License</td><td><input style="width:500px" type="text" id="licenseOther"></td></tr>' + */
            '<tr id="imageErrorRow"><td class="inputsTD">Error</td><td style="color:red" id="imageErrorMessage">restrict</td></tr>' + 
          '</table>'+
          '<div class="forImage">License. (<a href="/license" target="idvWindow">About licensing</a>) </div>'+
          '<div class="forImage" id="licenseDiv"><select id="licenseSelect">'+lib.genLicenseOptions()+'</select></div>'+
          '<hr id="ahr"/>'+
          '<div id="albumNote">Properties of this album of annotations, as opposed to the image itself (optional)</div>'+
          '<table id="albumFields">' +
              '<tr><td class="inputsTD" id="albumTitleLabel">Title</td><td><input style="width:'+lib.editImageWd+'px" id="albumTitle" type="text"/></td></tr>' +
              '<tr><td class="inputsTD">Description</td><td><textarea style="width:'+lib.editImageWd+'px" rows="3"  id="albumDescription"/></td></tr>' +
          '</table>'+
    
          '<div id="editImageButtons" class="editImageLine">' +
            '<span id="submitImageEdit" class="clickableElement">Save</span>'+
            '<span id="cancelImageEdit" class="clickableElement">Cancel</span>'+
          '</div>' + /*
          '<div id="licenseExplanation">' +
            'You are not required to assert licensing information about this image, but keep in mind that you are responsible '+
            'for avoiding copyright infringements (see the ImageDiver Terms of Service). ' +
            'In the above pull-down list of possible licenses, we use Wikipedia's tags to designate particular licenses.  See this Wikipedia page for a much longer list of
            possiblities. We request that, if the applicable license appears in the Wikipedia list, that you use the Wikipedia tag to designate it.
            If the image is one that you created yourself, you can  choose to designate it as "Copyright &lt;your name&gt; <year>". If you are willing
            to release the image into the public domain, you can do so */
            
        '</div>');
      
  
  lib.editImageInitializer = 
    function (newImage) {
      /*
      function setCandidateOption() {
         var idx = parseInt($('#licenseSelect').val());
         if (idx == lib.copyrightIndex)  {
            var author = $.trim($('#imageAuthor').val());
            var opt = $('#option4');
            var cpy = "Copyright ";
            if (author) {
              cpy += author;
            } else {
              cpy += "&lt;author(above)&gt;";
            }
            var year = $.trim($('#imageYear').val());
            if (year) {
              cpy += " "+year;
            } else {
              cpy += " &lt;year(above)&gt;";
            }           
            opt.html(cpy);
         }
      }
      */
      if (!newImage) {
        $('#newNote').hide();
        $('#optional').hide();
      }
     if (lib.imOnly) {
      $('#ahr').hide();
      $("#albumNote").hide();
      $("#albumFields").hide();
     }
     lib.canEdit = lib.imD.owner == idv.loggedInUser; // can edit the image  fields; if false, only the album field can be edited
    
      var erow = $('#imageErrorRow');
      erow.hide();
      var imD = page.imD;
      //$('#publicOnlyRow').hide();
      var imPublic = imD.isPublic;
      if (imPublic) {
        $('#publicImage').attr('checked','checked');
      } else {
         $('#publicImage').removeAttr('checked','checked');
       
        }
    
      if (lib.canEdit) {
        var tp = imD.topic;
        var id = util.lastPathElement(tp);
        $('#imageID').html(id);
        var ttl = imD.title;
        if (imD.description) ds = imD.description; else ds = "";
        $('#imageTitle').val(ttl);
        if (!lib.imOnly) {
          $('#albumTitle',lib.editImageDiv).val(lib.albumD.caption);
          $('#albumDescription',lib.editImageDiv).val(lib.albumD.description);
        }
        $('#imageDescription',lib.editImageDiv).val(ds);
        $('#imageAuthor').val((imD.author)?(imD.author):'');        
        $('#imageYear').val((imD.year)?(imD.year):'');
        $('#imageTags').val((imD.tags)?imD.tags.join(", "):'');
        $('#imageExternalLink').val((imD.externalLink)?(imD.externalLink):'');
        //imD.source = "012345678901234567890123456789"
      //  $('#imageSource').html((imD.source)?(imD.source):'');
      //  $('#imageSource').html(util.breakUpString((imD.source)?(imD.source):'',lib.editImageWd));
       // $('#imageSource').html("A b c A b cA b cA b cA b cA b cA b cA b cA b cA b cA b cA b c");
        var dim = imD.dimensions;
        var dims = dim.x + " pixels wide by "+ dim.y+ " pixels high";
        $('#imageDimensions').html(dims);
        var lic = imD.license;
        var lidx = lib.licenseIndices[lic];
        $('#licenseSelect').attr('value',lidx);
        $('#editNote').hide();
        util.addToolTip($('#externalLinkLabel',lib.editImageDiv),"An external URL (eg a wikipedia page) associated with the album. Leave blank if not applicable");
      } else {
        $('#albumTitle',lib.editImageDiv).val(lib.albumD.caption);
        $('#albumDescription',lib.editImageDiv).val(lib.albumD.description);

        $('#editNote').css({'margin':'10px'});
        $('.forImage').hide();
        
      }
    }
  
    
  lib.editImageFieldValues = function () {
    var rs = {};
    rs.title = util.htmlRemove($('#imageTitle').attr("value"));
    rs.author = util.htmlRemove($('#imageAuthor').attr("value")); // escaped, because this needs to travel directly in html page (album.py)
    rs.description = $('#imageDescription').attr("value");
    rs.albumTitle = util.htmlRemove($('#albumTitle').attr("value")); // but this comes over via safe ajax calls
    
     rs.albumDescription = $('#albumDescription').attr("value");
   rs.externalLink = $('#imageExternalLink').attr("value");
    rs.isPublic =  $('#publicImage').attr('checked')?1:0;
    var slo = $('#licenseSelect').attr("value");
    var lo = lib.licenseOptions[slo];
    var lc = lib.licenseCode(lo);
    rs.license = lc;
    var yr = $('#imageYear').attr("value");
    if ($.trim(yr)) {
      /*var iyr = util.toInt(yr);
      if (iyr == undefined) {
        rs.year = "error";
        rs.error = "The year should be a number";
      } else {
      */
      rs.year = yr;
    } else {
      rs.year = "";
    }
    var tags = $.trim($('#imageTags').attr("value"));
    if (tags == "") {
      var tagsf = [];
    } else {
      var tagsp = tags.split(",");
      var isErr = false;
      var re = /^[\w\ \-]*$/;
  
      var tagsf = idv.util.arrayMap(tagsp,function (tag) {
        var tr = $.trim(tag);
        if (!re.test(tr)) {
          isErr = true;
        }
        return tr;
      });
      if (isErr) {
        return {"error":'Tags may include only alpha-numeric characters, digits, "-","_",and spaces'};
      }
    }
    rs.tags = tagsf;
    return rs;
  }
    
  
  lib.editImageCallback = function (rs) {
      var vl = rs.value;
      page.imD.description = vl.description;
      page.imD.title = vl.title;
      var imd = lib.computeAboutText();
     
      //  $('#aboutImage').html(page.imD.description);
      //$('.titleSpan').html(page.imD.title);
      //lib.lightbox.dismiss();
      page.updateTopbarOptions(page.topbar.options);
      //page.topbar.container.empty();
      page.topbar.render()
      lib.popImageDetails();
  }

    
    
    
    //lib.editSnapDiv = $('<div id="editSnapDiv"/>');
    //lib.createSnapDiv.append(lib.editSnapDiv);
   
   
    lib.editTheImage =   function () {
      //var vl = lfields.value();
      //var data = JSON.stringify(vl);
      if (lib.canEdit) {
        var imD = page.imD;
        var sdata = lib.editImageFieldValues();
        var erow = $('#imageErrorRow');
        erow.show();
        if (sdata.error) {
          var msg = $('#imageErrorMessage');
          msg.html(sdata.error);
          return;
        }
        erow.hide();
        
        var data = {image:imD.topic};
        if (!lib.isSnaps) {
          data.albumTopic = lib.albumD.topic;
        }
        util.setProperties(data,sdata,["title","description","author","externalLink","year","isPublic","license","tags"]);
        if (!lib.imOnly) util.setProperties(data,sdata,["albumTitle","albumDescription"]);
        
        
        util.setProperties(imD,sdata,["title","description","author","externalLink","year","license","tags","isPublic"]);
        if (!lib.imOnly) {
          lib.albumD.caption = sdata.albumTitle;
          lib.albumD.description = sdata.albumDescription;
        }
       var url = "/api/editImage";
        var cb = lib.editImageCallback;
        util.post(url,data,function (rs) {
           util.log("api","data returned",rs);
          if (rs.status != "ok") {
            util.logout();
            location.href = "/timeout";
            return;
          }
          cb(rs);
        },"json");
        util.log("api","uuuuu");
      } else {
        var sdata = lib.editImageFieldValues();
        var data = {caption:sdata.albumTitle,description:sdata.albumDescription}; // @todo when album editing is expanded,description:sdata.description,externalLink:sdata.externalLink};
        data.image = lib.imD.topic;
        data.topic = lib.albumD.topic;
        var url = "/api/editAlbum";
        util.post(url,data,function (rs) {
           if (rs.status == "ok") {
              lib.albumD.caption = data.caption;
              lib.albumD.description = data.description;
              lib.updateTopbarOptions(lib.topbar.options);
              lib.topbar.render()
              lib.popImageDetails();
           } else {
            util.logout();
            location.href = "/timeout"
            return;
           }
        });
        
      }
    }
    
    lib.cancelEditImage = function () {
      lib.popImageDetails();
    }
    
    
    
  
  lib.popEditImageLightbox = function (newImage) {
    lib.lightbox.pop();
    lib.lightbox.element.empty();
    lib.lightbox.addClose();
    
    lib.lightbox.element.append(lib.editImageDiv);
    
    $('#editImageButtons',lib.editImageDiv).css({"margin-top":"10px"});
    lib.editImageDiv.css({"margin-left":"10px","margin-top":"20px"});
    $('#newNote',lib.editImageDiv).css({"text-align":"center","width":"100%"});
    $('div',lib.editImageDiv).css({"margin-bottom":"10px"});
    $('#optional',lib.editImageDiv).css({"text-align":"center","width":"100%","font-size":"8pt","font-style":"italic"});

    var sie = $('#submitImageEdit');
    var cie = $('#cancelImageEdit')
    sie.click(lib.editTheImage);
    cie.click(function (){      lib.popImageDetails();});
    lib.editImageInitializer(newImage);
  
 }
 
 
  lib.addEditImageDiv = function (container) {
   
    //return;
    //container.append(lib.editImageDiv);
    //lib.setPanelPanel("editImage",lib.editImageDiv);
   
    
  }
  
    
  
    
    
    
  
})();
