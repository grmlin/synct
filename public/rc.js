(function () {
    // The Load button
    var LoadButton = function () {
        var _this = this;
        this._layer = document.createElement("div");
        this._button = document.createElement("button");
        this._loading = document.createElement("p");
        this._notice = document.createElement("p");

        this.onClick = function () {
        };

        // Layer
        this._layer.style.position = "fixed";
        this._layer.style.top = 0;
        this._layer.style.left = 0;
        this._layer.style.right = 0;
        this._layer.style.bottom = 0;
        this._layer.style.backgroundColor = "rgba(255,255,255,0.9)";
        this._layer.style.zIndex = 9999;
        this._layer.style.minHeight = "300px";
        this._layer.style.paddingTop = "100px";
        this._layer.style.textAlign = "center";
        this._layer.style.display = "none";

        // Button
        this._button.style.border = "2px solid #333";
        this._button.style.backgroundColor = "#fff";
        this._button.style.fontSize = "24px";
        this._button.style.lineHeight = "30px";
        this._button.style.padding = "4px 6px";
        this._button.style.display = "none";

        // Loading info
        this._loading.style.display = "none";

        // Notice text
        this._notice.style.display = "none";


        this._layer.appendChild(this._loading);
        this._layer.appendChild(this._notice);
        this._layer.appendChild(this._button);
        document.body.appendChild(this._layer);

        this._button.innerHTML = "Open remote browser in new window";
        this._loading.innerHTML = "loading <strong>synct!</strong>...";
        this._notice.innerHTML = '<a href="http://synct.meteor.com" style="display: block;text-decoration: underline;font-size: 30px;">synct!</a><br>connection successful!<br>';

        this._button.addEventListener("click", function () {
            _this.onClick.call(_this);
        })
    };
    LoadButton.prototype = {
        show : function (isLoading) {
            this._layer.style.display = "block";
            this._loading.style.display = isLoading ? "block" : "none";
            this._notice.style.display = isLoading ? "none" : "block";
            this._button.style.display = isLoading ? "none" : "inline";
        }
    };


    // The control frame

    var ControlFrame = function (src, remoteWindow) {
        var _this = this;

        this._currentUrl = "about:blank";
        this.onLoad = function () {
        };
        this.onUrlChange = function () {
        };
        this._frame = document.createElement('iframe');

        this._frame.setAttribute('src', src);
        this._frame.setAttribute('width', "0");
        this._frame.setAttribute('height', "0");
        this._frame.setAttribute('frameborder', false);
        document.body.appendChild(this._frame);

        window.addEventListener("message", function (evt) {
            if (evt.source === _this._frame.contentWindow) {
                _this._onRcMessage(evt);
            }
        }, false);

        this._initHeartbeat();
    };

    ControlFrame.prototype = {
        _initHeartbeat : function () {
            var _this = this;
            window.setInterval(function () {
                _this._onHeartBeat();
            }, 5000);
            _this._onHeartBeat();
        },
        _onHeartBeat : function () {
            this._frame.contentWindow.postMessage(JSON.stringify({
                type : "SYNCT:ALIVE"
            }), "*");
        },
        _getRemoteWindow : function () {
            return this._remoteWindow === null ? (this._remoteWindow = new RemoteWindow()) : this._remoteWindow;
        },
        _onRcMessage : function (evt) {
            var data = JSON.parse(evt.data);
            switch (data.type) {
            case "SYNCT:ONLOAD":
                this.onLoad();
                break;
            case "SYNCT:ONCHANGE":
                this.onUrlChange(data.url);
                break;
            default:
                break;
            }
        }
    };

    // Remote window


    var RemoteWindow = function () {
        this._currentUrl = "about:blank";
        this._rcWindow = null;
    };

    RemoteWindow.prototype = {
        open : function () {
            if (this._rcWindow === null) {
                try {
                    this._rcWindow = window.open(this._currentUrl, "_blank");
                    this._rcWindow.focus();
                } catch (e) {
                    alert("Oh, an error occured creating the remote window :(\n\n The browser says:\n " + e.message)
                }
            }
        },
        close : function () {
            if (this._rcWindow !== null) {
                this._rcWindow.close();
                this._rcWindow = null;
            }
        },
        update : function (url) {
            if (url !== this._currentUrl) {
                this._currentUrl = url;
                if (this._rcWindow !== null) {
                    this._rcWindow.location = this._currentUrl;
                    this._rcWindow.focus();
                }
            }
        },
        isOpen : function () {
            return this._rcWindow !== null;
        }
    };


    // Notification
    var Notifier = function () {
        this._latest = null;
    };

    Notifier.LOGO = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAB4AAAAeCAYAAAA7MK6iAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAbNJREFUeNrEl8ttwzAMhp2gA7gbZARngjqXXtPcepQncDxB0QnSTmD31luaay9OJ6hHyAbVBi0dkIBAWC+bSQkQ8Uv6RIn8pSTJP9lsagf3j+oHL1ef700X2m4uMPgUvYVBZNcEmwPYAzy9Nri3BUbuhd9Y1q1vmIPfgdP0ZRiVz/rvduBFcHIhcAteBkJcVkCyNd6pxsT4Bn8SgCYYtXuqEdoKAaOyur4AtHKCIVplJJCUNa71pakubY3B36CDo0e5ftmjjqKFdwvMmxQHU5jgLDYjHXZC6dRGXdMSKhiIhneVTUCakdAetjGgFL15vwV4bgMfRgD10CaBg+BBlDbl0jFU6PzW88kBRYnsgcAfdIO2Bj8OJBHVegiMbx6DdfzKniku8kxgYut9PQjGcnlhI8yYfu/HCAxqhLIqF6Z4Y6zxyYC2WBYxwBy8RkVMBurcffTBxkpY1c4aMfNMUy0M7QC69J1AdsJQbR4OpI8+PintQsCVUJTP4EuuapLJpSlj8ferFyKm3e7DHos64zsYdDb5j8Dco8Nn8ae6vsTRxwffxG4eIgd6TIyVsQVOtj8BBgBMgpqJNE4fzwAAAABJRU5ErkJggg==";
    Notifier.prototype = {
        show : function (title, message) {
            if (window.webkitNotifications) {
                if (window.webkitNotifications.checkPermission() === 0) { // 0 is PERMISSION_ALLOWED
                    var n = window.webkitNotifications.createNotification(Notifier.LOGO, title, message);
                    n.show();
                    n.ondisplay = function () {
                        window.setTimeout(function () {
                            n.close();
                        }, 4000);
                    };

                    this.close();
                    this._latest = n;
                } else {
                    this.request();
                }
            }
        },
        close : function () {
            if (this._latest !== null) {
                this._latest.close();
            }
        },
        request : function () {
            window.webkitNotifications.requestPermission();
        }
    };

    // Heartbeat
    var Heartbeat = function () {

    };
    Heartbeat.prototype = {
        start : function () {
            window.setInterval(function () {

            }, 5000);
        }
    };

    // APP

    var getParam = function (url, name) {
        name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
        var regexS = "[\\?&]" + name + "=([^&#]*)";
        var regex = new RegExp(regexS);
        var results = regex.exec(url);
        if (results == null)
            return "";
        else
            return results[1];
    };

    var getDomain = function (src) {
        var a = document.createElement('a');
        a.href = src;
        return a.protocol + "//" + a.host
    };

    var scripts = document.getElementsByTagName('script'),
        currentScript = scripts[scripts.length - 1];


    if (confirm("Hi there. This page is powered by synct!. Do you want to load the remote controller?\n\nsynct.meteor.com")) {
        var control = new ControlFrame(getDomain(currentScript.src) + "/remote/" + getParam(currentScript.src, "remote")),
            rcWin = new RemoteWindow(),
            btn = new LoadButton(),
            notifier = new Notifier();

        btn.show(true);

        control.onLoad = function () {
            btn.show(false);
            btn.onClick = function () {
                rcWin.open();
                notifier.request();
            };
        };
        control.onUrlChange = function (url) {
            rcWin.update(url);
            if (rcWin.isOpen()) {
                notifier.show('synct! loading', url);
            }
        };

        window.addEventListener('beforeunload', function () {
            rcWin.close();
            notifier.close();
        }, false);

    }
}());