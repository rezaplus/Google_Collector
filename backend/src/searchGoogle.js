const googleIt = require('google-it');
const { selectSearchIgnore } = require('./database');

async function searchGoogle(query, limit, removeDuplicates, reverseSort, country = 'us', language = 'lang_en') {
    try {

        const results = await googleIt({ 'query': query, 'limit': limit , 'no-display': true, 'gl': country, 'hl': language});

        // if results is empty, return
        if (!results || results.length === 0) {
            return results;
        }

        let _results = results;

        if (!removeDuplicates) {
            _results = results.filter((result, index, self) =>
                index === self.findIndex((t) => (
                    new URL(t.link).hostname === new URL(result.link).hostname
                ))
            );
        }

        // get ignore list
        try {
        const ignoreList = await selectSearchIgnore();
        _results = _results.filter(result => {
            const domain = new URL(result.link).hostname;
            // Assuming ignoreList is an array of objects with 'id' and 'domain' properties
            return !ignoreList.some(item => item.domain === domain);
        });
        } catch (error) {
            console.error('Error filtering ignore list:', error);
        }
        

        if (reverseSort) {
            _results = _results.reverse();
        }

        return _results;
    } catch (error) {
        throw new Error('Error searching Google:', error);
    }
}


module.exports = searchGoogle;
