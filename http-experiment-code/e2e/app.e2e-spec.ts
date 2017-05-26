import { HttpExperimentPage } from './app.po';

describe('http-experiment App', () => {
  let page: HttpExperimentPage;

  beforeEach(() => {
    page = new HttpExperimentPage();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('app works!');
  });
});
