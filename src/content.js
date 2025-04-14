// Function to extract profile information from LinkedIn
function extractProfileInfo() {
  const profileInfo = {
    name: '',
    company: '',
    position: '',
    location: '',
    about: ''
   
  };

  try {
    // Extract name
    const nameElement = document.querySelector('.text-heading-xlarge');
    if (nameElement) {
      profileInfo.name = nameElement.textContent.trim();
    }

    // Extract current position and company
    const positionElement = document.querySelector('.text-body-medium');
    if (positionElement) {
      const positionText = positionElement.textContent.trim();
      const [position, company] = positionText.split(' at ');
      profileInfo.position = position || '';
      profileInfo.company = company || '';
    }

    // Extract location
    const locationElement = document.querySelector('.text-body-small.inline.t-black--light.break-words');
    if (locationElement) {
      profileInfo.location = locationElement.textContent.trim();
    }

    // Extract about section
    const aboutElement = document.querySelector('.display-flex.ph5.pv3 .visually-hidden');
    if (aboutElement) {
      profileInfo.about = aboutElement.textContent.trim();
    }

    return profileInfo;
  } catch (error) {
    console.error('Error extracting profile information:', error);
    return profileInfo;
  }
}

// Listen for messages from the popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'getProfileInfo') {
    const profileInfo = extractProfileInfo();
    sendResponse(profileInfo);
    return true;
  }
  
}); 