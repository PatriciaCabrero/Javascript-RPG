var battle = new RPG.Battle();
var actionForm, spellForm, targetForm, reload;
var infoPanel;

function prettifyEffect(obj) {
    return Object.keys(obj).map(function (key) {
        var sign = obj[key] > 0 ? '+' : ''; // show + sign for positive effects
        return `${sign}${obj[key]} ${key}`;
    }).join(', ');
}


////RANDOM PARTY 

battle.setup(getRandomSetup());
function getRandomSetup() {
  var heroMembers = getHeroeParty();
  var monsterMembers = getMonsterParty();
  return {
    heroes: {
      members: heroMembers,
      grimoire: [RPG.entities.scrolls.health, RPG.entities.scrolls.fireball]
    },
    monsters: {
      members: monsterMembers
    }
  };
}

function getMonsterParty() {
  var partySize = Math.floor(Math.random() * 3) + 1;
  var members = [];
  for (var i = 0; i < partySize; i++) {
    members.push(getRandomMonster());
  }
  return members;
}
function getRandomMonster() {
  var monsters = Object.keys(RPG.entities.characters).filter(isMonster);
  var randomId = monsters[Math.floor(Math.random() * monsters.length)];
  return RPG.entities.characters[randomId];

  function isMonster(id) {
    return id.substr(0, 'monster'.length) === 'monster';
  }
}
function getHeroeParty() {
  var partySize = Math.floor(Math.random() * 3) + 1;
  var members = [];
  for (var i = 0; i < partySize; i++) {
    members.push(getRandomHeroe());
  }
  return members;
}
//Random heroe
function getRandomHeroe() {
  var heroes = Object.keys(RPG.entities.characters).filter(isHeroe);
  var randomId = heroes[Math.floor(Math.random() * heroes.length)];
  return RPG.entities.characters[randomId];

//Busca en el id si tiene hero al principio del nombre si es asi es un heroe
  function isHeroe(id) {
    return id.substr(0, 'hero'.length) === 'hero';
  }
}

////RANDOM PARTY FINAL/////////////////////




battle.on('start', function (data) {
    console.log('START', data);
});

battle.on('turn', function (data) {
    console.log('TURN', data);


    // TODO: render the characters
    var heroes = document.querySelector('#heroes');
    heroes = buscarNodoHijos(heroes, 'character-list');
    var heroesP = battle.characters.allFrom('heroes');
    crearPersonajesLista(heroes, heroesP);


    // TODO: render the characters
    var monsters = document.querySelector('#monsters');
    monsters = buscarNodoHijos(monsters, 'character-list');
    var monstersP = battle.characters.allFrom('monsters');
    crearPersonajesLista(monsters, monstersP);


    // TODO: highlight current character
    var highlight = document.getElementById(data.activeCharacterId);
    highlight.classList.add("active");

    // TODO: show battle actions form
    actionForm.style.display="block"; //Muestra el estilo del menu.
    var choicesN = actionForm.querySelector('.choices');
    var options = battle.options.list();
    createPanel(choicesN,options, false);

});

function buscarNodoHijos(nodo, nombre){
    var i=0;
    while(nodo.childNodes[i].className !== nombre){
        i++;
    };
    return nodo.childNodes[i];
};

function crearPersonajesLista(nodo, personajes){
    nodo.innerHTML = "";
    for(var personaje in personajes){

        if(personajes[personaje].hp<=0){
        nodo.innerHTML += `<li id="${personaje}" class=dead> ${personaje} (HP: <strong>${personajes[personaje].hp}</strong> / 
        ${personajes[personaje].maxHp}, MP: <strong>${personajes[personaje].mp}</strong> / ${personajes[personaje].maxMp})</li>`;

        }else{
            nodo.innerHTML += `<li id="${personaje}" class="${personajes[personaje].party}"> ${personaje} (HP: 
                <strong>${personajes[personaje].hp}</strong> / ${personajes[personaje].maxHp}
            , MP: <strong>${personajes[personaje].mp}</strong> / ${personajes[personaje].maxMp})</li>`;
        }
    };
};
//PanelTarget es true si es el panel target para pintar de diferentes colores
function createPanel(nodo, opciones, panelTarget){
    nodo.innerHTML = "";
    console.log(opciones);
    var clase = 'none';
    for (var i = 0; i < opciones.length ; i++) {
        if(panelTarget){ //si se trata de un panelTarget se cambia la clase y con ello el color
            //Se filtra en el nombre para saber si es tank o wizz
            if(opciones[i].substr(0, 'Tank'.length) === 'Tank' || opciones[i].substr(0, 'Wizz'.length) === 'Wizz'){
                clase = 'heroe';
            }
            else clase = 'monster';
        }
        nodo.innerHTML += `<li class = "${clase}" ><label><input type = "radio" name="option" value = "${opciones[i]}" required> ${opciones[i]}</label></li>`;
    };
};


battle.on('info', function (data) {
    console.log('INFO', data);
    var info = document.querySelector('#battle-info');
    var action;
    var efecto= '';

    // TODO: display turn info in the #battle-info panel
    if(data.action === 'cast'){
        action = 'casted ' + data.scrollName + ' on';
        efecto = '<strong>'+ data.targetId + '</strong> and caused '+ prettifyEffect(data.effect);
    }else if(data.action === 'attack'){
        action = 'attacked on';
        efecto = '<strong>'+ data.targetId + '</strong> and caused '+ prettifyEffect(data.effect);
    }else if(data.action === 'defend'){
        action = 'defended.';
        efecto = 'Now his defense is ' + data.newDefense + '.';
    }
    if(data.success){
        info.innerHTML = `<strong> ${data.activeCharacterId}</strong> ${action} ${efecto}`;
    }else{
        info.innerHTML = `<strong> ${data.activeCharacterId}</strong> ${action} <strong>${data.targetId}</strong> and failed` ;
    }

});

battle.on('end', function (data) {
    console.log('END', data);
    var reload = document.querySelector('.battle-menu');

    // TODO: re-render the parties so the death of the last character gets reflected
        // TODO: render the characters
    var heroes = document.querySelector('#heroes');
    heroes = buscarNodoHijos(heroes, 'character-list');
    var heroesP = battle.characters.allFrom('heroes');
    crearPersonajesLista(heroes, heroesP);


    // TODO: render the characters
    var monsters = document.querySelector('#monsters');
    monsters = buscarNodoHijos(monsters, 'character-list');
    var monstersP = battle.characters.allFrom('monsters');
    crearPersonajesLista(monsters, monstersP);

    // TODO: display 'end of battle' message, showing who won
    infoPanel.innerHTML = `Battle is over! Winners were: <strong>${data.winner}</strong>` ;

    //Creamos el boton
    reload.innerHTML += `<button id= "reload" type = "submit">Play Again!</button>`;
    
    //Nodo para el listener del reload
    reload = document.querySelector('#reload');

    //Listener del boton de recarga de la pagina 
    reload.addEventListener('click', function (evt){
        evt.preventDefault();
        window.location.reload();
    });

});

window.onload = function () {

    actionForm = document.querySelector('form[name=select-action]');
    targetForm = document.querySelector('form[name=select-target]');
    spellForm = document.querySelector('form[name=select-spell]');
    infoPanel = document.querySelector('#battle-info');
    var self = this; 

    actionForm.addEventListener('submit', function (evt) {
        evt.preventDefault();

        // TODO: select the action chosen by the player
        self.action= actionForm.elements['option'].value;
        battle.options.select(self.action);

        // TODO: hide this menu
        actionForm.style.display = "none";

        // TODO: go to either select target menu, or to the select spell menu
        if(self.action === 'attack'){
            targetForm.style.display = "block";
            var nodo = targetForm.querySelector('.choices');
            createPanel(nodo, battle.options.list(), true);
        }else if(self.action === 'cast'){
            spellForm.style.display = "block";
            var aux = battle.options.list();
            var boton = spellForm.querySelector('button[type=submit]');
            if(aux.length === 0){
                boton.disabled = true;
            }else{
                boton.disabled = false;
            }
            var nodo = spellForm.querySelector('.choices');
            createPanel(nodo, battle.options.list(), false);
        }
    });

    targetForm.addEventListener('submit', function (evt) {
        evt.preventDefault();
        // TODO: select the target chosen by the player
        var action = targetForm.elements['option'].value;
        battle.options.select(action);

        // TODO: hide this menu
        targetForm.style.display = "none";

    });

    targetForm.querySelector('.cancel')
    .addEventListener('click', function (evt) {
        evt.preventDefault();

        // TODO: cancel current battle options
        battle.options.cancel();

        // TODO: hide this form
        targetForm.style.display = "none";

        // TODO: go to select action menu
        actionForm.style.display = "block";
        var nodo = actionForm.querySelector('.choices');
        createPanel(nodo, battle.options.list(), false);

    });

    spellForm.addEventListener('submit', function (evt) {
        evt.preventDefault();


        // TODO: select the spell chosen by the player
        var action= spellForm.elements['option'].value;
        battle.options.select(action);

        // TODO: hide this menu
        spellForm.style.display = "none";

        // TODO: go to select target menu
        targetForm.style.display = "block";
        var nodo = targetForm.querySelector('.choices');

        createPanel(nodo, battle.options.list(), false);

    });

    spellForm.querySelector('.cancel')
    .addEventListener('click', function (evt) {
        evt.preventDefault();
        // TODO: cancel current battle options
        battle.options.cancel();

        // TODO: hide this form
        spellForm.style.display = "none";

        // TODO: go to select action menu
        actionForm.style.display = "block";
        var nodo = actionForm.querySelector('.choices');
        createPanel(nodo, battle.options.list(), false);

    });


    /*        <section><button id="reload" type= "submit" style = "display:none">Play again!</button></section>*/

    battle.start();
};
