import { ProjectAppPage } from './app.po';

describe('project-app App', () => {
  let page: ProjectAppPage;

  beforeEach(() => {
    page = new ProjectAppPage();
  });

  it('should display welcome message', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('Welcome to app!');
  });
});
