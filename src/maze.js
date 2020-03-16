function Maze(data) {
    this.data = data;

    this.rows = 0;
    this.cols = 0;
    this.cellSpacing = 128;
    this.imageScale = 0.2;
    this.displayCells = [];
    this.mazeCells = [];

    // We assume that "+--" represents a horizontal line
    // and "|  " represents vertical.
    // Mazes expected to be multiples of 3 (n % 3 = 0)
    // also not running error checking on inputted maze.
    // Expect them to be well-formed and have a solution

    this.parseDataForDisplay = function () {

        var colCount = 0;
        var rowCount = 0;
        var displayCells = [];

        var lines = data.split(/\n/);
        for (var i = 0; i < lines.length; ++i) {
            line = lines[i];
            var str = line.replace(/\r/g, "");
            var chars = str.split("");

            var row = [];

            for(var a = 0; a < chars.length; a+=3) {

                var c1 = chars[a];
                if(a+2 < chars.length) {
                    var c2 = chars[a + 1];
                    var c3 = chars[a + 2];
                }

                if(rowCount % 2 == 0) {  //processing horizontal lines

                    if(c2 == "-") {
                        row.push(1);
                    } else {
                        row.push(0);
                    }

                } else { //processing vertical lines

                    if(c1 == "|") {
                        row.push(1);
                    } else {
                        row.push(0);
                    }
                }
                colCount++;
            }
            displayCells.push(row);
            rowCount++;
        }

        this.displayCells = displayCells;
    }

    this.parseDataForMazeCells = function () {

        var colCount = 0;
        var rowCount = 0;
        var mazeCells = [];

        var lines = data.split("\n");
        for (var i = 0; i < lines.length; ++i) {
            line = lines[i];
            var str = line.replace(/\n|\r/g, "");
            var chars = str.split("");
            var row = [];

            for(var a = 0; a < chars.length; a+=3) {

                var c1 = chars[a];
                if(a+2 < chars.length) {
                    var c2 = chars[a + 1];
                    var c3 = chars[a + 2];
                }

                if(rowCount % 2 == 0) {  //processing horizontal lines

                    if(c1 == "+") {
                        row.push(1);
                    }

                    if(c2 == "-") {
                        row.push(1);
                    } else {
                        row.push(0);
                    }

                } else { //processing vertical lines

                    if(c1 == "|") {
                        row.push(1);
                        row.push(0);
                    } else {
                        row.push(0);
                        row.push(0);
                    }
                }
                colCount++;
            }
            row.pop();
            mazeCells.push(row);
            rowCount++;
        }
        if(row.length == 0) {
            mazeCells.pop();
        }

        this.mazeCells = mazeCells;
    }

    this.displayMap = function (layer) {

        var cells = this.displayCells;
        var firstRow = this.displayCells[0];
        var numberRows = this.displayCells.length;
        var numberCols = firstRow.length;

        var startY = 560;
        var cellSize = 100;

        this.mazeWidth = numberRows * cellSize * this.imageScale;
        this.mazeHeight = numberCols * cellSize * this.imageScale;

        var offsetX = cc.winSize.width/2 - this.mazeWidth/2;
        var offsetY = cc.winSize.height/2 - this.mazeHeight - 75;

        for(var r = 0; r < cells.length; r++) {
            var row = cells[r];

            for(var c = 0; c < row.length; c++) {

                if(r % 2 == 0) {  //horizontal

                    if (row[c] == 1 && c != row.length - 1) {

                        var x = c * this.cellSpacing * (2 * this.imageScale) + offsetX;
                        var y = startY - (r * this.cellSpacing * this.imageScale + offsetY);
                        var sprite = _displaySprite(true, x, y, this.imageScale);
                        layer.addChild(sprite, 0);

                        if(r == 0 && c == 0) {
                            //store coordinates of first sprite
                            this.topLeft = {"x": x, "y": y};
                        }

                    }
                } else { //vertical

                    if (row[c] == 1) {
                        var x = c * this.cellSpacing * (2 * this.imageScale) +
                            offsetX - (this.imageScale * this.cellSpacing);
                        var y = startY - (r * this.cellSpacing * this.imageScale + offsetY);
                        var sprite = _displaySprite(false, x, y, this.imageScale);
                        layer.addChild(sprite, 0);

                    }
                }
            }
        }
    }

    function _displaySprite(isHorizontal, x, y, scale) {

        var spriteName = res.wallVertical;

        if(isHorizontal) {
            spriteName = res.wallHorizontal;
        }

        var sprite = new cc.Sprite(spriteName);

        sprite.attr({
            scaleX: scale,
            scaleY: scale,
            x: x,
            y: y
        });

        return sprite;
    }


    this.solve = function() {

        this.steps = [];
        this.walker = new Walker(this.mazeCells);
        this.walker.init();
        this.algorithm = new Search(this.walker);

        var count = 0
        while(!this.algorithm.isDone()) {
            this.algorithm.step();
            this.steps.push({"x": this.walker.x, "y" : this.walker.y});
            count++;
        }
    }

    this.animateSolution = function(layer) {

        var sprite = new cc.Sprite(res.ball);
        sprite.attr({
            x: this.topLeft["x"] - 25,
            y: this.topLeft["y"] - 25,
            scaleX: 0.2,
            scaleY: 0.2
        });

        layer.addChild(sprite, 0);

        for (var i = 0; i < this.steps.length; i++) {

            var step = this.steps[i];
            var x = step["x"];
            var y = step["y"];

            var offsetX = x * (this.cellSpacing * this.imageScale) + this.topLeft["x"] - 25;
            var offsetY = this.topLeft["y"] - (y * (this.cellSpacing * this.imageScale) + 0);

            // Create the action to move sprite
            var delay = new cc.DelayTime(i * 0.05 + 1);
            var actionMove = new cc.MoveTo(0.05, offsetX, offsetY);
            sprite.runAction(new cc.Sequence(delay, actionMove))
        }
    }

};

