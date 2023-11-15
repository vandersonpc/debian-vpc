
const FetchUtilities = (function () {

    const makeFetchRequest = (messageRequest, callback) => {

        //creds
        let credentials = 'same-origin';

        //if cors mode include credentials
        if (messageRequest.mode && messageRequest.mode === "cors") {
            credentials = 'include';
        }

        //legacy incognito mode
        if (messageRequest.data.ajaxOptions.credentials === false) {
            credentials = 'omit';
        }

        let fetchInit = {
            method: messageRequest.data.ajaxOptions.type,
            credentials: credentials,
            mode: messageRequest.mode,
            cache: messageRequest.data.ajaxOptions.cache === true ? 'default' : 'no-cache',
            headers: {}
        };

        //add any additioncal header
        for (let property in messageRequest.data.ajaxOptions.headers) {
            fetchInit.headers[property] = messageRequest.data.ajaxOptions.headers[property];
        }

        //content type 
        if (messageRequest.data.ajaxOptions.contentType) {
            fetchInit.headers['Content-Type'] = messageRequest.data.ajaxOptions.contentType;
        }

        //post data
        if (fetchInit.method.toLowerCase() === 'post' && messageRequest.data.ajaxOptions.data) {

            //if passing a form data object rebuild from sealized object
            if (messageRequest.data.ajaxOptions.dataIsSearlizedFormData) {

                let formObject = JSON.parse(messageRequest.data.ajaxOptions.data);
                const keys = Object.keys(formObject);
                let formData = new FormData();

                for (const key of keys) {
                    switch (key.toLowerCase()) {
                        //convert to blob from dataURI since blob is not searalizeable
                        case 'imagefile': {
                            try {
                                let blob = dataUriToBlob(formObject[key]);
                                formData.append(key, blob, 'blob');
                            }
                            catch (ex) {
                                console.log(ex);
                                callback({
                                    success: false,
                                    response: ex
                                });
                                return isAsyn;
                            }
                            break;
                        }
                        //facebook video upload
                        case 'video_file_chunk': {
                            try {
                                let blob = dataUriToBlob(formObject[key]);
                                formData.delete(key);
                                formData.append(key, blob);
                            }
                            catch (ex) {
                                console.log(ex);
                                callback({
                                    success: false,
                                    response: ex
                                });
                                return isAsyn;
                            }
                            break;
                        }
                        //facebook thumb
                        case 'fb-thumb': {
                            try {
                                let blob = dataUriToBlob(formObject[key]);
                                formData.delete('fb-thumb');
                                formData.append('thumb', blob, 'file.jpg');
                            }
                            catch (ex) {
                                console.log(ex);
                                callback({
                                    success: false,
                                    response: ex
                                });
                                return isAsyn;
                            }
                            break;
                        }
                        //card poll choices
                        case 'choices_as_string': {
                            try {
                                let arrayAsString = formObject[key];
                                let asArray = arrayAsString.split(",");
                                formData.delete('choices_as_string');
                                for (let i = 0; i < asArray.length; i++) {
                                    formData.append('choices', asArray[i]);
                                }

                            }
                            catch (ex) {
                                console.log(ex);
                                callback({
                                    success: false,
                                    response: ex
                                });
                                return isAsyn;
                            }
                            break;
                        }
                        default: {
                            formData.append(key, formObject[key]);
                            break;
                        }
                    }

                }
                messageRequest.data.ajaxOptions.data = formData;
            }

            fetchInit.body = messageRequest.data.ajaxOptions.data;
        }

        let domSource = window; 
        //if the messsage is coming from Firefox we need to use the content dom source vs window https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/Content_scripts#XHR_and_Fetch
        if (messageRequest.data.ajaxOptions.useContent && messageRequest.data.ajaxOptions.useContent === true) {
            domSource = content;
        }

        request = domSource.fetch(messageRequest.data.ajaxOptions.url, fetchInit).then(function (response) {
            if (response.ok) {
                response.text().then(function (text) {
                    callback({
                        success: true,
                        response: text,
                        status: response.status
                    });

                });
            } else {
                response.text().then(function (text) {
                    callback({
                        success: false,
                        response: text,
                        status: response.status
                    });
                });   
            }
        }
        ).catch(function (error) {
            console.log('tb-xhr', error);
            callback({
                success: false,
                response: '',
                error: error
            });
        });
    };

    const dataUriToBlob = (dataURI) => {
        'use strict';
        let byteString,
            mimestring

        if (dataURI.split(',')[0].indexOf('base64') !== -1) {
            byteString = atob(dataURI.split(',')[1])
        } else {
            byteString = decodeURI(dataURI.split(',')[1])
        }

        mimestring = dataURI.split(',')[0].split(':')[1].split(';')[0]

        let content = new Array();
        for (let i = 0; i < byteString.length; i++) {
            content[i] = byteString.charCodeAt(i)
        }

        return new Blob([new Uint8Array(content)], { type: mimestring });
    };

    return {

        MakeFetchRequest: makeFetchRequest

    };

})();
