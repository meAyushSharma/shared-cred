<h1 align=center> CREDENTIAL MANAGER </h1>

===      

#### **Credential Manager** is an application that lets you manager your digital credentials and signatures such as secrets, API keys, passwords in a familiar key-value pairs with sharing feature enabled using Relationship Based Access Control (ReBAC), along with storing images as well.
---        

## Reason for building it?    
1. To manage digital credentials, and have a go-to tool, accessible in least clicks.       
2. To efficiently share credentials and manage them.        
3. To have a single place for all credentials.       
---     
## Why trust Credential Manager?      
1. End-To-End Encryption (E2EE) enabled, meaning only you can access and decrypt the credential value. (though, credential name is not encrypted).      
2. Ability to share individual credential with other users with specific access control:       
    a. Viewer : Can 'view' only.      
    b. Editor : Can 'view' and 'edit' only.      
    c. Author : Can ''view', 'edit' and 'delete' only.     
    > Note : Only you can 'share' the credential with others.     
3. More than just key-value credentials, you can store image credentials (=<1MB) via cloudinary.    
    > Note : Encryption is not applied to image credentials, admin can view them via cloudinary console.      
---    
## Features      
1. Smooth authentication using **Passkey** login, **Single-sign-on** with google, or via username-password.     
2. Download all your credentials in beautiful markdown format.       
3. Reset your password if needed.       
4. Resetting password during login via One-Time-Password with registered email.     
5. Export your crypto keys in a click, and use credential manager on any platform and still have access to your data without compromising security and privacy.      
6. View all the credentials shared with you in well structured manner and perform operation on them.      
---       
## Tech Stack implemented      
**Backend** : Nodejs, Expressjs     
**Frontend** : HTML/CSS/JS      
**Important implementations** :      
    1. Cloudinary : for management of image credentials.      
    2. Nodemailer : for verifying users.    
    3. Permit.io : for decoupling authorization (available in docker image, not in this repository)      
    4. Simplewebauthn : for passkey authentication.        
**Database** : MongoDB      
===      
## Installation       
A. Via Github repo:      
1. Fork this repository.    
2. Clone the forked repository in your machine/computer.      
3. Follow the following steps:       
```sh
    cd to\your\cloned\repo       
    touch .env # this will create .env file          
    #after this, copy the contents from .env.example to newly created .env         
    npm install  # this will install all required dependencies       
    npm start # start the server      
```        
4. Now your server should be up and running at port 3005.     
        
B. Via docker:      

===       
## How does Encryption works here ?        
To provide encryption along with the facility to share with others while maintaining your privacy and security, combination of **Symmetric key distribution** and **Proxy re-encryption** is used.     
Flow of implementation :        
On client-side:        
1. A pair of crypto keys i.e. ```public-key``` and ```private-key``` is generated on signup only, and stored on indexDB of browser (client-side), only ```public-key``` is sent to server which CANNOT be used for decryption.           
2. Whenever a credential is created a ```symmetric-key``` is generated for that particular credential and credential-value is encrypted, now the ```symmetric-key``` is encrypted with ```public-key``` of user.      
3. Now both ```encrypted-symmetric-key``` and ```encrypted-credential-value``` is sent to server for processing and storing.     
> Note : In the entire process ```private-key``` has NEVER been sent to server.     
