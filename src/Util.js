

function getClockTime() {
    return new Date().getTime()/1000.0;
}

// http://stackoverflow.com/questions/901115/how-can-i-get-query-string-values-in-javascript
function getParameterByName(name, url) {
    if (!url) url = window.location.href;
    name = name.replace(/[\[\]]/g, "\\$&");
    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, " "));
}

function getJSON(url, handler)
{
    console.log("Util.getJSON: "+url);
    $.ajax({
        url: url,
	dataType: 'text',
	success: function(str) {
            var data;
            try {
	        data = JSON.parse(str);
            }
            catch (err) {
                console.log("err: "+err);
                alert("Error in json for: "+url+"\n"+err);
                return;
            }
	    handler(data);
	}
    });
}

function toJSON(obj)
{
    return JSON.stringify(obj, null, 3);
}

export {getJSON};
