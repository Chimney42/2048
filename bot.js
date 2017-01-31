var GameManager = require('./js/game_manager.js');
var LocalStorage = require('node-localstorage').LocalStorage;
var LocalStorageManager = require('./js/local_storage_manager.js');
var FakeInputManager = require('./js/fake_input_manager');


var localStorage = new LocalStorageManager(new LocalStorage('./scratch'));
var inputManager = new FakeInputManager();
var game = new GameManager(4, inputManager, {}, localStorage);

console.log(game.serialize());

