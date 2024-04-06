const express = require('express');
const searchGoogle = require('./searchGoogle');
const { addCollectedData, selectCollectedData , addSearchIgnore, selectSearchIgnore, deleteSearchIgnore } = require('./database');
const { scrapeWebsiteInfo } = require('./scraper');
const cors = require('cors');
const bodyParser = require('body-parser');


const app = express();

const port = 3001;

const Token = 'Bearer AIzaSyD8Z0jJ9Q9Q6Z2MaSKLNSD2jkmsasdnk';


app.use(cors(
  {
    origin: 'http://localhost',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    preflightContinue: false,
    optionsSuccessStatus: 200,
  }
));

app.use((req, res, next) => {
  // validate Bearer token
  const bearerToken = req.headers.authorization;
  
  if (!bearerToken || bearerToken !== Token) {
    return res.status(401).send('Unauthorized');
  }
  next();
});

app.use(bodyParser.json());

app.set('view engine', 'ejs');

app.use(express.json());




app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*'); // Allow requests from any origin
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  res.header('Access-Control-Allow-Methods', 'POST');
  next();
});

app.post('/search', async (req, res) => {
  try {
    const query = req.body.q || '';
    const limit = req.body.limit || 10;
    const removeDuplicates = req.body.removeDuplicates || false;
    const reverseSort = req.body.reverseSort || false;
    const selectedResults = await searchGoogle(query, limit, removeDuplicates, reverseSort);
    for (const result of selectedResults) {
      const domain = new URL(result.link).hostname;
      const collectedData = await selectCollectedData(0,0,{ 'domain': domain });
      result.collectedData = collectedData;
    }
    res.status(200).json(selectedResults);
  } catch (error) {
    console.error('Error searching Google:', error);
    res.status(500).send('Error fetching search results');
  }
});

// scrape sites list from the database
app.post('/scrape', async (req, res) => {
  try {
    const link = req.body.link || '';
    const query = req.body.query || '';
    const websiteInfo = await scrapeWebsiteInfo(link);
    // add search result to the database
    await addCollectedData(websiteInfo.title, link, websiteInfo.cms, websiteInfo.emails, websiteInfo.lang, websiteInfo.phoneNumbers, query);
    res.status(200).json(websiteInfo);
  } catch (error) {
    res.status(500).send(error.message);
  }
});


// get collected data from the database
app.get('/collected-data', async (req, res) => {
  try {
    const collectedData = await selectCollectedData(req.query.page, req.query.limit, {});
    res.status(200).json(collectedData);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

app.put('/ignore', async (req, res) => {
  domain = req.body.domain;
  if (!domain || domain === '') {
    res.status(400).send('Domain is required');
  }
  try {
    await addSearchIgnore(domain);
    res.status(200).send('Domain added to ignore list');
  } catch (error) {
    res.end(500).send(error.message);
  }
});

app.get('/ignore', async (req, res) => {
  try {
    const ignoreList = await selectSearchIgnore();
    res.status(200).json(ignoreList);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

app.delete('/ignore', async (req, res) => {
  const domain = req.body.domain || '';
  if (!domain || domain === '') {
    return res.status(400).send('Domain is required');
  }

  const results = await deleteSearchIgnore({ domain });  
  res.status(200).json(results);
});



app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
