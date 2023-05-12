let deck_id;
let players;
let canvas;
let ctx;
let currPlayer = 0;
let timeForNextTurn = false;
let eightSuit;
let eightPlay = false;
let gameOver = false;
let stockEmpty = false;
document.addEventListener('DOMContentLoaded', () => {
    
    let btn = document.getElementById('submit');
    canvas = document.getElementById('game');
    ctx = canvas.getContext('2d');
    let nextTur = document.getElementById('nextTurn');
    let drawCard = document.getElementById('drawCard');
       
    btn.addEventListener('click', (evt) => {
        players = document.getElementById('numOfPlayers').value;
        if(players < 2 || players > 5){
            alert("You can only play with between 2 to 5 players.");
        }
        else{
            ctx.clearRect(0,0,1900,800);
            currPlayer = 1;
            fetchDeck(ctx);
            ctx.font = "30px Helvetica";
            ctx.fillStyle = "black";
            ctx.fillText("Player 1's Turn", 10, 30);
            ctx.fillText("Player 1's Deck", 10, 530)
            ctx.globalAlpha=1.0;
            eightPlay = false;
            gameOver = false;
            timeForNextTurn = false;
            stockEmpty = false;
        }
    });
    canvas.addEventListener("mousedown", (evt) =>{
        if(gameOver){
            alert("Player " + currPlayer + " has won the game! Click the start game button to play again.");
        }
        else{
            let rect = canvas.getBoundingClientRect();
            let x = evt.clientX - rect.left;
            let y = evt.clientY - rect.top;
            console.log("Coordinate x: " + x, 
                        "Coordinate y: " + y);
            if(timeForNextTurn && !eightPlay){
                alert("You may not make any more moves, please click the next turn button when you are ready.")
            }
            
            else if(timeForNextTurn && eightPlay){
                if(x >= 1320 && y >= 200 && x <= 1320+170 && y <= 200+100){
                    eightSuit = "HEARTS";
                }
                else if(x >= 1510 && y >= 200 && x <= 1510+170 && y <= 200+100){
                    eightSuit = "DIAMONDS";
                }
                else if(x >= 1320 && y >= 320 && x <= 1320+170 && y <= 320+100){
                    eightSuit = "SPADES";
                }
                else if(x >= 1510 && y >= 320 && x <= 1510+170 && y <= 320+100){
                    eightSuit = "CLUBS";
                }
                if(eightSuit == "HEARTS" || eightSuit == "DIAMONDS"){
                    ctx.fillStyle = "red";
                }
                else{
                    ctx.fillStyle = "black";
                }
                ctx.font = "30px Helvetica";
                ctx.fillText("Current suit: " + eightSuit.charAt(0).toUpperCase() + eightSuit.slice(1).toLowerCase(), 830, 280); 
                ctx.clearRect(1300, 120, 400, 320);
                eightCheck(ctx);
            }
            else{
                checkCards(ctx, x, y);
            }
        }
        
        
        
    });
    drawCard.addEventListener('click', (evt) => {
        if(gameOver){
            alert("Player " + currPlayer + " has won the game! Click the start game button to play again.");
        }
        else{
            if(timeForNextTurn && !eightPlay){
                alert("You may not make any more moves, please click the next turn button when you are ready.");
            }
            else if(timeForNextTurn && eightPlay){
                alert("You may not make any more moves, but you still need to pick the suit of your eight card.");
            }
            else if(stockEmpty){
                alert("The stock pile is empty, there are no more cards to draw.");
            }
            else{
                drawC(ctx);
            }
        }

    });
    nextTur.addEventListener('click', (evt) => {
        if(gameOver){
            alert("Player " + currPlayer + " has won the game! Click the start game button to play again.");
        }
        else{
            if(!timeForNextTurn && !stockEmpty){
                alert("You have not completed your turn yet, please play a valid card or draw a card from the stock until you have a playable card.")
            }
            else if(eightPlay){
                alert("You still need to pick the suit of your eight card.")
            }
            else{
                ctx.clearRect(0,0,1900,70);
                ctx.clearRect(0,500,1900,250);
                if(currPlayer == players){
                    currPlayer = 1;
                }
                else{
                    currPlayer += 1;
                }
                ctx.font = "30px Helvetica";
                ctx.fillStyle = "black";
                ctx.fillText("Player "+ currPlayer + "\'s Turn", 10, 30);
                ctx.fillText("Player "+ currPlayer + "\'s Deck", 10, 530);
                nextTurn(ctx);
            }
        }
    });
});
//113 x 157
async function fetchDeck(ctx) {
    let response = await fetch('https://www.deckofcardsapi.com/api/deck/new/shuffle/?deck_count=1');
    let data = await response.json();
    deck_id=data["deck_id"];
    console.log(deck_id);
    let firstLength = 0;
    let firstCards = "";
    for(let i = 1; i <= players; i++){
        response = await fetch('https://www.deckofcardsapi.com/api/deck/'+deck_id+'/draw/?count=5');
        data = await response.json();
        let cards = data['cards'];
        if(i == 1){
            firstLength = cards.length;
            firstCards = cards;
            console.log(firstCards);
        }
        let fetchStr = 'https://www.deckofcardsapi.com/api/deck/'+deck_id+'/pile/'+i+'/add/?cards=';
        for(let j = 0; j < cards.length-1; j++){
            fetchStr += cards[j]['code'] + ",";
        }
        fetchStr += cards[cards.length-1]['code'];
        response = await fetch(fetchStr);
        data = await response.json();
        console.log(data);
    }
    for(let i = 0; i < firstLength; i++){
        const cardImg = new Image();
        //console.log(firstCards[i]['image']);    
        cardImg.src = firstCards[i]['image'];
        cardImg.addEventListener("load", () => {
            ctx.drawImage(cardImg, 10+i*125, 550, 113, 157);
            //console.log(cardImg.width + " " + cardImg.height);
          },
        );
    }

    let drawCount = 51-5*players;
    response = await fetch('https://www.deckofcardsapi.com/api/deck/'+deck_id+'/draw/?count='+drawCount);
    data = await response.json();
    let cards = data['cards'];

    let stock = 'https://www.deckofcardsapi.com/api/deck/'+deck_id+'/pile/stock/add/?cards=';
    for(let i = 0; i < drawCount-1; i++){
        stock += cards[i]['code'] + ",";
    }
    stock += cards[cards.length-1]['code'];
    response = await fetch(stock);
    data = await response.json();
    console.log(data);

    response = await fetch('https://www.deckofcardsapi.com/api/deck/'+deck_id+'/draw/?count=1');
    data = await response.json();
    response = await fetch('https://deckofcardsapi.com/api/deck/'+deck_id+'/pile/discard/add/?cards='+data['cards'][0]['code']);
    data = await response.json();
    console.log(data);

    response = await fetch('https://deckofcardsapi.com/api/deck/'+deck_id+'/pile/discard/list');
    data = await response.json();
    let topCard = new Image();   
    topCard.src = data['piles']['discard']['cards'][0]['image'];
    topCard.addEventListener("load", () => {
        ctx.drawImage(topCard, 700, 200, 113, 157);
      },
    );

    //check first player's cards
    response = await fetch('https://deckofcardsapi.com/api/deck/'+deck_id+'/pile/'+currPlayer+'/list/');
    data = await response.json();
    cards = data['piles'][currPlayer]['cards'];
    console.log(cards);
    response = await fetch('https://deckofcardsapi.com/api/deck/'+deck_id+'/pile/discard/list');
    data = await response.json();
    let topCardValue = data['piles']['discard']['cards'][data['piles']['discard']['cards'].length-1]['value'];
    let topCardSuit = data['piles']['discard']['cards'][data['piles']['discard']['cards'].length-1]['suit'];
    for(let i = 0; i < cards.length; i++){
        if(cards[i]['value'] == topCardValue || cards[i]['suit'] == topCardSuit){
            ctx.strokeStyle = 'yellow';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.roundRect(10+i*125, 550, 113, 157, 8);
            ctx.stroke();
        }
    }
}
async function checkCards(ctx, x, y) {    
    let validCards = [];
    let response = await fetch('https://deckofcardsapi.com/api/deck/'+deck_id+'/pile/'+currPlayer+'/list/');
    let data = await response.json();
    //console.log(data);
    let cards = data['piles'][currPlayer]['cards'];
    console.log(cards);
    response = await fetch('https://deckofcardsapi.com/api/deck/'+deck_id+'/pile/discard/list');
    data = await response.json();
    console.log(data);
    let topCardValue = data['piles']['discard']['cards'][data['piles']['discard']['cards'].length-1]['value'];
    let topCardSuit = data['piles']['discard']['cards'][data['piles']['discard']['cards'].length-1]['suit'];
    if(eightSuit != undefined && topCardValue == "8"){
        topCardSuit = eightSuit;
    }
    
    for(let i = 0; i < cards.length; i++){
        if(cards[i]['value'] == topCardValue || cards[i]['suit'] == topCardSuit){
            ctx.strokeStyle = 'yellow';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.roundRect(10+i*125, 550, 113, 157, 8);
            ctx.stroke();
            validCards.push(10+i*125);
        }
        else{
            validCards.push(-200);
        }
    }
    let clickedOnValid = false;
    console.log(validCards.length);
    let pickedCard = -1;
    let pickedCode = -1;
    for(let i = 0; i < validCards.length; i++){
        console.log(validCards[i] + " " + parseInt(validCards[i]+113) + " " + 550 + " " + parseInt(550+157));
        if(x >= validCards[i] && x <= validCards[i]+113 && y >= 550 && y <= 550+157){
            console.log(i);
            //discard(i , ctx);
            pickedCard = i;
            pickedCode = cards[pickedCard]['code'];
            clickedOnValid = true;
            ctx.clearRect(validCards[i]-1, 549, 115, 159);
            ctx.font = "20px Helvetica";
            ctx.fillStyle = "orange";
            ctx.fillText("Turn complete, please click the next turn button when you are ready.", 1280, 25);
            timeForNextTurn = true;
            break;
        }
    }
    if(clickedOnValid == false && !stockEmpty){
        alert("Please choose a playable card or draw from the stock pile.");
    }
    else if(clickedOnValid == false && stockEmpty){
        alert("You cannot make any moves, your turn will be lost. Please click next turn when you are ready.");
    }
    console.log("test");
    if(clickedOnValid){
        response = await fetch('https://www.deckofcardsapi.com/api/deck/'+deck_id+'/pile/'+currPlayer+'/draw/?cards='+pickedCode);
        data = await response.json();
        response = await fetch('https://www.deckofcardsapi.com/api/deck/'+deck_id+'/pile/discard/add/?cards='+pickedCode);
        data = await response.json();
        response = await fetch('https://www.deckofcardsapi.com/api/deck/'+deck_id+'/pile/discard/list');
        data = await response.json();
        console.log(data);
        ctx.clearRect(700, 200, 700, 157);
        let topCard = new Image();
        topCard.src = data['piles']['discard']['cards'][data['piles']['discard']['cards'].length-1]['image'];
        topCard.addEventListener("load", () => {
            ctx.drawImage(topCard, 700, 200, 113, 157);
          },
        );
        response = await fetch('https://deckofcardsapi.com/api/deck/'+deck_id+'/pile/'+currPlayer+'/list/');
        data = await response.json();
        if(data['piles'][currPlayer]['remaining'] == "0"){
            alert("Congratulations, Player " + currPlayer + " has won the game! Click the start game button to play again.");
            gameOver = true;
        }

        cards = data['piles'][currPlayer]['cards'];
        ctx.clearRect(0,540,1900,210);
        
        response = await fetch('https://deckofcardsapi.com/api/deck/'+deck_id+'/pile/discard/list');
        data = await response.json();
        let topCardValue = data['piles']['discard']['cards'][data['piles']['discard']['cards'].length-1]['value'];
        let topCardSuit = data['piles']['discard']['cards'][data['piles']['discard']['cards'].length-1]['suit'];
        console.log(topCardValue);
        console.log(topCardSuit);
        if(eightSuit != undefined && topCardValue == "8"){
            topCardSuit = eightSuit;
        }
        for(let i = 0; i < cards.length; i++){
            const cardImg = new Image();
            cardImg.src = cards[i]['image'];
            cardImg.addEventListener("load", () => {
                ctx.drawImage(cardImg, 10+i*125, 550, 113, 157);
                if(cards[i]['value'] == topCardValue || cards[i]['suit'] == topCardSuit){
                    ctx.strokeStyle = 'orange';
                    ctx.lineWidth = 2;
                    ctx.beginPath();
                    ctx.roundRect(10+i*125, 550, 113, 157, 8);
                    ctx.stroke();
                }
                //console.log(cardImg.width + " " + cardImg.height);
              },
            );
          
        }
    }
    if(pickedCode.includes("8")){
        ctx.fillStyle = "black";
        ctx.fillRect(1300, 120, 400, 320);
        ctx.clearRect(1320, 200, 170, 100);
        ctx.clearRect(1510, 200, 170, 100);
        ctx.clearRect(1320, 320, 170, 100);
        ctx.clearRect(1510, 320, 170, 100);
        ctx.font = "60px Helvetica";
        ctx.fillStyle = "white";
        ctx.fillText("Pick a suit", 1355, 180);
        ctx.fillStyle = "red";
        ctx.font = "35px Helvetica";
        ctx.fillText("Hearts", 1345, 260);
        ctx.fillText("Diamonds", 1515 , 260);
        ctx.fillStyle = "black";
        ctx.fillText("Spades", 1345, 380);
        ctx.fillText("Clubs", 1545 , 380);
        eightPlay = true;
    }

}

async function nextTurn(ctx){
    let response = await fetch('https://deckofcardsapi.com/api/deck/'+deck_id+'/pile/'+currPlayer+'/list/');
    let data = await response.json();
    let cards = data['piles'][currPlayer]['cards'];

    response = await fetch('https://deckofcardsapi.com/api/deck/'+deck_id+'/pile/discard/list');
    data = await response.json();
    let topCardValue = data['piles']['discard']['cards'][data['piles']['discard']['cards'].length-1]['value'];
    let topCardSuit = data['piles']['discard']['cards'][data['piles']['discard']['cards'].length-1]['suit'];
    console.log(topCardValue);
    console.log(topCardSuit);
    if(eightSuit != undefined && topCardValue == "8"){
        topCardSuit = eightSuit;
    }
    for(let i = 0; i < cards.length; i++){
        const cardImg = new Image();
        cardImg.src = cards[i]['image'];
        cardImg.addEventListener("load", () => {
            ctx.drawImage(cardImg, 10+i*125, 550, 113, 157);
            if(cards[i]['value'] == topCardValue || cards[i]['suit'] == topCardSuit){
                ctx.strokeStyle = 'yellow';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.roundRect(10+i*125, 550, 113, 157, 8);
                ctx.stroke();
            }
            //console.log(cardImg.width + " " + cardImg.height);
          },
        );
        
    }
    


    timeForNextTurn = false;
}

async function drawC(ctx){
    let response = await fetch('https://deckofcardsapi.com/api/deck/'+deck_id+'/pile/stock/list/');
    let data = await response.json();
    //console.log(data);
    response = await fetch('https://www.deckofcardsapi.com/api/deck/'+deck_id+'/pile/stock/draw/?count=1');
    data = await response.json();
    response = await fetch('https://www.deckofcardsapi.com/api/deck/'+deck_id+'/pile/'+currPlayer+'/add/?cards='+data['cards'][0]['code']);
    data = await response.json();
    response = await fetch('https://deckofcardsapi.com/api/deck/'+deck_id+'/pile/'+currPlayer+'/list/');
    data = await response.json();
    cards = data['piles'][currPlayer]['cards'];
    ctx.clearRect(0,540,1900,210);
    
    response = await fetch('https://deckofcardsapi.com/api/deck/'+deck_id+'/pile/discard/list');
    data = await response.json();
    let topCardValue = data['piles']['discard']['cards'][data['piles']['discard']['cards'].length-1]['value'];
    let topCardSuit = data['piles']['discard']['cards'][data['piles']['discard']['cards'].length-1]['suit'];
    console.log(topCardValue);
    console.log(topCardSuit);
    if(eightSuit != undefined && topCardValue == "8"){
        topCardSuit = eightSuit;
    }
    for(let i = 0; i < cards.length; i++){
        const cardImg = new Image();
        cardImg.src = cards[i]['image'];
        cardImg.addEventListener("load", () => {
            ctx.drawImage(cardImg, 10+i*125, 550, 113, 157);
            if(cards[i]['value'] == topCardValue || cards[i]['suit'] == topCardSuit){
                ctx.strokeStyle = 'yellow';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.roundRect(10+i*125, 550, 113, 157, 8);
                ctx.stroke();
            }
            //console.log(cardImg.width + " " + cardImg.height);
          },
        );
        
    }

    response = await fetch('https://deckofcardsapi.com/api/deck/'+deck_id+'/pile/stock/list');
    data = await response.json();
    if(data['piles']['stock']['remaining'] == "0"){
        console.log(data);
        alert("Stock pile empty");
        stockEmpty = true;
    }
    
}

async function eightCheck(ctx){
    let response = await fetch('https://deckofcardsapi.com/api/deck/'+deck_id+'/pile/'+currPlayer+'/list/');
    let data = await response.json();
    cards = data['piles'][currPlayer]['cards'];
    ctx.clearRect(0,540,1900,210);
    
    response = await fetch('https://deckofcardsapi.com/api/deck/'+deck_id+'/pile/discard/list');
    data = await response.json();
    let topCardValue = data['piles']['discard']['cards'][data['piles']['discard']['cards'].length-1]['value'];
    let topCardSuit = data['piles']['discard']['cards'][data['piles']['discard']['cards'].length-1]['suit'];
    console.log(topCardValue);
    console.log(topCardSuit);
    if(eightSuit != undefined && topCardValue == "8"){
        topCardSuit = eightSuit;
    }
    for(let i = 0; i < cards.length; i++){
        const cardImg = new Image();
        cardImg.src = cards[i]['image'];
        cardImg.addEventListener("load", () => {
            ctx.drawImage(cardImg, 10+i*125, 550, 113, 157);
            if(cards[i]['value'] == topCardValue || cards[i]['suit'] == topCardSuit){
                ctx.strokeStyle = 'orange';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.roundRect(10+i*125, 550, 113, 157, 8);
                ctx.stroke();
            }
            //console.log(cardImg.width + " " + cardImg.height);
          },
        );
        
    }
    eightPlay = false;
}
