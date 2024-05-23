const axios = require('axios');
const cheerio = require('cheerio');

// Function to scrape website information from a given URL
async function scrapeWebsiteInfo(url) {
    try {
        const response = await axios.get(url);
        const $ = cheerio.load(response.data);

        // Extract website name
        const title = $('title').text();

        // Extract CMS information if available
        const cms = await detectCMS(url);
        
        // Extract emails using regex
        const emails = await detectEmails(response.data);
        
        const lang = $('html').attr('lang');

        const phoneNumbers = await detectPhoneNumbers(response.data);

        return {
            title,
            cms,
            emails,
            lang,
            phoneNumbers
        };
    } catch (error) {
        console.error('Error scraping website info:');
        return {
            title: 'Error',
            cms: 'Error',
            emails: [],
            lang: 'Error',
            phoneNumbers: 'Error'
        };
    }
}

// Function to detect emails from a given string
async function detectEmails(text) {

    emails = [];
    // Extract email addresses from <a> tags with mailto: attribute
    const $ = cheerio.load(text);
    $('a[href^="mailto:"]').each((index, element) => {
        const email = $(element).attr('href').replace('mailto:', '');
        emails.push(email);
    });

    // validate email
    const emailRegex = /\S+@\S+\.\S+/;
    emails = emails.filter(email => emailRegex.test(email));
    return emails;
}

async function detectPhoneNumbers(text) {
    phoneNumbersList = [];
    // Extract phone numbers from <a> tags with tel: attribute
    const $ = cheerio.load(text);
    $('a[href^="tel:"]').each((index, element) => {
        const phoneNumber = $(element).attr('href').replace('tel:', '');
        phoneNumbersList.push(phoneNumber);
    });

    return phoneNumbersList;
}

async function detectCMS(url) {
    try {
        const response = await axios.get(url);
        const $ = cheerio.load(response.data);

        // Check meta tags for common CMS indicators
        const metaGenerator = $('meta[name="generator"]').attr('content');
        if (metaGenerator) {
            if (metaGenerator.toLowerCase().includes('wordpress')) {
                return 'WordPress';
            } else if (metaGenerator.toLowerCase().includes('joomla')) {
                return 'Joomla';
            } else if (metaGenerator.toLowerCase().includes('drupal')) {
                return 'Drupal';
            } else if (metaGenerator.toLowerCase().includes('wix')) {
                return 'Wix';
            } // Add more checks for other CMSs if needed
        }

        // Check for common HTML comments
        const htmlComments = $('*:contains("WordPress"),*:contains("Joomla"),*:contains("Drupal")');
        if (htmlComments.length > 0) {
            if (htmlComments.text().toLowerCase().includes('wordpress')) {
                return 'WordPress';
            } else if (htmlComments.text().toLowerCase().includes('joomla')) {
                return 'Joomla';
            } else if (htmlComments.text().toLowerCase().includes('drupal')) {
                return 'Drupal';
            } // Add more checks for other CMSs if needed
        }

        // Check for specific CSS classes
        const cssClasses = $('body [class*="wp-"], body [class*="joomla"], body [class*="drupal"]');
        if (cssClasses.length > 0) {
            if (cssClasses.attr('class').toLowerCase().includes('wp-')) {
                return 'WordPress';
            } else if (cssClasses.attr('class').toLowerCase().includes('joomla')) {
                return 'Joomla';
            } else if (cssClasses.attr('class').toLowerCase().includes('drupal')) {
                return 'Drupal';
            } // Add more checks for other CMSs if needed
        }

        // If CMS is not detected, return 'Unknown'
        return 'Unknown';
    } catch (error) {
        console.error('Error detecting CMS:', error);
        return 'Unknown';
    }
}


// Export the function
module.exports = {
    scrapeWebsiteInfo
};