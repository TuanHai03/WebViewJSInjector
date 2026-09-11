
app.net.networkManagerXHR.verifyDomain=async function(domain) {
			var result = {
				name: domain,
				status: "unknown",
				ping: 0,
				lastCheck: Date.now()
			};
			var xhr = new XMLHttpRequest();
			xhr.open("GET", domain + "/warp.php", true);
			xhr.timeout = 5000;
			result.checkedWith = "xhr";
			xhr.setRequestHeader("x-stv-transport", "web");
			return new Promise((resolve, reject) => {
				xhr.onload = function() {
					if (xhr.status >= 200 && xhr.status < 300) {
						result.status = "alive";
						result.ping = Date.now() - result.lastCheck;
					} else {
						result.status = "dead";
						result.ping = -1;
					}
					resolve(result);
				};
				xhr.onerror = function() {	
					result.status = "dead";
					result.ping = -1;
					resolve(result);
				};
				xhr.ontimeout = function() {
					result.status = "timeout";
					result.ping = -1;
					resolve(result);
				};  xhr.onabort = function() {	
					result.status = "dead";
					result.ping = -1;
					resolve(result);
				};
				xhr.send();
			});
		}
