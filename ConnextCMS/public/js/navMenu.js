/*
* This file is called by default.hbs. It queries data from the ConnextCMS/KeystoneJS server
* and dynamically creates the navigation menu.
*/

//Globals
var sectionData, pageData, privatePageData, isLoggedIn, serverData, privatePagesSection;
      


$(document).ready(function(){
  //console.log('The program is starting...');
  //debugger;

  //Get the settings JSON file before doing anything else.
  $.getJSON('/js/publicsettings.json', '', function(data) {
    //debugger;

    //Move the data to the global varibable.
    serverData = data;

    privatePagesSection = serverData.privatePagesSection;


    //Get all the page sections.
    $.get('/api/pagesection/list', '', function(data) {

      //Copy data to a global variable for later use.
      sectionData = data.pagesection;

      //Sort the Section Data based on the priority value.
      //https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort
      sectionData.sort(function(a,b) {
        if( a.priority > b.priority ) {
          return 1;
        }
        if( a.priority < b.priority ) {
          return -1;
        }
        // a must be equal to b
        return 0;
      });

      //Get all the pages.
      $.get('/api/page/list', '', function(data) { 
        //debugger;

        //Copy data to a global variable for later use.
        pageData = data.pages;  

        //Sort the Page Data based on the priority value.
        //https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort
        pageData.sort(function(a,b) {
          if( a.priority > b.priority ) {
            return 1;
          }
          if( a.priority < b.priority ) {
            return -1;
          }
          // a must be equal to b
          return 0;
        });

        //Get user session information. Determine if user is logged in or not.
        $.get('/keystone/api/session', '', function(data) {
          //debugger;

          //Test if the user is logged in.
          isLoggedIn = !$.isEmptyObject(data);

          //Get the private pages if the user is logged in.
          if(isLoggedIn) {
            $.get('/api/privatepage/list', '', function(data) {
              //debugger;
              privatePageData = data.pages;

              generateNavMenu();
            })

          //If the user is not logged in, then generate the publically available nav menu.
          } else {
            //debugger;
            generateNavMenu();
          }

        });


      });
    });



  })
  //If sending the data to the server fails:
  .fail(function( jqxhr, textStatus, error ) {
    debugger;


    console.error('Error trying to retrieve JSON data from /js/publicsettings.js');
  });
    
  //console.log('...The program has ended.');
});

function generateNavMenu() {
  //debugger;

  //Loop through the sections. Generate one navigation item per section.
  for( var i = 0; i < sectionData.length; i++ ) {

    //Skip the current section if the priority is set to zero.
    if( sectionData[i].priority == 0 )
      continue;

    //Clone the menu item template.
    var tempNavItem = $('#menuSection').clone();
    var tempPageItemTemplate = $('#menuPage').clone(); //Create clean template we can clone from on each pass of the loop.
    var tempPageItem = $('#menuPage').clone();

    //Remove the menu page now that it's been cloned.
    tempNavItem.find('#menuPage').remove();

    //Clear the ID copied from the example row.
    tempNavItem.attr('id', '');
    tempPageItem.attr('id', '');
    tempNavItem.attr('class', 'dropdown autogenerated-menu');

    //Set the text of the Nav item to the Section name.
    tempNavItem.find('a').first().html(sectionData[i].name+' <span class="caret"></span>');

    //Populate the Private Page Section.
    if(sectionData[i]._id == privatePagesSection) {
      if(isLoggedIn) {
        //debugger;

        //Loop through the page data. Generate a link for each page in this section.
        for( var j = 0; j < privatePageData.length; j++ ) {
          //debugger;

          //Only display pages with a state of 'published'.
          if( privatePageData[j].state != "published" ) {
            continue;
          }

          //Skip the current page if the priority is set to zero.
          if( privatePageData[j].priority == 0 ) {
            continue;
          }

          //If the first section in the page matches the current section.
          if( privatePageData[j].sections[0] == sectionData[i]._id ) {

            //Set the hyperlink.
            if( (privatePageData[j].redirectUrl != "") && (privatePageData[j].redirectUrl != undefined) ) {
              tempPageItem.find('a').attr('href', privatePageData[j].redirectUrl);  

              if(privatePageData[j].redirectNewWindow)
                tempPageItem.find('a').attr('target', '_blank');

            } else {
              tempPageItem.find('a').attr('href', '/privatepage/'+privatePageData[j].slug)  
            }

            //Set the name of the menu page to the name of the Page
            tempPageItem.find('a').text(privatePageData[j].title);

            //Append the item to the menu under the current section.
            tempNavItem.find('ul').append(tempPageItem);

            //Clone the tempPageItem for the next matching page.
            tempPageItem = tempPageItemTemplate.clone();

            //break;
          }

        }
      }
    //Populate all other sections.
    } else {

      //Loop through the page data. Generate a link for each page in this section.
      for( var j = 0; j < pageData.length; j++ ) {
        //debugger;

        //Only display pages with a state of 'published'.
        if( pageData[j].state != "published" ) {
          continue;
        }

        //Skip the current page if the priority is set to zero.
        if( pageData[j].priority == 0 ) {
          continue;
        }

        //If the first section in the page matches the current section.
        if( pageData[j].sections[0] == sectionData[i]._id ) {

          //Set the hyperlink.
          if( (pageData[j].redirectUrl != "") && (pageData[j].redirectUrl != undefined) ) {
            tempPageItem.find('a').attr('href', pageData[j].redirectUrl);  

            if(pageData[j].redirectNewWindow)
              tempPageItem.find('a').attr('target', '_blank');
          } else {
            tempPageItem.find('a').attr('href', '/page/'+pageData[j].slug)  
          }

          //Set the name of the menu page to the name of the Page
          tempPageItem.find('a').text(pageData[j].title);

          //Append the item to the menu under the current section.
          tempNavItem.find('ul').append(tempPageItem);

          //Clone the tempPageItem for the next matching page.
          tempPageItem = tempPageItemTemplate.clone();

          //break;
        }

      }
    }

    //debugger;

    //Only page the new menu item if it has children items in the drop down.
    if( tempNavItem.find('ul').find('li').length > 0 ) {              

      //Append the new nav item to the navigation menu bar.                  
      if( $('.autogenerated-menu').length == 0 ) {
        //Append the first item after the #menuSection scaffolding.
        $('#menuSection').after(tempNavItem);
      } else {
        //Append later menu items after the previous one. 
        $('.autogenerated-menu').last().after(tempNavItem);
      }

      //Active the drop-down on hover functionality with this new menu item.
      //Note: item must be appened FIRST before calling dropdownHover().
      //tempNavItem.find('.dropdown-toggle').dropdownHover();
    }

  }

  //Remove the scaffolding menu element.
  $('#menuSection').remove()
}