document.addEventListener('DOMContentLoaded', function() {
  const styleOptions = document.querySelectorAll('.style-option');
  const generateButton = document.getElementById('generate');
  const resultDiv = document.getElementById('result');
  let selectedStyle = 'professional';

  // Style selection handling
  styleOptions.forEach(option => {
    option.addEventListener('click', function() {
      styleOptions.forEach(opt => opt.classList.remove('selected'));
      this.classList.add('selected');
      selectedStyle = this.dataset.style;
    });
  });

  // Set default selected style
  styleOptions[0].classList.add('selected');

  // Generate button click handler
  generateButton.addEventListener('click', async function() {
    resultDiv.textContent = 'Processing...';
    
    const keywords = document.getElementById('keywords').value.trim();
    if (!keywords) {
      resultDiv.textContent = 'Please enter keywords to include in the message.';
      return;
    }

    try {
      // Get current tab
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      
      if (!tab.url.includes('linkedin.com')) {
        resultDiv.textContent = 'Please navigate to a LinkedIn profile page.';
        return;
      }

      // Inject and execute script directly
      const results = await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        function: () => {
          // This function runs in the context of the LinkedIn page
          const profileInfo = {
            name: '',
            position: '',
            company: '',
            location: ''
          };

          try {
            // Get name
            const nameElement = document.querySelector('h1.jJxMUbWmmPNtWNnOIzbDKsZYpsWnMWaVc');
            if (nameElement) {
              profileInfo.name = nameElement.textContent.trim();
            }

            // Get position and company
            const experienceElement = document.querySelector('div.text-body-medium');
            if (experienceElement) {
              const fullText = experienceElement.textContent.trim();
              const parts = fullText.split(' at ');
              profileInfo.position = parts[0] || '';
              profileInfo.company = parts[1] || '';
            }

            // Get location
            const locationElement = document.querySelector('.text-body-small.inline');
            if (locationElement) {
              profileInfo.location = locationElement.textContent.trim();
            }

            return profileInfo;
          } catch (error) {
            console.error('Error extracting profile info:', error);
            return profileInfo;
          }
        }
      });

      const profileInfo = results[0].result;

      if (!profileInfo || !profileInfo.name) {
        resultDiv.textContent = 'Could not find profile information. Please make sure you are on a LinkedIn profile page.';
        return;
      }

      // Generate message
      const message = generateMessage(profileInfo, keywords, selectedStyle);
      resultDiv.textContent = message;

    } catch (error) {
      console.error('Error:', error);
      resultDiv.textContent = 'An error occurred. Please make sure you are on a LinkedIn profile page and try again.';
    }
  });
});

function generateMessage(profileInfo, keywords, style) {
  const keywordList = keywords.split(',').map(k => k.trim());
  
  const messageTemplates = {
    professional: `Dear ${profileInfo.name},

I came across your profile and was impressed by your role as ${profileInfo.position} at ${profileInfo.company}. Your experience in ${keywordList.join(', ')} particularly caught my attention.

I would appreciate the opportunity to connect and learn more about your work in ${keywordList[0]}. Would you be open to a brief conversation?

Best regards,
[Your Name]`,

    friendly: `Hi ${profileInfo.name},

I was browsing LinkedIn and your profile stood out to me! I see you're working as ${profileInfo.position} at ${profileInfo.company}, and I'm really interested in your experience with ${keywordList.join(', ')}.

Would love to connect and chat about ${keywordList[0]} sometime. Let me know if you're open to it!

Cheers,
[Your Name]`,

    direct: `${profileInfo.name},

I'm reaching out because of your expertise in ${keywordList.join(', ')} at ${profileInfo.company}. Your work as ${profileInfo.position} aligns with my interests.

Let's connect and discuss potential opportunities.

Best,
[Your Name]`,

    enthusiastic: `Hello ${profileInfo.name}! 👋

I'm excited to connect with you! Your work as ${profileInfo.position} at ${profileInfo.company} is truly inspiring, especially your focus on ${keywordList.join(', ')}.

I'd love to learn more about your journey in ${keywordList[0]} and explore potential synergies. Let's connect!

Warm regards,
[Your Name]`
  };

  return messageTemplates[style];
} 