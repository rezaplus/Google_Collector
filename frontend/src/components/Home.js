
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { FaCheckCircle } from 'react-icons/fa';


function Home() {
  const [searchResults, setSearchResults] = useState([]);
  const [query, setQuery] = useState(localStorage.getItem('searchQuery') || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [scrapingData, setScrapingData] = useState({});
  const [limit, setLimit] = useState(parseInt(localStorage.getItem('searchLimit')) || 100);
  const [reverseSort, setReverseSort] = useState(localStorage.getItem('reverseSort') === 'true');
  const [removeDuplicates, setRemoveDuplicates] = useState(localStorage.getItem('removeDuplicates') === 'true');
  const [scrapeQueue, setScrapeQueue] = useState([]);
  const [collectionProgress, setCollectionProgress] = useState(0);


  const handleCollectData = async (link, id) => {
    try {
      setLoading(true);
      const response = await axios.post('http://localhost:3001/scrape', { link, query });
      setScrapingData({ ...scrapingData, [id]: response.data });
    } catch (error) {
      console.error('Error scraping data:', error);
    } finally {
      setLoading(false);
      // Remove the collected link from the queue
      setScrapeQueue(queue => queue.filter(item => item !== link));
    }
  };

  const handleCollectAll = async () => {
    try {
      setCollectionProgress(0); // Reset progress
      const promises = searchResults.map((result) => {
        return axios.post('http://localhost:3001/scrape', { link: result.link, query });
      });
      const totalRequests = promises.length;
      let completedRequests = 0;
      for (let i = 0; i < promises.length; i++) {
        const response = await promises[i];
        setScrapingData((prevData) => ({ ...prevData, [searchResults[i].id]: response.data }));
        completedRequests++;
        // Update progress
        const progress = Math.round((completedRequests / totalRequests) * 100);
        setCollectionProgress(progress);
      }
    } catch (error) {
      console.error('Error scraping data:', error);
    } finally {
      // hide progress bar
      setCollectionProgress(0);
    }
  };
  

  useEffect(() => {
    const scrapeNextInQueue = async () => {
      if (scrapeQueue.length > 0) {
        const link = scrapeQueue[0];
        try {
          const response = await axios.post('http://localhost:3001/scrape', { link });
          setScrapingData(prevData => ({ ...prevData, [searchResults.find(result => result.link === link).id]: response.data }));
        } catch (error) {
          console.error('Error scraping data:', error);
        } finally {
          // Remove the processed link from the queue
          setScrapeQueue(queue => queue.slice(1));
          // Continue scraping next link in queue
          scrapeNextInQueue();
        }
      }
    };

    scrapeNextInQueue();
  }, [scrapeQueue, searchResults]);

  const CollectionProgressPopup = () => {
    return (
      <div className="position-fixed bottom-0 start-50 translate-middle-x mb-3">
        <div className="bg-dark text-light rounded p-3 w-25">
          <p className="mb-1">Collecting data... ({collectionProgress}%)</p>
          <div className="progress">
            <div className="progress-bar" role="progressbar" style={{ width: `${collectionProgress}%` }} aria-valuenow={collectionProgress} aria-valuemin="0" aria-valuemax="100"></div>
          </div>
        </div>
      </div>
    );
  };
  

  const handleSearch = async () => {
    try {
      setLoading(true);

      const response = await axios.post('http://localhost:3001/search', {
        q: query,
        limit,
        reverseSort,
        removeDuplicates,
      }, {
        headers: {
          'authorization': 'Bearer AIzaSyD8Z0jJ9Q9Q6Z2MaSKLNSD2jkmsasdnk',
        }
      });
      
      const srchResults = response.data.map((result, index) => ({ ...result, id: index + 1 }));
      setSearchResults(srchResults);
      setScrapingData(
        srchResults.reduce((acc, result) => {
          if (result.collectedData && result.collectedData.length > 0) {
            const { title, cms, lang, emails, phoneNumbers } = result.collectedData[0];
            acc[result.id] = { title, cms, lang, emails: emails.join(', '), phoneNumbers: phoneNumbers.join(', ') };
          }
          return acc;
        }, {})
      );
      setError(null);
      // Store search query and limit in localStorage
      localStorage.setItem('searchQuery', query);
      localStorage.setItem('searchLimit', limit.toString());
      localStorage.setItem('reverseSort', reverseSort.toString());
      localStorage.setItem('removeDuplicates', removeDuplicates.toString());
    } catch (error) {
      console.error('Error fetching search results:', error);
      setError('Error fetching search results. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddIgnoreList = async (link) => {
    try {
      const domain = new URL(link).hostname;
      await axios.put('http://localhost:3001/ignore', { 'domain': domain });
        setSearchResults(searchResults.filter((result) => !result.link.includes(domain)));
    } catch (error) {
      console.error('Error adding link to ignore list:', error);
    }
  }

  useEffect(() => {
    setQuery(localStorage.getItem('searchQuery') || '');
    setLimit(parseInt(localStorage.getItem('searchLimit')) || 100);
    setReverseSort(localStorage.getItem('reverseSort') === 'true');
    setRemoveDuplicates(localStorage.getItem('removeDuplicates') === 'true');
  }, []);

  return (
    <div className="container mt-5">
      <h1 className="text-center mb-4 display-4 fw-semibold">Search</h1>
      <div className="input-group mb-3">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="form-control"
          placeholder="Enter search query"
        />
        <div className="input-group-text">
          <input
            type='checkbox'
            id="remove_duplicate"
            checked={removeDuplicates}
            onChange={() => setRemoveDuplicates(!removeDuplicates)}
            className="form-check-input"
          />
          <label htmlFor="remove_duplicate" className="form-check-label px-2">Remove Duplicate</label>
        </div>
        <div className="input-group-text">
          <input
            type='checkbox'
            id="reverse_sort"
            checked={reverseSort}
            onChange={() => setReverseSort(!reverseSort)}
            className="form-check-input"
          />
          <label htmlFor="reverse_sort" className="form-check-label px-2">Reverse Sort</label>
        </div>
        <input
          type="number"
          value={limit}
          onChange={(e) => setLimit(parseInt(e.target.value))}
          className="form-control" style={{ maxWidth: '100px' }}
        />
        <button onClick={handleSearch} className="btn btn-primary">Search</button>
        <button onClick={handleCollectAll} className="btn btn-success">Collect All</button>
      </div>

      {loading &&<div> <div className="position-fixed top-50 start-50 translate-middle" style={{ zIndex: 4 }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
        <div className="bg-dark position-fixed top-0 start-0 w-100 h-100" style={{ opacity: 0.5, zIndex: 1 }}></div>
        </div>
       }
      {error && <p className="text-center text-danger">{error}</p>}

{searchResults.length > 0 ? (
  searchResults.map((result) => (
    <div key={result.id} className="card mb-3">
      <div className="card-body">
        <div className="row">
          <div className="col-6">
            <h5 className="card-title">{result.title}</h5>
            <p><a href={result.link} target="_blank" rel="noreferrer" className="card-link">{result.link}</a></p>
            <button onClick={() => handleCollectData(result.link, result.id)} className="btn btn-success">Collect Data</button>
            <button onClick={() => handleAddIgnoreList(result.link)} className="btn btn-danger ms-2">Ignore</button>
          </div>
          <div className="col-6 row">
            {/* Render the icon if data has been scraped */}
            {scrapingData[result.id] && (
              <div className="col-12 text-end">
                <FaCheckCircle color="green" size={20} />
              </div>
            )}
            {collectionProgress > 0 && <CollectionProgressPopup />} {/* Place it here */}
            <p className="card-text col-6">CMS: {scrapingData[result.id]?.cms}</p>
            <p className="card-text col-6">Language: {scrapingData[result.id]?.lang}</p>
            <p className="card-text col-6">Emails: {scrapingData[result.id]?.emails}</p>
            <p className="card-text col-6">Phone Numbers: {scrapingData[result.id]?.phoneNumbers}</p>
          </div>
        </div>
      </div>
    </div>
  ))
) : (
  <p className="text-center">No results found.</p>
)}
    </div>
  );
}

export default Home;
