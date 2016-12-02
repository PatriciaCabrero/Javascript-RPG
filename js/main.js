var battle = new RPG.Battle();
var actionForm, spellForm, targetForm;
var infoPanel;

function prettifyEffect(obj) {
    return Object.keys(obj).map(function (key) {
        var sign = obj[key] > 0 ? '+' : ''; // show + sign for positive effects
        return `${sign}${obj[key]} ${key}`;
    }).join(', ');
}


battle.setup({
    heroes: {
        members: [
            RPG.entities.characters.heroTank,
            RPG.entities.characters.heroWizard
        ],
        grimoire: [
            RPG.entities.scrolls.health,
            RPG.entities.scrolls.fireball
        ]
    },
    monsters: {
        members: [
            RPG.entities.characters.monsterSlime,
            RPG.entities.characters.monsterBat,
            RPG.entities.characters.monsterSkeleton,
            RPG.entities.characters.monsterBat
        ]
    }
});

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
    createPanel(choicesN,options);

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
        nodo.innerHTML += `<li id="${personaje}" class=dead> ✝ ${personaje} (HP: <strong>${personajes[personaje].hp}</strong> / ${personajes[personaje].maxHp}
        , MP: <strong>${personajes[personaje].mp}</strong> / ${personajes[personaje].maxMp})</li>`;

        }else{
            nodo.innerHTML += `<li id="${personaje}" class="${personajes[personaje].party}"> ${personaje} (HP: <strong>${personajes[personaje].hp}</strong> / ${personajes[personaje].maxHp}
            , MP: <strong>${personajes[personaje].mp}</strong> / ${personajes[personaje].maxMp})</li>`;
        }
    };
};

function createPanel(nodo, opciones){
    nodo.innerHTML = "";
    for (var i = 0; i < opciones.length ; i++) {
        nodo.innerHTML += `<li><label><input type = "radio" name="option" value = "${opciones[i]}" required> ${opciones[i]}</label></li>`;
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
    var info = document.querySelector('#battle-info');

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
    info.innerHTML = `Battle is over! Winners were: <strong>${data.winner}</strong>` ;


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
            createPanel(nodo, battle.options.list());
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
            createPanel(nodo, battle.options.list());
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
        createPanel(nodo, battle.options.list());

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

        createPanel(nodo, battle.options.list());

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
        createPanel(nodo, battle.options.list());

    });

    battle.start();
};
