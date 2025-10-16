const fs = require('fs');
const Papa = require('papaparse');

class PasswordValidator {
    constructor() {
        this.passwordDictionary = new Set();
        this.dictionaryLoaded = false;
    }

    async loadDictionary() {
        return new Promise((resolve, reject) => {
            const fileContent = fs.readFileSync('1millionPasswords.csv', 'utf8');
            
            Papa.parse(fileContent, {
                header: true,
                skipEmptyLines: true,
                complete: (results) => {
                    results.data.forEach(row => {
                        const password = row.password?.trim();
                        if (password) {
                            this.passwordDictionary.add(password.toLowerCase());
                        }
                    });
                    this.dictionaryLoaded = true;
                    console.log("Diccionario Listo");
                    resolve();
                },
                error: (error) => {
                    reject(error);
                }
            });
        });
    }

    calculateEntropy(password) {
        let charsetSize = 0;
        
        if (/[a-z]/.test(password)) charsetSize += 26; 
        if (/[A-Z]/.test(password)) charsetSize += 26; 
        if (/[0-9]/.test(password)) charsetSize += 10; 
        if (/[^a-zA-Z0-9]/.test(password)) charsetSize += 32;
        
        // Entropía = longitud * log2(tamaño del conjunto)
        const entropy = password.length * Math.log2(charsetSize);
        return entropy;
    }

    isInDictionary(password) {
        return this.passwordDictionary.has(password.toLowerCase());
    }

    calculateCrackTime(password, inDictionary) {
        if (inDictionary) {
            return {
                seconds: 0.00001,
                readable: "Instantáneo (Esta en el diccionario)"
            };
        }

        const entropy = this.calculateEntropy(password);
        const possibleCombinations = Math.pow(2, entropy);
        const attemptsPerSecond = Math.pow(10, 11);
        
        const secondsToHack = (possibleCombinations / 2) / attemptsPerSecond;
        
        return {
            seconds: secondsToHack,
        };
    }


    categorizeStrength(entropy, inDictionary) {
        if (inDictionary) {
            return {
                category: "Muy Débil",
                score: 0,
                message: "Esta contraseña está en el diccionario"
            };
        }

        if (entropy < 28) {
            return {
                category: "Muy Débil",
                score: 1,
            };
        } else if (entropy < 36) {
            return {
                category: "Débil",
                score: 2,
            };
        } else if (entropy < 60) {
            return {
                category: "Media",
                score: 3,
            };
        } else if (entropy < 80) {
            return {
                category: "Fuerte",
                score: 4,
            };
        } else {
            return {
                category: "Muy Fuerte",
                score: 5,
            };
        }
    }

    validate(password) {
        if (!password || password.length === 0) {
            return {
                error: "La contraseña no puede estar vacía"
            };
        }

        const entropy = this.calculateEntropy(password);
        const inDictionary = this.isInDictionary(password);
        const crackTime = this.calculateCrackTime(password, inDictionary);
        const strength = this.categorizeStrength(entropy, inDictionary);

        return {
            password_length: password.length,
            entropy: Math.round(entropy * 100) / 100,
            in_dictionary: inDictionary,
            strength: strength,
            crack_time: crackTime,
        };
    }


}

module.exports = PasswordValidator;