class Block {
  constructor(data) {
    this.hash = "",
      this.height = 0,
      this.body = new BlockBody(data),
      this.time = 0,
      this.previousBlockHash = ""
  }
}

class BlockBody {
  constructor(data) {
    this.address = data.address,
      this.star = new Star(data.star)
  }
}

class Star {
  constructor(data) {
    this.dec = data.dec,
      this.ra = data.ra,
      this.story = data.story
  }
}

module.exports = {
  Block
}