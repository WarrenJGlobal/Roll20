// GitHub : https://github.com/WarrenJGlobal/Roll20Api/blob/master/PTUtokenAction/PTUtokenAction.js
// By Warren.J  (Global)
// Contact: https://app.roll20.net/users/596590/
// Roll20 Thread: https://app.roll20.net/forum/post/3448102/script-ptutokenaction-creates-token-actions-for-use-with-ptu-pokemon-tabletop-united/
// Special thanks to The Aaron (Assisting with various issues) & Kevin (Created the origional TokenAction for 5th Edition which I used the basic structure and functions)

var PTUtokenAction = PTUtokenAction || (function() {
    'use strict';

    //Configuration settings
    var showAsTokenAction = true;   //Setting true will automatically enable any newly created token actions. Setting false leaves newly created token actions disabled.
    
    var version = '1.0.0',
        lastUpdate = 1464684788,
        
    checkInstall = function() {
        log('~=} PTUtokenAction v'+version+' {=~  ['+(new Date(lastUpdate*1000))+']');
    },
	
	findAttributeValue = function (attribute,character){
		return findObjs({
			type: 'attribute',
			characterid: character,
			name: attribute
		});
	},
    
	checkAttributes = function(attribute,character){
		if (findAttributeValue(attribute,character) == '') {
			return  ", ***"+attribute+"***"; // If an attribute doesn't exist in the character return the attribute name for error message
		}
		return ""; // ensure the value returned is a blank
	},
	
	createDefaultAttribute = function(attribute,character,Default){ //Creates the attribute and sets the Default value for that atribute if it doesn't exist
		if (findAttributeValue(attribute,character) == "") {
			createObj('attribute', {
				characterid: character,
				name: attribute,
				current: Default
			});
		}
	},
	
	inputAttributeCase = function(attribute,character) { // This function is to remove all whitescape and set to lowercase to lower user error with the attribute damage type.
		var atrStd = getAttrByName(character.id, attribute);
		atrStd = atrStd.toLowerCase();
		atrStd = atrStd.replace(/\s/g, "");
		return atrStd;
	},
	
	moveTableRow = function(moveNo,character){ //Function to produce Rows in the MoveTable (I could do this with a for loop)
		var MoveDType,
			MoveType,
			MacroButton,
			MoveName=getAttrByName(character.id,"Move"+ moveNo + "_Name");
			
		if (MoveName !== ""){
			MoveDType = getAttrByName(character.id,"Move"+ moveNo + "_DType");
			MoveType = getAttrByName(character.id,"Move"+ moveNo + "_Type");
			MacroButton = "[M"+moveNo+"](!PTUMove --"+moveNo+")";
			return[MoveName,MoveType,MoveDType,MacroButton];
		}
		return ['','','',''];
	},
	
	moveTable = function(character,who){ //What is used to display the List of moves. to the user.
		var move1 = moveTableRow(1,character),
			move2 = moveTableRow(2,character),
			move3 = moveTableRow(3,character),
			move4 = moveTableRow(4,character),
			move5 = moveTableRow(5,character),
			move6 = moveTableRow(6,character),
			texts = "<table border=1 style=width:100% ><tbody>"+
						"<th colspan=4>"+character.get("name")+"'s move list</th>"+
						"<tr><th>Move Name</th><th>Type</th><th>DmgType</th><th>Macro</th></tr>"+
						"<tr><td>"+move1[0]+"</td><td>"+move1[1]+"</td><td>"+move1[2]+"</td><td>"+move1[3]+"</td></tr>"+
						"<tr><td>"+move2[0]+"</td><td>"+move2[1]+"</td><td>"+move2[2]+"</td><td>"+move2[3]+"</td></tr>"+
						"<tr><td>"+move3[0]+"</td><td>"+move3[1]+"</td><td>"+move3[2]+"</td><td>"+move3[3]+"</td></tr>"+
						"<tr><td>"+move4[0]+"</td><td>"+move4[1]+"</td><td>"+move4[2]+"</td><td>"+move4[3]+"</td></tr>"+
						"<tr><td>"+move5[0]+"</td><td>"+move5[1]+"</td><td>"+move5[2]+"</td><td>"+move5[3]+"</td></tr>"+
						"<tr><td>"+move6[0]+"</td><td>"+move6[1]+"</td><td>"+move6[2]+"</td><td>"+move6[3]+"</td></tr>"+
					"</tbody></table>";
		sendChat(" PTUMoveList, ***Keep token selected***", "/w "+who+" "+texts);
	},
	
    move = function(moveNo, character,who){ // This is used to check the move<X> attributes and then use the correct template to avoid crashes in the API.
    	var checkMoveDType = inputAttributeCase("Move"+ moveNo + "_DType",character),
			CharName = character.get("name"),
			attribute_Error =
				checkAttributes("Move"+moveNo+"_Name",character.id)+
				checkAttributes("Move"+moveNo+"_Freq",character.id)+
				checkAttributes("Move"+moveNo+"_Type",character.id)+
				checkAttributes("Move"+moveNo+"_Range",character.id)+
				//checkAttributes("Move"+moveNo+"_Effects",character.id)+ //not needed
				//checkAttributes("Move"+moveNo+"_critsOn",character.id)+ // The rolltemplate functions fine with this as a default value.
				//checkAttributes("Move"+moveNo+"_AC",character.id)+ // Not needed.
				""; // Just ending for setting out.
				
		createDefaultAttribute("twist",character.id,0);
		createDefaultAttribute("sniper",character.id,0);
			
			var text,
				DType_Error = "";
			switch (checkMoveDType){
				case 'physical':
					attribute_Error += checkAttributes("ATK_total",character.id)+
					checkAttributes("Move"+moveNo+"_DB",character.id);
					if (attribute_Error !== ""){
						break;
					}
					text = "%{"+CharName+"|Move"+moveNo+"AtkPhys}";
					break;
			
				case 'special':
					attribute_Error += checkAttributes("SPATK_total",character.id)+
					checkAttributes("Move"+moveNo+"_DB",character.id);
					if (attribute_Error !== ""){
						break;
					}
					text = "%{"+CharName+"|Move"+moveNo+"AtkSpec}";
					break;

				case 'status':
				case 'other':
					if (attribute_Error !== ""){
						break;
					}
					text = "%{"+CharName+"|Move"+moveNo+"AtkStat}";
					break;
			
				default:
					if (attribute_Error !== "") {DType_Error = "<br></br>Also ";}
					if (attribute_Error == "") {DType_Error = "";}
					DType_Error += "**Move"+moveNo+"** Doesn't have valid damage type. Please set to **Physical**, **Special**, **Status** or **Other**.";
					break;
			}
			if (text !== undefined) {
            var whochar = 'character|' + character.id;
			sendChat(whochar,text);
			}
		if (attribute_Error !== ""){
			sendChat("PTUMove", "/w "+who+" Character **"+CharName+"** Doesn't have attributes "+attribute_Error+" Please add the attributes. "+DType_Error );
		}
		if (attribute_Error == "" && DType_Error !== "") {sendChat("PTUMove", "/w "+who+" "+DType_Error);}
	},
    
	createAbility = function(abilityName,abilityPattern,character,characterName,updateMsg){ // Credit to Kevin for this Function. Creates the ability on the character sheet.
        var checkAbility = findObjs({_type: 'ability', _characterid: character.id, name: abilityName});
            
        if (checkAbility[0]) {
            checkAbility[0].set({action: abilityPattern});
        } else {
            createObj("ability", {name: abilityName, action: abilityPattern, characterid: character.id, istokenaction: showAsTokenAction});
        }
        updateMsg.push(abilityName);
    },
    
    deleteAbilities = function(character, updateMsg) { // Credit to Kevin for this Function too. Deletes Abilities.
        var abilities = findObjs({_type: 'ability', _characterid: character.id});
        
        _.each(abilities,function(obj){
            obj.remove();
        });
        updateMsg.push('deleted');
    },
	
    handleInput = function(msg) { //Handles the input.
        var args,token,character,characterName,
            updateMsg = [];

        if (msg.type !== "api") {
            return;
        }
		args = msg.content.split(/\s+/);
        
        switch(args[0]) {
			case '!PTUMove': 
				args = msg.content.split(/\s+--/);
				var who=getObj('player',msg.playerid).get('_displayname');
                if (!(msg.selected && msg.selected.length)) {
                    sendChat("PTUMove", "/w " + who + " No token selected" );
                    return;
                }
                
                token = getObj('graphic', msg.selected[0]._id);
                if (!token.get('represents')) {
                    sendChat("PTUMove", "/w " + who + " Token does not represent a character");
                    return;
                }
                
				character = getObj('character', token.get('represents'));
                
                if (!args.length){
                    args = "default";
                }

					switch(args[1]) {
                    case '1':
						move(1,character,who);
                        break;
                        
                    case '2':
                        move(2,character,who);
                        break;
						
                    case '3':
                        move(3,character,who);
                        break;
						
                    case '4':
                        move(4,character,who);
                        break;
							
                    case '5':
                        move(5,character,who);
                        break;
							
                    case '6':
                        move(6,character,who);
                        break;						
					
					case 'table':
						moveTable(character,who);
						break;
					
                    default:
                        sendChat("PTUMove", "/w " + who + "Syntax:  '!PTUMove --option' where options are 1,2,3,4,5,6 or table");
						break;
                    }
               break;
			   
			   //New case
			case '!ptuta':
			case '!PTUta':
                if (!(msg.selected && msg.selected.length)) {
                    sendChat("TokenAction", "/w " + msg.who + " No token selected");
                    return;
                }
                
                token = getObj('graphic', msg.selected[0]._id);
                if (!token.get('represents')) {
                    sendChat("TokenAction", "/w " + msg.who + " Token does not represent a character");
                    return;
                }
                
                
                character = getObj('character', token.get('represents'));
                characterName = character.get('name');
                
                if (!args.length){
                    args = "default";
                }
                
                args = args[0].split(/[\s,]+/);
				args = msg.content.split(/\s+--/);
                
                _.each(args,function(arg) {
                    switch(arg) {
                        case 'DELETE':
                            deleteAbilities(character, updateMsg);
                            break;
                        
                        case 'initiative':
						case 'speed':
                            createAbility('Spd', "**@{selected|token_name}** has [[@{selected|SPEED_Total}+&{tracker}]] speed.", character, characterName, updateMsg);
                            break;
						
						case 'move':
						case 'moves':
                            createAbility('M1', "!PTUMove --1", character, characterName, updateMsg);
							createAbility('M2', "!PTUMove --2", character, characterName, updateMsg);
							createAbility('M3', "!PTUMove --3", character, characterName, updateMsg);
							createAbility('M4', "!PTUMove --4", character, characterName, updateMsg);
							createAbility('M5', "!PTUMove --5", character, characterName, updateMsg);
							createAbility('M6', "!PTUMove --6", character, characterName, updateMsg);
                            break;
							
						case 'movestable':
						case 'mtable':
							createAbility('MTable', "!PTUMove --table",character, characterName, updateMsg);
							break;
						
                        default:
                            sendChat("TokenAction", "/w " + msg.who + "Syntax:  '!ptuta --option' where options are DELETE, speed, moves, mtable, ");
                    }
                });
                
                if (updateMsg[0] === 'deleted') {
                    sendChat("TokenAction", "/w " + msg.who + " Deleted all Token Actions for " + characterName);
                    return;
                }
                
                if (updateMsg.length) {
                    sendChat("TokenAction", "/w " + msg.who + " Created/Updated Token Actions for " + characterName + ": " + updateMsg);
                } else {
                    sendChat("TokenAction", "/w " + msg.who + "Either an incorrect option was specified or there are no token actions to create for the specified option(s)");
                }
                break;
        }
	},

    registerEventHandlers = function() {
        on('chat:message', handleInput);
    };

    return {
        CheckInstall: checkInstall,
        RegisterEventHandlers: registerEventHandlers
    };
}());

on('ready',function() {
    'use strict';
    PTUtokenAction.CheckInstall();
    PTUtokenAction.RegisterEventHandlers();
});
