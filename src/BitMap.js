var DIV = 0x5;
var MOD = 0x1f;
var SIZE = 0x20;
var right0 = new Uint32Array(SIZE + 1);
var right1 = new Uint32Array(SIZE + 1);

right1[0] = 0x0;
right0[0] = ~right1[0];
for (var i = 1; i <= SIZE; i++) {
  right1[i] = (right1[i - 1] << 0x1) | 0x1;
  right0[i] = ~right1[i];
}

export function BitMap(_width, _height) {
  this.pixelSize = (_width) * _height / 1000000.0;
  this.pixelSize = this.pixelSize >= 1 ? this.pixelSize : 1;
  this.width = ~~((_width + this.pixelSize) / this.pixelSize);
  this.height = ~~((_height + this.pixelSize) / this.pixelSize);

  this.array = new Uint32Array(~~(((this.width * this.height) + SIZE) / SIZE));

  this.markBinned = function (x, y) {
    var position = (y * this.width) + x;
    this.array[position >>> DIV] |= 1 << (position & MOD);
  };

  this.mark = function (x, y) {
    this.markBinned(this.bin(x), this.bin(y));
  };

  this.unmarkBinned = function(x, y) {
      var position = (y * this.width) + x;
      this.array[position >>> DIV] &= ~(1 << (position & MOD));
  }

  this.unmark = function(x, y) {
      this.unmarkBinned(this.bin(x), this.bin(y));
  }

  this.getBinned = function (x, y) {
    var position = (y * this.width) + x;
    return this.array[position >>> DIV] & (1 << (position & MOD));
  };

  this.get = function (x, y) {
    return this.getBinned(this.bin(x), this.bin(y));
  };

  this.getInBoundBinned = function (x, y, x2, y2) {
    var start, end,
        indexStart, indexEnd;
    for (; y <= y2; y++) {
      start = (y * this.width) + x;
      end = (y * this.width) + x2;
      indexStart = start >>> DIV;
      indexEnd = end >>> DIV;
      if (indexStart === indexEnd) {
        if (this.array[indexStart] & right0[start & MOD] & right1[(end & MOD) + 1]) return true;
      } else {
        if (this.array[indexStart] & right0[start & MOD]) return true;
        if (this.array[indexEnd] & right1[(end & MOD) + 1]) return true;

        for (var i = indexStart + 1; i < indexEnd; i++) {
          if (this.array[i]) return true;
        }
      }
    }
    return false;
  }

  this.getInBound = function (x, y, x2, y2) {
    return this.getRangeBinned(this.bin(x), this.bin(y), this.bin(x2), this.bin(y2));
  }

  this.flushBinned = function (x, y, x2, y2) {
    var start, end,
        indexStart, indexEnd;
    for (; y <= y2; y++) {
      start = (y * this.width) + x;
      end = (y * this.width) + x2;
      indexStart = start >>> DIV;
      indexEnd = end >>> DIV;
      if (indexStart === indexEnd) {
        this.array[indexStart] |= right0[start & MOD] & right1[(end & MOD) + 1];
      } else {
        this.array[indexStart] |= right0[start & MOD];
        this.array[indexEnd] |= right1[(end & MOD) + 1];

        for (var i = indexStart + 1; i < indexEnd; i++) {
          this.array[i] = 0xffffffff;
        }
      }
    }
  }

  this.flush = function (x, y, x2, y2) {
    return this.flushBinned(this.bin(x), this.bin(y), this.bin(x2), this.bin(y2));
  }

  this.bin = function (coordinate) {
    return ~~(coordinate / this.pixelSize);
  };
}
