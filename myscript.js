var isStrict=false;

//this can be changed via the tumbler
var isOn=false;

//this can be changed via start button
var hasStarted=false;

//here we will store the sequence of button/melodies
var sequence=[];

//key - button id, value - Howl object to play sound according to the button
var btnData={"button-tl":new Howl({urls: ["http://s3.amazonaws.com/freecodecamp/simonSound1.mp3"]}),
			 "button-tr":new Howl({urls: ["http://s3.amazonaws.com/freecodecamp/simonSound2.mp3"]}),
			 "button-br":new Howl({urls: ["http://s3.amazonaws.com/freecodecamp/simonSound3.mp3"]}),
			 "button-bl":new Howl({urls: ["http://s3.amazonaws.com/freecodecamp/simonSound4.mp3"]})};
//sound to play on error			 
var errorSound=new Howl({urls:["http://raw.githubusercontent.com/kurumkan/Test/master/error.mp3"]});
//sound to play on victory
var winSound=new Howl({urls:["http://raw.githubusercontent.com/kurumkan/Test/master/success.mp3"]});
//current level
var level=0;
//user input (in range 0-3 inclusive)
var input=-1;

$(document).ready(function(){	

	//event listener of the 4 buttons
	$("#board").on("mousedown",".clickable",function(event){
		//only if start button has been pressed
		//hasStarted sets true
		if(hasStarted){
			var id=event.target.id;		

			switch(id){
				case "button-tl":
					input=0;
					break;
				case "button-tr":
					input=1;
					break;
				case "button-br":
					input=2;
					break;
				case "button-bl":
					input=3;
					break;				
			}		
		}	
	});

	$("#tumbler-box").click(function(){
		isOn=!isOn;
		$("#tumbler").toggleClass("on");
		if(!isOn){
			//turning off the game 
			$("#strict-ind").removeClass("ind-on");						
			isStrict=false;
			resetGame();
			display("");			
		}else{
			//turning on the game 
			display("--");
		}
	});

	$("#strict-btn").click(function(){
		//switching scrtict mode
		if(isOn){
			isStrict=!isStrict;
			$("#strict-ind").toggleClass("ind-on");
		}
	});

	$("#start-btn").click(function(){
		//start the game
		if(isOn){						
			startGame();
		}
	});
});

//this function to reset the game, but not to start
function resetGame(){		
	hasStarted=false;
	input=-1;
	sequence=[];
	level=0;
	display("--");
	setTimeout(function(){
			$("#board div").removeClass("clickable");
		},500);	
}

//start the game
function startGame(){
	$("#board div").addClass("clickable");
	sequence=[];
	input=-1
	hasStarted=true;
	//adding the first entry to our sequence
	addRandomNumber();	
	//starting iteration through the sequence
	iterateThrough();			
	level=1;
	display(level);
}

//display data
function display(data){
	if(data===""){
		$("#display").text("");
	}else{
		//display 2 characters string prepending 0-s if needed
		data="00"+data;
		data=data.substring(data.length-2);
		$("#display").text(data);		
		//"blinking" effect		
		setTimeout(function(){
			$("#display").css("color","#ccc");
		},300);
		setTimeout(function(){
			$("#display").css("color","#2ECC40");
		},600);
		
	}	
}

//adding random number in range 0-3 inclusive
function addRandomNumber(){		
	var index=Math.floor(Math.random() * 4);
	sequence.push(index);	
}

function iterateThrough(){
	
	if(hasStarted){		
		//make the buttons unclickable while playing the sequence
		$("#board div").removeClass("clickable");				
		playSequence(0);	
		//after playing the sequence - wait user input
		checkInput(0);
	}	
}

//play the sequence. Make the buttons clickable
function playSequence(i){
	if(i>=sequence.length||!hasStarted){
		$("#board div").addClass("clickable");
		return;			
	}			
	playTune(sequence[i]);
	setTimeout(function(){playSequence(i+1)},800);
}

//play single melody from the sequence
function playTune(index){
	var id=null;	
	switch(index){
		case 0:
			id="button-tl";
			break;
		case 1:
			id="button-tr";
			break;
		case 2:
			id="button-br";
			break;
		case 3:
			id="button-bl";
			break;
	}
	btnData[id].play();	
	//making effect of pressed button
	$("#"+id).addClass("clickeffect");
	setTimeout(function(){
		$("#"+id).removeClass("clickeffect");
	}, 400);		
}

//run this in case of victory
function celebrate(){
	setTimeout(function(){
		winSound.play();
	}, 500);		

	resetGame();
	display("**");			 
	$("#board div").addClass("clickeffect");
	setTimeout(function(){
		$("#board div").removeClass("clickeffect");
	}, 3000);		
}

//get user input and compare it to the according sequence entry
function checkInput(i){	
	if(hasStarted){		
		//if all the sequence has been reproduced without mistakes 
		if(i>=sequence.length){		
			level++;			
			//after passing level 20 - you are a winner!
			if(level>20){
				celebrate();
				return;
			}			
			display(level);			
			//append new entry to the sequence
			addRandomNumber();
			$("#board div").removeClass("clickable");
			//play the sequence again(including the new entry)
			setTimeout(function(){iterateThrough();},1500);					
			return true;
		}
		//waiting user input
		if(input===undefined||input<0){		
			setTimeout(function(){checkInput(i)}, 100);
		}else{//got input

			var temp=input;
			input=-1;

			//the input was wrong
			if(temp!==sequence[i]){	
				
				display("!!");			
				errorSound.play();

				$("#board div").removeClass("clickable");
				setTimeout(function(){
					display(level);
					$("#board div").addClass("clickable");
				},1500);
				//restart the game in case of strict mode	
				if(isStrict)
					setTimeout(function(){startGame();},1500);			
				//if normal mode - repeat the sequence(without adding new entry) 
				else			
					setTimeout(function(){iterateThrough();},1500);			
				return false;
			}	
			//correct input
			else{
				//play according sound
				playTune(temp);		
				//get the next user input
				setTimeout(function(){checkInput(i+1)},100);			
			}
		}		
	}	
}

