const DIRECTION = {
    IDLE: 0,
    UP: 1,
    DOWN: 2,
    LEFT: 3,
    RIGHT: 4
};
 
const rounds = [5, 5, 3, 3, 2];
const colors = ['#1abc9c', '#2ecc71', '#3498db', '#8c52ff', '#9b59b6'];
 
// 乒乓球对象
var Ball = {
    new: function (incrementedSpeed) {
        return {
            width: 18,
            height: 18,
            x: (this.canvas.width / 2) - 9,
            y: (this.canvas.height / 2) - 9,
            moveX: DIRECTION.IDLE,
            moveY: DIRECTION.IDLE,
            speed: incrementedSpeed || 7 
        };
    }
};
 
// ai对象 (控制上下移动的长条)
const Ai = {
    new: function (side) {
        return {
            width: 18,
            height: 180,
            x: side === 'left' ? 150 : this.canvas.width - 150,
            y: (this.canvas.height / 2) - 35,
            score: 0,
            move: DIRECTION.IDLE,
            speed: 8
        };
    }
};
 
const Game = {
    //初始化
    initialize: function () {
        this.canvas = document.querySelector('canvas');
        this.context = this.canvas.getContext('2d');
 
        this.canvas.width = 1400;
        this.canvas.height = 1000;
 
        this.canvas.style.width = (this.canvas.width / 2) + 'px';
        this.canvas.style.height = (this.canvas.height / 2) + 'px';
 
        this.player = Ai.new.call(this, 'left');
        this.ai = Ai.new.call(this, 'right');
        this.ball = Ball.new.call(this);
 
        this.ai.speed = 5;
        this.running = this.over = false;
        this.turn = this.ai;
        this.timer = this.round = 0;
        this.color = '#000';
 
        pingPong.menu();
        pingPong.listen();
    },
 
    endGameMenu: function (text) {
        // 改变canvas的字体和颜色
        pingPong.context.font = '45px Courier New';
        pingPong.context.fillStyle = this.color;
 
        // 游戏结束文字背景框（后两个参数为宽高）
        pingPong.context.fillRect(
            pingPong.canvas.width / 2 - 350,
            pingPong.canvas.height / 2 - 48,
            800,
            100
        );
 
        pingPong.context.fillStyle = '#ffffff';
 
        // 游戏结束文字
        pingPong.context.fillText(text,
            pingPong.canvas.width / 2,
            pingPong.canvas.height / 2 + 15
        );
 
        setTimeout(function () {
            pingPong = Object.assign({}, Game);
            pingPong.initialize();
        }, 3000);
    },
 
    menu: function () {
        // 绘制画面
        pingPong.draw();
 
        // 字体大小和颜色
        this.context.font = '50px Courier New';
        this.context.fillStyle = this.color;
 
        // ‘按下任意键开始’文字背景框（后两个参数为宽高）
        this.context.fillRect(
            this.canvas.width / 2 - 350,
            this.canvas.height / 2 - 48,
            700,
            100
        );
 
        this.context.fillStyle = '#ffffff';
 
        // ‘按下任意键开始’文字
        this.context.fillText('按下任意键开始',
            this.canvas.width / 2,
            this.canvas.height / 2 + 15
        );
    },
 
    // 更新位置和分数
    update: function () {
        if (!this.over) {
            if (this.ball.x <= 0) pingPong._resetTurn.call(this, this.ai, this.player);  //球过左边界，电脑赢
            if (this.ball.x >= this.canvas.width - this.ball.width) pingPong._resetTurn.call(this, this.player, this.ai);  //球过右边界，玩家赢
            if (this.ball.y <= 0) this.ball.moveY = DIRECTION.DOWN;                      //球的y轴小于等于0，碰到顶部，变为向下移动
            if (this.ball.y >= this.canvas.height - this.ball.height) this.ball.moveY = DIRECTION.UP; //碰到底部，变为向上移动
 
            // 玩家移动
            if (this.player.move === DIRECTION.UP) this.player.y -= this.player.speed;
            else if (this.player.move === DIRECTION.DOWN) this.player.y += this.player.speed;
 

            if (pingPong._turnDelayIsOver.call(this) && this.turn) {
                this.ball.moveX = this.turn === this.player ? DIRECTION.LEFT : DIRECTION.RIGHT;      //判断发球方
                this.ball.moveY = [DIRECTION.UP, DIRECTION.DOWN][Math.round(Math.random())];         //判断发球高度
                this.ball.y = Math.floor(Math.random() * this.canvas.height - 200) + 200;            
                this.turn = null;
            }
 
            // 限制玩家移动范围
            if (this.player.y <= 0) this.player.y = 0;
            else if (this.player.y >= (this.canvas.height - this.player.height)) this.player.y = (this.canvas.height - this.player.height);
 
            // 移动球的位置
            if (this.ball.moveY === DIRECTION.UP) this.ball.y -= (this.ball.speed / 1.5);
            else if (this.ball.moveY === DIRECTION.DOWN) this.ball.y += (this.ball.speed / 1.5);
            if (this.ball.moveX === DIRECTION.LEFT) this.ball.x -= this.ball.speed;
            else if (this.ball.moveX === DIRECTION.RIGHT) this.ball.x += this.ball.speed;
 
            // 处理电脑的移动
            if (this.ai.y > this.ball.y - (this.ai.height / 2)) {
                if (this.ball.moveX === DIRECTION.RIGHT) this.ai.y -= this.ai.speed / 1.5;
                else this.ai.y -= this.ai.speed / 4;
            }
            if (this.ai.y < this.ball.y - (this.ai.height / 2)) {
                if (this.ball.moveX === DIRECTION.RIGHT) this.ai.y += this.ai.speed / 1.5;
                else this.ai.y += this.ai.speed / 4;
            }
 
            // 限制电脑移动范围
            if (this.ai.y >= this.canvas.height - this.ai.height) this.ai.y = this.canvas.height - this.ai.height;
            else if (this.ai.y <= 0) this.ai.y = 0;
 
            // 处理玩家与球的碰撞
            if (this.ball.x - this.ball.width <= this.player.x && this.ball.x >= this.player.x - this.player.width) {
                if (this.ball.y <= this.player.y + this.player.height && this.ball.y + this.ball.height >= this.player.y) {
                    this.ball.x = (this.player.x + this.ball.width);
                    this.ball.moveX = DIRECTION.RIGHT;
 
                }
            }
 
            // 处理电脑与球的碰撞
            if (this.ball.x - this.ball.width <= this.ai.x && this.ball.x >= this.ai.x - this.ai.width) {
                if (this.ball.y <= this.ai.y + this.ai.height && this.ball.y + this.ball.height >= this.ai.y) {
                    this.ball.x = (this.ai.x - this.ball.width);
                    this.ball.moveX = DIRECTION.LEFT;
 
                }
            }
        }
 
        // 检查玩家是否赢得此轮（玩家分数=获胜分数）.
        if (this.player.score === rounds[this.round]) {
            if (!rounds[this.round + 1]) {
                this.over = true;
                setTimeout(function () { pingPong.endGameMenu('你赢啦！'); }, 1000);
            } else {
                // 如果有下一轮，重置得分和参数，并进入下一轮
                this.color = this.randomColor();
                this.player.score = this.ai.score = 0;
                this.player.speed += 0.5;
                this.ai.speed += 1;
                this.ball.speed += 1;
                this.round += 1;
 
            }
        }
        // 检查电脑是否赢得此轮
        else if (this.ai.score === rounds[this.round]) {
            this.over = true;
            setTimeout(function () { pingPong.endGameMenu('菜鸡！'); }, 1000);
        }
    },
 
    // Draw the objects to the canvas element
    draw: function() {
        // 清空画布
        this.context.clearRect(
            0,
            0,
            this.canvas.width,
            this.canvas.height
        );
 
        this.context.fillStyle = this.color;
 
        // 绘制背景
        this.context.fillRect(
            0,
            0,
            this.canvas.width,
            this.canvas.height
        );
 
        // 填充白色
        this.context.fillStyle = '#ffffff';
 
        // 玩家
        this.context.fillRect(
            this.player.x,
            this.player.y,
            this.player.width,
            this.player.height
        );
 
        //  电脑
        this.context.fillRect(
            this.ai.x,
            this.ai.y,
            this.ai.width,
            this.ai.height 
        );
 
        // 球
        if (pingPong._turnDelayIsOver.call(this)) {
            this.context.fillRect(
                this.ball.x,
                this.ball.y,
                this.ball.width,
                this.ball.height
            );
        }
 
        // 中线
        this.context.beginPath();
        this.context.setLineDash([7, 15]);
        this.context.moveTo((this.canvas.width / 2), this.canvas.height - 140);
        this.context.lineTo((this.canvas.width / 2), 140);
        this.context.lineWidth = 10;
        this.context.strokeStyle = '#ffffff';
        this.context.stroke();
 
        this.context.font = '100px Courier New';
        this.context.textAlign = 'center';
 
        // 左边分数
        this.context.fillText(
            this.player.score.toString(),
            (this.canvas.width / 2) - 300,
            200
        );
 
        // 右边分数
        this.context.fillText(
            this.ai.score.toString(),
            (this.canvas.width / 2) + 300,
            200
        );
 
        // 轮数字体
        this.context.font = '40px Courier New';
 
        // 轮数
        this.context.fillText(
            '第 ' + (pingPong.round + 1) + ' 轮',
            (this.canvas.width / 2),
            35
        );
 
        // 比分字体
        this.context.font = '50px Courier';
 
        this.context.fillText(
            rounds[pingPong.round] ? rounds[pingPong.round] : rounds[pingPong.round - 1],
            (this.canvas.width / 2),
            100
        );
    },
 
    loop: () => {
        pingPong.update();
        pingPong.draw();
 
        //游戏未结束就画下一帧
        if (!pingPong.over) requestAnimationFrame(pingPong.loop);
    },
 
    listen: () => {
        document.addEventListener('keydown', (event) => {
            //按下按钮开始游戏
            if (pingPong.running === false) {
                pingPong.running = true;
                window.requestAnimationFrame(pingPong.loop);
            }
 
            // 控制向上
            if (event.code === 'ArrowUp' || event.code === 'KeyW') pingPong.player.move = DIRECTION.UP;
 
            // 控制向下
            if (event.code === 'ArrowDown' || event.code === 'KeyS') pingPong.player.move = DIRECTION.DOWN;
        });
 
        // 松开按键不移动
        document.addEventListener('keyup', (event) =>{ pingPong.player.move = DIRECTION.IDLE; });
    },
 
    // 重置球，转移球权至败方，赢者分数加一
    _resetTurn: function(winner, loser) {
        this.ball = Ball.new.call(this, this.ball.speed);
        this.turn = loser;
        this.timer = (new Date()).getTime();
 
        winner.score++;
    },
 
    // 延迟已经结束
    _turnDelayIsOver: function() {
        return ((new Date()).getTime() - this.timer >= 1000);
    },
 
    //每个关卡随机改变背景颜色
    randomColor: () => {
        let newColor = colors[Math.floor(Math.random() * colors.length)];
        if (newColor === this.color) return pingPong.randomColor();
        return newColor;
    }
};

//创建了一个基于 Game 对象的副本 pingPong，以便对游戏对象进行操作而不影响原始对象。
const pingPong = Object.assign({}, Game);
pingPong.initialize();