const mongoose = require('mongoose');

// Define schema
const CollectedSchema = new mongoose.Schema({
    title: String,
    link: String,
    domain: {
        type: String,
        unique: true
    },
    cms: String,
    emails: [String],
    lang: String,
    phoneNumbers: [String],
    query: String
});

const searchIgnoreSchema = new mongoose.Schema({
    domain: {
        type: String,
        unique: true
    }
});

// Define model
const Collected = mongoose.model('collected', CollectedSchema);
const searchIgnore = mongoose.model('searchIgnore', searchIgnoreSchema);

main().catch(err => console.log(err));

async function main() {
  await mongoose.connect('mongodb://mongodb/collections');
}

// Function to add a new search result
async function addCollectedData(title, link, cms, emails, lang, phoneNumbers, query) {
    try {
        const domain = new URL(link).hostname;
        const existingRecord = await Collected.findOne({ domain });

        if (existingRecord) {
            // Update the existing record
            await Collected.findOneAndUpdate(
                { domain },
                { $set: { title, link, cms, emails, lang, phoneNumbers, query } }
            );
            console.log('Updated search result for domain:', domain);
        } else {
            // Create a new record
            await Collected.create({ title, link, domain, cms, emails, lang, phoneNumbers, query });
            console.log('Added search result for domain:', domain);
        }
    } catch (error) {
        console.error('Error adding or updating search result:', error);
        throw error;
    }
}


// Function to select search results
async function selectCollectedData(page = 0, limit = 0, query={}) {
    try {
        const results = await Collected.find(query);

        if (page === 0 || limit === 0) {
            return results;
        }

        // paginate the results
        const startIndex = (page - 1) * limit;
        const endIndex = page * limit;
        const paginatedResults = results.slice(startIndex, endIndex);
        return paginatedResults;
    } catch (error) {
        console.error('Error selecting search results:', error);
        throw error;
    }
}

// Function to delete search results
async function deleteCollected(query={}) {
    try {
        const results = await Collected.deleteMany(query);
        return results;
    } catch (error) {
        console.error('Error deleting search results:', error);
        throw error;
    }
}

// Function to add a domain to the ignore list
async function addSearchIgnore(domain) {

    // Validate domain
    if (!domain || domain === '') {
        throw new Error('Domain is required');
    }

    try {
        const existingRecord = await searchIgnore.findOne({ domain });

        if (existingRecord) {
            console.log('Domain already exists in the ignore list:', domain);
        } else {
            await searchIgnore.create({ domain });
            console.log('Added domain to ignore list:', domain);
        }
    } catch (error) {
        console.error('Error adding domain to ignore list:', error);
        throw error;
    }
}

// Function to select domains from the ignore list
async function selectSearchIgnore(query={}) {
    try {
        const results = await searchIgnore.find(query);
        return results;
    } catch (error) {
        console.error('Error selecting ignore list:', error);
        throw error;
    }
}

// Function to delete domains from the ignore list
async function deleteSearchIgnore(query = {}) {
    try {
        const results = await searchIgnore.deleteMany(query);
        return results;
    } catch (error) {
        console.error('Error deleting ignore list:', error);
        throw error;
    }
}

// Export the functions
module.exports = {
    addCollectedData,
    selectCollectedData,
    deleteCollected,
    addSearchIgnore,
    selectSearchIgnore,
    deleteSearchIgnore
};
