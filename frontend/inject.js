/**
 *  This script will be auto injected into the page when the plugin is run.
 */

/**
 *  Triggers a vote event with the data needed to be picked up in the index.js file.
 */
function vote(e, index, updown) {
    document.dispatchEvent(new CustomEvent('vote', {
        detail: {
            direction: updown,
            uid: null,
            index: index
        }
    }));
}
