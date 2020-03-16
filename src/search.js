//
// Algorithm adapted from
// https://github.com/primaryobjects/maze
//

function Search(walker) {
    this.walker = walker,
        this.direction = 0,
        this.end = walker.end,

        this.step = function() {
            var startingDirection = this.direction;

            while (!this.walker.move(this.direction)) {
                // Hit a wall. Turn to the right.
                this.direction++;

                if (this.direction > 3) {
                    this.direction = 0;
                }

                if (this.direction == startingDirection) {
                    // We've turned in a complete circle with no new path available. Time to backtrack.
                    while (!this.walker.move(this.direction, true)) {
                        // Hit a wall. Turn to the right.
                        this.direction++;

                        if (this.direction > 3) {
                            this.direction = 0;
                        }
                    }

                    break;
                }
            }
        },

        this.isDone = function() {

            if (walker.x == walker.end.x && walker.y == walker.end.y) {

                return true;
            } else {
                return false;
            }
        }
};

function Walker(mazeCells) {

        this.mazeCells = mazeCells;
        var height = mazeCells.length;
        var firstRow = mazeCells[0];
        var width = firstRow.length;
        this.height = height;
        this.width = width;
        this.end = {x: (width - 1) , y: (height - 2)};
        this.x = 0,
        this.y = 1,
        this.lastX = -1,
        this.lastY = -1,
        this.visited = createArray(width, height),

        this.init = function() {

            // Clear array to all zeros.
            for (var x = 0; x < width; x++) {
                for (var y = 0; y < height; y++) {
                    this.visited[x][y] = 0;
                }
            }
            // Set starting point.
            this.visited[this.x][this.y] = 1;
        },


        this.move = function(direction, backtrack) {
            var changed = false;
            oldX = this.x;
            oldY = this.y;

            if (backtrack || !this.hasVisited(direction)) {
                // Get the new x,y after moving.
                var point = this.getXYForDirection(direction);

                // Check if this is a valid move.
                if (this.canMove(point.x, point.y)) {
                    this.x = point.x;
                    this.y = point.y;
                    changed = true;
                }
            }

            if (changed) {

                this.lastX = oldX;
                this.lastY = oldY;

                // Mark tile as visited (possibly twice).
                this.visited[this.x][this.y]++;

                if (backtrack) {
                    // We've turned around, so don't visit this last tile again.
                    this.visited[this.lastX][this.lastY] = 2;
                }

                if (this.visited[oldX][oldY] == 2 && this.visited[this.x][this.y] == 1) {
                    // Found an un-walked tile while backtracking.
                    // Mark our last tile back to 1 so we can visit it again to exit this path.
                    this.visited[oldX][oldY] = 1;

                }
            }

            return changed;
        },

        this.canMove = function(x, y) {

            if(x < 0 || y < 0) return false;
            if(y >= this.mazeCells.length ) {
                return false
            }
            var row = this.mazeCells[y];
            var cell = row[x];
            return (cell == 0 && this.visited[x][y] < 2);
        },

        this.hasVisited = function(direction) {

            // Get the new x,y after moving.
            var point = this.getXYForDirection(direction);
            if(point.x < 0 || point.y <0) return true;

            // Check if this point has already been visited.
            return (this.visited[point.x][point.y] > 0);
        },

        this.getXYForDirection = function(direction) {
            var point = {};

            switch (direction) {
                case 0: point.x = this.x; point.y = this.y - 1; break;
                case 1: point.x = this.x + 1; point.y = this.y; break;
                case 2: point.x = this.x; point.y = this.y + 1; break;
                case 3: point.x = this.x - 1; point.y = this.y; break;
            };

            return point;
        }
};

function createArray(length) {
    var arr = new Array(length || 0),
        i = length;

    if (arguments.length > 1) {
        var args = Array.prototype.slice.call(arguments, 1);
        while(i--) arr[length-1 - i] = createArray.apply(this, args);
    }

    return arr;
}