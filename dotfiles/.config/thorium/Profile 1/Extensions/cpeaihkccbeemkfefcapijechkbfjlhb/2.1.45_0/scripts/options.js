"use strict";

var MAX_USES = 10;

var options;

$(function () {
    restore_options();

    $("#save").on("click", function (e) {
        save_options();
    });
});

function save_options() {
    options.licenseKey = $("#licenseKey").val().trim();
    if (options.licenseKey) {
        verifyLicense(options.licenseKey, options.lastLicenseCheck, function (valid, uses) {
            if (valid.indexOf("valid") == 0) {
                if (uses && uses > MAX_USES) {
                    $("#status").text("You have used your license key too many times. Please contact support@raybeksolutions.com.");
                } else {
                    options.lastLicenseCheck = Date.now();
                    var message = "Options saved. Refresh any Amazon browser tabs for changes to take affect.";
                    if (uses) {
                        message += " You can use this license key " + (MAX_USES - uses) + " more time(s).";
                    }
                    save_options_internal(message);
                }
            } else {
                $("#status").text("Invalid license key!");
            }
        });
    } else {
        options.lastLicenseCheck = null;
        save_options_internal("Options saved. Refresh any Amazon browser tabs for changes to take affect.");
    }
}

function save_options_internal(message) {
    set_options(options, function () {
        $("#status").text(message);
    });
}

function restore_options() {
    get_options(function (items) {
        options = items;
        $("#licenseKey").val(options.licenseKey);

        var version = chrome.runtime.getManifest().version;
        $("#version").text(version);
    });
}