const Stats = require('stats.js');


/** There are 2 types of stats:
 *    - from stats.js (graphs)
 *    - my own (raw numbers)
 */
export class StatsSystem {

  // graphs from stats.js lib
  private statsUI: Stats;

  constructor () {
    this.statsUI = new Stats();
    // 0: fps, 1: ms, 2: mb, 3+: custom
    this.statsUI.showPanel(1);
    this.statsUI.showPanel(0);
    document.body.appendChild(this.statsUI.dom);
  }

  frameBegin () {
    this.statsUI.begin();
  }

  frameEnd () {
    this.statsUI.end();
  }

}
