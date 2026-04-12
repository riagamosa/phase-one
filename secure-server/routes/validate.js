const form = document.getElementById("profileForm");

const nameInput = document.getElementById("name");
const emailInput = document.getElementById("email");
const bioInput = document.getElementById("bio");

const nameError = document.getElementById("nameError");
const emailError = document.getElementById("emailError");
const bioError = document.getElementById("bioError");

const nameRegex = /^[A-Za-z\s]{3,50}$/;
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const bioRegex = /^[A-Za-z0-9\s]{1,500}$/;

function clearFieldError(input, errorElement) {
    input.classList.remove("input-error");
    input.setCustomValidity("");
    errorElement.textContent = "";
}

function setFieldError(input, errorElement, message) {
    input.classList.add("input-error");
    input.setCustomValidity(message);
    errorElement.textContent = message;
}

function validateName(showPopup = false) {
    const value = nameInput.value.trim();
    clearFieldError(nameInput, nameError);

    if (value.length === 0) {
        setFieldError(nameInput, nameError, "Name is required.");
    } else if (!nameRegex.test(value)) {
        setFieldError(
            nameInput,
            nameError,
            "Name must be 3 to 50 letters only."
        );
    }

    if (showPopup && nameInput.validationMessage) {
        nameInput.reportValidity();
    }

    return !nameInput.validationMessage;
}

function validateEmail(showPopup = false) {
    const value = emailInput.value.trim();
    clearFieldError(emailInput, emailError);

    if (value.length === 0) {
        setFieldError(emailInput, emailError, "Email is required.");
    } else if (!emailRegex.test(value)) {
        setFieldError(
            emailInput,
            emailError,
            "Please enter a valid email address."
        );
    }

    if (showPopup && emailInput.validationMessage) {
        emailInput.reportValidity();
    }

    return !emailInput.validationMessage;
}

function validateBio(showPopup = false) {
    const value = bioInput.value.trim();
    clearFieldError(bioInput, bioError);

    if (value.length === 0) {
        setFieldError(bioInput, bioError, "Bio is required.");
    } else if (value.length > 500) {
        setFieldError(
            bioInput,
            bioError,
            "Bio must be 500 characters or fewer."
        );
    } else if (!bioRegex.test(value)) {
        setFieldError(
            bioInput,
            bioError,
            "Bio must be plain text only with no HTML tags or special characters."
        );
    }

    if (showPopup && bioInput.validationMessage) {
        bioInput.reportValidity();
    }

    return !bioInput.validationMessage;
}

nameInput.addEventListener("input", () => validateName(false));
emailInput.addEventListener("input", () => validateEmail(false));
bioInput.addEventListener("input", () => validateBio(false));

form.addEventListener("submit", function (event) {
    const isNameValid = validateName(true);
    const isEmailValid = validateEmail(true);
    const isBioValid = validateBio(true);

    if (!isNameValid || !isEmailValid || !isBioValid) {
        event.preventDefault();
    }
});