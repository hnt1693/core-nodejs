class CronjobBuilder {
  cronjob;

  static getInstance() {
    this.cronjob = require('node-cron');
    return this;
  }

  static regex(reg, callback) {
    this.cronjob.schedule(reg, callback);
  }

  static start() {
    this.cronjob.start();
  }
}

module.exports = CronjobBuilder;
