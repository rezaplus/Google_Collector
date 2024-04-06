import React, { useState, useEffect } from 'react';
import axios from 'axios';

const SearchIgnoreList = () => {
  const [ignoreList, setIgnoreList] = useState([]);
  const [newItem, setNewItem] = useState('');

  useEffect(() => {
    const fetchIgnoreList = async () => {
      try {
        const response = await axios.get('http://localhost:3001/ignore');
        setIgnoreList(response.data);
      } catch (error) {
        console.error('Error fetching ignore list:', error);
      }
    };

    fetchIgnoreList();
  }, []);

  const handleAddItem = async () => {
    try {
      await axios.put('http://localhost:3001/ignore', { domain: newItem });
      setIgnoreList([...ignoreList, { domain: newItem }]);
      setNewItem('');
    } catch (error) {
      console.error('Error adding link to ignore list:', error);
    }
  };

  const handleDeleteItem = async (item) => {
    try {
      await axios.delete('http://localhost:3001/ignore', { data: { domain: item.domain } });
      setIgnoreList(ignoreList.filter((i) => i.domain !== item.domain));
    } catch (error) {
      console.error('Error deleting item:', error);
    }
  };

  return (
    <div className="container">
      <div className=" mt-4 w-50 mx-auto">
        <h1 className="fw-semibold text-center mb-4">Search Ignore List</h1>
        <div className="card-body">
          <div className="input-group mb-3">
            <input
              type="text"
              className="form-control"
              placeholder="Add item"
              value={newItem}
              onChange={(e) => setNewItem(e.target.value)}
            />
            <button className="btn btn-primary" onClick={handleAddItem} disabled={!newItem}>
              Add Item
            </button>
          </div>

          <div className="list-group">
            {ignoreList.map((item) => (
              <div key={item.id} className="list-group-item d-flex justify-content-between align-items-center">
                <span>{item.domain}</span>
                <button className="btn btn-danger" onClick={() => handleDeleteItem(item)}>
                  Delete
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchIgnoreList;
