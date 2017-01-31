(function() {
    var FakeInputManager = function() {
        this.events = {};
        this.map = {
            'up' : 0,
            'right' : 1,
            'down' : 2,
            'left' : 3,
        };
    };

    FakeInputManager.prototype.on = function (event, callback) {
        if (!this.events[event]) {
            this.events[event] = [];
        }
        this.events[event].push(callback);
    };

    FakeInputManager.prototype.emit = function (event, data) {
        var callbacks = this.events[event];
        if (callbacks) {
            callbacks.forEach(function (callback) {
                callback(data);
            });
        }
    };

    FakeInputManager.prototype.move = function (direction) {
        self.emit("move", direction);
    };

    exports.FakeInputManager = FakeInputManager;
}).call(this);