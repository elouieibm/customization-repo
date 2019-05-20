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
	//for DOM insertions to the to a node with a dojoattachpoint of streamNode
	var observer = new MutationObserver(
			function(mutations) {
				mutations
						.forEach(function(mutation) {
							//console.log('mutation.type = ' + mutation.type);
							//console.log(mutation.attributeNamespace);
							var targetNode = mutation.target;
							if (mutation.type == "childList") {
								try {
									if (mutation.target.getAttribute('dojoattachpoint') == 'streamNode') {
										//console.log(targetNode);
										//connsole.log(mutation.addedNodes);
										var ul = getULNode(mutation.addedNodes[0]);
										if (ul != null) {
											addFAILinks(ul);
										}
									}
								} catch (err) {
									console.log(err);
								}
							}
						});
			});

	/*
	 * Get the UL element so we can add the Flag as Inappropriate links
	 */
	function getULNode(addedNode) {
		// Node Types
		// 1	Element	element name
		// 2	Attr	attribute name
		// 3	Text	#text
		// 4	CDATASection	#cdata-section
		if (typeof addedNode !== 'undefined') {
			if (addedNode.nodeType === 1 && addedNode.tagName === 'DIV') {
				//console.debug(addedNode);
				//Get the ulNode
				var ulNode = dojo.query(".lotusInlinelist", addedNode)[0];
				//console.debug(ulNode);
				return ulNode;
			}
		} else
			return null;
	}
	;

	/*
	 * Utility function to iterate a XPathResults object
	 */
	function iterateXPathResults(nodeList) {
		try {
			var thisNode = nodeList.iterateNext();
			while (thisNode) {
				console.log(thisNode);
				thisNode = nodeList.iterateNext();
			}
		} catch (e) {
			alert('Error: Document tree modified during iteration ' + e);
		}
	}

	/*
	 * Get the Comment ID of the comment the user flagged as inappropriate
	 */
	function getCommentId(faiNode) {
		var lotusPost = document
				.evaluate(
						"ancestor::div[contains(@class, 'lotusPost lotusStatus lotusBoard')]",
						faiNode, null, XPathResult.FIRST_ORDERED_NODE_TYPE,
						null).singleNodeValue;
		return document.evaluate("a/@id", lotusPost, null,
				XPathResult.STRING_TYPE, null).stringValue.substr(8, 36);
	}

	/*
	 * Get the Wiki Comments feed url from the page
	 */
	function getFeedUrl(faiNode) {
		var feedNode = dojo.query(".lotusFeeds.lotusMeta")[0];
		var feedUrl = document.evaluate("a[@class='lotusAction']/@href",
				feedNode, null, XPathResult.STRING_TYPE, null).stringValue;
		return feedUrl;
	}

	/*
	 * Create the Flag as Inappropriate pop-up
	 */
	function customFlagPopup(commentData) {
		require(
				[ "dojo/dom-construct", "dojo/dom-style", "dojo/_base/lang",
						"dojo/on" ],
				function(domConstruct, domStyle, lang, on) {
					var custFlagEntryCommentDiv = domConstruct
							.create(
									"div",
									{
										id : 'custFlagEntryCommentDiv',
										style : 'background-color:#ffffff',
										innerHTML : "<div class='lotusDialogHeader' style='background-color: #F2F2F2;background-image: none;border: medium none #CCCCCC;border-radius: 0 0 0 0;box-shadow: none;color: #444444;font-size: 1.2em;line-height: 1.2;margin: 0;padding: 8px 0 8px 10px;text-align: center;'><h1 class='lotusHeading' style='color: #444444;font-size: 1.2em;line-height: 1.2;text-align: left;'>Flag as inappropriate</h1></div><div class='lotusDialogContent' style='max-height: 200px;overflow: auto;padding: 5px 10px;'><div class='lotusFormField'><label for='cust_input_comment_for_comment'>Provide a reason for flagging this entry (optional):</label><div><textarea id='cust_input_comment_for_comment' style='width:80%' rows='7' name='comment' title='Provide a reason for flagging this entry (optional):'></textarea></div></div></div><div class='lotusDialogFooter' style='background-color: #FFFFFF;border-top: 1px solid #CCC3B2;margin: 0 10px;padding: 15px 0;text-align:right;'><input id='custFlagCommentSubmitButton' class='lotusFormButton blogsPaddingRight' type='button' value='OK' name='submitBtn' style='background-color: #0066AE;background-image: none;border: 1px solid #005097;border-radius: 0 0 0 0;box-shadow: none;color: #FFFFFF;display: inline-block;font-weight: bold;margin-right: 3px;padding: 6px 10px;text-decoration: none;text-shadow: 1px 1px 0 #1570CD;'><input id='custFlagCommentCancelButton' class='lotusFormButton blogsPaddingRight' type='button' value='Cancel' name='cancelBtn' style='background-color: #0066AE;background-image: none;border: 1px solid #005097;border-radius: 0 0 0 0;box-shadow: none;color: #FFFFFF;display: inline-block;font-weight: bold;margin-right: 3px;padding: 6px 10px;text-decoration: none;text-shadow: 1px 1px 0 #1570CD;'></div>"
									});
					var eWidgForm = new dijit.Dialog({
						id : "eeFlagComment",
						title : "Flag Comment",
						content : custFlagEntryCommentDiv,
						style : "width: 300px; height: 150px;",
					});
					eWidgForm.show();

					var cancelButton = dojo.byId('custFlagCommentCancelButton');
					var flagSubmitCommentButton = dojo
							.byId('custFlagCommentSubmitButton');

					dojo.connect(cancelButton, "onclick", function() {
						setTimeout(function() {
							eWidgForm.destroyRecursive();
						}, 0);
					});

					dojo.connect(flagSubmitCommentButton, "onclick", function() {
						dojo.xhrPost({
							// The URL of the request
							url: "/BofAStatusUpdateModeration/rest/api/flagStatusUpdateComment",
							postData: dojo.toJson({
									communityUuid: commentData.communityUuid,
									contentTitle: commentData.title,
									contentId: commentData.commentId,
									contentPublished: commentData.statusTimeStamp,
									contentAuthorGuid: commentData.contentAuthorGuid,
									contentAuthorName: commentData.contentAuthorName,
									flagReason: dojo.byId("cust_input_comment_for_comment").value,
									contentContent: commentData.contentContent,
//									flagUserName: flagOwner,
//									flagUserGuid: flagOwnerId
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

				}) //require
	} //function

	/*
	 * XPath Namespace Resolver
	 */
	function resolver(prefix) {
		switch (prefix) {
		case 'thr':
			return 'http://purl.org/syndication/thread/1.0';
		case 'snx':
			return 'http://www.ibm.com/xmlns/prod/sn';
		case 'td':
			return 'urn:ibm.com/td';
		case 'opensearch':
			return 'http://a9.com/-/spec/opensearch/1.1';
		default:
			return 'http://www.w3.org/2005/Atom';
		}
	}

	/*
	Parse the Wiki Comment Feed
	 */
	function parseXml(xmlDoc, commentId) {
		//console.debug(new XMLSerializer().serializeToString(doc.documentElement));
		//need to prefix /a:feed in XPath when in POC - Eugene 05172019
		var entry = document.evaluate("/a:feed/a:entry[./a:id='urn:lsid:ibm.com:td:"
				+ commentId + "']", xmlDoc.documentElement, resolver,
				XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
		//iterateXPathResults(entry);
		var title = document.evaluate(
				"/a:title/text()", entry, resolver,
				XPathResult.STRING_TYPE, null).stringValue;
		var contentAuthorGuid = document.evaluate(
				"/a:author/snx:userid/text()", entry, resolver,
				XPathResult.STRING_TYPE, null).stringValue;
		var contentAuthorName = document.evaluate("/a:author/a:name/text()",
				entry, resolver, XPathResult.STRING_TYPE, null).stringValue;
		var contentContent = document.evaluate("/a:content/text()", entry,
				resolver, XPathResult.STRING_TYPE, null).stringValue;
		var statusTimeStamp = document.evaluate("/a:updated/text()", entry,
				resolver, XPathResult.STRING_TYPE, null).stringValue;
		var ts = (new Date(statusTimeStamp).getTime());
		return {
			"commentId" : commentId,
			"title" : title,
			"communityUuid" : ic_comm_communityUuid,
			"contentAuthorGuid" : contentAuthorGuid,
			"contentAuthorName" : contentAuthorName,
			"contentContent" : contentContent,
			"statusTimeStamp" : ts
		}
	}

	/*
	 * Get the contents of the Wiki Comments Feed
	 */
	function getFeed(feedUrl, commentId) {
		var xhrArgs = {
			url : feedUrl,
			handleAs : "xml",
			load : function(data) {
				console.log(commentId);
				console.debug(new XMLSerializer()
						.serializeToString(data.documentElement));
				var commentData = parseXml(data, commentId);
				customFlagPopup(commentData);
			},
			error : function(error) {

			}
		}
		// Call the asynchronous xhrGet
		var deferred = dojo.xhrGet(xhrArgs);
	}

	/*
	 * Utility function to get a parameter from a URL
	 */
	function getUrlParameter(url, name) {
		name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
		var regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
		var results = regex.exec(url);
		return results === null ? '' : decodeURIComponent(results[1].replace(
				/\+/g, ' '));
	}

	/*
	 * Called when the user clicks on a Flag as Inappropriate link
	 */
	var faiClicked = function(event) {
		var commentId = getCommentId(event.target); //event.target is the node of where the FAI link was clicked
		var feedUrl = getFeedUrl(event.target);
		console.debug("Feed URL=" + feedUrl);
		getFeed(feedUrl, commentId);
	}

	/*
	 * Adds the Flag as Inappropriate link to the comment
	 */
	var addFAILinks = function(ul) {
		var scriptName = "Add FAI to Wiki Comments";
		console.debug(scriptName + ": Entering addFAILinks");
		require([ "dojo/dom-construct", "dojo/dom-style", "dojo/_base/lang",
				"dojo/on" ], function(domConstruct, domStyle, lang, on) {
			var li = domConstruct.create("li");
			var a = domConstruct.create("a", {
				href : "javascript:",
				innerHTML : "Flag as Inappropriate",
				title : "Flag as inappropriate",
				role : "button",
				className : "flagBtn"
			}, li);
			domConstruct.place(li, ul, "last"); //Create a new element and place it last
			var handle = on(a, "click", function(event) {
				faiClicked(event);
			});
		});

		// The mutation observer can not be disconnected because on some pages the DOM is updated dynamically so we have to constantly monitor the page
		//observer.disconnect();
	};

	require([ "dojo", "dojo/_base/window", "dojo/domReady!" ], function(dojo, win) {
		var waitForName = "#lotusContent";
		console.log(topURL);
		var t = topURL.indexOf('pages/create?rel=');
		if (topURL.indexOf('pages/create?rel=') == -1) {
			utils.waitFor(function() {
				var scriptName = "Add FAI to Wiki Comments";
				console.log(scriptName + ": Adding Observer");
				//var observationNode = dojo.query('div[dojoattachpoint="streamNode"]')[0];
				//var observationNode = dojo.byId('body');
	            var observationNode = win.body();
				if (observationNode != 'undefined') {
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
	console.log(scriptName + ": DOJO WAS UNDEFINED at " + window.location.href)
}
