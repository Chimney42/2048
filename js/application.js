// Wait till the browser is ready to render the game (avoids glitches)
let gameManager;
window.requestAnimationFrame(function () {
    gameManager = new GameManager(4, KeyboardInputManager, HTMLActuator, LocalStorageManager);
});
