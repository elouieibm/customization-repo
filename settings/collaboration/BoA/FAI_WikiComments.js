// ==UserScript==
// @name         Add FAI to Wiki Comments
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  The JS will wait for the lotusFrame to become available and then create
//				 a mutation observer to monitor changes to the lotusContent DIV.  If any changes are
//               applied to a node with a class of fn, then the UpdateLinks function is
//               called. The Update links function will remove the bizcard link and replace
//               it with just the name of the user.
// @author       You
// @include      https://lc60.issl.ibm.com/wikis/*
// @require      file:///home/elouie/eclipse/workspace2/MyLibrary/utils.js
// @grant        unsafeWindow
// ==/UserScript==


	//"use strict";
	if (typeof (dojo) != 'undefined') {
        var topURL = window.top.location.href;
		var scriptName = "Add FAI to Wiki Comments";
		console.log(scriptName + ": Found Dojo at " + window.location.href);

		//Create a mutation observer that monitors the page
		//for changes to a node with a class of fn
		var observer = new MutationObserver(function(mutations) {
			mutations.forEach(function(mutation) {
				//console.log('mutation.type = ' + mutation.type);
				//console.log(mutation.attributeNamespace);
				var targetNode = mutation.target;
                if (mutation.type ==  "childList") {
				try {
                    if (mutation.target.getAttribute('dojoattachpoint') == 'streamNode'){
                    console.log("**");
                    //console.log(targetNode);
					//connsole.log(mutation.addedNodes);

                    var ul = getULNode(mutation.addedNodes[0]);
                    if(ul != null) {
                        addFAILinks(ul);
                    }
                    }
				} catch (err) {
					console.log(err);
				}
            }
			});
		});


       function getULNode(addedNode) {
            // Node Types
            // 1	Element	element name
            // 2	Attr	attribute name
            // 3	Text	#text
            // 4	CDATASection	#cdata-section
            if (typeof addedNode !== 'undefined') {
                if (addedNode.nodeType === 1 && addedNode.tagName === 'DIV'){
                    console.log(addedNode);
                    //Get the ulNode
                    var ulNode = dojo.query(".lotusInlinelist",addedNode)[0];
                    console.log(ulNode);
                    return ulNode;
                }
            } else return null;
        };

       function customFlagPopup (comment){
		var ds = this._moreDs;

		var custFlagEntryCommentDiv = document.createElement("div");
		custFlagEntryCommentDiv.id = "custFlagEntryCommentDiv";
		custFlagEntryCommentDiv.style.cssText='background-color:#ffffff';
		custFlagEntryCommentDiv.innerHTML="<div class='lotusDialogHeader' style='background-color: #F2F2F2;background-image: none;border: medium none #CCCCCC;border-radius: 0 0 0 0;box-shadow: none;color: #444444;font-size: 1.2em;line-height: 1.2;margin: 0;padding: 8px 0 8px 10px;text-align: center;'><h1 class='lotusHeading' style='color: #444444;font-size: 1.2em;line-height: 1.2;text-align: left;'>Flag as inappropriate</h1></div><div class='lotusDialogContent' style='max-height: 200px;overflow: auto;padding: 5px 10px;'><div class='lotusFormField'><label for='cust_input_comment_for_comment'>Provide a reason for flagging this entry (optional):</label><div><textarea id='cust_input_comment_for_comment' style='width:80%' rows='7' name='comment' title='Provide a reason for flagging this entry (optional):'></textarea></div></div></div><div class='lotusDialogFooter' style='background-color: #FFFFFF;border-top: 1px solid #CCC3B2;margin: 0 10px;padding: 15px 0;text-align:right;'><input id='custFlagCommentSubmitButton' class='lotusFormButton blogsPaddingRight' type='button' value='OK' name='submitBtn' style='background-color: #0066AE;background-image: none;border: 1px solid #005097;border-radius: 0 0 0 0;box-shadow: none;color: #FFFFFF;display: inline-block;font-weight: bold;margin-right: 3px;padding: 6px 10px;text-decoration: none;text-shadow: 1px 1px 0 #1570CD;'><input id='custFlagCommentCancelButton' class='lotusFormButton blogsPaddingRight' type='button' value='Cancel' name='cancelBtn' style='background-color: #0066AE;background-image: none;border: 1px solid #005097;border-radius: 0 0 0 0;box-shadow: none;color: #FFFFFF;display: inline-block;font-weight: bold;margin-right: 3px;padding: 6px 10px;text-decoration: none;text-shadow: 1px 1px 0 #1570CD;'></div>";

		var eWidgForm = new dijit.Dialog({
			id: "eeFlagComment",
			title: "Flag Comment",
			content: custFlagEntryCommentDiv,
			style: "width: 300px; height: 150px;",
		});
		eWidgForm.show();

		var cancelButton = dojo.byId('custFlagCommentCancelButton');
		var flagSubmitCommentButton = dojo.byId('custFlagCommentSubmitButton');

		dojo.connect(cancelButton, "onclick", function() {
				setTimeout(function() { eWidgForm.destroyRecursive(); }, 0);
			});

		var communityUuid = "";
		var topURL = window.top.location.href;
		var pos = topURL.indexOf("communityUuid=");
		if (pos != -1) {
			communityUuid = topURL.substring(pos + 14,pos + 14 + 36);
		}

		var contentAuthId = ds.getValue(comment, "author").id;
		var statusOwner = ds.getValue(comment, "author").name;
		var statusId = ds.getValue(comment, "id");
		var statusContent = ds.getValue(comment, "contents");

		//date fix starts here
		var statusTimeStampOrig = ds.getValue(comment, "published");

		function pad(number) {
		if (number < 10) {
			return '0' + number;
		}
		return number;
		}

		var statusTimeStamp =
		statusTimeStampOrig.getUTCFullYear() +
        '-' + pad(statusTimeStampOrig.getUTCMonth() + 1) +
        '-' + pad(statusTimeStampOrig.getUTCDate()) +
        'T' + pad(statusTimeStampOrig.getUTCHours()) +
        ':' + pad(statusTimeStampOrig.getUTCMinutes()) +
        ':' + pad(statusTimeStampOrig.getUTCSeconds()) +
        '.' + (statusTimeStampOrig.getUTCMilliseconds() / 1000).toFixed(3).slice(2, 5) +
        'Z';
		//date fix ends here
		//alert(statusTimeStamp);

		//var statusTimeStampOrig = ds.getValue(comment, "stateChangedDate");
		//var statusTimeStampOrig = ds.getValue(comment, "published");
		//alert("statusTimeStampOrig = "+statusTimeStampOrig);
		//var statusTimeStamp = Date.parse(statusTimeStampOrig);
		//var statusTimeStamp = statusTimeStampOrig.toISOString();
		//var statusTimeStamp = ds.getValue(comment, "published"); - did not work

		//var statusTimeStamp = ds.getPublished();  - did not work

		//alert("statusTimeStamp = "+statusTimeStamp);
		//alert("\n\nstringify ds =\n\n "+JSON.stringify(ds)+"\n\n");
		//window.prompt("stingify ds = ",JSON.stringify(ds));

		//var tempstr = JSON.stringify(ds);
		//var pubspot = tempstr.lastIndexOf("published");
		//var statusTimeStamp = tempstr.substring(pubspot+12,pubspot+36);
		//alert(statusTimeStamp);


		var flagOwnerId = this.authUser.id;
		var flagOwner = this.authUser.name;

		var allText = (dojo.query(".data")[0]).innerHTML;
		var pos1 = allText.lastIndexOf('@all')+6;
		var containerId = allText.substring(pos1, (allText.indexOf('\\', pos1)));


		dojo.connect(flagSubmitCommentButton, "onclick", function() {
			dojo.xhrPost({
				// The URL of the request
				url: "/BofAStatusUpdateModeration/rest/api/flagStatusUpdateComment",
				postData: dojo.toJson({
						communityUuid: communityUuid,
						contentAuthorGuid: contentAuthId,
						contentAuthorName: statusOwner,
						contentId: statusId,
						contentContent: statusContent,
						contentPublished: statusTimeStamp,
						flagReason: dojo.byId("cust_input_comment_for_comment").value,
						flagUserGuid: flagOwnerId,
						flagUserName: flagOwner,
						containerId: containerId
				}),
				handleAs: "text",
				// The success handler - Destroys window
				load: function(response) {
					setTimeout(function() {eWidgForm.destroyRecursive(); }, 0);
					//Refreshses stream automatically to display the new content
					dojo.publish(com.ibm.social.as.constants.events.UPDATESTATE, [{}]);
				},
				// The error handler - Destroys window
				error: function() {
					setTimeout(function() {eWidgForm.destroyRecursive(); }, 0);
				},
				// The complete handler
				handle: function() {
				}
			});
			setTimeout(function() { eWidgForm.destroyRecursive(); }, 0);
		});
	  }

      function iterateXPathResults(iterator) {
          try {
              var thisNode = iterator.iterateNext();
              while (thisNode) {
                  console.log( thisNode );
                  thisNode = iterator.iterateNext();
              }
          }
          catch (e) {
              alert( 'Error: Document tree modified during iteration ' + e );
          }
      }

      function getCommentData(faiNode) {
          console.log(faiNode);
          //console.log(node.parentElement);
          //var x = document.evaluate( "ancestor::div[@class='lotusPostAuthorInfo']", faiNode, null, XPathResult.ANY_TYPE, null );
          //var x = document.evaluate( "ancestor::div[@class='lotusPostContent']/preceding-sibling::div", faiNode, null, XPathResult.ANY_TYPE, null );
          //var x = document.evaluate( "ancestor::div[@class='lotusPostContent']/preceding-sibling::div", faiNode, null, XPathResult.ANY_TYPE, null );
          //var lotusPost = document.evaluate( "ancestor::div[contains(@class, 'lotusPost')]", faiNode, null, XPathResult.ANY_TYPE, null );

          //Get the CommentPosting
          var lotusPost = document.evaluate( "ancestor::div[contains(@class, 'lotusPost lotusStatus lotusBoard')]", faiNode, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null ).singleNodeValue;
          console.log(lotusPost);
          var lotusPostAuthorInfo = document.evaluate( "div[contains(@class, 'lotusPostAuthorInfo')]", lotusPost, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null ).singleNodeValue;
          var lotusPostContent = document.evaluate( "div[contains(@class, 'lotusPostContent')]", lotusPost, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null ).singleNodeValue;
          var lotusPostAvatar = document.evaluate( "div[contains(@class, 'lotusPostAvatar')]", lotusPostAuthorInfo, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null ).singleNodeValue;
          var photoUrl = document.evaluate( "img/@src", lotusPostAvatar, null, XPathResult.STRING_TYPE, null ).stringValue;
          var authorName = document.evaluate( "div[@class='lotusMeta']/a/@aria-label", lotusPostContent, null, XPathResult.STRING_TYPE, null ).stringValue;
          var contentId = document.evaluate( "a/@id", lotusPost, null, XPathResult.STRING_TYPE, null ).stringValue;
          var contentContent = document.evaluate( "div[@class='lotusPostDetails']/p", lotusPostContent, null, XPathResult.STRING_TYPE, null ).stringValue;

         // console.debug(lotusPostAuthorInfo);
         // console.debug(lotusPostAvatar);
         // console.debug(photoUrl);
         // console.debug(authorName);


          //iterateXPathResults(lotusPostAuthorInfo);

          console.log("$$$ " + getUrlParameter(photoUrl,"userid"));

          return {      communityUuid : ic_comm_communityUuid,
						contentAuthorGuid: getUrlParameter(photoUrl,"userid"),
						contentAuthorName: authorName,
						contentId: contentId,
						contentContent: contentContent
						//contentPublished: statusTimeStamp
						//flagReason: dojo.byId("cust_input_comment_for_comment").value
						//flagUserGuid: flagOwnerId,
						//flagUserName: flagOwner,
						//containerId: containerId
                 };

      }

    function getFeedUrl(faiNode) {
          var e = document.evaluate( "ancestor::div[contains(@class, 'lotusPost lotusStatus lotusBoard')]", faiNode, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null ).singleNodeValue;
              console.log(e);

    }
    function getUrlParameter(url,name) {
        name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
        var regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
        var results = regex.exec(url);
        return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
    };

      var hi =function(event) {
           require(
					[ "dojo/dom-construct", "dojo/dom-style", "dojo/_base/lang", "dojo/on" ],
					function(domConstruct, domStyle, lang, on) {
                        console.log(event);
                        var custFlagEntryCommentDiv = domConstruct.create("div", {id : 'custFlagEntryCommentDiv',
                                                                                style : 'background-color:#ffffff',
                                                                               innerHTML : "<div class='lotusDialogHeader' style='background-color: #F2F2F2;background-image: none;border: medium none #CCCCCC;border-radius: 0 0 0 0;box-shadow: none;color: #444444;font-size: 1.2em;line-height: 1.2;margin: 0;padding: 8px 0 8px 10px;text-align: center;'><h1 class='lotusHeading' style='color: #444444;font-size: 1.2em;line-height: 1.2;text-align: left;'>Flag as inappropriate</h1></div><div class='lotusDialogContent' style='max-height: 200px;overflow: auto;padding: 5px 10px;'><div class='lotusFormField'><label for='cust_input_comment_for_comment'>Provide a reason for flagging this entry (optional):</label><div><textarea id='cust_input_comment_for_comment' style='width:80%' rows='7' name='comment' title='Provide a reason for flagging this entry (optional):'></textarea></div></div></div><div class='lotusDialogFooter' style='background-color: #FFFFFF;border-top: 1px solid #CCC3B2;margin: 0 10px;padding: 15px 0;text-align:right;'><input id='custFlagCommentSubmitButton' class='lotusFormButton blogsPaddingRight' type='button' value='OK' name='submitBtn' style='background-color: #0066AE;background-image: none;border: 1px solid #005097;border-radius: 0 0 0 0;box-shadow: none;color: #FFFFFF;display: inline-block;font-weight: bold;margin-right: 3px;padding: 6px 10px;text-decoration: none;text-shadow: 1px 1px 0 #1570CD;'><input id='custFlagCommentCancelButton' class='lotusFormButton blogsPaddingRight' type='button' value='Cancel' name='cancelBtn' style='background-color: #0066AE;background-image: none;border: 1px solid #005097;border-radius: 0 0 0 0;box-shadow: none;color: #FFFFFF;display: inline-block;font-weight: bold;margin-right: 3px;padding: 6px 10px;text-decoration: none;text-shadow: 1px 1px 0 #1570CD;'></div>"
                                                                               } );
                        var eWidgForm = new dijit.Dialog({
                            id: "eeFlagComment",
                            title: "Flag Comment",
                            content: custFlagEntryCommentDiv,
                            style: "width: 300px; height: 150px;",
                        });
                        eWidgForm.show();

                   		var cancelButton = dojo.byId('custFlagCommentCancelButton');
                        var flagSubmitCommentButton = dojo.byId('custFlagCommentSubmitButton');

                        dojo.connect(cancelButton, "onclick", function() {
                            setTimeout(function() { eWidgForm.destroyRecursive(); }, 0);
                        });

                        var dataNode = event.target;
                       // var commentDataJSON = getCommentData(event.target);
                       // console.log("### communityUuid=" + commentDataJSON.communityUuid );
                       // console.log("### contentAuthorGuid=" + commentDataJSON.contentAuthorGuid );
                       // console.log("### contentAuthorName=" + commentDataJSON.contentAuthorName );
                       // console.log("### contentId=" + commentDataJSON.contentId );
                       // console.log("### contentId=" + commentDataJSON.contentContent );

                        getFeedUrl();

                    }) //function
        }

		//Adds FAI link
		var addFAILinks = function(ul) {
			var scriptName = "Add FAI to Wiki Comments";
			console.debug(scriptName + ": Entering addFAILinks");
			require(
					[ "dojo/dom-construct", "dojo/dom-style", "dojo/_base/lang", "dojo/on" ],
					function(domConstruct, domStyle, lang, on) {
                        //var FAI = domConstruct.toDom('<li><a href="javascript:;" role="button">Flas as Inappropriate</a></li>');
                        //domConstruct.place(FAI, ul, "last"); //Create a new element and place it last
                        var li = domConstruct.create("li");
                        var a = domConstruct.create("a", {href: "javascript:", innerHTML: "FLAGGER",title: "Flag as inappropriate", role: "button", className: "flagBtn"}, li);
						domConstruct.place(li, ul, "last"); //Create a new element and place it last
                        var handle = on(a, "click", function(event){hi(event);});
					});

			// The mutation observer can not be disconnected because on some pages the DOM is updated dynamically so we have to constantly monitor the page
			//observer.disconnect();
		};

		require([ "dojo", "dojo/domReady!" ], function(dojo) {
			var waitForName = "#lotusContent";
            console.log(topURL);
            var t = topURL.indexOf('pages/create?rel=');
            if (topURL.indexOf('pages/create?rel=') == -1) {
           	utils.waitFor(function() {
				var scriptName = "Add FAI to Wiki Comments";
                console.log(scriptName + ": Adding Observer");
				//var observationNode = dojo.query('div[dojoattachpoint="streamNode"]')[0];
                var observationNode = dojo.byId('body');

                if(observationNode != 'undefined') {
                    observer.observe(observationNode, {
                        attributes : false, // attribute changes will be observed
                        childList : true, // target childs will be observed | on add/remove
                        //attributeFilter: ['class'], // filter for attributes
                        subtree : true
                        // target childs will be observed | on attributes/characterData changes if they observed on target
                    });
                } else {
                  console.log('Observation Node is null');
                }
			}, waitForName);
            } else {
                    console.log('Wiki page does not have comments section');
            }
        })
	} else {
		//var scriptName = "Remove BizCard Links";
		console.log(scriptName + ": DOJO WAS UNDEFINED at "
				+ window.location.href)
	}