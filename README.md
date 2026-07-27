# Secure Password Generator
This password generator was developed as part of research into the security of online password generators. During the analysis of 27 commonly used web-based generators, several sources of entropy loss and implementation weaknesses were identified.

The goal of this implementation is to demonstrate how a password generator can be designed while avoiding common pitfalls such as biased character selection, character-class imbalances, and unnecessary restrictions on the password space.

## Build 
### Prerequisites
Make sure you have the following installed:

- https://nodejs.org/

### Installation
Clone the repository and install the dependencies:

```bash
git clone https://github.com/ElineStehouwer/password-generator.git
cd password-generator
npm install
```

### Build 
To build the project and generate a JavaScript file, run:
```bash 
    npm run build
```

## License
This project is licensed under the [MIT License](LICENSE).

Copyright (c) 2026 Eline Stehouwer and Radboud University.

## Citation
If you use this software in your research, please cite it using the `CITATION.cff` file or the following: 

Stehouwer, Eline (2026). *Secure Password Generator*. Radboud University. https://doi.org/10.5281/zenodo.21620288
