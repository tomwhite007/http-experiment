import { ExternalInterfaceService } from './services/external-interface.service';
import { GlobalsService } from './services/globals.service';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, OnDestroy {

  loginSubscription: Subscription;
  feedSubscription: Subscription;

  title = 'app works!';

  constructor (private globals: GlobalsService, private externalInterface: ExternalInterfaceService) {}

  ngOnInit () {
    this.synchronise();
  }

  private synchronise() {

    console.log('Start synchronise()...');

    if (!this.globals.user.token) {

      console.log('stored token is', this.globals.user.token, 'so, login first before getting feed');

      this.loginSubscription = this.externalInterface
        .login('testUser', 'testPassword')
        .map(result => {
            if (result.token) {
              this.globals.user.token = result.token;
              console.log('token now stored ', this.globals.user.token, 'so, can get feed');
              this.syncFeed();
            } else {
              console.log('oh dear, no token in result. Abort.');
            }
          })
        .subscribe();

    } else {
      this.syncFeed();
    }
  }

  private syncFeed() {

      console.log('getting feed...');

      this.feedSubscription = this.externalInterface
        .getFeed()
        .map(result => {
            if (result.feed) {
              this.globals.feed = result.feed;
              console.log('Success. Feed now stored ', this.globals.feed);
            } else {
              console.log('oh dear, no feed in result. Abort.');
            }
          })
        .subscribe();
  }

  ngOnDestroy () {
        if (this.loginSubscription) {
            this.loginSubscription.unsubscribe();
        }
        if (this.feedSubscription) {
            this.feedSubscription.unsubscribe();
        }
  }

}
