"use strict";

var mailChimpEndpoint = "https://us14.api.mailchimp.com/3.0/lists/b05502b73b/members";

$(function () {

    var manifest = chrome.runtime.getManifest();
    $(".appName").text(manifest.name);
    document.title = manifest.name + " License";

    $("#submit").click(function (e) {
        e.preventDefault();

        if ($("form")[0].reportValidity()) {

            var firstName = $("#firstName").val().trim();
            var lastName = $("#lastName").val().trim();
            var emailAddress = $("#emailAddress").val().trim();

            $.ajax(mailChimpEndpoint, {
                headers: {
                    Authorization: "apikey 48b3fcab5e006e6df650f736b56e92ff-us14"
                },
                method: "POST",
                dataType: "json",
                data: JSON.stringify({
                    "email_address": emailAddress,
                    "status": "subscribed",
                    "merge_fields": {
                        "FNAME": firstName,
                        "LNAME": lastName
                    }
                })
            }).done(function (data) {
                displayCompletionMessage();
            }).fail(function (xhr, textStatus, error) {
                if (xhr.responseJSON.title == "Member Exists") {
                    displayCompletionMessage();
                } else {
                    alert("Error saving data: " + xhr.responseJSON.title);
                }
            });
        }
    });
});

function displayCompletionMessage() {
    alert("Thank you. Please refresh any Amazon browser sessions.");
    window.close();
}