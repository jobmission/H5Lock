(function () {
    if (!Function.prototype.bind) {
        console.log("browser does not support bind function");
        Function.prototype.bind = function (oThis) {
            if (typeof this !== "function") {
                // closest thing possible to the ECMAScript 5 internal IsCallable function
                throw new TypeError("Function.prototype.bind - what is trying to be bound is not callable");
            }

            var aArgs = Array.prototype.slice.call(arguments, 1),
                fToBind = this,
                fNOP = function () {
                },
                fBound = function () {
                    return fToBind.apply(this instanceof fNOP && oThis ? this : oThis || window,
                        aArgs.concat(Array.prototype.slice.call(arguments)));
                };

            fNOP.prototype = this.prototype;
            fBound.prototype = new fNOP();

            return fBound;
        };
    }
    //连接点不可重复
    window.H5lock = function (obj) {
        this.height = obj.height || 320;
        this.width = obj.width || 320;
        this.pathColor = obj.pathColor || '#27AED5';
        this.circleColor = obj.circleColor || '#777777';
        this.callBack = obj.callBack;
        this.rows = obj.rows || 3;
        this.canvasId = obj.canvasId || 'canvasId';
        this.devicePixelRatio = window.devicePixelRatio || 1;
    };
    // 初始化解锁密码面板 小圆圈
    H5lock.prototype.drawCircle = function (x, y, text) {
        this.ctx.strokeStyle = this.circleColor;//小圆圈默认的颜色
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.arc(x, y, this.r, 0, Math.PI * 2, true);
        this.ctx.closePath();
        this.ctx.stroke();
        if (text != null && text != '') {
            this.ctx.fillStyle = this.circleColor;
            this.ctx.font = this.r + "px sans-serif";
            this.ctx.fillText(text, x - (this.r / 2) + 3, y + (this.r / 3));//数字
        }
    }
    // 初始化圆心
    H5lock.prototype.drawPoint = function (style) {
        for (var i = 0; i < this.lastPoint.length; i++) {
            this.ctx.fillStyle = style;
            this.ctx.beginPath();
            this.ctx.arc(this.lastPoint[i].x, this.lastPoint[i].y, this.r / 1.5, 0, Math.PI * 2, true);
            this.ctx.closePath();
            this.ctx.fill();
        }
    }
    // 初始化状态线条
    H5lock.prototype.drawStatusPoint = function (type) {
        for (var i = 0; i < this.lastPoint.length; i++) {
            this.ctx.strokeStyle = type;
            this.ctx.beginPath();
            this.ctx.arc(this.lastPoint[i].x, this.lastPoint[i].y, this.r, 0, Math.PI * 2, true);
            this.ctx.closePath();
            this.ctx.stroke();
        }
    }
    //style:颜色 解锁轨迹
    H5lock.prototype.drawLine = function (style, po, lastPoint) {
        this.ctx.beginPath();
        this.ctx.strokeStyle = style;
        this.ctx.lineWidth = 3;
        if (lastPoint.length > 0) {
            this.ctx.moveTo(lastPoint[0].x, lastPoint[0].y);
            for (var i = 1; i < lastPoint.length; i++) {
                this.ctx.lineTo(lastPoint[i].x, lastPoint[i].y);
            }
        } else {
            console.log("lastPoint is empty.")
        }

        this.ctx.lineTo(po.x, po.y);
        this.ctx.stroke();
        this.ctx.closePath();

    }
    // 创建解锁点的坐标，根据canvas的大小来平均分配半径
    H5lock.prototype.createCircle = function () {
        var n = this.rows;
        var count = 0;
        this.r = this.ctx.canvas.width / (4 * n);// 公式计算
        this.lastPoint = [];
        this.arr = [];
        this.restPoint = [];
        var r = this.r;
        for (var i = 0; i < n; i++) {
            for (var j = 0; j < n; j++) {
                count++;
                var obj = {
                    x: j * 4 * r + 2 * r,
                    y: i * 4 * r + 2 * r,
                    text: count
                };
                this.arr.push(obj);
                this.restPoint.push(obj);
            }
        }
        this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
        for (var i = 0; i < this.arr.length; i++) {
            this.drawCircle(this.arr[i].x, this.arr[i].y, this.arr[i].text);
        }
        //return arr;
    }
    // 获取touch点相对于canvas的坐标
    H5lock.prototype.getPosition = function (e) {
        var rect = e.currentTarget.getBoundingClientRect();
        var po;
        if (e.touches) {
            po = {
                x: (e.touches[0].clientX - rect.left) * this.devicePixelRatio,
                y: (e.touches[0].clientY - rect.top) * this.devicePixelRatio
            };
        } else {
            po = {
                x: e.offsetX,
                y: e.offsetY
            };
        }

        return po;
    }
    H5lock.prototype.update = function (po) {// 
        this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);

        for (var i = 0; i < this.arr.length; i++) { // 每帧先把面板画出来
            this.drawCircle(this.arr[i].x, this.arr[i].y, i + 1);
        }

        this.drawPoint(this.pathColor);// 每帧画轨迹
        this.drawStatusPoint(this.pathColor);// 每帧画轨迹

        this.drawLine(this.pathColor, po, this.lastPoint);// 每帧画圆心


        for (var i = 0; i < this.restPoint.length; i++) {
            if (Math.abs(po.x - this.restPoint[i].x) < this.r && Math.abs(po.y - this.restPoint[i].y) < this.r) {
                this.drawPoint(this.restPoint[i].x, this.restPoint[i].y);
                var passPoint = this.restPoint[i];
                passPoint.ts = new Date().getTime();
                this.lastPoint.push(passPoint);
                this.restPoint.splice(i, 1);
                break;
            }
        }

    }
    H5lock.prototype.initDom = function () {
        var canvas = document.getElementById(this.canvasId);
        // 高清屏缩放
        canvas.style.width = this.width + "px";
        canvas.style.height = this.height + "px";
        canvas.height = this.height * this.devicePixelRatio;
        canvas.width = this.width * this.devicePixelRatio;

    }
    H5lock.prototype.init = function () {
        this.initDom();
        this.lastPoint = [];
        this.touchFlag = false;
        this.canvas = document.getElementById(this.canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.createCircle();
        this.canvas.addEventListener("mousedown", this.mouseDown.bind(this), false);
        this.canvas.addEventListener("touchstart", this.mouseDown.bind(this), false);
        this.canvas.addEventListener("mousemove", this.mouseMove.bind(this), false);
        this.canvas.addEventListener("touchmove", this.mouseMove.bind(this), false);
        this.canvas.addEventListener("mouseup", this.mouseUp.bind(this), false);
        this.canvas.addEventListener("touchend", this.mouseUp.bind(this), false);
    }
    H5lock.prototype.reset = function () {
        this.createCircle();
    }
    H5lock.prototype.mouseDown = function (e) {
        var self = this;
        self.lastTS = new Date().getTime();
        e.preventDefault();
        var po = self.getPosition(e);

        for (var i = 0; i < self.arr.length; i++) {
            if (Math.abs(po.x - self.arr[i].x) < self.r && Math.abs(po.y - self.arr[i].y) < self.r) {

                self.touchFlag = true;
                self.drawPoint(self.arr[i].x, self.arr[i].y);
                var passPoint = self.arr[i];
                passPoint.ts = new Date().getTime();
                self.lastPoint.push(passPoint);
                self.restPoint.splice(i, 1);
                break;
            }
        }
    }
    H5lock.prototype.mouseMove = function (e) {
        var self = this;
        if (self.touchFlag) {
            self.update(self.getPosition(e));
        }
    }
    H5lock.prototype.mouseUp = function (e) {
        var self = this;
        if (self.touchFlag) {
            self.touchFlag = false;
            setTimeout(function () {
                self.reset();
            }, 500);
        }

        //self.callBack( self.lastPoint);//返回json数组，包含坐标点
        var result = "";
        for (var point in self.lastPoint) {//遍历json数组时，这么写p为索引，0,1
            result += self.lastPoint[point].text;
        }
        self.callBack(result);
    }
})();
