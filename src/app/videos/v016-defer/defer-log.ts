import { Injectable } from '@angular/core';
import { EventLogBuffer } from '../../shared/event-log/event-log';

/** Provided by the page: every deferred component reports when its chunk was loaded. */
@Injectable()
export class DeferLog extends EventLogBuffer {
  constructor() {
    super(50);
  }

  loaded(name: string): void {
    this.log(`${name}: chunk loaded & component created`);
  }
}
