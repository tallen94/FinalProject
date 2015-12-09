var Parse = require('parse-cloud-express').Parse;
var oauthSignature = require('oauth-signature');  
var n = require('nonce')();    
var qs = require('querystring');  
var _ = require('lodash');

var consumer_key = 'e_fehnO31eFSjrA8Nuyg2A';
var consumer_secret = 'OQlkF893Gn1HkNFXw5_jSeRtx7Q';
var token = 'Dg2mEbTxNLouwGZU4AHQZJBEZN6iWSeN';
var token_secret = 'QYiiBQiIm0_Tm9IaAgONPQdPPCU';




Parse.Cloud.define('yelpApi', function(request, response) {
    console.log(request);
    var httpMethod = request.params.method;
    var url = 'http://api.yelp.com/v2/' + request.params.url;
    var params = request.params.params;

    var sign_params = {
        oauth_consumer_key : consumer_key,
        oauth_token : token,
        oauth_nonce : n(),
        oauth_timestamp : n().toString().substr(0,10),
        oauth_signature_method : 'HMAC-SHA1',
    }

    var parameters = _.assign(params, sign_params);

    var signature = oauthSignature.generate(httpMethod, url, parameters, consumer_secret, token_secret, { encodedSignature: false });

    parameters.oauth_signature = signature;
    var paramURL = qs.stringify(parameters);
    var apiURL = url + '?' + paramURL;
    console.log(apiURL);
    Parse.Cloud.httpRequest({
        url: apiURL
    }).then(function(res) {
        response.success(res);
    }, function(err) {
        response.error(err);
    });
});
