const axios = require('axios');
const cheerio = require('cheerio');



// Read proxy list from file
//const proxyList = fs.readFileSync('http_proxies.txt', 'utf-8').split('\n').map(line => line.trim());

// Function to make a request with a random user-agent
export async function makeRequest(url: string, payload: {
    page: string; currentPage: string;
    // Your payload data here
    ownerMemberId: string; memberType: string; productId: string; companyId: string; evaStarFilterValue: string; evaSortValue: string; startValidDate: string; i18n: string; withPictures: string; withAdditionalFeedback: string; onlyFromMyCountry: string; version: string; isOpened: string; translate: string; jumpToTop: string; v: string;
  }, headers: { [x: string]: string; "Content-Type"?: string; }) {
  // List of user agents for rotation
  const userAgents = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36',
    // Add more user agents here
  ];
  headers['User-Agent'] = userAgents[Math.floor(Math.random() * userAgents.length)]; // Select a random user-agent

  try {
    const response = await axios.post(url, payload=payload, headers=headers);
    console.log(response.data);
    return response;
  } catch (e) {
    console.error(`Request error: ${e}`);
    return null;
  }
}

// Main function to scrape reviews
export async function scrapeReviews() {
  const apiURL = "https://feedback.aliexpress.com/display/productEvaluation.htm?v=2&productId=3256804998234106&ownerMemberId=1102603368&page=2";
  const headers = {
    'Content-Type': 'application/x-www-form-urlencoded',
  };

  const payloadBase = {
    // Your payload data here
    'ownerMemberId': '1102603368',
    'memberType': 'seller',
    'productId': '3256804998234106',
    'companyId': '',
    'evaStarFilterValue': 'all Stars',
    'evaSortValue': 'sortdefault@feedback',
    'startValidDate': '',
    'i18n': 'true',
    'page': '1200',
    'currentPage': '1200',
    'withPictures': 'false',
    'withAdditionalFeedback': 'false',
    'onlyFromMyCountry': 'false',
    'version': '',
    'isOpened': 'true',
    'translate': 'Y',
    'jumpToTop': 'true',
    'v': '2',
  };

  const data: { Reviews: any; StarRating: number; Images: any; }[] = [];
  const starWidths = ['20%', '40%', '60%', '80%', '100%'];

  // Example of making a single request
  const payload = { ...payloadBase, page: '1', currentPage: '1' };
  const response = await makeRequest(apiURL, payload, headers);
  if (response) {
    const $ = cheerio.load(response.data);
    $('div.feedback-item').each((_, elem) => {
      const revStars = $('span.star-view span', elem);
      const revText = $('dt.buyer-feedback span', elem).text();
      const revImages = $('img', elem).map((_, image) => $(image).attr('src')).get();

      const starWidth = revStars.css('width');
      const starRating = starWidths.indexOf(starWidth) + 1;

      data.push({ Reviews: revText, StarRating: starRating, Images: revImages });
    });
  } else {
    console.log("Failed to fetch reviews");
  }
  return data
}




