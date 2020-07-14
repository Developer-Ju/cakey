const cake = document.getElementById("cake");
const tooltip = document.getElementById("tooltip");
const input_container = document.getElementById("input-container");
const values_container = document.getElementById("values-container");
const input_prefix = document.getElementById("prefixInput");
const input_suffix = document.getElementById("suffixInput");

var values = [];
const colors_default = ["#8AC926", "#1982C4", "#6A4C93", "#FF595E", "#FFCA3A"];
var colors = [];
var currentColor = 0;

window.addEventListener("load", function() {
	addValue(true);
	addValue(true);

	const paramString = window.location.search;
	const params = new URLSearchParams(paramString);
	if (params.get("embed") == "true") {
		document.body.classList.add("embed");
	}
});

function generate() {
	// Get values
	getValues();
	
	// Clear cake
	cake.innerHTML = "";
	
	// Get total sum of all values
	var valueSum = 0;
	for (var i = 0; i < values.length; i++) {
		valueSum += values[i];
	}
	
	// Create slices
	var degrees_current = 0;
	for (var i = 0; i < values.length; i++) {
		var radius = 500;
		
		var angle_start = degrees_current;
		var x = radius * Math.sin(degrees_current) + 500;
		var y = radius * Math.cos(degrees_current) + 500;
		
		degrees_current += (values[i] / valueSum) * 2*Math.PI;
		
		var angle_end = degrees_current;
		var dx = 500 * Math.sin(degrees_current) + 500;
		var dy = 500 * Math.cos(degrees_current) + 500;

		var largeArc = angle_end - angle_start <= Math.PI ? "0" : "1";
		
		var path = [
			"M", x, y, // Move to start
			"A", radius, radius, 0, largeArc, 0, dx, dy, // Arc to end
			"L", 500, 500, // Line to center
			"Z" // Close path
		].join(" "); // Pizza (slice) time!
		
		cake.innerHTML += "<path index=\"" + i + "\" class=\"slice\" onmousemove=\"onSliceMouseMove(event)\" onmouseleave=\"onSliceMouseLeave()\" d=\"" + path + "\" fill=\"" + colors[i] + "\"/>";
	}
}

function addValue(undeletable = false) {
	
	var valueElements = values_container.getElementsByClassName("valueInput");
	var lastValue = valueElements[valueElements.length-1];
	currentColor = (lastValue == undefined) ? 0 : colors_default.indexOf(lastValue.getAttribute("color")) + 1;
	while (currentColor >= colors_default.length) currentColor -= colors_default.length;

	var color = colors_default[currentColor];
	
	var input_new = document.createElement("input");
	input_new.classList.add("input");
	input_new.classList.add("valueInput");
	input_new.setAttribute("color", color);
	input_new.setAttribute("undeletable", undeletable);
	input_new.style.borderColor = color;
	input_new.value = 1;
	input_new.min = 1;
	input_new.placeholder = undeletable ? "1" : "Delete value";
	input_new.type = "text";
	input_new.addEventListener("change", onValueChange);
	input_new.addEventListener("contextmenu", deleteValue);
	
	values_container.appendChild(input_new);

	if (!undeletable) {
		input_new.focus();
		input_new.select();
	}
	
	input_container.scrollTop = input_container.scrollHeight - input_container.clientHeight;
	
	generate();
}

function getValues() {
	var valueElements = values_container.getElementsByClassName("valueInput");
	
	values = [];
	colors = [];
	for (var i = 0; i < valueElements.length; i++) {
		var val = parseFloat(valueElements[i].value);
		
		// Clean value
		if (val <= 0 || isNaN(val)) val = 1;
		
		valueElements[i].value = val;
		
		values[i] = val;
		colors[i] = valueElements[i].getAttribute("color");
	}
}

function onSliceMouseMove(event) {
	var tooltipString = values[event.currentTarget.getAttribute("index")];

	var prefix = input_prefix.value;
	var suffix = input_suffix.value;

	tooltipString = (!isEmpty(prefix)) ? prefix + tooltipString : tooltipString; // Add prefix if not empty
	tooltipString = (!isEmpty(suffix)) ? tooltipString + suffix : tooltipString; // Add suffix if not empty

	tooltip.innerHTML = tooltipString;
	tooltip.style.left = (event.clientX + 25) + "px";
	tooltip.style.top = (event.clientY + 25) + "px";
	tooltip.classList.add("visible");
}
function onSliceMouseLeave() {
	tooltip.classList.remove("visible");
}

function onValueChange(event) {
	deleteValue(event);
	generate();
}
function deleteValue(event) {
	event.preventDefault();
	if ((isEmpty(event.currentTarget.value) || event.type == "contextmenu") && event.currentTarget.getAttribute("undeletable") != "true") {
		event.currentTarget.remove();
		generate();
	}
}

document.addEventListener("mousedown", function(event) {
	if (event.button == 2) {
		document.body.classList.add("deleting");
	}
});
document.addEventListener("mouseup", function(event) {
	if (event.button == 2) {
		document.body.classList.remove("deleting");
	}
});

function isEmpty(str) {
	return str.replace(/g /, "") == "";
}