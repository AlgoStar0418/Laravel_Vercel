export const ALCHEMY_APIKEY = process.env.ALCHEMY_APIKEY;

export class ALCHEMYKEYS {
  currentIndex = 0;
  keys = ["Q9l74ESLThPV3IabIMvnB1SGnCh1EFUB"];
  count = 0;
  get() {
    const key = this.keys[this.currentIndex];
    this.count++;

    if (this.count > 2) {
      this.count = 0;
      ++this.currentIndex;
      if (this.currentIndex >= this.keys.length) {
        this.currentIndex = 0;
      }
    }
    return key;
  }
}
