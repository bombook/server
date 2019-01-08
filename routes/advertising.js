const JSE = global.JSE;
const express = require('express');

const router = express.Router();

const fs = require('fs');

/**
 * @name /advertising/newampaign/*
 * @description Setup a new advertising campaign
 * @memberof module:jseRouter
 */
router.post('/newcampaign/*', function (req, res) {
	if (!req.body.session) { res.status(400).send('{"fail":1,"notification":"Error advertising.js 12. No Session Variable Supplied"}'); return false; }
	const session = req.body.session; // No need to cleanString because it's only used for comparison
	JSE.jseDataIO.getCredentialsBySession(session,function(goodCredentials) {
		if (goodCredentials) {
			// Object destructuring, new fields need to be added before and after the =>
			const campaign = (({
				name, geos, devices, windowsDesktop, macDesktop, androidTablet, ipad, androidPhone, iphone, other, browsers, chrome, firefox, safari, ucbrowser, opera, edge, ie, general, crypto, streaming, adult, domains, domainWhitelist, domainBlacklist, publishers, publisherWhitelist, publisherBlacklist, url, currencyJse, currencyUsd, dailyBudget, lifetimeBudget, start, end, frequencyCap,
			}) => ({
				name, geos, devices, windowsDesktop, macDesktop, androidTablet, ipad, androidPhone, iphone, other, browsers, chrome, firefox, safari, ucbrowser, opera, edge, ie, general, crypto, streaming, adult, domains, domainWhitelist, domainBlacklist, publishers, publisherWhitelist, publisherBlacklist, url, currencyJse, currencyUsd, dailyBudget, lifetimeBudget, start, end, frequencyCap,
			}))(req.body);

			const newDate = new Date().getTime();
			const random = Math.floor((Math.random() * 999999) + 1); // setting up a firebase style push variable, timestamp+random
			campaign.cid = String(newDate) +''+ String(random); // Campaign ID
			campaign.paused = false; // user paused
			campaign.disabled = false; // admin disabled (budgets etc)
			campaign.archived = false;

			campaign.banners = [];
			Object.keys(req.body.creatives).forEach((imgRef) => {
				let base64Data;
				let fileName;
				const size = req.body.creatives[imgRef].size;
				const originalFileName = JSE.jseFunctions.cleanString(req.body.creatives[imgRef].originalFileName);
				if (size === '300x100' || size === '728x90' || size === '300x250') {
					if (/^data:image\/png;base64,/.test(req.body.creatives[imgRef].src)) {
						base64Data = req.body.creatives[imgRef].src.replace(/^data:image\/png;base64,/, "");
						fileName = goodCredentials.uid+'_'+campaign.cid+'_'+imgRef+'.png';
					} else if (/^data:image\/gif;base64,/.test(req.body.creatives[imgRef].src)) {
						base64Data = req.body.creatives[imgRef].src.replace(/^data:image\/gif;base64,/, "");
						fileName = goodCredentials.uid+'_'+campaign.cid+'_'+imgRef+'.gif';
					} else if (/^data:image\/jpeg;base64,/.test(req.body.creatives[imgRef].src)) {
						base64Data = req.body.creatives[imgRef].src.replace(/^data:image\/jpeg;base64,/, "");
						fileName = goodCredentials.uid+'_'+campaign.cid+'_'+imgRef+'.jpg';
					}
					if (fileName) {
						if (base64Data.length < 250000) {
							JSE.jseDataIO.storeFile('adx',fileName,base64Data,'base64');
							campaign.banners.push({ fileName, size, originalFileName, active: true });
						} else {
							console.log("Error advertising.js 40. File size too large");
						}
					}
				} else {
					// inText creatives here?
					console.log("Error advertising.js 44. Unrecognized file size detected");
				}
			});

			//fs.writeFileSync('./campaign1.json', JSON.stringify(campaign) , 'utf-8');
			JSE.jseDataIO.setVariable('adxCampaigns/'+goodCredentials.uid+'/'+campaign.cid,campaign);

			res.send('{"success":1,"notification":"Campaign has been successfully submitted"}');
		}
	}, function() {
		res.status(401).send('{"fail":1,"notification":"Error advertising.js 19. Invalid Session Variable"}'); return false;
	});
	return false;
});

module.exports = router;