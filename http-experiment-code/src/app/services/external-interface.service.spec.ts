import { ResponseOptions } from '@angular/http';
import { GlobalsService } from './globals.service';
import { BaseRequestOptions, ConnectionBackend, Http, Response } from '@angular/http';
/* tslint:disable:no-unused-variable */
import {MockBackend} from '@angular/http/testing';
import { async, inject, resetFakeAsyncZone, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ExternalInterfaceService } from './external-interface.service';

describe('ExternalInterfaceService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        BaseRequestOptions,                             // added
        MockBackend,                                    // added
        GlobalsService,
        ExternalInterfaceService,                                // added
        { provide: Http,                                // added
          useFactory: (backend: ConnectionBackend,
            defaultOptions: BaseRequestOptions) => {
              return new Http(backend, defaultOptions);
            }, deps: [MockBackend, BaseRequestOptions] }
      ]
    });
  });

  it('Service should init ok...', inject([ExternalInterfaceService], (service: ExternalInterfaceService) => {
    expect(service).toBeTruthy();
  }));

  describe('getFeed', () => {

    it('does an http get of the dummy feed url',
      inject([ExternalInterfaceService, MockBackend],
      <any>fakeAsync((externalInterface: ExternalInterfaceService, mockBackend: MockBackend): void => {
        console.log('Start Test: does an http get of the dummy feed url');
        let res;
        mockBackend.connections.subscribe(c => {
          expect(c.request.url).toBe('/assets/dummy-services/feed.json');
          const response = new ResponseOptions({body: '{"feed": [{"id": 1, "title": "feed item 1", "body": "item 1 body" }]}'});
          c.mockRespond(new Response(response));
        });

        externalInterface.dummyDelay = 0;
        externalInterface.retryDelay = 0;
        // testing: async test fails if SUT calls an observable with a delay operator (fakeAsync too)
        // https://github.com/angular/angular/issues/10127

        externalInterface.getFeed()
          .map(result => {
              if (result.feed) {
                res = result;
                console.log('Success. ');
              } else {
                console.log('oh dear, no feed in result. Abort.');
              }
            })
          .subscribe();
        tick();
        expect(res.feed.length).toBe(1);
      })));


    it('repeats get x 3 when Response code is 503 - check console (f12)',
      inject([ExternalInterfaceService, MockBackend],
      <any>fakeAsync((externalInterface: ExternalInterfaceService, mockBackend: MockBackend): void => {
        console.log('Start Test: repeats get x 3 when Response code is 503');
        let resultReceived = false;
        let errorReceived = false;
        mockBackend.connections.subscribe(c => {
          expect(c.request.url).toBe('/assets/dummy-services/feed.json');
          const response = new ResponseOptions({status: 503, statusText: 'Service Unavailable'});
          c.mockRespond(new Response(response));
        });

        externalInterface.dummyDelay = 0;
        externalInterface.retryDelay = 0;
        // testing: async test fails if SUT calls an observable with a delay operator (fakeAsync too)
        // https://github.com/angular/angular/issues/10127

        externalInterface.getFeed()
            .map(() => {
              resultReceived = true;
            })
            .catch((err) => {
              errorReceived = true;
              return err;
            })
          .subscribe();
        tick();
        expect(resultReceived).toBe(true);
        expect(errorReceived).toBe(false);
      })));

  });


  // describe('getFeed', () => {
  //       console.log('hello 1');
  //   // tslint:disable-next-line:no-unused-expression
  //   it('does an http get of the dummy feed url'),
  //     inject([ExternalInterfaceService, MockBackend], fakeAsync((externalInterface, mockBackend) => {
  //       console.log('hello');
  //       alert('heelo');
  //       let res;
  //       mockBackend.connections.subscribe(c => {
  //         expect(c.request.url).toBe('/assets/dummy-services/feed.json');
  //         const response = new ResponseOptions({body: '{"feed": []}'});
  //         c.mockRespond(new Response(response));
  //       });
  //       externalInterface.getFeed().subscribe((_res) => {
  //         res = _res;
  //       });
  //       tick();
  //       // expect(res.feed).toBe([]);
  //       expect(true).toBe(true);
  //     }));
  // });


});
