import { Injectable } from '@angular/core';
import { Http, Response} from '@angular/http';
import { Headers, RequestOptions } from '@angular/http';

import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/do';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/retryWhen';
import 'rxjs/add/operator/scan';
import 'rxjs/add/operator/delay';

import { GlobalsService } from './globals.service';

@Injectable()
export class ExternalInterfaceService {

  dummyDelay = 8000;
  retryDelay = 400;

  constructor (private http: Http,
    private globals: GlobalsService) {}

  login (userName: string, password: string): Observable<any> {
    return this.get('login', { Email: userName, Password: password});
  }

  getFeed (): Observable<any> {
    return this.get('feed', { Token: this.globals.user.token});
  }

  private get (apiMethod: string, requestJson: any): Observable<any> {

    let url: string;
    url = `/assets/dummy-services/${apiMethod}.json`;

    console.log('Using Fake URL...', url);

    const statusGoodForRetry = this.statusGoodForRetry;

    return this.http.get(url)
      .delay(this.dummyDelay) // dummy delay to look like slow connection
        // testing: async test fails if SUT calls an observable with a delay operator (fakeAsync too)
        // https://github.com/angular/angular/issues/10127
        .map(this.extractData.bind(this))
        .retryWhen(errors => {
            return errors.scan(function(errorCount, err) {
                if (errorCount >= 2) {
                    throw err;
                }
                console.log('Connection problem, retrying...');

                return errorCount + 1;
            }, 0)
            .delay(this.retryDelay);
            // testing: async test fails if SUT calls an observable with a delay operator (fakeAsync too)
            // https://github.com/angular/angular/issues/10127
          }
        )
        .catch(
          this.handleError.bind(this)
        );

  }

  statusGoodForRetry(res: Response) {
    /*
      retry logic for...
      400 Bad Request
      404 Not Found
      408 Request Timeout
      409 Conflict
      500 Internal Server Error
      502 Bad Gateway
      503 Service Unavailable
      504 Gateway Timeout
    */
    if (res.status &&
      (
        res.status === 400 ||
        res.status === 404 ||
        res.status === 408 ||
        res.status === 409 ||
        res.status === 500 ||
        res.status === 502 ||
        res.status === 503 ||
        res.status === 504
      )) {
        return true;
    }
    return false;
  }

  private extractData(res: Response) {

    console.log('extractData');

    if (this.statusGoodForRetry(res)) {
        console.log('res.status ', res.status);
        throw res;
    }

    const body = res.json();

    console.log('result: ', body);

    return body;
  }

  private showError(msg: string) {
    console.log(msg);
  }

  private handleError (error: any): string {
    console.log('handleError');
    const _status = (error.status && error.status === 401 ? '' : error.status + ' - ');
    const errMsg = (error.Message) ? error.Message :
      error.status ? `${_status}${error.statusText}` : 'Server error - sorry, cannot connect';
    console.error(errMsg);
    console.log(JSON.stringify(error));
    this.showError(errMsg);
    return 'test'; // errMsg;
  }


  saveFile (parentid: number, type: number, file: any): Observable<any> {
    return Observable.create(observer => {
      const formData: FormData = new FormData(),
      xhr: XMLHttpRequest = new XMLHttpRequest();

      formData.append('parentid', parentid.toString());
      formData.append('type', type.toString());
      formData.append('token', this.globals.user.token);
      formData.append('uploadFile', file, file.name);

      xhr.onreadystatechange = () => {
        if (xhr.readyState === 4) {
          if (xhr.status === 200) {
            observer.next(JSON.parse(xhr.response));
            observer.complete();
          } else {
            observer.error(xhr.response);
          }
        }
      };

      // xhr.upload.onprogress = (event) => {
      //   this.progress = Math.round(event.loaded / event.total * 100);

      //   this.progressObserver.next(this.progress);
      // };

      const apiMethod = 'AttachFile';
      const url: string = 'http://blah-blah/' + apiMethod;

      console.log('Using Live URL...');
      console.log(`post FILE to ${apiMethod} `);

      xhr.open('POST', url, true);
      xhr.send(formData);
    });
  }


}
