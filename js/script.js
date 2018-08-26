document.addEventListener("DOMContentLoaded", () => {

	// Declare const variables
	const $form = document.querySelector("form"),
		  $nameInput = $form.querySelector("#name"),
		  $emailInput = $form.querySelector("#mail")
		  $jobTitle = $form.querySelector("select#title"),
		  $otherTitle = $form.querySelector("#other-title"),
		  $tshirtDesign = $form.querySelector("#design"),
		  $tshirtColors = $form.querySelector("#color"),
		  $activities = $form.querySelector(".activities"),
		  $activityCheckboxes = $activities.querySelectorAll('input[type="checkbox"]'),
		  $activityLabels = $activities.querySelectorAll('label'),
		  $paymentSelect = $form.querySelector("#payment"),
		  $creditSection = $form.querySelector("#credit-card"),
		  $paypalSection = $form.querySelector("#paypal"),
		  $bitcoinSection = $form.querySelector("#bitcoin"),
		  $ccNumInput = $form.querySelector("#cc-num"),
		  $zipInput = $form.querySelector("#zip"),
		  $cvvInput = $form.querySelector("#cvv");

	// Declare let variables
	let jsPunstshirtColors = [],
	  	iLvjstshirtColors = [],
	  	selectedActivyTimes = [],
	  	selectedCourseCosts = [];

	// Function used to calculate sum
	const sum = (a, b) => a + b;

	// Function used to add a class to an element
	const addClass = (element, className) => {
		if ( !element.classList.contains(className)) {
			element.classList.add(className);
		}
	}

	// pattern found at https://stackoverflow.com/questions/46155/how-to-validate-an-email-address-in-javascript
	const emailRegEx = new RegExp(/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/);
	
	/**
	 * Function used to show an HTML element
	 * @param  {object} target [HTML element to show]
	 * @return {[type]}        [description]
	 */
	function show(target) {
		target.style.display = "";
	}

	/**
	 * Function used to hide an HTML element
	 * @param  {object} target [HTML element to hide]
	 * @return {[type]}        [description]
	 */
	function hide(target) {
		target.style.display = "none";
	}

	/**
	 * This function is used to populate an array of t-shirt options for each design
	 */
	(function parseOptions() {
		const $options = $tshirtColors.querySelectorAll("option");

		$options.forEach(function(v) {
			let attr = v.getAttribute("data-design");
			attr === "js puns" ? jsPunstshirtColors.push(v) : iLvjstshirtColors.push(v);
		})
	})();

	/**
	 * Function used to initialize the dropdown with a placeholder value
	 * @param  {object} e      [event object]
	 * @param  {object} select [Select element to append options to]
	 */
	function initializeDropdown(select) {
		const $select = select,
			  $options = $select.querySelectorAll("option");
			  
		$options.forEach(function(v) {
			hide(v);
		})

		const $placeholder = document.createElement("option");
		$placeholder.textContent = "Please select a t-shirt design";
		$placeholder.value = "placeholder";
		$placeholder.classList.add("placeholder");
		$select.appendChild($placeholder);
		$select.value = "placeholder";
	}

	/**
	 * Function used to set the select options based on the design chosen by the user
	 * @param  {object} e      [event object]
	 * @param  {object} select [Select element to append options to]
	 */
	function buildDropdown(e, select) {
		const val = e.target.value,
			  $select = select,
			  $options = $select.querySelectorAll("option");

		$options.forEach(function(v) {
			let attr = v.getAttribute("data-design");
			if (val === attr) {
				show(v);
			} else {
				hide(v);
			}
		})

		if ( val === 'js puns' ) {
			$select.value = jsPunstshirtColors[0].value;
		} else if (val === 'heart js' ) {
			$select.value = iLvjstshirtColors[0].value;
		} else {
			$select.value = "placeholder";
		}
	}
	
	/**
	 * Function used to flag events that occur during the
	 * same time slot as the activity the user has selected
	 * @param  {object} e [event object]
	 */
	function checkActivitySchedule(e) {
		var $target = e.target,
			$label = e.target.parentNode,
			labelText = $label.textContent,
			labelTime = $label.textContent.split(" — ")[1].split(", ")[0],
			selectedActivyTimes = [];

		// if checkbox is checked turn label bold and push to array of selected activities
		// else reset font weight
		if ( $target.checked ) {
			selectedActivyTimes.push(labelTime)
			$label.style.fontWeight = "bold";
		} else {
			$label.style.fontWeight = "normal";
		}

		// loop through activity labels and search for conflicting times
		// build up an array of selected activities
		// disable and gray out checkboxes/labels for conflicting times
		$activityLabels.forEach(function(v,k) {
			let labelSubstring = v.textContent.split(" — ")[1].split(", ")[0];
			if ( v.firstElementChild.checked ) {
				if ( !selectedActivyTimes.includes(labelSubstring)) {
					selectedActivyTimes.push(labelSubstring)
				}
			}
		})

		// After selectedActivityTimes array is built up,
		// check to see if any activities occur during the same time slot
		$activityLabels.forEach(function(v,k) {
			let labelSubstring = v.textContent.split(" — ")[1].split(", ")[0];
			if ( v.textContent !== labelText && selectedActivyTimes.includes(labelSubstring) && !v.firstElementChild.checked) {
				v.style.color = "#777";
				v.firstElementChild.disabled = true;
			} else {
				v.style.color = "#000";
				v.firstElementChild.disabled = false;
			}
		})

		// Display the total cost of the selected activities if cost is greater than 0
		const $totalCost = document.querySelector("#total-cost");
		let cost = calculateTotalCost();
		if (cost > 0) {
			$totalCost.textContent = 'Total Cost: $' + calculateTotalCost();
			$totalCost.style.color = "#184f68";
		} else {
			$totalCost.textContent = "";
		}
	}

	/**
	 * Function used to calculate the total cost of selected activities
	 * @return {number} [sum of activity costs]
	 */
	function calculateTotalCost() {
		selectedCourseCosts = [];
		$activityCheckboxes.forEach(function(v,k) {
			let cost =  v.parentNode.textContent.split("$")[1];
			if ( v.checked ) {
				selectedCourseCosts.push(parseFloat(cost));
			}
		})
		if (selectedCourseCosts.length === 0) {
			return 0;
		} else {
			return selectedCourseCosts.reduce(sum);
		}
	}

	/**
	 * Function used to display appropriate payment info based on the user's selection
	 * @param  {object} e [event object]
	 */
	function displayPaymentInfo(e) {
		const val = e.target.value;			

		if ( val === "paypal") {
			show($paypalSection)
			hide($creditSection);
			hide($bitcoinSection);
		} else if ( val === "bitcoin") {
			hide($paypalSection);
			hide($creditSection);
			show($bitcoinSection);
		} else {
			hide($paypalSection);
			show($creditSection);
			hide($bitcoinSection);
		}
	}

	/**
	 * Function used to determine if form element values are valid
	 * @param  {object} target [HTML element that is being validated]
	 * @return {boolen} [boolean indicating whether an error was encountered]
	 */
	function checkValid(target) {
		const id = target.id,
			  classes = target.classList;
		
		// boolean indicating whether an error was encountered
		let error = false;

		// name validation
		if ( id === 'name' ) {
			if ( target.value === "") {
				displayFormError(target, false, "Please specificy a name.");
				error = true;
			} else {
				displayFormError(target, true);
			}
		} else if ( id === "mail" ) {
			if ( !emailRegEx.test(target.value) || target.value === "" ) {
				displayFormError(target, false, "Please specificy a valid email address.");
				error = true;
			} else {
				displayFormError(target, true);
			}
		} else if (classes.contains("activities")) {
			const checkboxesArray = [];
			// Activities Validation
			$activityCheckboxes.forEach(function(v,k) {
				if ( v.checked ) { checkboxesArray.push(v); }
			})
			if  ( checkboxesArray.length === 0 ) {
				displayFormError($activities, false, "Please register for at least one activity.");
				error = true;
			} else {
				displayFormError($activities, true);
			}
		} else if ( id === "cc-num" ) {
			// Credit Card Validation
			if ($paymentSelect.value === "credit card") {
				if (target.value === "" ) {
					displayFormError(target, false, "Please enter a credit card number");
					error = true;
				} else if (target.value.length > 16 || target.value.length < 13) {
					displayFormError(target, false, "Please specificy a valid credit card number between 13 and 16 digits");
					error = true;
				} else {
					displayFormError(target, true);
				}
			}
		} else if ( id === "zip" ) {
			if ($paymentSelect.value === "credit card") {
				if (target.value === "" || target.value.length !== 5 ) {
					displayFormError(target, false, "Please specificy a 5 digit valid zip code");
					error = true;
				} else {
					displayFormError(target, true);
				}
			}
		} else if ( id === "cvv" ) {
			if ($paymentSelect.value === "credit card") {
				if (target.value === "" || target.value.length !== 3 ) {
					displayFormError(target, false, "Please specificy a valid 3 digit CVV");
					error = true;
				} else {
					displayFormError(target, true);
				}
			}				
		}
		return error;
	}

	/**
	 * Function used to validate form content
	 * Only returns value when form is being submitted
	 * @return {array} [returns an array of booleans indicating whether an error was encountered]
	 */
	function validateForm(type, target, message) {
		if ( type === "submit" ) {
			var errors = [];
			errors.push(checkValid($nameInput));
			errors.push(checkValid($emailInput));
			errors.push(checkValid($activities));
			errors.push(checkValid($ccNumInput));
			errors.push(checkValid($zipInput));
			errors.push(checkValid($cvvInput));
			return errors;			
		} else if ( type === "blur" ) {
			checkValid(target);
		} else if ( type === "keyup" ) {
			checkValid(target);
		}
	}

	/**
	 * Function used to remove error message
	 * @param  {object} target [HTML element to remove error message from]
	 */
	function removeErrorMessage(target) {
		const tagName = target.tagName.toLowerCase();
		let errorSpan;

		if ( tagName === "fieldset" ) {
			errorSpan = target.firstElementChild;
		} else {
			errorSpan = target.previousElementSibling;
		}

		if ( errorSpan.classList.contains('error-message') ) {
			errorSpan.remove();
		}
	}

	/**
	 * Function used to display and remove form errors
	 * @param  {object} target  [The HTML element to display/remove the message for]
	 * @param  {boolean} valid   [boolean indicating form state]
	 * @param  {string} message [Error message to display]
	 */
	function displayFormError(target, valid, message) {
		const tagName = target.tagName.toLowerCase();
		if ( !valid && tagName === "input") {
			target.style.border = "2px solid #df6161";
			target.style.backgroundColor = "#ffdada";
		} else if ( !valid && tagName === "fieldset") {
			target.style.color = "#af2020";
		} else if (tagName === "input") {
			target.style.border = "2px solid #c1deeb";
			target.style.backgroundColor = "#c1deeb";
		} else if (tagName === "fieldset") {
			target.style.color = "#184f68";
		}

		if ( !valid ) {
			removeErrorMessage(target);
			const error = document.createElement("span");
			error.textContent = message;
			addClass(error, 'error-message');
			target.insertAdjacentElement('beforeBegin', error)
			if (tagName === "fieldset") {
				target.insertAdjacentElement('afterBegin', error);
			} else {
				target.insertAdjacentElement('beforeBegin', error)
			}
		} else {
			removeErrorMessage(target);
		}
	}

	// hide other job title on page load
	hide($otherTitle);

	// Add a placeholder to t shirt color options until a design is selected
	initializeDropdown($tshirtColors);

	// Hide t shirt colors dropdown and label until a design is selected
	hide($tshirtColors);
	hide($tshirtColors.previousElementSibling);

	// set default value and display for payment section
	$paymentSelect.value = "credit card";
	hide($paypalSection);
	hide($bitcoinSection);

	// define behavior for when the user changes their job title
	// if user selects other, display text input that lets
	// them define other job title
	$jobTitle.addEventListener("change", (e) => {
		const val = e.target.value;
		val === "other" ? $otherTitle.style.display = "" : $otherTitle.style.display = "none";
	})

	/**
	 * Function used to bind javascript events
	 * @param  {object} target [HTML element to bind even to]
	 * @param  {string} type   [even type]
	 */
	function bindEvent(target, type) {
		target.addEventListener(type, (e) => {
			validateForm(e.type, e.target);
		})
	}

	// Bind Events
	bindEvent($nameInput, 'blur');
	bindEvent($emailInput, 'blur');
	bindEvent($ccNumInput, 'blur');
	bindEvent($zipInput, 'blur');
	bindEvent($cvvInput, 'blur');
	bindEvent($nameInput, 'keyup');
	bindEvent($emailInput, 'keyup');
	bindEvent($ccNumInput, 'keyup');
	bindEvent($zipInput, 'keyup');
	bindEvent($cvvInput, 'keyup');

	$tshirtDesign.addEventListener("change", (e) => {
		show($tshirtColors);
		show($tshirtColors.previousElementSibling);
		buildDropdown(e, $tshirtColors);
	})

	$activities.addEventListener("change", (e) => {
		checkActivitySchedule(e);
	})

	$paymentSelect.addEventListener("change", (e) => {
		displayPaymentInfo(e);
	})

	$form.addEventListener("submit", (e) => {
		var errors = validateForm(e.type);
		if ( errors.includes(true) ) {
			e.preventDefault();
		}
	})


});