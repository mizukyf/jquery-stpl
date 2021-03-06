/** 
 * @projectDescription jquery-stpl.js - Simple Template Engine for jQuery
 *
 * @author 	mizuki fujitani (mizuki.fujitani@gmail.com)
 * @version 1.0 - 2011/7/18 22:44
 * @license GPL3.0
 */

(function($){
	
	var regClass = /t:(\w+)(\?((\w+=\w+)?(\&\w+=\w+)*))?/gi;
	var regBlank = /^\s+|\s{2,}|\s+$/gi;
	var arrStack = [];
	
	var funWalk = function(jqElms){
		return jqElms.each(function(){
			var arrClassStack = [];
			var jqElm = $(this);
			if(jqElm.attr("class") !== undefined){
				jqElm.attr("class",
					jqElm.attr("class")
						.replace(
							regClass,
							function(){
								arrClassStack.push(arguments);
								return "";
							})
						.replace(
							regBlank,
							""
						));
				if(jqElm.attr("class") === ""){
					jqElm.removeAttr("class");
				};
				for(var i = 0; i < arrClassStack.length; i++){
					funRender(jqElm, arrClassStack.shift());
				}
			}else{
				funWalk(jqElm.children());
			}
		});
	};
	
	var funRender = function(jqElm, argsMatch){
		var strAction = argsMatch[1];
		var objParams = argsMatch[3] ? funMakeMap(argsMatch[3]) : null;
		switch(strAction){
			case "set":
				funSetVal(jqElm, objParams);
				break;
			case "map":
				funMapVal(jqElm, objParams);
				break;
			case "with":
				funWithVal(jqElm, objParams);
				break;
		}
		return true;
	};
	
	var funSetVal = function(jqElm, objParams){
		for(var k in objParams){
			if(objParams.hasOwnProperty(k)){
				k == "content" 
					? jqElm.html(funGet(objParams[k])) 
					: k == "class" 
						? jqElm.addClass(funGet(objParams[k]))
						: jqElm.attr(k, funGet(objParams[k]));
			}
		}
		return funWalk(jqElm.children());
	};
	
	var funMapVal = function(jqElm, objParams){
		var jqItem = jqElm.children().remove();
		if(objParams.hasOwnProperty("array") && typeof objParams["array"] == "string"){
			var arrTarget = funGet(objParams["array"]);
			if(arrTarget !== undefined && arrTarget !== null){
				for(var i = 0; i < arrTarget.length; i++){
					funPush(arrTarget[i]);
					jqElm.append(funWalk(jqItem.clone()));
					funPop();
				}
			}
		}
		return jqElm;
	};
	
	var funWithVal = function(jqElm, objParams){
		if(objParams.hasOwnProperty("object") && typeof objParams["object"] == "string"){
			var objTarget = funGet(objParams["object"]);
			if(objTarget !== undefined && objTarget !== null){
				funPush(objTarget);
				jqElm.append(funWalk(jqElm.children()));
				funPop();
			}
		}
		return jqElm;
	};
	
	var funPush = function(objData){
		return arrStack.push(objData);
	};
	
	var funPop = function(){
		return arrStack.pop();
	};
	
	var funGet = function(strKey, strDefault){
		for(var i = arrStack.length - 1; i >= 0; i--){
			if(arrStack[i].hasOwnProperty(strKey)){
				return arrStack[i][strKey];
			}
		}
		return strDefault !== undefined ? strDefault : "";
	};
	
	var funMakeMap = function(strParams){
		var objParams = {};
		var arrParams = strParams.split("&");
		for(var i = 0, e; i < arrParams.length; i++){
			e = arrParams[i].split("=", 2);
			objParams[e[0]] = e[1];
		}
		return objParams;
	};
	
	$.fn.extend({
		stpl: function(objVars){
			funPush(objVars);
			return funWalk(this);
		}
	});
	
})(jQuery);
