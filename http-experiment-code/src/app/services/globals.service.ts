import { Injectable } from '@angular/core';

@Injectable()
export class GlobalsService {

  user: any = {
    token: null
  };

  feed: Array<object>;

  constructor() {
    this.user.token = null;
    this.feed = null;
   }

}
