import { getTactfulBus } from "@tactful/utils";
export class Bus {
  static configuration;
  static bus;

  static configure(configuration) {
    if (!this.bus) this.bus = getTactfulBus(configuration);
    return this.bus;
  }

  static getInstance() {//return new bus bus.getinstance
    if (!this.bus) this.bus = getTactfulBus(this.configuration);
    return this.bus;
  }
}


/*
import { Bus } from './utils/Bus.js';

let obj = {
  broker: 'redis',
  namespace: 'alpha',
  messageExpiration: 3600000,
  url: 'rediss://default:Bd6wD%23LCLtse%29UEw@smq.dev.tactful.ai:6443/1'
};

Bus.configure(obj);
Bus.getInstance().startConsuming();

Bus.getInstance().on("tactful.message", async (msg, cb) => {
  console.log('msg from redis ', msg);
  cb();
});


*/