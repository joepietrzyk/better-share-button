describe('createTweetObserver', () => {
  it('should invoke the onTweetAdd callback when a tweet is added', () => {
        
  });

  it('should invoke the onDropdownAdd callback when the dropdown menu is added', () => {
        
  });
});

describe('shareButtonClick', () => {
  it('should click off the menu to close the dropdown', () => {
        
  });

  it('should copy the link to the clipboard', () => {
        
  });

  it('should invoke clipboardToast with the cursor\'s x and y coordinates', () => {
        
  });
});

describe('getLinkFromArticle', () => {
  it('should ignore URLs without multiple /', () => {
        
  });

  it('should ignore URLs that contain \'hastag_click\'', () => {
        
  });

  it('should fall back to the window URL if it\'s unable to find it in the tweet', () => {
        
  });
});

describe('createShareButtonByCopying', () => {
  it('should copy the elementToCopy and all of its children', () => {
        
  });

  it('should add the hover style to the button when hovered', () => {
        
  });

  it('should remove the hover style from the button when no longer hovered', () => {
        
  });

  it('should change the text on the button to \'Better share link\'', () => {
        
  });

  it('should add a unique attribute to the button so we can ensure it\'s only added once', () => {
        
  });
});

describe('findShareButton', () => {
  it('should locate a tweet\'s share button via its SVG', () => {
        
  });

  it('should not locate any button except the share button', () => {
        
  });
});

describe('convertXLink', () => {
  it('should handle twitter.com and x.com URLs', () => {
        
  });

  it('should use the hostname fixupx.com when the preference is \'fixupx\'', () => {
        
  });
  
  it('should use the hostname fxtwitter.com when the preference is \'fxtwitter\'', () => {

  });

  it('should use the hostname twittpr.com when the preference is \'twittpr\'', () => {

  });

  it('should use the hostname vxtwitter.com when the preference is \'vxtwitter\'', () => {

  });
});
