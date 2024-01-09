class GlobalState {
  wheelStage = 1;

  get wheelStage() {
    return this.wheelStage;
  }

  set wheelStage(value) {
    this.wheelStage = value;
  }

  get isLastStage() {
    return this.wheelStage >= 3;
  }
}

export const globalState = new GlobalState();
