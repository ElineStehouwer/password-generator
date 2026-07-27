/**
 *  Generates uniform random numbers between 0 and max-1.
 *  
 *  The function avoids modulo bias by using rejection sampling.
 * 
 *  It ensures that passwords are generated within a secure context, 
 *  so not in an iframe or over plain HTTP.
 */
function generateRandomNumber(max: number): number {
    // If window.crypto is undefined we cannot generate a number
    const hasCrypto = typeof window !== 'undefined' 
                && window.crypto !== undefined
                && typeof window.crypto.getRandomValues === 'function';


    const isSecure = typeof window !== 'undefined' && window.isSecureContext === true;
    
    if (!hasCrypto){
        throw new Error("Cryptographically secure random number generation is unavailable.")
    } else if (!isSecure){
        throw new Error("The generator is not executed in a secure context, so it is in either an iframe or being sent over HTTP.")
    }
    const randomNumber = new Uint32Array(1);

    // `bound` is the bound for rejection sampling
    // It is a number that is divisible by `max`, and only 
    // numbers that are lower than `bound` will be accepted as 
    // valid output of the RNG to prevent modulo bias
    const bound = 2 ** 32 - (2 ** 32 % max);

    // The random number is regenerated until it is a number that is 
    // lower than `bound`, which ensures a range divisible by `max`
    do {
        window.crypto.getRandomValues(randomNumber);
    } while (randomNumber[0]! >= bound); 

    return randomNumber[0]! % max;
}

/**
 *  Generates a random character from `characterSet` using the 
 *  `generateRandomNumber()` function.
 */
function generateRandomCharacter(characterSet: string): string {
    const randomIndex = generateRandomNumber(characterSet.length);
    return characterSet.charAt(randomIndex);
}


/**
 *  Randomizes the order of password characters using the Fisher-Yates 
 *  shuffle algorithm.
 * 
 *  This algorithm produces an ubiased permutation, meaning each possible 
 *  ordering of the characters is equally likely when the random number 
 *  generator is uniform. It is widely regarded as the standard algorithm 
 *  for generating random permutations.
 * 
 *  The implementation was based on the specification in The Art of Computer 
 *  Programming, Vol. 2: Seminumerical Algorithms by Donald Knuth.
 */
function shufflePassword(password: string): string {
    const array: string[] = password.split("");

    for (let i = array.length - 1; i >= 1; i--) {
        const j = generateRandomNumber(i + 1);
        [array[i], array[j]] = [array[j]!, array[i]!];
    }

    return array.join("");
}


/**
 *  Generates random passwords based on the given length and character 
 *  sets that it should include.
 * 
 *  It ensures that the final password contains at least one character 
 *  from each character set.
 */
function generatePassword(
    length: number,
    includeLowercase: boolean,
    includeUppercase: boolean,
    includeNumbers: boolean,
    includeSymbols: boolean
): string {
    const minimumRequiredLength = Number(includeLowercase) + Number(includeUppercase) 
                                    + Number(includeNumbers) + Number(includeSymbols)
    
    // Ensure the requested length is sufficient to include at least
    // one character from every selected character set.
    if (length < minimumRequiredLength){
        throw new Error("Password length is too short for the selected character requirements.")
    }
    const lowercaseCharset = "abcdefghijklmnopqrstuvwxyz";
    const uppercaseCharset = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const numbersCharset = "0123456789";
    const symbolsCharset = "!@#$%^&*-_=+?";

    let fullCharset = "";
    let password = "";

    // The following four if-statements are meant to include at least one 
    // character from each character set to ensure that it meets a password policy
    if (includeLowercase) {
        // include at least one lowercase character
        fullCharset += lowercaseCharset;
        password += generateRandomCharacter(lowercaseCharset);
    }

    if (includeUppercase) {
        // include at least one uppercase character
        fullCharset += uppercaseCharset;
        password += generateRandomCharacter(uppercaseCharset);
    }

    if (includeNumbers) {
        // include at least one number
        fullCharset += numbersCharset;
        password += generateRandomCharacter(numbersCharset);
    }

    if (includeSymbols) {
        // include at least one symbol
        fullCharset += symbolsCharset;
        password += generateRandomCharacter(symbolsCharset);
    }

    // The remaining characters are selected from the full character set
    while (password.length < length) {
        password += generateRandomCharacter(fullCharset);
    }

    // To remove any structure from the password, it is shuffled 
    return shufflePassword(password);
}

/**
 *  Helper function to get the relevant settings from the password generator 
 *  and call `generatePassword()` with those settings. 
 */
function handleGenerate(): void {
    const length = parseInt(lengthValue.textContent ?? "20");
    
    const includeLowercase = lowercaseCheck.checked;
    const includeUppercase = uppercaseCheck.checked;
    const includeNumbers = digitsCheck.checked;
    const includeSymbols = symbolsCheck.checked;
    
    passwordField.value = generatePassword(
        length,
        includeLowercase,
        includeUppercase,
        includeNumbers,
        includeSymbols
    );
}

/**
 *  Helper function to get an HTML element by its `id`. 
 */
function getElement<T extends HTMLElement>(id: string): T {
    const element = document.getElementById(id);

    if (!element) {
        throw new Error(`Element '${id}' not found`);
    }
    
    return element as T;
}

// All relevant HTML elements:
const generateBtn = getElement<HTMLInputElement>("generateBtn");

const lengthSlider = getElement<HTMLInputElement>("length");
const passwordField = getElement<HTMLInputElement>("password");
const lengthValue = getElement<HTMLInputElement>("lengthValue");

const lowercaseCheck = getElement<HTMLInputElement>("lowercase"); 
const uppercaseCheck = getElement<HTMLInputElement>("uppercase");
const digitsCheck = getElement<HTMLInputElement>("digits");
const symbolsCheck = getElement<HTMLInputElement>("symbols");

const copyBtn = document.getElementById("copyBtn") as HTMLButtonElement;

// Copy the password when the copy button is clicked:
copyBtn.addEventListener("click", async () => {
    if (!passwordField.value) {
        return;
    }

    try {
        await navigator.clipboard.writeText(passwordField.value);

        const originalText = copyBtn.textContent;
        copyBtn.textContent = "Copied!";

        setTimeout(() => {
            copyBtn.textContent = originalText;
        }, 1500);
    } catch {
        copyBtn.textContent = "Failed";

        setTimeout(() => {
            copyBtn.textContent = "Copy";
        }, 1500);
    }
});

const characterSetCheckboxes: HTMLInputElement[] = [
    lowercaseCheck,
    uppercaseCheck,
    digitsCheck,
    symbolsCheck
];

// Regenerate password when button is clicked
generateBtn.addEventListener('click', handleGenerate);

// Regenerate password when slider is moved
lengthSlider.addEventListener("input", () => {
    lengthValue.textContent = lengthSlider.value;
    // Regenerate the password when the slider changed
    handleGenerate();
});

// Regenerate password when checkbox content is changed
characterSetCheckboxes.forEach((checkbox) => {
    checkbox.addEventListener("change", () => {
        const checkedCount = characterSetCheckboxes.filter(cb => cb.checked).length;

        if (checkedCount === 0) {
            checkbox.checked = true;
            return;
        }

        handleGenerate();
    });
});

// Generate password on page load
handleGenerate();