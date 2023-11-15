//Handler for partial results
jQuery(document.body).on('TBGetSearchRanking', async function (e, data) {


    // Pause for 300 msecs before continuing
    await delay(300);

    // Make sure to get the channel id from the page
    TBGlobal.extractChannelIdFromPage;

    const tags = data.value.tags;
    const originId = data.value.originId;
    const videoId = data.value.videoId;
    const tabId = data.value.tabId;

    // Lets get a cache of the hash before we run the tags
    await TBUtilities.ProcessHeader({ header: '', www: true });


    // Qualify
    if (data.value.full == undefined) {
        // Return partial or full results
        multiSearchResponse(tags, videoId, originId, tabId);
    } else {

        // If tags are empty return nothing
        if (tags.length == 0) {
            return;
        }

        // Return partial or full results
        getFullResponse(tags.pop(), videoId, originId, tabId);
    }

});

// Get the tags we need to search for
TBExtension.GetDbValue('SEARCH_TAGS', 'TBGetSearchRanking');

function getFullResponse(tag, originId, tabId) {
    TubeBuddyYouTubeActions.YouTubeSearch(tag)
        .then((response) => {
            return {
                estimatedResults: getEstimatedResults(response),
                results: parseRankingContents(getRankingContents(response))
            }
        })
        .then((results) => {

            const payload = {
                action: 'RELAY_SEARCH_RESULTS',
                originId,
                tag,
                results: results.results,
                estimatedResults: results.estimatedResults
            };

            TBExtension.SendMessage(payload, handleResponse);

        }).catch((e) => {

            // Handle any errors gracefully
            // - No search results
            // - No ranking found for a specific video
            // - Incorrect, missing, blank results from YouTube
            const payload = {
                action: 'RELAY_SEARCH_RESULTS',
                originId,
                tag,
                results: [],
                estimatedResults: 0,
                error: e.message
            };

            TBExtension.SendMessage(payload, handleError);
        }).finally(() => {
            TBExtension.RemoveDbValue('SEARCH_TAGS');
            TBExtension.SendMessage({ action: 'REMOVE_TAB', tabId }, handleResponse);
        });
}

function multiSearchResponse(tags, videoId, originId, tabId) {

    let promises = [];

    for (const tag of tags) {

        const promise = TubeBuddyYouTubeActions.YouTubeSearch(tag)
            .then(getRankingContents)
            .then(parseRankingContents)
            .then(rankings => calculateVideoRankings(videoId, rankings))
            .then((rank) => {

                const payload = {
                    videoId,
                    action: 'RELAY_SEARCH_RESULTS',
                    originId,
                    tag,
                    rank
                };

                TBExtension.SendMessage(payload, handleResponse);

            }).catch((e) => {

                /* Handle any errors gracefully
                 * No search results
                 * No ranking found for a specific video
                 * Incorrect, missing, blank results from YouTube
                 */
                const payload = {
                    videoId,
                    action: 'RELAY_SEARCH_RESULTS',
                    originId,
                    tag,
                    rank: 0,
                    error: e.message
                };

                TBExtension.SendMessage(payload, handleError);
            });

        // Push all the promises into an array for easy cleanup
        promises.push(promise);

    }

    // When promises have all finished, lets close the tab and remove the local storage
    Promise.all(promises)
        .finally((data) => {
            TBExtension.RemoveDbValue('SEARCH_TAGS');
            TBExtension.SendMessage({ action: 'REMOVE_TAB', tabId }, handleResponse);
            promises = [];
        });
}

function handleResponse(message) {
    //console.log('TAG_RANKINGS handleResponse', message);
}
function handleError(error) {
    //console.error('TAG_RANKINGS handleResponse', error);
}

function delay(ms) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms)
    });
}

function getRankingContents(response) {

    if (response.contents == undefined) {
        throw new Error('No results', response);
    }

    return response.contents;
}

function getEstimatedResults(response) {

    if (response.estimatedResults == undefined) {
        throw new Error('No estimatedResults', response);
    }

    return response.estimatedResults;
}

function parseRankingContents(content) {

    if (content.twoColumnSearchResultsRenderer.primaryContents == undefined || content.twoColumnSearchResultsRenderer.primaryContents.length == 0) {
        throw new Error('No rankings found', content);
    }

    return TBUtilities.GetVideoSearchCollection(content.twoColumnSearchResultsRenderer.primaryContents);
}

function calculateVideoRankings(videoId, rankings) {

    let rank = 0;

    for (const item of rankings) {

        /** 
        * Account for all items found in the results
        * shelfRenderer: grouping of videos suggested to the authed user
        * videoRenderer: video object
        * channelRenderer: channel object
        * horizontalCardListRenderer: list of community cards for the authed user
        * radioRenderer: YouTube generated music list
        * richSectionRenderer: list of community cards for the authed user (variant only)
        * richShelfRenderer: grouping of videos suggested to the authed user (variant only)
        * playlistRenderer: playlist object
        **/
        if (item.shelfRenderer ||
            item.videoRenderer ||
            item.channelRenderer ||
            item.horizontalCardListRenderer ||
            item.radioRenderer ||
            item.richSectionRenderer ||
            item.richShelfRenderer ||
            item.playlistRenderer) {
            rank++;
        }

        // Handle variant
        if (item.richShelfRenderer) {

            const renderers = [...item.richShelfRenderer.contents].length;
            for (i = 0; i < renderers; i++) {
                if (item.richShelfRenderer.contents[i] &&
                    item.richShelfRenderer.contents[i].richItemRenderer &&
                    item.richShelfRenderer.contents[i].richItemRenderer.content &&
                    item.richShelfRenderer.contents[i].richItemRenderer.content.videoRenderer) {

                    if (videoId == item.richShelfRenderer.contents[i].richItemRenderer.content.videoRenderer.videoId) {
                        return rank;
                    }
                    if (i != 0) {
                        rank++;
                    }
                }
            }
        }

        // Handle default shelf renderer
        else if (item.shelfRenderer) {

            if (item.shelfRenderer.content.verticalListRenderer) {

                const numberOfItems = item.shelfRenderer.content.verticalListRenderer.collapsedItemCount;
                for (i = 0; i < numberOfItems; i++) {
                    if (item.shelfRenderer.content.verticalListRenderer.items[i] &&
                        item.shelfRenderer.content.verticalListRenderer.items[i].videoRenderer) {
                        if (videoId == item.shelfRenderer.content.verticalListRenderer.items[i].videoRenderer.videoId) {
                            return rank;
                        }
                        if (i != 0) {
                            rank++;
                        }
                    }
                }
            }

        }

        //make sure it's a video, not a channel
        else if (item.videoRenderer) {
            if (videoId == item.videoRenderer.videoId) {
                return rank;
            }
        }

    }

    throw new Error(`Video ${videoId} not found in the rankings.`);
}